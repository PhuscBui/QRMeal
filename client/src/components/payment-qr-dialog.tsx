'use client'

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check, Copy, RefreshCw, X, AlertCircle } from 'lucide-react'
import { useAppContext } from '@/components/app-provider'
import { useCheckPaymentStatusQuery } from '@/queries/usePayment'

interface PaymentQRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentInfo: {
    payment_id: string
    bank_name: string
    account_number: string
    account_name: string
    amount: number
    content: string
    qr_code_url: string
  } | null
  onPaymentSuccess?: () => void
}

export default function SepayPaymentDialog({
  open,
  onOpenChange,
  paymentInfo,
  onPaymentSuccess
}: PaymentQRDialogProps) {
  const [copied, setCopied] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'success' | 'failed'>('pending')
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes
  const { socket } = useAppContext()
  const { refetch } = useCheckPaymentStatusQuery(
    paymentInfo?.payment_id ? { payment_id: paymentInfo.payment_id, enabled: open } : { payment_id: '', enabled: false }
  )

  // Socket event listener for real-time payment updates
  useEffect(() => {
    if (!open || !paymentInfo) return

    // Connect to socket for payment updates
    interface OrderGroup {
      _id: string
      // add other properties if needed
    }

    interface PaymentSuccessData {
      payment_id: string
      orderGroups?: OrderGroup[]
      // add other properties if needed
    }

    const handlePaymentSuccess = (data: PaymentSuccessData) => {
      if (
        data.payment_id === paymentInfo.payment_id ||
        data.orderGroups?.some((og) => paymentInfo.content.includes(og._id))
      ) {
        setPaymentStatus('success')
        setTimeout(() => {
          onPaymentSuccess?.()
          onOpenChange(false)
        }, 2000)
      }
    }

    // Listen to socket events
    if (typeof window !== 'undefined' && socket) {
      socket.on('sepay-payment-success', handlePaymentSuccess)

      return () => {
        socket.off('sepay-payment-success', handlePaymentSuccess)
      }
    }
  }, [open, paymentInfo, onPaymentSuccess, onOpenChange, socket])

  // Countdown timer
  useEffect(() => {
    if (!open || paymentStatus === 'success') return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setPaymentStatus('failed')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, paymentStatus])

  // Poll payment status
  useEffect(() => {
    if (!open || !paymentInfo || paymentStatus !== 'pending') return

    const checkStatus = async () => {
      try {
        setPaymentStatus('checking')
        const { data } = await refetch()

        if (data?.payload.result.status === 'success') {
          setPaymentStatus('success')
          setTimeout(() => {
            onPaymentSuccess?.()
            onOpenChange(false)
          }, 2000)
        } else {
          setPaymentStatus('pending')
        }
      } catch (error) {
        console.error('Error checking payment:', error)
        setPaymentStatus('pending')
      }
    }

    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [open, paymentInfo, paymentStatus, onPaymentSuccess, onOpenChange, refetch])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  if (!paymentInfo) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-base sm:text-lg'>
            {paymentStatus === 'success' ? (
              <>
                <Check className='h-4 w-4 sm:h-5 sm:w-5 text-green-600' />
                Payment successful
              </>
            ) : paymentStatus === 'failed' ? (
              <>
                <X className='h-4 w-4 sm:h-5 sm:w-5 text-red-600' />
                Payment timeout
              </>
            ) : (
              'Payment by bank transfer'
            )}
          </DialogTitle>
          <DialogDescription className='text-xs sm:text-sm'>
            {paymentStatus === 'pending' || paymentStatus === 'checking'
              ? `Time remaining: ${formatTime(timeRemaining)}`
              : paymentStatus === 'success'
              ? 'Your order has been paid'
              : 'Please create a new payment code'}
          </DialogDescription>
        </DialogHeader>

        {paymentStatus === 'success' ? (
          <div className='text-center py-6 sm:py-8'>
            <div className='w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4'>
              <Check className='h-6 w-6 sm:h-8 sm:w-8 text-green-600' />
            </div>
            <h3 className='text-base sm:text-lg font-semibold mb-2'>Payment confirmed!</h3>
            <p className='text-xs sm:text-sm text-muted-foreground'>Your order has been successfully paid</p>
          </div>
        ) : paymentStatus === 'failed' ? (
          <div className='text-center py-6 sm:py-8'>
            <div className='w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4'>
              <AlertCircle className='h-6 w-6 sm:h-8 sm:w-8 text-red-600' />
            </div>
            <h3 className='text-base sm:text-lg font-semibold mb-2'>Payment timeout!</h3>
            <p className='text-xs sm:text-sm text-muted-foreground mb-4'>
              The QR code has expired. Please create a new payment code.
            </p>
            <Button onClick={() => onOpenChange(false)} className='text-sm'>
              Close
            </Button>
          </div>
        ) : (
          <div className='space-y-3 sm:space-y-4'>
            {/* QR Code */}
            <Card className='p-3 sm:p-4'>
              <div className='text-center'>
                <p className='text-xs sm:text-sm font-medium mb-2 sm:mb-3'>Scan the QR code to pay</p>
                <div className='bg-white p-2 sm:p-4 inline-block rounded-lg'>
                  <img
                    src={paymentInfo.qr_code_url || '/placeholder.svg'}
                    alt='QR Code'
                    className='w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 mx-auto'
                  />
                </div>
                <p className='text-[10px] sm:text-xs text-muted-foreground mt-2 sm:mt-3'>
                  Use your banking app to scan the QR code
                </p>
              </div>
            </Card>

            {/* Payment Details */}
            <Card className='p-3 sm:p-4'>
              <h4 className='font-medium text-xs sm:text-sm mb-2 sm:mb-3'>Or manual bank transfer:</h4>
              <div className='space-y-2 sm:space-y-3'>
                <div className='flex justify-between items-start'>
                  <div>
                    <p className='text-[10px] sm:text-xs text-muted-foreground'>Bank</p>
                    <p className='font-medium text-xs sm:text-sm'>{paymentInfo.bank_name}</p>
                  </div>
                </div>

                <div className='flex justify-between items-center'>
                  <div className='flex-1 min-w-0'>
                    <p className='text-[10px] sm:text-xs text-muted-foreground'>Account Number</p>
                    <p className='font-medium text-xs sm:text-sm truncate'>{paymentInfo.account_number}</p>
                  </div>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='h-7 w-7 sm:h-8 sm:w-8 p-0 ml-2'
                    onClick={() => copyToClipboard(paymentInfo.account_number, 'Account Number')}
                  >
                    {copied === 'Account Number' ? (
                      <Check className='h-3 w-3 sm:h-4 sm:w-4 text-green-600' />
                    ) : (
                      <Copy className='h-3 w-3 sm:h-4 sm:w-4' />
                    )}
                  </Button>
                </div>

                <div>
                  <p className='text-[10px] sm:text-xs text-muted-foreground'>Account Holder</p>
                  <p className='font-medium text-xs sm:text-sm'>{paymentInfo.account_name}</p>
                </div>

                <div className='flex justify-between items-center pt-2 border-t'>
                  <div className='flex-1 min-w-0'>
                    <p className='text-[10px] sm:text-xs text-muted-foreground'>Amount</p>
                    <p className='font-semibold text-base sm:text-lg text-primary truncate'>
                      {formatCurrency(paymentInfo.amount)}
                    </p>
                  </div>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='h-7 w-7 sm:h-8 sm:w-8 p-0 ml-2'
                    onClick={() => copyToClipboard(paymentInfo.amount.toString(), 'Số tiền')}
                  >
                    {copied === 'Số tiền' ? (
                      <Check className='h-3 w-3 sm:h-4 sm:w-4 text-green-600' />
                    ) : (
                      <Copy className='h-3 w-3 sm:h-4 sm:w-4' />
                    )}
                  </Button>
                </div>

                <div className='flex justify-between items-start gap-2 bg-yellow-50 dark:bg-yellow-950/20 p-2 sm:p-3 rounded-lg'>
                  <div className='flex-1 min-w-0'>
                    <p className='text-[10px] sm:text-xs text-muted-foreground'>Transfer Content</p>
                    <p className='font-medium text-xs sm:text-sm break-all'>{paymentInfo.content}</p>
                  </div>
                  <Button
                    size='sm'
                    variant='ghost'
                    className='h-7 w-7 sm:h-8 sm:w-8 p-0 flex-shrink-0'
                    onClick={() => copyToClipboard(paymentInfo.content, 'Nội dung')}
                  >
                    {copied === 'Nội dung' ? (
                      <Check className='h-3 w-3 sm:h-4 sm:w-4 text-green-600' />
                    ) : (
                      <Copy className='h-3 w-3 sm:h-4 sm:w-4' />
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Status */}
            <div className='bg-blue-50 dark:bg-blue-950/20 p-2 sm:p-3 rounded-lg'>
              <div className='flex items-center gap-2'>
                {paymentStatus === 'checking' ? (
                  <>
                    <RefreshCw className='h-3 w-3 sm:h-4 sm:w-4 text-blue-600 animate-spin flex-shrink-0' />
                    <p className='text-[10px] sm:text-sm text-blue-800 dark:text-blue-200'>
                      Checking payment status...
                    </p>
                  </>
                ) : (
                  <>
                    <RefreshCw className='h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0' />
                    <p className='text-[10px] sm:text-sm text-blue-800 dark:text-blue-200'>
                      Waiting for payment confirmation
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Important Note */}
            <div className='bg-red-50 dark:bg-red-950/20 p-2 sm:p-3 rounded-lg'>
              <p className='text-[10px] sm:text-xs text-red-800 dark:text-red-200'>
                ⚠️ <strong>Important:</strong> You must enter the exact transfer content above for the system to
                automatically confirm payment
              </p>
            </div>

            {/* Actions */}
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => onOpenChange(false)}
                className='flex-1 text-xs sm:text-sm h-9 sm:h-10'
              >
                <X className='h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2' />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
