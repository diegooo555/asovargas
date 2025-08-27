"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Package, ShoppingCart, BarChart3, Plus, User, BarChart } from "lucide-react"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col space-y-6 py-6">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <Link href="/dashboard">
              <h1 className="text-xl font-bold text-foreground">ASOVARGAS</h1>
              <p className="text-xs text-muted-foreground">Dashboard Empresarial</p>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-4">
            <Link
              href="/dashboard/productos"
              className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setOpen(false)}
            >
              <Package className="h-5 w-5" />
              <span>Productos</span>
            </Link>
            <Link
              href="/dashboard/ordenes"
              className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setOpen(false)}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Órdenes</span>
            </Link>

            <Link
              href="/dashboard/compras"
              className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setOpen(false)}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Compras</span>
            </Link>      

            <Link
              href="/dashboard/usuarios"
              className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setOpen(false)}
            >
              <User className="h-5 w-5" />
              <span>Usuarios</span>
            </Link>   

            <Link
              href="/dashboard/produccion"
              className="flex items-center space-x-3 text-muted-foreground hover:text-primary transition-colors font-medium py-2"
              onClick={() => setOpen(false)}
            >
              <BarChart className="h-5 w-5" />
              <span>Producción</span>
            </Link> 
          </nav>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 pt-6 border-t">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/productos/nuevo" onClick={() => setOpen(false)}>
                <Package className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard/ordenes/nueva" onClick={() => setOpen(false)}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Orden
              </Link>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
