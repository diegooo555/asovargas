"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarRange, Download, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "react-toastify"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import {
  PERIOD_OPTIONS,
  resolvePeriodRange,
  resolvePeriodSpan,
  periodSpanSlug,
  slugify,
  type PeriodScope,
} from "@/lib/periods"

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

const PRIMARY: [number, number, number] = [22, 101, 52] // Tailwind green-800
const GRAY: [number, number, number] = [110, 110, 110]
const MARGIN = 12

const SALE_TYPE_LABELS: Record<string, string> = {
  contado: "Contado",
  transferencia: "Transferencia",
  credito: "Crédito",
}

const money = (n: number | null | undefined) =>
  `$${(n || 0).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

function truncate(pdf: jsPDF, text: string, maxWidth: number): string {
  if (pdf.getTextWidth(text) <= maxWidth) return text
  let result = text
  while (result.length > 1 && pdf.getTextWidth(`${result}…`) > maxWidth) {
    result = result.slice(0, -1)
  }
  return `${result}…`
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch("/asovargasLogo.png")
    const blob = await response.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

interface RemisionData {
  buy: any
  items: any[]
  pajillaItems: any[]
  logoDataUrl: string | null
}

function renderRemision(pdf: jsPDF, { buy, items, pajillaItems, logoDataUrl }: RemisionData) {
  const pageWidth = pdf.internal.pageSize.width
  const pageHeight = pdf.internal.pageSize.height
  const contentWidth = pageWidth - MARGIN * 2
  const client = buy.clients || {}
  let y = MARGIN

  // ---- Header ----
  const textX = logoDataUrl ? MARGIN + 14 : MARGIN
  if (logoDataUrl) {
    try {
      pdf.addImage(logoDataUrl, "PNG", MARGIN, y, 12, 12)
    } catch {
      // Logo is decorative: ignore failures.
    }
  }
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(13)
  pdf.setTextColor(...PRIMARY)
  pdf.text("ASOVARGAS NIT 900851910", textX, y + 4)
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(8)
  pdf.setTextColor(...GRAY)
  pdf.text("Asociación Agroturística Pantano de Vargas", textX, y + 8.5)

  const created = new Date(buy.created_at)
  const dateStr = created.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" })
  const timeStr = created.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })

  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(11)
  pdf.setTextColor(0, 0, 0)
  pdf.text(`REMISIÓN N° ${buy.buy_number}`, pageWidth - MARGIN, y + 4, { align: "right" })
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(8)
  pdf.setTextColor(...GRAY)
  pdf.text(`${dateStr} — ${timeStr}`, pageWidth - MARGIN, y + 8.5, { align: "right" })
  pdf.setFont("helvetica", "bold")
  pdf.setTextColor(...PRIMARY)
  pdf.text(SALE_TYPE_LABELS[buy.sale_type] || buy.sale_type || "—", pageWidth - MARGIN, y + 13, { align: "right" })

  y += 15
  pdf.setDrawColor(...PRIMARY)
  pdf.setLineWidth(0.4)
  pdf.line(MARGIN, y, pageWidth - MARGIN, y)
  y += 4

  // ---- Buyer info ----
  pdf.setFillColor(245, 245, 245)
  pdf.rect(MARGIN, y, contentWidth, 8, "F")
  const fields = [
    ["Nombre", client.name],
    ["Documento", client.document],
    ["Teléfono", client.phone],
    ["Dirección", client.address],
  ]
  const colW = contentWidth / 4
  pdf.setFontSize(8)
  fields.forEach(([label, value], i) => {
    const cx = MARGIN + 2 + i * colW
    const labelText = `${label}: `
    pdf.setFont("helvetica", "bold")
    pdf.setTextColor(...GRAY)
    pdf.text(labelText, cx, y + 5)
    const labelW = pdf.getTextWidth(labelText)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(30, 30, 30)
    pdf.text(truncate(pdf, String(value || "—"), colW - labelW - 4), cx + labelW, y + 5)
  })
  y += 12

  // ---- Products ----
  const productsTotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0)
  const pajillasTotal = pajillaItems.reduce((sum, item) => sum + (item.total_price || 0), 0)

  if (items.length > 0) {
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(8)
    pdf.setTextColor(...PRIMARY)
    pdf.text("PRODUCTOS", MARGIN, y)
    autoTable(pdf, {
      startY: y + 1.5,
      margin: { left: MARGIN, right: MARGIN },
      head: [["#", "Producto", "Empresa", "Cant.", "P. Unit.", "Total"]],
      body: items.map((item, i) => [
        String(i + 1),
        item.products?.name || "Producto eliminado",
        item.products?.company || "—",
        String(item.quantity),
        money(item.unit_price),
        money(item.total_price),
      ]),
      foot: [["", "", "", "", "Subtotal productos", money(productsTotal)]],
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1.2, lineColor: [220, 220, 220], lineWidth: 0.1 },
      headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 8 },
        3: { cellWidth: 14, halign: "right" },
        4: { cellWidth: 24, halign: "right" },
        5: { cellWidth: 26, halign: "right" },
      },
    })
    y = (pdf as any).lastAutoTable.finalY + 6
  }

  // ---- Pajillas ----
  if (pajillaItems.length > 0) {
    pdf.setFont("helvetica", "bold")
    pdf.setFontSize(8)
    pdf.setTextColor(...PRIMARY)
    pdf.text("PAJILLAS DE INSEMINACIÓN", MARGIN, y)
    autoTable(pdf, {
      startY: y + 1.5,
      margin: { left: MARGIN, right: MARGIN },
      head: [["#", "Toro", "Raza", "Empresa", "Cant.", "P. Unit.", "Total"]],
      body: pajillaItems.map((item, i) => [
        String(i + 1),
        item.pajillas?.bull_name || "Pajilla eliminada",
        item.pajillas?.breed || "—",
        item.pajillas?.company || "—",
        String(item.quantity),
        money(item.unit_price),
        money(item.total_price),
      ]),
      foot: [["", "", "", "", "", "Subtotal pajillas", money(pajillasTotal)]],
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 1.2, lineColor: [220, 220, 220], lineWidth: 0.1 },
      headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold" },
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: "bold" },
      columnStyles: {
        0: { cellWidth: 8 },
        4: { cellWidth: 12, halign: "right" },
        5: { cellWidth: 22, halign: "right" },
        6: { cellWidth: 24, halign: "right" },
      },
    })
    y = (pdf as any).lastAutoTable.finalY + 6
  }

  // ---- Total ----
  const grandTotal = buy.total_amount ?? productsTotal + pajillasTotal
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(11)
  pdf.setTextColor(...PRIMARY)
  pdf.text(`TOTAL: ${money(grandTotal)}`, pageWidth - MARGIN, y + 3, { align: "right" })
  y += 10

  // ---- Signatures ----
  if (y > pageHeight - 55) {
    pdf.addPage()
    y = MARGIN + 5
  }
  const half = contentWidth / 2
  const sigY = y + 14
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.2)
  pdf.line(MARGIN + 10, sigY, MARGIN + half - 10, sigY)
  pdf.line(MARGIN + half + 10, sigY, pageWidth - MARGIN - 10, sigY)
  pdf.setFont("helvetica", "bold")
  pdf.setFontSize(8)
  pdf.setTextColor(0, 0, 0)
  pdf.text("Firma del Vendedor", MARGIN + half / 2, sigY + 4, { align: "center" })
  pdf.text("Firma del Comprador", MARGIN + half + half / 2, sigY + 4, { align: "center" })
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(7)
  pdf.setTextColor(...GRAY)
  pdf.text("Nombre: ___________________", MARGIN + half / 2, sigY + 8, { align: "center" })
  pdf.text("C.C.: ___________________", MARGIN + half / 2, sigY + 11.5, { align: "center" })
  pdf.text(
    truncate(pdf, `Nombre: ${client.name || "___________________"}`, half - 20),
    MARGIN + half + half / 2,
    sigY + 8,
    { align: "center" },
  )
  pdf.text(
    `C.C.: ${client.document || "___________________"}`,
    MARGIN + half + half / 2,
    sigY + 11.5,
    { align: "center" },
  )

  // ---- Page footer ----
  pdf.setFont("helvetica", "normal")
  pdf.setFontSize(7)
  pdf.setTextColor(...GRAY)
  pdf.text(`Gracias por su compra — ASOVARGAS © ${new Date().getFullYear()}`, pageWidth / 2, pageHeight - 10, {
    align: "center",
  })
}

interface ClientOption {
  client_id: string
  name: string
  document: string | null
}

interface PeriodPickerValue {
  year: string
  month: string
  scope: PeriodScope
}

interface DownloadRemisionesPDFProps {
  currentYear: number
  clients?: ClientOption[]
}

export function DownloadRemisionesPDF({ currentYear, clients = [] }: DownloadRemisionesPDFProps) {
  const searchParams = useSearchParams()
  const [isGenerating, setIsGenerating] = useState(false)
  const [clientId, setClientId] = useState("")

  // Seed the pickers from the on-screen period filter so "download what I see"
  // stays the default, while still letting the user widen the range here.
  const initialRange = resolvePeriodRange(
    searchParams.get("year") || String(currentYear),
    searchParams.get("month"),
    searchParams.get("period"),
  )
  const initialPicker: PeriodPickerValue = {
    year: String(initialRange?.year ?? currentYear),
    month: String(initialRange?.month ?? new Date().getMonth() + 1),
    scope: initialRange?.scope ?? "month",
  }

  const [from, setFrom] = useState<PeriodPickerValue>(initialPicker)
  const [to, setTo] = useState<PeriodPickerValue>(initialPicker)

  const span = resolvePeriodSpan(
    from.year,
    from.month,
    from.scope,
    to.year,
    to.month,
    to.scope,
  )

  const years = Array.from(
    new Set([
      currentYear,
      currentYear - 1,
      currentYear - 2,
      Number(from.year),
      Number(to.year),
    ]),
  )
    .filter((y) => Number.isFinite(y))
    .sort((a, b) => b - a)

  const selectedClient = clients.find((c) => c.client_id === clientId)

  const handleDownload = async () => {
    if (!span) {
      toast.error("El período final debe ser igual o posterior al inicial")
      return
    }
    if (!supabase) {
      toast.error("Supabase no está configurado")
      return
    }

    setIsGenerating(true)
    try {
      let query = supabase
        .from("buys")
        .select(`*, clients (*)`)
        .gte("created_at", span.start)
        .lt("created_at", span.endExclusive)

      if (clientId) query = query.eq("client_id", clientId)

      const { data, error } = await query.order("created_at", { ascending: true })

      if (error) throw error
      const buys = (data || []) as any[]
      if (buys.length === 0) {
        toast.info("No hay ventas en el período seleccionado")
        return
      }

      const ids = buys.map((b: any) => b.id)
      const [{ data: itemsData }, { data: pajillaItemsData }] = await Promise.all([
        supabase.from("buy_items").select(`*, products (name, company)`).in("buy_id", ids),
        supabase.from("buy_pajilla_items").select(`*, pajillas (bull_name, breed, company)`).in("buy_id", ids),
      ])

      const itemsByBuy = new Map<string, any[]>()
      for (const item of (itemsData || []) as any[]) {
        const list = itemsByBuy.get(item.buy_id) || []
        list.push(item)
        itemsByBuy.set(item.buy_id, list)
      }
      const pajillasByBuy = new Map<string, any[]>()
      for (const item of (pajillaItemsData || []) as any[]) {
        const list = pajillasByBuy.get(item.buy_id) || []
        list.push(item)
        pajillasByBuy.set(item.buy_id, list)
      }

      const logoDataUrl = await loadLogoDataUrl()
      const pdf = new jsPDF({ unit: "mm", format: "letter" })

      buys.forEach((buy: any, index: number) => {
        if (index > 0) pdf.addPage()
        renderRemision(pdf, {
          buy,
          items: itemsByBuy.get(buy.id) || [],
          pajillaItems: pajillasByBuy.get(buy.id) || [],
          logoDataUrl,
        })
      })

      const footerLabel = selectedClient ? `${span.label} · ${selectedClient.name}` : span.label
      const fileSlug = `${selectedClient ? `${slugify(selectedClient.name)}-` : ""}${periodSpanSlug(span)}`

      const pageCount = pdf.getNumberOfPages()
      const pageWidth = pdf.internal.pageSize.width
      const pageHeight = pdf.internal.pageSize.height
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text(`Página ${i} de ${pageCount}`, MARGIN, pageHeight - 5)
        pdf.text(truncate(pdf, footerLabel, 120), pageWidth - MARGIN, pageHeight - 5, { align: "right" })
      }

      pdf.save(`remisiones-${fileSlug}.pdf`)
      toast.success(`${buys.length} remisión(es) descargada(s)`)
    } catch (error) {
      console.error("Error al generar el PDF de remisiones:", error)
      toast.error("Error al generar el PDF de remisiones")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 mr-1 self-center text-muted-foreground">
        <CalendarRange className="h-4 w-4" />
        <span className="text-sm font-medium">Descargar remisiones</span>
      </div>

      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Cliente</Label>
        <Select
          value={clientId || "__all__"}
          onValueChange={(v) => setClientId(v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todos los clientes</SelectItem>
            {clients.map((c) => (
              <SelectItem key={c.client_id} value={c.client_id}>
                {c.document ? `${c.name} · ${c.document}` : c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <PeriodPicker title="Desde" value={from} years={years} onChange={setFrom} />
      <PeriodPicker title="Hasta" value={to} years={years} onChange={setTo} />

      <div className="flex flex-col gap-1">
        <span className="invisible text-xs">Acción</span>
        <Button onClick={handleDownload} disabled={!span || isGenerating} className="bg-primary">
          {isGenerating ? (
            <>
              <FileText className="h-4 w-4 mr-2 animate-spin" />
              Generando PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </>
          )}
        </Button>
      </div>

      <span className="w-full text-xs text-muted-foreground">
        {span
          ? `PDF de: ${span.label}${selectedClient ? ` · ${selectedClient.name}` : " · todos los clientes"}`
          : "El período final debe ser igual o posterior al inicial"}
      </span>
    </div>
  )
}

function PeriodPicker({
  title,
  value,
  years,
  onChange,
}: {
  title: string
  value: PeriodPickerValue
  years: number[]
  onChange: (next: PeriodPickerValue) => void
}) {
  const needsMonth = value.scope !== "year"

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">{title}</Label>
      <div className="flex gap-2">
        <Select value={value.year} onValueChange={(year) => onChange({ ...value, year })}>
          <SelectTrigger className="w-[90px]">
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

        <Select
          value={needsMonth ? value.month : ""}
          onValueChange={(month) => onChange({ ...value, month })}
          disabled={!needsMonth}
        >
          <SelectTrigger className="w-[125px]">
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

        <Select
          value={value.scope}
          onValueChange={(scope) => onChange({ ...value, scope: scope as PeriodScope })}
        >
          <SelectTrigger className="w-[210px]">
            <SelectValue />
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
    </div>
  )
}
