'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError(true)
      setLoading(false)
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

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center w-full px-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-sm">
          <h2 className="text-xl font-bold text-steinbeis-gray mb-2">Zugang</h2>
          <p className="text-sm text-gray-500 mb-6">Bitte geben Sie das Zugangskennwort ein.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kennwort"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-steinbeis-purple focus:border-transparent text-base"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm">Ungültiges Kennwort. Bitte erneut versuchen.</p>
            )}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full px-8 py-3 bg-steinbeis-purple text-white rounded-lg hover:bg-steinbeis-purple-light disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-semibold"
            >
              {loading ? 'Prüfe...' : 'Zugang öffnen'}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-steinbeis-gray text-gray-300 py-4 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-gray-400">© 2026 Evologix · Steinbeis Management Campus NRW</p>
        </div>
      </div>
    </main>
  )
}
