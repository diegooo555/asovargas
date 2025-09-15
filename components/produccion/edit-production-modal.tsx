"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2, Save, X } from "lucide-react"

interface ProductionRecord {
  production_record_id: string
  client_id: string
  liters: number
  production_datetime: string
  created_at: string
  updated_at: string
}

interface EditProductionModalProps {
  isOpen: boolean
  onClose: () => void
  record: ProductionRecord
  onSuccess: () => void
}

function getLocalDateTime() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000 // diferencia con UTC en ms
  const local = new Date(now.getTime() - offset) // ajusta a hora local
  return local.toISOString().slice(0, 16) // yyyy-MM-ddTHH:mm
}


export function EditProductionModal({ isOpen, onClose, record, onSuccess }: EditProductionModalProps) {
  const [liters, setLiters] = useState(record.liters.toString())
  const [date, setDate] = useState(getLocalDateTime())
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!liters || !date) {
      toast.error("Por favor completa todos los campos")
      return
    }

    const litersNumber = Number.parseFloat(liters)
    if (isNaN(litersNumber) || litersNumber <= 0) {
      toast.error("Los litros deben ser un número válido mayor a 0")
      return
    }

    setIsLoading(true)

    try {
      if (!supabase) {
        throw new Error("Supabase no está configurado")
      }

      const utcISO = new Date(
        date.length === 16
          ? `${date}:00` // "YYYY-MM-DDTHH:mm:ss"
          : date
      ).toISOString(); // -> "YYYY-MM-DDTHH:mm:ss.sssZ" (UTC)       

      const { error } = await supabase
        .from("production_records")
        .update({
          liters: litersNumber,
          production_datetime: utcISO,
        })
        .eq("production_record_id", record.production_record_id)

      if (error) throw error

      toast.success("Registro de producción actualizado exitosamente")
      onSuccess()
    } catch (error) {
      console.error("Error updating production record:", error)
      toast.error("Error al actualizar el registro de producción")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-green-700">Editar Registro de Producción</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="liters">Litros Producidos</Label>
            <Input
              id="liters"
              type="number"
              step="0.01"
              min="0.01"
              value={liters}
              onChange={(e) => setLiters(e.target.value)}
              placeholder="Ingresa los litros"
              className="focus:border-green-500 focus:ring-green-500"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Fecha de Producción</Label>
            <Input
              id="production_datetime"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="focus:border-green-500 focus:ring-green-500"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar Cambios
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
