import { Role } from '@/constants/type'
import { Home, ShoppingCart, Users2, Salad, Table, Tickets } from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    Icon: Home,
    href: '/manage/dashboard',
    role: [Role.Owner]
  },
  {
    title: 'Orders',
    Icon: ShoppingCart,
    href: '/manage/orders',
    role: [Role.Owner, Role.Employee]
  },
  {
    title: 'Tables',
    Icon: Table,
    href: '/manage/tables',
    role: [Role.Owner, Role.Employee]
  },
  {
    title: 'Dishes',
    Icon: Salad,
    href: '/manage/dishes',
    role: [Role.Owner, Role.Employee]
  },
  {
    title: 'Promotions',
    Icon: Tickets,
    href: '/manage/promotions',
    role: [Role.Owner, Role.Employee]
  },
  {
    title: 'Accounts',
    Icon: Users2,
    href: '/manage/accounts',
    role: [Role.Owner]
  }
]

export default menuItems
