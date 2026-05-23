'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, KanbanSquare, Bell, FolderOpen, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/contatos', label: 'Contatos', icon: Users },
  { href: '/pipeline', label: 'Pipeline', icon: KanbanSquare },
  { href: '/followups', label: 'Follow-ups', icon: Bell },
  { href: '/projetos', label: 'Projetos', icon: FolderOpen },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className="w-56 min-h-screen flex flex-col"
      style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E5E8' }}
    >
      <div className="px-5 py-5" style={{ borderBottom: '1px solid #E5E5E8' }}>
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-1" style={{ color: '#AAAAAA' }}>
          Studio Solise
        </p>
        <p className="text-sm font-semibold tracking-tight" style={{ color: '#1A1A18' }}>CRM</p>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150',
                active ? 'font-medium' : 'hover:bg-black/[0.04]'
              )}
              style={active ? {
                backgroundColor: '#F1F1F3',
                color: '#1A1A18',
              } : { color: '#999999' }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r"
                  style={{ backgroundColor: '#1A1A18' }}
                />
              )}
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-2 py-3" style={{ borderTop: '1px solid #E5E5E8' }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all w-full hover:bg-black/[0.04]"
          style={{ color: '#CCCCCC' }}
        >
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </aside>
  )
}
