'use client'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { endOfDay, startOfDay } from 'date-fns'
import { QrCode } from 'lucide-react'
import { useState } from 'react'
import { useDashboardIndicator } from '@/queries/useIndicators'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { SectionCards } from '@/features/manage/dashboard/section-cards'
import { ChartAreaInteractive } from '@/features/manage/dashboard/chart-area-interactive'
import { QrCodeList } from '@/features/manage/dashboard/qr-code-list'

const initFromDate = startOfDay(new Date())
const initToDate = endOfDay(new Date())

export default function Dashboard() {
  const t = useTranslations('dashboard')
  const [fromDate, setFromDate] = useState(initFromDate)
  const [toDate, setToDate] = useState(initToDate)

  const { data } = useDashboardIndicator({
    fromDate,
    toDate
  })

  const totalRevenue = data?.payload.result.totalRevenue
  const totalOrder = data?.payload.result.totalOrders
  const newCustomers = data?.payload.result.newCustomers
  const activeAccounts = data?.payload.result.activeAccounts

  console.log(data?.payload.result.timeStats)

  const resetDateFilter = () => {
    setFromDate(initFromDate)
    setToDate(initToDate)
  }
  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-2'>
        <div className='flex flex-wrap items-center justify-between gap-2 px-6 pt-4'>
          <h1 className='text-2xl font-bold'>{t('title')}</h1>

          <div className=' flex items-center gap-2'>
            <div className='flex items-center'>
              <span className='mr-2'>{t('from')}</span>
              <Input
                type='datetime-local'
                placeholder={t('from')}
                className='text-sm'
                value={format(fromDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                onChange={(event) => setFromDate(new Date(event.target.value))}
              />
            </div>
            <div className='flex items-center'>
              <span className='mr-2'>{t('to')}</span>
              <Input
                type='datetime-local'
                placeholder={t('to')}
                value={format(toDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                onChange={(event) => setToDate(new Date(event.target.value))}
              />
            </div>
            <Button className='h-full' variant={'outline'} onClick={resetDateFilter}>
              {t('reset')}
            </Button>
          </div>
        </div>
        <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-4'>
          <SectionCards
            totalRevenue={totalRevenue ?? 0}
            totalOrder={totalOrder ?? 0}
            newCustomers={newCustomers ?? 0}
            activeAccounts={activeAccounts ?? 0}
          />
          <div className='px-4 lg:px-6'>
            <ChartAreaInteractive chartData={data?.payload.result.timeStats ?? []} />
          </div>
          <div className='px-4 lg:px-6'>
            <div className='grid gap-4 md:grid-cols-1'>
              <Card className='col-span-1'>
                <CardHeader>
                  <CardTitle>{t('qrCodeList')}</CardTitle>
                  <CardDescription>{t('listOfQRCodes')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <QrCodeList qrCodes={data?.payload.result.qrCodes ?? []} />
                </CardContent>
                <CardFooter>
                  <Link href='/manage/tables' className='w-full'>
                    <Button variant='outline' className='w-full'>
                      <QrCode className='mr-2 h-4 w-4' />
                      {t('viewAllQRCodes')}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
