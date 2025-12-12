import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  // Danh sách các locale được hỗ trợ
  locales: ['vi', 'en'],

  // Locale mặc định khi không có locale trong URL
  defaultLocale: 'vi',

  // Tự động detect locale từ header Accept-Language
  localeDetection: true,

  // Prefix cho locale trong URL
  // 'always' => luôn hiển thị locale trong URL (/vi/home, /en/home)
  // 'as-needed' => chỉ hiển thị locale khi không phải default locale
  localePrefix: 'as-needed',

  // Các path không cần prefix locale
  pathnames: {
    '/': '/',
    '/login': '/login',
    '/customer/login': '/customer/login',
    '/customer/register': '/customer/register'
  }
})

// Tạo navigation helpers với i18n
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)


