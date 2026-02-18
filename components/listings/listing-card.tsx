import Image from "next/image"
import {
  ExternalLink,
  MapPin,
  BedDouble,
  Car,
  WashingMachine,
} from "lucide-react"

interface ListingCardProps {
  name: string
  price: number
  image: string
  contracts: number
  amenities: string[]
  distance: string
  fbUrl: string
}

function getAmenityIcon(amenity: string) {
  const lower = amenity.toLowerCase()
  if (lower.includes("parking")) return Car
  if (lower.includes("laundry")) return WashingMachine
  if (lower.includes("room")) return BedDouble
  return null
}

export function ListingCard({
  name,
  price,
  image,
  contracts,
  amenities,
  distance,
  fbUrl,
}: ListingCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-accent/40 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={`${name} housing listing`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded-lg bg-foreground/80 px-3 py-1 text-sm font-bold text-background backdrop-blur-sm">
          ${price}/mo
        </div>
        <div className="absolute right-3 top-3 rounded-lg bg-accent/90 px-2.5 py-1 text-xs font-medium text-accent-foreground backdrop-blur-sm">
          {distance} from campus
        </div>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              {name}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {contracts} {contracts === 1 ? "contract" : "contracts"}{" "}
              available
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {amenities.map((amenity) => {
            const Icon = getAmenityIcon(amenity)
            return (
              <span
                key={amenity}
                className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                {Icon && <Icon className="h-3 w-3" />}
                {amenity}
              </span>
            )
          })}
        </div>

        <a
          href={fbUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#1877F2] py-3 text-sm font-medium text-[#ffffff] transition-colors hover:bg-[#166FE5]"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          View on Facebook Marketplace
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}
