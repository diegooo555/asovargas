import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CardItemProps {
  title: string
  icon: ReactNode
  children: ReactNode
}

export function CardItem({title, icon, children}: CardItemProps) {
    return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{children}</div>
          </CardContent>
        </Card>
    )
}