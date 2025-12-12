import { Role } from '@/constants/type'
import { TokenPayload } from '@/types/jwt.types'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload
}

const managePaths = ['/manage']
const guestPaths = ['/guest']
const customerPaths = ['/customer']
const ownerPaths = ['/manage/accounts', '/manage/dashboard']
const privatePaths = [...managePaths, ...guestPaths, ...customerPaths]
const unAuthPaths = ['/login', '/customer/login', '/customer/register']

// Tạo i18n middleware
const intlMiddleware = createMiddleware(routing)

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Bỏ qua các route API và static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Xóa locale prefix để check paths
  const pathnameWithoutLocale = pathname.replace(/^\/(vi|en)/, '') || '/'

  // pathname: /manage/dashboard
  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value
  // 1. Chưa đăng nhập thì không cho vào private paths
  if (
    privatePaths.some((path) => pathnameWithoutLocale.startsWith(path)) &&
    !refreshToken &&
    pathnameWithoutLocale !== '/customer/login' &&
    pathnameWithoutLocale !== '/customer/register'
  ) {
    const url = new URL('/login', request.url)
    url.searchParams.set('clearTokens', 'true')
    const response = NextResponse.redirect(url)
    // Áp dụng i18n middleware cho redirect response
    return intlMiddleware(request) || response
  }

  // 2. Trường hợp đã đăng nhập
  if (refreshToken) {
    // 2.1 Nếu cố tình vào trang login sẽ redirect về trang chủ
    if (unAuthPaths.some((path) => pathnameWithoutLocale.startsWith(path))) {
      const response = NextResponse.redirect(new URL('/', request.url))
      return intlMiddleware(request) || response
    }

    // 2.2 Nhưng access token lại hết hạn
    if (privatePaths.some((path) => pathnameWithoutLocale.startsWith(path)) && !accessToken) {
      const url = new URL('/refresh-token', request.url)
      url.searchParams.set('refreshToken', refreshToken)
      url.searchParams.set('redirect', pathnameWithoutLocale)
      const response = NextResponse.redirect(url)
      return intlMiddleware(request) || response
    }

    // 2.3 Vào không đúng role, redirect về trang chủ
    const role = decodeToken(refreshToken).role
    // Guest nhưng cố vào route owner
    const isGuestGoToManagePath =
      role === Role.Guest && managePaths.some((path) => pathnameWithoutLocale.startsWith(path))
    // Không phải Guest nhưng cố vào route guest
    const isNotGuestGoToGuestPath =
      role !== Role.Guest && guestPaths.some((path) => pathnameWithoutLocale.startsWith(path))
    // Không phải Owner nhưng cố vào route owner
    const isNotOwnerGoToOwnerPath =
      role !== Role.Owner && ownerPaths.some((path) => pathnameWithoutLocale.startsWith(path))

    // Customer nếu cố vào route owner hoặc guest
    const isCustomerGoToManagePath =
      role === Role.Customer && managePaths.some((path) => pathnameWithoutLocale.startsWith(path))

    const isCustomerGoToGuestPath =
      role === Role.Customer && guestPaths.some((path) => pathnameWithoutLocale.startsWith(path))

    if (
      isGuestGoToManagePath ||
      isNotGuestGoToGuestPath ||
      isNotOwnerGoToOwnerPath ||
      isCustomerGoToManagePath ||
      isCustomerGoToGuestPath
    ) {
      const response = NextResponse.redirect(new URL('/', request.url))
      return intlMiddleware(request) || response
    }
  }

  // Áp dụng i18n middleware cho tất cả requests
  return intlMiddleware(request)
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // However, match all pathnames within `/api`, except for the ones
    // that contain a dot
    '/api/(.*)'
  ]
}
