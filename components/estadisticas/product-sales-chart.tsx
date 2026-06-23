"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface ProductData {
  name: string
  quantity: number
  revenue: number
}

interface ProductSalesChartProps {
  data: ProductData[]
}

export function ProductSalesChart({ data }: ProductSalesChartProps) {
  const chartData = data.slice(0, 10)

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value: number, name: string) => [
              value.toLocaleString("es-CO"),
              name === "quantity" ? "Cantidad" : "Ingresos",
            ]}
          />
          <Bar dataKey="quantity" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
