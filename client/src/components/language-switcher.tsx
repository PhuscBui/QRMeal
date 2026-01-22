'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'

const locales = [
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'en', label: 'English', flag: '🇬🇧' }
]

export default function LanguageSwitcher() {
  const t = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  const currentLocale = locales.find((l) => l.value === locale) || locales[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon' className='relative'>
          <Languages className='h-[1.2rem] w-[1.2rem]' />
          <span className='sr-only'>{t('language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc.value}
            onClick={() => handleLanguageChange(loc.value)}
            className='cursor-pointer'
          >
            <span className='mr-2 text-lg'>{loc.flag}</span>
            <span className={locale === loc.value ? 'font-bold' : ''}>
              {loc.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


