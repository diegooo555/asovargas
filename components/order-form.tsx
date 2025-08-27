"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, Trash2, Package, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { Product, User } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface OrderItem {
  product_id: string
  quantity: number
  unit_price: number
}

export function OrderForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    status: "completed" as const,
  })
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ product_id: "", quantity: 1, unit_price: 0 }])

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true)
      setError(null)

      if (!supabase) {
        setError("La base de datos no está configurada. Por favor contacta al administrador.")
        setLoadingProducts(false)
        return
      }

      try {
        const { data, error } = await supabase.from("products").select("*").order("name")

        if (error) {
          console.error("Error loading products:", error)
          setError("Error al cargar los productos. Por favor recarga la página.")
          return
        }

        setProducts(data || [])
      } catch (err) {
        console.error("Unexpected error loading products:", err)
        setError("Error inesperado al cargar los productos.")
      } finally {
        setLoadingProducts(false)
      }
    }

    loadProducts()
  }, [])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando productos...</span>
      </div>
    )
  }

  const generateOrderNumber = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const time = String(now.getTime()).slice(-4)
    return `ORD-${year}${month}${day}-${time}`
  }

  const addOrderItem = () => {
    setOrderItems([...orderItems, { product_id: "", quantity: 1, unit_price: 0 }])
  }

  const removeOrderItem = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index))
    }
  }

  const updateOrderItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = [...orderItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    // If product is selected, update unit price
    if (field === "product_id" && typeof value === "string") {
      const selectedProduct = products.find((p) => p.id === value)
      if (selectedProduct) {
        updatedItems[index].unit_price = selectedProduct.sale_price
      }
    }

    setOrderItems(updatedItems)
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + item.quantity * item.unit_price
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!supabase) {
        throw new Error("La base de datos no está configurada")
      }

      // Validate order items
      const validItems = orderItems.filter((item) => item.product_id && item.quantity > 0)
      if (validItems.length === 0) {
        alert("Debes agregar al menos un producto a la orden")
        return
      }

      // Create order
      const orderData = {
        user_id: "956a0f62-0db2-4f55-a574-4b8509682c89",
        order_number: generateOrderNumber(),
        total_amount: calculateTotal(),
      }

      const { data: order, error: orderError } = await supabase.from("orders").insert([orderData]).select().single()

      if (orderError) {
        throw orderError
      }

      // Create order items
      const orderItemsData = validItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItemsData)

      if (itemsError) {
        throw itemsError
      } 

      

      router.push("/ordenes")
      router.refresh()
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Error al crear la orden. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="space-y-2">
          <Label htmlFor="status">Estado de la Orden</Label>
          <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="processing">Procesando</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
              <SelectItem value="cancelled">Cancelada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Productos de la Orden</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderItems.map((item, index) => (
            <div key={index} className="flex items-end space-x-4 p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Label>Producto *</Label>
                <Select value={item.product_id} onValueChange={(value) => updateOrderItem(index, "product_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4" />
                          <span>
                            {product.name} - ${product.sale_price.toLocaleString("es-CO")}
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
                  value={item.quantity}
                  onChange={(e) => updateOrderItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="w-32 space-y-2">
                <Label>Precio Unit.</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unit_price}
                  onChange={(e) => updateOrderItem(index, "unit_price", Number.parseFloat(e.target.value) || 0)}
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
                onClick={() => removeOrderItem(index)}
                disabled={orderItems.length === 1}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Total */}
          <div className="flex justify-end pt-4 border-t">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total de la Orden</p>
              <p className="text-2xl font-bold text-foreground">
                ${calculateTotal().toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Crear Orden
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
