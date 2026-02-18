"use client"

import { useState } from "react"
import {
  DollarSign,
  MapPin,
  BedDouble,
  Users,
  Wifi,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

const defaultFeatures = [
  { id: "price", label: "Price", icon: DollarSign },
  { id: "location", label: "Location", icon: MapPin },
  { id: "rooms", label: "Rooms", icon: BedDouble },
  { id: "sociability", label: "Sociability", icon: Users },
  { id: "amenities", label: "Amenities", icon: Wifi },
]

interface PreferenceRankingProps {
  onNext: () => void
}

export function PreferenceRanking({ onNext }: PreferenceRankingProps) {
  const [features, setFeatures] = useState(defaultFeatures)

  function moveUp(index: number) {
    if (index === 0) return
    const newFeatures = [...features]
    ;[newFeatures[index - 1], newFeatures[index]] = [
      newFeatures[index],
      newFeatures[index - 1],
    ]
    setFeatures(newFeatures)
  }

  function moveDown(index: number) {
    if (index === features.length - 1) return
    const newFeatures = [...features]
    ;[newFeatures[index], newFeatures[index + 1]] = [
      newFeatures[index + 1],
      newFeatures[index],
    ]
    setFeatures(newFeatures)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Rank Your Priorities
        </h1>
        <p className="mt-2 text-muted-foreground">
          Drag or use arrows to order features by importance. The top item
          matters most.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col gap-3">
        {features.map((feature, index) => (
          <div
            key={feature.id}
            className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-accent/50 hover:shadow-md"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-sm font-bold text-accent">
              {index + 1}
            </div>

            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <feature.icon className="h-5 w-5 text-foreground" />
            </div>

            <span className="flex-1 font-medium text-foreground">
              {feature.label}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                aria-label={`Move ${feature.label} up`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => moveDown(index)}
                disabled={index === features.length - 1}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                aria-label={`Move ${feature.label} down`}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-xl bg-primary py-3.5 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
