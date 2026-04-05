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

export interface Variable {
  variable_id: number
  detail: string
  amount: number
  created_at: string
  updated_at: string
}

export interface EditVariableModalProps {
  variable: Variable
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export interface VariableFortnight {
  variable_id: number
  detail: string
  date_value: string
  created_at: string
  updated_at: string
}

export interface EditFortnightModalProps {
  variable: VariableFortnight
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export interface ProductionRecord {
  production_record_id: string
  client_id: string
  liters: number
  production_datetime: string
  created_at: string
  updated_at: string
}

export interface ProductionStats {
  totalLiters: number
}

export interface UserProductionHistoryProps {
  userId: string
}

export interface Client {
  client_id: string
  document: string
  name: string
  email: string
  phone: string
  credits: number
  address: string
  type_client: "associate" | "buyer"
  created_at: string
}

export interface UserDetailsProps {
  userId: string
}

export interface Pajilla {
  id: string
  bull_name: string
  company: string
  breed: string
  purchase_price: number
  sale_price: number
  quantity: number
  created_at: string
  updated_at: string
}

export type SaleType = "contado" | "transferencia" | "credito"

export interface Buy {
  id: string
  client_id: string
  buy_number: string
  sale_type: SaleType
  total_amount: number
  created_at: string
  updated_at: string
  client?: Client
}

export interface BuyItem {
  id: string
  buy_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  product?: Product
}

export interface BuyPajillaItem {
  id: string
  buy_id: string
  pajilla_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  pajilla?: Pajilla
}

export interface BuyWithItems extends Buy {
  buy_items: BuyItem[]
  buy_pajilla_items: BuyPajillaItem[]
}