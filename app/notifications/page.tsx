"use client"

import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import {
  Bell,
  BellRing,
  Home,
  Settings,
  Check,
  Clock,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Notification {
  id: string
  type: "new-listing" | "daily-summary" | "price-drop"
  title: string
  description: string
  time: string
  read: boolean
  image?: string
  listingUrl?: string
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "new-listing",
    title: "New listing matches your preferences!",
    description:
      'CollegeTown Apartments - $450/mo, 0.3 miles from campus. 4 contracts available.',
    time: "2 minutes ago",
    read: false,
    image: "/images/listing-1.jpg",
    listingUrl: "https://www.facebook.com/marketplace",
  },
  {
    id: "2",
    type: "new-listing",
    title: "New match: CollegeHouse",
    description:
      "$475/mo with in-unit laundry and parking. Only 0.5 miles away.",
    time: "1 hour ago",
    read: false,
    image: "/images/listing-2.jpg",
    listingUrl: "https://www.facebook.com/marketplace",
  },
  {
    id: "3",
    type: "daily-summary",
    title: "Your Daily Summary is ready",
    description:
      "5 new listings match your criteria today. Check them out!",
    time: "8 hours ago",
    read: true,
  },
  {
    id: "4",
    type: "price-drop",
    title: "Price drop on DormPlace",
    description:
      "DormPlace reduced their price from $520 to $460/mo. Still 2 contracts available.",
    time: "1 day ago",
    read: true,
    image: "/images/listing-3.jpg",
    listingUrl: "https://www.facebook.com/marketplace",
  },
  {
    id: "5",
    type: "new-listing",
    title: "New listing: DormsRUs",
    description:
      "$495/mo, shared rooms, parking lot, and laundry. 1.5 miles from campus.",
    time: "2 days ago",
    read: true,
    image: "/images/listing-5.jpg",
    listingUrl: "https://www.facebook.com/marketplace",
  },
]

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "new-listing":
      return Home
    case "daily-summary":
      return Clock
    case "price-drop":
      return BellRing
    default:
      return Bell
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter((n) => !n.read).length

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 md:py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Notifications
            </h1>
            <p className="mt-1 text-muted-foreground">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up!"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
              >
                <Check className="h-4 w-4" />
                Mark all read
              </button>
            )}
            <Link
              href="/preferences"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type)
            return (
              <div
                key={notification.id}
                onClick={() => markRead(notification.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    markRead(notification.id)
                }}
                role="button"
                tabIndex={0}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all hover:shadow-md ${
                  notification.read
                    ? "border-border bg-card"
                    : "border-accent/30 bg-accent/5"
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon or Image */}
                  {notification.image ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={notification.image || "/placeholder.svg"}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`text-sm font-semibold ${
                          notification.read
                            ? "text-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {!notification.read && (
                          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />
                        )}
                        {notification.title}
                      </h3>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {notification.time}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {notification.description}
                    </p>

                    {notification.listingUrl && (
                      <a
                        href={notification.listingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent/80"
                      >
                        View on Facebook
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/preferences"
            className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:border-accent/50 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Settings className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Preferences
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Update your housing criteria
              </p>
            </div>
          </Link>

          <Link
            href="/listings"
            className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:border-accent/50 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <Home className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">
                Daily Summary
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                View today&apos;s top listings
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}
