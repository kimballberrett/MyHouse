import type { Metadata } from "next"
import type { ReactNode } from "react"
import { AppHeader } from "@/components/app-header"

export const metadata: Metadata = {
  title: {
    template: "%s | MyHouse",
    default: "MyHouse - Find College Housing",
  },
  description: "Find the perfect college housing with personalized preferences and real-time listings.",
}

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div id="main-content">{children}</div>
    </div>
  )
}
