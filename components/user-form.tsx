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
  credits: number
  email: string
  phone: string
  address: string
  document: string
}

export function UserForm() {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    type_client: "",
    credits: 0,
    email: "",
    phone: "",
    address: "",
    document: ""
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.type_client || !formData.document.trim()) {
      //toast
      return
    }

    // Validación rápida del teléfono (10 dígitos)
    if (!/^\d{10}$/.test(formData.phone)) {
      console.error("El teléfono debe tener exactamente 10 dígitos")
      //toast
      return
    }

    setLoading(true)

    try {
      if (!supabase) throw new Error("Supabase no está configurado")

      const validateCredits = formData.type_client === "associate" ? formData.credits : 0

      const { data, error } = await supabase
        .from("clients")
        .insert([
          {
            name: formData.name.trim(),
            type_client: formData.type_client,
            credits: validateCredits,
            email: formData.email.trim() || null,
            phone: formData.phone.trim(),
            address: formData.address.trim() || null,
            document: formData.document.trim()
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
            className="my-3"
          />
        </div>

        <div>
          <Label htmlFor="cedula">Número de Cédula</Label>
          <Input
            id="cedula"
            type="text"
            value={formData.document}
            onChange={(e) => setFormData((prev) => ({ ...prev, document: e.target.value }))}
            placeholder="Ingresa la cédula"
            required
            className="my-3"
          />
        </div>

        <div>
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="usuario@ejemplo.com"
            className="my-3"
          />
        </div>

        <div>
          <Label htmlFor="phone">Teléfono Celular</Label>
          <Input
            id="phone"
            type="tel"
            pattern="[0-9]{10}"
            maxLength={10}
            value={formData.phone}
            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="Ej: 3101234567"
            
            className="my-3"
          />
        </div>

        <div>
          <Label htmlFor="address">Dirección</Label>
          <Input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="Ingresa la dirección"
            className="my-3"
          />
        </div>

        <div>
          <Label htmlFor="type_client" className="my-3">Tipo de Cliente</Label>
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

        {formData.type_client === "associate" && (
          <div>
            <Label htmlFor="credits">Créditos Mes</Label>
            <Input
              id="credits"
              type="number"
              value={formData.credits}
              onChange={(e) => setFormData((prev) => ({ ...prev, credits: parseFloat(e.target.value) || 0 }))}
              placeholder="Total Créditos"
              className="my-3"
              required
            />
          </div>
        )}
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
