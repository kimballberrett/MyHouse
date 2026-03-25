"use client"

export const dynamic = 'force-dynamic'

import { FormEvent, Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Home, Mail, ShieldCheck, UserPlus } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { getAuthenticatedUserId, setAuthenticatedUserId } from "@/lib/auth-client"

function LoginPageInner() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = useMemo(() => {
    const value = searchParams.get("next")
    return value && value.startsWith("/") ? value : "/preferences"
  }, [searchParams])

  useEffect(() => {
    if (getAuthenticatedUserId()) {
      router.replace(nextPath)
    }
  }, [nextPath, router])

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter your email and password.")
      return
    }

    try {
      setIsSubmitting(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) throw new Error(error.message)
      setAuthenticatedUserId(data.user.id)
      router.push(nextPath)
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Invalid email or password."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")

    if (!signupEmail.trim() || !signupPassword.trim() || !confirmPassword.trim()) {
      setErrorMessage("Please complete all create-account fields.")
      return
    }
    if (signupPassword.length < 8) {
      setErrorMessage("Password must be at least 8 characters.")
      return
    }
    if (signupPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.")
      return
    }

    try {
      setIsSubmitting(true)
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword,
      })
      if (error) throw new Error(error.message)
      if (!data.user) throw new Error("Could not create account. That email may already be in use.")
      setAuthenticatedUserId(data.user.id)
      router.push(nextPath)
      router.refresh()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not create account. That email may already be in use."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto grid min-h-[calc(100vh-73px)] w-full max-w-5xl items-center px-4 py-10 md:py-16">
        <section className="grid gap-6 md:grid-cols-[1.15fr_1fr] md:gap-8">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" />
              Protected Access
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Access your account
            </h1>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Sign in with your email and password, or create a new account if
              you are new to OurHouse.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
                <div className="mt-0.5 rounded-lg bg-accent/10 p-2">
                  <Mail className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Secure credential login
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Seed account: demo@university.edu / demo1234
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-border bg-background p-4">
                <div className="mt-0.5 rounded-lg bg-accent/10 p-2">
                  <UserPlus className="h-4 w-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    New here?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use the create account button to register instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="rounded-2xl border-border shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Account Access</CardTitle>
              <CardDescription>
                Authentication is validated against the `users` table.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(value) => {
                  setActiveTab(value as "login" | "signup")
                  setErrorMessage("")
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Create Account</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form className="space-y-5" onSubmit={handleLoginSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@school.edu"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                      />
                    </div>

                    {errorMessage ? (
                      <Alert variant="destructive">
                        <AlertDescription>{errorMessage}</AlertDescription>
                      </Alert>
                    ) : null}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form className="space-y-5" onSubmit={handleSignupSubmit}>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@school.edu"
                        value={signupEmail}
                        onChange={(event) => setSignupEmail(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        value={signupPassword}
                        onChange={(event) => setSignupPassword(event.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                      />
                    </div>

                    {errorMessage ? (
                      <Alert variant="destructive">
                        <AlertDescription>{errorMessage}</AlertDescription>
                      </Alert>
                    ) : null}

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                <span>Need a different account?</span>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 font-medium text-foreground hover:text-accent"
                >
                  <Home className="h-3.5 w-3.5" />
                  Back Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  )
}
