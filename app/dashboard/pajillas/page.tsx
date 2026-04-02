import { Suspense } from "react"
import { PajillasList } from "@/components/pajillas/pajillas-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function PajillasPage() {
  return (
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestión de Pajillas</h1>
            <p className="text-muted-foreground mt-2">Administra tu inventario de pajillas de inseminación</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/pajillas/nueva">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Pajilla
            </Link>
          </Button>
        </div>

        {/* Pajillas List */}
        <Suspense fallback={<PajillasLoadingSkeleton />}>
          <PajillasList />
        </Suspense>
      </main>
  )
}

function PajillasLoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pajillas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
