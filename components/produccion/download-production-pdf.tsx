"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "react-toastify"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Input } from "@/components/ui/input"

const PRICE_PER_LITER = 2000 // COP
const CONFIRMATION_PASSWORD = "ACCESS"

interface UserProduction {
  client_id: string
  name: string
  total_liters: number
  total_payment: number
  production_records: { liters: number; production_datetime: string }[]
}

export function DownloadProductionPDF() {
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [confirmationPassword, setConfirmationPassword] = useState("")

  const fetchProductionData = async (): Promise<UserProduction[]> => {
    if (!supabase) {
      throw new Error("Supabase no está configurado")
    }

    const { data, error } = await supabase.from("clients").select(`
        client_id,
        name,
        production_records (
          liters,
          production_datetime
        )
      `)

    if (error) {
      throw new Error(`Error al obtener datos: ${error.message}`)
    }

    return data
      .map((client: { client_id: string; name: string; production_records: { liters: number; production_datetime: string }[] }) => {
        const totalLiters = client.production_records.reduce(
          (sum: number, record: any) => sum + Number.parseFloat(record.liters || 0),
          0,
        )

        return {
          client_id: client.client_id,
          name: client.name,
          total_liters: totalLiters,
          total_payment: totalLiters * PRICE_PER_LITER,
          production_records: client.production_records || []
        }
      })
      .filter((user) => user.total_liters > 0) // Solo usuarios con producción
  }

  const endFortnight = async () => {
    const { data, error } = await supabase.rpc('archive_production_records');
    if (error) {
      console.error("Error finalizando quincena:", error);
    } else {
      console.log("Quincena finalizada:", data);
    }
  }

  const generatePDF = async () => {

    if (confirmationPassword !== CONFIRMATION_PASSWORD) {
      toast.error("Contraseña de confirmación incorrecta")
      return
    }
  
    try {
      setIsGenerating(true)

      const productionData = await fetchProductionData()

      console.log(productionData)

      if (productionData.length === 0) {
        toast.error("No hay registros de producción para generar el PDF")
        return
      }

      const pdf = new jsPDF()
      let yPosition = 20

      // Función para agregar encabezado en cada página
      const addHeader = (isFirstPage = false) => {
        if (!isFirstPage) {
          pdf.addPage()
          yPosition = 20
        }

        // Título principal
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(18)
        pdf.setTextColor(22, 101, 52)
        pdf.text("REPORTE DE PRODUCCIÓN - ASOVARGAS", 20, yPosition)
        yPosition += 15

        pdf.setFontSize(12)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`Fecha de generación: ${new Date().toLocaleDateString("es-CO")}`, 20, yPosition)
        yPosition += 20
      }

      // Encabezado inicial
      addHeader(true)

      // Generar tabla para cada usuario
      productionData.forEach((user, index) => {
        // Verificar espacio disponible para la tabla
        if (yPosition > 200 && index > 0) {
          addHeader()
        }

        // Información del usuario
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(14)
        pdf.setTextColor(22, 101, 52)
        pdf.text(`PRODUCTOR: ${user.name.toUpperCase()}`, 20, yPosition)
        yPosition += 10

        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(10)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`ID: ${user.client_id}`, 20, yPosition)
        yPosition += 15

        // Preparar datos para la tabla del usuario
        const tableData = user.production_records?.map((record: any) => [
          new Date(record.production_datetime).toLocaleDateString("es-CO"),
          `${Number.parseFloat(record.liters || 0).toFixed(2)} L`,
          `$${(Number.parseFloat(record.liters || 0) * PRICE_PER_LITER).toLocaleString("es-CO")}`
        ]) || []

        // Agregar fila de totales
        tableData.push([
          "TOTAL",
          `${user.total_liters.toFixed(2)} L`,
          `$${user.total_payment.toLocaleString("es-CO")}`
        ])

        // Crear tabla con autoTable
        autoTable(pdf, {
          startY: yPosition,
          head: [["Fecha", "Litros", "Pago (COP)"]],
          body: tableData,
          margin: { left: 20, right: 20 },
          styles: {
            fontSize: 10,
            cellPadding: 5,
          },
          headStyles: {
            fillColor: [22, 101, 52], // Verde oscuro
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          bodyStyles: {
            textColor: [0, 0, 0],
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251], // Gris muy claro
          },
          // Estilo especial para la fila de totales
          didParseCell: function (data) {
            if (data.row.index === tableData.length - 1) {
              data.cell.styles.fillColor = [34, 197, 94] // Verde más claro
              data.cell.styles.textColor = [255, 255, 255]
              data.cell.styles.fontStyle = "bold"
            }
          },
          columnStyles: {
            0: { cellWidth: 40 }, // Fecha
            1: { cellWidth: 40, halign: "center" }, // Litros
            2: { cellWidth: 50, halign: "right" }, // Pago
          },
        })

        // Actualizar posición Y después de la tabla
        yPosition = (pdf as any).lastAutoTable.finalY + 20

        // Agregar separador entre usuarios (excepto el último)
        if (index < productionData.length - 1) {
          pdf.setDrawColor(200, 200, 200)
          pdf.line(20, yPosition - 10, pdf.internal.pageSize.width - 20, yPosition - 10)
          yPosition += 10
        }
      })

      // Resumen general en nueva página
      if (productionData.length > 1) {
        addHeader()

        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(16)
        pdf.setTextColor(22, 101, 52)
        pdf.text("RESUMEN GENERAL", 20, yPosition)
        yPosition += 20

        const totalLiters = productionData.reduce((sum, user) => sum + user.total_liters, 0)
        const totalPayment = productionData.reduce((sum, user) => sum + user.total_payment, 0)

        // Tabla resumen
        const summaryData = [
          ["Total de productores", productionData.length.toString(), ""],
          ["Total de litros", `${totalLiters.toFixed(2)} L`, ""],
          ["Precio por litro", "", `$${PRICE_PER_LITER.toLocaleString("es-CO")}`],
          ["TOTAL GENERAL", "", `$${totalPayment.toLocaleString("es-CO")}`],
        ]

        autoTable(pdf, {
          startY: yPosition,
          head: [["Concepto", "Cantidad", "Valor (COP)"]],
          body: summaryData,
          margin: { left: 20, right: 20 },
          styles: {
            fontSize: 12,
            cellPadding: 8,
          },
          headStyles: {
            fillColor: [22, 101, 52],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          bodyStyles: {
            textColor: [0, 0, 0],
          },
          // Estilo especial para la fila de total
          didParseCell: function (data) {
            if (data.row.index === summaryData.length - 1) {
              data.cell.styles.fillColor = [239, 68, 68] // Rojo para destacar
              data.cell.styles.textColor = [255, 255, 255]
              data.cell.styles.fontStyle = "bold"
              data.cell.styles.fontSize = 14
            }
          },
          columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 40, halign: "center" },
            2: { cellWidth: 60, halign: "right" },
          },
        })
      }

      // Pie de página en todas las páginas
      const pageCount = pdf.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(150, 150, 150)
        pdf.text(
          `Página ${i} de ${pageCount} - Generado el ${new Date().toLocaleDateString("es-CO")} ${new Date().toLocaleTimeString("es-CO")}`,
          20,
          pdf.internal.pageSize.height - 10
        )
        pdf.text(
          "ASOVARGAS - Asociación de Productores",
          pdf.internal.pageSize.width - 20,
          pdf.internal.pageSize.height - 10,
          { align: "right" }
        )
      }

      // Descargar PDF
      const fileName = `reporte-produccion-${new Date().toISOString().split("T")[0]}.pdf`
      pdf.save(fileName)
      //await endFortnight();
      toast.success("PDF generado exitosamente")
      
    } catch (error) {
      console.error("Error generando PDF:", error)
      toast.error("Error al generar PDF. Por favor, intenta de nuevo.")
    } finally {
      setIsGenerating(false)
      setConfirmationPassword("")
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Input
        type="password"
        value={confirmationPassword}
        onChange={(event) => setConfirmationPassword(event.target.value)}
        placeholder="Contraseña de confirmación"
        autoComplete="off"
        className="sm:max-w-xs"
        aria-label="Contraseña de confirmación"
      />
      <Button
        onClick={generatePDF}
        disabled={
          isGenerating || confirmationPassword !== CONFIRMATION_PASSWORD
        }
        className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {isGenerating ? (
          <>
            <FileText className="w-4 h-4 mr-2 animate-spin" />
            Generando PDF...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Finalizar Quincena
          </>
        )}
      </Button>
    </div>
  )
}