"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase/client"
import { CheckCircle, XCircle, Clock } from "lucide-react"

interface Debt {
  debt_id: string
  description: string
  total: number
  status: "pending" | "paid" | "cancelled"
  date: string
  created_at: string
}

interface UserDebtsProps {
  userId: string
}

export function UserDebts({ userId }: UserDebtsProps) {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDebts()
  }, [userId])

  const fetchDebts = async () => {
    try {
      if (!supabase) {
        throw new Error("Supabase no está configurado")
      }

      const { data, error } = await supabase
        .from("debts")
        .select("*")
        .eq("client_id", userId)
        .order("created_at", { ascending: false })


      if (error) throw error
      setDebts(data || [])
    } catch (error) {
      console.error("Error fetching debts:", error)
        //toast
    } finally {
      setLoading(false)
    }
  }

  const updateDebtStatus = async (debtId: string, newStatus: "paid" | "cancelled") => {
    try {
      if (!supabase) throw new Error("Supabase no está configurado")

      const { error } = await supabase.from("debts").update({ status: newStatus }).eq("debt_id", debtId)

      if (error) throw error

      setDebts((prev) => prev.map((debt) => (debt.debt_id === debtId ? { ...debt, status: newStatus } : debt)))

      //toast
    } catch (error) {
      console.error("Error updating debt:", error)
      //toast
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "paid":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Pagada
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <Skeleton className="h-64 w-full" />
  }

  return (
    <div className="space-y-4">
      {debts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay deudas registradas para este usuario</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descripción</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debts.map((debt) => (
                <TableRow key={debt.debt_id}>
                  <TableCell>{debt.description || "Sin descripción"}</TableCell>
                  <TableCell className="font-medium">${debt.total.toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(debt.status)}</TableCell>
                  <TableCell>{new Date(debt.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    {debt.status === "pending" && (
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateDebtStatus(debt.debt_id, "paid")}
                          className="text-green-600 hover:text-green-700"
                        >
                          Marcar Pagada
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateDebtStatus(debt.debt_id, "cancelled")}
                          className="text-red-600 hover:text-red-700"
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
