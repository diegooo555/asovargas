import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, Calendar, User, Mail, Edit } from "lucide-react"
import type { OrderWithItems } from "@/lib/types"

interface OrderDetailsProps {
  order: OrderWithItems
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
    <div className="space-y-6">
      {/* Order Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Información del Cliente</CardTitle>
            <User className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{order.customer_name}</div>
            {order.customer_email && (
              <div className="flex items-center mt-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                {order.customer_email}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de la Orden</CardTitle>
            <Calendar className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Creada: {new Date(order.created_at).toLocaleDateString("es-CO")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de la Orden</CardTitle>
            <Package className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${order.total_amount?.toLocaleString("es-CO", { minimumFractionDigits: 2 }) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{order.order_items?.length || 0} producto(s)</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Productos de la Orden</CardTitle>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar Orden
          </Button>
        </CardHeader>
        <CardContent>
          {order.order_items && order.order_items.length > 0 ? (
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.product?.name || "Producto eliminado"}</h3>
                      <p className="text-sm text-muted-foreground">{item.product?.company}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-muted-foreground">Cantidad: {item.quantity}</span>
                        <span className="text-sm text-muted-foreground">
                          Precio: ${item.unit_price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ${item.total_price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${order.total_amount?.toLocaleString("es-CO", { minimumFractionDigits: 2 }) || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay productos en esta orden</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
