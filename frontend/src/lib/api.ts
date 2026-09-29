import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { Accept: 'application/json' },
})

const TOKEN_KEY = 'taskly_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
  api.defaults.headers.common.Authorization = token ? `Bearer ${token}` : ''
}

const stored = getToken()
if (stored) {
  api.defaults.headers.common.Authorization = `Bearer ${stored}`
}

export interface User {
  id: number
  name: string
  email: string
  avatar: string | null
  is_guest: boolean
  onboarded: boolean
  theme: 'light' | 'dark'
}

export interface Board {
  id: number
  name: string
  color: string
  position: number
  tasks_count?: number
}

export interface Task {
  id: number
  title: string
  description: string | null
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: string | null
  tag: string | null
  progress: number
  due_at: string | null
  remind_at: string | null
  position: number
  board?: { id: number; name: string; color: string } | null
}

// Payload sent to the API: uses board_id (the Task response nests a board object).
export type TaskPayload = Omit<Partial<Task>, 'board'> & { board_id?: number | null }

export interface EventItem {
  id: number
  title: string
  description: string | null
  location: string | null
  category: string | null
  starts_at: string
  ends_at: string | null
  status: 'pending' | 'accepted' | 'declined'
}

export interface AppNotification {
  id: number
  type: 'event' | 'message' | 'reminder' | 'assignment'
  title: string
  body: string | null
  scheduled_at: string | null
  read: boolean
}

export interface Note {
  id: number
  title: string
  body: string | null
  color: string
  pinned: boolean
  created_at: string | null
  updated_at: string | null
}

export interface Stats {
  total: number
  completed: number
  active: number
  today_due: number
  overdue: number
  completion_rate: number
}
