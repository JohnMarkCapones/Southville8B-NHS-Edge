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
  Minus,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useCallback } from "react"
import { ImageUploader } from "@/lib/tiptap-extensions"
import { TooltipButton } from "@/components/ui/tooltip-button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { newsApi } from "@/lib/api/endpoints/news"
import { useToast } from "@/hooks/use-toast"

interface TiptapEditorProps {
  content: string
  onChange?: (html: string, json: object) => void // Updated to return both HTML and JSON
  editable?: boolean // Added editable prop to control read-only mode
}

export function TiptapEditor({ content, onChange, editable = true }: TiptapEditorProps) {
  const { toast } = useToast()

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
    immediatelyRender: false, // Fix SSR hydration issues
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML(), editor.getJSON())
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl dark:prose-invert mx-auto focus:outline-none min-h-[300px] p-4 dark:text-gray-200 break-words overflow-wrap-anywhere max-w-full [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_h4]:text-xl [&_h4]:font-bold [&_h4]:mt-3 [&_h4]:mb-2 [&_h5]:text-lg [&_h5]:font-bold [&_h5]:mt-2 [&_h5]:mb-1 [&_h6]:text-base [&_h6]:font-bold [&_h6]:mt-2 [&_h6]:mb-1 [&_p]:text-base [&_p]:leading-7 [&_p]:my-4",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!editable) return false

        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0]
          const fileType = file.type

          if (fileType.startsWith("image/")) {
            event.preventDefault()

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
              toast({
                title: "❌ File too large",
                description: "Image size must be less than 5MB",
                variant: "destructive",
              })
              return true
            }

            // Upload to Cloudflare instead of using base64
            const { schema } = view.state
            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })

            if (coordinates) {
              // Show loading placeholder
              const loadingNode = schema.nodes.image.create({ 
                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-size='14' text-anchor='middle' dy='.3em' fill='%236b7280'%3EUploading...%3C/text%3E%3C/svg%3E",
                alt: "Uploading..."
              })
              const transaction = view.state.tr.insert(coordinates.pos, loadingNode)
              view.dispatch(transaction)
              const insertPos = coordinates.pos

              // Upload to Cloudflare
              newsApi.uploadImage(file)
                .then((result) => {
                  const cloudflareUrl = result.cf_image_url || result.url
                  
                  // Replace loading placeholder with actual image
                  const tr = view.state.tr.replaceWith(
                    insertPos,
                    insertPos + 1,
                    schema.nodes.image.create({ src: cloudflareUrl })
                  )
                  view.dispatch(tr)

                  toast({
                    title: "✅ Image uploaded",
                    description: "Image uploaded to Cloudflare successfully",
                  })
                })
                .catch((error) => {
                  console.error("Failed to upload image:", error)
                  // Remove loading placeholder on error
                  const tr = view.state.tr.delete(insertPos, insertPos + 1)
                  view.dispatch(tr)
                  
                  toast({
                    title: "❌ Upload failed",
                    description: "Failed to upload image. Please try again.",
                    variant: "destructive",
                  })
                })
            }
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
              // Validate file size (5MB)
              if (file.size > 5 * 1024 * 1024) {
                toast({
                  title: "❌ File too large",
                  description: "Image size must be less than 5MB",
                  variant: "destructive",
                })
                return true
              }

              // Show loading image while uploading
              editor?.chain().focus().setImage({ 
                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-size='14' text-anchor='middle' dy='.3em' fill='%236b7280'%3EUploading...%3C/text%3E%3C/svg%3E",
                alt: "Uploading..."
              }).run()

              // Get current selection to replace the loading image later
              const currentPos = view.state.selection.from - 1

              // Upload to Cloudflare
              newsApi.uploadImage(file)
                .then((result) => {
                  const cloudflareUrl = result.cf_image_url || result.url
                  
                  // Replace loading placeholder with actual Cloudflare URL
                  if (editor) {
                    const tr = view.state.tr.setNodeMarkup(currentPos, undefined, { 
                      src: cloudflareUrl,
                      alt: file.name
                    })
                    view.dispatch(tr)
                  }

                  toast({
                    title: "✅ Image uploaded",
                    description: "Image uploaded to Cloudflare successfully",
                  })
                })
                .catch((error) => {
                  console.error("Failed to upload image:", error)
                  
                  // Remove loading image on error
                  if (editor) {
                    const tr = view.state.tr.delete(currentPos, currentPos + 1)
                    view.dispatch(tr)
                  }

                  toast({
                    title: "❌ Upload failed",
                    description: "Failed to upload image. Please try again.",
                    variant: "destructive",
                  })
                })
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

        /* Horizontal Rule Styling */
        .ProseMirror hr {
          border: none;
          border-top: 3px solid #e5e7eb;
          margin: 2rem 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .dark .ProseMirror hr {
          border-top-color: #374151;
        }

        .ProseMirror hr:hover {
          border-top-color: #3b82f6;
        }

        .ProseMirror hr.ProseMirror-selectednode {
          border-top-color: #3b82f6;
          border-top-width: 4px;
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
            <TooltipButton
              icon={Minus}
              label="Horizontal Line"
              shortcut="Ctrl+Alt+H"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              isActive={false}
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
