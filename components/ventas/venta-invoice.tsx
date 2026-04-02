"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, Download, Package, Syringe } from "lucide-react"
import type { BuyWithItems } from "@/lib/types"

interface VentaInvoiceProps {
  venta: BuyWithItems
}

export function VentaInvoice({ venta }: VentaInvoiceProps) {
  const handlePrint = () => {
    window.print()
  }

  const productsTotal = venta.buy_items?.reduce((t, item) => t + (item.total_price || 0), 0) || 0
  const pajillasTotal = venta.buy_pajilla_items?.reduce((t, item) => t + (item.total_price || 0), 0) || 0
  const grandTotal = venta.total_amount || productsTotal + pajillasTotal

  return (
    <div>
      {/* Print Button (hidden when printing) */}
      <div className="flex items-center space-x-3 mb-6 print:hidden">
        <Button onClick={handlePrint} size="lg" className="bg-primary">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir Factura
        </Button>
      </div>

      {/* Invoice Card */}
      <Card className="print:shadow-none print:border-none">
        <CardContent className="p-8 print:p-4">
          {/* ===== INVOICE HEADER ===== */}
          <div className="border-b-2 border-primary pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-primary print:text-2xl">ASOVARGAS</h1>
                <p className="text-sm text-muted-foreground mt-1">Asociación de Productores</p>
                <p className="text-xs text-muted-foreground">Sistema de Gestión Empresarial</p>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-foreground">FACTURA DE VENTA</h2>
                <p className="text-sm font-mono font-semibold text-primary mt-1">{venta.buy_number}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fecha: {new Date(venta.created_at).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Hora: {new Date(venta.created_at).toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* ===== CLIENT INFO ===== */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6 print:bg-gray-50">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
              Datos del Comprador
            </h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <div className="flex">
                <span className="text-sm text-muted-foreground w-24">Nombre:</span>
                <span className="text-sm font-medium">{venta.client?.name || "—"}</span>
              </div>
              <div className="flex">
                <span className="text-sm text-muted-foreground w-24">Documento:</span>
                <span className="text-sm font-medium">{venta.client?.document || "—"}</span>
              </div>
              <div className="flex">
                <span className="text-sm text-muted-foreground w-24">Teléfono:</span>
                <span className="text-sm font-medium">{venta.client?.phone || "—"}</span>
              </div>
              <div className="flex">
                <span className="text-sm text-muted-foreground w-24">Dirección:</span>
                <span className="text-sm font-medium">{venta.client?.address || "—"}</span>
              </div>
            </div>
          </div>

          {/* ===== PRODUCTS TABLE ===== */}
          {venta.buy_items && venta.buy_items.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-sm flex items-center space-x-2 mb-3">
                <Package className="h-4 w-4 text-primary" />
                <span>Productos</span>
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground/20">
                    <th className="text-left py-2 font-semibold">#</th>
                    <th className="text-left py-2 font-semibold">Producto</th>
                    <th className="text-left py-2 font-semibold">Empresa</th>
                    <th className="text-right py-2 font-semibold">Cant.</th>
                    <th className="text-right py-2 font-semibold">Precio Unit.</th>
                    <th className="text-right py-2 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.buy_items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-muted">
                      <td className="py-2 text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 font-medium">{item.product?.name || "Producto eliminado"}</td>
                      <td className="py-2 text-muted-foreground">{item.product?.company || "—"}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">
                        ${item.unit_price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 text-right font-medium">
                        ${item.total_price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-foreground/20">
                    <td colSpan={5} className="py-2 text-right font-semibold">Subtotal Productos:</td>
                    <td className="py-2 text-right font-bold">
                      ${productsTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* ===== PAJILLAS TABLE ===== */}
          {venta.buy_pajilla_items && venta.buy_pajilla_items.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-sm flex items-center space-x-2 mb-3">
                <Syringe className="h-4 w-4 text-primary" />
                <span>Pajillas de Inseminación</span>
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground/20">
                    <th className="text-left py-2 font-semibold">#</th>
                    <th className="text-left py-2 font-semibold">Toro</th>
                    <th className="text-left py-2 font-semibold">Raza</th>
                    <th className="text-left py-2 font-semibold">Empresa</th>
                    <th className="text-right py-2 font-semibold">Cant.</th>
                    <th className="text-right py-2 font-semibold">Precio Unit.</th>
                    <th className="text-right py-2 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.buy_pajilla_items.map((item, idx) => (
                    <tr key={item.id} className="border-b border-muted">
                      <td className="py-2 text-muted-foreground">{idx + 1}</td>
                      <td className="py-2 font-medium">{item.pajilla?.bull_name || "Pajilla eliminada"}</td>
                      <td className="py-2 text-muted-foreground">{item.pajilla?.breed || "—"}</td>
                      <td className="py-2 text-muted-foreground">{item.pajilla?.company || "—"}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">
                        ${item.unit_price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 text-right font-medium">
                        ${item.total_price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-foreground/20">
                    <td colSpan={6} className="py-2 text-right font-semibold">Subtotal Pajillas:</td>
                    <td className="py-2 text-right font-bold">
                      ${pajillasTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* ===== GRAND TOTAL ===== */}
          <div className="border-t-2 border-primary/30 pt-4 mb-10">
            <div className="flex justify-end">
              <div className="w-72">
                {venta.buy_items && venta.buy_items.length > 0 && venta.buy_pajilla_items && venta.buy_pajilla_items.length > 0 && (
                  <>
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-muted-foreground">Subtotal Productos:</span>
                      <span>${productsTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm py-1">
                      <span className="text-muted-foreground">Subtotal Pajillas:</span>
                      <span>${pajillasTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between py-2 border-t-2 border-foreground mt-2">
                  <span className="text-lg font-bold">TOTAL:</span>
                  <span className="text-xl font-bold text-primary">
                    ${grandTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== SIGNATURES ===== */}
          <div className="grid grid-cols-2 gap-16 mt-16 pt-4">
            <div className="text-center">
              <div className="border-t-2 border-foreground pt-3 mx-8">
                <p className="font-semibold text-sm">Firma del Vendedor</p>
                <p className="text-xs text-muted-foreground mt-1">Nombre: ___________________</p>
                <p className="text-xs text-muted-foreground mt-1">C.C.: ___________________</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t-2 border-foreground pt-3 mx-8">
                <p className="font-semibold text-sm">Firma del Comprador</p>
                <p className="text-xs text-muted-foreground mt-1">Nombre: {venta.client?.name || "___________________"}</p>
                <p className="text-xs text-muted-foreground mt-1">C.C.: {venta.client?.document || "___________________"}</p>
              </div>
            </div>
          </div>

          {/* ===== FOOTER ===== */}
          <div className="mt-12 pt-4 border-t text-center">
            <p className="text-xs text-muted-foreground">
              Gracias por su compra — ASOVARGAS © {new Date().getFullYear()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
