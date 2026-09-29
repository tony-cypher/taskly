import { Check, ListChecks, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Button, Card, EmptyState, Input, Select } from '../components/ui'
import TaskModal from '../components/TaskModal'
import { useData } from '../context/DataContext'
import type { Task } from '../lib/api'

const fmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

export default function Tasks() {
  const { tasks, boards, toggleTask, deleteTask } = useData()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [boardFilter, setBoardFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (q && !`${t.title} ${t.description ?? ''}`.toLowerCase().includes(q.toLowerCase())) return false
      if (status === 'active' && t.completed) return false
      if (status === 'completed' && !t.completed) return false
      if (status === 'overdue' && (t.completed || !t.due_at || new Date(t.due_at) >= new Date())) return false
      if (boardFilter !== 'all' && String(t.board?.id ?? '') !== boardFilter) return false
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
      return true
    })
  }, [tasks, q, status, boardFilter, priorityFilter])

  const openEdit = (t: Task) => {
    setEditing(t)
    setModalOpen(true)
  }

  const priorityTone = (p: string) => (p === 'high' ? 'red' : p === 'medium' ? 'amber' : 'slate')

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My tasks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {tasks.filter((t) => !t.completed).length} active · {tasks.filter((t) => t.completed).length} completed
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true) }}>
          <Plus size={16} /> New task
        </Button>
      </div>

      <Card className="!p-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-52 flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter tasks..." className="!pl-10" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="!w-auto">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </Select>
          <Select value={boardFilter} onChange={(e) => setBoardFilter(e.target.value)} className="!w-auto">
            <option value="all">All boards</option>
            {boards.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
          <Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="!w-auto">
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
      </Card>

      <Card className="!p-3">
        {filtered.length === 0 && <EmptyState icon={<ListChecks size={28} />} title="No tasks match your filters" hint="Try clearing the search or filters." />}
        <div className="space-y-1">
          {filtered.map((t) => (
            <div key={t.id} className="group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition hover:bg-slate-50 dark:hover:bg-white/5">
              <button
                onClick={() => toggleTask(t.id)}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                  t.completed ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 hover:border-brand-500 dark:border-white/20'
                }`}
              >
                {t.completed && <Check size={12} strokeWidth={3} />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm font-medium ${t.completed ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white'}`}>
                  {t.title}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2">
                  {t.board && <Badge tone="brand">{t.board.name}</Badge>}
                  {t.category && <span className="text-[11px] text-brand-600 dark:text-brand-300">{t.category}</span>}
                  {t.tag && <Badge tone="violet">{t.tag}</Badge>}
                  <Badge tone={priorityTone(t.priority)}>{t.priority}</Badge>
                  <span className="text-[11px] text-slate-400">{fmt(t.due_at)}</span>
                  {t.due_at && new Date(t.due_at) < new Date() && !t.completed && <Badge tone="red">Overdue</Badge>}
                </div>
                {t.description && <p className="mt-1 line-clamp-1 text-xs text-slate-400">{t.description}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                <button onClick={() => openEdit(t)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10" title="Edit">
                  <Pencil size={15} />
                </button>
                <button onClick={() => deleteTask(t.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" title="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <TaskModal open={modalOpen} task={editing} onClose={() => { setModalOpen(false); setEditing(null) }} />
    </div>
  )
}
