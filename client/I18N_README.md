# 🌍 Cấu Hình Đa Ngôn Ngữ (i18n) - QRMeal

## ✅ Đã Hoàn Thành

Dự án đã được cấu hình đa ngôn ngữ với **next-intl** hỗ trợ:
- 🇻🇳 **Tiếng Việt (vi)** - Ngôn ngữ mặc định
- 🇬🇧 **Tiếng Anh (en)**

## 📦 Các File Đã Tạo/Cập Nhật

### 1. **Cấu Hình Cốt Lõi**
- ✅ `next.config.ts` - Thêm next-intl plugin
- ✅ `src/middleware.ts` - Tích hợp i18n routing với authentication
- ✅ `src/i18n/routing.ts` - Cấu hình routing & navigation helpers
- ✅ `src/i18n/request.ts` - Cấu hình request & messages loading

### 2. **Messages & Translations**
- ✅ `src/messages/vi.json` - Bản dịch tiếng Việt (200+ keys)
- ✅ `src/messages/en.json` - Bản dịch tiếng Anh (200+ keys)

### 3. **Layouts & Components**
- ✅ `src/app/layout.tsx` - Root layout (cập nhật)
- ✅ `src/app/[locale]/layout.tsx` - Locale layout với NextIntlClientProvider
- ✅ `src/components/language-switcher.tsx` - Component chuyển đổi ngôn ngữ

### 4. **TypeScript Support**
- ✅ `src/types/i18n.d.ts` - Type-safe translations

### 5. **Documentation & Examples**
- ✅ `I18N_GUIDE.md` - Hướng dẫn sử dụng chi tiết
- ✅ `MIGRATION_GUIDE.md` - Hướng dẫn migration routes
- ✅ `src/app/[locale]/i18n-demo/page.tsx` - Trang demo tương tác
- ✅ `I18N_README.md` - File này

## 🚀 Bắt Đầu Nhanh

### 1. Cài đặt dependencies (Đã hoàn tất)

```bash
npm install next-intl
```

### 2. Chạy dev server

```bash
npm run dev
```

### 3. Truy cập demo page

Mở trình duyệt và truy cập:
- **Tiếng Việt:** http://localhost:3000/vi/i18n-demo
- **Tiếng Anh:** http://localhost:3000/en/i18n-demo
- **Mặc định:** http://localhost:3000/i18n-demo (sẽ dùng tiếng Việt)

## 💻 Sử Dụng Cơ Bản

### Trong Component

```tsx
'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

export default function MyComponent() {
  const t = useTranslations('common')
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <Link href="/menu">{t('menu')}</Link>
    </div>
  )
}
```

### Chuyển Đổi Ngôn Ngữ

Thêm `LanguageSwitcher` vào header/navbar:

```tsx
import LanguageSwitcher from '@/components/language-switcher'

export default function Header() {
  return (
    <header>
      <nav>{/* Your nav items */}</nav>
      <LanguageSwitcher />
    </header>
  )
}
```

## 📖 Namespaces Có Sẵn

| Namespace | Mô Tả | Keys |
|-----------|-------|------|
| `common` | Từ chung | welcome, save, cancel, delete, edit, search, etc. |
| `auth` | Authentication | login, logout, register, email, password |
| `nav` | Navigation | home, menu, orders, tables, dashboard |
| `menu` | Menu/Dishes | title, addDish, editDish, dishName, dishPrice |
| `order` | Orders | title, orderStatus, checkout, pending, confirmed |
| `table` | Tables | tableNumber, tableStatus, capacity, bookTable |
| `customer` | Customer | customerName, loyaltyPoints, scanQR |
| `promotion` | Promotions | promoCode, discount, startDate, endDate |
| `account` | Accounts | addAccount, accountRole, updateProfile |
| `dashboard` | Dashboard | todaySales, revenue, analytics, reports |
| `shift` | Shifts | addShift, shiftName, startTime, endTime |
| `validation` | Validation | required, email, phone, minLength |
| `messages` | Messages | saveSuccess, deleteError, networkError |

## 🔗 URL Structure

### Tiếng Việt (Mặc định)
```
/                    ← Homepage (tiếng Việt)
/vi                  ← Tương tự
/vi/menu            ← Menu page (tiếng Việt)
/vi/orders          ← Orders page (tiếng Việt)
```

### Tiếng Anh
```
/en                  ← Homepage (tiếng Anh)
/en/menu            ← Menu page (tiếng Anh)
/en/orders          ← Orders page (tiếng Anh)
```

## 🎯 Các Bước Tiếp Theo

### 1. **Di chuyển Routes Hiện Có** (Tùy chọn)

Nếu muốn tất cả routes hỗ trợ i18n:

1. Đọc [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
2. Di chuyển routes từ `app/(public)/*` sang `app/[locale]/(public)/*`
3. Cập nhật imports để dùng i18n routing
4. Thay hard-coded text bằng translations

### 2. **Thêm LanguageSwitcher Vào UI**

Thêm component vào các layouts/headers:
- Public layout (`app/[locale]/(public)/layout.tsx`)
- Customer layout (`app/customer/layout.tsx`)
- Guest layout (`app/guest/layout.tsx`)
- Manage layout (`app/manage/layout.tsx`)

### 3. **Cập Nhật Existing Pages** (Từng bước)

Không cần vội, có thể cập nhật từng page một:

**Priority 1 - High Traffic:**
- [ ] Homepage
- [ ] Login/Register
- [ ] Menu
- [ ] Order checkout

**Priority 2 - Customer Facing:**
- [ ] Customer dashboard
- [ ] Order tracking
- [ ] Promotions
- [ ] Support

**Priority 3 - Internal:**
- [ ] Manage pages
- [ ] Dashboard
- [ ] Reports

### 4. **Thêm Translations Cho Features Mới**

Mỗi khi tạo feature/component mới:
1. Thêm keys vào `vi.json` và `en.json`
2. Sử dụng `useTranslations()` thay vì hard-code text
3. Test ở cả 2 ngôn ngữ

## 🧪 Testing

### Test Checklist

- [ ] Trang demo hoạt động: `/i18n-demo`
- [ ] Chuyển đổi ngôn ngữ hoạt động
- [ ] URL changes khi chuyển ngôn ngữ
- [ ] Translation hiển thị đúng
- [ ] Navigation giữ nguyên locale
- [ ] Authentication vẫn hoạt động
- [ ] API routes không bị ảnh hưởng

### Test Commands

```bash
# Clean & restart
rm -rf .next
npm run dev

# Build production
npm run build
npm start
```

## 📚 Documentation

- **[I18N_GUIDE.md](./I18N_GUIDE.md)** - Hướng dẫn sử dụng chi tiết, examples, best practices
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Hướng dẫn di chuyển routes hiện có
- **[next-intl docs](https://next-intl-docs.vercel.app/)** - Official documentation

## 🆘 Troubleshooting

### "Cannot find module '@/i18n/routing'"
→ Restart dev server: `npm run dev`

### Translations không hiển thị
→ Check key có trong message files
→ Check namespace đúng

### URL không có locale prefix
→ Đúng behavior cho default locale (vi)
→ Use `/en/...` để xem English version

### Page not found sau khi thêm [locale]
→ Clear .next folder: `rm -rf .next`
→ Restart: `npm run dev`

## 🎉 Done!

Cấu hình đa ngôn ngữ đã sẵn sàng! 

### Next Steps:
1. ✅ Visit demo page: http://localhost:3000/i18n-demo
2. 📖 Read I18N_GUIDE.md for detailed usage
3. 🚀 Start adding translations to your pages
4. 🌍 Test both languages

**Happy Coding! 🚀**

---

**Last Updated:** December 2025  
**Next-Intl Version:** Latest  
**Next.js Version:** 15.2.4


