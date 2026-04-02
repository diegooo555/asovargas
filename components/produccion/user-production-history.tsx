"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Calendar, CircleMinus, DollarSign, Droplets, Edit } from "lucide-react"
import { toast } from "react-toastify"
import { Button } from "../ui/button"
import { EditProductionModal } from "./edit-production-modal"
import { ProductionRecord, UserProductionHistoryProps } from "@/lib/types"
import { dataUserProduction } from "@/hooks/use-client"
import { CardItem } from "./card-item"

export function UserProductionHistory({ userId }: UserProductionHistoryProps) {
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)


  const {
    client,
    variables,
    records, 
    variablesFortnight,
    cLoading,
    vLoading,
    rLoading,
    fLoading,
    cErr,
    vErr,
    rError,
    fErr
  } = dataUserProduction(userId)

  const handleEditRecord = (record: ProductionRecord) => {
    setEditingRecord(record)
    setIsEditModalOpen(true)
  }

  const handleEditSuccess = () => {
    setIsEditModalOpen(false)
    setEditingRecord(null)
  }

  if(cErr || vErr || rError || fErr) toast.error("Error al obtener los datos")

  if (cLoading || vLoading || rLoading || fLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  return (
    <div className="space-y-6">
      {/* Production Stats */}
      <header className="flex justify-around">
        <h1 className="font-bold text-black text-xl">{client?.name.toUpperCase()}</h1>
        <h2 className="font-bold text-black text-xl">CODIGO INTERNO: {client?.document}</h2>
        <h2 className="font-bold text-black text-xl">FECHA EMISION: {new Date().toISOString().split('T')[0]}</h2>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardItem
          title="Total Litros"
          icon={<Droplets className="h-4 w-4 text-blue-600" />}
          children={<div className="text-2xl font-bold text-blue-600">{records!.reduce((sum, record) => sum + record.liters, 0).toFixed(2)} L</div>}
        />        

        <CardItem
          title="Inicio Quincena"
          icon={<BarChart3 className="h-4 w-4 text-green-600" />}
          children={<div className="text-2xl font-bold text-green-600">{variablesFortnight![0]?.date_value}</div>}
        />

        <CardItem
          title="Fin Quincena"
          icon={<BarChart3 className="h-4 w-4 text-green-600" />}
          children={<div className="text-2xl font-bold text-green-600">{variablesFortnight![1]?.date_value}</div>}
        />

        <CardItem
          title="Precio Litro"
          icon={<DollarSign className="h-4 w-4 text-blue-600" />}
          children={
            <div className="text-2xl font-bold text-blue-600">
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
              }).format(client?.type_client === "associate" ? variables![0]?.amount : variables![1]?.amount)}
            </div>}
        />        
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardItem
          title="Cuota Sostenimiento"
          icon={<CircleMinus className="h-4 w-4 text-red-600"/>}
          children={
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
              }).format(client?.type_client === "associate" ? variables![2]?.amount : 0)}
            </div>           
          }
        />  
      </div>

      {/* Production History Table */}
      {records!.length === 0 ? (
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
              {records!.map((record) => (
                <TableRow key={record.production_record_id}>
                  <TableCell className="font-medium">
                    {new Date(record.production_datetime).toLocaleString("es-ES", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour12: true,
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "America/Bogota",
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
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRecord(record)}
                      className="hover:bg-green-50 hover:border-green-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>                  
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editingRecord && (
        <EditProductionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          record={editingRecord}
          onSuccess={handleEditSuccess}
        />
      )}      
    </div>
  )
}
