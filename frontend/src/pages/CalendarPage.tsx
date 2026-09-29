import { ChevronLeft, ChevronRight, Clock, MapPin, Plus, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, Button, Card, EmptyState, Field, Input, Modal, Select } from '../components/ui'
import { useData } from '../context/DataContext'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function startOfMonthGrid(base: Date): Date[] {
  const first = new Date(base.getFullYear(), base.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7
  const start = new Date(first)
  start.setDate(first.getDate() - offset)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true })

export default function CalendarPage() {
  const { events, addEvent, deleteEvent, rsvpEvent } = useData()
  const [month, setMonth] = useState(new Date())
  const [selected, setSelected] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ title: '', time: '10:00', location: '', category: 'Design' })

  const grid = useMemo(() => startOfMonthGrid(month), [month])

  const dayEvents = (d: Date) =>
    events
      .filter((e) => new Date(e.starts_at).toDateString() === d.toDateString())
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at))

  const selectedEvents = dayEvents(selected)

  const submit = async () => {
    if (form.title.trim() === '') return
    const [h, m] = form.time.split(':').map(Number)
    const starts = new Date(selected)
    starts.setHours(h, m, 0, 0)
    await addEvent({
      title: form.title.trim(),
      location: form.location || null,
      category: form.category || null,
      starts_at: starts.toISOString(),
      ends_at: new Date(starts.getTime() + 30 * 60 * 1000).toISOString(),
      status: 'pending',
    })
    setForm({ title: '', time: '10:00', location: '', category: 'Design' })
    setModalOpen(false)
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calendar</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Plan events and answer invites.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New event
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Card className="!p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">
              {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-white/10">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => { setMonth(new Date()); setSelected(new Date()) }} className="rounded-lg px-2.5 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10 dark:text-brand-300">
                Today
              </button>
              <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-white/10">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {DAY_LABELS.map((d) => (
              <div key={d} className="pb-1 text-center text-[10px] font-semibold uppercase text-slate-400">{d}</div>
            ))}
            {grid.map((d) => {
              const inMonth = d.getMonth() === month.getMonth()
              const isToday = d.toDateString() === new Date().toDateString()
              const isSelected = d.toDateString() === selected.toDateString()
              const evts = dayEvents(d)
              return (
                <button
                  key={d.toISOString()}
                  onClick={() => setSelected(d)}
                  className={`flex min-h-16 flex-col items-start gap-1 rounded-xl border p-1.5 text-left transition ${
                    isSelected
                      ? 'border-brand-400 bg-brand-50 dark:bg-brand-500/15'
                      : 'border-slate-100 hover:border-brand-200 dark:border-white/5 dark:hover:border-brand-500/30'
                  } ${!inMonth ? 'opacity-35' : ''}`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
                    isToday ? 'bg-brand-600 text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}>
                    {d.getDate()}
                  </span>
                  {evts.slice(0, 2).map((e) => (
                    <span
                      key={e.id}
                      className={`w-full truncate rounded px-1 py-0.5 text-[9px] font-medium ${
                        e.status === 'declined'
                          ? 'bg-slate-100 text-slate-400 line-through dark:bg-white/10'
                          : 'bg-brand-100 text-brand-700 dark:bg-brand-500/25 dark:text-brand-200'
                      }`}
                    >
                      {e.title}
                    </span>
                  ))}
                  {evts.length > 2 && <span className="px-1 text-[9px] text-slate-400">+{evts.length - 2} more</span>}
                </button>
              )
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">
            {selected.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          <p className="text-xs text-slate-400">Click a day to view its events</p>
          <div className="mt-4 space-y-3">
            {selectedEvents.length === 0 && <EmptyState icon={<Clock size={24} />} title="No events this day" />}
            {selectedEvents.map((e) => (
              <div key={e.id} className="rounded-2xl border border-slate-100 p-3.5 dark:border-white/5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">{e.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock size={11} /> {fmtTime(e.starts_at)}
                      {e.location && (<><MapPin size={11} className="ml-1.5" /> {e.location}</>)}
                    </p>
                  </div>
                  <button onClick={() => deleteEvent(e.id)} className="rounded-lg p-1 text-slate-300 hover:text-rose-500">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <Badge tone={e.status === 'accepted' ? 'green' : e.status === 'declined' ? 'red' : 'amber'}>
                    {e.status === 'pending' ? 'Awaiting reply' : e.status}
                  </Badge>
                  {e.status === 'pending' && (
                    <div className="flex gap-1.5">
                      <button onClick={() => rsvpEvent(e.id, 'declined')} className="flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
                        <X size={11} /> Decline
                      </button>
                      <button onClick={() => rsvpEvent(e.id, 'accepted')} className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-600">
                        Accept
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`New event · ${selected.toLocaleDateString()}`}>
        <div className="space-y-4">
          <Field label="Title">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event name" autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Time">
              <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </Field>
            <Field label="Category">
              <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option>Design</option>
                <option>Client</option>
                <option>Planning</option>
                <option>Personal</option>
              </Select>
            </Field>
          </div>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Zoom, Office..." />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={form.title.trim() === ''}>Create event</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
