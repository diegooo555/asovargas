import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Leaf, BarChart3, Users, Package, ShoppingCart, TrendingUp, CheckCircle } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary rounded-lg">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="p-2 bg-green-600 rounded-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-green-800">ASOVARGAS</h1>
                <p className="text-sm text-green-600 hidden sm:block">Sistema de Gestión Empresarial</p>
              </div>
            </div>

            {/* Login Button */}
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/login">
                Iniciar Sesión
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-green-900 mb-6">
              Gestión Empresarial
              <span className="block text-green-600">Inteligente y Eficaz</span>
            </h1>
            <p className="text-xl text-green-700 mb-8 leading-relaxed">
              Optimiza tu negocio con nuestro sistema integral de gestión. 
              Controla inventarios, órdenes, usuarios y producción desde una sola plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3">
                <Link href="/login">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Acceder al Dashboard
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 border-green-300 text-green-700 hover:bg-green-50">
                Conocer Más
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
              Funcionalidades Principales
            </h2>
            <p className="text-lg text-green-700 max-w-2xl mx-auto">
              Todo lo que necesitas para administrar tu empresa de manera eficiente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Package,
                title: "Gestión de Productos",
                description: "Administra tu inventario con control de precios, costos y márgenes de ganancia",
                color: "text-blue-600",
                bgColor: "bg-blue-50"
              },
              {
                icon: ShoppingCart,
                title: "Control de Órdenes",
                description: "Gestiona pedidos y compras con seguimiento completo del estado",
                color: "text-green-600",
                bgColor: "bg-green-50"
              },
              {
                icon: Users,
                title: "Gestión de Usuarios",
                description: "Administra clientes, asociados y compradores con historial de deudas",
                color: "text-purple-600",
                bgColor: "bg-purple-50"
              },
              {
                icon: TrendingUp,
                title: "Control de Producción",
                description: "Monitorea la producción y registra datos de rendimiento",
                color: "text-orange-600",
                bgColor: "bg-orange-50"
              }
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 border-green-100">
                <CardHeader>
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-lg text-green-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-700">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-6">
                ¿Por qué elegir ASOVARGAS?
              </h2>
              <div className="space-y-4">
                {[
                  "Interface intuitiva y fácil de usar",
                  "Reportes y estadísticas en tiempo real",
                  "Control completo de inventarios",
                  "Gestión integral de clientes y deudas",
                  "Seguimiento detallado de producción",
                  "Acceso seguro y confiable"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="text-green-800">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Productos Gestionados", value: "500+", icon: Package },
                { label: "Órdenes Procesadas", value: "1,200+", icon: ShoppingCart },
                { label: "Usuarios Activos", value: "150+", icon: Users },
                { label: "Eficiencia", value: "98%", icon: TrendingUp }
              ].map((stat, index) => (
                <Card key={index} className="text-center border-green-200">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <stat.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-900">{stat.value}</div>
                    <p className="text-sm text-green-700">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-green-600">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Comienza a optimizar tu negocio hoy
            </h2>
            <p className="text-xl text-green-100 mb-8">
              Únete a las empresas que ya confían en ASOVARGAS para gestionar sus operaciones
            </p>
            <Button asChild size="lg" className="bg-white text-green-600 hover:bg-green-50 text-lg px-8 py-3">
              <Link href="/login">
                <BarChart3 className="h-5 w-5 mr-2" />
                Iniciar Sesión Ahora
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-green-900 text-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="p-2 bg-green-700 rounded-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="p-2 bg-green-700 rounded-lg">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">ASOVARGAS</h3>
                <p className="text-sm text-green-300">Sistema de Gestión Empresarial</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-green-300 text-sm">
                © 2025 ASOVARGAS - Todos los derechos reservados
              </p>
              <p className="text-green-400 text-xs mt-1">
                Desarrollado con tecnología de vanguardia
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}