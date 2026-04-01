"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Search, Shield, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection({ userCount, listingCount }: { userCount: number; listingCount: number }) {
  return (
    <section className="relative overflow-hidden">
      {/* Hero image background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-housing.jpg"
          alt="College town aerial view"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-foreground/70" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-4 pb-24 pt-20 text-center md:pb-32 md:pt-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent-foreground backdrop-blur-sm">
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          <span>College Housing Made Simple</span>
        </div>

        <h1 className="font-display max-w-3xl text-balance text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl lg:text-7xl">
          Find Your Perfect College Home
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-primary-foreground/80">
          Tell us your preferences and we will match you with the best housing
          options near campus. Get personalized listings delivered straight to
          you.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="bg-accent px-8 text-accent-foreground hover:bg-accent/90"
          >
            <Link href="/preferences">
              Set Your Preferences
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href="/listings">Browse Listings</Link>
          </Button>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid w-full max-w-2xl grid-cols-3 gap-8">
          {[
            { value: listingCount.toLocaleString(), label: "Active Listings" },
            { value: userCount.toLocaleString(), label: "Happy Students" },
            { value: "2", label: "Campus Partners" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-2xl font-bold text-accent-foreground md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-primary-foreground/60">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
