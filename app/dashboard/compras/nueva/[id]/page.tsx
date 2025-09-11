import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BuyForm } from "@/components/compras/buy-form"

interface NewBuyPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function NewBuyPage({ params} : NewBuyPageProps) {
  const { id } = await params

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
            <h1 className="text-3xl font-bold text-foreground">Nueva Compra</h1>
            <p className="text-muted-foreground mt-2">Crea una nueva compra para un cliente</p>
          </div>
        </div>

        {/* Order Form */}
        <div className="max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Compra</CardTitle>
            </CardHeader>
            <CardContent>
              <BuyForm id={id} />
            </CardContent>
          </Card>
        </div>
      </main>
  )
}
