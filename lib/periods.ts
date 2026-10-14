/**
 * Shared sales-period logic used by both the server list (VentasList) and the
 * client PDF export (DownloadRemisionesPDF), so the on-screen filter and the
 * downloaded document can never disagree about a date boundary.
 *
 * There is no database dependency: periods are derived from the calendar.
 * Colombia has no DST, so boundaries use a fixed -05:00 offset. The end of a
 * range is always exclusive, so a boundary day belongs to exactly one period.
 */

export type PeriodScope = "month" | "q1" | "q2" | "year"

export const PERIOD_OPTIONS: {
  value: PeriodScope
  label: string
  needsMonth: boolean
}[] = [
  { value: "month", label: "Mes completo", needsMonth: true },
  { value: "q1", label: "1ra quincena (1–15)", needsMonth: true },
  { value: "q2", label: "2da quincena (16–fin de mes)", needsMonth: true },
  { value: "year", label: "Año completo", needsMonth: false },
]

const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
]

export interface PeriodRange {
  start: string
  endExclusive: string
  label: string
  scope: PeriodScope
  year: number
  month?: number
}

const pad = (n: number) => String(n).padStart(2, "0")

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function nextDayIso(year: number, month: number, lastDay: number): string {
  const next = new Date(year, month - 1, lastDay + 1)
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T00:00:00-05:00`
}

export function isPeriodScope(value: string | null | undefined): value is PeriodScope {
  return value === "month" || value === "q1" || value === "q2" || value === "year"
}

/**
 * Returns the [start, end) boundaries and a human label for a period, or null
 * when the parameters are missing/invalid. `year` defaults to the current year.
 */
export function resolvePeriodRange(
  yearStr?: string | null,
  monthStr?: string | null,
  periodStr?: string | null,
): PeriodRange | null {
  if (!isPeriodScope(periodStr)) return null

  const year = Number(yearStr) || new Date().getFullYear()
  const scope = periodStr

  if (scope === "year") {
    return {
      start: `${year}-01-01T00:00:00-05:00`,
      endExclusive: `${year + 1}-01-01T00:00:00-05:00`,
      label: `Año ${year}`,
      scope,
      year,
    }
  }

  const month = Number(monthStr)
  if (!Number.isInteger(month) || month < 1 || month > 12) return null

  const monthName = MONTH_NAMES[month - 1]
  const lastDay = new Date(year, month, 0).getDate()

  if (scope === "month") {
    return {
      start: `${year}-${pad(month)}-01T00:00:00-05:00`,
      endExclusive: nextDayIso(year, month, lastDay),
      label: `${capitalize(monthName)} ${year}`,
      scope,
      year,
      month,
    }
  }

  const startDay = scope === "q1" ? 1 : 16
  return {
    start: `${year}-${pad(month)}-${pad(startDay)}T00:00:00-05:00`,
    endExclusive: nextDayIso(year, month, lastDay),
    label: `${scope === "q1" ? "1ra quincena (1–15)" : "2da quincena (16–fin de mes)"} de ${monthName} ${year}`,
    scope,
    year,
    month,
  }
}

/** Slug suitable for a file name, e.g. "2da-quincena-de-agosto-2026". */
export function periodSlug(range: PeriodRange): string {
  return range.label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
