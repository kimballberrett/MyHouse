import { Search, SlidersHorizontal, Bell, MapPin } from "lucide-react"

const features = [
  {
    icon: SlidersHorizontal,
    title: "Personalized Preferences",
    description:
      "Rank what matters most to you: price, location, rooms, sociability, and amenities. We tailor results to your priorities.",
  },
  {
    icon: MapPin,
    title: "Campus-Based Search",
    description:
      "Set your ideal distance from campus and we will find listings within your radius. No more guessing commute times.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Choose whether you want to receive notifications for new matches. Stay informed on your terms.",
  },
  {
    icon: Search,
    title: "Facebook Marketplace Integration",
    description:
      "Every listing links directly to the original source post so you can contact landlords and get more details instantly.",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <h2 className="font-display text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            How MyHouse Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            Three simple steps to finding your ideal college housing. Set it up
            once and let us do the searching for you.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-accent/50 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
