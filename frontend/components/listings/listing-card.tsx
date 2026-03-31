import Image from "next/image"
import { ExternalLink, MapPin, BedDouble, Bath } from "lucide-react"

interface ListingCardProps {
  title: string
  price: number
  beds: number | null
  baths: number | null
  city: string | null
  distance: string
  listingUrl: string | null
  imageUrl?: string | null
  matchScore?: number | null
  summaryHighlights?: string[]
}

export function ListingCard({
  title,
  price,
  beds,
  baths,
  city,
  distance,
  listingUrl,
  imageUrl,
  matchScore,
  summaryHighlights = [],
}: ListingCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-accent/40 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${title} housing listing`}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        <div className="absolute left-3 top-3 rounded-lg bg-foreground/80 px-3 py-1 text-sm font-bold text-background backdrop-blur-sm">
          ${price.toLocaleString()}/mo
        </div>
        {distance !== "N/A" && (
          <div className="absolute right-3 top-3 rounded-lg bg-accent/90 px-2.5 py-1 text-xs font-medium text-accent-foreground backdrop-blur-sm">
            {distance} from campus
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex-1">
          {matchScore != null ? (
            <div className="mb-3 inline-flex rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
              {matchScore.toFixed(1)} match score
            </div>
          ) : null}
          <h3 className="font-display text-lg font-semibold text-foreground line-clamp-2">
            {title}
          </h3>
          {city && (
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              {city}
            </p>
          )}
        </div>

        <div className="flex gap-3 text-sm text-muted-foreground">
          {beds != null && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" />
              {beds} {beds === 1 ? "bed" : "beds"}
            </span>
          )}
          {baths != null && (
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              {baths} {baths === 1 ? "bath" : "baths"}
            </span>
          )}
        </div>

        {summaryHighlights.length > 0 ? (
          <div className="rounded-xl bg-muted/70 p-3 text-sm text-muted-foreground">
            {summaryHighlights.slice(0, 2).map((highlight) => (
              <p key={highlight} className="line-clamp-2">
                {highlight}
              </p>
            ))}
          </div>
        ) : null}

        {listingUrl ? (
          <a
            href={listingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            View Listing
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <div className="mt-1 flex items-center justify-center rounded-xl bg-muted py-3 text-sm text-muted-foreground">
            No link available
          </div>
        )}
      </div>
    </div>
  )
}
