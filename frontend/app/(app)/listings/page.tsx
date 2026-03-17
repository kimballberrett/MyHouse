import { ListingCard } from "@/components/listings/listing-card"
import { Calendar, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

const mockListings = [
  {
    name: "CollegeTown Apartments",
    price: 450,
    image: "/images/listing-1.jpg",
    contracts: 4,
    amenities: ["In-unit laundry", "Street parking", "Shared room"],
    distance: "0.3 mi",
    fbUrl: "https://www.facebook.com/marketplace",
  },
  {
    name: "CollegeHouse",
    price: 475,
    image: "/images/listing-2.jpg",
    contracts: 3,
    amenities: ["In-unit laundry", "Parking garage"],
    distance: "0.5 mi",
    fbUrl: "https://www.facebook.com/marketplace",
  },
  {
    name: "DormPlace",
    price: 460,
    image: "/images/listing-3.jpg",
    contracts: 2,
    amenities: ["Parking lot", "In-unit laundry"],
    distance: "0.8 mi",
    fbUrl: "https://www.facebook.com/marketplace",
  },
  {
    name: "DormHouse",
    price: 460,
    image: "/images/listing-4.jpg",
    contracts: 3,
    amenities: ["Street parking", "In-unit laundry", "Shared room"],
    distance: "1.2 mi",
    fbUrl: "https://www.facebook.com/marketplace",
  },
  {
    name: "DormsRUs",
    price: 495,
    image: "/images/listing-5.jpg",
    contracts: 5,
    amenities: ["Shared room", "Parking lot", "In-unit laundry"],
    distance: "1.5 mi",
    fbUrl: "https://www.facebook.com/marketplace",
  },
]

export default function ListingsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:py-16">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            <Calendar className="h-3 w-3" />
            Daily Summary
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {"Here's Your Daily Summary!"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            These are the top listings matching your requirements
          </p>
        </div>
        <Link
          href="/preferences"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Edit Preferences
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {mockListings.map((listing) => (
          <ListingCard key={listing.name} {...listing} />
        ))}
      </div>
    </main>
  )
}
