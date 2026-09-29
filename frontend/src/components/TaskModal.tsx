import { Loader2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useData } from '../context/DataContext'
import type { Task, TaskPayload } from '../lib/api'
import { Button, Field, Input, Modal, Select, Textarea } from './ui'

interface Props {
  open: boolean
  onClose: () => void
  task?: Task | null
}

export default function TaskModal({ open, onClose, task }: Props) {
  const { boards, addTask, updateTask } = useData()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [category, setCategory] = useState('')
  const [tag, setTag] = useState('')
  const [progress, setProgress] = useState(0)
  const [dueAt, setDueAt] = useState('')
  const [boardId, setBoardId] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setPriority(task?.priority ?? 'medium')
    setCategory(task?.category ?? '')
    setTag(task?.tag ?? '')
    setProgress(task?.progress ?? 0)
    setDueAt(task?.due_at ? task.due_at.slice(0, 16) : '')
    setBoardId(task?.board?.id ? String(task.board.id) : '')
  }, [open, task])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload: TaskPayload = {
      title,
      description: description || null,
      priority: priority as 'low' | 'medium' | 'high',
      category: category || null,
      tag: tag || null,
      progress: Number(progress),
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      board_id: boardId ? Number(boardId) : null,
    }
    try {
      if (task) {
        await updateTask(task.id, payload)
      } else {
        await addTask(payload)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit task' : 'New task'}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" required autoFocus />
        </Field>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details" rows={2} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority">
            <Select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </Field>
          <Field label="Board">
            <Select value={boardId} onChange={(e) => setBoardId(e.target.value)}>
              <option value="">No board</option>
              {boards.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Category">
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Design" />
          </Field>
          <Field label="Tag">
            <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. Logo" />
          </Field>
          <Field label="Due date & time">
            <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </Field>
          <Field label={`Progress: ${progress}%`}>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="mt-2.5 w-full accent-brand-600"
            />
          </Field>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving || title.trim() === ''}>
            {saving && <Loader2 size={14} className="animate-spin" />}
            {task ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
