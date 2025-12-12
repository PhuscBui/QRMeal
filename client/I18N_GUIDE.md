# Hướng Dẫn Sử Dụng Đa Ngôn Ngữ (i18n) với Next-Intl

## 🌍 Tổng Quan

Dự án đã được cấu hình đa ngôn ngữ với `next-intl` hỗ trợ:
- 🇻🇳 Tiếng Việt (vi) - Ngôn ngữ mặc định
- 🇬🇧 Tiếng Anh (en)

## 📁 Cấu Trúc File

```
client/
├── src/
│   ├── i18n/
│   │   ├── routing.ts       # Cấu hình routing i18n
│   │   └── request.ts       # Cấu hình request i18n
│   ├── messages/
│   │   ├── vi.json          # Bản dịch tiếng Việt
│   │   └── en.json          # Bản dịch tiếng Anh
│   ├── app/
│   │   ├── [locale]/        # Routes có locale
│   │   │   └── layout.tsx   # Layout với NextIntlClientProvider
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   └── language-switcher.tsx  # Component chuyển đổi ngôn ngữ
│   └── middleware.ts        # Middleware xử lý locale & auth
├── next.config.ts           # Config với next-intl plugin
```

## 🚀 Cách Sử Dụng

### 1. **Sử dụng trong Server Components**

```tsx
import { useTranslations } from 'next-intl'

export default function MyServerComponent() {
  const t = useTranslations('common')
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{t('save')}</button>
    </div>
  )
}
```

### 2. **Sử dụng trong Client Components**

```tsx
'use client'

import { useTranslations } from 'next-intl'

export default function MyClientComponent() {
  const t = useTranslations('auth')
  
  return (
    <form>
      <input placeholder={t('email')} />
      <input placeholder={t('password')} />
      <button>{t('login')}</button>
    </form>
  )
}
```

### 3. **Sử dụng Link với i18n**

```tsx
import { Link } from '@/i18n/routing'

export default function Navigation() {
  return (
    <nav>
      <Link href="/">{t('nav.home')}</Link>
      <Link href="/menu">{t('nav.menu')}</Link>
      <Link href="/orders">{t('nav.orders')}</Link>
    </nav>
  )
}
```

### 4. **Sử dụng Router với i18n**

```tsx
'use client'

import { useRouter } from '@/i18n/routing'

export default function MyComponent() {
  const router = useRouter()
  
  const handleClick = () => {
    router.push('/dashboard')
  }
  
  return <button onClick={handleClick}>Go to Dashboard</button>
}
```

### 5. **Redirect với i18n**

```tsx
import { redirect } from '@/i18n/routing'

export default function MyPage() {
  const hasAccess = checkAccess()
  
  if (!hasAccess) {
    redirect('/login')
  }
  
  return <div>Protected Content</div>
}
```

### 6. **Thêm Component Chuyển Đổi Ngôn Ngữ**

```tsx
import LanguageSwitcher from '@/components/language-switcher'

export default function Header() {
  return (
    <header>
      <nav>
        {/* Your navigation items */}
      </nav>
      <LanguageSwitcher />
    </header>
  )
}
```

## 📝 Thêm Bản Dịch Mới

### Cách 1: Thêm key mới vào file messages

**src/messages/vi.json:**
```json
{
  "mySection": {
    "newKey": "Văn bản tiếng Việt",
    "anotherKey": "Văn bản khác"
  }
}
```

**src/messages/en.json:**
```json
{
  "mySection": {
    "newKey": "English text",
    "anotherKey": "Another text"
  }
}
```

### Cách 2: Sử dụng trong code

```tsx
const t = useTranslations('mySection')

return (
  <div>
    <p>{t('newKey')}</p>
    <p>{t('anotherKey')}</p>
  </div>
)
```

## 🔧 Các Hook và Utilities Có Sẵn

### `useTranslations(namespace)`
Lấy bản dịch từ namespace cụ thể

```tsx
const t = useTranslations('common')
const message = t('welcome') // "Chào mừng" hoặc "Welcome"
```

### `useLocale()`
Lấy locale hiện tại

```tsx
const locale = useLocale() // "vi" hoặc "en"
```

### `useRouter()`
Router với i18n support

```tsx
const router = useRouter()
router.push('/dashboard')
```

### `usePathname()`
Lấy pathname hiện tại (không có locale prefix)

```tsx
const pathname = usePathname() // "/dashboard" chứ không phải "/vi/dashboard"
```

### `Link`
Component Link với i18n support

```tsx
<Link href="/menu">Menu</Link>
```

## 🌐 URL Structure

- **Tiếng Việt (default):** `/` hoặc `/vi`
  - Ví dụ: `/dashboard` hoặc `/vi/dashboard`
  
- **Tiếng Anh:** `/en`
  - Ví dụ: `/en/dashboard`

## 📊 Các Namespace Có Sẵn

| Namespace | Mô Tả | Ví Dụ Keys |
|-----------|-------|------------|
| `common` | Các từ chung | welcome, save, cancel, delete, edit |
| `auth` | Authentication | login, logout, register, email, password |
| `nav` | Navigation | home, menu, orders, tables, dashboard |
| `menu` | Menu/Dishes | title, addDish, editDish, dishName |
| `order` | Orders | title, newOrder, orderStatus, checkout |
| `table` | Tables | title, tableNumber, tableStatus, capacity |
| `customer` | Customer | title, customerName, customerPhone |
| `promotion` | Promotions | title, promoCode, discount |
| `account` | Accounts | title, addAccount, accountRole |
| `dashboard` | Dashboard | title, todaySales, revenue, analytics |
| `shift` | Shifts | title, addShift, shiftName, startTime |
| `validation` | Form Validation | required, email, phone, minLength |
| `messages` | System Messages | saveSuccess, deleteError, confirmDelete |

## 🎨 Ví Dụ Thực Tế

### Trang Login

```tsx
'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

export default function LoginPage() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  
  return (
    <div className="login-container">
      <h1>{t('login')}</h1>
      <form>
        <input 
          type="email" 
          placeholder={t('email')}
          required
        />
        <input 
          type="password" 
          placeholder={t('password')}
          required
        />
        <Link href="/forgot-password">
          {t('forgotPassword')}
        </Link>
        <button type="submit">
          {t('login')}
        </button>
      </form>
      <p>
        {t('noAccount')} 
        <Link href="/register">{t('register')}</Link>
      </p>
    </div>
  )
}
```

### Component với Nhiều Namespace

```tsx
'use client'

import { useTranslations } from 'next-intl'

export default function OrderCard({ order }) {
  const tOrder = useTranslations('order')
  const tCommon = useTranslations('common')
  
  return (
    <div className="order-card">
      <h3>{tOrder('orderNumber')}: {order.number}</h3>
      <p>{tCommon('status')}: {tOrder(order.status)}</p>
      <p>{tCommon('total')}: ${order.total}</p>
      <button>{tCommon('view')}</button>
    </div>
  )
}
```

## 🔍 Tips & Best Practices

1. **Tổ chức namespace hợp lý:** Nhóm các bản dịch liên quan vào cùng namespace
2. **Sử dụng nested keys:** `nav.home`, `auth.login` để dễ quản lý
3. **Consistent naming:** Dùng camelCase cho keys
4. **Thêm context:** Key nên rõ ràng về ngữ cảnh (ví dụ: `order.confirmed` thay vì chỉ `confirmed`)
5. **Test cả 2 ngôn ngữ:** Đảm bảo text không bị cắt trong cả VI và EN
6. **Sử dụng TypeScript:** next-intl hỗ trợ type-safe translations

## 🛠️ Thêm Ngôn Ngữ Mới

1. Tạo file message mới: `src/messages/ja.json` (ví dụ tiếng Nhật)
2. Copy nội dung từ `vi.json` và dịch sang ngôn ngữ mới
3. Cập nhật `src/i18n/routing.ts`:

```ts
export const routing = defineRouting({
  locales: ['vi', 'en', 'ja'], // Thêm locale mới
  defaultLocale: 'vi'
})
```

4. Cập nhật `language-switcher.tsx`:

```tsx
const locales = [
  { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' }
]
```

## 📚 Tài Liệu Tham Khảo

- [Next-Intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

## ⚠️ Lưu Ý

- Middleware đã được cấu hình để xử lý cả i18n và authentication
- Routes API (`/api/*`) không bị ảnh hưởng bởi locale
- Static files và `_next` được bỏ qua khỏi i18n middleware
- Locale mặc định là `vi`, URL có thể là `/` hoặc `/vi`


