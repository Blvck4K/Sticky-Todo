import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Upload, X } from 'lucide-react'

interface Todo {
  id: string
  title: string
  content: string
  completed: boolean
  image_url: string | null
  created_at: string
}

interface TodoEditorProps {
  todo: Todo | null
  isCreating: boolean
  onSave: () => void
  onCancel: () => void
}

export const TodoEditor = ({ todo, isCreating, onSave, onCancel }: TodoEditorProps) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (todo) {
      setTitle(todo.title)
      setContent(todo.content)
      setImageUrl(todo.image_url)
      setImageFile(null)
    } else if (isCreating) {
      setTitle('')
      setContent('')
      setImageUrl(null)
      setImageFile(null)
    }
  }, [todo, isCreating])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const url = URL.createObjectURL(file)
      setImageUrl(url)
    }
  }

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `todo-images/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('todo-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('todo-images')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" })
      return
    }

    setLoading(true)

    try {
      let finalImageUrl = imageUrl

      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile)
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (isCreating) {
        const { error } = await supabase
          .from('todos')
          .insert([{
            user_id: user.id,
            title,
            content,
            image_url: finalImageUrl,
          }])

        if (error) throw error
        toast({ title: "Todo created!" })
      } else if (todo) {
        const { error } = await supabase
          .from('todos')
          .update({
            title,
            content,
            image_url: finalImageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', todo.id)

        if (error) throw error
        toast({ title: "Todo updated!" })
      }

      onSave()
    } catch (error: any) {
      toast({
        title: "Error saving todo",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImageUrl(null)
  }

  if (!isCreating && !todo) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Select a todo to edit or create a new one</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="space-y-4 flex-1">
        <Input
          placeholder="Todo title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-medium"
        />

        <Textarea
          placeholder="Write your todo content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] resize-none text-base leading-relaxed"
        />

        {/* Image Upload */}
        <div className="space-y-3">
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button variant="outline" className="w-full" asChild>
              <span className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </span>
            </Button>
          </label>

          {imageUrl && (
            <div className="relative inline-block">
              <img
                src={imageUrl}
                alt="Todo attachment"
                className="max-w-full h-auto max-h-48 rounded border"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={removeImage}
                className="absolute top-2 right-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button onClick={handleSave} disabled={loading} className="flex-1">
          {loading ? 'Saving...' : (isCreating ? 'Create Todo' : 'Update Todo')}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </div>
  )
}