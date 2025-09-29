'use client'

import React from 'react'
import Image from 'next/image'

interface SepayQrProps {
  accountNumber: string
  bank: string
  amount?: number
  description?: string
  size?: number
}

export default function SepayQr({ accountNumber, bank, amount, description, size = 300 }: SepayQrProps) {
  const params = new URLSearchParams({
    acc: accountNumber,
    bank: bank
  })

  if (amount) params.append('amount', amount.toString())
  if (description) params.append('des', description)

  const qrUrl = `https://qr.sepay.vn/img?${params.toString()}`
  return (
    <Image src={qrUrl} alt='QR Thanh toán SePay' width={size} height={size} className='rounded shadow' unoptimized />
  )
}
