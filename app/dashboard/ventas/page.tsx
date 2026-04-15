import { Suspense } from "react"
import { VentasList } from "@/components/ventas/ventas-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface VentasPageProps {
  searchParams: { page?: string }
}

export default function VentasPage({ searchParams }: VentasPageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1)

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Ventas</h1>
          <p className="text-muted-foreground mt-2">Administra todas las ventas y genera facturas</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/ventas/nueva">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Venta
          </Link>
        </Button>
      </div>

      {/* Sales List */}
      <Suspense fallback={<VentasLoadingSkeleton />}>
        <VentasList page={page} />
      </Suspense>
    </main>
  )
}

function VentasLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
