import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, ArrowRight, ShoppingCart } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"

export async function RecentOrders() {
  const supabase = createServerClient()

  if (!supabase) {
    return <div>Error: Supabase no configurado</div>
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  if (error) {
    console.error("Error fetching orders:", error)
    return <div>Error al cargar órdenes</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completada"
      case "processing":
        return "Procesando"
      case "pending":
        return "Pendiente"
      case "cancelled":
        return "Cancelada"
      default:
        return status
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Órdenes Recientes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/ordenes">
            Ver todas
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-foreground">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge variant="secondary" className={getStatusColor(order.status)}>
                      {getStatusText(order.status)}
                    </Badge>
                    <span className="text-sm font-medium text-foreground">
                      ${order.total_amount?.toLocaleString("es-CO", { minimumFractionDigits: 2 }) || "0.00"}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay órdenes recientes</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
