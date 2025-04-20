'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, Edit, QrCode, Trash } from 'lucide-react'

export function QrCodeList() {
  const qrCodes = [
    {
      id: 'qr-001',
      name: 'Bàn số 1',
      type: 'Bàn',
      createdAt: '15/04/2024',
      scans: 45
    },
    {
      id: 'qr-002',
      name: 'Bàn số 2',
      type: 'Bàn',
      createdAt: '15/04/2024',
      scans: 38
    },
    {
      id: 'qr-003',
      name: 'Menu chính',
      type: 'Menu',
      createdAt: '10/04/2024',
      scans: 120
    },
    {
      id: 'qr-004',
      name: 'Menu đồ uống',
      type: 'Menu',
      createdAt: '10/04/2024',
      scans: 85
    }
  ]

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      {qrCodes.map((qrCode) => (
        <Card key={qrCode.id} className='overflow-hidden'>
          <CardContent className='p-0'>
            <div className='flex flex-col items-center p-4'>
              <div className='mb-2 flex h-24 w-24 items-center justify-center rounded-md border border-dashed'>
                <QrCode className='h-12 w-12 text-muted-foreground' />
              </div>
              <h3 className='text-lg font-semibold'>{qrCode.name}</h3>
              <p className='text-sm text-muted-foreground'>{qrCode.type}</p>
              <div className='mt-2 flex w-full justify-between text-xs text-muted-foreground'>
                <span>Tạo: {qrCode.createdAt}</span>
                <span>Quét: {qrCode.scans}</span>
              </div>
              <div className='mt-4 flex w-full justify-between gap-2'>
                <Button variant='outline' size='sm' className='flex-1'>
                  <Edit className='mr-1 h-3 w-3' />
                  Sửa
                </Button>
                <Button variant='outline' size='sm' className='flex-1'>
                  <Download className='mr-1 h-3 w-3' />
                  Tải
                </Button>
                <Button variant='outline' size='sm' className='flex-1'>
                  <Trash className='mr-1 h-3 w-3' />
                  Xóa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
