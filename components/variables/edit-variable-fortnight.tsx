"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase/client"
import { toast } from "react-toastify"
import {  EditFortnightModalProps } from "@/lib/types"

export function EditVariableFortnight({ variable, isOpen, onClose, onSuccess }: EditFortnightModalProps) {
  const [detail, setDetail] = useState(variable.detail)
  const [date, setDate] = useState(variable.date_value)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from("fortnight_variables")
        .update({
          detail: detail.trim(),
          date_value: date,
        })
        .eq("variable_id", variable.variable_id)

      if (error) throw error

      toast.success("Variable actualizada exitosamente")

      onSuccess()
    } catch (error) {
      console.error("Error updating variable:", error)
      toast.error("No se pudo actualizar la variable")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-green-800">Editar Variable</DialogTitle>
          <DialogDescription>Modifica los valores de la variable del sistema</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="detail">Descripción</Label>
            <Textarea
              id="detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Descripción de la variable"
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Fecha</Label>
            <Input
              id="date_value"
              type="date"
              step="any"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
