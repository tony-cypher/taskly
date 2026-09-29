import { Download, Moon, Sun, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, CardTitle, Field, Input } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { api } from '../lib/api'

export default function Settings() {
  const { user, updateUser } = useAuth()
  const { theme, set } = useTheme()
  const [name, setName] = useState(user?.name ?? '')
  const [saved, setSaved] = useState(false)

  const save = async () => {
    await api.put('/profile', { name })
    updateUser({ name })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

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
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Profile, appearance and your data.</p>
      </div>

      <Card>
        <CardTitle>Profile</CardTitle>
        {user?.is_guest && (
          <div className="mb-4 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            You're in guest mode. Data lives only in this session's workspace on the server — sign up to keep it under your own account.
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
            {user?.avatar ?? <UserRound size={22} />}
          </div>
          <div className="flex-1">
            <Field label="Display name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={save} disabled={name.trim() === ''}>Save changes</Button>
          {saved && <span className="text-xs font-medium text-emerald-600">Saved ✓</span>}
          <span className="ml-auto text-xs text-slate-400">{user?.email}</span>
        </div>
      </Card>

      <Card>
        <CardTitle>Appearance</CardTitle>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => set('light')}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-5 transition ${
              theme === 'light' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 hover:border-slate-300 dark:border-white/10'
            }`}
          >
            <Sun size={22} className="text-amber-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Light</span>
          </button>
          <button
            onClick={() => set('dark')}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-5 transition ${
              theme === 'dark' ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-slate-200 hover:border-slate-300 dark:border-white/10'
            }`}
          >
            <Moon size={22} className="text-indigo-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Dark</span>
          </button>
        </div>
      </Card>

      <Card>
        <CardTitle>Data</CardTitle>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Export your data</p>
            <p className="text-xs text-slate-400">Download all tasks as a CSV file.</p>
          </div>
          <Button variant="secondary" onClick={exportCsv}>
            <Download size={15} /> Export CSV
          </Button>
        </div>
      </Card>

      <p className="pb-4 text-center text-[11px] text-slate-400">
        Taskly · React + Laravel · {user?.is_guest ? 'Guest session' : 'Signed in'}
      </p>
    </div>
  )
}
