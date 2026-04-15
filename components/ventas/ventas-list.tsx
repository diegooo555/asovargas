import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Eye, Search, Calendar, User, Banknote, ArrowRightLeft, CreditCard } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import type { SaleType } from "@/lib/types"
import { PaginationControls } from "@/components/ui/pagination-controls"

const PAGE_SIZE = 10

interface VentasListProps {
  page?: number
}

export async function VentasList({ page = 1 }: VentasListProps) {
  const supabase = createServerClient()

  if (!supabase) {
    return <div>Error: Supabase no configurado</div>
  }

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: ventas, error, count } = await supabase
    .from("buys")
    .select(`
      *,
      clients (name, document, phone)
    `, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("Error fetching ventas:", error)
    return <div>Error al cargar ventas</div>
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Historial de Ventas</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Buscar ventas..." className="pl-10 w-64" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {ventas && ventas.length > 0 ? (
          <div className="space-y-4">
            {ventas.map((venta: any) => (
              <div
                key={venta.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-foreground">{venta.buy_number}</h3>
                      {(() => {
                        const typeConfig: Record<string, { label: string; className: string; icon: typeof CreditCard }> = {
                          contado: { label: "Contado", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: Banknote },
                          transferencia: { label: "Transferencia", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", icon: ArrowRightLeft },
                          credito: { label: "Crédito", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: CreditCard },
                        }
                        const config = typeConfig[venta.sale_type] || typeConfig.contado
                        const Icon = config.icon
                        return (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
                            <Icon className="h-3 w-3" />
                            {config.label}
                          </span>
                        )
                      })()}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {venta.clients?.name || "Cliente desconocido"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(venta.created_at).toLocaleDateString("es-CO", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}</span>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        ${venta.total_amount?.toLocaleString("es-CO", { minimumFractionDigits: 2 }) || "0.00"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/ventas/${venta.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Factura
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

            <PaginationControls currentPage={page} totalPages={totalPages} />
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay ventas registradas</h3>
            <p className="text-sm mb-4">Comienza registrando tu primera venta</p>
            <Button asChild>
              <Link href="/dashboard/ventas/nueva">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Crear Primera Venta
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
