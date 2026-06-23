import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Syringe } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { PajillaSalesChart } from "./pajilla-sales-chart"

export async function VentasPorPajilla() {
  const supabase = createServerClient()

  if (!supabase) {
    return <div>Error: Supabase no configurado</div>
  }

  const { data: items, error } = await supabase
    .from("buy_pajilla_items")
    .select("quantity, total_price, pajilla:pajillas(bull_name, company, breed)")

  if (error) {
    console.error("Error fetching pajilla items:", error)
    return <div>Error al cargar datos de pajillas</div>
  }

  const pajillaMap = new Map<string, { bull_name: string; company: string; breed: string; quantity: number; revenue: number }>()

  for (const item of items || []) {
    const pajilla = item.pajilla as { bull_name: string; company: string; breed: string } | null
    if (!pajilla) continue
    const key = pajilla.bull_name
    const existing = pajillaMap.get(key)
    if (existing) {
      existing.quantity += item.quantity || 0
      existing.revenue += item.total_price || 0
    } else {
      pajillaMap.set(key, {
        bull_name: pajilla.bull_name,
        company: pajilla.company,
        breed: pajilla.breed,
        quantity: item.quantity || 0,
        revenue: item.total_price || 0,
      })
    }
  }

  const pajillas = Array.from(pajillaMap.values()).sort((a, b) => b.quantity - a.quantity)

  if (pajillas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Ventas por Pajilla</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Syringe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay ventas de pajillas registradas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Ventas por Pajilla</CardTitle>
      </CardHeader>
      <CardContent>
        <PajillaSalesChart data={pajillas} />
        <div className="mt-6 space-y-2">
          {pajillas.map((p, i) => (
            <div key={p.bull_name} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground w-6">{i + 1}.</span>
                <div>
                  <p className="font-medium text-sm">{p.bull_name}</p>
                  <p className="text-xs text-muted-foreground">{p.company} - {p.breed}</p>
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
