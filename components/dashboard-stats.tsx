import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, TrendingUp, DollarSign } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"

export async function DashboardStats() {
  const supabase = createServerClient()

  if (!supabase) {
    return <div>Error: Supabase no configurado</div>
  }

  // Fetch stats from database
  const [productsResult, ordersResult, revenueResult] = await Promise.all([
    supabase.from("products").select("id", { count: "exact" }),
    supabase.from("orders").select("id, status, total_amount", { count: "exact" }),
    supabase.from("orders").select("total_amount").eq("status", "completed"),
  ])

  const totalProducts = productsResult.count || 0
  const totalOrders = ordersResult.count || 0
  const pendingOrders = ordersResult.data?.filter((order) => order.status === "pending").length || 0
  const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

  const stats = [
    {
      title: "Total Productos",
      value: totalProducts.toString(),
      description: "Productos en inventario",
      icon: Package,
      trend: "+2.5%",
    },
    {
      title: "Órdenes Totales",
      value: totalOrders.toString(),
      description: "Órdenes registradas",
      icon: ShoppingCart,
      trend: "+12.3%",
    },
    {
      title: "Órdenes Pendientes",
      value: pendingOrders.toString(),
      description: "Requieren atención",
      icon: TrendingUp,
      trend: "-5.2%",
    },
    {
      title: "Ingresos Totales",
      value: `$${totalRevenue.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`,
      description: "Órdenes completadas",
      icon: DollarSign,
      trend: "+18.7%",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <span className={`text-xs font-medium ${stat.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                {stat.trend}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
