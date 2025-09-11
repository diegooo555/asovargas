"use client";

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
import { toast } from 'react-toastify';

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
    expenses: product?.expenses?.toString() || "3850",
    percentage: product?.profit_percentage?.toString() || "",
    quantity: product?.quantity?.toString() || ""
  })

  const purchasePrice = Number.parseFloat(formData.purchase_price) || 0
  const expenses = Number(formData.expenses);
  const percentage = Number(formData.percentage) / 100;
  const total = (purchasePrice + expenses) * (1 + percentage) * 1.05;

  const utility = (purchasePrice + expenses) * (1 + percentage) - (purchasePrice + expenses);


  
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (!supabase) throw new Error("Supabase no configurado");

    const productData = {
      name: formData.name.trim(),
      company: formData.company.trim(),
      purchase_price: parseFloat(formData.purchase_price),
      sale_price: total,
      expenses: parseFloat(formData.expenses),
      profit_percentage: parseFloat(formData.percentage),
    };

    // Validación básica
    if (!productData.name || !productData.company || isNaN(productData.purchase_price) || isNaN(productData.sale_price)) {
      toast.error("Por favor completa todos los campos correctamente.");
      return;
    }

    let error;
    if (product) {
      // Update
      ({ error } = await supabase.from("products").update(productData).eq("id", product.id));
    } else {
      // Insert
      const { error: insertError, status } = await supabase.from("products").insert([productData]);
      error = insertError;
      if (status === 201) toast.success("Producto Creado Correctamente");
    }

    if (error) {
      toast.error(error.message || "Error, intentalo nuevamente");
      throw error;
    }

    // Esperar 2.5s antes de redirigir
    await new Promise(res => setTimeout(res, 2500));
    router.push("/productos");
    router.refresh();

  } catch (error) {
    console.error("Error saving product:", error);
    toast.error("Error al guardar el producto. Por favor intenta de nuevo.");
  } finally {
    setLoading(false);
  }
};


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
          <Label htmlFor="expenses">Gastos *</Label>
          <Input
            id="expenses"
            type="number"
            step="0.01"
            min="0"
            value={formData.expenses}
            onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="percentage">Porcentaje de Utilidad % *</Label>
          <Input
            id="percentage"
            type="number"
            step="0.01"
            min="0"
            value={formData.percentage}
            onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <p className="font-extrabold text-green-600">Cantidad en Bodega:</p>
          <p className="font-bold text-green-600 p-2 border rounded-md">{product?.quantity}</p>
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
                ${total.toLocaleString("es-CO", { minimumFractionDigits: 2})}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Porcentaje de Utilidad</p>
              <p className='font-semibold text-green-600'>
                {formData?.percentage}%
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Ganancia por Unidad:</span>
              <span className={`font-semibold ${utility > 0 ? "text-green-600" : "text-red-600"}`}>
                ${utility?.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
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
