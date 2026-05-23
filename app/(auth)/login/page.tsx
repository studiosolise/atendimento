'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F1F1F3' }}>
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <p
            className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-2"
            style={{ color: '#AAAAAA' }}
          >
            Studio Solise
          </p>
          <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#1A1A18' }}>
            Entrar
          </h1>
          <p className="text-sm mt-1" style={{ color: '#999999' }}>
            CRM interno
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: '#666666' }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              className="w-full h-10 rounded-lg px-3 text-sm bg-white transition-colors focus:outline-none"
              style={{ border: '1px solid #E5E5E8', color: '#1A1A18' }}
              onFocus={e => (e.target.style.borderColor = '#1A1A18')}
              onBlur={e => (e.target.style.borderColor = '#E5E5E8')}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: '#666666' }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="w-full h-10 rounded-lg px-3 text-sm bg-white transition-colors focus:outline-none"
              style={{ border: '1px solid #E5E5E8', color: '#1A1A18' }}
              onFocus={e => (e.target.style.borderColor = '#1A1A18')}
              onBlur={e => (e.target.style.borderColor = '#E5E5E8')}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            style={{ backgroundColor: '#1A1A18', color: '#FFFFFF' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
