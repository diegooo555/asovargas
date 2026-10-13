"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarRange, X } from "lucide-react"

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

const QUINCENAS = [
  { value: "1", label: "1ra quincena (1–15)" },
  { value: "2", label: "2da quincena (16–fin de mes)" },
]

interface QuincenaFilterProps {
  currentYear: number
}

export function QuincenaFilter({ currentYear }: QuincenaFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const year = searchParams.get("year") || String(currentYear)
  const month = searchParams.get("month") || ""
  const quincena = searchParams.get("quincena") || ""
  const isActive = Boolean(month && quincena)

  const push = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    params.delete("page")
    const qs = params.toString()
    router.push(`/dashboard/ventas${qs ? `?${qs}` : ""}`)
  }

  const years = [currentYear, currentYear - 1, currentYear - 2]

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mr-1 text-muted-foreground">
        <CalendarRange className="h-4 w-4" />
        <span className="text-sm font-medium">Clasificar por quincena</span>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Año</Label>
        <Select value={year} onValueChange={(v) => push({ year: v })}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Mes</Label>
        <Select
          value={month}
          onValueChange={(v) => push({ year, month: v, quincena: quincena || "1" })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Todos los meses" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((label, i) => (
              <SelectItem key={label} value={String(i + 1)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Quincena</Label>
        <Select
          value={quincena}
          onValueChange={(v) => push({ year, month, quincena: v })}
          disabled={!month}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Selecciona un mes" />
          </SelectTrigger>
          <SelectContent>
            {QUINCENAS.map((q) => (
              <SelectItem key={q.value} value={q.value}>
                {q.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isActive && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => push({ month: null, quincena: null, year: null })}
        >
          <X className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      )}
    </div>
  )
}
