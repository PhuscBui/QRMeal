import CustomerLayout from '@/features/common/layouts/customer-layout'

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return <CustomerLayout>{children}</CustomerLayout>
}
