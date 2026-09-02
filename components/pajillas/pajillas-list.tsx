import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Edit, Tag, Syringe, Package, Layers } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { DeletePajillaButton } from "@/components/pajillas/delete-pajilla-button"
import type { Pajilla } from "@/lib/types"

interface PajillasListProps {
  page?: number
}

export async function PajillasList({}: PajillasListProps) {
  const supabase = createServerClient()

  if (!supabase) {
    return <div>Error: Supabase no configurado</div>
  }

  const { data: pajillas, error } = await supabase
    .from("pajillas")
    .select("*")
    .order("canastilla_number", { ascending: true })
    .order("bull_name", { ascending: true })

  if (error) {
    console.error("Error fetching pajillas:", error)
    return <div>Error al cargar pajillas</div>
  }

  // Separar pajillas vacías (sin stock) de las activas
  const emptyPajillas = (pajillas || []).filter((p) => (p.quantity || 0) === 0)
  const activePajillas = (pajillas || []).filter((p) => (p.quantity || 0) > 0)

  // Agrupar por canastilla solo las pajillas con stock
  const grouped = activePajillas.reduce<Record<number, Pajilla[]>>((acc, pajilla) => {
    const key = pajilla.canastilla_number ?? 1
    if (!acc[key]) acc[key] = []
    acc[key].push(pajilla)
    return acc
  }, {})

  const canastillas = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Lista de Pajillas</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Buscar pajillas..." className="pl-10 w-64" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {canastillas.length > 0 || emptyPajillas.length > 0 ? (
          <div className="space-y-8">
            {canastillas.map((canastillaNumber) => {
              const items = grouped[canastillaNumber]
              const totalStock = items.reduce((t, p) => t + (p.quantity || 0), 0)
              return (
                <section key={canastillaNumber}>
                  {/* Encabezado de canastilla */}
                  <div className="flex items-center justify-between p-3 mb-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Canastilla #{canastillaNumber}</h3>
                        <p className="text-xs text-muted-foreground">
                          {items.length} toro(s) — {totalStock} pajilla(s) en total
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Toros dentro de la canastilla */}
                  <div className="space-y-3">
                    {items.map((pajilla) => (
                      <div
                        key={pajilla.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <Syringe className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground">{pajilla.bull_name}</h4>
                            <p className="text-sm text-muted-foreground">{pajilla.company}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                {pajilla.breed}
                              </Badge>
                              <Badge variant="secondary" className="bg-green-200 text-green-800">
                                <Tag className="h-3 w-3 mr-1" />
                                Stock: {pajilla.quantity}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-sm text-muted-foreground">
                                Compra: ${pajilla.purchase_price?.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-sm font-medium text-foreground">
                                Venta: ${pajilla.sale_price?.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/pajillas/${pajilla.id}/editar`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <DeletePajillaButton pajillaId={pajilla.id} pajillaName={pajilla.bull_name} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}

            {/* Pajillas vacías (sin stock) */}
            {emptyPajillas.length > 0 && (
              <section>
                <div className="flex items-center justify-between p-3 mb-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Pajillas Vacías</h3>
                      <p className="text-xs text-muted-foreground">
                        {emptyPajillas.length} toro(s) sin stock
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {emptyPajillas.map((pajilla) => (
                    <div
                      key={pajilla.id}
                      className="flex items-center justify-between p-4 border border-dashed border-muted rounded-lg hover:bg-muted/50 transition-colors opacity-80"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Syringe className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{pajilla.bull_name}</h4>
                          <p className="text-sm text-muted-foreground">{pajilla.company}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              {pajilla.breed}
                            </Badge>
                            <Badge variant="secondary" className="bg-red-100 text-red-700">
                              <Tag className="h-3 w-3 mr-1" />
                              Stock: {pajilla.quantity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Canastilla #{pajilla.canastilla_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/pajillas/${pajilla.id}/editar`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeletePajillaButton pajillaId={pajilla.id} pajillaName={pajilla.bull_name} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Syringe className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay pajillas registradas</h3>
            <p className="mb-4">Comienza agregando tu primera pajilla al inventario</p>
            <Button asChild>
              <Link href="/dashboard/pajillas/nueva">
                <Syringe className="h-4 w-4 mr-2" />
                Crear Primera Pajilla
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}