"use client"

import { useEffect, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  Bath,
  BedDouble,
  Bell,
  Check,
  DollarSign,
  Heart,
  MapPin,
  User,
  Wifi,
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { updatePreferences } from "@/lib/api"
import { KNOWN_AMENITIES } from "@/lib/listings"

interface SavedPrefs {
  min_price?: number
  max_price?: number
  max_distance_miles?: number
  min_bedrooms?: number
  min_bathrooms?: number
  desired_amenities?: string[]
  notification_frequency?: string
}

interface PreferenceSpecificsProps {
  featureOrder: string[]
  savedPrefs: SavedPrefs | null | undefined
  onBack: () => void
}

type HousingType = "single" | "married"

const RENT_DEFAULTS: Record<HousingType, { min: number; max: number }> = {
  single: { min: 450, max: 900 },
  married: { min: 1200, max: 1800 },
}

const RENT_SLIDER_MAX: Record<HousingType, number> = {
  single: 1600,
  married: 2600,
}

const ROOM_OPTIONS = [1, 2, 3, 4]
const BATH_OPTIONS = [1, 2, 3]

export function PreferenceSpecifics({
  featureOrder,
  savedPrefs,
  onBack,
}: PreferenceSpecificsProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [housingType, setHousingType] = useState<HousingType>("single")
  const [minRent, setMinRent] = useState(RENT_DEFAULTS.single.min)
  const [maxRent, setMaxRent] = useState(RENT_DEFAULTS.single.max)
  const [minRentInput, setMinRentInput] = useState(String(RENT_DEFAULTS.single.min))
  const [maxRentInput, setMaxRentInput] = useState(String(RENT_DEFAULTS.single.max))
  const [distanceFromCampus, setDistanceFromCampus] = useState([2])
  const [minBedrooms, setMinBedrooms] = useState(1)
  const [minBathrooms, setMinBathrooms] = useState(1)
  const [desiredAmenities, setDesiredAmenities] = useState<string[]>([])
  const [notificationFrequency, setNotificationFrequency] = useState("daily")
  const [formError, setFormError] = useState<string | null>(null)

  const sliderMax = RENT_SLIDER_MAX[housingType]

  function setRentRange(nextMin: number, nextMax: number, syncInputs = true, limit = sliderMax) {
    const normalizedMin = Math.max(0, Math.min(nextMin, limit))
    const normalizedMax = Math.max(0, Math.min(nextMax, limit))
    const finalMin = Math.min(normalizedMin, normalizedMax)
    const finalMax = Math.max(normalizedMin, normalizedMax)

    setMinRent(finalMin)
    setMaxRent(finalMax)

    if (syncInputs) {
      setMinRentInput(String(finalMin))
      setMaxRentInput(String(finalMax))
    }
  }

  function parseRentInput(value: string): number | null {
    if (value.trim() === "") return null
    const parsed = Number(value)
    if (!Number.isFinite(parsed)) return null
    return Math.round(parsed)
  }

  function toggleAmenity(amenity: string) {
    setDesiredAmenities((current) =>
      current.includes(amenity)
        ? current.filter((item) => item !== amenity)
        : [...current, amenity]
    )
  }

  useEffect(() => {
    if (!savedPrefs) return

    const nextMin = savedPrefs.min_price ?? RENT_DEFAULTS.single.min
    const nextMax = savedPrefs.max_price ?? RENT_DEFAULTS.single.max
    const hasSavedRentPreference =
      savedPrefs.min_price != null || savedPrefs.max_price != null
    const inferredType: HousingType = hasSavedRentPreference
      ? nextMax >= RENT_DEFAULTS.married.min
        ? "married"
        : "single"
      : "single"

    setHousingType(inferredType)
    setRentRange(nextMin, nextMax, true, RENT_SLIDER_MAX[inferredType])
    setMinBedrooms(savedPrefs.min_bedrooms ?? 1)
    setMinBathrooms(savedPrefs.min_bathrooms ?? 1)
    setDesiredAmenities(savedPrefs.desired_amenities ?? [])

    if (savedPrefs.max_distance_miles != null) {
      setDistanceFromCampus([Number(savedPrefs.max_distance_miles)])
    }
    if (savedPrefs.notification_frequency) {
      setNotificationFrequency(savedPrefs.notification_frequency)
    }
  }, [savedPrefs])

  function handleHousingTypeChange(nextType: HousingType) {
    setHousingType(nextType)
    const defaults = RENT_DEFAULTS[nextType]
    setRentRange(defaults.min, defaults.max, true, RENT_SLIDER_MAX[nextType])
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      return updatePreferences({
        min_price: minRent,
        max_price: maxRent,
        max_distance_miles: Number(distanceFromCampus[0]),
        min_bedrooms: minBedrooms,
        min_bathrooms: minBathrooms,
        desired_amenities: desiredAmenities,
        price_rank: featureOrder.indexOf("price") + 1,
        location_rank: featureOrder.indexOf("location") + 1,
        rooms_rank: featureOrder.indexOf("bedrooms") + 1,
        sociability_rank: featureOrder.indexOf("bathrooms") + 1,
        amenities_rank: featureOrder.indexOf("amenities") + 1,
        notification_frequency: notificationFrequency,
      })
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["preferences"], data)
      router.push("/listings")
    },
    onError: (error: Error) => {
      setFormError(error.message ?? "Could not save preferences.")
    },
  })

  function handleSave() {
    setFormError(null)

    if (maxRent < minRent) {
      setFormError("Maximum rent cannot be lower than minimum rent.")
      return
    }

    saveMutation.mutate()
  }

  return (
    <div className="flex flex-col gap-5 md:gap-4">
      <div className="text-center">
        <h1 className="font-display text-lg font-bold tracking-tight text-foreground md:text-xl">
          Your Preferences
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Set the criteria that shape your daily summary score.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Monthly Rent Range</h3>
                <p className="text-sm text-muted-foreground">
                  Set your minimum and maximum monthly budget.
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-lg border border-border bg-background p-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleHousingTypeChange("single")}
                  className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    housingType === "single"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <User className="h-4 w-4" />
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => handleHousingTypeChange("married")}
                  className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    housingType === "married"
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  Married
                </button>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Min rent
                </span>
                <input
                  type="number"
                  min={0}
                  max={sliderMax}
                  step={50}
                  value={minRentInput}
                  onChange={(event) => {
                    const value = event.target.value
                    setMinRentInput(value)
                    const parsed = parseRentInput(value)
                    if (parsed !== null) {
                      setRentRange(parsed, maxRent, false)
                    }
                  }}
                  onBlur={() => {
                    const parsed = parseRentInput(minRentInput)
                    if (parsed === null) {
                      setMinRentInput(String(minRent))
                      return
                    }
                    setRentRange(parsed, maxRent)
                  }}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Max rent
                </span>
                <input
                  type="number"
                  min={0}
                  max={sliderMax}
                  step={50}
                  value={maxRentInput}
                  onChange={(event) => {
                    const value = event.target.value
                    setMaxRentInput(value)
                    const parsed = parseRentInput(value)
                    if (parsed !== null) {
                      setRentRange(minRent, parsed, false)
                    }
                  }}
                  onBlur={() => {
                    const parsed = parseRentInput(maxRentInput)
                    if (parsed === null) {
                      setMaxRentInput(String(maxRent))
                      return
                    }
                    setRentRange(minRent, parsed)
                  }}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>
            </div>

            <Slider
              value={[minRent, maxRent]}
              onValueChange={(values) => {
                if (values.length !== 2) return
                setRentRange(values[0], values[1])
              }}
              min={0}
              max={sliderMax}
              step={50}
            />

            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>${sliderMax.toLocaleString()}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <MapPin className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Distance from Campus</h3>
                <p className="text-sm text-muted-foreground">
                  Set the maximum radius for your summary.
                </p>
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

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <BedDouble className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Property Details</h3>
                <p className="text-sm text-muted-foreground">
                  Pick the minimum space you want in a listing.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Bedrooms
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {ROOM_OPTIONS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMinBedrooms(value)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        minBedrooms === value
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {value}+
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Bathrooms
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {BATH_OPTIONS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMinBathrooms(value)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        minBathrooms === value
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {value}+
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2">
                <BedDouble className="h-4 w-4 text-accent" />
                {minBedrooms}+ bedrooms
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2">
                <Bath className="h-4 w-4 text-accent" />
                {minBathrooms}+ bathrooms
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Wifi className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Preferred Amenities</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the extras you want the scoring model to reward.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {KNOWN_AMENITIES.map((amenity) => {
                const selected = desiredAmenities.includes(amenity)
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
                      selected
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {selected ? <Check className="h-4 w-4" /> : null}
                    {amenity}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <Bell className="h-4.5 w-4.5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Daily Summary Frequency</h3>
              <p className="text-xs text-muted-foreground">
                Choose how often we should refresh your top 10 summary.
              </p>
            </div>
          </div>

          <RadioGroup
            value={notificationFrequency}
            onValueChange={setNotificationFrequency}
            className="flex flex-col gap-2.5"
          >
            {[
              { value: "every-new", label: "Every New Listing" },
              { value: "daily", label: "Daily Updates" },
              { value: "weekly", label: "Weekly Updates" },
            ].map(({ value, label }) => (
              <label
                key={value}
                htmlFor={value}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                  notificationFrequency === value
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <RadioGroupItem value={value} id={value} />
                <p className="text-sm font-medium leading-tight text-foreground">{label}</p>
              </label>
            ))}
          </RadioGroup>
        </div>

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
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex flex-1 items-center justify-center rounded-xl bg-accent py-3.5 text-center font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {saveMutation.isPending ? "Saving..." : "Save & View Listings"}
          </button>
        </div>

        {(saveMutation.isError || formError) && (
          <p className="text-center text-sm text-destructive">
            {formError ?? "Could not save preferences. Please try again."}
          </p>
        )}
      </div>
    </div>
  )
}
