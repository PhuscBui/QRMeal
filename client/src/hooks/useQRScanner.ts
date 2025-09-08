import { useState, useRef, useCallback } from 'react'

interface QRScannerOptions {
  onSuccess: (data: string) => void
  onError?: (error: string) => void
}

interface TableInfo {
  tableId: string
  tableNumber: string
  floor: string
  capacity: number
}

export function useQRScanner({ onSuccess, onError }: QRScannerOptions) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startScanning = useCallback(async () => {
    try {
      setError(null)
      setIsScanning(true)
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera on mobile
        } 
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (err) {
      const errorMessage = 'Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.'
      setError(errorMessage)
      onError?.(errorMessage)
      setIsScanning(false)
    }
  }, [onError])

  const stopScanning = useCallback(() => {
    setIsScanning(false)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const processQRData = useCallback((data: string) => {
    // In real app, this would validate the QR code format and check if table exists
    // For now, we'll simulate table validation
    const mockTableData: Record<string, TableInfo> = {
      'table-001': { tableId: 'table-001', tableNumber: 'Bàn 1', floor: 'Tầng 1', capacity: 4 },
      'table-002': { tableId: 'table-002', tableNumber: 'Bàn 2', floor: 'Tầng 1', capacity: 2 },
      'table-003': { tableId: 'table-003', tableNumber: 'Bàn 3', floor: 'Tầng 2', capacity: 6 },
      'table-004': { tableId: 'table-004', tableNumber: 'Bàn 4', floor: 'Tầng 2', capacity: 4 }
    }

    const tableInfo = mockTableData[data]
    
    if (tableInfo) {
      // Store table info in localStorage
      localStorage.setItem('tableInfo', JSON.stringify(tableInfo))
      onSuccess(data)
      stopScanning()
    } else {
      const errorMessage = 'Mã QR không hợp lệ hoặc bàn không tồn tại. Vui lòng thử lại.'
      setError(errorMessage)
      onError?.(errorMessage)
    }
  }, [onSuccess, stopScanning, onError])

  const validateTableCode = useCallback((code: string) => {
    processQRData(code)
  }, [processQRData])

  return {
    isScanning,
    error,
    videoRef,
    startScanning,
    stopScanning,
    validateTableCode,
    clearError: () => setError(null)
  }
}
