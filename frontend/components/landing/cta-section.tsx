import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="border-t border-border bg-muted py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <h2 className="font-display text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Ready to Find Your Place?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-pretty text-muted-foreground">
          Set up your preferences in under 2 minutes and start receiving
          personalized housing matches today.
        </p>
        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="bg-accent px-8 text-accent-foreground hover:bg-accent/90"
          >
            <Link href="/preferences">
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
