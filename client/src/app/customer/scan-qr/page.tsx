'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { QrCode, ArrowLeft, Camera, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTableListQuery } from '@/queries/useTable'
import { BrowserQRCodeReader } from '@zxing/browser'

export default function ScanQRPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')

  const { data } = useTableListQuery()

  const tables = useMemo(() => data?.payload.result || [], [data])

  const startScanning = async () => {
    try {
      setError(null)
      setIsScanning(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment' // Use back camera on mobile
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.')
      setIsScanning(false)
    }
  }

  const stopScanning = useCallback(() => {
    setIsScanning(false)
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      processScannedData(manualCode.trim())
    }
  }

  const processScannedData = useCallback(
    (data: string) => {
      try {
        let tableNumber: number | null = null
        let token: string | null = null

        // Check if scanned data is a URL
        if (data.startsWith('http://') || data.startsWith('https://')) {
          try {
            const url = new URL(data)

            // Extract table ID from path (e.g., /tables/1 -> tableId = "1")
            const pathSegments = url.pathname.split('/').filter(Boolean)
            if (pathSegments.length >= 2 && pathSegments[0] === 'tables') {
              tableNumber = parseInt(pathSegments[1], 10)
            }

            // Extract token from query parameters
            token = url.searchParams.get('token')

            if (!tableNumber || !token) {
              throw new Error('Invalid QR code format')
            }
          } catch (urlError) {
            console.error('Error parsing URL:', urlError)
            setError('URL QR code không hợp lệ. Vui lòng thử lại.')
            return
          }
        } else {
          // Handle legacy format (direct table code like "table-001")
          tableNumber = parseInt(data.split('-')[1], 10)
        }

        // Find table by ID
        const table = tables.find((t) => t.number === tableNumber)

        if (!table) {
          setError('Bàn không tồn tại hoặc mã QR không hợp lệ. Vui lòng thử lại.')
          return
        }

        // Validate token if provided
        if (token && table.token !== token) {
          setError('Mã xác thực không hợp lệ. Vui lòng sử dụng QR code chính thức của nhà hàng.')
          return
        }

        // Check table status
        if (table.status === 'Hidden') {
          setError('Bàn này hiện không khả dụng. Vui lòng liên hệ nhân viên.')
          return
        }

        if (table.status === 'Reserved' && !table.reservation?.is_customer) {
          setError('Bàn này đã được đặt trước. Vui lòng liên hệ nhân viên nếu bạn là người đặt bàn.')
          return
        }

        // Success - table is available or customer has valid reservation
        setScannedData(tableNumber.toString())
        setError(null)
        stopScanning()

        // Store comprehensive table info for the order session
        const tableInfo = {
          tableId: table._id,
          tableNumber: table.number,
          location: table.location,
          capacity: table.capacity,
          status: table.status,
          token: table.token,
          ...(table.reservation && {
            reservation: {
              guest_id: table.reservation.guest_id,
              customer_id: table.reservation.customer_id,
              reservation_time: table.reservation.reservation_time,
              is_customer: table.reservation.is_customer,
              note: table.reservation.note
            }
          })
        }

        // Store table info (using sessionStorage instead of localStorage)
        localStorage.setItem('tableInfo', JSON.stringify(tableInfo))

        // Navigate to menu with table info
        setTimeout(() => {
          router.push(`/customer/dine-in/menu`)
        }, 1500)
      } catch (error) {
        console.error('Error processing scanned data:', error)
        setError('Có lỗi xảy ra khi xử lý mã QR. Vui lòng thử lại.')
      }
    },
    [tables, setError, setScannedData, stopScanning, router]
  )

  const handleQRCodeDetected = useCallback(
    (data: string) => {
      processScannedData(data)
    },
    [processScannedData]
  )

  useEffect(() => {
    if (isScanning && videoRef.current) {
      const codeReader = new BrowserQRCodeReader()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let controls: any

      codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error, ctrl) => {
        controls = ctrl // giữ lại instance điều khiển
        if (result) {
          handleQRCodeDetected(result.getText())
        }
      })

      return () => {
        if (controls) {
          controls.stop()
        }
      }
    }
  }, [isScanning, handleQRCodeDetected])

  return (
    <div className='container mx-auto px-4 py-8 max-w-2xl'>
      {/* Header */}
      <div className='flex items-center gap-4 mb-8'>
        <Button variant='ghost' size='icon' onClick={() => router.back()}>
          <ArrowLeft className='h-4 w-4' />
        </Button>
        <div>
          <h1 className='text-3xl font-bold'>Quét QR Code</h1>
          <p className='text-muted-foreground'>Quét mã QR trên bàn để bắt đầu đặt món</p>
        </div>
      </div>

      {/* Success State */}
      {scannedData && (
        <Card className='border-green-200 bg-green-50 dark:bg-green-950/20'>
          <CardContent className='p-6 text-center'>
            <CheckCircle className='h-16 w-16 mx-auto text-green-500 mb-4' />
            <h2 className='text-xl font-bold text-green-800 dark:text-green-200 mb-2'>Quét thành công!</h2>
            <p className='text-green-700 dark:text-green-300 mb-4'>Đang chuyển đến menu...</p>
            <div className='text-sm text-green-600 dark:text-green-400 space-y-1'>
              {(() => {
                const table = tables.find((t) => t._id === scannedData)
                if (!table) return null

                return (
                  <>
                    <div>Bàn số: {table.number}</div>
                    <div>Vị trí: {table.location}</div>
                    <div>Sức chứa: {table.capacity} người</div>
                    {table.status === 'Reserved' && table.reservation?.is_customer && (
                      <div className='mt-2 p-2 bg-blue-100 dark:bg-blue-900/20 rounded text-blue-700 dark:text-blue-300'>
                        Bàn đã đặt trước cho bạn
                      </div>
                    )}
                    {table.status === 'Occupied' && (
                      <div className='mt-2 p-2 bg-orange-100 dark:bg-orange-900/20 rounded text-orange-700 dark:text-orange-300'>
                        Bàn hiện đang được sử dụng
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Alert className='mb-6' variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Camera View */}
      {!scannedData && (
        <Card className='mb-6'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Camera className='h-5 w-5' />
              Camera
            </CardTitle>
            <CardDescription>Hướng camera về phía mã QR trên bàn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='relative aspect-video bg-black rounded-lg overflow-hidden'>
              {isScanning ? (
                <video ref={videoRef} className='w-full h-full object-cover' playsInline />
              ) : (
                <div className='flex items-center justify-center h-full'>
                  <div className='text-center text-white'>
                    <QrCode className='h-16 w-16 mx-auto mb-4 opacity-50' />
                    <p className='text-lg'>Camera chưa được khởi động</p>
                  </div>
                </div>
              )}

              {/* QR Code Overlay */}
              {isScanning && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='w-48 h-48 border-2 border-white rounded-lg opacity-50'>
                    <div className='absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg' />
                    <div className='absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg' />
                    <div className='absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg' />
                    <div className='absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg' />
                  </div>
                </div>
              )}
            </div>

            <div className='flex gap-2 mt-4'>
              {!isScanning ? (
                <Button onClick={startScanning} className='flex-1'>
                  <Camera className='h-4 w-4 mr-2' />
                  Bắt đầu quét
                </Button>
              ) : (
                <Button onClick={stopScanning} variant='outline' className='flex-1'>
                  Dừng quét
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Input */}
      {!scannedData && (
        <Card>
          <CardHeader>
            <CardTitle>Nhập mã bàn thủ công</CardTitle>
            <CardDescription>Nếu không thể quét QR code, bạn có thể nhập URL hoặc mã bàn trực tiếp</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='tableCode'>Mã bàn hoặc URL</Label>
                <Input
                  id='tableCode'
                  placeholder='Nhập URL (http://...) hoặc mã bàn (table-001)'
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
              </div>
              <Button onClick={handleManualSubmit} className='w-full' disabled={!manualCode.trim()}>
                Xác nhận mã bàn
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className='mt-6'>
        <CardContent className='p-6'>
          <h3 className='font-semibold mb-3'>Hướng dẫn sử dụng:</h3>
          <ol className='space-y-2 text-sm text-muted-foreground'>
            <li>1. Tìm mã QR code trên bàn của bạn</li>
            <li>2. Nhấn &quot;Bắt đầu quét&#34; và hướng camera về phía mã QR</li>
            <li>3. Giữ camera ổn định cho đến khi quét thành công</li>
            <li>4. Nếu không quét được, bạn có thể nhập URL hoặc mã bàn thủ công</li>
            <li>5. Hệ thống sẽ kiểm tra tính hợp lệ của bàn và chuyển đến menu</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
