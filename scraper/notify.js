require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const { Resend } = require("resend");

const CAMPUS_LAT = 40.2518;
const CAMPUS_LNG = -111.6493;

function distanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function matchesPreferences(listing, prefs) {
  if (prefs.min_price != null && listing.price < prefs.min_price) return false;
  if (prefs.max_price != null && listing.price > prefs.max_price) return false;
  if (
    prefs.max_distance_miles != null &&
    listing.latitude != null &&
    listing.longitude != null
  ) {
    const miles = distanceMiles(
      CAMPUS_LAT,
      CAMPUS_LNG,
      listing.latitude,
      listing.longitude
    );
    if (miles > prefs.max_distance_miles) return false;
  }
  return true;
}

async function fetchUsersWithPreferences(supabase) {
  // Emails live in Supabase Auth — requires service role key
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) throw new Error(`Failed to fetch auth users: ${authError.message}`);

  const emailById = Object.fromEntries(
    authData.users.map((u) => [u.id, u.email])
  );

  const { data: prefs, error: prefsError } = await supabase
    .from("user_preferences")
    .select("user_id, min_price, max_price, max_distance_miles");

  if (prefsError) throw new Error(`Failed to fetch preferences: ${prefsError.message}`);
  if (!prefs || !prefs.length) return [];

  return prefs
    .filter((p) => emailById[p.user_id])
    .map((p) => ({
      email: emailById[p.user_id],
      min_price: p.min_price,
      max_price: p.max_price,
      max_distance_miles: p.max_distance_miles,
    }));
}

function formatPrice(price) {
  return price != null ? `$${price.toLocaleString()}/mo` : "Price TBD";
}

function formatBeds(beds) {
  if (beds == null) return "";
  return beds === 1 ? "1 bed" : `${beds} beds`;
}

function formatBaths(baths) {
  if (baths == null) return "";
  return baths === 1 ? "1 bath" : `${baths} baths`;
}

function buildListingCard(listing) {
  const details = [formatBeds(listing.beds), formatBaths(listing.baths), listing.location]
    .filter(Boolean)
    .join(" · ");

  const APP_URL = process.env.APP_URL || "https://myhouse-one.vercel.app";
  const imageHtml = listing.image_url
    ? `<img src="${APP_URL}/api/image-proxy?url=${encodeURIComponent(listing.image_url)}" alt="Listing photo" width="560" style="width:100%;max-width:560px;height:200px;object-fit:cover;border-radius:8px 8px 0 0;display:block;" />`
    : `<div style="width:100%;height:120px;background:#f3f4f6;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;"></div>`;

  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;background:#ffffff;">
    <tr>
      <td style="padding:0;">
        ${imageHtml}
      </td>
    </tr>
    <tr>
      <td style="padding:16px 20px;">
        <p style="margin:0 0 4px 0;font-size:16px;font-weight:600;color:#111827;line-height:1.4;">${listing.title || "Rental Listing"}</p>
        <p style="margin:0 0 8px 0;font-size:20px;font-weight:700;color:#4f46e5;">${formatPrice(listing.price)}</p>
        ${details ? `<p style="margin:0 0 12px 0;font-size:14px;color:#6b7280;">${details}</p>` : ""}
        <a href="${listing.url}" target="_blank" style="display:inline-block;padding:8px 16px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">View Listing →</a>
      </td>
    </tr>
  </table>`;
}

function buildEmailHtml(matches) {
  const count = matches.length;
  const heading =
    count === 1
      ? "1 new listing matches your preferences"
      : `${count} new listings match your preferences`;

  const cards = matches.map(buildListingCard).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <!-- Header -->
          <tr>
            <td style="padding:0 0 24px 0;">
              <p style="margin:0 0 4px 0;font-size:22px;font-weight:700;color:#111827;">MyHouse</p>
              <h1 style="margin:0 0 8px 0;font-size:18px;font-weight:600;color:#111827;">${heading}</h1>
              <p style="margin:0;font-size:14px;color:#6b7280;">Fresh from Craigslist — click any listing to see the full post.</p>
            </td>
          </tr>
          <!-- Listing cards -->
          <tr>
            <td>
              ${cards}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0 0;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">You're receiving this because you have listing preferences saved in MyHouse. Listings are scraped daily from Craigslist Provo.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendNotificationEmails(newListings, overrideEmail) {
  if (!newListings.length) {
    console.log("\nNotifications: no new listings — skipping emails.");
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("\nNotifications: RESEND_API_KEY not set — skipping emails.");
    return;
  }

  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const resend = new Resend(apiKey);

  console.log(`\nNotifications: ${newListings.length} listing(s) — checking users...`);

  let users;
  if (overrideEmail) {
    // Test mode: send to one email with no preference filtering
    users = [{ email: overrideEmail, min_price: null, max_price: null, max_distance_miles: null }];
  } else {
    try {
      users = await fetchUsersWithPreferences(supabase);
    } catch (err) {
      console.error(`Notifications: failed to fetch users — ${err.message}`);
      return;
    }
  }

  console.log(`  Found ${users.length} user(s) with preferences.`);

  let sent = 0;
  for (const user of users) {
    const matches = newListings.filter((l) => matchesPreferences(l, user));
    if (!matches.length) continue;

    try {
      await resend.emails.send({
        from: "MyHouse <onboarding@resend.dev>",
        to: user.email,
        subject:
          matches.length === 1
            ? "1 new listing matching your preferences"
            : `${matches.length} new listings matching your preferences`,
        html: buildEmailHtml(matches),
      });
      console.log(`  Sent to ${user.email} (${matches.length} match(es))`);
      sent++;
    } catch (err) {
      console.error(`  Failed to send to ${user.email}: ${err.message}`);
    }
  }

  console.log(`  Emails sent: ${sent}/${users.length} user(s) notified.`);
}

module.exports = { sendNotificationEmails };
