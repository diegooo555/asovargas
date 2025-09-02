"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Users } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import { AddProductionModal } from "./production-modal"
import { toast } from "sonner"

interface Client {
  client_id: string
  name: string
  type_client: "associate" | "buyer"
  total_liters?: number
}

export function UsersList() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchClients()
  }, [])

  type SupabaseClientRow = {
    client_id: string
    name: string
    type_client: "associate" | "buyer"
    production_records?: { liters?: number }[]
  }

  const fetchClients = async () => {
    try {
      if (!supabase) {
        throw new Error("Supabase no está configurado")
      }

      const { data, error } = await supabase
        .from("clients")
        .select(`
          client_id,
          name,
          type_client,
          production_records (liters)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const processedClients =
        (data as SupabaseClientRow[] | null)?.map((client) => {
          const totalLiters =
            client.production_records?.reduce((sum: number, record: any) => sum + (record.liters || 0), 0) || 0
          return {
            client_id: client.client_id,
            name: client.name,
            type_client: client.type_client,
            total_liters: totalLiters,
          }
        }) || []

      setClients(processedClients)
    } catch (error) {
      console.error("Error fetching clients:", error)
      toast.error("Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Total Producción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="w-8 h-8 text-gray-400" />
                    <p className="text-gray-500">No se encontraron usuarios</p>
                    <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                      <Link href="/dashboard/usuarios/nuevo">
                        <Plus className="w-4 h-4 mr-2" />
                        Crear primer usuario
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow
                  key={client.client_id}
                  className="cursor-pointer hover:bg-green-50 transition-colors"
                  onClick={() => (window.location.href = `/dashboard/produccion/${client.client_id}`)}
                >
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.type_client === "associate" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {client.type_client === "associate" ? "Asociado" : "Comprador"}
                    </span>
                  </TableCell>
                  <TableCell className="text-left font-medium">{client.total_liters?.toFixed(2) || "0.00"} L</TableCell>
                  <TableCell className="text-right">
                    <div onClick={(e) => e.stopPropagation()}>
                      <AddProductionModal clientId={client.client_id} clientName={client.name} onProductionAdded={fetchClients} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
