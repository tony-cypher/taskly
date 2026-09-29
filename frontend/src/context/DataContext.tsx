import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, type AppNotification, type Board, type EventItem, type Note, type Stats, type Task, type TaskPayload } from '../lib/api'
import { useAuth } from './AuthContext'

interface DataContextValue {
  tasks: Task[]
  boards: Board[]
  events: EventItem[]
  notes: Note[]
  notifications: AppNotification[]
  unread: number
  stats: Stats | null
  loading: boolean
  refresh: () => Promise<void>
  toggleTask: (id: number) => Promise<void>
  addTask: (data: TaskPayload) => Promise<void>
  updateTask: (id: number, data: TaskPayload) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  reorderTasks: (ids: number[]) => Promise<void>
  addBoard: (name: string, color?: string) => Promise<void>
  updateBoard: (id: number, data: Partial<Board>) => Promise<void>
  deleteBoard: (id: number) => Promise<void>
  addEvent: (data: Partial<EventItem>) => Promise<void>
  updateEvent: (id: number, data: Partial<EventItem>) => Promise<void>
  rsvpEvent: (id: number, status: 'accepted' | 'declined') => Promise<void>
  deleteEvent: (id: number) => Promise<void>
  addNote: (data: Partial<Note>) => Promise<void>
  updateNote: (id: number, data: Partial<Note>) => Promise<void>
  pinNote: (id: number) => Promise<void>
  deleteNote: (id: number) => Promise<void>
  markNotificationRead: (id: number) => Promise<void>
  markAllNotificationsRead: () => Promise<void>
  deleteNotification: (id: number) => Promise<void>
  clearNotifications: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [boards, setBoards] = useState<Board[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unread, setUnread] = useState(0)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [t, b, e, nt, n, s] = await Promise.all([
      api.get('/tasks'),
      api.get('/boards'),
      api.get('/events'),
      api.get('/notes'),
      api.get('/notifications'),
      api.get('/stats'),
    ])
    setTasks(t.data.data ?? t.data)
    setBoards(b.data)
    setEvents(e.data)
    setNotes(nt.data.data ?? nt.data)
    setNotifications(n.data.items)
    setUnread(n.data.unread)
    setStats(s.data)
  }, [])

  useEffect(() => {
    if (!user) {
      setTasks([])
      setBoards([])
      setEvents([])
      setNotes([])
      setNotifications([])
      setStats(null)
      setLoading(false)
      return
    }
    setLoading(true)
    refresh()
      .catch(() => undefined)
      .finally(() => setLoading(false))
  }, [user, refresh])

  const toggleTask = useCallback(async (id: number) => {
    const res = await api.patch(`/tasks/${id}/toggle`)
    setTasks((list) => list.map((t) => (t.id === id ? res.data.data : t)))
    refresh().catch(() => undefined)
  }, [refresh])

  const addTask = useCallback(async (data: TaskPayload) => {
    const res = await api.post('/tasks', data)
    setTasks((list) => [...list, res.data.data])
    refresh().catch(() => undefined)
  }, [refresh])

  const updateTask = useCallback(async (id: number, data: TaskPayload) => {
    const res = await api.put(`/tasks/${id}`, data)
    setTasks((list) => list.map((t) => (t.id === id ? res.data.data : t)))
    refresh().catch(() => undefined)
  }, [refresh])

  const deleteTask = useCallback(async (id: number) => {
    await api.delete(`/tasks/${id}`)
    setTasks((list) => list.filter((t) => t.id !== id))
    refresh().catch(() => undefined)
  }, [refresh])

  const reorderTasks = useCallback(async (ids: number[]) => {
    setTasks((list) => {
      const map = new Map(list.map((t) => [t.id, t]))
      return ids.map((id) => map.get(id)!).filter(Boolean)
    })
    await api.post('/tasks/reorder', { ids })
  }, [])

  const addBoard = useCallback(async (name: string, color = 'violet') => {
    const res = await api.post('/boards', { name, color })
    setBoards((list) => [...list, res.data])
    refresh().catch(() => undefined)
  }, [refresh])

  const updateBoard = useCallback(async (id: number, data: Partial<Board>) => {
    const res = await api.put(`/boards/${id}`, data)
    setBoards((list) => list.map((b) => (b.id === id ? { ...b, ...res.data } : b)))
  }, [])

  const deleteBoard = useCallback(async (id: number) => {
    await api.delete(`/boards/${id}`)
    setBoards((list) => list.filter((b) => b.id !== id))
    refresh().catch(() => undefined)
  }, [refresh])

  const addEvent = useCallback(async (data: Partial<EventItem>) => {
    const res = await api.post('/events', data)
    setEvents((list) => [...list, res.data].sort((a, b) => a.starts_at.localeCompare(b.starts_at)))
    refresh().catch(() => undefined)
  }, [refresh])

  const updateEvent = useCallback(async (id: number, data: Partial<EventItem>) => {
    const res = await api.put(`/events/${id}`, data)
    setEvents((list) => list.map((e) => (e.id === id ? res.data : e)))
  }, [])

  const rsvpEvent = useCallback(async (id: number, status: 'accepted' | 'declined') => {
    const res = await api.post(`/events/${id}/rsvp`, { status })
    setEvents((list) => list.map((e) => (e.id === id ? res.data : e)))
  }, [])

  const deleteEvent = useCallback(async (id: number) => {
    await api.delete(`/events/${id}`)
    setEvents((list) => list.filter((e) => e.id !== id))
    refresh().catch(() => undefined)
  }, [refresh])

  const addNote = useCallback(async (data: Partial<Note>) => {
    const res = await api.post('/notes', data)
    setNotes((list) => [res.data.data, ...list])
  }, [])

  const updateNote = useCallback(async (id: number, data: Partial<Note>) => {
    const res = await api.put(`/notes/${id}`, data)
    setNotes((list) => list.map((n) => (n.id === id ? res.data.data : n)))
  }, [])

  const pinNote = useCallback(async (id: number) => {
    const res = await api.patch(`/notes/${id}/pin`)
    setNotes((list) => list.map((n) => (n.id === id ? res.data.data : n)))
  }, [])

  const deleteNote = useCallback(async (id: number) => {
    setNotes((list) => list.filter((n) => n.id !== id))
    await api.delete(`/notes/${id}`)
  }, [])

  const markNotificationRead = useCallback(async (id: number) => {
    setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)))
    await api.post(`/notifications/${id}/read`)
    refresh().catch(() => undefined)
  }, [refresh])

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((list) => list.map((n) => ({ ...n, read: true })))
    await api.post('/notifications/read-all')
    refresh().catch(() => undefined)
  }, [refresh])

  const deleteNotification = useCallback(async (id: number) => {
    setNotifications((list) => list.filter((n) => n.id !== id))
    await api.delete(`/notifications/${id}`)
    refresh().catch(() => undefined)
  }, [refresh])

  const clearNotifications = useCallback(async () => {
    setNotifications([])
    await api.delete('/notifications')
    refresh().catch(() => undefined)
  }, [refresh])

  return (
    <DataContext.Provider
      value={{
        tasks, boards, events, notes, notifications, unread, stats, loading,
        refresh,
        toggleTask, addTask, updateTask, deleteTask, reorderTasks,
        addBoard, updateBoard, deleteBoard,
        addEvent, updateEvent, rsvpEvent, deleteEvent,
        addNote, updateNote, pinNote, deleteNote,
        markNotificationRead, markAllNotificationsRead, deleteNotification, clearNotifications,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
