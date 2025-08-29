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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface AddDebtDialogProps {
  userId: string
}

interface DebtFormData {
  description: string
  total: string
  date: string
}

export function AddDebtDialog({ userId }: AddDebtDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<DebtFormData>({
    description: "",
    total: "",
    date: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.description.trim() || !formData.total || !formData.date) {
//toast
      return
    }

    const totalAmount = Number.parseFloat(formData.total)
    if (isNaN(totalAmount) || totalAmount <= 0) {
//toast
      return
    }

    setLoading(true)

    try {
      if (!supabase) {
        throw new Error("Supabase no está configurado")
      }

      const { error } = await supabase.from("debts").insert([
        {
          client_id: userId,
          description: formData.description.trim(),
          total: totalAmount,
          date: formData.date,
          status: "pending",
        },
      ])

      if (error) throw error
      //toast

      setFormData({
        description: "",
        total: "",
        date: new Date().toISOString().split("T")[0],
      })
      setOpen(false)

      window.location.reload()
    } catch (error) {
      console.error("Error adding debt:", error)
        //toast
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Añadir Deuda
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Deuda</DialogTitle>
          <DialogDescription>Registra una nueva deuda para este usuario</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe el motivo de la deuda..."
              required
            />
          </div>

          <div>
            <Label htmlFor="total">Monto</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              min="0"
              value={formData.total}
              onChange={(e) => setFormData((prev) => ({ ...prev, total: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Añadiendo...
                </>
              ) : (
                "Añadir Deuda"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
