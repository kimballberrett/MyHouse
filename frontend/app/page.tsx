import { AppHeader } from "@/components/app-header"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { CTASection } from "@/components/landing/cta-section"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
          <p>OurHouse - Find College Housing Here</p>
        </div>
      </footer>
    </div>
  )
}
