import { ApiResponse } from '~/type'

export interface DashboardResponseResult {
  totalRevenue: number // Tổng doanh thu
  totalOrders: number // Tổng số đơn hàng
  newCustomers: number // Số khách hàng mới
  activeAccounts: number // Số tài khoản nhân viên đang hoạt động

  dailyStats: {
    date: string // ví dụ: '2024-06-09'
    orders: number // Số đơn hàng trong ngày
    revenue: number // Doanh thu trong ngày
    mobileVisitors: number // Lượt truy cập từ thiết bị di động
    desktopVisitors: number // Lượt truy cập từ máy tính
  }[] // Dữ liệu thống kê theo ngày (cho biểu đồ)

  qrCodes: {
    id: string
    name: string // Tên mã QR (ví dụ: Bàn số 1, Menu chính, Đặt món nhanh)
    type: 'table' | 'menu' | 'order' | 'other'
    createdAt: string // Ngày tạo
    scans: number // Số lượt quét
    linkedResource?: string // Liên kết đến tài nguyên (ví dụ: ID bàn, ID menu)
  }[] // Danh sách các mã QR được sử dụng trong hệ thống

  meta?: {
    lastUpdated: string // Thời điểm cập nhật gần nhất
    generatedBy: string // Người tạo báo cáo (tuỳ chọn)
  }
}

export type GetDashboardResponse = ApiResponse<DashboardResponseResult>
