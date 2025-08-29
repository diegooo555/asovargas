"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface UserFormData {
  name: string
  type_client: "associate" | "buyer" | ""
}

export function UserForm() {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    type_client: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.type_client) {
        //toast
      return
    }

    setLoading(true)

    try {
      if (!supabase) {
        throw new Error("Supabase no está configurado")
      }

      const { data, error } = await supabase
        .from("clients")
        .insert([
          {
            name: formData.name.trim(),
            type_client: formData.type_client,
          },
        ])
        .select()
        .single()

      if (error) throw error

    //toast

      router.push(`/dashboard/usuarios/${data.client_id}`)
    } catch (error) {
      console.error("Error creating user:", error)
//toast
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre Completo</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Ingresa el nombre del usuario"
            required
          />
        </div>

        <div>
          <Label htmlFor="type_client">Tipo de Cliente</Label>
          <Select
            value={formData.type_client}
            onValueChange={(value: "associate" | "buyer") => setFormData((prev) => ({ ...prev, type_client: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona el tipo de cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="associate">Asociado</SelectItem>
              <SelectItem value="buyer">Comprador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            "Crear Usuario"
          )}
        </Button>
      </div>
    </form>
  )
}
