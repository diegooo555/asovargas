import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PajillaForm } from "@/components/pajillas/pajilla-form"

export default function NewPajillaPage() {
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
            <h1 className="text-3xl font-bold text-foreground">Nueva Pajilla</h1>
            <p className="text-muted-foreground mt-2">Agrega una nueva pajilla de inseminación al inventario</p>
          </div>
        </div>

        {/* Pajilla Form */}
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Pajilla</CardTitle>
            </CardHeader>
            <CardContent>
              <PajillaForm />
            </CardContent>
          </Card>
        </div>
      </main>
  )
}
