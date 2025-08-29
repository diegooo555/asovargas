export interface Product {
  id: string
  name: string
  company: string
  purchase_price: number
  sale_price: number
  expenses: number
  profit_percentage: number,
  quantity: number,
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email?: string
  status: "pending" | "processing" | "completed" | "cancelled"
  total_amount: number
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  product?: Product
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

export interface User {
  id: string
  name: string,
  status: string
}
