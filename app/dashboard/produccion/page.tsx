'use client'

import { Suspense, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, AlertCircle, CheckCircle2, Settings } from "lucide-react"
import { UsersList } from "@/components/produccion/user-list"
import { Skeleton } from "@/components/ui/skeleton"
import { getCurrentFortnight } from "@/lib/supabase/client"
import { Fortnight } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function UsersPage() {
  const [fortnight, setFortnight] = useState<Fortnight | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCurrentFortnight()
      .then(setFortnight)
      .catch(() => setFortnight(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Fortnight Banner */}
        {loading ? (
          <Skeleton className="h-12 w-full mb-6" />
        ) : fortnight ? (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span className="text-green-800 font-medium">
              Quincena activa: {new Date(fortnight.start_date).toLocaleString("es-ES")} —{" "}
              {new Date(fortnight.end_date).toLocaleString("es-ES")}
            </span>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <span className="text-amber-800 font-medium">
                No se ha configurado la quincena. Ve a la página Quincena y configúrala
              </span>
            </div>
            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 shrink-0">
              <Link href="/dashboard/variables">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Link>
            </Button>
          </div>
        )}

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
              Lista de Producción por Usuario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <UsersList fortnight={fortnight} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
