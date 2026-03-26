import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (!password || password !== process.env.SITE_PASSWORD) {
    return NextResponse.json({ error: 'Ungültiges Kennwort' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('auth-token', password, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 Tage
    path: '/',
  })
  return response
}
