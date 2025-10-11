"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  LinkIcon,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useCallback } from "react"
import { ImageUploader } from "@/lib/tiptap-extensions"
import { TooltipButton } from "@/components/ui/tooltip-button"
import { TooltipProvider } from "@/components/ui/tooltip"

interface TiptapEditorProps {
  content: string
  onChange?: (content: string) => void // Made onChange optional for read-only mode
  editable?: boolean // Added editable prop to control read-only mode
}

export function TiptapEditor({ content, onChange, editable = true }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto cursor-pointer transition-all hover:shadow-lg",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      ImageUploader,
    ],
    content,
    editable, // Pass editable prop to editor
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML())
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl dark:prose-invert mx-auto focus:outline-none min-h-[300px] p-4 dark:text-gray-200 break-words overflow-wrap-anywhere max-w-full",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!editable) return false

        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          const fileType = file.type

          if (fileType.startsWith("image/")) {
            event.preventDefault()

            const reader = new FileReader()
            reader.onload = (e) => {
              const src = e.target?.result as string
              const { schema } = view.state
              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })

              if (coordinates) {
                const node = schema.nodes.image.create({ src })
                const transaction = view.state.tr.insert(coordinates.pos, node)
                view.dispatch(transaction)
              }
            }
            reader.readAsDataURL(file)
            return true
          }
        }
        return false
      },
      handlePaste: (view, event) => {
        if (!editable) return false

        const items = event.clipboardData?.items
        if (!items) return false

        for (let i = 0; i < items.length; i++) {
          if (items[i].type.startsWith("image/")) {
            event.preventDefault()
            const file = items[i].getAsFile()
            if (file) {
              const reader = new FileReader()
              reader.onload = (e) => {
                const src = e.target?.result as string
                editor?.chain().focus().setImage({ src }).run()
              }
              reader.readAsDataURL(file)
            }
            return true
          }
        }
        return false
      },
    },
  })

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)

    if (url === null) {
      return
    }

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    editor?.chain().focus().insertContent({ type: "imageUploader" }).run()
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 transition-all duration-300 shadow-sm hover:shadow-md">
      <style jsx global>{`
        .ProseMirror img.ProseMirror-selectednode {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px;
          border-radius: 0.5rem;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .ProseMirror img {
          transition: all 0.2s ease;
        }
        
        .ProseMirror img:hover {
          transform: scale(1.01);
        }
        
        /* Added CSS to force word breaking for long strings */
        .ProseMirror {
          word-break: break-word;
          overflow-wrap: break-word;
          max-width: 100%;
        }
        
        .ProseMirror * {
          max-width: 100%;
          overflow-wrap: break-word;
        }
      `}</style>

      {editable && (
        <TooltipProvider>
          <div className="border-b border-gray-200 dark:border-slate-700 p-2 flex flex-wrap items-center gap-1 bg-gray-50 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50 overflow-visible rounded-t-lg">
            {/* Text Formatting */}
            <TooltipButton
              icon={Bold}
              label="Bold"
              shortcut="Ctrl+B"
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
            />
            <TooltipButton
              icon={Italic}
              label="Italic"
              shortcut="Ctrl+I"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
            />
            <TooltipButton
              icon={Strikethrough}
              label="Strikethrough"
              shortcut="Ctrl+Shift+S"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
            />
            <TooltipButton
              icon={Code}
              label="Code"
              shortcut="Ctrl+E"
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive("code")}
            />

            <Separator orientation="vertical" className="h-6 dark:bg-slate-700" />

            {/* Headings */}
            <TooltipButton
              icon={Heading1}
              label="Heading 1"
              shortcut="Ctrl+Alt+1"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive("heading", { level: 1 })}
            />
            <TooltipButton
              icon={Heading2}
              label="Heading 2"
              shortcut="Ctrl+Alt+2"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive("heading", { level: 2 })}
            />
            <TooltipButton
              icon={Heading3}
              label="Heading 3"
              shortcut="Ctrl+Alt+3"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive("heading", { level: 3 })}
            />

            <Separator orientation="vertical" className="h-6 dark:bg-slate-700" />

            {/* Lists */}
            <TooltipButton
              icon={List}
              label="Bullet List"
              shortcut="Ctrl+Shift+8"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
            />
            <TooltipButton
              icon={ListOrdered}
              label="Numbered List"
              shortcut="Ctrl+Shift+7"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
            />
            <TooltipButton
              icon={Quote}
              label="Quote"
              shortcut="Ctrl+Shift+B"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
            />

            <Separator orientation="vertical" className="h-6 dark:bg-slate-700" />

            {/* Alignment */}
            <TooltipButton
              icon={AlignLeft}
              label="Align Left"
              shortcut="Ctrl+Shift+L"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              isActive={editor.isActive({ textAlign: "left" })}
            />
            <TooltipButton
              icon={AlignCenter}
              label="Align Center"
              shortcut="Ctrl+Shift+E"
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              isActive={editor.isActive({ textAlign: "center" })}
            />
            <TooltipButton
              icon={AlignRight}
              label="Align Right"
              shortcut="Ctrl+Shift+R"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              isActive={editor.isActive({ textAlign: "right" })}
            />
            <TooltipButton
              icon={AlignJustify}
              label="Justify"
              shortcut="Ctrl+Shift+J"
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              isActive={editor.isActive({ textAlign: "justify" })}
            />

            <Separator orientation="vertical" className="h-6 dark:bg-slate-700" />

            {/* Media */}
            <TooltipButton
              icon={LinkIcon}
              label="Add Link"
              shortcut="Ctrl+K"
              onClick={addLink}
              isActive={editor.isActive("link")}
            />
            <TooltipButton icon={ImageIcon} label="Add Image" onClick={addImage} />

            <Separator orientation="vertical" className="h-6 dark:bg-slate-700" />

            {/* History */}
            <TooltipButton
              icon={Undo}
              label="Undo"
              shortcut="Ctrl+Z"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
            />
            <TooltipButton
              icon={Redo}
              label="Redo"
              shortcut="Ctrl+Y"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
            />
          </div>
        </TooltipProvider>
      )}

      <EditorContent
        editor={editor}
        className="min-h-[300px] dark:bg-slate-900 overflow-x-auto max-w-full rounded-b-lg"
      />
    </div>
  )
}

export default TiptapEditor
