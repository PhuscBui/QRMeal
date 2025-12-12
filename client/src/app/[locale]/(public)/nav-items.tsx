'use client'
import { useAppContext } from '@/components/app-provider'
import { Role } from '@/constants/type'
import { cn, handleErrorApi } from '@/lib/utils'
import { useLogoutMutation } from '@/queries/useAuth'
import { RoleType } from '@/types/jwt.types'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export default function NavItems({ className }: { className?: string }) {
  const { role, setRole, disconnectSocket } = useAppContext()
  const logoutMutation = useLogoutMutation()
  const router = useRouter()
  const t = useTranslations('navItems')
  const tCommon = useTranslations('common')

  const menuItems: {
    titleKey: string
    href: string
    role?: RoleType[]
    hideWhenLogin?: boolean
  }[] = [
    {
      titleKey: 'homePage',
      href: '/'
    },
    {
      titleKey: 'booking',
      href: '/guest/booking',
      role: [Role.Guest]
    },
    {
      titleKey: 'promotions',
      href: '/guest/promotions',
      role: [Role.Guest]
    },
    {
      titleKey: 'menu',
      href: '/guest/menu',
      role: [Role.Guest]
    },
    {
      titleKey: 'orders',
      href: '/guest/orders',
      role: [Role.Guest]
    },
    {
      titleKey: 'promotions',
      href: '/customer/promotions',
      role: [Role.Customer]
    },
    {
      titleKey: 'selectOrderType',
      href: '/customer/order-type',
      role: [Role.Customer]
    },
    {
      titleKey: 'account',
      href: '/customer/account',
      role: [Role.Customer]
    },
    {
      titleKey: 'loginEmployee',
      href: '/login',
      hideWhenLogin: true
    },
    {
      titleKey: 'loginCustomer',
      href: '/customer/login',
      hideWhenLogin: true
    },
    {
      titleKey: 'dashboard',
      href: '/manage/dashboard',
      role: [Role.Owner]
    },
    {
      titleKey: 'orders',
      href: '/manage/orders',
      role: [Role.Employee, Role.Owner]
    }
  ]

  const logout = async () => {
    if (logoutMutation.isPending) return
    try {
      await logoutMutation.mutateAsync()
      setRole()
      disconnectSocket()
      router.push('/')
    } catch (error: unknown) {
      handleErrorApi({
        error
      })
    }
  }
  return (
    <>
      {menuItems.map((item) => {
        // Trường hợp đăng nhập thì chỉ hiển thị menu đăng nhập
        const isAuth = item.role && role && item.role.includes(role)
        // Trường hợp menu item có thể hiển thị dù cho đã đăng nhập hay chưa
        const canShow = (item.role === undefined && !item.hideWhenLogin) || (!role && item.hideWhenLogin)
        if (isAuth || canShow) {
          return (
            <Link href={item.href} key={item.href} className={className}>
              {t(item.titleKey)}
            </Link>
          )
        }
        return null
      })}
      {role && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <div className={cn(className, 'cursor-pointer')}>{t('logout')}</div>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('logoutConfirm')}</AlertDialogTitle>
              <AlertDialogDescription>{t('logoutDescription')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={logout}>{t('ok')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}

