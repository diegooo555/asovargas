"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Trash2, Package, AlertCircle, Syringe, User, FileText, Printer, CreditCard, Banknote, ArrowRightLeft } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { Product, Client, Pajilla, SaleType } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "react-toastify"

interface ProductItem {
  product_id: string
  quantity: number
  unit_price: number
}

interface PajillaItem {
  pajilla_id: string
  quantity: number
  unit_price: number
}

export function VentaForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [pajillas, setPajillas] = useState<Pajilla[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [error, setError] = useState<string | null>(null)

  const [selectedClientId, setSelectedClientId] = useState("")
  const [saleType, setSaleType] = useState<SaleType>("contado")
  const [productItems, setProductItems] = useState<ProductItem[]>([])
  const [pajillaItems, setPajillaItems] = useState<PajillaItem[]>([])

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true)
      setError(null)

      if (!supabase) {
        setError("La base de datos no está configurada. Por favor contacta al administrador.")
        setLoadingData(false)
        return
      }

      try {
        const [productsRes, pajillasRes, clientsRes] = await Promise.all([
          supabase.from("products").select("*").gt("quantity", 0).order("name"),
          supabase.from("pajillas").select("*").gt("quantity", 0).order("bull_name"),
          supabase.from("clients").select("*").order("name"),
        ])

        if (productsRes.error) throw productsRes.error
        if (pajillasRes.error) throw pajillasRes.error
        if (clientsRes.error) throw clientsRes.error

        setProducts((productsRes.data as unknown as Product[]) || [])
        setPajillas((pajillasRes.data as unknown as Pajilla[]) || [])
        setClients((clientsRes.data as unknown as Client[]) || [])
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Error al cargar los datos. Por favor recarga la página.")
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando datos...</span>
      </div>
    )
  }

  const selectedClient = clients.find((c) => c.client_id === selectedClientId)

  // --- Product Items ---
  const addProductItem = () => {
    setProductItems([...productItems, { product_id: "", quantity: 1, unit_price: 0 }])
  }
  const removeProductItem = (index: number) => {
    setProductItems(productItems.filter((_, i) => i !== index))
  }
  const updateProductItem = (index: number, field: keyof ProductItem, value: string | number) => {
    const updated = [...productItems]
    updated[index] = { ...updated[index], [field]: value }
    if (field === "product_id" && typeof value === "string") {
      const product = products.find((p) => p.id === value)
      if (product) updated[index].unit_price = product.sale_price
    }
    setProductItems(updated)
  }

  // --- Pajilla Items ---
  const addPajillaItem = () => {
    setPajillaItems([...pajillaItems, { pajilla_id: "", quantity: 1, unit_price: 0 }])
  }
  const removePajillaItem = (index: number) => {
    setPajillaItems(pajillaItems.filter((_, i) => i !== index))
  }
  const updatePajillaItem = (index: number, field: keyof PajillaItem, value: string | number) => {
    const updated = [...pajillaItems]
    updated[index] = { ...updated[index], [field]: value }
    if (field === "pajilla_id" && typeof value === "string") {
      const pajilla = pajillas.find((p) => p.id === value)
      if (pajilla) updated[index].unit_price = pajilla.sale_price
    }
    setPajillaItems(updated)
  }

  // --- Totals ---
  const productsTotal = productItems.reduce((t, item) => t + item.quantity * item.unit_price, 0)
  const pajillasTotal = pajillaItems.reduce((t, item) => t + item.quantity * item.unit_price, 0)
  const grandTotal = productsTotal + pajillasTotal

  // --- Generate buy number ---
  const generateBuyNumber = () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const t = String(now.getTime()).slice(-4)
    return `VTA-${y}${m}${d}-${t}`
  }

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!supabase) throw new Error("Supabase no configurado")

      if (!selectedClientId) {
        toast.error("Debes seleccionar un cliente")
        return
      }

      const validProducts = productItems.filter((item) => item.product_id && item.quantity > 0)
      const validPajillas = pajillaItems.filter((item) => item.pajilla_id && item.quantity > 0)

      if (validProducts.length === 0 && validPajillas.length === 0) {
        toast.error("Debes agregar al menos un producto o pajilla a la venta")
        return
      }

      // Validate stock for products
      for (const item of validProducts) {
        const product = products.find((p) => p.id === item.product_id)
        if (product && item.quantity > product.quantity) {
          toast.error(`Stock insuficiente para "${product.name}". Disponible: ${product.quantity}`)
          return
        }
      }

      // Validate stock for pajillas
      for (const item of validPajillas) {
        const pajilla = pajillas.find((p) => p.id === item.pajilla_id)
        if (pajilla && item.quantity > pajilla.quantity) {
          toast.error(`Stock insuficiente para pajilla "${pajilla.bull_name}". Disponible: ${pajilla.quantity}`)
          return
        }
      }

      // Create buy record
      const buyData = {
        client_id: selectedClientId,
        buy_number: generateBuyNumber(),
        sale_type: saleType,
        total_amount: grandTotal,
      }

      const { data: buy, error: buyError } = await supabase
        .from("buys")
        .insert([buyData])
        .select()
        .single()

      if (buyError) throw buyError

      // Insert product items
      if (validProducts.length > 0) {
        const productItemsData = validProducts.map((item) => ({
          buy_id: buy.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))

        const { error: prodError } = await supabase.from("buy_items").insert(productItemsData)
        if (prodError) throw prodError
      }

      // Insert pajilla items
      if (validPajillas.length > 0) {
        const pajillaItemsData = validPajillas.map((item) => ({
          buy_id: buy.id,
          pajilla_id: item.pajilla_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }))

        const { error: pajError } = await supabase.from("buy_pajilla_items").insert(pajillaItemsData)
        if (pajError) throw pajError
      }

      toast.success("Venta registrada exitosamente")
      await new Promise((res) => setTimeout(res, 1500))
      router.push(`/dashboard/ventas/${buy.id}`)
      router.refresh()
    } catch (error: any) {
      console.error("Error creating sale:", error)
      toast.error(error.message || "Error al crear la venta. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>Seleccionar Cliente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente *</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.client_id} value={client.client_id}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{client.name} — CC {client.document}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedClient && (
              <div className="space-y-1 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-foreground">{selectedClient.name}</p>
                <p className="text-xs text-muted-foreground">Documento: {selectedClient.document}</p>
                <p className="text-xs text-muted-foreground">Teléfono: {selectedClient.phone}</p>
                <p className="text-xs text-muted-foreground">Dirección: {selectedClient.address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sale Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <span>Tipo de Venta</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "contado" as SaleType, label: "Contado", icon: Banknote, description: "Pago en efectivo" },
              { value: "transferencia" as SaleType, label: "Transferencia", icon: ArrowRightLeft, description: "Transferencia bancaria" },
              { value: "credito" as SaleType, label: "Crédito", icon: CreditCard, description: "Pago a crédito" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSaleType(option.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200 ${saleType === option.value
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-muted hover:border-primary/40 hover:bg-muted/50"
                  }`}
              >
                <option.icon className={`h-6 w-6 ${saleType === option.value ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`text-sm font-semibold ${saleType === option.value ? "text-primary" : "text-foreground"}`}>
                  {option.label}
                </span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Package className="h-5 w-5 text-primary" />
            <span>Productos</span>
          </CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addProductItem}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {productItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No se han agregado productos. Haz clic en &quot;Agregar Producto&quot; para comenzar.
            </p>
          ) : (
            productItems.map((item, index) => {
              const product = products.find((p) => p.id === item.product_id)
              return (
                <div key={index} className="flex items-end space-x-4 p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Label>Producto *</Label>
                    <Select value={item.product_id} onValueChange={(v) => updateProductItem(index, "product_id", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center space-x-2">
                              <Package className="h-4 w-4" />
                              <span>
                                {p.name} — ${p.sale_price.toLocaleString("es-CO")} (Stock: {p.quantity})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-24 space-y-2">
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      max={product?.quantity || 999}
                      value={item.quantity}
                      onChange={(e) => {
                        const value = e.target.value;

                        updateProductItem(
                          index,
                          "quantity",
                          value === "" ? "" : Number(value)
                        );
                      }}
                    />
                  </div>

                  <div className="w-32 space-y-2">
                    <Label>Precio Unit.</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateProductItem(index, "unit_price", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="w-32 space-y-2">
                    <Label>Subtotal</Label>
                    <div className="h-10 flex items-center px-3 bg-muted rounded-md text-sm font-medium">
                      ${(item.quantity * item.unit_price).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProductItem(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })
          )}

          {productItems.length > 0 && (
            <div className="flex justify-end pt-2 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Subtotal Productos</p>
                <p className="text-lg font-bold text-foreground">
                  ${productsTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pajilla Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Syringe className="h-5 w-5 text-primary" />
            <span>Pajillas</span>
          </CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addPajillaItem}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Pajilla
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {pajillaItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No se han agregado pajillas. Haz clic en &quot;Agregar Pajilla&quot; para comenzar.
            </p>
          ) : (
            pajillaItems.map((item, index) => {
              const pajilla = pajillas.find((p) => p.id === item.pajilla_id)
              return (
                <div key={index} className="flex items-end space-x-4 p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Label>Pajilla *</Label>
                    <Select value={item.pajilla_id} onValueChange={(v) => updatePajillaItem(index, "pajilla_id", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar pajilla" />
                      </SelectTrigger>
                      <SelectContent>
                        {pajillas.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center space-x-2">
                              <Syringe className="h-4 w-4" />
                              <span>
                                {p.bull_name} ({p.breed}) — ${p.sale_price.toLocaleString("es-CO")} (Stock: {p.quantity})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-24 space-y-2">
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      max={pajilla?.quantity || 999}
                      value={item.quantity}
                      onChange={(e) => {
                        const value = e.target.value;

                        updatePajillaItem(
                          index,
                          "quantity",
                          value === "" ? "" : Number(value)
                        );
                      }}
                    />
                  </div>

                  <div className="w-32 space-y-2">
                    <Label>Precio Unit.</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updatePajillaItem(index, "unit_price", Number.parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="w-32 space-y-2">
                    <Label>Subtotal</Label>
                    <div className="h-10 flex items-center px-3 bg-muted rounded-md text-sm font-medium">
                      ${(item.quantity * item.unit_price).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePajillaItem(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })
          )}

          {pajillaItems.length > 0 && (
            <div className="flex justify-end pt-2 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Subtotal Pajillas</p>
                <p className="text-lg font-bold text-foreground">
                  ${pajillasTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Preview / Grand Total */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Resumen de Factura</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedClient && (
            <div className="mb-6 p-4 bg-card rounded-lg border">
              <h4 className="font-semibold text-sm mb-2">Datos del Cliente</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p><span className="text-muted-foreground">Nombre:</span> {selectedClient.name}</p>
                <p><span className="text-muted-foreground">Documento:</span> {selectedClient.document}</p>
                <p><span className="text-muted-foreground">Teléfono:</span> {selectedClient.phone}</p>
                <p><span className="text-muted-foreground">Dirección:</span> {selectedClient.address}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {productItems.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal Productos ({productItems.length} items)</span>
                <span className="font-medium">${productsTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {pajillaItems.length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal Pajillas ({pajillaItems.length} items)</span>
                <span className="font-medium">${pajillasTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary">
                ${grandTotal.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        <Button type="submit" disabled={loading} size="lg">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Crear Venta
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
