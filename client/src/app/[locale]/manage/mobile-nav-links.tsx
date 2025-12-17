'use client'
import menuItems from '@/app/manage/menuItems'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Role } from '@/constants/type'
import { Package2, PanelLeft } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAppContext } from '@/components/app-provider'
import { useTranslations } from 'next-intl'

export default function MobileNavLinks() {
  const pathname = usePathname()
  const { role } = useAppContext()
  const t = useTranslations('nav')
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size='icon' variant='outline' className='sm:hidden'>
          <PanelLeft className='h-5 w-5' />
          <span className='sr-only'>{t('menu')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='sm:max-w-xs'>
        <nav className='grid gap-6 text-lg font-medium'>
          <Link
            href='#'
            className='group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base'
          >
            <Package2 className='h-5 w-5 transition-all group-hover:scale-110' />
            <span className='sr-only'>Acme Inc</span>
          </Link>
          {menuItems.map((Item, index) => {
            const isActive = pathname === Item.href
            if (!role || (role !== Role.Owner && role !== Role.Employee) || !Item.role.includes(role)) {
              return null
            }
            return (
              <Link
                key={index}
                href={Item.href}
                className={cn('flex items-center gap-4 px-2.5  hover:text-foreground', {
                  'text-foreground': isActive,
                  'text-muted-foreground': !isActive
                })}
              >
                <Item.Icon className='h-5 w-5' />
                {t(Item.titleKey)}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
