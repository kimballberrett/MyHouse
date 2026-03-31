"use client"

export const dynamic = 'force-dynamic'

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { ArrowLeft, SlidersHorizontal } from "lucide-react"
import { getPreferences, updatePreferences } from "@/lib/api"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

const DEFAULT_RANKS = {
  price_rank: 1,
  location_rank: 2,
  rooms_rank: 3,
  sociability_rank: 4,
  amenities_rank: 5,
}

const QUICK_NOTIFICATION_OPTIONS = [
  { value: "every-new", label: "Every New" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
] as const

export default function QuickPreferencesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [sessionReady, setSessionReady] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const [minRent, setMinRent] = useState(0)
  const [maxRent, setMaxRent] = useState(800)
  const [distance, setDistance] = useState(2)
  const [minBedrooms, setMinBedrooms] = useState(1)
  const [minBathrooms, setMinBathrooms] = useState(1)
  const [notificationFrequency, setNotificationFrequency] = useState("daily")
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function checkSupabaseSession() {
      const { data, error } = await supabase.auth.getSession()
      if (!mounted) return

      if (error || !data.session?.user) {
        router.replace("/login?next=/preferences/quick")
        return
      }

      setSessionReady(true)
    }

    checkSupabaseSession()
    return () => {
      mounted = false
    }
  }, [router])

  const preferencesQuery = useQuery({
    queryKey: ["preferences"],
    queryFn: getPreferences,
    enabled: sessionReady,
  })

  useEffect(() => {
    if (!sessionReady || preferencesQuery.isLoading || initialized) return

    if (!preferencesQuery.data) {
      // Quick editor is only for users who already completed saved preferences once.
      router.replace("/preferences")
      return
    }

    const prefs = preferencesQuery.data
    setMinRent(prefs.min_price ?? 0)
    setMaxRent(prefs.max_price ?? 800)
    setDistance(Number(prefs.max_distance_miles ?? 2))
    setMinBedrooms(prefs.min_bedrooms ?? 1)
    setMinBathrooms(prefs.min_bathrooms ?? 1)
    setNotificationFrequency(prefs.notification_frequency ?? "daily")
    setInitialized(true)
  }, [
    sessionReady,
    preferencesQuery.data,
    preferencesQuery.isLoading,
    initialized,
    router,
  ])

  const sliderValue = useMemo(() => [minRent, maxRent], [minRent, maxRent])

  const saveMutation = useMutation({
    mutationFn: async () => {
      const existing = preferencesQuery.data
      if (!existing) {
        throw new Error("No existing preferences found.")
      }

      return updatePreferences({
        min_price: minRent,
        max_price: maxRent,
        max_distance_miles: distance,
        min_bedrooms: minBedrooms,
        min_bathrooms: minBathrooms,
        desired_amenities: existing.desired_amenities ?? [],
        price_rank: existing.price_rank ?? DEFAULT_RANKS.price_rank,
        location_rank: existing.location_rank ?? DEFAULT_RANKS.location_rank,
        rooms_rank: existing.rooms_rank ?? DEFAULT_RANKS.rooms_rank,
        sociability_rank: existing.sociability_rank ?? DEFAULT_RANKS.sociability_rank,
        amenities_rank: existing.amenities_rank ?? DEFAULT_RANKS.amenities_rank,
        notification_frequency: notificationFrequency,
      })
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["preferences"], updated)
      router.push("/listings")
    },
    onError: (error: Error) => {
      setFormError(error.message ?? "Could not save preferences.")
    },
  })

  if (!sessionReady || preferencesQuery.isLoading || !initialized) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6 md:py-8">
        <p className="text-center text-sm text-muted-foreground">
          Loading quick preferences...
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 md:py-8">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-lg font-bold tracking-tight text-foreground md:text-xl">
            Quick Edit Preferences
          </h1>
          <p className="text-xs text-muted-foreground">
            Fast updates for your daily summary settings.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/preferences">
            <SlidersHorizontal className="h-4 w-4" />
            Full Editor
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daily Summary Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="quick-min-rent">Min rent</Label>
              <Input
                id="quick-min-rent"
                type="number"
                min={0}
                max={3000}
                step={50}
                value={minRent}
                onChange={(event) => setMinRent(Number(event.target.value) || 0)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quick-max-rent">Max rent</Label>
              <Input
                id="quick-max-rent"
                type="number"
                min={0}
                max={3000}
                step={50}
                value={maxRent}
                onChange={(event) => setMaxRent(Number(event.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>$3,000</span>
            </div>
            <Slider
              value={sliderValue}
              onValueChange={(values) => {
                if (values.length !== 2) return
                const nextMin = Math.min(values[0], values[1])
                const nextMax = Math.max(values[0], values[1])
                setMinRent(nextMin)
                setMaxRent(nextMax)
              }}
              min={0}
              max={3000}
              step={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-distance">Max distance from campus ({distance} mi)</Label>
            <Slider
              value={[distance]}
              onValueChange={(values) => {
                if (values.length === 0) return
                setDistance(values[0])
              }}
              min={0.5}
              max={10}
              step={0.5}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="quick-min-bedrooms">Minimum bedrooms</Label>
              <Input
                id="quick-min-bedrooms"
                type="number"
                min={1}
                max={10}
                step={1}
                value={minBedrooms}
                onChange={(event) => setMinBedrooms(Math.max(1, Number(event.target.value) || 1))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quick-min-bathrooms">Minimum bathrooms</Label>
              <Input
                id="quick-min-bathrooms"
                type="number"
                min={1}
                max={10}
                step={1}
                value={minBathrooms}
                onChange={(event) => setMinBathrooms(Math.max(1, Number(event.target.value) || 1))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Daily summary frequency</Label>
            <RadioGroup
              value={notificationFrequency}
              onValueChange={setNotificationFrequency}
              className="grid gap-2 sm:grid-cols-3"
            >
              {QUICK_NOTIFICATION_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`quick-frequency-${option.value}`}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-sm transition-all ${
                    notificationFrequency === option.value
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`quick-frequency-${option.value}`}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {formError ? <p className="text-sm text-destructive">{formError}</p> : null}

          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/listings">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={saveMutation.isPending}
              onClick={() => {
                setFormError(null)
                if (maxRent < minRent) {
                  setFormError("Maximum rent cannot be lower than minimum rent.")
                  return
                }
                saveMutation.mutate()
              }}
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
