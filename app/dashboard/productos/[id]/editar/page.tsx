import { ProductForm } from "@/components/produccion/product-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface EditProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const supabase = createServerClient()
  const { id } = await params

  if (!supabase) {
    return <div>Error: Supabase no configurado</div>
  }

  const { data: product, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error || !product) {
    notFound()
  }

  return (
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/productos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Producto</h1>
            <p className="text-muted-foreground mt-2">Modifica la información del producto</p>
          </div>
        </div>

        {/* Product Form */}
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Información del Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductForm product={product} />
            </CardContent>
          </Card>
        </div>
      </main>
  )
}
