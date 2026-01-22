'use client'

import type React from 'react'

import { usePathname } from 'next/navigation'
import { Home, Menu, ShoppingCart, User, Gift, Package2, Bell, QrCode, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import DarkModeToggle from '@/components/dark-mode-toggle'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import ChatWidget from '@/components/chat-widget'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from '@/components/language-switcher'

export default function CustomerLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const [orderType, setOrderType] = useState<string | null>(null)
  const t = useTranslations('customerNav')
  const tNav = useTranslations('nav')

  const navigation = [
    { nameKey: 'home', href: '/customer', icon: Home },
    { nameKey: 'selectOrderType', href: '/customer/order-type', icon: Menu },
    { nameKey: 'promotions', href: '/customer/promotions', icon: Gift, useNav: true },
    { nameKey: 'scanQRCode', href: '/customer/scan-qr', icon: QrCode },
    { nameKey: 'reservations', href: '/customer/reservations', icon: Package2, useNav: true },
    {
      nameKey: 'account',
      href: '/customer/account/profile',
      icon: User,
      useNav: true,
      children: [
        { nameKey: 'profile', href: '/customer/account/profile' },
        { nameKey: 'orders', href: '/customer/account/orders' },
        { nameKey: 'settings', href: '/customer/account/settings' }
      ]
    }
  ]

  useEffect(() => {
    const storedOrderType = localStorage.getItem('orderType')
    setOrderType(storedOrderType)
  }, [])

  return (
    <div className='flex min-h-screen w-full flex-col relative'>
      {/* Header */}
      <header className='sticky z-20 top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm'>
        <Link href='/customer' className='flex items-center gap-2 text-lg font-semibold md:text-base'>
          <Package2 className='h-6 w-6' />
          <span className='hidden sm:inline'>QRMeal</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className='hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6'>
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/customer' && pathname.startsWith(item.href))
            const itemName = item.useNav ? tNav(item.nameKey) : t(item.nameKey)

            if (item.children) {
              return (
                <DropdownMenu key={item.nameKey}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      className={cn(
                        'flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground h-auto p-2',
                        isActive && 'text-foreground font-medium'
                      )}
                    >
                      <item.icon className='h-4 w-4' />
                      <span className='hidden lg:inline'>{itemName}</span>
                      <ChevronDown className='h-3 w-3' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-48'>
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.nameKey} asChild>
                        <Link
                          href={child.href}
                          className={cn(
                            'flex items-center w-full cursor-pointer',
                            pathname === child.href && 'bg-accent text-accent-foreground'
                          )}
                        >
                          {t(child.nameKey)}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }

            return (
              <Link
                key={item.nameKey}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'text-foreground font-medium'
                )}
              >
                <item.icon className='h-4 w-4' />
                <span className='hidden lg:inline'>{itemName}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right side actions */}
        <div className='ml-auto flex items-center gap-2'>
          <Button variant='ghost' size='icon' className='relative'>
            <Bell className='h-5 w-5' />
          </Button>

          <Button variant='ghost' size='icon' className='relative' disabled={!orderType}>
            <Link href={`/customer/${orderType ?? ''}/orders`}>
              <ShoppingCart className='h-5 w-5' />
            </Link>
          </Button>

          <LanguageSwitcher />
          <DarkModeToggle />
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='outline' size='icon' className='shrink-0 md:hidden'>
              <Menu className='h-5 w-5' />
              <span className='sr-only'>Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='w-64'>
            <nav className='grid gap-6 text-lg font-medium pl-2'>
              <Link href='/customer' className='flex items-center gap-2 text-lg font-semibold'>
                <Package2 className='h-6 w-6' />
                <span>QRMeal</span>
              </Link>

              <div className='space-y-2'>
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href || (item.href !== '/customer' && pathname.startsWith(item.href))
                  const itemName = item.useNav ? tNav(item.nameKey) : t(item.nameKey)

                  if (item.children) {
                    return (
                      <div key={item.nameKey} className='space-y-1'>
                        <div
                          className={cn(
                            'flex items-center gap-3 text-muted-foreground p-2 rounded-md font-medium',
                            isActive && 'text-foreground bg-accent'
                          )}
                        >
                          <item.icon className='h-5 w-5' />
                          {itemName}
                        </div>
                        <div className='ml-8 space-y-1'>
                          {item.children.map((child) => (
                            <Link
                              key={child.nameKey}
                              href={child.href}
                              className={cn(
                                'block text-sm text-muted-foreground transition-colors hover:text-foreground p-2 rounded-md',
                                pathname === child.href && 'text-foreground font-medium bg-accent'
                              )}
                            >
                              {t(child.nameKey)}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.nameKey}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground p-2 rounded-md',
                        isActive && 'text-foreground font-medium bg-accent'
                      )}
                    >
                      <item.icon className='h-5 w-5' />
                      {itemName}
                    </Link>
                  )
                })}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className='flex flex-1 flex-col'>
        {children} <ChatWidget />
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className='md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border'>
        <nav className='flex items-center justify-around py-2'>
          {navigation.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || (item.href !== '/customer' && pathname.startsWith(item.href))
            const itemName = item.useNav ? tNav(item.nameKey) : t(item.nameKey)
            return (
              <Link
                key={item.nameKey}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 text-xs transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className='h-5 w-5' />
                <span className='text-xs'>{itemName}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Add bottom padding for mobile to account for bottom navigation */}
      <div className='md:hidden h-16' />
    </div>
  )
}
