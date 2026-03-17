import type { ReactNode } from "react"
import { AppHeader } from "@/components/app-header"

export default function AppShellLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      {children}
    </div>
  )
}
