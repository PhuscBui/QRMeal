import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const token = process.env.SEPAY_API_TOKEN
  const baseUrl = process.env.SEPAY_BASE_URL

  if (!token || !baseUrl) {
    return NextResponse.json({ error: 'Missing config' }, { status: 500 })
  }

  const res = await fetch(`${baseUrl}/transactions/details/${params.id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })

  const data = await res.json()
  return NextResponse.json(data)
}
