import accountApiRequest from '@/apiRequests/account'
import { ChartAreaInteractive } from '@/app/manage/dashboard/chart-area-interactive'
import { QrCodeList } from '@/app/manage/dashboard/qr-code-list'
import { SectionCards } from '@/app/manage/dashboard/section-cards'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { QrCode } from 'lucide-react'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { cookies } from 'next/headers'

export default async function Dashboard() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value
  if (!accessToken) {
    throw new Error('Access token is missing')
  }
  let name = ''
  try {
    const result = await accountApiRequest.sMe(accessToken)
    name = result.payload.result.name
  } catch (error) {
    if (isRedirectError(error)) {
      throw error
    }
  }
  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-2'>
        <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
          <SectionCards />
          <div className='px-4 lg:px-6'>
            <ChartAreaInteractive />
          </div>
          <div className='px-4 lg:px-6'>
            <div className='grid gap-4 md:grid-cols-1'>
              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>Mã QR của bạn</CardTitle>
                  <CardDescription>Quản lý mã QR cho các bàn và menu của bạn.</CardDescription>
                </CardHeader>
                <CardContent>
                  <QrCodeList />
                </CardContent>
                <CardFooter>
                  <Button variant='outline' className='w-full'>
                    <QrCode className='mr-2 h-4 w-4' />
                    Xem tất cả mã QR
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
