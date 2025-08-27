import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Package, Edit, Search, TrendingUp } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { DeleteProductButton } from "@/components/delete-product-button"

export async function ProductsList() {
  const supabase = createServerClient()

  if (!supabase) {
    return <div>Error: Supabase no configurado</div>
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return <div>Error al cargar productos</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Lista de Productos</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Buscar productos..." className="pl-10 w-64" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {products && products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.company}</p>
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
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/productos/${product.id}/editar`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DeleteProductButton productId={product.id} productName={product.name} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay productos registrados</h3>
            <p className="mb-4">Comienza agregando tu primer producto al inventario</p>
            <Button asChild>
              <Link href="/productos/nuevo">
                <Package className="h-4 w-4 mr-2" />
                Crear Primer Producto
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
