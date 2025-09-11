import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User, CreditCard, Plus } from "lucide-react"
import Link from "next/link"
import { UserDetails } from "@/components/user-details"
import { UserDebts } from "@/components/user-debts"
import { Skeleton } from "@/components/ui/skeleton"
import { AddDebtDialog } from "@/components/add-debt-client" 

interface UserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;
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
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-green-900 mb-2">Detalles del Usuario</h1>
            <p className="text-green-700">Información completa y gestión de deudas</p>
          </div>
          
          <AddDebtDialog userId={id} />
        <Button className="bg-yellow-400 hover:bg-yellow-600">
          <Plus className="w-4 h-4 mr-2" />
          <Link href={`/dashboard/compras/nueva/${id}`}>Registrar Compra</Link>
        </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <User className="w-5 h-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                  <UserDetails userId={id} />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* User Debts */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <CreditCard className="w-5 h-5" />
                  Historial de Deudas
                </CardTitle>
                <CardDescription>Todas las deudas asociadas a este usuario</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                  <UserDebts userId={id} />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
