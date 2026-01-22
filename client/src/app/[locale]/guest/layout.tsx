import GuestLayout from '@/features/common/layouts/guest-layout'

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return <GuestLayout> {children} </GuestLayout>
}
