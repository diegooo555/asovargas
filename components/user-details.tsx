"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase/client"
import { Client, UserDetailsProps } from "@/lib/types"

export function UserDetails({ userId }: UserDetailsProps) {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClient()
  }, [userId])

  const fetchClient = async () => {
    try {
      if (!supabase) {
        throw new Error("Supabase no está configurado")
      }

      const { data, error } = await supabase.from("clients").select("*").eq("client_id", userId).single()

      if (error) throw error
      setClient(data)
    } catch (error) {
      console.error("Error fetching client:", error)
        //toast
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    )
  }

  if (!client) {
    return <div className="text-center text-gray-500">Usuario no encontrado</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg text-green-900">{client.name}</h3>
        <Badge variant={client.type_client === "associate" ? "default" : "secondary"} className="mt-2">
          {client.type_client === "associate" ? "Asociado" : "Comprador"}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-gray-600">ID:</span>
          <span className="ml-2 text-green-900 font-bold">{client.client_id}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Documento:</span>
          <span className="ml-2 text-green-900 font-bold">{client.document}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Telefono:</span>
          <span className="ml-2 text-green-900 font-bold">{client.phone}</span>
        </div>        
        <div>
          <span className="font-medium text-gray-600">Dirección</span>
          <span className="ml-2 text-green-900 font-bold">{client.address}</span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Tope Credito:</span>
          <span className="ml-2 text-green-900 font-bold">{client.credits}</span>
        </div>              
        <div>
          <span className="font-medium text-gray-600">Fecha de registro:</span>
          <span className="ml-2">{new Date(client.created_at).toLocaleDateString()}</span>
        </div>
        
      </div>
    </div>
  )
}
