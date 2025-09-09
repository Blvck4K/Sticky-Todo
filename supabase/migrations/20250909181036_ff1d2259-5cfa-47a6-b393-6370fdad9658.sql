-- Create todos table with RLS
CREATE TABLE public.todos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for todos
CREATE POLICY "Users can view their own todos" 
ON public.todos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own todos" 
ON public.todos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" 
ON public.todos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" 
ON public.todos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON public.todos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for todo images
INSERT INTO storage.buckets (id, name, public) VALUES ('todo-images', 'todo-images', true);

-- Create storage policies for todo images
CREATE POLICY "Users can view todo images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'todo-images');

CREATE POLICY "Users can upload their own todo images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'todo-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own todo images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'todo-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own todo images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'todo-images' AND auth.uid()::text = (storage.foldername(name))[1]);