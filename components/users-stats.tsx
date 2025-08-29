"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface Stats {
  totalUsers: number
  totalDebts: number
  pendingDebts: number
  associates: number
  buyers: number
}

export function UsersStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDebts: 0,
    pendingDebts: 0,
    associates: 0,
    buyers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      if (!supabase) return

      const [clientsResult, debtsResult] = await Promise.all([
        supabase.from("clients").select("type_client"),
        supabase.from("debts").select("total, status"),
      ])

      const clients = clientsResult.data || []
      const debts = debtsResult.data || []

      const associates = clients.filter((c) => c.type_client === "associate").length
      const buyers = clients.filter((c) => c.type_client === "buyer").length
      const totalDebts = debts.reduce((sum, debt) => sum + Number.parseFloat(debt.total), 0)
      const pendingDebts = debts
        .filter((debt) => debt.status === "pending")
        .reduce((sum, debt) => sum + Number.parseFloat(debt.total), 0)

      setStats({
        totalUsers: clients.length,
        totalDebts,
        pendingDebts,
        associates,
        buyers,
      })
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Usuarios",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Asociados",
      value: stats.associates,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Compradores",
      value: stats.buyers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Deudas Totales",
      value: `$${stats.totalDebts.toFixed(2)}`,
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Deudas Pendientes",
      value: `$${stats.pendingDebts.toFixed(2)}`,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{loading ? "..." : stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
