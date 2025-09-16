import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, Plus, BarChart3 } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"

export function DashboardHeader() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <MobileNav />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <Link href="/dashboard">
                <h1 className="text-2xl font-bold text-foreground">ASOVARGAS</h1>
                <p className="text-sm text-muted-foreground hidden sm:block">Dashboard Empresarial</p>
              </Link>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard/productos" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Productos
            </Link>
            <Link href="/dashboard/ordenes" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Órdenes
            </Link>
            <Link href="/dashboard/compras" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Compras
            </Link>  
            <Link href="/dashboard/usuarios" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Usuarios
            </Link>  
            <Link href="/dashboard/produccion" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Producción
            </Link>  
            <Link href="/dashboard/variables" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Variables
            </Link>              
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" asChild className="hidden sm:flex bg-transparent">
              <Link href="/dashboard/productos/nuevo">
                <Package className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard/ordenes/nueva">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Nueva Orden</span>
                <span className="sm:hidden">Nueva</span>
              </Link>
            </Button>            
          </div>
        </div>
      </div>
    </header>
  )
}
