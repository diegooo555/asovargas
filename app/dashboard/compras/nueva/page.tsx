import { DashboardHeader } from "@/components/dashboard-header"
import { OrderForm } from "@/components/order-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewOrderPage() {
  console.log("[v0] Rendering NewOrderPage")

  return (
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
            <h1 className="text-3xl font-bold text-foreground">Nueva Orden</h1>
            <p className="text-muted-foreground mt-2">Crea una nueva orden para un cliente</p>
          </div>
        </div>

        {/* Order Form */}
        <div className="max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Orden</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderForm />
            </CardContent>
          </Card>
        </div>
      </main>
  )
}
