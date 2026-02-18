"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { PreferenceRanking } from "@/components/preferences/preference-ranking"
import { PreferenceSpecifics } from "@/components/preferences/preference-specifics"

export default function PreferencesPage() {
  const [step, setStep] = useState<1 | 2>(1)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 md:py-16">
        {/* Step indicator */}
        <div className="mx-auto mb-10 flex max-w-xs items-center gap-3">
          <div className="flex flex-1 flex-col items-center gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                step >= 1
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              1
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Rank
            </span>
          </div>

          <div
            className={`h-0.5 flex-1 rounded-full transition-colors ${
              step >= 2 ? "bg-accent" : "bg-border"
            }`}
          />

          <div className="flex flex-1 flex-col items-center gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                step >= 2
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Details
            </span>
          </div>
        </div>

        {step === 1 ? (
          <PreferenceRanking onNext={() => setStep(2)} />
        ) : (
          <PreferenceSpecifics onBack={() => setStep(1)} />
        )}
      </main>
    </div>
  )
}
