import { Role } from '@/constants/type'
import { TokenPayload } from '@/types/jwt.types'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload
}

const managePaths = ['/manage']
const guestPaths = ['/guest']
const customerPaths = ['/customer']
const ownerPaths = ['/manage/accounts', '/manage/dashboard']
const privatePaths = [...managePaths, ...guestPaths, ...customerPaths]
const unAuthPaths = ['/login', '/customer/login', '/customer/register']

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // pathname: /manage/dashboard
  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value
  // 1. Chưa đăng nhập thì không cho vào private paths
  // 1. Chưa đăng nhập thì không cho vào private paths
  if (
    privatePaths.some((path) => pathname.startsWith(path)) &&
    !refreshToken &&
    pathname !== '/customer/login' &&
    pathname !== '/customer/register'

    // 👈 cho phép customer/login
  ) {
    const url = new URL('/login', request.url)
    url.searchParams.set('clearTokens', 'true')
    return NextResponse.redirect(url)
  }

  // 2. Trường hợp đã đăng nhập
  if (refreshToken) {
    // 2.1 Nếu cố tình vào trang login sẽ redirect về trang chủ
    if (unAuthPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // 2.2 Nhưng access token lại hết hạn
    if (privatePaths.some((path) => pathname.startsWith(path)) && !accessToken) {
      const url = new URL('/refresh-token', request.url)
      url.searchParams.set('refreshToken', refreshToken)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    // 2.3 Vào không đúng role, redirect về trang chủ
    const role = decodeToken(refreshToken).role
    // Guest nhưng cố vào route owner
    const isGuestGoToManagePath = role === Role.Guest && managePaths.some((path) => pathname.startsWith(path))
    // Không phải Guest nhưng cố vào route guest
    const isNotGuestGoToGuestPath = role !== Role.Guest && guestPaths.some((path) => pathname.startsWith(path))
    // Không phải Owner nhưng cố vào route owner
    const isNotOwnerGoToOwnerPath = role !== Role.Owner && ownerPaths.some((path) => pathname.startsWith(path))

    // Customer nếu cố vào route owner hoặc guest
    const isCustomerGoToManagePath = role === Role.Customer && managePaths.some((path) => pathname.startsWith(path))

    const isCustomerGoToGuestPath = role === Role.Customer && guestPaths.some((path) => pathname.startsWith(path))

    if (
      isGuestGoToManagePath ||
      isNotGuestGoToGuestPath ||
      isNotOwnerGoToOwnerPath ||
      isCustomerGoToManagePath ||
      isCustomerGoToGuestPath
    ) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/manage/:path*', '/guest/:path*', '/customer/:path*', '/login']
}
