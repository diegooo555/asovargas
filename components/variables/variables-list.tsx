"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, DollarSign, Calculator } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { EditVariableModal } from "./edit-variable-modal"
import { toast } from "react-toastify"
import { EditVariableFortnight } from "./edit-variable-fortnight"
import { Variable, VariableFortnight } from "@/lib/types"

export function VariablesList() {
  const [variables, setVariables] = useState<Variable[]>([])
  const [variablesFortnight, setVariablesFortnight] = useState<VariableFortnight[]>([])
  const [loading, setLoading] = useState(true)
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null)
  const [editingFortnight, setEditingFortnight] = useState<VariableFortnight | null>(null)

  useEffect(() => {
    fetchVariables()
    fetchVariablesFortnight()
  }, [])

  const fetchVariables = async () => {
    try {
      const { data, error } = await supabase.from("variables").select("*").order("variable_id", { ascending: true })

      if (error) throw error
      setVariables(data || [])
    } catch (error) {
      console.error("Error fetching variables:", error)
      toast.error("No se pudieron cargar las variables")
    } finally {
      setLoading(false)
    }
  }
  

  const fetchVariablesFortnight = async () => {
    try {
      const { data, error } = await supabase.from("fortnight_variables").select("*").order("variable_id", { ascending: true })
      console.log(data)
      if (error) throw error
      setVariablesFortnight(data || [])
    } catch (error) {
      console.error("Error fetching variables:", error)
      toast.error("No se pudieron cargar las variables")
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

  const getCalculations = () => {
    const valorFacturaVar = variables.find((v) => v.detail.toLowerCase().includes("valor factura"))
    if (!valorFacturaVar) return null

    const valorFactura = valorFacturaVar.amount
    const retefuente = Math.round(valorFactura * 0.0017)
    const neto = valorFactura - retefuente

    return {
      valorFactura,
      retefuente,
      neto,
    }
  }

  const calculations = getCalculations()

  const handleEditSuccess = () => {
    fetchVariables()
    setEditingVariable(null)
  }

    const handleEditSuccessFortnight = () => {
    fetchVariablesFortnight()
    setEditingFortnight(null)
  }

  if (loading) {
    return <div className="text-center py-8">Cargando variables...</div>
  }

  return (
    <>
      {calculations && (
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-4">
            <Calculator className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-800">Cálculos Automáticos</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">Valor Factura</p>
              <p className="text-xl font-bold text-gray-900">${formatAmount(calculations.valorFactura)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">Retefuente (0.17%)</p>
              <p className="text-xl font-bold text-red-600">${formatAmount(calculations.retefuente)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-gray-600 mb-1">Neto</p>
              <p className="text-xl font-bold text-green-600">${formatAmount(calculations.neto)}</p>
            </div>
          </div>
        </div>
      )}

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

        {variablesFortnight.map((variable) => (
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
                    {variable.date_value}
                  </Badge>
                  <span className="text-xs text-gray-500">ID: {variable.variable_id}</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingFortnight(variable)}
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

      {editingFortnight && (
        <EditVariableFortnight
          variable={editingFortnight}
          isOpen={!!editingFortnight}
          onClose={() => setEditingFortnight(null)}
          onSuccess={handleEditSuccessFortnight}
        />
      )}      
    </>
  )
}
