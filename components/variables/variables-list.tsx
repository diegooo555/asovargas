"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, DollarSign } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "react-toastify"
import { EditVariableModal } from "./edit-variable-modal"

interface Variable {
  variable_id: number
  detail: string
  amount: number
  created_at: string
  updated_at: string
}

export function VariablesList() {
  const [variables, setVariables] = useState<Variable[]>([])
  const [loading, setLoading] = useState(true)
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null)

  useEffect(() => {
    fetchVariables()
  }, [])

  const fetchVariables = async () => {
    try {
      const { data, error } = await supabase.from("variables").select("*").order("detail", { ascending: true })

      if (error) throw error
      setVariables(data || [])
    } catch (error) {
      console.error("Error fetching variables:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las variables",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    // Format small decimals with more precision
    if (Math.abs(amount) < 1) {
      return amount.toFixed(8).replace(/\.?0+$/, "")
    }
    // Format large numbers with thousands separator
    return new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const handleEditSuccess = () => {
    fetchVariables()
    setEditingVariable(null)
  }

  if (loading) {
    return <div className="text-center py-8">Cargando variables...</div>
  }

  return (
    <>
      <div className="space-y-4">
        {variables.map((variable) => (
          <div
            key={variable.variable_id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{variable.detail}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ${formatAmount(variable.amount)}
                  </Badge>
                  <span className="text-xs text-gray-500">ID: {variable.variable_id}</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingVariable(variable)}
              className="text-green-600 border-green-200 hover:bg-green-50"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>
        ))}

        {variables.length === 0 && <div className="text-center py-8 text-gray-500">No hay variables configuradas</div>}
      </div>

      {editingVariable && (
        <EditVariableModal
          variable={editingVariable}
          isOpen={!!editingVariable}
          onClose={() => setEditingVariable(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  )
}
