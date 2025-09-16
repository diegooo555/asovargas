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

interface Variable {
  variable_id: number
  detail: string
  amount: number
  created_at: string
  updated_at: string
}

interface EditVariableModalProps {
  variable: Variable
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditVariableModal({ variable, isOpen, onClose, onSuccess }: EditVariableModalProps) {
  const [detail, setDetail] = useState(variable.detail)
  const [amount, setAmount] = useState(variable.amount.toString())
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const numericAmount = Number.parseFloat(amount)

      if (isNaN(numericAmount)) {
        toast("El monto debe ser un número válido")
        return
      }

      const { error } = await supabase
        .from("variables")
        .update({
          detail: detail.trim(),
          amount: numericAmount,
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
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
            <p className="text-xs text-gray-500">Acepta decimales (ej: 0.0004) y números grandes (ej: 1000000)</p>
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
