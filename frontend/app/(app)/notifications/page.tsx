"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  type Notification,
  getNotifications,
  markAllNotificationsRead,
} from "@/lib/api"
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

type NotificationWithListingLink = Notification & {
  craigslist_url?: string
  source_url?: string
}

function timeAgo(isoString: string): string {
  const now = Date.now()
  const then = new Date(isoString).getTime()
  const seconds = Math.floor((now - then) / 1000)
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? "s" : ""} ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days !== 1 ? "s" : ""} ago`
}

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

async function fetchNotifications(): Promise<Notification[]> {
  return getNotifications()
}

async function markAllReadRequest(): Promise<Notification[]> {
  return markAllNotificationsRead()
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()

  const { data: notifications = [], isLoading, isError } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  })

  const markAllMutation = useMutation({
    mutationFn: markAllReadRequest,
    onSuccess: (updatedNotifications) => {
      queryClient.setQueryData(["notifications"], updatedNotifications)
    },
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (isError) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 md:py-16">
        <p className="text-destructive">
          Could not load notifications. Check your API base URL and backend availability.
        </p>
      </main>
    )
  }

  return (
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
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
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

      {isLoading ? (
        <p className="text-muted-foreground">Loading notifications...</p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type)
              const notificationWithLink = notification as NotificationWithListingLink
              const externalListingUrl =
                notificationWithLink.craigslist_url ??
                notificationWithLink.source_url ??
                notification.facebook_url
              const isCraigslistLink = externalListingUrl
                ?.toLowerCase()
                .includes("craigslist.org")
              return (
                <div
                  key={notification.id}
                  role="article"
                  className={`group rounded-2xl border p-4 transition-all hover:shadow-md ${
                    notification.is_read
                      ? "border-border bg-card"
                      : "border-accent/30 bg-accent/5"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Icon or Image */}
                    {notification.image_url ? (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={notification.image_url || "/placeholder.svg"}
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
                        <h3 className="text-sm font-semibold text-foreground">
                          {!notification.is_read && (
                            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent" />
                          )}
                          {notification.title}
                        </h3>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {timeAgo(notification.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {notification.description}
                      </p>

                      {externalListingUrl && (
                        <a
                          href={externalListingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent/80"
                        >
                          {isCraigslistLink ? "View on Craigslist" : "View listing"}
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
        </>
      )}
    </main>
  )
}
