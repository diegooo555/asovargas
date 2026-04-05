import { PajillaForm } from "@/components/pajillas/pajilla-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

interface EditPajillaPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditPajillaPage({ params }: EditPajillaPageProps) {
  const supabase = createServerClient()
  const { id } = await params

  if (!supabase) {
    return <div>Error: Supabase no configurado</div>
  }

  const { data: pajilla, error } = await supabase.from("pajillas").select("*").eq("id", id).single()

  if (error || !pajilla) {
    notFound()
  }

  return (
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/pajillas">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Pajilla</h1>
            <p className="text-muted-foreground mt-2">Modifica la información de la pajilla</p>
          </div>
        </div>

        {/* Pajilla Form */}
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Pajilla</CardTitle>
            </CardHeader>
            <CardContent>
              <PajillaForm pajilla={pajilla} />
            </CardContent>
          </Card>
        </div>
      </main>
  )
}
