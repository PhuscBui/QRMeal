# Hướng Dẫn Migration Sang i18n

## 🎯 Mục Tiêu

Di chuyển các routes hiện có từ `app/(public)/*` sang `app/[locale]/(public)/*` để hỗ trợ đa ngôn ngữ.

## 📋 Tình Trạng Hiện Tại

Dự án hiện có 2 cấu trúc song song:

```
app/
├── (public)/          # Routes cũ (chưa có i18n)
│   ├── (auth)/
│   ├── booking-tables/
│   ├── customer/
│   └── tables/
├── [locale]/          # Routes mới (có i18n)
│   └── (public)/
│       ├── (auth)/
│       ├── booking-tables/
│       ├── customer/
│       └── tables/
```

## 🚀 Các Bước Migration

### Bước 1: Backup Code Hiện Tại

```bash
# Tạo backup branch
git checkout -b backup-before-i18n-migration
git add .
git commit -m "Backup before i18n migration"
git checkout i18n
```

### Bước 2: Di Chuyển Routes Từng Bước

#### Option 1: Di chuyển thủ công (Khuyến nghị)

Với mỗi page/component, làm theo các bước:

1. **Mở file gốc** trong `app/(public)/...`
2. **Tạo file tương ứng** trong `app/[locale]/(public)/...`
3. **Copy nội dung và cập nhật imports:**

**Trước:**
```tsx
// app/(public)/page.tsx
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  return (
    <div>
      <h1>Welcome</h1>
      <Link href="/menu">Menu</Link>
    </div>
  )
}
```

**Sau:**
```tsx
// app/[locale]/(public)/page.tsx
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/routing'  // ← Changed

export default function HomePage() {
  const t = useTranslations('common')  // ← Added
  
  return (
    <div>
      <h1>{t('welcome')}</h1>  {/* ← Changed */}
      <Link href="/menu">{t('menu')}</Link>  {/* ← Changed */}
    </div>
  )
}
```

4. **Test route mới** tại `http://localhost:3000/vi/...` hoặc `http://localhost:3000/en/...`
5. **Sau khi confirm hoạt động**, xóa file cũ

#### Option 2: Di chuyển hàng loạt (Cẩn thận)

```bash
# Trong thư mục client
cd src/app

# Di chuyển tất cả routes từ (public) sang [locale]/(public)
# CHỈ LÀM NẾU BẠN ĐÃ BACKUP!
# Lưu ý: Bạn vẫn cần cập nhật imports thủ công sau bước này

# Ví dụ với một route cụ thể:
# cp -r "(public)/booking-tables" "[locale]/(public)/booking-tables"
```

### Bước 3: Cập Nhật Imports

Tìm và thay thế trong tất cả các file đã di chuyển:

**❌ Old Imports:**
```tsx
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { redirect } from 'next/navigation'
```

**✅ New Imports:**
```tsx
import { Link, useRouter, usePathname, redirect } from '@/i18n/routing'
```

### Bước 4: Thêm Translations

1. **Xác định các text cần dịch** trong component
2. **Thêm keys vào message files:**

**src/messages/vi.json:**
```json
{
  "pages": {
    "booking": {
      "title": "Đặt Bàn",
      "selectDate": "Chọn ngày",
      "selectTime": "Chọn giờ",
      "confirm": "Xác nhận đặt bàn"
    }
  }
}
```

**src/messages/en.json:**
```json
{
  "pages": {
    "booking": {
      "title": "Book Table",
      "selectDate": "Select Date",
      "selectTime": "Select Time",
      "confirm": "Confirm Booking"
    }
  }
}
```

3. **Sử dụng trong component:**

```tsx
const t = useTranslations('pages.booking')

return (
  <div>
    <h1>{t('title')}</h1>
    <DatePicker label={t('selectDate')} />
    <TimePicker label={t('selectTime')} />
    <button>{t('confirm')}</button>
  </div>
)
```

### Bước 5: Test Kỹ Lưỡng

Checklist cho mỗi route:

- [ ] Route hoạt động ở `/vi/...`
- [ ] Route hoạt động ở `/en/...`
- [ ] Tất cả links hoạt động đúng
- [ ] Form submissions hoạt động
- [ ] API calls không bị ảnh hưởng
- [ ] Authentication/Authorization hoạt động
- [ ] Chuyển đổi ngôn ngữ không làm mất state

## 📝 Các Routes Cần Di Chuyển

### Public Routes

- [ ] `/` - Homepage
- [ ] `/login` - Login page
- [ ] `/logout` - Logout handler
- [ ] `/refresh-token` - Token refresh
- [ ] `/booking-tables` - Table booking
- [ ] `/customer/login` - Customer login
- [ ] `/customer/register` - Customer registration
- [ ] `/tables/[number]` - Table page

### Authenticated Routes (Không cần di chuyển ngay)

Routes trong `/manage/*`, `/guest/*`, `/customer/*` có thể di chuyển sau khi public routes đã ổn định.

## 🔄 Xử Lý Các Trường Hợp Đặc Biệt

### Server Components vs Client Components

**Server Component:**
```tsx
import { useTranslations } from 'next-intl'

export default function ServerComponent() {
  const t = useTranslations('namespace')
  // No 'use client' needed
}
```

**Client Component:**
```tsx
'use client'

import { useTranslations } from 'next-intl'

export default function ClientComponent() {
  const t = useTranslations('namespace')
  // Must have 'use client'
}
```

### API Routes

API routes trong `/api/*` **KHÔNG** cần di chuyển và không bị ảnh hưởng bởi i18n.

```
app/
├── api/               # ← Giữ nguyên, không di chuyển
│   ├── auth/
│   ├── guest/
│   └── revalidate/
```

### Static Files & Public Folder

Không cần thay đổi gì cho:
- `/public/*` - Static files
- `favicon.ico`
- Images, fonts, etc.

### Dynamic Routes

**Trước:**
```
app/(public)/tables/[number]/page.tsx
```

**Sau:**
```
app/[locale]/(public)/tables/[number]/page.tsx
```

Component code:
```tsx
export default async function TablePage({
  params
}: {
  params: Promise<{ locale: string; number: string }>
}) {
  const { locale, number } = await params
  const t = useTranslations('table')
  
  return <div>{t('tableNumber', { number })}</div>
}
```

## ⚠️ Các Lỗi Thường Gặp & Cách Fix

### Lỗi 1: "Cannot find module '@/i18n/routing'"

**Nguyên nhân:** File chưa được tạo hoặc import sai đường dẫn

**Giải pháp:** Đảm bảo file `src/i18n/routing.ts` tồn tại

### Lỗi 2: "Text not translated"

**Nguyên nhân:** Key chưa có trong message files

**Giải pháp:** Thêm key vào `src/messages/vi.json` và `src/messages/en.json`

### Lỗi 3: "Page not found" sau khi di chuyển

**Nguyên nhân:** Middleware config hoặc routing sai

**Giải pháp:** 
- Kiểm tra `middleware.ts` config
- Đảm bảo route trong `app/[locale]/...`
- Clear Next.js cache: `rm -rf .next && npm run dev`

### Lỗi 4: "useRouter/Link không hoạt động"

**Nguyên nhân:** Đang dùng Next.js router thay vì i18n router

**Giải pháp:** Import từ `@/i18n/routing`:
```tsx
import { Link, useRouter } from '@/i18n/routing'
```

### Lỗi 5: "Locale not persisting after navigation"

**Nguyên nhân:** Link không từ i18n routing

**Giải pháp:** Sử dụng Link từ `@/i18n/routing` thay vì `next/link`

## 🧪 Testing Strategy

### 1. Test Thủ Công

```bash
# Start dev server
npm run dev

# Test URLs:
# - http://localhost:3000/          (Should work - default locale)
# - http://localhost:3000/vi/       (Should work)
# - http://localhost:3000/en/       (Should work)
# - http://localhost:3000/vi/login  (Should work)
# - http://localhost:3000/en/login  (Should work)
```

### 2. Test Chuyển Đổi Ngôn Ngữ

1. Mở trang bất kỳ
2. Click LanguageSwitcher
3. Chuyển từ VI sang EN
4. Verify:
   - URL thay đổi từ `/vi/...` sang `/en/...`
   - Tất cả text được dịch
   - State không bị mất

### 3. Test Navigation

1. Click vào các links
2. Verify URL luôn giữ locale hiện tại
3. Verify navigation hoạt động trơn tru

## 📦 Rollback Plan

Nếu có vấn đề nghiêm trọng:

```bash
# Quay về commit trước khi migration
git checkout backup-before-i18n-migration

# Hoặc revert specific commits
git log --oneline  # Tìm commit ID
git revert <commit-id>
```

## 🎉 Sau Khi Migration Hoàn Tất

1. **Xóa routes cũ** trong `app/(public)/` (nếu không còn dùng)
2. **Update documentation** để đề cập i18n
3. **Train team** về cách sử dụng i18n
4. **Setup CI/CD** để check missing translations

## 📚 Tham Khảo

- [I18N_GUIDE.md](./I18N_GUIDE.md) - Hướng dẫn sử dụng đầy đủ
- [Next-Intl Docs](https://next-intl-docs.vercel.app/)
- `/i18n-demo` - Trang demo tương tác

## ❓ Cần Trợ Giúp?

Nếu gặp vấn đề trong quá trình migration:

1. Xem [I18N_GUIDE.md](./I18N_GUIDE.md)
2. Check trang demo: `/i18n-demo`
3. Xem examples trong `app/[locale]/i18n-demo/page.tsx`
4. Check middleware config trong `src/middleware.ts`

---

**Good luck with your migration! 🚀**


