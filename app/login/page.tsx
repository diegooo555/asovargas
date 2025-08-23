"use client"

import { getSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Leaf } from "lucide-react"
import { useActionState } from "react"
import { authenticate } from "@/app/lib/actions"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 bg-primary rounded-lg">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="p-2 bg-green-600 rounded-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-green-800">ASOVARGAS</h1>
            <p className="text-green-600">Sistema de Gestión Empresarial</p>
          </div>

          {/* Card login */}
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center text-green-800">
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-center text-green-600">
                Ingresa tus credenciales para acceder al dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction} className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-green-700">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    name="email" // necesario para authenticate
                    type="email"
                    placeholder="usuario@asovargas.com"
                    required
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-green-700">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    name="password" // necesario para authenticate
                    type="password"
                    required
                    minLength={6}
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                {/* Callback hidden */}
                <input type="hidden" name="redirectTo" value={callbackUrl} />

                {/* Botón */}
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  aria-disabled={isPending}
                >
                  {isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>

                {/* Mensajes de error */}
                <div
                  className="flex h-6 items-center space-x-1 justify-center"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {errorMessage && (
                    <>
                      <p className="text-sm text-red-500">{errorMessage}</p>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-green-500">
            © 2025 ASOVARGAS - Todos los derechos reservados
          </div>
        </div>
      </div>
    </div>
  )
}
