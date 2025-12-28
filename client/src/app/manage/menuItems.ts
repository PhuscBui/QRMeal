import { Role } from '@/constants/type'
import {
  Home,
  ShoppingCart,
  Users2,
  Salad,
  Table,
  Tickets,
  BookType,
  TableProperties,
  SquareUser,
  MessagesSquare,
  Star
} from 'lucide-react'

const menuItems = [
  {
    titleKey: 'dashboard',
    Icon: Home,
    href: '/manage/dashboard',
    role: [Role.Owner]
  },
  {
    titleKey: 'orders',
    Icon: ShoppingCart,
    href: '/manage/orders',
    role: [Role.Owner, Role.Employee]
  },
  {
    titleKey: 'tables',
    Icon: Table,
    href: '/manage/tables',
    role: [Role.Owner, Role.Employee]
  },
  {
    titleKey: 'categories',
    Icon: BookType,
    href: '/manage/categories',
    role: [Role.Owner, Role.Employee]
  },
  {
    titleKey: 'dishes',
    Icon: Salad,
    href: '/manage/dishes',
    role: [Role.Owner, Role.Employee]
  },
  {
    titleKey: 'promotions',
    Icon: Tickets,
    href: '/manage/promotions',
    role: [Role.Owner, Role.Employee]
  },
  {
    titleKey: 'accounts',
    Icon: Users2,
    href: '/manage/accounts',
    role: [Role.Owner]
  },
  {
    titleKey: 'shifts',
    Icon: TableProperties,
    href: '/manage/shifts',
    role: [Role.Owner]
  },
  {
    titleKey: 'myShifts',
    Icon: SquareUser,
    href: '/manage/my-shifts',
    role: [Role.Employee, Role.Owner]
  },
  {
    titleKey: 'support',
    Icon: MessagesSquare,
    href: '/manage/support',
    role: [Role.Owner, Role.Employee]
  },
  {
    titleKey: 'reviews',
    Icon: Star,
    href: '/manage/reviews',
    role: [Role.Owner, Role.Employee]
  }
]

export default menuItems
