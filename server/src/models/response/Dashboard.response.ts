import { ApiResponse } from '~/type'

export interface DashboardResponseResult {
  totalRevenue: number // Tổng doanh thu
  totalOrders: number // Tổng số đơn hàng
  newCustomers: number // Số khách hàng mới
  activeAccounts: number // Số tài khoản nhân viên đang hoạt động

  timeStats: {
    orders: number // Số đơn hàng trong kỳ
    revenue: number // Doanh thu trong kỳ
    visitors: number // Lượt truy cập từ thiết bị di động
  }[] // Dữ liệu thống kê theo thời gian (cho biểu đồ)

  qrCodes: {
    id: string
    name: string // Tên mã QR (ví dụ: Bàn số 1, Menu chính, Đặt món nhanh)
    created_at: string // Ngày tạo
  }[] 

  meta?: {
    lastUpdated: string // Thời điểm cập nhật gần nhất
    generatedBy: string // Người tạo báo cáo (tuỳ chọn)
  }
}

export type GetDashboardResponse = ApiResponse<DashboardResponseResult>
