'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { QrCode, ArrowLeft, Camera, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ScanQRPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)

  // Mock table data - in real app, this would come from API
  const mockTableData = {
    'table-001': { number: 'Bàn 1', floor: 'Tầng 1', capacity: 4 },
    'table-002': { number: 'Bàn 2', floor: 'Tầng 1', capacity: 2 },
    'table-003': { number: 'Bàn 3', floor: 'Tầng 2', capacity: 6 },
    'table-004': { number: 'Bàn 4', floor: 'Tầng 2', capacity: 4 }
  }

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
        videoRef.current.play()
      }
    } catch (err) {
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.')
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    setIsScanning(false)
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
  }

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      processScannedData(manualCode.trim())
    }
  }

  const processScannedData = (data: string) => {
    // In real app, this would validate the QR code format and check if table exists
    const tableInfo = mockTableData[data as keyof typeof mockTableData]
    
    if (tableInfo) {
      setScannedData(data)
      setError(null)
      stopScanning()
      
      // Store table info in localStorage for the order session
      localStorage.setItem('tableInfo', JSON.stringify({
        tableId: data,
        tableNumber: tableInfo.number,
        floor: tableInfo.floor,
        capacity: tableInfo.capacity
      }))
      
      // Navigate to menu with table info
      setTimeout(() => {
        router.push('/customer/dine-in/menu')
      }, 1500)
    } else {
      setError('Mã QR không hợp lệ hoặc bàn không tồn tại. Vui lòng thử lại.')
    }
  }

  const handleQRCodeDetected = (data: string) => {
    processScannedData(data)
  }

  // Simulate QR code detection (in real app, use a QR code library)
  useEffect(() => {
    if (isScanning && videoRef.current) {
      const interval = setInterval(() => {
        // This is a mock implementation
        // In real app, you would use a library like @zxing/library or jsQR
        const mockQRData = 'table-001' // Simulate detected QR code
        if (Math.random() > 0.95) { // 5% chance per interval
          handleQRCodeDetected(mockQRData)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [isScanning])

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
            <h2 className='text-xl font-bold text-green-800 dark:text-green-200 mb-2'>
              Quét thành công!
            </h2>
            <p className='text-green-700 dark:text-green-300 mb-4'>
              Đang chuyển đến menu...
            </p>
            <div className='text-sm text-green-600 dark:text-green-400'>
              Bàn: {mockTableData[scannedData as keyof typeof mockTableData]?.number} - 
              {mockTableData[scannedData as keyof typeof mockTableData]?.floor}
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
            <CardDescription>
              Hướng camera về phía mã QR trên bàn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='relative aspect-video bg-black rounded-lg overflow-hidden'>
              {isScanning ? (
                <video
                  ref={videoRef}
                  className='w-full h-full object-cover'
                  playsInline
                />
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
            <CardDescription>
              Nếu không thể quét QR code, bạn có thể nhập mã bàn trực tiếp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div>
                <Label htmlFor='tableCode'>Mã bàn</Label>
                <Input
                  id='tableCode'
                  placeholder='Nhập mã bàn (ví dụ: table-001)'
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleManualSubmit} 
                className='w-full'
                disabled={!manualCode.trim()}
              >
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
            <li>2. Nhấn "Bắt đầu quét" và hướng camera về phía mã QR</li>
            <li>3. Giữ camera ổn định cho đến khi quét thành công</li>
            <li>4. Nếu không quét được, bạn có thể nhập mã bàn thủ công</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
