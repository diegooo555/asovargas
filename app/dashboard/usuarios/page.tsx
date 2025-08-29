import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users } from "lucide-react"
import Link from "next/link"
import { UsersList } from "@/components/users-list"
import { UsersStats } from "@/components/users-stats"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/dashboard-header"

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-900 mb-2">Gestión de Usuarios</h1>
            <p className="text-green-700">Administra clientes y sus deudas</p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/dashboard/usuarios/nuevo">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Usuario
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <Suspense fallback={<Skeleton className="h-32 w-full mb-8" />}>
          <UsersStats />
        </Suspense>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Users className="w-5 h-5" />
              Lista de Usuarios
            </CardTitle>
            <CardDescription>Gestiona todos los usuarios del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <UsersList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
