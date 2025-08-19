import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, ArrowRight, TrendingUp } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"

export async function ProductsOverview() {
  const supabase = createServerClient()

  if (!supabase) {
    return <div>Error: Supabase no configurado</div>
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("profit_percentage", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching products:", error)
    return <div>Error al cargar productos</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Productos Destacados</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/productos">
            Ver todos
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products && products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-muted-foreground">
                      Compra: ${product.purchase_price?.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      Venta: ${product.sale_price?.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {product.profit_percentage?.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay productos registrados</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
