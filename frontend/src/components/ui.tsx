import { X } from 'lucide-react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#151627] ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-[15px] font-semibold text-slate-900 dark:text-white">{children}</h3>
      {right}
    </div>
  )
}

const badgeTones = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  red: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
}

export function Badge({ tone = 'slate', children, className = '' }: { tone?: keyof typeof badgeTones; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${badgeTones[tone]} ${className}`}>
      {children}
    </span>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/30',
    secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/15 dark:text-brand-300 dark:hover:bg-brand-500/25',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
    success: 'bg-emerald-500 text-white hover:bg-emerald-600',
  }
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-sm',
    lg: 'h-11 px-6 text-sm',
  }
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-300">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-brand-500/20'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ''}`} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} ${props.className ?? ''}`} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ''}`} />
}

export function Modal({ open, onClose, title, children, wide = false }: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#151627]`}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10 ${className}`}>
      <div
        className="h-full rounded-full bg-brand-500 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function EmptyState({ icon, title, hint }: { icon?: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      {icon && <div className="text-slate-300 dark:text-slate-600">{icon}</div>}
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      {hint && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  )
}
