"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { PreferenceRanking } from "@/components/preferences/preference-ranking"
import { PreferenceSpecifics } from "@/components/preferences/preference-specifics"
import { getPreferences } from "@/lib/api"

const DEFAULT_FEATURE_ORDER = ["price", "location", "bedrooms", "bathrooms", "amenities"]

async function fetchPreferences() {
  return getPreferences()
}

export default function PreferencesPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [featureOrder, setFeatureOrder] = useState<string[]>(DEFAULT_FEATURE_ORDER)

  const { data: savedPrefs } = useQuery({
    queryKey: ["preferences"],
    queryFn: fetchPreferences,
  })

  // Reorder features to match saved ranks when preferences load
  useEffect(() => {
    if (!savedPrefs) return
    const rankMap: Record<string, number | undefined> = {
      price:       savedPrefs.price_rank,
      location:    savedPrefs.location_rank,
      bedrooms:    savedPrefs.rooms_rank,
      bathrooms:   savedPrefs.sociability_rank,
      amenities:   savedPrefs.amenities_rank,
    }
    if (Object.values(rankMap).every((v) => v != null)) {
      const sorted = [...DEFAULT_FEATURE_ORDER].sort(
        (a, b) => (rankMap[a] as number) - (rankMap[b] as number)
      )
      setFeatureOrder(sorted)
    }
  }, [savedPrefs])

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 md:py-8">
      {/* Step indicator */}
      <div className="mx-auto mb-5 flex max-w-xs items-center gap-3 md:mb-4">
        <div className="flex flex-1 flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            aria-label="Go to rank priorities step"
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              step >= 1
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            1
          </button>
          <span className="text-xs font-medium text-muted-foreground">Rank</span>
        </div>

        <div
          className={`h-0.5 flex-1 rounded-full transition-colors ${
            step >= 2 ? "bg-accent" : "bg-border"
          }`}
        />

        <div className="flex flex-1 flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setStep(2)}
            aria-label="Go to details step"
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
              step >= 2
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            2
          </button>
          <span className="text-xs font-medium text-muted-foreground">Details</span>
        </div>
      </div>

      {step === 1 ? (
        <PreferenceRanking
          featureOrder={featureOrder}
          setFeatureOrder={setFeatureOrder}
          onNext={() => setStep(2)}
        />
      ) : (
        <PreferenceSpecifics
          featureOrder={featureOrder}
          savedPrefs={savedPrefs}
          onBack={() => setStep(1)}
        />
      )}
    </main>
  )
}
