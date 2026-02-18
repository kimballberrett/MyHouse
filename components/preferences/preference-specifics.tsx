"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  DollarSign,
  MapPin,
  Bell,
  Users,
  Heart,
  User,
} from "lucide-react"
import Link from "next/link"

interface PreferenceSpecificsProps {
  onBack: () => void
}

export function PreferenceSpecifics({ onBack }: PreferenceSpecificsProps) {
  const [housingType, setHousingType] = useState<"single" | "married">(
    "single"
  )
  const [priceRange, setPriceRange] = useState([300, 800])
  const [distanceFromCampus, setDistanceFromCampus] = useState([2])
  const [notificationFrequency, setNotificationFrequency] =
    useState("daily")

  const maxPrice = housingType === "married" ? 2000 : 1000

  function handleHousingTypeChange(type: "single" | "married") {
    setHousingType(type)
    if (type === "married") {
      setPriceRange([500, 1500])
    } else {
      setPriceRange([300, 800])
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Your Preferences
        </h1>
        <p className="mt-2 text-muted-foreground">
          Fine-tune your housing search criteria.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
        {/* Housing Type Toggle - Married vs Single */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Housing Type
              </h3>
              <p className="text-sm text-muted-foreground">
                This adjusts pricing and listing types
              </p>
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
              <User
                className={`h-6 w-6 ${
                  housingType === "single"
                    ? "text-accent"
                    : "text-muted-foreground"
                }`}
              />
              <span className="text-sm font-medium">Single</span>
              <span className="text-xs text-muted-foreground">
                Individual rooms & shared
              </span>
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
              <Heart
                className={`h-6 w-6 ${
                  housingType === "married"
                    ? "text-accent"
                    : "text-muted-foreground"
                }`}
              />
              <span className="text-sm font-medium">Married</span>
              <span className="text-xs text-muted-foreground">
                Private apartments & homes
              </span>
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
              <h3 className="font-display font-semibold text-foreground">
                Monthly Price Range
              </h3>
              <p className="text-sm text-muted-foreground">
                {housingType === "married"
                  ? "Adjusted for couples housing"
                  : "Per person pricing"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm font-medium text-foreground">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>

          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={maxPrice}
            step={50}
            className="mt-3"
          />

          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>$0</span>
            <span>${maxPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Distance from Campus */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <MapPin className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Distance from Campus
              </h3>
              <p className="text-sm text-muted-foreground">
                Maximum radius from your campus
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

        {/* Notification Frequency */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Bell className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Notification Frequency
              </h3>
              <p className="text-sm text-muted-foreground">
                How often would you like to be notified?
              </p>
            </div>
          </div>

          <RadioGroup
            value={notificationFrequency}
            onValueChange={setNotificationFrequency}
            className="flex flex-col gap-3"
          >
            <label
              htmlFor="every-new"
              className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                notificationFrequency === "every-new"
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <RadioGroupItem value="every-new" id="every-new" />
              <div>
                <p className="font-medium text-foreground">
                  Every New Listing
                </p>
                <p className="text-sm text-muted-foreground">
                  Get notified instantly when a match is found
                </p>
              </div>
            </label>

            <label
              htmlFor="daily"
              className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                notificationFrequency === "daily"
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <RadioGroupItem value="daily" id="daily" />
              <div>
                <p className="font-medium text-foreground">Daily Updates</p>
                <p className="text-sm text-muted-foreground">
                  Receive a daily summary of new listings
                </p>
              </div>
            </label>

            <label
              htmlFor="weekly"
              className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                notificationFrequency === "weekly"
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <RadioGroupItem value="weekly" id="weekly" />
              <div>
                <p className="font-medium text-foreground">
                  Weekly Updates
                </p>
                <p className="text-sm text-muted-foreground">
                  Get a weekly roundup every Monday morning
                </p>
              </div>
            </label>
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
          <Link
            href="/listings"
            className="flex flex-1 items-center justify-center rounded-xl bg-accent py-3.5 text-center font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Save & View Listings
          </Link>
        </div>
      </div>
    </div>
  )
}
