"use client"

import type { ElementType } from "react"
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

type FeatureKey = "price" | "location" | "bedrooms" | "bathrooms" | "amenities"

const featureDefinitions: Record<FeatureKey, { label: string; icon: ElementType }> = {
  price:     { label: "Price", icon: DollarSign },
  location:  { label: "Location", icon: MapPin },
  bedrooms:  { label: "Bedrooms", icon: BedDouble },
  bathrooms: { label: "Bathrooms", icon: Users },
  amenities: { label: "Amenities", icon: Wifi },
}

interface PreferenceRankingProps {
  featureOrder: string[]
  setFeatureOrder: (order: string[]) => void
  onNext: () => void
}

export function PreferenceRanking({ featureOrder, setFeatureOrder, onNext }: PreferenceRankingProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  function moveUp(index: number) {
    if (index === 0) return
    const next = [...featureOrder]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    setFeatureOrder(next)
  }

  function moveDown(index: number) {
    if (index === featureOrder.length - 1) return
    const next = [...featureOrder]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    setFeatureOrder(next)
  }

  function moveItem(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return

    const next = [...featureOrder]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    setFeatureOrder(next)
  }

  return (
    <div className="flex flex-col gap-6 md:gap-5">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Rank Your Priorities
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground md:mt-1">
          Drag to reorder, or use arrows. The top item is most important.
        </p>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col gap-2.5 md:gap-2">
        {featureOrder.map((id, index) => {
          const def = featureDefinitions[id as FeatureKey]
          const Icon = def.icon
          return (
            <div
              key={id}
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragEnd={() => setDraggedIndex(null)}
              onDragOver={(event: any) => {
                event.preventDefault()
              }}
              onDrop={() => {
                if (draggedIndex == null) return
                moveItem(draggedIndex, index)
                setDraggedIndex(null)
              }}
              className={`group flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 shadow-sm transition-all hover:border-accent/50 hover:shadow-md ${
                draggedIndex === index ? "cursor-grabbing opacity-80" : "cursor-grab"
              }`}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/10 text-xs font-bold text-accent">
                {index + 1}
              </div>

              <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
                <Icon className="h-4 w-4 text-foreground" />
              </div>

              <span className="flex-1 text-sm font-medium text-foreground">{def.label}</span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                  aria-label={`Move ${def.label} up`}
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={index === featureOrder.length - 1}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
                  aria-label={`Move ${def.label} down`}
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-lg bg-primary py-3 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
