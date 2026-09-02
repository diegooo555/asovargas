import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Calendar, Syringe } from "lucide-react"
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

  const productsTotal = order.order_items?.reduce((t, item) => t + (item.total_price || 0), 0) || 0
  const pajillasTotal = order.order_pajilla_items?.reduce((t, item) => t + (item.total_price || 0), 0) || 0
  const totalItems = (order.order_items?.length || 0) + (order.order_pajilla_items?.length || 0)

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <p className="text-xs text-muted-foreground mt-2">{totalItems} item(s) en total</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Items - Products */}
      {order.order_items && order.order_items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <span>Productos de la Orden</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
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

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Subtotal Productos:</span>
                  <span className="text-lg font-bold">
                    ${productsTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Items - Pajillas */}
      {order.order_pajilla_items && order.order_pajilla_items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Syringe className="h-5 w-5 text-primary" />
              <span>Pajillas de la Orden</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.order_pajilla_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                      <Syringe className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.pajilla?.bull_name || "Pajilla eliminada"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.pajilla?.breed} — {item.pajilla?.company}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-muted-foreground">Canastilla #{item.pajilla?.canastilla_number || "—"}</span>
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

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Subtotal Pajillas:</span>
                  <span className="text-lg font-bold">
                    ${pajillasTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Total Summary */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="space-y-2">
            {order.order_items?.length > 0 && order.order_pajilla_items?.length > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal Productos:</span>
                  <span>${productsTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal Pajillas:</span>
                  <span>${pajillasTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-semibold">Total de la Orden:</span>
              <span className="text-2xl font-bold text-primary">
                ${order.total_amount?.toLocaleString("es-CO", { minimumFractionDigits: 2 }) || "0.00"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
