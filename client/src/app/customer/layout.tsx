'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Menu, ShoppingCart, User, Gift, Package2, Bell, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import DarkModeToggle from '@/components/dark-mode-toggle'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Home', href: '/customer', icon: Home },
  { name: 'Select Order Type', href: '/customer/order-type', icon: Menu },
  { name: 'Promotions', href: '/customer/promotions', icon: Gift },
  { name: 'Scan QR Code', href: '/customer/scan-qr', icon: QrCode },
  { name: 'Account', href: '/customer/account/profile', icon: User }
]

export default function CustomerLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()

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
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'text-foreground font-medium'
                )}
              >
                <item.icon className='h-4 w-4' />
                <span className='hidden lg:inline'>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right side actions */}
        <div className='ml-auto flex items-center gap-2'>
          <Button variant='ghost' size='icon' className='relative'>
            <Bell className='h-5 w-5' />
            <Badge variant='destructive' className='absolute -top-1 -right-1 h-5 w-5 p-0 text-xs'>
              3
            </Badge>
          </Button>

          <Button variant='ghost' size='icon' className='relative'>
            <ShoppingCart className='h-5 w-5' />
            <Badge variant='destructive' className='absolute -top-1 -right-1 h-5 w-5 p-0 text-xs'>
              2
            </Badge>
          </Button>

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
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground p-2 rounded-md',
                        isActive && 'text-foreground font-medium bg-accent'
                      )}
                    >
                      <item.icon className='h-5 w-5' />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className='flex flex-1 flex-col'>{children}</main>

      {/* Bottom Navigation for Mobile */}
      <div className='md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border'>
        <nav className='flex items-center justify-around py-2'>
          {navigation.slice(0, 4).map((item) => {
            const isActive = pathname === item.href || (item.href !== '/customer' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 text-xs transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <item.icon className='h-5 w-5' />
                <span className='text-xs'>{item.name}</span>
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
