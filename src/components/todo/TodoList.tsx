import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface Todo {
  id: string
  title: string
  content: string
  completed: boolean
  image_url: string | null
  created_at: string
}

interface TodoListProps {
  todos: Todo[]
  onTodoSelect: (todo: Todo) => void
  selectedTodo: Todo | null
  onTodosUpdate: () => void
}

export const TodoList = ({ todos, onTodoSelect, selectedTodo, onTodosUpdate }: TodoListProps) => {
  const { toast } = useToast()

  const handleToggleComplete = async (todo: Todo) => {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !todo.completed })
      .eq('id', todo.id)

    if (error) {
      toast({ title: "Error updating todo", description: error.message, variant: "destructive" })
    } else {
      onTodosUpdate()
    }
  }

  const handleDelete = async (todo: Todo) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todo.id)

    if (error) {
      toast({ title: "Error deleting todo", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Todo deleted" })
      onTodosUpdate()
    }
  }

  if (todos.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>No todos yet. Create your first one!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
            selectedTodo?.id === todo.id 
              ? 'border-primary bg-primary/5 shadow-md' 
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => onTodoSelect(todo)}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={() => handleToggleComplete(todo)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium truncate ${
                todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}>
                {todo.title}
              </h3>
              <p className={`text-sm mt-1 line-clamp-2 ${
                todo.completed ? 'text-muted-foreground' : 'text-muted-foreground'
              }`}>
                {todo.content}
              </p>
              {todo.image_url && (
                <div className="mt-2">
                  <img 
                    src={todo.image_url} 
                    alt="Todo attachment" 
                    className="w-16 h-16 object-cover rounded border"
                  />
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(todo)
              }}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}