import { useState, useEffect } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, Search, ListTodo } from 'lucide-react'
import AsyncStorage from './lib/storage'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const STORAGE_KEY = '@todo_list_tasks'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState('all') // all, active, completed
  const [isLoading, setIsLoading] = useState(true)

  // Load tasks on mount
  useEffect(() => {
    const loadTasks = async () => {
      const savedTasks = await AsyncStorage.getItem(STORAGE_KEY)
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks))
        } catch (e) {
          console.error("Failed to parse tasks", e)
          setTasks([])
        }
      }
      setIsLoading(false)
    }
    loadTasks()
  }, [])

  // Save tasks on change
  useEffect(() => {
    if (!isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    }
  }, [tasks, isLoading])

  const addTask = (e) => {
    e?.preventDefault()
    if (!inputValue.trim()) return

    const newTask = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    }

    setTasks([newTask, ...tasks])
    setInputValue('')
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const activeCount = tasks.filter(t => !t.completed).length

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <ListTodo size={28} />
            <h1 className="text-2xl font-bold tracking-tight">Minhas Tarefas</h1>
          </div>
          <p className="text-indigo-100 text-sm opacity-90">
            {activeCount === 0 
              ? "Tudo pronto por aqui!" 
              : `Você tem ${activeCount} ${activeCount === 1 ? 'tarefa pendente' : 'tarefas pendentes'}`}
          </p>
        </div>

        {/* Input Area */}
        <form onSubmit={addTask} className="p-6 border-b border-slate-100">
          <div className="relative group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Adicionar nova tarefa..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-900"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="flex gap-1 p-2 bg-slate-50 mx-6 mt-4 rounded-lg">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                filter === f 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {f === 'all' ? 'Todas' : f === 'active' ? 'Pendentes' : 'Concluídas'}
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-slate-400">Carregando...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-300" size={24} />
              </div>
              <p className="text-slate-400 text-sm">Nenhuma tarefa encontrada.</p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                className={cn(
                  "group flex items-center gap-3 p-3 rounded-xl border transition-all",
                  task.completed 
                    ? "bg-slate-50 border-transparent opacity-60" 
                    : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-sm"
                )}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    "transition-colors",
                    task.completed ? "text-indigo-500" : "text-slate-300 hover:text-indigo-400"
                  )}
                >
                  {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
                
                <span className={cn(
                  "flex-1 text-sm transition-all",
                  task.completed ? "line-through text-slate-400" : "text-slate-700"
                )}>
                  {task.text}
                </span>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
            Simple To-Do
          </span>
          <button 
            onClick={() => setTasks(tasks.filter(t => !t.completed))}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Limpar concluídas
          </button>
        </div>
      </div>
    </div>
  )
}
