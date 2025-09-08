export const TokenType = {
  ForgotPasswordToken: 'ForgotPasswordToken',
  AccessToken: 'AccessToken',
  RefreshToken: 'RefreshToken',
  TableToken: 'TableToken'
} as const

export const Role = {
  Owner: 'Owner',
  Employee: 'Employee',
  Guest: 'Guest',
  Customer: 'Customer'
} as const

export const RoleValues = [Role.Owner, Role.Employee, Role.Guest, Role.Customer] as const

export const DishStatus = {
  Available: 'Available',
  Unavailable: 'Unavailable',
  Hidden: 'Hidden'
} as const

export const DishStatusValues = [DishStatus.Available, DishStatus.Unavailable, DishStatus.Hidden] as const

export const TableStatus = {
  Available: 'Available',
  Occupied: 'Occupied',
  Hidden: 'Hidden',
  Reserved: 'Reserved'
} as const

export const TableStatusValues = [
  TableStatus.Available,
  TableStatus.Occupied,
  TableStatus.Hidden,
  TableStatus.Reserved
] as const

export const OrderStatus = {
  Pending: 'Pending',
  Processing: 'Processing',
  Delivered: 'Delivered',
  Paid: 'Paid',
  Cancelled: 'Cancelled'
} as const

export const OrderStatusValues = [
  OrderStatus.Pending,
  OrderStatus.Processing,
  OrderStatus.Delivered,
  OrderStatus.Paid,
  OrderStatus.Cancelled
] as const

export const ManagerRoom = 'manager' as const

export const PromotionType = {
  Discount: 'Discount',
  LoyaltyPoints: 'LoyaltyPoints',
  Percent: 'Percent',
  FreeItem: 'FreeItem'
} as const

export const PromotionTypeValues = [
  PromotionType.Discount,
  PromotionType.LoyaltyPoints,
  PromotionType.Percent,
  PromotionType.FreeItem
] as const

export const AuthorType = {
  Customer: 'Customer',
  Guest: 'Guest'
} as const

export const AuthorTypeValues = [AuthorType.Customer, AuthorType.Guest] as const

export const OrderType = {
  Takeaway: 'takeaway',
  Delivery: 'delivery',
  DineIn: 'dine-in'
} as const

export const OrderTypeValues = [OrderType.Takeaway, OrderType.Delivery, OrderType.DineIn] as const

export const DeliveryStatus = {
  Pending: 'Pending',
  Shipping: 'Shipping',
  Delivered: 'Delivered',
  Cancelled: 'Cancelled'
} as const

export const DeliveryStatusValues = [
  DeliveryStatus.Pending,
  DeliveryStatus.Shipping,
  DeliveryStatus.Delivered,
  DeliveryStatus.Cancelled
] as const
