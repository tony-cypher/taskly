import {
  Bell, CalendarDays, CheckCircle2, Download, Grid3X3, LayoutList, ListChecks,
  LogOut, Moon, Search, Settings, StickyNote, Sun, UserRound,
} from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { api } from '../lib/api'
import { Badge } from './ui'

const NAV = [
  { to: '/', label: 'Dashboard', icon: Grid3X3 },
  { to: '/tasks', label: 'My tasks', icon: ListChecks },
  { to: '/boards', label: 'Boards', icon: LayoutList },
  { to: '/notes', label: 'Notes', icon: StickyNote },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const { unread, notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useData()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [results, setResults] = useState<{ tasks: { id: number; title: string }[]; events: { id: number; title: string }[]; notes?: { id: number; title: string }[] } | null>(null)
  const [showNotifs, setShowNotifs] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (q.trim() === '') {
      setResults(null)
      return
    }
    const t = setTimeout(() => {
      api.get('/search', { params: { q } }).then((r) => setResults(r.data)).catch(() => undefined)
    }, 250)
    return () => clearTimeout(t)
  }, [q])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setResults(null)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const exportCsv = () => {
    api.get('/export', { responseType: 'blob' }).then((res) => {
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'todo-export.csv'
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-20 flex-col items-center justify-between py-6 md:flex">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-[3px]">
            <div className="rounded-[14px] bg-[#eef0f8] p-3 dark:bg-[#0c0d16]">
              <Grid3X3 size={22} className="text-brand-600 dark:text-brand-300" />
            </div>
          </div>
        </div>
        <nav className="flex flex-col items-center gap-2">
          {NAV.map((item) => (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className={`group relative rounded-2xl p-3 transition-colors ${
                location.pathname === item.to
                  ? 'bg-white text-brand-600 shadow-md dark:bg-white/10 dark:text-brand-300'
                  : 'text-slate-400 hover:bg-white/70 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-200'
              }`}
              title={item.label}
            >
              <item.icon size={20} />
              <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs text-white group-hover:block">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={toggle}
            className="rounded-2xl p-3 text-slate-400 transition-colors hover:bg-white/70 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-200"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            onClick={exportCsv}
            className="rounded-2xl p-3 text-slate-400 transition-colors hover:bg-white/70 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-slate-200"
            title="Export data"
          >
            <Download size={20} />
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 flex items-center gap-3 bg-[#eef0f8]/80 px-4 py-4 backdrop-blur md:px-8 dark:bg-[#0c0d16]/80">
          <div className="relative flex-1 max-w-md" ref={boxRef}>
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search or type command"
              className="h-10 w-full rounded-full border border-slate-200/80 bg-white/80 pl-10 pr-4 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-brand-500/20"
            />
            {results && (results.tasks.length > 0 || results.events.length > 0 || (results.notes?.length ?? 0) > 0) && (
              <div className="absolute left-0 right-0 top-12 max-h-80 overflow-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#151627]">
                {results.tasks.map((t) => (
                  <button
                    key={`t-${t.id}`}
                    onClick={() => { navigate('/tasks'); setQ(''); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <CheckCircle2 size={15} className="text-brand-500" /> {t.title}
                  </button>
                ))}
                {results.events.map((e) => (
                  <button
                    key={`e-${e.id}`}
                    onClick={() => { navigate('/calendar'); setQ(''); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <CalendarDays size={15} className="text-brand-500" /> {e.title}
                  </button>
                ))}
                {(results.notes ?? []).map((n) => (
                  <button
                    key={`n-${n.id}`}
                    onClick={() => { navigate('/notes'); setQ(''); }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <StickyNote size={15} className="text-brand-500" /> {n.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={toggle}
              className="flex h-10 items-center gap-1 rounded-full border border-slate-200/80 bg-white/70 p-1 dark:border-white/10 dark:bg-white/5"
              title="Toggle light/dark"
            >
              <span className={`flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium ${theme === 'light' ? 'bg-brand-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                <Sun size={13} /> Light
              </span>
              <span className={`flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium ${theme === 'dark' ? 'bg-brand-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                <Moon size={13} /> Dark
              </span>
            </button>

            <button
              onClick={exportCsv}
              className="hidden h-10 items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 text-xs font-medium text-slate-600 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:flex"
            >
              <Download size={14} /> Export data
            </button>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs((s) => !s)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-500 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                <Bell size={16} />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white">
                    {unread}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#151627]">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-xs font-semibold text-slate-500">Notifications</span>
                    <div className="flex gap-1">
                      <button onClick={markAllNotificationsRead} className="text-[11px] text-brand-600 hover:underline dark:text-brand-300">Mark all read</button>
                      <button onClick={clearNotifications} className="text-[11px] text-slate-400 hover:underline">Clear</button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-auto">
                    {notifications.length === 0 && <p className="px-3 py-6 text-center text-xs text-slate-400">You're all caught up 🎉</p>}
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-white/5 ${n.read ? 'opacity-60' : ''}`}
                      >
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{n.title}</span>
                        {n.body && <span className="text-[11px] text-slate-500 dark:text-slate-400">{n.body}</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={userRef}>
              <button
                onClick={() => setShowUser((s) => !s)}
                className="flex h-10 items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 pl-1.5 pr-3 dark:border-white/10 dark:bg-white/5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
                  {user?.avatar ?? 'U'}
                </span>
                <span className="hidden max-w-28 truncate text-xs font-medium text-slate-600 dark:text-slate-300 sm:block">
                  {user?.name}
                </span>
              </button>
              {showUser && (
                <div className="absolute right-0 top-12 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-[#151627]">
                  <div className="border-b border-slate-100 px-3 pb-2 pt-1 dark:border-white/10">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                    <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
                    {user?.is_guest && <Badge tone="amber" className="mt-1.5">Guest session</Badge>}
                  </div>
                  <button onClick={() => { setShowUser(false); navigate('/settings') }} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5">
                    <UserRound size={15} /> Profile settings
                  </button>
                  <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                    <LogOut size={15} /> {user?.is_guest ? 'End guest session' : 'Sign out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pb-10 md:px-8">{children}</main>
      </div>
    </div>
  )
}
