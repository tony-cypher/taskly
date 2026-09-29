import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, Card, EmptyState, Input, ProgressBar } from '../components/ui'
import TaskModal from '../components/TaskModal'
import { useData } from '../context/DataContext'

export default function Boards() {
  const { tasks, boards, addBoard, updateBoard, deleteBoard, addTask, toggleTask, deleteTask } = useData()
  const [newBoard, setNewBoard] = useState('')
  const [renaming, setRenaming] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [quickAdds, setQuickAdds] = useState<Record<number, string>>({})
  const [modalOpen, setModalOpen] = useState(false)

  const createBoard = async () => {
    if (newBoard.trim() === '') return
    await addBoard(newBoard.trim())
    setNewBoard('')
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Boards</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Group tasks into projects and move through them board by board.</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={newBoard}
          onChange={(e) => setNewBoard(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createBoard()}
          placeholder="New board name..."
          className="max-w-xs"
        />
        <Button onClick={createBoard} disabled={newBoard.trim() === ''}>
          <Plus size={16} /> Add board
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {boards.map((board) => {
          const boardTasks = tasks.filter((t) => t.board?.id === board.id)
          const done = boardTasks.filter((t) => t.completed).length
          return (
            <Card key={board.id} className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                {renaming === board.id ? (
                  <Input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={async () => {
                      if (renameValue.trim() !== '') await updateBoard(board.id, { name: renameValue.trim() })
                      setRenaming(null)
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        if (renameValue.trim() !== '') await updateBoard(board.id, { name: renameValue.trim() })
                        setRenaming(null)
                      }
                    }}
                    className="!py-1.5"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-500" />
                    <h3 className="text-[15px] font-semibold text-slate-800 dark:text-white">{board.name}</h3>
                    <Badge tone="slate">{done}/{boardTasks.length}</Badge>
                  </div>
                )}
                <div className="flex gap-1">
                  <button
                    onClick={() => { setRenaming(board.id); setRenameValue(board.name) }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10"
                    title="Rename board"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteBoard(board.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                    title="Delete board"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <ProgressBar value={boardTasks.length ? Math.round((done / boardTasks.length) * 100) : 0} className="mb-4" />

              <div className="flex-1 space-y-1.5">
                {boardTasks.length === 0 && <EmptyState title="No tasks yet" />}
                {boardTasks.slice(0, 6).map((t) => (
                  <div key={t.id} className="group flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-white/5">
                    <button
                      onClick={() => toggleTask(t.id)}
                      className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border text-[10px] transition ${
                        t.completed ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 hover:border-brand-500 dark:border-white/20'
                      }`}
                    >
                      {t.completed ? '✓' : ''}
                    </button>
                    <span className={`min-w-0 flex-1 truncate text-xs font-medium ${t.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                      {t.title}
                    </span>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="shrink-0 rounded p-1 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-rose-500"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-1.5">
                <Input
                  value={quickAdds[board.id] ?? ''}
                  onChange={(e) => setQuickAdds((m) => ({ ...m, [board.id]: e.target.value }))}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && (quickAdds[board.id] ?? '').trim() !== '') {
                      await addTask({ title: quickAdds[board.id].trim(), board_id: board.id })
                      setQuickAdds((m) => ({ ...m, [board.id]: '' }))
                    }
                  }}
                  placeholder="Quick add task..."
                  className="!py-2 text-xs"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    const title = (quickAdds[board.id] ?? '').trim()
                    if (title === '') return
                    await addTask({ title, board_id: board.id })
                    setQuickAdds((m) => ({ ...m, [board.id]: '' }))
                  }}
                >
                  <Plus size={14} />
                </Button>
              </div>
            </Card>
          )
        })}
      </div>

      <TaskModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
