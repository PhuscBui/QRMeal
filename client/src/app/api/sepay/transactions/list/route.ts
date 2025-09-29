import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const token = process.env.SEPAY_API_TOKEN
  const baseUrl = process.env.SEPAY_BASE_URL

  const { searchParams } = new URL(req.url)
  const query = searchParams.toString()

  const url = `${baseUrl}/transactions/list${query ? `?${query}` : ''}`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })

  const data = await res.json()
  return NextResponse.json(data)
}
