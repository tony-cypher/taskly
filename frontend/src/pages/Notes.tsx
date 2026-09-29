import { Loader2, Pencil, Pin, Plus, Search, StickyNote, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Badge, Button, Card, EmptyState, Field, Input, Modal, Select, Textarea } from '../components/ui'
import { useData } from '../context/DataContext'
import type { Note } from '../lib/api'

const COLORS: { key: string; label: string; swatch: string; card: string }[] = [
  { key: 'violet', label: 'Violet', swatch: 'bg-violet-400', card: 'border-t-4 border-t-violet-400' },
  { key: 'amber', label: 'Amber', swatch: 'bg-amber-400', card: 'border-t-4 border-t-amber-400' },
  { key: 'green', label: 'Green', swatch: 'bg-emerald-400', card: 'border-t-4 border-t-emerald-400' },
  { key: 'sky', label: 'Sky', swatch: 'bg-sky-400', card: 'border-t-4 border-t-sky-400' },
  { key: 'rose', label: 'Rose', swatch: 'bg-rose-400', card: 'border-t-4 border-t-rose-400' },
  { key: 'slate', label: 'Slate', swatch: 'bg-slate-400', card: 'border-t-4 border-t-slate-400' },
]

const cardAccent = (color: string) => COLORS.find((c) => c.key === color)?.card ?? COLORS[0].card

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''

export default function Notes() {
  const { notes, addNote, updateNote, pinNote, deleteNote } = useData()
  const [q, setQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [color, setColor] = useState('violet')
  const [pinned, setPinned] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!modalOpen) return
    setTitle(editing?.title ?? '')
    setBody(editing?.body ?? '')
    setColor(editing?.color ?? 'violet')
    setPinned(editing?.pinned ?? false)
  }, [modalOpen, editing])

  const openNew = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (note: Note) => {
    setEditing(note)
    setModalOpen(true)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (title.trim() === '') return
    setSaving(true)
    const payload = { title: title.trim(), body: body.trim() || null, color, pinned }
    try {
      if (editing) {
        await updateNote(editing.id, payload)
      } else {
        await addNote(payload)
      }
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const filtered = notes.filter((n) =>
    q === '' || `${n.title} ${n.body ?? ''}`.toLowerCase().includes(q.toLowerCase()),
  )
  const pinnedNotes = filtered.filter((n) => n.pinned)
  const others = filtered.filter((n) => !n.pinned)

  const renderCard = (n: Note) => (
    <div
      key={n.id}
      className={`group relative flex flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-[#151627] ${cardAccent(n.color)}`}
    >
      <div className="flex items-start justify-between gap-2">
        <button onClick={() => openEdit(n)} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{n.title}</p>
        </button>
        <button
          onClick={() => pinNote(n.id)}
          className={`rounded-lg p-1.5 transition ${
            n.pinned
              ? 'text-brand-600 dark:text-brand-300'
              : 'text-slate-300 opacity-0 hover:text-brand-500 group-hover:opacity-100 dark:text-slate-600'
          }`}
          title={n.pinned ? 'Unpin note' : 'Pin note'}
        >
          <Pin size={14} fill={n.pinned ? 'currentColor' : 'none'} />
        </button>
      </div>
      <button onClick={() => openEdit(n)} className="mt-1 flex-1 text-left">
        <p className="line-clamp-5 whitespace-pre-line text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {n.body || 'Empty note'}
        </p>
      </button>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-white/5">
        <span className="text-[10px] text-slate-400">Edited {fmtDate(n.updated_at)}</span>
        <div className="flex gap-0.5 opacity-0 transition group-hover:opacity-100">
          <button onClick={() => openEdit(n)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10" title="Edit">
            <Pencil size={13} />
          </button>
          <button onClick={() => deleteNote(n.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10" title="Delete">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} · {pinnedNotes.length} pinned
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus size={16} /> New note
        </Button>
      </div>

      <Card className="!p-4">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notes..." className="!pl-10" />
        </div>
      </Card>

      {filtered.length === 0 && (
        <Card>
          <EmptyState
            icon={<StickyNote size={28} />}
            title={q === '' ? 'No notes yet' : 'No notes match your search'}
            hint={q === '' ? 'Capture your first idea with “New note”.' : 'Try a different keyword.'}
          />
        </Card>
      )}

      {pinnedNotes.length > 0 && (
        <section>
          <div className="mb-2.5 flex items-center gap-2">
            <Pin size={13} className="text-brand-500" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Pinned</h2>
            <Badge tone="brand">{pinnedNotes.length}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pinnedNotes.map(renderCard)}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section>
          {pinnedNotes.length > 0 && (
            <div className="mb-2.5 flex items-center gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Others</h2>
              <Badge tone="slate">{others.length}</Badge>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {others.map(renderCard)}
          </div>
        </section>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit note' : 'New note'}>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" required autoFocus />
          </Field>
          <Field label="Content">
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write anything..." rows={7} />
          </Field>
          <div className="grid grid-cols-2 items-end gap-3">
            <Field label="Color">
              <Select value={color} onChange={(e) => setColor(e.target.value)}>
                {COLORS.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </Select>
            </Field>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-brand-600"
              />
              Pin to top
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setColor(c.key)}
                className={`h-6 w-6 rounded-full ${c.swatch} transition ${color === c.key ? 'ring-2 ring-slate-900 ring-offset-2 dark:ring-white dark:ring-offset-[#151627]' : 'opacity-60 hover:opacity-100'}`}
                title={c.label}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || title.trim() === ''}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? 'Save changes' : 'Create note'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
