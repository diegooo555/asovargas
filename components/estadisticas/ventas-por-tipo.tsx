import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Banknote, ArrowRightLeft, CreditCard } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"

export async function VentasPorTipo() {
  const supabase = createServerClient()

  if (!supabase) {
    return <div>Error: Supabase no configurado</div>
  }

  const { data: buys, error } = await supabase
    .from("buys")
    .select("sale_type, total_amount")

  if (error) {
    console.error("Error fetching buys:", error)
    return <div>Error al cargar datos de ventas</div>
  }

  const typeMap: Record<string, { count: number; total: number }> = {
    contado: { count: 0, total: 0 },
    transferencia: { count: 0, total: 0 },
    credito: { count: 0, total: 0 },
  }

  for (const buy of buys || []) {
    const type = buy.sale_type
    if (typeMap[type]) {
      typeMap[type].count++
      typeMap[type].total += buy.total_amount || 0
    }
  }

  const types = [
    { key: "contado", label: "Contado", icon: Banknote, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", data: typeMap.contado },
    { key: "transferencia", label: "Transferencia", icon: ArrowRightLeft, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", data: typeMap.transferencia },
    { key: "credito", label: "Crédito", icon: CreditCard, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", data: typeMap.credito },
  ]

  const total = Object.values(typeMap).reduce((sum, t) => sum + t.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Ventas por Tipo de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {types.map((type) => {
            const percentage = total > 0 ? ((type.data.count / total) * 100).toFixed(1) : "0"
            return (
              <div key={type.key} className={`${type.bg} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <type.icon className={`h-6 w-6 ${type.color}`} />
                  <span className={`text-xs font-medium ${type.color}`}>{percentage}%</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{type.data.count}</p>
                <p className="text-sm text-muted-foreground">{type.label}</p>
                <p className="text-sm font-medium mt-1 text-foreground">
                  ${type.data.total.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
