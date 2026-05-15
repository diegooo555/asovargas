"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, Package, Syringe, CreditCard, Banknote, ArrowRightLeft } from "lucide-react"
import type { BuyWithItems, SaleType } from "@/lib/types"

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

  const saleTypeLabels: Record<SaleType, { label: string; icon: typeof CreditCard }> = {
    contado: { label: "Contado", icon: Banknote },
    transferencia: { label: "Transferencia", icon: ArrowRightLeft },
    credito: { label: "Crédito", icon: CreditCard },
  }
  const currentSaleType = saleTypeLabels[venta.sale_type] || saleTypeLabels.contado
  const SaleTypeIcon = currentSaleType.icon

  return (
    <>
      {/* Estilos de impresión globales */}
      <style>{`
        @media print {
          @page {
            margin: 10mm 12mm;
            size: letter;
          }
          body * { visibility: hidden; }
          #invoice-printable, #invoice-printable * { visibility: visible; }
          #invoice-printable { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      {/* Botón imprimir */}
      <div className="flex items-center space-x-3 mb-4 print:hidden">
        <Button onClick={handlePrint} size="sm" className="bg-primary">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir Remisión
        </Button>
      </div>

      {/* Contenido imprimible */}
      <div id="invoice-printable">
        <Card className="w-full max-w-none print:shadow-none print:border-none">
          <CardContent className="p-3 print:p-2">

            {/* ENCABEZADO — fila compacta */}
            <div className="flex items-center justify-between border-b border-primary pb-2 mb-3">
              {/* Logo + nombre */}
              <div className="flex items-center gap-2">
                <img src="/asovargasLogo.png" className="h-10 w-auto" alt="Logo Asovargas" />
                <div>
                  <p className="text-base font-bold text-primary leading-tight">ASOVARGAS</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Asociación Agroturística Pantano de Vargas
                  </p>
                </div>
              </div>

              {/* Número, fecha y tipo de pago */}
              <div className="text-right text-xs text-muted-foreground space-y-0.5">
                <p className="text-sm font-bold text-foreground">
                  REMISIÓN N° {venta.buy_number}
                </p>
                <p>
                  {new Date(venta.created_at).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  —{" "}
                  {new Date(venta.created_at).toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                  <SaleTypeIcon className="h-3 w-3" />
                  {currentSaleType.label}
                </span>
              </div>
            </div>

            {/* DATOS DEL COMPRADOR — fila horizontal */}
            <div className="grid grid-cols-4 gap-x-4 gap-y-0.5 text-[11px] bg-muted/30 rounded px-3 py-2 mb-3 print:bg-gray-50">
              <div>
                <span className="text-muted-foreground font-semibold">Nombre: </span>
                <span className="font-medium">{venta.client?.name || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Documento: </span>
                <span className="font-medium">{venta.client?.document || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Teléfono: </span>
                <span className="font-medium">{venta.client?.phone || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground font-semibold">Dirección: </span>
                <span className="font-medium">{venta.client?.address || "—"}</span>
              </div>
            </div>

            {/* TABLA PRODUCTOS */}
            {venta.buy_items && venta.buy_items.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-semibold flex items-center gap-1 mb-1 text-muted-foreground uppercase tracking-wide">
                  <Package className="h-3 w-3 text-primary" /> Productos
                </p>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-foreground/20">
                      <th className="text-left py-1 font-semibold w-6">#</th>
                      <th className="text-left py-1 font-semibold">Producto</th>
                      <th className="text-left py-1 font-semibold">Empresa</th>
                      <th className="text-right py-1 font-semibold w-12">Cant.</th>
                      <th className="text-right py-1 font-semibold w-24">P. Unit.</th>
                      <th className="text-right py-1 font-semibold w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venta.buy_items.map((item, idx) => (
                      <tr key={item.id} className="border-b border-muted/50">
                        <td className="py-0.5 text-muted-foreground">{idx + 1}</td>
                        <td className="py-0.5 font-medium">{item.product?.name || "Producto eliminado"}</td>
                        <td className="py-0.5 text-muted-foreground">{item.product?.company || "—"}</td>
                        <td className="py-0.5 text-right">{item.quantity}</td>
                        <td className="py-0.5 text-right">
                          ${item.unit_price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-0.5 text-right font-semibold">
                          ${item.total_price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={5} className="py-1 text-right text-muted-foreground">Subtotal productos:</td>
                      <td className="py-1 text-right font-bold">
                        ${productsTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* TABLA PAJILLAS */}
            {venta.buy_pajilla_items && venta.buy_pajilla_items.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-semibold flex items-center gap-1 mb-1 text-muted-foreground uppercase tracking-wide">
                  <Syringe className="h-3 w-3 text-primary" /> Pajillas de Inseminación
                </p>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="border-b border-foreground/20">
                      <th className="text-left py-1 font-semibold w-6">#</th>
                      <th className="text-left py-1 font-semibold">Toro</th>
                      <th className="text-left py-1 font-semibold">Raza</th>
                      <th className="text-left py-1 font-semibold">Empresa</th>
                      <th className="text-right py-1 font-semibold w-12">Cant.</th>
                      <th className="text-right py-1 font-semibold w-24">P. Unit.</th>
                      <th className="text-right py-1 font-semibold w-24">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venta.buy_pajilla_items.map((item, idx) => (
                      <tr key={item.id} className="border-b border-muted/50">
                        <td className="py-0.5 text-muted-foreground">{idx + 1}</td>
                        <td className="py-0.5 font-medium">{item.pajilla?.bull_name || "Pajilla eliminada"}</td>
                        <td className="py-0.5 text-muted-foreground">{item.pajilla?.breed || "—"}</td>
                        <td className="py-0.5 text-muted-foreground">{item.pajilla?.company || "—"}</td>
                        <td className="py-0.5 text-right">{item.quantity}</td>
                        <td className="py-0.5 text-right">
                          ${item.unit_price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-0.5 text-right font-semibold">
                          ${item.total_price.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={6} className="py-1 text-right text-muted-foreground">Subtotal pajillas:</td>
                      <td className="py-1 text-right font-bold">
                        ${pajillasTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* TOTAL */}
            <div className="flex justify-end border-t border-primary/30 pt-2 mb-4">
              <div className="w-60 text-[11px] space-y-0.5">
                {venta.buy_items?.length > 0 && venta.buy_pajilla_items?.length > 0 && (
                  <>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal productos:</span>
                      <span>${productsTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal pajillas:</span>
                      <span>${pajillasTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t border-foreground pt-1 font-bold text-sm">
                  <span>TOTAL:</span>
                  <span className="text-primary">
                    ${grandTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* FIRMAS */}
            <div className="grid grid-cols-2 gap-12 pt-4 border-t border-muted mt-2">
              <div className="text-center">
                <div className="border-t border-foreground pt-2 mx-4">
                  <p className="text-[11px] font-semibold">Firma del Vendedor</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Nombre: ___________________</p>
                  <p className="text-[10px] text-muted-foreground">C.C.: ___________________</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-foreground pt-2 mx-4">
                  <p className="text-[11px] font-semibold">Firma del Comprador</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Nombre: {venta.client?.name || "___________________"}</p>
                  <p className="text-[10px] text-muted-foreground">C.C.: {venta.client?.document || "___________________"}</p>
                </div>
              </div>
            </div>

            {/* PIE */}
            <div className="mt-4 pt-2 border-t text-center">
              <p className="text-[10px] text-muted-foreground">
                Gracias por su compra — ASOVARGAS © {new Date().getFullYear()}
              </p>
            </div>

          </CardContent>
        </Card>
      </div>
    </>
  )
}