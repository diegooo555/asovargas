"use client";

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, DollarSign } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { Pajilla } from "@/lib/types"
import { toast } from 'react-toastify';

// Razas más importantes de Colombia
const RAZAS_COLOMBIA = [
  "Ayrshire",
  "Gyr",
  "Guzerá",
  "Nelore",
  "Holstein Negro",
  "Holstein Rojo",
  "Jersey",
  "Pardo Suizo",
  "Simmental",
  "Angus",
  "Brahman Rojo",
  "Brahman Blanco",
  "Senepol",
  "Girolando",
  "Normando",
  "Blanco Orejinegro (BON)",
  "Romosinuano",
  "Costeño con Cuernos",
  "Hartón del Valle",
  "Sanmartinero",
  "Lucerna",
  "Charolais",
  "Limousin",
  "Brangus",
  "Bradford",
  "Simbrah",

] as const;

interface PajillaFormProps {
  pajilla?: Pajilla
}

export function PajillaForm({ pajilla }: PajillaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    bull_name: pajilla?.bull_name || "",
    company: pajilla?.company || "",
    breed: pajilla?.breed || "",
    purchase_price: pajilla?.purchase_price?.toString() || "",
    sale_price: pajilla?.sale_price?.toString() || "",
    quantity: pajilla?.quantity?.toString() || "0",
  })

  const purchasePrice = Number.parseFloat(formData.purchase_price) || 0
  const salePrice = Number.parseFloat(formData.sale_price) || 0
  const profit = salePrice - purchasePrice

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!supabase) throw new Error("Supabase no configurado");

      const pajillaData = {
        bull_name: formData.bull_name.trim(),
        company: formData.company.trim(),
        breed: formData.breed,
        purchase_price: parseFloat(formData.purchase_price),
        sale_price: parseFloat(formData.sale_price),
        quantity: parseInt(formData.quantity) || 0,
      };

      // Validación básica
      if (
        !pajillaData.bull_name ||
        !pajillaData.company ||
        !pajillaData.breed ||
        isNaN(pajillaData.purchase_price) ||
        isNaN(pajillaData.sale_price)
      ) {
        toast.error("Por favor completa todos los campos correctamente.");
        return;
      }

      let error;
      if (pajilla) {
        // Update
        ({ error } = await supabase
          .from("pajillas")
          .update(pajillaData)
          .eq("id", pajilla.id));
        if (!error) toast.success("Pajilla actualizada correctamente");
      } else {
        // Insert
        const { error: insertError, status } = await supabase
          .from("pajillas")
          .insert([pajillaData]);
        error = insertError;
        if (status === 201) toast.success("Pajilla creada correctamente");
      }

      if (error) {
        toast.error(error.message || "Error, inténtalo nuevamente");
        throw error;
      }

      // Esperar 2.5s antes de redirigir
      await new Promise(res => setTimeout(res, 2500));
      router.push("/dashboard/pajillas");
      router.refresh();

    } catch (error) {
      console.error("Error saving pajilla:", error);
      toast.error("Error al guardar la pajilla. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="bull_name">Nombre del Toro *</Label>
          <Input
            id="bull_name"
            value={formData.bull_name}
            onChange={(e) => setFormData({ ...formData, bull_name: e.target.value })}
            placeholder="Ej: Emperador 3R"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company">Empresa Proveedora *</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            placeholder="Ej: ABS, Semex, CRI"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="breed">Raza *</Label>
          <Select
            value={formData.breed}
            onValueChange={(value) => setFormData({ ...formData, breed: value })}
            required
          >
            <SelectTrigger id="breed">
              <SelectValue placeholder="Selecciona una raza" />
            </SelectTrigger>
            <SelectContent>
              {RAZAS_COLOMBIA.map((raza) => (
                <SelectItem key={raza} value={raza}>
                  {raza}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase_price">Valor de Compra *</Label>
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
          <Label htmlFor="sale_price">Valor de Venta *</Label>
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

        <div className="space-y-2">
          <Label htmlFor="quantity">Cantidad en Inventario</Label>
          <Input
            id="quantity"
            type="number"
            step="1"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>

      {/* Profit Calculation */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Resumen de Precios</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Valor de Compra</p>
              <p className="font-semibold text-foreground">
                ${purchasePrice.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Valor de Venta</p>
              <p className="font-semibold text-foreground">
                ${salePrice.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Ganancia por Unidad</p>
              <p className={`font-semibold ${profit > 0 ? "text-green-600" : profit < 0 ? "text-red-600" : "text-foreground"}`}>
                ${profit.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {pajilla ? "Actualizar Pajilla" : "Crear Pajilla"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
