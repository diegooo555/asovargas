import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, DollarSign, Package, Syringe, ShoppingCart, TrendingDown, ArrowUpDown } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"

export async function EstadisticasStats() {
  const supabase = createServerClient()

  if (!supabase) {
    return <div>Error: Supabase no configurado</div>
  }

  const [buysResult, buyItemsResult, buyPajillaResult, ordersResult, pajillasResult] = await Promise.all([
    supabase.from("buys").select("total_amount", { count: "exact" }),
    supabase.from("buy_items").select("quantity"),
    supabase.from("buy_pajilla_items").select("quantity"),
    supabase.from("orders").select("total_amount").eq("status", "completed"),
    supabase.from("pajillas").select("purchase_price, quantity"),
  ])

  const totalSales = buysResult.count || 0
  const totalRevenue = buysResult.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
  const totalProductsSold = buyItemsResult.data?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0
  const totalPajillasSold = buyPajillaResult.data?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0

  const totalOrdersExpense = ordersResult.data?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
  const totalPajillasInvestment = pajillasResult.data?.reduce((sum, p) => sum + ((p.purchase_price || 0) * (p.quantity || 0)), 0) || 0
  const totalExpenses = totalOrdersExpense + totalPajillasInvestment
  const balance = totalRevenue - totalExpenses

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Ventas Totales", value: totalSales.toString(), description: "Transacciones realizadas", icon: ShoppingBag },
          { title: "Ingresos Totales", value: formatCurrency(totalRevenue), description: "De todas las ventas", icon: DollarSign },
          { title: "Productos Vendidos", value: totalProductsSold.toString(), description: "Unidades vendidas", icon: Package },
          { title: "Pajillas Vendidas", value: totalPajillasSold.toString(), description: "Unidades vendidas", icon: Syringe },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Egresos y Balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Egresos Órdenes", value: formatCurrency(totalOrdersExpense), description: "Órdenes de reabastecimiento completadas", icon: ShoppingCart },
            { title: "Inversión Pajillas", value: formatCurrency(totalPajillasInvestment), description: "Costo total del inventario actual", icon: Syringe },
            { title: "Total Egresos", value: formatCurrency(totalExpenses), description: "Órdenes + Inversión en pajillas", icon: TrendingDown },
            { title: "Balance", value: formatCurrency(balance), description: "Ingresos - Egresos", icon: ArrowUpDown, balance },
          ].map((stat, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.balance !== undefined ? (stat.balance >= 0 ? "text-green-600" : "text-red-600") : "text-foreground"}`}>
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-2">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
