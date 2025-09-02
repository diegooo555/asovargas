"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"
import { BarChart3, Calendar, Droplets } from "lucide-react"
import { toast } from "sonner"

interface ProductionRecord {
  production_record_id: string
  liters: number
  date: string
  created_at: string
}

interface ProductionStats {
  totalLiters: number
  totalRecords: number
  averageLiters: number
  lastProduction: string | null
}

interface UserProductionHistoryProps {
  userId: string
}

export function UserProductionHistory({ userId }: UserProductionHistoryProps) {
  const [records, setRecords] = useState<ProductionRecord[]>([])
  const [stats, setStats] = useState<ProductionStats>({
    totalLiters: 0,
    totalRecords: 0,
    averageLiters: 0,
    lastProduction: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProductionHistory()
  }, [userId])

  const fetchProductionHistory = async () => {
    try {
      if (!supabase) {
        throw new Error("Supabase no está configurado")
      }

      const { data, error } = await supabase
        .from("production_records")
        .select("*")
        .eq("client_id", userId)
        .order("date", { ascending: false })

      if (error) throw error

      const productionRecords = data || []
      setRecords(productionRecords)

      // Calculate stats
      const totalLiters = productionRecords.reduce((sum, record) => sum + record.liters, 0)
      const totalRecords = productionRecords.length
      const averageLiters = totalRecords > 0 ? totalLiters / totalRecords : 0
      const lastProduction = productionRecords.length > 0 ? productionRecords[0].date : null

      setStats({
        totalLiters,
        totalRecords,
        averageLiters,
        lastProduction,
      })
    } catch (error) {
      console.error("Error fetching production history:", error)
      toast.error("Error al cargar el historial de producción")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Skeleton className="h-64 w-full" />
  }

  return (
    <div className="space-y-6">
      {/* Production Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Litros</CardTitle>
            <Droplets className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalLiters.toFixed(2)} L</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalRecords}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.averageLiters.toFixed(2)} L</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Producción</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-purple-600">
              {stats.lastProduction ? new Date(stats.lastProduction).toLocaleDateString() : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Production History Table */}
      {records.length === 0 ? (
        <div className="text-center py-8">
          <div className="flex flex-col items-center gap-2">
            <BarChart3 className="w-8 h-8 text-gray-400" />
            <p className="text-gray-500">No hay registros de producción para este usuario</p>
          </div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha de Producción</TableHead>
                <TableHead>Litros Producidos</TableHead>
                <TableHead>Fecha de Registro</TableHead>
                <TableHead className="text-right">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.production_record_id}>
                  <TableCell className="font-medium">
                    {new Date(record.date).toLocaleDateString("es-ES", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="font-semibold text-blue-600">{record.liters.toFixed(2)} L</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(record.created_at).toLocaleDateString("es-ES")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Registrado
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
