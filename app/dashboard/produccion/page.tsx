import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { UsersList } from "@/components/produccion/user-list"
import { Skeleton } from "@/components/ui/skeleton"

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-900 mb-2">Gestión de Producción</h1>
            <p className="text-green-700">Administra la producción de usuarios</p>
          </div>
        </div>


        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Users className="w-5 h-5" />
              Lista de Usuarios
            </CardTitle>
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
