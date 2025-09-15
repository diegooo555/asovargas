import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { DashboardHeader } from "@/components/dashboard-header"

export const metadata: Metadata = {
  title: "ASOVARGAS Dashboard",
  description: "Sistema de gestión empresarial para ASOVARGAS",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
        <div className="min-h-screen bg-background">
          <DashboardHeader />
          {children}
        </div>
  )
}
