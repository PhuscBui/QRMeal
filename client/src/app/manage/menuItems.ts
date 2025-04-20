import { Home, ShoppingCart, Users2, Salad, Table } from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    Icon: Home,
    href: '/manage/dashboard'
  },
  {
    title: 'Orders',
    Icon: ShoppingCart,
    href: '/manage/orders'
  },
  {
    title: 'Tables',
    Icon: Table,
    href: '/manage/tables'
  },
  {
    title: 'Dishes',
    Icon: Salad,
    href: '/manage/dishes'
  },
  {
    title: 'Accounts',
    Icon: Users2,
    href: '/manage/accounts'
  }
]

export default menuItems
