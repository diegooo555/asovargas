import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { DashboardHeader } from "@/components/dashboard-header"
import { SessionProvider } from "next-auth/react"

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
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-background">
          <DashboardHeader />
          {children}
        </div>
      </body>
    </html>
  )
}
