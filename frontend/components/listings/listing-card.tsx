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
}

export function ListingCard({
  title,
  price,
  beds,
  baths,
  city,
  distance,
  listingUrl,
}: ListingCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-accent/40 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src="/placeholder.svg"
          alt={`${title} housing listing`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded-lg bg-foreground/80 px-3 py-1 text-sm font-bold text-background backdrop-blur-sm">
          ${price.toLocaleString()}/mo
        </div>
        <div className="absolute right-3 top-3 rounded-lg bg-accent/90 px-2.5 py-1 text-xs font-medium text-accent-foreground backdrop-blur-sm">
          {distance} from campus
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div>
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
