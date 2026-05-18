import { useState, useEffect } from 'react'
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Menu, 
  LayoutList, 
  Settings, 
  Sun, 
  Moon, 
  Pencil,
  X,
  Smile
} from 'lucide-react'
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
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  // Load tasks and theme on mount
  useEffect(() => {
    const loadData = async () => {
      const savedTasks = await AsyncStorage.getItem(STORAGE_KEY)
      const savedTheme = localStorage.getItem('@todo_theme')
      
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks))
        } catch (e) {
          console.error("Failed to parse tasks", e)
        }
      }
      
      const shouldBeDark = savedTheme === 'dark'
      setIsDarkMode(shouldBeDark)
      if (shouldBeDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const newMode = !prev
      if (newMode) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('@todo_theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('@todo_theme', 'light')
      }
      return newMode
    })
  }

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

  const startEditing = (task) => {
    setEditingId(task.id)
    setEditValue(task.text)
  }

  const saveEdit = () => {
    if (!editValue.trim()) return
    setTasks(tasks.map(task => 
      task.id === editingId ? { ...task, text: editValue.trim() } : task
    ))
    setEditingId(null)
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  return (
    <div className={cn(
      "flex h-screen w-full transition-colors duration-300",
      isDarkMode ? "bg-figma-bg-dark text-white" : "bg-figma-bg-light text-slate-900"
    )}>
      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col border-r w-20 transition-all duration-300",
        isDarkMode ? "bg-figma-sidebar-dark border-slate-800" : "bg-figma-sidebar-light border-slate-200"
      )}>
        <div className="p-6 flex flex-col items-center gap-8">
          <button className={cn(
            "p-2 rounded-lg transition-colors",
            isDarkMode ? "hover:bg-slate-800 text-white" : "hover:bg-slate-100 text-slate-900"
          )}>
            <Menu size={24} />
          </button>
          
          <nav className="flex flex-col gap-6">
            <button 
              onClick={() => setFilter('all')}
              className={cn(
                "p-3 rounded-xl transition-all",
                filter === 'all' 
                  ? (isDarkMode ? "bg-slate-800 text-white shadow-lg shadow-black/50" : "bg-slate-100 text-slate-900 shadow-sm")
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              )}
            >
              <LayoutList size={24} />
            </button>
            <button 
              className="p-3 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
            >
              <Settings size={24} />
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header Theme Toggle */}
        <div className="absolute top-8 right-8">
          <button 
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-full transition-colors",
              isDarkMode ? "hover:bg-slate-800 text-white" : "hover:bg-slate-200 text-slate-900"
            )}
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        {/* Title */}
        <header className="pt-16 pb-8 text-center">
          <h1 className={cn(
            "text-3xl font-bold tracking-tight",
            isDarkMode ? "text-white" : "text-slate-800"
          )}>
            My Tasks
          </h1>
        </header>

        {/* Search/Add Section */}
        <div className="px-8 mb-12 flex justify-center">
          <form onSubmit={addTask} className="w-full max-w-xl flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your task here.."
              className={cn(
                "flex-1 px-5 py-3 rounded-xl border transition-all focus:outline-none focus:ring-1 focus:ring-slate-400 text-sm",
                isDarkMode 
                  ? "bg-figma-input-dark border-slate-700 text-white placeholder:text-slate-500" 
                  : "bg-figma-input-light border-slate-200 text-slate-900 placeholder:text-slate-400"
              )}
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className={cn(
                "px-6 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2",
                isDarkMode 
                  ? "bg-figma-btn-dark text-white hover:bg-slate-600" 
                  : "bg-figma-btn-light text-white hover:bg-slate-800"
              )}
            >
              + Add
            </button>
          </form>
        </div>

        {/* Task List Section */}
        <div className="flex-1 overflow-y-auto px-8 pb-12 flex flex-col items-center">
          <div className="w-full max-w-xl">
            {/* List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-20 text-slate-400">Loading...</div>
              ) : filteredTasks.length === 0 ? (
                <div className="flex flex-col md:flex-row items-center justify-center py-20 gap-8">
                  <div className="relative">
                    <div className="w-48 h-48 flex items-center justify-center opacity-80">
                      <svg viewBox="0 0 200 200" className={isDarkMode ? "text-slate-700" : "text-slate-300"}>
                        <path fill="currentColor" d="M100 0C44.8 0 0 44.8 0 100s44.8 100 100 100 100-44.8 100-100S155.2 0 100 0zm0 180c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"/>
                        <circle cx="70" cy="85" r="10" fill="currentColor"/>
                        <circle cx="130" cy="85" r="10" fill="currentColor"/>
                        <path stroke="currentColor" strokeWidth="5" fill="none" d="M60 130s20 20 40 20 40-20 40-20"/>
                      </svg>
                    </div>
                  </div>
                  <div className="text-left max-w-xs">
                    <p className={cn(
                      "text-lg font-medium",
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    )}>
                      Empty as my motivation on Monday <Smile className="inline text-yellow-500" size={20} />.
                    </p>
                    <p className="text-sm text-slate-400 mt-1">Let's start adding stuff!</p>
                  </div>
                </div>
              ) : (
                filteredTasks.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      "group flex items-center gap-4 p-4 rounded-2xl transition-all border",
                      isDarkMode 
                        ? "bg-figma-sidebar-dark border-slate-800 hover:border-slate-700" 
                        : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"
                    )}
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={cn(
                        "transition-colors",
                        task.completed ? "text-indigo-500" : "text-slate-300 hover:text-slate-400"
                      )}
                    >
                      {task.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </button>
                    
                    {editingId === task.id ? (
                      <div className="flex-1 flex gap-2">
                        <input 
                          autoFocus
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className={cn(
                            "flex-1 bg-transparent border-b focus:outline-none text-sm",
                            isDarkMode ? "border-indigo-400" : "border-indigo-500"
                          )}
                        />
                        <button onClick={saveEdit} className="text-indigo-500"><Plus size={18}/></button>
                        <button onClick={() => setEditingId(null)} className="text-slate-400"><X size={18}/></button>
                      </div>
                    ) : (
                      <span className={cn(
                        "flex-1 text-sm font-medium transition-all",
                        task.completed ? "line-through text-slate-500" : isDarkMode ? "text-slate-200" : "text-slate-700"
                      )}>
                        {task.text}
                      </span>
                    )}

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => startEditing(task)}
                        className="p-1.5 text-slate-400 hover:text-indigo-500 rounded-lg transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-8 text-center text-[10px] text-slate-400 font-medium tracking-widest">
          © 2025
        </div>
      </main>
    </div>
  )
}
