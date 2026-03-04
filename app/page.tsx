'use client'

import { useState, useRef } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: string
  boards?: string
  company_name?: string
  files?: FileAttachment[]
}

interface FileAttachment {
  name: string
  size: number
  type: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [expandedBoards, setExpandedBoards] = useState<number[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const toggleBoards = (index: number) => {
    setExpandedBoards(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const sendMessage = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return

    const fileAttachments: FileAttachment[] = attachedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }))

    const userMessage: Message = {
      role: 'user',
      content: input || '📎 Dateien hochgeladen',
      company_name: companyName || undefined,
      files: fileAttachments.length > 0 ? fileAttachments : undefined
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    const currentCompany = companyName
    setInput('')
    const filesToProcess = attachedFiles
    setAttachedFiles([])
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('question', currentInput)
      formData.append('company_name', currentCompany)
      filesToProcess.forEach(file => formData.append('files', file))

      const response = await axios.post('/api/chat', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000
      })

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.answer,
        boards: response.data.boards || ''
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Es gab einen Fehler bei der Verarbeitung. Die Boardroom-Analyse dauert typischerweise 60–120 Sekunden. Bitte versuchen Sie es erneut.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-steinbeis-bg">
      {/* Header */}
      <div className="w-full bg-steinbeis-purple text-white p-6 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-3 md:gap-0">
            <div className="flex items-center space-x-3">
              <img src="/steinbeis-logo.png" alt="Steinbeis Logo" className="h-10 w-auto" />
              <div className="bg-white px-2 py-1.5 rounded">
                <img src="/Management Campus NRW.jpg" alt="Management Campus NRW" className="h-7 w-auto" />
              </div>
            </div>
            <div className="text-center md:text-right">
              <h1 className="text-4xl font-bold">Digitaler Boardroom</h1>
              <p className="text-purple-100 mt-1 text-sm">Ihr virtuelles KI-Board für strategische Entscheidungen</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="w-full max-w-5xl px-4 pt-8 pb-4">
        <div className="bg-purple-50 border-l-4 border-steinbeis-purple rounded-lg p-3 md:p-5 shadow-sm">
          <div className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-3">
            <svg className="w-6 h-6 text-steinbeis-purple flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-steinbeis-purple mb-2">So funktioniert der Digitale Boardroom:</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-steinbeis-gray">
                <div className="flex items-start gap-2">
                  <span className="text-steinbeis-purple font-bold">①</span>
                  <span><strong>Researcher</strong> analysiert aktuelle Marktdaten zu Ihrer Frage</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-steinbeis-purple font-bold">②</span>
                  <span><strong>Strategie-Board</strong> bewertet aus CEO-Sicht (Tim · Elon · Jensen · Jack)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-steinbeis-purple font-bold">③</span>
                  <span><strong>Finance-Board</strong> analysiert finanzielle Implikationen (Warren · Larry · Henry · Stefan)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-steinbeis-purple font-bold">④</span>
                  <span><strong>Marketing-Board</strong> bewertet Markt & Kunden (Steve · Gary · Ann · Sean)</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Der <strong>Aufsichtsratsvorsitzende</strong> synthetisiert alle Board-Analysen zu einer strukturierten Entscheidungsgrundlage. Dauer: ca. 60–120 Sekunden.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 w-full max-w-5xl px-4 pb-8">
        <div className="bg-white rounded-xl shadow-xl min-h-[400px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-6">
            {messages.length === 0 ? (
              <div className="w-full">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-steinbeis-purple mb-1">Willkommen im Digitalen Boardroom</h2>
                  <p className="text-sm text-steinbeis-gray">Stellen Sie Ihre strategische Frage – unser KI-Board analysiert sie aus vier Perspektiven.</p>
                </div>

                {/* 4 Stages */}
                <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-6">
                  {[
                    { label: 'Researcher', desc: 'Marktdaten, HHI, Lerner-Index, Eintrittsbarrieren', active: false },
                    { label: 'Strategie-Board', desc: 'CEO-Perspektiven: Vision, Technologie, Skalierung, Portfolio', active: true },
                    { label: 'Finance-Board', desc: 'Value, Risiko, Private Equity, Sanierung', active: true },
                    { label: 'Marketing-Board', desc: 'Design, Social Media, Content, Growth Hacking', active: true },
                  ].map((stage, i) => (
                    <div key={i} className={`flex-1 rounded-xl border p-3 ${stage.active ? 'border-steinbeis-purple bg-purple-50' : 'border-gray-200 bg-gray-50'}`}>
                      <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${stage.active ? 'text-steinbeis-purple' : 'text-gray-400'}`}>{stage.label}</p>
                      <p className="text-xs text-steinbeis-gray">{stage.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-steinbeis-purple text-white px-4 py-2 rounded-full text-sm font-semibold">
                    + Aufsichtsratsvorsitzender: Synthese & Entscheidungsgrundlage
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-xl px-3 md:px-5 py-2 md:py-4 ${
                    message.role === 'user'
                      ? 'max-w-[85%] bg-steinbeis-purple text-white'
                      : 'w-full bg-steinbeis-bg text-steinbeis-gray'
                  }`}>
                    {/* User: company name badge */}
                    {message.role === 'user' && message.company_name && (
                      <p className="text-xs text-purple-200 mb-1 font-medium">Unternehmen: {message.company_name}</p>
                    )}

                    {/* File attachments */}
                    {message.files && message.files.length > 0 && (
                      <div className="mb-2 space-y-1">
                        {message.files.map((file, idx) => (
                          <div key={idx} className={`flex items-center space-x-2 text-sm ${message.role === 'user' ? 'text-purple-100' : 'text-gray-600'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span>{file.name}</span>
                            <span className="opacity-60">({formatFileSize(file.size)})</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {message.role === 'user' ? (
                      <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{message.content}</p>
                    ) : (
                      <div>
                        {/* AR-Vorsitzender Label */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-semibold text-steinbeis-purple uppercase tracking-wide bg-purple-100 px-2 py-0.5 rounded-full">
                            Aufsichtsratsvorsitzender – Synthese
                          </span>
                        </div>

                        {/* AR-Vorsitzender Analyse */}
                        <div className="prose prose-sm max-w-none prose-headings:text-steinbeis-gray prose-h3:text-steinbeis-purple prose-p:text-steinbeis-gray prose-strong:text-steinbeis-gray prose-li:text-steinbeis-gray prose-code:text-steinbeis-purple prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>

                        {/* Board-Details – aufklappbar */}
                        {message.boards && (
                          <div className="border-t border-gray-200 pt-3 mt-4">
                            <button
                              onClick={() => toggleBoards(index)}
                              className="flex items-center gap-2 text-sm font-semibold text-steinbeis-purple hover:opacity-75 transition-opacity"
                            >
                              <svg
                                className={`w-4 h-4 transition-transform ${expandedBoards.includes(index) ? 'rotate-90' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              {expandedBoards.includes(index)
                                ? 'Board-Analysen ausblenden'
                                : 'Board-Analysen einblenden (Strategie · Finance · Marketing)'}
                            </button>

                            {expandedBoards.includes(index) && (
                              <div className="mt-3 prose prose-sm max-w-none prose-headings:text-steinbeis-gray prose-p:text-steinbeis-gray prose-strong:text-steinbeis-gray prose-pre:bg-gray-100">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {message.boards}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-steinbeis-bg rounded-xl px-5 py-4 w-full max-w-sm">
                  <p className="text-xs text-steinbeis-purple font-semibold mb-1">Boardroom-Analyse läuft...</p>
                  <p className="text-xs text-gray-500 mb-3">Researcher → 3 Boards → Aufsichtsratsvorsitzender (ca. 60–120 Sek.)</p>
                  <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 bg-steinbeis-purple rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-steinbeis-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-steinbeis-purple rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* File Attachments Preview */}
          {attachedFiles.length > 0 && (
            <div className="px-4 py-3 border-t bg-steinbeis-bg">
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                    <svg className="w-4 h-4 text-steinbeis-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-sm font-medium text-steinbeis-gray">{file.name}</span>
                    <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                    <button onClick={() => removeFile(index)} className="ml-1 text-gray-400 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Section */}
          <div className="border-t p-4 space-y-3">
            {/* Company Name */}
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Unternehmen / Branche (optional)"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-steinbeis-purple text-sm disabled:bg-gray-100 text-steinbeis-gray"
            />

            {/* Question + Send */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-0 md:space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept=".pdf,.docx,.xlsx,.csv,.md,.txt"
                className="hidden"
              />
              <div className="relative group">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full md:w-auto px-4 py-3 border-2 border-gray-300 text-steinbeis-gray rounded-lg hover:bg-steinbeis-bg hover:border-steinbeis-purple disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="md:hidden text-sm">Datei anhängen</span>
                </button>
                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-56 bg-gray-800 text-white text-xs rounded px-3 py-2 shadow-lg z-10">
                  Unternehmens-Dokumente hochladen (.pdf, .docx, .xlsx, .csv, max. 5MB)
                </div>
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ihre strategische Frage an das Boardroom..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steinbeis-purple focus:border-transparent disabled:bg-gray-100 text-base"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
                className="w-full md:w-auto px-8 py-3 bg-steinbeis-green text-white rounded-lg hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-semibold"
              >
                {isLoading ? 'Läuft...' : 'Senden'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kontakt Box */}
      <div className="w-full max-w-5xl px-4 pb-8">
        <div className="bg-green-50 border-l-4 border-steinbeis-green rounded-lg p-3 md:p-4 shadow-sm">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-steinbeis-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-steinbeis-gray">
              <span className="font-semibold">Fragen oder individuelle Boardroom-Konfiguration für Ihr Unternehmen?</span>
              <br />
              Kontaktieren Sie uns: <a href="mailto:evologix@steinbeis-ifem.de" className="text-steinbeis-green hover:text-steinbeis-purple font-semibold underline">evologix@steinbeis-ifem.de</a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-steinbeis-gray text-gray-300 py-6 px-4 mt-auto">
        <div className="max-w-5xl mx-auto border-t border-gray-600 pt-4">
          <p className="text-sm font-semibold text-white mb-1">
            Digitaler Boardroom © 2026 – entwickelt durch Evologix
          </p>
          <p className="text-xs text-gray-400">GPT-4.1 · Tavily Research · n8n Cloud (EU) · Vercel</p>
          <p className="text-xs text-gray-500 mt-1">Uploads werden temporär verarbeitet und nach Sitzungsende gelöscht</p>
        </div>
      </div>
    </main>
  )
}
