import { VentaInvoice } from "@/components/ventas/venta-invoice"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface VentaDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function VentaDetailPage({ params }: VentaDetailPageProps) {
  const { id } = await params
  const supabase = createServerClient()

  if (!supabase) {
    return <div>Error: Supabase no configurado</div>
  }

  // Fetch buy with client info
  const { data: buy, error: buyError } = await supabase
    .from("buys")
    .select(`
      *,
      clients (*)
    `)
    .eq("id", id)
    .single()

  if (buyError || !buy) {
    notFound()
  }

  // Fetch buy items with product info
  const { data: buyItems } = await supabase
    .from("buy_items")
    .select(`
      *,
      products (*)
    `)
    .eq("buy_id", id)

  // Fetch buy pajilla items with pajilla info
  const { data: buyPajillaItems } = await supabase
    .from("buy_pajilla_items")
    .select(`
      *,
      pajillas (*)
    `)
    .eq("buy_id", id)

  const ventaData = {
    ...buy,
    client: buy.clients,
    buy_items: (buyItems || []).map((item: any) => ({
      ...item,
      product: item.products,
    })),
    buy_pajilla_items: (buyPajillaItems || []).map((item: any) => ({
      ...item,
      pajilla: item.pajillas,
    })),
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-4 mb-8 print:hidden">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/ventas">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Factura de Venta</h1>
          <p className="text-muted-foreground mt-1">Detalle de la venta {buy.buy_number}</p>
        </div>
      </div>

      <VentaInvoice venta={ventaData} />
    </main>
  )
}
