"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, DollarSign, Settings, AlertCircle, CheckCircle2, Lock, LogOut } from "lucide-react"
import { getCurrentFortnight, upsertFortnight, finishFortnight } from "@/lib/supabase/client"
import { Fortnight } from "@/lib/types"
import { toast } from "react-toastify"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

function toDatetimeLocal(iso: string) {
  const d = new Date(iso)
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

export default function VariablesPage() {
  const [fortnight, setFortnight] = useState<Fortnight | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [priceAssociate, setPriceAssociate] = useState("")
  const [priceBuyer, setPriceBuyer] = useState("")
  const [sostenimiento, setSostenimiento] = useState("")
  const [finishOpen, setFinishOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    loadCurrentFortnight()
  }, [])

  const loadCurrentFortnight = async () => {
    try {
      setLoading(true)
      const data = await getCurrentFortnight()
      setFortnight(data)
      if (data) {
        setStartDate(toDatetimeLocal(data.start_date))
        setEndDate(toDatetimeLocal(data.end_date))
        setPriceAssociate(String(data.price_liter_associate))
        setPriceBuyer(String(data.price_liter_buyer))
        setSostenimiento(String(data.sostenimiento_fee))
      }
    } catch {
      toast.error("Error al cargar la quincena actual")
    } finally {
      setLoading(false)
    }
  }

  const handleFinishFortnight = async () => {
    if (password !== "asovargassoftware") {
      toast.error("Contraseña incorrecta")
      return
    }
    if (!fortnight) return

    try {
      setFinishing(true)
      await finishFortnight(fortnight.id)
      toast.success("Quincena finalizada")
      setFinishOpen(false)
      setPassword("")
      await loadCurrentFortnight()
    } catch {
      toast.error("Error al finalizar la quincena")
    } finally {
      setFinishing(false)
    }
  }

  const handleSave = async () => {
    if (!startDate || !endDate || !priceAssociate || !priceBuyer) {
      toast.error("Completa todos los campos obligatorios")
      return
    }

    try {
      setSaving(true)
      await upsertFortnight({
        id: fortnight?.id,
        start_date: startDate,
        end_date: endDate,
        price_liter_associate: Number(priceAssociate),
        price_liter_buyer: Number(priceBuyer),
        sostenimiento_fee: Number(sostenimiento || 0),
      })
      toast.success(fortnight ? "Quincena actualizada" : "Quincena creada")
      await loadCurrentFortnight()
    } catch {
      toast.error("Error al guardar la quincena")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-64 w-full" />
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-green-900">Configuración de Quincena</h1>
          <p className="text-green-700 mt-2">Administra los parámetros de la quincena actual</p>
        </div>
      </div>

      {fortnight && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">
            Quincena activa: {new Date(fortnight.start_date).toLocaleString("es-ES")} —{" "}
            {new Date(fortnight.end_date).toLocaleString("es-ES")}
          </span>
        </div>
      )}

      {!fortnight && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span className="text-amber-800 font-medium">
            No hay una quincena activa. Configúrala a continuación.
          </span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Settings className="w-5 h-5" />
            Parámetros de la Quincena
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Fecha de Inicio
              </Label>
              <Input id="startDate" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Fecha de Fin
              </Label>
              <Input id="endDate" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceAssociate" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Precio Litro Asociado
              </Label>
              <Input
                id="priceAssociate"
                type="number"
                step="0.01"
                value={priceAssociate}
                onChange={(e) => setPriceAssociate(e.target.value)}
                placeholder="Ej: 2000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceBuyer" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Precio Litro Comprador
              </Label>
              <Input
                id="priceBuyer"
                type="number"
                step="0.01"
                value={priceBuyer}
                onChange={(e) => setPriceBuyer(e.target.value)}
                placeholder="Ej: 1800"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sostenimiento" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Cuota Sostenimiento
              </Label>
              <Input
                id="sostenimiento"
                type="number"
                step="0.01"
                value={sostenimiento}
                onChange={(e) => setSostenimiento(e.target.value)}
                placeholder="Ej: 50000"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? "Guardando..." : fortnight ? "Actualizar Quincena" : "Crear Quincena"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {fortnight && (
        <div className="mt-6 flex justify-end">
          <Button
            variant="destructive"
            onClick={() => setFinishOpen(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Finalizar Quincena
          </Button>
        </div>
      )}

      <Dialog open={finishOpen} onOpenChange={setFinishOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Lock className="w-5 h-5" />
              Finalizar Quincena
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">Ingresa la contraseña para finalizar la quincena actual.</p>
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFinishOpen(false); setPassword("") }}>
              Cancelar
            </Button>
            <Button
              onClick={handleFinishFortnight}
              disabled={finishing || !password}
              className="bg-red-600 hover:bg-red-700"
            >
              {finishing ? "Finalizando..." : "Finalizar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
