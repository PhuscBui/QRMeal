import HomePageLayout from '@/features/common/layouts/home-page-layout'

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return <HomePageLayout>{children}</HomePageLayout>
}
