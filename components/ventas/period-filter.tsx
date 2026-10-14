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
import { PERIOD_OPTIONS, resolvePeriodRange } from "@/lib/periods"

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

interface PeriodFilterProps {
  currentYear: number
}

export function PeriodFilter({ currentYear }: PeriodFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const year = searchParams.get("year") || String(currentYear)
  const month = searchParams.get("month") || ""
  const period = searchParams.get("period") || ""
  const isActive = Boolean(resolvePeriodRange(year, month, period))

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

  const handleMonth = (value: string) =>
    push({ year, month: value, period: period === "year" || !period ? "month" : period })

  const handlePeriod = (value: string) => {
    const updates: Record<string, string | null> = { year, period: value }
    // "Año completo" ignores the month; any other scope needs one, so fall back
    // to the current month when none is chosen yet.
    if (value !== "year" && !month) updates.month = String(new Date().getMonth() + 1)
    push(updates)
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mr-1 text-muted-foreground">
        <CalendarRange className="h-4 w-4" />
        <span className="text-sm font-medium">Clasificar por período</span>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Año</Label>
        <Select value={year} onValueChange={(v) => push({ year: v })}>
          <SelectTrigger className="w-[110px]">
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
        <Select value={month} onValueChange={handleMonth} disabled={period === "year"}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="—" />
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
        <Label className="text-xs text-muted-foreground">Período</Label>
        <Select value={period} onValueChange={handlePeriod}>
          <SelectTrigger className="w-[230px]">
            <SelectValue placeholder="Todo el historial" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
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
          onClick={() => push({ year: null, month: null, period: null })}
        >
          <X className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      )}
    </div>
  )
}
