import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
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
    <html lang="es" >
      <body>
        <div className="min-h-screen bg-background">
          <DashboardHeader/>
          {children}
        </div>
      </body>
    </html>
  )
}
