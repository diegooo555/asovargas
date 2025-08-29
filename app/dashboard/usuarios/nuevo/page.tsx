import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserForm } from "@/components/user-form"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NewUserPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" asChild>
            <Link href="/dashboard/usuarios">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-green-900 mb-2">Nuevo Usuario</h1>
            <p className="text-green-700">Crea un nuevo cliente en el sistema</p>
          </div>
        </div>

        {/* Form */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <UserPlus className="w-5 h-5" />
              Información del Usuario
            </CardTitle>
            <CardDescription>Completa los datos del nuevo cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
