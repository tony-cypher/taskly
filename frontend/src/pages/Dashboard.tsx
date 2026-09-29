import { Check, Clock, Plus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Card, CardTitle, EmptyState, ProgressBar } from '../components/ui'
import TaskModal from '../components/TaskModal'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

const fmt = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
      ' · ' +
      new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
    : '—'

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })

const fmtRange = (iso: string) => {
  const start = new Date(iso)
  const end = new Date(start.getTime() + 30 * 60 * 1000)
  return `${fmtTime(iso)} - ${end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })}`
}

export default function Dashboard() {
  const { user } = useAuth()
  const { tasks, events, notifications, unread, stats, toggleTask, rsvpEvent } = useData()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)

  const active = tasks.filter((t) => !t.completed)
  const todayTasks = useMemo(
    () => active.filter((t) => t.due_at && new Date(t.due_at).toDateString() === new Date().toDateString()),
    [active],
  )
  const listForToday = todayTasks.length > 0 ? todayTasks : active.slice(0, 4)

  const todayEvents = useMemo(
    () => events.filter((e) => new Date(e.starts_at).toDateString() === new Date().toDateString()),
    [events],
  )
  const eventsPreview = todayEvents.length > 0 ? todayEvents : events.slice(0, 3)

  const nextPending = useMemo(
    () => events.find((e) => new Date(e.starts_at) >= new Date() && e.status === 'pending'),
    [events],
  )

  const notificationsPreview = useMemo(() => {
    const unreadOnes = notifications.filter((n) => !n.read)
    return (unreadOnes.length > 0 ? unreadOnes : notifications).slice(0, 2)
  }, [notifications])

  const weekDays = useMemo(() => {
    const now = new Date()
    const offset = (now.getDay() + 6) % 7
    const monday = new Date(now)
    monday.setDate(now.getDate() - offset)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return {
        key: `${d.toDateString()}-${i}`,
        label: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'][i],
        num: d.getDate(),
        isToday: d.toDateString() === now.toDateString(),
        count: events.filter((e) => new Date(e.starts_at).toDateString() === d.toDateString()).length,
      }
    })
  }, [events])

  const onboardSteps = [
    { icon: Check, label: 'Stay organized', hint: 'Keep tasks and notes together' },
    { icon: Clock, label: 'Sync your notes', hint: 'Access them anywhere' },
    { icon: Users, label: 'Collaborate and share', hint: 'Work better as a team' },
  ]

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Hero */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hi, {user?.name}!
          </h1>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-brand-600 dark:text-brand-300">
            What are your plans for today?
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            The platform is designed to revolutionize the way you organize and access your tasks.
          </p>
          {user?.is_guest && (
            <Badge tone="amber" className="mt-4">Guest session — sample data, stored per device</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 content-start gap-4">
          <button
            className="flex items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white/50 text-brand-600 transition hover:border-brand-400 hover:bg-brand-50 dark:border-white/15 dark:bg-white/5 dark:hover:bg-brand-500/10"
            onClick={() => setModalOpen(true)}
            title="New task"
          >
            <Plus size={22} />
          </button>
          {onboardSteps.map((s) => (
            <div key={s.label} className="rounded-3xl border border-slate-200/70 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-[#151627]">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                <s.icon size={22} />
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-700 dark:text-slate-200">{s.label}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{s.hint}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Row 1: Notifications | Assignments | Calendar */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardTitle>
            Notifications
          </CardTitle>
          <div className="space-y-3">
            {notificationsPreview.length === 0 && <EmptyState title="You're all caught up 🎉" />}
            {notificationsPreview.map((n) => (
              <div key={n.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-white/5 dark:bg-white/5">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{n.title}</p>
                {n.body && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{n.body}</p>}
                <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  {n.scheduled_at
                    ? `${new Date(n.scheduled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${fmtTime(n.scheduled_at)}`
                    : ''}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>
            Assignments
          </CardTitle>
          <div className="space-y-3">
            {active.length === 0 && <EmptyState title="No active assignments" />}
            {active.slice(0, 1).map((a) => (
              <div key={a.id}>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand-600 dark:text-brand-300">{a.category ?? 'General'}</span>
                  {a.tag && <Badge tone="violet">{a.tag}</Badge>}
                </div>
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{a.title}</p>
                  <Badge tone={a.priority === 'high' ? 'red' : a.priority === 'medium' ? 'amber' : 'slate'}>
                    {a.priority.charAt(0).toUpperCase() + a.priority.slice(1)}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge tone="green">Pending review</Badge>
                  <span className="text-[11px] text-slate-400">
                    {a.due_at ? `Due ${fmtTime(a.due_at)}` : 'No due date'}
                  </span>
                  <button
                    onClick={() => toggleTask(a.id)}
                    className="rounded-full border border-slate-200 p-1.5 text-slate-400 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-white/10"
                    title="Mark done"
                  >
                    <Check size={13} />
                  </button>
                </div>
              </div>
            ))}
            <Button variant="secondary" className="w-full" onClick={() => setModalOpen(true)}>
              <Plus size={15} /> Add new assignment
            </Button>
          </div>
        </Card>

        <Card>
          <CardTitle>
            {new Date().toLocaleDateString(undefined, { month: 'long' })} {new Date().getFullYear()}
          </CardTitle>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
              <span key={d} className="pb-1 text-[10px] font-semibold text-slate-400">{d}</span>
            ))}
            {weekDays.map((d) => (
              <div key={d.key} className="flex flex-col items-center gap-0.5">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium ${
                    d.isToday ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {d.num}
                </span>
                {d.count > 0 && <span className="h-1 w-1 rounded-full bg-brand-400" />}
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4 dark:border-white/5">
            {eventsPreview.slice(0, 2).map((e) => (
              <div key={e.id}>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{fmtRange(e.starts_at)}</p>
                <div className="mt-1 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{e.title}</p>
                    <p className="text-[10px] text-slate-400">{e.location ?? e.category ?? ''}</p>
                  </div>
                  <Badge tone={e.status === 'accepted' ? 'green' : e.status === 'declined' ? 'red' : 'amber'}>
                    {e.status}
                  </Badge>
                </div>
              </div>
            ))}
            {eventsPreview.length === 0 && <EmptyState title="No events today" />}
          </div>
        </Card>
      </section>

      {/* Row 2: Today tasks | Progress | Board meeting */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardTitle>Today tasks</CardTitle>
          <div className="space-y-2.5">
            {listForToday.length === 0 && <EmptyState title="Nothing due today 🎉" hint="Enjoy the calm." />}
            {listForToday.slice(0, 4).map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 dark:border-white/5">
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
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{fmt(t.due_at)}</span>
                    <ProgressBar value={t.progress} className="max-w-20" />
                    <span className="text-[10px] text-slate-400">{t.progress}%</span>
                    {t.due_at && new Date(t.due_at) < new Date() && !t.completed && <Badge tone="red">Overdue</Badge>}
                    {t.tag && <Badge tone="slate">{t.tag}</Badge>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="mt-3 w-full" onClick={() => navigate('/tasks')}>
            View all tasks
          </Button>
        </Card>

        <Card className="flex flex-col justify-between bg-gradient-to-br from-brand-600 to-brand-800 !border-brand-700/40 dark:!border-brand-500/30">
          <div>
            <CardTitle>
              <span className="text-white">Progress</span>
            </CardTitle>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-3.5">
                <p className="text-2xl font-bold">{stats?.completion_rate ?? 0}%</p>
                <p className="mt-0.5 text-[11px] text-white/70">Tasks completed</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3.5">
                <p className="text-2xl font-bold">{stats?.active ?? 0}</p>
                <p className="mt-0.5 text-[11px] text-white/70">Active tasks</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3.5">
                <p className="text-2xl font-bold">{stats?.today_due ?? 0}</p>
                <p className="mt-0.5 text-[11px] text-white/70">Due today</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3.5">
                <p className="text-2xl font-bold">{stats?.overdue ?? 0}</p>
                <p className="mt-0.5 text-[11px] text-white/70">Overdue</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" className="mt-4 w-full !text-white hover:bg-white/10" onClick={() => navigate('/tasks')}>
            Manage tasks
          </Button>
        </Card>

        <Card>
          <CardTitle>Board meeting</CardTitle>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{nextPending?.title ?? 'No pending invites'}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {nextPending ? fmt(nextPending.starts_at) : 'Nothing needs a reply'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="flex-1 border border-slate-200 dark:border-white/10" onClick={() => navigate('/calendar')}>
                Reschedule
              </Button>
              <Button
                size="sm"
                variant="success"
                className="flex-1"
                disabled={!nextPending}
                onClick={() => nextPending && rsvpEvent(nextPending.id, 'accepted')}
              >
                Accept invite
              </Button>
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 dark:bg-white/5">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Stay on track</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              {stats?.active ?? 0} active tasks · {stats?.today_due ?? 0} due today · {unread} unread notifications
            </p>
          </div>
        </Card>
      </section>

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
