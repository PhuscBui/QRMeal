# 🍽️ Hệ Thống Order Đa Loại - QRMeal

## 📋 Tổng Quan

Hệ thống hỗ trợ 3 loại order khác nhau cho customer:
- **🍽️ Ăn tại quán (Dine-in)**: Quét QR code, chọn bàn, thưởng thức tại nhà hàng
- **📦 Mua mang về (Takeaway)**: Đặt trước, đến lấy tại nhà hàng
- **🚚 Giao hàng (Delivery)**: Đặt món và giao tận nơi

## 🏗️ Cấu Trúc Hệ Thống

### 1. **Dynamic Routes Structure**
```
/customer/
├── order-type/           # Trang chọn loại order
├── scan-qr/             # Trang quét QR code (dine-in)
└── [type]/              # Dynamic route cho từng loại order
    ├── layout.tsx       # Layout chung với header theo loại
    ├── menu/page.tsx    # Menu tùy chỉnh theo loại
    ├── checkout/page.tsx # Thanh toán với trường phù hợp
    └── orders/page.tsx  # Quản lý đơn hàng theo loại
```

### 2. **API & Data Layer**
- **Schema Validation**: Cập nhật hỗ trợ `takeaway` và `takeaway_info`
- **API Requests**: Methods riêng cho từng loại order
- **React Query Hooks**: `useOrderByTypeQuery`, `useCreateOrderByTypeMutation`
- **Custom Hooks**: `useQRScanner`, `useOrderCart`

### 3. **UI Components**
- **OrderTypeBadge**: Hiển thị loại order với icon và màu sắc
- **TableInfoCard**: Thông tin bàn cho dine-in
- **DeliveryInfoCard**: Thông tin giao hàng cho delivery
- **TakeawayInfoCard**: Thông tin mua mang về cho takeaway

## 🎯 Tính Năng Chính

### **🍽️ Ăn Tại Quán (Dine-in)**
- ✅ Quét QR code để lấy thông tin bàn
- ✅ Nhập mã bàn thủ công nếu không quét được
- ✅ Hiển thị thông tin bàn trong header
- ✅ Lưu thông tin bàn vào localStorage
- ✅ Không cần địa chỉ giao hàng
- ✅ Không cần thời gian giao hàng

### **📦 Mua Mang Về (Takeaway)**
- ✅ Đặt trước và chọn thời gian lấy
- ✅ Nhập thông tin khách hàng
- ✅ Theo dõi trạng thái chuẩn bị
- ✅ Thông báo khi sẵn sàng lấy

### **🚚 Giao Hàng (Delivery)**
- ✅ Nhập địa chỉ giao hàng chi tiết
- ✅ Chọn thời gian giao hàng
- ✅ Theo dõi trạng thái giao hàng
- ✅ Thông tin tài xế và thời gian dự kiến

## 🔄 Luồng Hoạt Động

### **1. Chọn Loại Order**
```
Trang chính → Chọn loại order → Trang cụ thể
```

### **2. Dine-in Flow**
```
Quét QR → Chọn món → Thanh toán → Theo dõi
```

### **3. Takeaway Flow**
```
Chọn món → Nhập thông tin → Chọn thời gian → Thanh toán → Theo dõi
```

### **4. Delivery Flow**
```
Chọn món → Nhập địa chỉ → Chọn thời gian → Thanh toán → Theo dõi
```

## 🛠️ Công Nghệ Sử Dụng

- **Next.js 14**: Dynamic routes, App Router
- **TypeScript**: Type safety cho tất cả components
- **React Query**: Data fetching và caching
- **Zod**: Schema validation
- **Tailwind CSS**: Styling và responsive design
- **Lucide React**: Icons
- **localStorage**: Client-side data persistence

## 📱 Responsive Design

- **Mobile-first**: Tối ưu cho mobile
- **Tablet**: Layout 2 cột cho tablet
- **Desktop**: Layout 3 cột cho desktop
- **Touch-friendly**: Buttons và inputs dễ sử dụng

## 🔧 Cấu Hình

### **Order Type Configuration**
```typescript
const orderTypeConfig = {
  'dine-in': {
    title: 'Ăn tại quán',
    icon: MapPin,
    color: 'text-blue-600',
    showDeliveryTime: false,
    showAddress: false,
    showTableInfo: true
  },
  'takeaway': {
    title: 'Mua mang về',
    icon: Package,
    color: 'text-orange-600',
    showDeliveryTime: true,
    showAddress: false,
    showTableInfo: false
  },
  'delivery': {
    title: 'Giao hàng',
    icon: Truck,
    color: 'text-green-600',
    showDeliveryTime: true,
    showAddress: true,
    showTableInfo: false
  }
}
```

## 🚀 Sử Dụng

### **1. Chọn Loại Order**
```tsx
// Trang chính
<Link href="/customer/order-type">
  <Button>Đặt món ngay</Button>
</Link>
```

### **2. Quét QR Code (Dine-in)**
```tsx
const { startScanning, stopScanning, processQRData } = useQRScanner({
  onSuccess: (data) => {
    // Xử lý khi quét thành công
    router.push('/customer/dine-in/menu')
  }
})
```

### **3. Quản Lý Cart**
```tsx
const { 
  cartItems, 
  addToCart, 
  removeFromCart, 
  proceedToCheckout 
} = useOrderCart({ 
  orderType: 'dine-in' 
})
```

### **4. Tạo Order**
```tsx
const createOrderMutation = useCreateOrderByTypeMutation()

const handlePlaceOrder = (orderData) => {
  createOrderMutation.mutate({
    order_type: 'dine-in',
    table_number: tableInfo.tableNumber,
    orders: cartItems.map(item => ({
      dish_id: item.id,
      quantity: item.quantity
    }))
  })
}
```

## 📊 State Management

- **localStorage**: Cart, table info, order data
- **React Query**: Server state caching
- **useState**: Local component state
- **Custom Hooks**: Reusable logic

## 🎨 UI/UX Features

- **Consistent Design**: Màu sắc và icon theo loại order
- **Clear Navigation**: Breadcrumb và back buttons
- **Loading States**: Skeleton và loading indicators
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Confirmation messages

## 🔮 Tương Lai

- **Real-time Updates**: WebSocket cho order tracking
- **Push Notifications**: Thông báo trạng thái order
- **Payment Integration**: Tích hợp thanh toán
- **Analytics**: Thống kê order theo loại
- **Multi-language**: Hỗ trợ đa ngôn ngữ

---

**🎉 Hệ thống đã sẵn sàng để sử dụng!** Customer có thể dễ dàng chọn loại order phù hợp và trải nghiệm được tùy chỉnh theo từng loại.
