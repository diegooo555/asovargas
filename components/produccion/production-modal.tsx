"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface AddProductionModalProps {
  clientId: string
  onProductionAdded?: () => void // callback para refrescar datos en el listado
}

export function AddProductionModal({ clientId, onProductionAdded }: AddProductionModalProps) {
  const [liters, setLiters] = useState("")
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const { error } = await supabase.from("production_records").insert([
        {
          client_id: clientId,
          liters: Number(liters),
          date,
        },
      ])

      if (error) throw error

      toast.success("Producción añadida correctamente")
      setLiters("")
      setDate("")

      if (onProductionAdded) onProductionAdded()
    } catch (err) {
      console.error(err)
      toast.error("Error al añadir producción")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Añadir Producción
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir Producción</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="liters">Litros</Label>
            <Input
              id="liters"
              type="number"
              min="0"
              step="0.01"
              value={liters}
              onChange={(e) => setLiters(e.target.value)}
              placeholder="Ej: 120.5"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading || !liters || !date}>
            {loading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
