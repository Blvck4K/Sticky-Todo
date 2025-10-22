import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { TodoList } from './TodoList'
import { TodoEditor } from './TodoEditor'
import { Button } from '@/components/ui/button'
import { LogOut, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { CalendarView } from '@/components/calendar/CalendarView'

interface Todo {
  id: string
  title: string
  content: string
  completed: boolean
  image_url: string | null
  created_at: string
}

export const TodoBook = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    getUser()
    fetchTodos()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast({ title: "Error fetching todos", description: error.message, variant: "destructive" })
    } else {
      setTodos(data || [])
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const handleNewTodo = () => {
    setSelectedTodo(null)
    setIsCreating(true)
  }

  const handleTodoSaved = () => {
    fetchTodos()
    setIsCreating(false)
    setSelectedTodo(null)
  }

  const handleTodoSelect = (todo: Todo) => {
    setSelectedTodo(todo)
    setIsCreating(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">My Todo Book</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleNewTodo}>
              <Plus className="w-4 h-4 mr-2" />
              New Todo
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Book Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">
            {/* Left Page - Todo List */}
            <div className="bg-card rounded-2xl shadow-2xl border-2 border-primary/20 p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="h-full">
                <h2 className="text-xl font-semibold text-secondary mb-6 border-b border-secondary/20 pb-2">
                  My Todos
                </h2>
                <TodoList 
                  todos={todos} 
                  onTodoSelect={handleTodoSelect}
                  selectedTodo={selectedTodo}
                  onTodosUpdate={fetchTodos}
                />
              </div>
            </div>

            {/* Middle Page - Calendar */}
            <div className="bg-card rounded-2xl shadow-2xl border-2 border-primary/20 p-8">
              <div className="h-full">
                <h2 className="text-xl font-semibold text-secondary mb-6 border-b border-secondary/20 pb-2">
                  Calendar
                </h2>
                <CalendarView />
              </div>
            </div>

            {/* Right Page - Todo Editor */}
            <div className="bg-card rounded-2xl shadow-2xl border-2 border-primary/20 p-8 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="h-full">
                <h2 className="text-xl font-semibold text-secondary mb-6 border-b border-secondary/20 pb-2">
                  {isCreating ? 'Create New Todo' : selectedTodo ? 'Edit Todo' : 'Select a Todo'}
                </h2>
                <TodoEditor
                  todo={selectedTodo}
                  isCreating={isCreating}
                  onSave={handleTodoSaved}
                  onCancel={() => {
                    setIsCreating(false)
                    setSelectedTodo(null)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}