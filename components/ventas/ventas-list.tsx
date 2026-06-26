import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Eye, Calendar, User, Banknote, ArrowRightLeft, CreditCard, Package, TrendingUp } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import type { SaleType } from "@/lib/types"
import { PaginationControls } from "@/components/ui/pagination-controls"

const PAGE_SIZE = 10

type PaymentFilter = "contado" | "transferencia" | "credito"

const PAYMENT_FILTERS: { value: PaymentFilter; label: string; icon: typeof CreditCard; activeClass: string }[] = [
  { value: "contado", label: "Contado", icon: Banknote, activeClass: "bg-green-600 text-white border-green-600 hover:bg-green-700" },
  { value: "transferencia", label: "Transferencia", icon: ArrowRightLeft, activeClass: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" },
  { value: "credito", label: "Crédito", icon: CreditCard, activeClass: "bg-amber-500 text-white border-amber-500 hover:bg-amber-600" },
]

interface VentasListProps {
  page?: number
  saleType?: PaymentFilter
  clientId?: string
}

export async function VentasList({ page = 1, saleType, clientId }: VentasListProps) {
  const supabase = createServerClient()

  if (!supabase) {
    return <div>Error: Supabase no configurado</div>
  }

  if (clientId && supabase) {
    return <ClientSalesSummary clientId={clientId} />
  }

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from("buys")
    .select(`
      *,
      clients (name, document, phone)
    `, { count: "exact" })
    .order("created_at", { ascending: false })

  if (saleType) {
    query = query.eq("sale_type", saleType)
  }

  const { data: ventas, error, count } = await query.range(from, to)

  if (error) {
    console.error("Error fetching ventas:", error)
    return <div>Error al cargar ventas</div>
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl font-semibold">Historial de Ventas</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/ventas"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${!saleType
                ? "bg-primary text-primary-foreground border-primary"
                : "border-input text-muted-foreground hover:bg-muted"
                }`}
            >
              Todos
            </Link>
            {PAYMENT_FILTERS.map(({ value, label, icon: Icon, activeClass }) => (
              <Link
                key={value}
                href={`/dashboard/ventas?saleType=${value}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${saleType === value
                  ? activeClass
                  : "border-input text-muted-foreground hover:bg-muted"
                  }`}
              >
                <Icon className="h-3 w-3" />
                {label}
              </Link>
            ))}
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
                      <h3 className="font-bold text-green-700">{venta.buy_number}</h3>
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
                      Ver Remisión
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              extraParams={saleType ? { saleType } : {}}
            />
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

async function ClientSalesSummary({ clientId }: { clientId: string }) {
  const supabase = createServerClient()
  if (!supabase) return <div>Error: Supabase no configurado</div>

  const { data: client } = await supabase
    .from("clients")
    .select("name, document")
    .eq("client_id", clientId)
    .single()

  const { data: buys } = await supabase
    .from("buys")
    .select("id, buy_number, sale_type, total_amount, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  const buyIds = buys?.map((b) => b.id) || []

  let buyItems: any[] = []
  if (buyIds.length > 0) {
    const { data } = await supabase
      .from("buy_items")
      .select(`
        quantity,
        unit_price,
        total_price,
        products (name, company)
      `)
      .in("buy_id", buyIds)
    buyItems = data || []
  }

  const totalVendido = buys?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
  const totalContado = buys?.filter((b) => b.sale_type === "contado").reduce((s, b) => s + (b.total_amount || 0), 0) || 0
  const totalTransferencia = buys?.filter((b) => b.sale_type === "transferencia").reduce((s, b) => s + (b.total_amount || 0), 0) || 0
  const totalCredito = buys?.filter((b) => b.sale_type === "credito").reduce((s, b) => s + (b.total_amount || 0), 0) || 0

  const productMap = new Map<string, { name: string; company: string; quantity: number; total: number }>()
  for (const item of buyItems) {
    const key = item.products?.name || "Producto desconocido"
    const existing = productMap.get(key)
    if (existing) {
      existing.quantity += item.quantity || 0
      existing.total += item.total_price || 0
    } else {
      productMap.set(key, {
        name: key,
        company: item.products?.company || "",
        quantity: item.quantity || 0,
        total: item.total_price || 0,
      })
    }
  }
  const productRows = Array.from(productMap.values())

  return (
    <div className="space-y-6">
      {/* Resumen cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Vendido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalVendido.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Banknote className="w-4 h-4 text-green-600" />
              Contado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${totalContado.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              Transferencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">${totalTransferencia.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-600" />
              Crédito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">${totalCredito.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Cliente info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {client?.name || "Cliente"} — {client?.document || ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Producto</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Marca</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Cantidad</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {productRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      No hay productos en las ventas de este cliente
                    </td>
                  </tr>
                ) : (
                  productRows.map((row) => (
                    <tr key={row.name} className="border-b last:border-0">
                      <td className="py-2 px-3 font-medium">{row.name}</td>
                      <td className="py-2 px-3 text-muted-foreground">{row.company || "—"}</td>
                      <td className="py-2 px-3 text-right">{row.quantity}</td>
                      <td className="py-2 px-3 text-right font-semibold">
                        ${row.total.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Historial de compras del cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          {(!buys || buys.length === 0) ? (
            <p className="text-center py-4 text-muted-foreground">No hay compras registradas</p>
          ) : (
            <div className="space-y-2">
              {buys.map((buy: any) => (
                <div key={buy.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-green-700">{buy.buy_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(buy.created_at).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {(() => {
                      const config: Record<string, { className: string }> = {
                        contado: { className: "bg-green-100 text-green-700" },
                        transferencia: { className: "bg-blue-100 text-blue-700" },
                        credito: { className: "bg-amber-100 text-amber-700" },
                      }
                      const c = config[buy.sale_type]
                      return (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c?.className}`}>
                          {buy.sale_type}
                        </span>
                      )
                    })()}
                    <span className="font-semibold">
                      ${buy.total_amount?.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                    </span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/ventas/${buy.id}`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
