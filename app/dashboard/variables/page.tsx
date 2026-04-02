import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VariablesList } from "@/components/variables/variables-list"
import { Skeleton } from "@/components/ui/skeleton"
import { DownloadProductionPDF } from "@/components/produccion/download-production-pdf"

export default function VariablesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-800">Variables del Sistema</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las variables financieras y de configuración del sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-green-700">Variables Configuradas</CardTitle>
          <CardDescription>Lista de todas las variables del sistema con sus valores actuales</CardDescription>
          <DownloadProductionPDF/>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<VariablesListSkeleton />}>
            <VariablesList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function VariablesListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
      ))}
    </div>
  )
}
