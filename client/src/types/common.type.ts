export type TableInfo = {
  tableId: string
  tableNumber: number
  capacity: number
  location: string
  status: string
  token: string
}

export type Step = {
  id: number
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'Completed' | 'Current' | 'Pending'
  timestamp: string | null
}
