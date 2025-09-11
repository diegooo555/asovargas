import { DashboardHeader } from "@/components/dashboard-header"
import { OrderDetails } from "@/components/ordenes/order-details"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface OrderPageProps {
  params: {
    id: string
  }
}

export default async function OrderPage({ params }: OrderPageProps) {
  const supabase = createServerClient()

  if (!supabase) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/ordenes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
          </div>
          <Alert>
            <AlertDescription>
              Error de configuración: Supabase no está configurado correctamente. Por favor, verifica las variables de
              entorno.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }

  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          product:products (*)
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("[v0] Database error:", error)
      notFound()
    }

    if (!order) {
      console.log("[v0] Order not found for ID:", params.id)
      notFound()
    }

    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />

        <main className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/ordenes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Orden {order.order_number}</h1>
              <p className="text-muted-foreground mt-2">Detalles completos de la orden</p>
            </div>
          </div>

          {/* Order Details */}
          <OrderDetails order={order} />
        </main>
      </div>
    )
  } catch (error) {
    console.error("[v0] Unexpected error:", error)
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/ordenes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
          </div>
          <Alert>
            <AlertDescription>Error inesperado al cargar la orden. Por favor, intenta de nuevo.</AlertDescription>
          </Alert>
        </main>
      </div>
    )
  }
}
