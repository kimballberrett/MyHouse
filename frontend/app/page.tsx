export const dynamic = 'force-dynamic'


import { createClient } from "@supabase/supabase-js"
import { AppHeader } from "@/components/app-header"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { CTASection } from "@/components/landing/cta-section"

async function getStats(): Promise<{ users: number; listings: number }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { users: 0, listings: 0 }
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  const [{ count: userCount }, { count: listingCount }] = await Promise.all([
    supabase.from("user_preferences").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }),
  ])
  return { users: userCount ?? 0, listings: listingCount ?? 0 }
}

export default async function HomePage() {
  const { users, listings } = await getStats()

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main id="main-content">
        <HeroSection userCount={users} listingCount={listings} />
        <FeaturesSection />
        <CTASection />
      </main>
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p>MyHouse - Find College Housing Here</p>
        </div>
      </footer>
    </div>
  )
}
