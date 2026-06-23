import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { ProductSalesChart } from "./product-sales-chart"

export async function VentasPorProducto() {
  const supabase = createServerClient()

  if (!supabase) {
    return <div>Error: Supabase no configurado</div>
  }

  const { data: items, error } = await supabase
    .from("buy_items")
    .select("quantity, total_price, product:products(name, company)")

  if (error) {
    console.error("Error fetching buy items:", error)
    return <div>Error al cargar datos de ventas</div>
  }

  const productMap = new Map<string, { name: string; company: string; quantity: number; revenue: number }>()

  for (const item of items || []) {
    const product = item.product as { name: string; company: string } | null
    if (!product) continue
    const key = product.name
    const existing = productMap.get(key)
    if (existing) {
      existing.quantity += item.quantity || 0
      existing.revenue += item.total_price || 0
    } else {
      productMap.set(key, {
        name: product.name,
        company: product.company,
        quantity: item.quantity || 0,
        revenue: item.total_price || 0,
      })
    }
  }

  const products = Array.from(productMap.values()).sort((a, b) => b.quantity - a.quantity)

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Ventas por Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay ventas de productos registradas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Ventas por Producto</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductSalesChart data={products} />
        <div className="mt-6 space-y-2">
          {products.map((p, i) => (
            <div key={p.name} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}.</span>
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.company}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{p.quantity} und.</p>
                <p className="text-xs text-muted-foreground">
                  ${p.revenue.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
