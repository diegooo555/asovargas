import { Suspense } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentOrders } from "@/components/recent-orders"
import { ProductsOverview } from "@/components/products-overview"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      INdex
    </div>
  )
}
