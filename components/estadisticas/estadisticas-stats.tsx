import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, DollarSign, Package, Syringe, ShoppingCart, ArrowUpDown, Boxes, TrendingUp } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"

const toNumber = (value: number | string | null | undefined) => Number(value) || 0

export async function EstadisticasStats() {
  const supabase = createServerClient()

  if (!supabase) {
    return <div>Error: Supabase no configurado</div>
  }

  const [buysResult, buyItemsResult, buyPajillaResult, ordersResult, productsResult, pajillasResult] = await Promise.all([
    supabase.from("buys").select("total_amount", { count: "exact" }),
    supabase.from("buy_items").select("quantity"),
    supabase.from("buy_pajilla_items").select("quantity"),
    supabase.from("orders").select("total_amount").eq("status", "completed"),
    supabase.from("products").select("purchase_price, sale_price, quantity"),
    supabase.from("pajillas").select("purchase_price, sale_price, quantity"),
  ])

  const queryError = [
    buysResult.error,
    buyItemsResult.error,
    buyPajillaResult.error,
    ordersResult.error,
    productsResult.error,
    pajillasResult.error,
  ].find(Boolean)

  if (queryError) {
    console.error("Error fetching estadisticas:", queryError)
    return <div>Error al cargar las estadísticas</div>
  }

  const totalSales = buysResult.count || 0
  const totalRevenue = (buysResult.data || []).reduce((sum, b) => sum + toNumber(b.total_amount), 0)
  const totalProductsSold = (buyItemsResult.data || []).reduce((sum, item) => sum + toNumber(item.quantity), 0)
  const totalPajillasSold = (buyPajillaResult.data || []).reduce((sum, item) => sum + toNumber(item.quantity), 0)

  const totalOrdersExpense = (ordersResult.data || []).reduce((sum, o) => sum + toNumber(o.total_amount), 0)
  const totalExpenses = totalOrdersExpense
  const balance = totalRevenue - totalExpenses

  const productsStock = productsResult.data || []
  const pajillasStock = pajillasResult.data || []

  const productUnits = productsStock.reduce((sum, p) => sum + toNumber(p.quantity), 0)
  const pajillaUnits = pajillasStock.reduce((sum, p) => sum + toNumber(p.quantity), 0)

  const productInventoryCost = productsStock.reduce(
    (sum, p) => sum + toNumber(p.purchase_price) * toNumber(p.quantity),
    0,
  )
  const pajillaInventoryCost = pajillasStock.reduce(
    (sum, p) => sum + toNumber(p.purchase_price) * toNumber(p.quantity),
    0,
  )
  const totalInventoryCost = productInventoryCost + pajillaInventoryCost

  const productInventorySale = productsStock.reduce(
    (sum, p) => sum + toNumber(p.sale_price) * toNumber(p.quantity),
    0,
  )
  const pajillaInventorySale = pajillasStock.reduce(
    (sum, p) => sum + toNumber(p.sale_price) * toNumber(p.quantity),
    0,
  )
  const totalInventorySale = productInventorySale + pajillaInventorySale

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Ventas Totales", value: totalSales.toString(), description: "Transacciones realizadas", icon: ShoppingBag },
          { title: "Ingresos Totales", value: formatCurrency(totalRevenue), description: "Todas las ventas (incluye crédito)", icon: DollarSign },
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
        <h2 className="text-lg font-semibold text-foreground mb-4">Inventario Actual</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Inventario Productos",
              value: formatCurrency(productInventoryCost),
              description: `${productUnits.toLocaleString("es-CO")} unidades · valor a costo`,
              icon: Package,
            },
            {
              title: "Inventario Pajillas",
              value: formatCurrency(pajillaInventoryCost),
              description: `${pajillaUnits.toLocaleString("es-CO")} unidades · valor a costo`,
              icon: Syringe,
            },
            {
              title: "Valor Total Inventario",
              value: formatCurrency(totalInventoryCost),
              description: "Productos + pajillas a costo",
              icon: Boxes,
            },
            {
              title: "Valor de Venta Potencial",
              value: formatCurrency(totalInventorySale),
              description: "Si se vende todo el inventario",
              icon: TrendingUp,
            },
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
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Egresos y Balance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Egresos Órdenes",
              value: formatCurrency(totalOrdersExpense),
              description: "Compras a proveedores completadas",
              icon: ShoppingCart,
            },
            {
              title: "Balance",
              value: formatCurrency(balance),
              description: "Ingresos - compras a proveedores",
              icon: ArrowUpDown,
              balance,
            },
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
