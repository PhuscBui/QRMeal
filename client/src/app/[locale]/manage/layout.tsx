import ManageLayout from '@/features/common/layouts/manage-layout'

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ManageLayout>{children}</ManageLayout>
}
