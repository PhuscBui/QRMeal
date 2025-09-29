import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.SEPAY_API_TOKEN
  const baseUrl = process.env.SEPAY_BASE_URL

  const res = await fetch(`${baseUrl}/transactions/count`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  const data = await res.json()
  return NextResponse.json(data)
}
