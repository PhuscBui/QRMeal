'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { QrCodeType } from '@/schemaValidations/dashboard.schema'
import { Download, Edit, QrCode, Trash } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslations } from 'next-intl'


export function QrCodeList(
  { qrCodes }: { qrCodes: QrCodeType[] }
) {
  const t = useTranslations('dashboard')
  
  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {qrCodes.slice(0, 4).map((qrCode) => (
        <Card key={qrCode.id} className='overflow-hidden'>
          <CardContent className='p-0'>
            <div className='flex flex-col items-center p-4'>
              <div className='mb-2 flex h-24 w-24 items-center justify-center rounded-md border border-dashed'>
                <QrCode className='h-12 w-12 text-muted-foreground' />
              </div>
              <h3 className='text-lg font-semibold'>{qrCode.name}</h3>
              <div className='mt-2 flex w-full justify-between text-xs text-muted-foreground'>
                <span>{t('createAt')} {format(qrCode.created_at, 'dd/MM/yyyy')}</span>
              </div>
              <div className='mt-4 flex w-full justify-between gap-2'>
                <Button variant='outline' size='sm' className='flex-1'>
                  <Edit className='mr-1 h-3 w-3' />
                  {t('edit')}
                </Button>
                <Button variant='outline' size='sm' className='flex-1'>
                  <Download className='mr-1 h-3 w-3' />
                  {t('download')}
                </Button>
                <Button variant='outline' size='sm' className='flex-1'>
                  <Trash className='mr-1 h-3 w-3' />
                 {t('delete')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
