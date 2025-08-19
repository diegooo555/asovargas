"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Calculator } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { Product } from "@/lib/types"

interface ProductFormProps {
  product?: Product
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: product?.name || "",
    company: product?.company || "",
    purchase_price: product?.purchase_price?.toString() || "",
    sale_price: product?.sale_price?.toString() || "",
  })

  const purchasePrice = Number.parseFloat(formData.purchase_price) || 0
  const salePrice = Number.parseFloat(formData.sale_price) || 0
  const profitPercentage = purchasePrice > 0 ? ((salePrice - purchasePrice) / purchasePrice) * 100 : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!supabase) {
        throw new Error("Supabase no configurado")
      }

      const productData = {
        name: formData.name,
        company: formData.company,
        purchase_price: Number.parseFloat(formData.purchase_price),
        sale_price: Number.parseFloat(formData.sale_price),
      }

      let error

      if (product) {
        // Update existing product
        const { error: updateError } = await supabase.from("products").update(productData).eq("id", product.id)
        error = updateError
      } else {
        // Create new product
        const { error: insertError } = await supabase.from("products").insert([productData])
        error = insertError
      }

      if (error) {
        throw error
      }

      router.push("/productos")
      router.refresh()
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Error al guardar el producto. Por favor intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Producto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ej: Laptop Dell Inspiron 15"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Empresa/Marca *</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Ej: Dell"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase_price">Precio de Compra *</Label>
          <Input
            id="purchase_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.purchase_price}
            onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sale_price">Precio de Venta *</Label>
          <Input
            id="sale_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.sale_price}
            onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      {/* Profit Calculation */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Calculator className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Cálculo de Utilidad</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Precio de Compra</p>
              <p className="font-semibold text-foreground">
                ${purchasePrice.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Precio de Venta</p>
              <p className="font-semibold text-foreground">
                ${salePrice.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Porcentaje de Utilidad</p>
              <p className={`font-semibold ${profitPercentage >= 0 ? "text-green-600" : "text-red-600"}`}>
                {profitPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Ganancia por Unidad:</span>
              <span className={`font-semibold ${salePrice - purchasePrice >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${(salePrice - purchasePrice).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? "Actualizar Producto" : "Crear Producto"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
