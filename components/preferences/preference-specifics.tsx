"use client"

import { useState, useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DollarSign, MapPin, Bell, Users, Heart, User } from "lucide-react"

const API_BASE = "http://localhost:3001"

interface SavedPrefs {
  min_price?: number
  max_price?: number
  max_distance_miles?: number
  notification_frequency?: string
}

interface PreferenceSpecificsProps {
  featureOrder: string[]
  savedPrefs: SavedPrefs | null | undefined
  onBack: () => void
}

export function PreferenceSpecifics({ featureOrder, savedPrefs, onBack }: PreferenceSpecificsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [housingType, setHousingType] = useState<"single" | "married">("single")
  const [maxRent, setMaxRent] = useState(800)
  const [distanceFromCampus, setDistanceFromCampus] = useState([2])
  const [notificationFrequency, setNotificationFrequency] = useState("daily")

  // Populate fields from saved preferences on load
  useEffect(() => {
    if (!savedPrefs) return
    if (savedPrefs.max_price != null) {
      setMaxRent(savedPrefs.max_price)
    }
    if (savedPrefs.max_distance_miles != null) {
      setDistanceFromCampus([Number(savedPrefs.max_distance_miles)])
    }
    if (savedPrefs.notification_frequency) {
      setNotificationFrequency(savedPrefs.notification_frequency)
    }
  }, [savedPrefs])

  const sliderMax = housingType === "married" ? 2000 : 1000

  function handleHousingTypeChange(type: "single" | "married") {
    setHousingType(type)
    setMaxRent(type === "married" ? 1500 : 800)
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        min_price:           0,
        max_price:           maxRent,
        max_distance_miles:  distanceFromCampus[0],
        price_rank:        featureOrder.indexOf("price") + 1,
        location_rank:     featureOrder.indexOf("location") + 1,
        rooms_rank:        featureOrder.indexOf("rooms") + 1,
        sociability_rank:  featureOrder.indexOf("sociability") + 1,
        amenities_rank:    featureOrder.indexOf("amenities") + 1,
        notification_frequency: notificationFrequency,
      }
      const res = await fetch(`${API_BASE}/api/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to save preferences")
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["preferences"], data)
      router.push("/listings")
    },
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Your Preferences
        </h1>
        <p className="mt-2 text-muted-foreground">Fine-tune your housing search criteria.</p>
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
        {/* Housing Type */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Housing Type</h3>
              <p className="text-sm text-muted-foreground">This adjusts pricing and listing types</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleHousingTypeChange("single")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                housingType === "single"
                  ? "border-accent bg-accent/5 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              <User className={`h-6 w-6 ${housingType === "single" ? "text-accent" : "text-muted-foreground"}`} />
              <span className="text-sm font-medium">Single</span>
              <span className="text-xs text-muted-foreground">Individual rooms & shared</span>
            </button>
            <button
              type="button"
              onClick={() => handleHousingTypeChange("married")}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                housingType === "married"
                  ? "border-accent bg-accent/5 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              <Heart className={`h-6 w-6 ${housingType === "married" ? "text-accent" : "text-muted-foreground"}`} />
              <span className="text-sm font-medium">Married</span>
              <span className="text-xs text-muted-foreground">Private apartments & homes</span>
            </button>
          </div>
        </div>

        {/* Monthly Price Range */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <DollarSign className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Maximum Monthly Rent</h3>
              <p className="text-sm text-muted-foreground">
                {housingType === "married" ? "Adjusted for couples housing" : "Per person pricing"}
              </p>
            </div>
          </div>
          <div className="mb-3 text-center">
            <span className="font-display text-3xl font-bold text-foreground">${maxRent}</span>
            <span className="ml-1 text-muted-foreground">/ month max</span>
          </div>
          <Slider
            value={[maxRent]}
            onValueChange={(val) => setMaxRent(val[0])}
            min={0}
            max={sliderMax}
            step={50}
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>${sliderMax.toLocaleString()}</span>
          </div>
        </div>

        {/* Distance from Campus */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <MapPin className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Distance from Campus</h3>
              <p className="text-sm text-muted-foreground">Maximum radius from your campus</p>
            </div>
          </div>
          <div className="mb-3 text-center">
            <span className="font-display text-3xl font-bold text-foreground">
              {distanceFromCampus[0]}
            </span>
            <span className="ml-1 text-muted-foreground">
              {distanceFromCampus[0] === 1 ? "mile" : "miles"}
            </span>
          </div>
          <Slider
            value={distanceFromCampus}
            onValueChange={setDistanceFromCampus}
            min={0.5}
            max={10}
            step={0.5}
            className="mt-1"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>0.5 mi</span>
            <span>10 mi</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[0.5, 1, 2, 5, 10].map((dist) => (
              <button
                key={dist}
                type="button"
                onClick={() => setDistanceFromCampus([dist])}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  distanceFromCampus[0] === dist
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {dist} {dist === 1 ? "mile" : "miles"}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Frequency */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Bell className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Notification Frequency</h3>
              <p className="text-sm text-muted-foreground">How often would you like to be notified?</p>
            </div>
          </div>
          <RadioGroup
            value={notificationFrequency}
            onValueChange={setNotificationFrequency}
            className="flex flex-col gap-3"
          >
            {[
              { value: "every-new", label: "Every New Listing", desc: "Get notified instantly when a match is found" },
              { value: "daily",     label: "Daily Updates",     desc: "Receive a daily summary of new listings" },
              { value: "weekly",    label: "Weekly Updates",    desc: "Get a weekly roundup every Monday morning" },
            ].map(({ value, label, desc }) => (
              <label
                key={value}
                htmlFor={value}
                className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                  notificationFrequency === value
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <RadioGroupItem value={value} id={value} />
                <div>
                  <p className="font-medium text-foreground">{label}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-xl border border-border bg-card py-3.5 text-center font-medium text-foreground transition-colors hover:bg-muted"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex flex-1 items-center justify-center rounded-xl bg-accent py-3.5 text-center font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {saveMutation.isPending ? "Saving…" : "Save & View Listings"}
          </button>
        </div>

        {saveMutation.isError && (
          <p className="text-center text-sm text-destructive">
            Could not save. Make sure the backend is running on port 3001.
          </p>
        )}
      </div>
    </div>
  )
}
