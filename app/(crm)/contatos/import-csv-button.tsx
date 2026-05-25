'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, CheckCircle } from 'lucide-react'

type ParsedContact = {
  name: string
  phone: string
  email: string
  company: string
  instagram: string
  notes: string
}

type ColumnMap = {
  name: number
  phone: number
  email: number
  company: number
  instagram: number
  notes: number
}

function normalize(str: string) {
  return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}

function detectColumns(headers: string[]): ColumnMap {
  const h = headers.map(normalize)
  const find = (patterns: string[]) => {
    for (const p of patterns) {
      const idx = h.findIndex(col => col.includes(p))
      if (idx !== -1) return idx
    }
    return -1
  }
  return {
    name:      find(['nome', 'name', 'contato', 'cliente', 'lead']),
    phone:     find(['telefone', 'phone', 'whatsapp', 'celular', 'fone', 'tel']),
    email:     find(['email', 'e-mail', 'mail']),
    company:   find(['empresa', 'company', 'negocio', 'marca']),
    instagram: find(['instagram', 'insta', '@']),
    notes:     find(['observacao', 'notes', 'obs', 'nota', 'comentario', 'mensagem']),
  }
}

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (!lines.length) return { headers: [], rows: [] }
  const sep = lines[0].includes(';') ? ';' : ','
  const split = (line: string) =>
    line.split(sep).map(cell => cell.trim().replace(/^"|"$/g, ''))
  return {
    headers: split(lines[0]),
    rows: lines.slice(1).map(split),
  }
}

function rowToContact(row: string[], map: ColumnMap): ParsedContact {
  const get = (idx: number) => (idx >= 0 ? row[idx] ?? '' : '')
  return {
    name:      get(map.name),
    phone:     get(map.phone),
    email:     get(map.email),
    company:   get(map.company),
    instagram: get(map.instagram),
    notes:     get(map.notes),
  }
}

export function ImportCSVButton() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [contacts, setContacts] = useState<ParsedContact[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMap, setColumnMap] = useState<ColumnMap | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(0)
  const [error, setError] = useState('')

  function reset() {
    setContacts([])
    setHeaders([])
    setColumnMap(null)
    setDone(0)
    setError('')
  }

  function close() {
    setOpen(false)
    reset()
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleFile(file: File) {
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const { headers: h, rows } = parseCSV(text)
      if (!h.length) { setError('Arquivo vazio ou inválido.'); return }
      const map = detectColumns(h)
      if (map.name === -1) {
        setError('Não foi possível detectar a coluna de nome. Verifique se o CSV tem uma coluna "Nome" ou "Name".')
        return
      }
      const parsed = rows
        .map(row => rowToContact(row, map))
        .filter(c => c.name.trim())
      if (!parsed.length) { setError('Nenhum contato válido encontrado.'); return }
      setHeaders(h)
      setColumnMap(map)
      setContacts(parsed)
    }
    reader.readAsText(file, 'UTF-8')
  }

  async function handleImport() {
    if (!contacts.length) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contatos/importar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error ?? 'Erro ao importar.'); return }
      setDone(json.imported)
      setTimeout(() => {
        close()
        router.refresh()
      }, 1800)
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const FIELD_LABELS: Record<keyof ColumnMap, string> = {
    name: 'Nome',
    phone: 'Telefone',
    email: 'E-mail',
    company: 'Empresa',
    instagram: 'Instagram',
    notes: 'Observações',
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-all hover:opacity-80"
        style={{ backgroundColor: '#FFFFFF', color: '#666666', border: '1px solid #E5E5E8' }}
      >
        <Upload size={14} />
        Importar CSV
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) close() }}
        >
          <div
            className="w-full max-w-xl rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E5E8' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #F0F0F0' }}>
              <p className="text-sm font-semibold" style={{ color: '#1A1A18' }}>Importar leads via CSV</p>
              <button onClick={close} className="hover:opacity-60 transition-opacity">
                <X size={16} style={{ color: '#AAAAAA' }} />
              </button>
            </div>

            <div className="p-6">
              {done > 0 ? (
                /* Sucesso */
                <div className="flex flex-col items-center gap-3 py-6">
                  <CheckCircle size={40} style={{ color: '#059669' }} />
                  <p className="text-sm font-semibold" style={{ color: '#1A1A18' }}>
                    {done} {done === 1 ? 'contato importado' : 'contatos importados'}
                  </p>
                  <p className="text-xs" style={{ color: '#AAAAAA' }}>Recarregando a lista...</p>
                </div>
              ) : contacts.length === 0 ? (
                /* Upload */
                <>
                  <div
                    className="border-2 border-dashed rounded-xl flex flex-col items-center gap-3 py-10 cursor-pointer transition-colors hover:border-gray-400"
                    style={{ borderColor: '#E5E5E8' }}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault()
                      const file = e.dataTransfer.files[0]
                      if (file) handleFile(file)
                    }}
                  >
                    <Upload size={24} style={{ color: '#CCCCCC' }} />
                    <div className="text-center">
                      <p className="text-sm" style={{ color: '#666666' }}>Arraste o arquivo ou clique para selecionar</p>
                      <p className="text-xs mt-1" style={{ color: '#AAAAAA' }}>Aceita .csv com separador vírgula ou ponto-e-vírgula</p>
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
                  />
                  <p className="text-xs mt-4" style={{ color: '#AAAAAA' }}>
                    O sistema detecta automaticamente as colunas. Colunas reconhecidas: Nome, Telefone, E-mail, Empresa, Instagram, Observações.
                  </p>
                  {error && <p className="text-sm mt-3" style={{ color: '#DC2626' }}>{error}</p>}
                </>
              ) : (
                /* Preview */
                <>
                  {/* Colunas detectadas */}
                  {columnMap && (
                    <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#F8F8F8', border: '1px solid #F0F0F0' }}>
                      <p className="text-[10px] font-semibold uppercase mb-2" style={{ color: '#AAAAAA', letterSpacing: '0.12em' }}>
                        Colunas detectadas
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(Object.entries(columnMap) as [keyof ColumnMap, number][])
                          .filter(([, idx]) => idx >= 0)
                          .map(([field, idx]) => (
                            <span key={field} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#EEEEF0', color: '#555555' }}>
                              {FIELD_LABELS[field]} ← <span style={{ color: '#888888' }}>{headers[idx]}</span>
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Preview tabela */}
                  <div className="rounded-lg overflow-hidden mb-4" style={{ border: '1px solid #E5E5E8' }}>
                    <div className="px-4 py-2.5 flex items-center justify-between" style={{ backgroundColor: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                      <p className="text-xs font-semibold" style={{ color: '#1A1A18' }}>
                        {contacts.length} {contacts.length === 1 ? 'contato' : 'contatos'} encontrados
                      </p>
                      <p className="text-xs" style={{ color: '#AAAAAA' }}>
                        {contacts.length > 5 ? `Mostrando primeiros 5` : ''}
                      </p>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: '1px solid #F0F0F0' }}>
                          <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase" style={{ color: '#AAAAAA' }}>Nome</th>
                          <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase" style={{ color: '#AAAAAA' }}>Telefone</th>
                          <th className="text-left px-4 py-2 text-[10px] font-semibold uppercase" style={{ color: '#AAAAAA' }}>E-mail</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.slice(0, 5).map((c, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #F5F5F5' }}>
                            <td className="px-4 py-2.5 text-sm" style={{ color: '#1A1A18' }}>{c.name}</td>
                            <td className="px-4 py-2.5 text-sm" style={{ color: '#888888' }}>{c.phone || '—'}</td>
                            <td className="px-4 py-2.5 text-sm" style={{ color: '#888888' }}>{c.email || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {error && <p className="text-sm mb-3" style={{ color: '#DC2626' }}>{error}</p>}

                  <div className="flex gap-3">
                    <button
                      onClick={handleImport}
                      disabled={loading}
                      className="h-9 px-5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 hover:opacity-80"
                      style={{ backgroundColor: '#1A1A18', color: '#FFFFFF' }}
                    >
                      {loading ? 'Importando...' : `Importar ${contacts.length} contatos`}
                    </button>
                    <button
                      onClick={reset}
                      className="h-9 px-4 rounded-lg text-sm transition-all hover:bg-[#F1F1F3]"
                      style={{ color: '#AAAAAA', border: '1px solid #E5E5E8' }}
                    >
                      Trocar arquivo
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
