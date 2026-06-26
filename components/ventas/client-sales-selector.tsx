"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ClientSalesSelectorProps {
  clients: { client_id: string; name: string; document: string }[]
}

export function ClientSalesSelector({ clients }: ClientSalesSelectorProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentClientId = searchParams.get("clientId") || ""

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("clientId", value)
    } else {
      params.delete("clientId")
    }
    params.delete("page")
    router.push(`/dashboard/ventas?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 min-w-[250px]">
      <Label className="text-sm text-muted-foreground shrink-0">Cliente:</Label>
      <Select value={currentClientId} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Todos los clientes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value=" ">Todos los clientes</SelectItem>
          {clients.map((c) => (
            <SelectItem key={c.client_id} value={c.client_id}>
              {c.name} — {c.document}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
