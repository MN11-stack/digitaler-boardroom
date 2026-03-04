import { NextResponse } from 'next/server'

export const maxDuration = 300 // 5 Minuten – Vercel Pro/Enterprise erforderlich

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || ''

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const question = formData.get('question') as string
    const company_name = formData.get('company_name') as string || ''
    const files = formData.getAll('files') as File[]

    if (!question || question.trim() === '') {
      return NextResponse.json(
        { error: 'Frage darf nicht leer sein' },
        { status: 400 }
      )
    }

    if (files.length > 2) {
      return NextResponse.json(
        { error: 'Maximal 2 Dateien erlaubt' },
        { status: 400 }
      )
    }

    for (const file of files) {
      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > 5) {
        return NextResponse.json(
          { error: `Datei "${file.name}" überschreitet 5MB Limit` },
          { status: 400 }
        )
      }
    }

    const sessionId = request.headers.get('x-session-id') || `session-${Date.now()}`

    if (!N8N_WEBHOOK_URL) {
      console.warn('N8N_WEBHOOK_URL not configured, falling back to mock mode')
      return getMockResponse(question, company_name, files, sessionId)
    }

    const n8nPayload: any = {
      question,
      company_name,
      session_id: sessionId,
      files: []
    }

    if (files.length > 0) {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        n8nPayload.files.push({
          name: file.name,
          type: file.type,
          size: file.size,
          content: base64
        })
      }
    }

    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload),
    })

    if (!n8nResponse.ok) {
      console.error('n8n webhook error:', n8nResponse.status, n8nResponse.statusText)
      throw new Error(`n8n webhook returned status ${n8nResponse.status}`)
    }

    const result = await n8nResponse.json()

    return NextResponse.json({
      answer: result.answer || 'Keine Antwort erhalten',
      boards: result.boards || '',
      timestamp: result.timestamp || new Date().toISOString(),
      status: 'success'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        error: 'Interner Serverfehler',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function getMockResponse(question: string, company_name: string, files: File[], sessionId: string) {
  let mockAnswer = '**🔧 MOCK MODE** (n8n Webhook nicht konfiguriert)\n\n'
  mockAnswer += `**Unternehmen:** ${company_name || 'Nicht angegeben'}\n`
  mockAnswer += `**Frage:** "${question}"\n\n`
  if (files.length > 0) {
    mockAnswer += `Dateien empfangen: ${files.map(f => f.name).join(', ')}\n\n`
  }
  mockAnswer += `Setzen Sie \`N8N_WEBHOOK_URL\` in Vercel um die Boardroom-Pipeline zu aktivieren.`

  return NextResponse.json({
    answer: mockAnswer,
    boards: '',
    timestamp: new Date().toISOString(),
    status: 'mock'
  })
}
