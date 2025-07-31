"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Route protection logic
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  // Loading state handler
  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleLogout = async () => {
    await signOut({ 
      callbackUrl: "/auth/signin",
      redirect: true 
    })
  }

  const userInitials = session.user?.name 
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : session.user?.email?.[0].toUpperCase() || 'U'

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      {/* Header Navigation */}
      <header style={{ backgroundColor: "white", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "4rem" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <h1 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", margin: 0 }}>
                Project Manager
              </h1>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                Welcome, {session.user?.name || session.user?.email}
              </span>
              
              <div style={{ position: "relative" }}>
                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "50%",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                    fontWeight: "500"
                  }}
                  title="Click to logout"
                >
                  {userInitials}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem 1rem" }}>
        {children}
      </main>
    </div>
  )
}