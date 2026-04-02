import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ToastContainer } from "react-toastify"
import Providers from "@/app/providers/react-query-provider"
import '../styles/globals.css'

export const metadata: Metadata = {
  title: "ASOVARGAS - Sistema de Gestión Empresarial",
  description: "Plataforma integral para la gestión de inventarios, órdenes, usuarios y producción",
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
        <Providers>
        {children}
        <ToastContainer/>
        </Providers>
      </body>
    </html>
  )
}