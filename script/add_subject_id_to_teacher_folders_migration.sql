-- Migration: Add subject_id to teacher_folders table
-- Description: Links folders to subjects for better organization and filtering
-- Date: 2025-01-26

-- Add subject_id column to teacher_folders
ALTER TABLE public.teacher_folders
ADD COLUMN subject_id uuid;

-- Add foreign key constraint
ALTER TABLE public.teacher_folders
ADD CONSTRAINT teacher_folders_subject_id_fkey
FOREIGN KEY (subject_id)
REFERENCES public.subjects(id)
ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_teacher_folders_subject_id
ON public.teacher_folders(subject_id);

-- Add comment to document the column
COMMENT ON COLUMN public.teacher_folders.subject_id IS 'Optional subject association for folder organization';

-- Example: Update existing folders with subject (optional, run manually)
-- UPDATE public.teacher_folders SET subject_id = (SELECT id FROM public.subjects WHERE name = 'Mathematics' LIMIT 1) WHERE name ILIKE '%math%';
-- UPDATE public.teacher_folders SET subject_id = (SELECT id FROM public.subjects WHERE name = 'Science' LIMIT 1) WHERE name ILIKE '%science%';
-- UPDATE public.teacher_folders SET subject_id = (SELECT id FROM public.subjects WHERE name = 'English' LIMIT 1) WHERE name ILIKE '%english%';
