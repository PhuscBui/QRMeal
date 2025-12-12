'use client'

import { useTranslations, useLocale } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LanguageSwitcher from '@/components/language-switcher'
import {
  Globe,
  Languages,
  Code,
  CheckCircle2,
  ArrowRight,
  Home,
  UtensilsCrossed,
  ShoppingCart,
  Users
} from 'lucide-react'

export default function I18nDemoPage() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()

  const namespaces = [
    { name: 'common', icon: Globe, keys: ['welcome', 'save', 'cancel', 'delete', 'edit'] },
    { name: 'auth', icon: Users, keys: ['login', 'logout', 'register', 'email', 'password'] },
    { name: 'nav', icon: Home, keys: ['home', 'menu', 'orders', 'dashboard'] },
    { name: 'menu', icon: UtensilsCrossed, keys: ['title', 'addDish', 'dishName', 'dishPrice'] },
    { name: 'order', icon: ShoppingCart, keys: ['title', 'newOrder', 'orderStatus', 'checkout'] }
  ]

  return (
    <div className='container mx-auto p-6 max-w-6xl'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <h1 className='text-4xl font-bold mb-2 flex items-center gap-3'>
            <Languages className='w-10 h-10' />
            {locale === 'vi' ? 'Demo Đa Ngôn Ngữ' : 'i18n Demo'}
          </h1>
          <p className='text-muted-foreground'>
            {locale === 'vi' ? 'Ví dụ minh họa sử dụng next-intl trong QRMeal' : 'Example of using next-intl in QRMeal'}
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Current Locale Info */}
      <Card className='mb-6 border-primary/20 bg-primary/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Globe className='w-5 h-5' />
            {locale === 'vi' ? 'Ngôn Ngữ Hiện Tại' : 'Current Language'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4'>
            <Badge variant='default' className='text-lg py-2 px-4'>
              {locale === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
            </Badge>
            <code className='text-sm bg-muted px-3 py-1 rounded'>locale: "{locale}"</code>
          </div>
        </CardContent>
      </Card>

      {/* Translation Examples */}
      <div className='grid gap-6 mb-6'>
        {namespaces.map(({ name, icon: Icon, keys }) => {
          const tNamespace = useTranslations(name)
          return (
            <Card key={name}>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Icon className='w-5 h-5' />
                  <code className='text-primary'>{name}</code>
                </CardTitle>
                <CardDescription>
                  {locale === 'vi' ? `Các bản dịch trong namespace "${name}"` : `Translations in "${name}" namespace`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                  {keys.map((key) => (
                    <div
                      key={key}
                      className='p-3 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-colors'
                    >
                      <div className='flex items-start justify-between gap-2 mb-1'>
                        <code className='text-xs text-muted-foreground'>{key}</code>
                        <CheckCircle2 className='w-3 h-3 text-green-500 flex-shrink-0' />
                      </div>
                      <p className='font-medium text-sm'>{tNamespace(key)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Navigation Examples */}
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Code className='w-5 h-5' />
            {locale === 'vi' ? 'Navigation với i18n' : 'i18n Navigation'}
          </CardTitle>
          <CardDescription>
            {locale === 'vi' ? 'Sử dụng Link component từ @/i18n/routing' : 'Using Link component from @/i18n/routing'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-3'>
            <Link href='/'>
              <Button variant='outline' className='gap-2'>
                <Home className='w-4 h-4' />
                {t('nav.home')}
                <ArrowRight className='w-4 h-4' />
              </Button>
            </Link>
            <Button variant='outline' className='gap-2' onClick={() => router.push('/')}>
              {locale === 'vi' ? 'Router Push' : 'Router Push'}
              <ArrowRight className='w-4 h-4' />
            </Button>
          </div>
          <div className='mt-4 p-4 bg-muted rounded-lg'>
            <p className='text-sm font-mono'>
              {locale === 'vi' ? '// Link tự động thêm locale prefix' : '// Link automatically adds locale prefix'}
            </p>
            <code className='text-xs text-muted-foreground'>{`<Link href="/">{t('nav.home')}</Link>`}</code>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Code className='w-5 h-5' />
            {locale === 'vi' ? 'Ví Dụ Sử Dụng' : 'Usage Examples'}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <h4 className='font-semibold mb-2 text-sm'>
              {locale === 'vi' ? 'Server Component:' : 'Server Component:'}
            </h4>
            <pre className='p-4 bg-muted rounded-lg overflow-x-auto text-xs'>
              <code>{`import { useTranslations } from 'next-intl'

export default function MyComponent() {
  const t = useTranslations('common')
  return <h1>{t('welcome')}</h1>
}`}</code>
            </pre>
          </div>

          <div>
            <h4 className='font-semibold mb-2 text-sm'>
              {locale === 'vi' ? 'Client Component:' : 'Client Component:'}
            </h4>
            <pre className='p-4 bg-muted rounded-lg overflow-x-auto text-xs'>
              <code>{`'use client'

import { useTranslations } from 'next-intl'

export default function MyComponent() {
  const t = useTranslations('auth')
  return <button>{t('login')}</button>
}`}</code>
            </pre>
          </div>

          <div>
            <h4 className='font-semibold mb-2 text-sm'>
              {locale === 'vi' ? 'Multiple Namespaces:' : 'Multiple Namespaces:'}
            </h4>
            <pre className='p-4 bg-muted rounded-lg overflow-x-auto text-xs'>
              <code>{`const t = useTranslations('common')
const tAuth = useTranslations('auth')
const tNav = useTranslations('nav')

return (
  <>
    <h1>{t('welcome')}</h1>
    <button>{tAuth('login')}</button>
    <nav>{tNav('home')}</nav>
  </>
)`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className='mt-8 text-center text-sm text-muted-foreground'>
        <p>
          {locale === 'vi' ? '📚 Xem I18N_GUIDE.md để biết thêm chi tiết' : '📚 See I18N_GUIDE.md for more details'}
        </p>
      </div>
    </div>
  )
}
