# Chapter 27: Rich Text Editor (Tiptap)

**Southville 8B NHS Edge - Technical Documentation**
**Volume 4: Feature Documentation**

---

## Table of Contents

- [27.1 Overview](#271-overview)
- [27.2 Tiptap Integration](#272-tiptap-integration)
- [27.3 Editor Features](#273-editor-features)
- [27.4 Custom Extensions](#274-custom-extensions)
- [27.5 Image Upload System](#275-image-upload-system)
- [27.6 Editor Configuration](#276-editor-configuration)
- [27.7 Usage Examples](#277-usage-examples)
- [27.8 Best Practices](#278-best-practices)

---

## 27.1 Overview

The Southville 8B NHS Edge platform uses Tiptap, a headless rich text editor built on ProseMirror, to provide powerful content creation capabilities across the application. Tiptap enables users to create beautifully formatted content for announcements, articles, notes, and more.

### Purpose and Goals

The rich text editor serves several key purposes:

1. **Content Creation**: Enable users to create professional, formatted content
2. **Consistent Experience**: Provide a familiar editing experience across all features
3. **Accessibility**: Ensure content is accessible and properly structured
4. **Image Management**: Integrate with Cloudflare for efficient image handling
5. **Extensibility**: Support custom features and workflows

### Key Features

- **Rich Formatting**: Bold, italic, strikethrough, code, and more
- **Headings**: Six levels of semantic headings (H1-H6)
- **Lists**: Ordered and unordered lists with nesting
- **Links**: Add and edit hyperlinks
- **Images**: Drag-and-drop or paste images with automatic upload to Cloudflare
- **Text Alignment**: Left, center, right, and justified alignment
- **Blockquotes**: Format quoted text
- **Horizontal Rules**: Visual separators
- **Undo/Redo**: Full history management
- **Keyboard Shortcuts**: Efficient editing with shortcuts
- **Dark Mode**: Seamless theme integration
- **Read-only Mode**: Display content without editing

### Technology Stack

The editor leverages:

- **Tiptap**: Headless editor framework
- **ProseMirror**: Underlying editing engine
- **React**: Component integration
- **TypeScript**: Type safety
- **Cloudflare R2**: Image storage
- **Lucide Icons**: Toolbar icons
- **Tailwind CSS**: Styling

---

## 27.2 Tiptap Integration

The Tiptap editor is integrated as a reusable React component with full TypeScript support.

### 27.2.1 Installation and Dependencies

```json
// package.json dependencies
{
  "@tiptap/react": "^2.x.x",
  "@tiptap/starter-kit": "^2.x.x",
  "@tiptap/extension-link": "^2.x.x",
  "@tiptap/extension-image": "^2.x.x",
  "@tiptap/extension-text-align": "^2.x.x"
}
```

### 27.2.2 Editor Component Structure

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\components\ui\tiptap-editor.tsx

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
  onChange?: (html: string, json: object) => void
  editable?: boolean
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
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML(), editor.getJSON())
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl dark:prose-invert mx-auto focus:outline-none min-h-[300px] p-4 dark:text-gray-200 break-words overflow-wrap-anywhere max-w-full [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mt-8 [&_h1]:mb-4 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:text-base [&_p]:leading-7 [&_p]:my-4",
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

            // Upload to Cloudflare
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

        .ProseMirror {
          word-break: break-word;
          overflow-wrap: break-word;
          max-width: 100%;
        }
      `}</style>

      {editable && (
        <TooltipProvider>
          <div className="border-b border-gray-200 dark:border-slate-700 p-2 flex flex-wrap items-center gap-1 bg-gray-50 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50 rounded-t-lg">
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
```

---

## 27.3 Editor Features

The editor provides a comprehensive set of formatting and content creation tools.

### 27.3.1 Text Formatting

#### Bold, Italic, and Strikethrough

```typescript
// Text formatting commands
editor.chain().focus().toggleBold().run()        // Ctrl+B
editor.chain().focus().toggleItalic().run()      // Ctrl+I
editor.chain().focus().toggleStrike().run()      // Ctrl+Shift+S

// Check if active
const isBold = editor.isActive('bold')
const isItalic = editor.isActive('italic')
```

#### Code and Code Blocks

```typescript
// Inline code
editor.chain().focus().toggleCode().run()        // Ctrl+E

// Code block
editor.chain().focus().toggleCodeBlock().run()   // Ctrl+Alt+C

// Check if active
const isCode = editor.isActive('code')
const isCodeBlock = editor.isActive('codeBlock')
```

### 27.3.2 Headings

Six levels of semantic headings:

```typescript
// Set heading levels
editor.chain().focus().toggleHeading({ level: 1 }).run()  // H1 - Ctrl+Alt+1
editor.chain().focus().toggleHeading({ level: 2 }).run()  // H2 - Ctrl+Alt+2
editor.chain().focus().toggleHeading({ level: 3 }).run()  // H3 - Ctrl+Alt+3
editor.chain().focus().toggleHeading({ level: 4 }).run()  // H4 - Ctrl+Alt+4
editor.chain().focus().toggleHeading({ level: 5 }).run()  // H5 - Ctrl+Alt+5
editor.chain().focus().toggleHeading({ level: 6 }).run()  // H6 - Ctrl+Alt+6

// Clear heading (convert to paragraph)
editor.chain().focus().setParagraph().run()

// Check current heading level
const isH1 = editor.isActive('heading', { level: 1 })
```

### 27.3.3 Lists

Ordered and unordered lists with nesting support:

```typescript
// Toggle lists
editor.chain().focus().toggleBulletList().run()   // Ctrl+Shift+8
editor.chain().focus().toggleOrderedList().run()  // Ctrl+Shift+7

// List item operations
editor.chain().focus().splitListItem('listItem').run()  // Enter
editor.chain().focus().sinkListItem('listItem').run()   // Tab (indent)
editor.chain().focus().liftListItem('listItem').run()   // Shift+Tab (outdent)

// Check if in list
const isBulletList = editor.isActive('bulletList')
const isOrderedList = editor.isActive('orderedList')
```

### 27.3.4 Links

Add and manage hyperlinks:

```typescript
// Add link
const addLink = () => {
  const previousUrl = editor.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)

  if (url === null) return

  if (url === '') {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

// Remove link
editor.chain().focus().unsetLink().run()

// Check if link is active
const isLink = editor.isActive('link')
const linkUrl = editor.getAttributes('link').href
```

### 27.3.5 Text Alignment

Four alignment options:

```typescript
// Set text alignment
editor.chain().focus().setTextAlign('left').run()     // Ctrl+Shift+L
editor.chain().focus().setTextAlign('center').run()   // Ctrl+Shift+E
editor.chain().focus().setTextAlign('right').run()    // Ctrl+Shift+R
editor.chain().focus().setTextAlign('justify').run()  // Ctrl+Shift+J

// Check current alignment
const isLeftAligned = editor.isActive({ textAlign: 'left' })
const isCenterAligned = editor.isActive({ textAlign: 'center' })
```

### 27.3.6 Blockquotes

Format quoted text:

```typescript
// Toggle blockquote
editor.chain().focus().toggleBlockquote().run()  // Ctrl+Shift+B

// Check if active
const isBlockquote = editor.isActive('blockquote')
```

### 27.3.7 Horizontal Rules

Add visual separators:

```typescript
// Insert horizontal rule
editor.chain().focus().setHorizontalRule().run()  // Ctrl+Alt+H
```

### 27.3.8 History Management

Undo and redo operations:

```typescript
// Undo/Redo
editor.chain().focus().undo().run()  // Ctrl+Z
editor.chain().focus().redo().run()  // Ctrl+Y or Ctrl+Shift+Z

// Check if can undo/redo
const canUndo = editor.can().undo()
const canRedo = editor.can().redo()
```

---

## 27.4 Custom Extensions

The editor includes custom extensions for enhanced functionality.

### 27.4.1 Image Uploader Extension

```typescript
// C:\Users\John Mark\Desktop\Southville8B-NHS-Edge\frontend-nextjs\lib\tiptap-extensions.tsx

import { Node, mergeAttributes } from "@tiptap/core"
import { ReactNodeViewRenderer } from "@tiptap/react"
import { InlineImageUploader } from "@/components/ui/inline-image-uploader"

export const ImageUploader = Node.create({
  name: "imageUploader",

  group: "block",

  atom: true,

  addAttributes() {
    return {}
  },

  parseHTML() {
    return [
      {
        tag: "div[data-type='image-uploader']",
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "image-uploader" })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineImageUploader)
  },
})
```

---

## 27.5 Image Upload System

The editor integrates with Cloudflare R2 for efficient image storage and delivery.

### 27.5.1 Drag and Drop Upload

```typescript
// handleDrop implementation in editor
handleDrop: (view, event, slice, moved) => {
  if (!moved && event.dataTransfer?.files?.[0]) {
    const file = event.dataTransfer.files[0]

    if (file.type.startsWith("image/")) {
      event.preventDefault()

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        })
        return true
      }

      // Show loading placeholder
      const loadingNode = schema.nodes.image.create({
        src: "data:image/svg+xml,...", // Loading SVG
        alt: "Uploading..."
      })

      // Upload to Cloudflare
      newsApi.uploadImage(file)
        .then((result) => {
          // Replace with actual image URL
          const cloudflareUrl = result.cf_image_url || result.url
          // Update editor with real URL
        })
        .catch((error) => {
          // Handle error, remove placeholder
        })

      return true
    }
  }
  return false
}
```

### 27.5.2 Paste Upload

```typescript
// handlePaste implementation for clipboard images
handlePaste: (view, event) => {
  const items = event.clipboardData?.items
  if (!items) return false

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith("image/")) {
      event.preventDefault()
      const file = items[i].getAsFile()

      if (file) {
        // Validate and upload similar to drag-and-drop
        newsApi.uploadImage(file)
          .then((result) => {
            // Insert image into editor
          })
      }
      return true
    }
  }
  return false
}
```

### 27.5.3 Image Upload API

```typescript
// newsApi.uploadImage implementation
async uploadImage(file: File): Promise<ImageUploadResult> {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch('/api/news/upload-image', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  const result = await response.json()
  return {
    url: result.url,
    cf_image_url: result.cf_image_url,
    public_id: result.public_id,
  }
}
```

---

## 27.6 Editor Configuration

### 27.6.1 Extension Configuration

```typescript
// Configure all extensions
const editor = useEditor({
  extensions: [
    // StarterKit includes: Bold, Italic, Strike, Code, Paragraph,
    // Heading, BulletList, OrderedList, Blockquote, CodeBlock,
    // HorizontalRule, History, etc.
    StarterKit,

    // Link extension
    Link.configure({
      openOnClick: false,  // Don't open links when clicked in editor
      HTMLAttributes: {
        class: 'text-blue-600 hover:underline cursor-pointer',
      },
    }),

    // Image extension
    Image.configure({
      inline: true,
      allowBase64: true,  // Allow base64 images (for placeholders)
      HTMLAttributes: {
        class: 'rounded-lg max-w-full h-auto cursor-pointer transition-all hover:shadow-lg',
      },
    }),

    // Text alignment extension
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left',
    }),

    // Custom image uploader extension
    ImageUploader,
  ],
  content,
  editable,
  immediatelyRender: false,  // Prevent SSR hydration issues
  onUpdate: ({ editor }) => {
    if (onChange) {
      onChange(editor.getHTML(), editor.getJSON())
    }
  },
})
```

### 27.6.2 Editor Props

```typescript
// Configure editor behavior
editorProps: {
  attributes: {
    class: 'prose prose-sm sm:prose lg:prose-lg dark:prose-invert focus:outline-none min-h-[300px] p-4',
  },
  handleDrop: (view, event, slice, moved) => {
    // Custom drop handler
  },
  handlePaste: (view, event) => {
    // Custom paste handler
  },
}
```

### 27.6.3 Styling Configuration

```typescript
// Custom CSS for editor content
<style jsx global>{`
  .ProseMirror {
    word-break: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
  }

  .ProseMirror img {
    border-radius: 0.5rem;
    max-width: 100%;
    height: auto;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .ProseMirror img:hover {
    transform: scale(1.01);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  .ProseMirror img.ProseMirror-selectednode {
    outline: 3px solid #3b82f6;
    outline-offset: 2px;
  }

  .ProseMirror hr {
    border: none;
    border-top: 3px solid #e5e7eb;
    margin: 2rem 0;
    cursor: pointer;
  }

  .dark .ProseMirror hr {
    border-top-color: #374151;
  }

  .ProseMirror hr:hover {
    border-top-color: #3b82f6;
  }
`}</style>
```

---

## 27.7 Usage Examples

### 27.7.1 Basic Implementation

```typescript
// Simple editor usage
import { TiptapEditor } from '@/components/ui/tiptap-editor'

function ArticleEditor() {
  const [content, setContent] = useState('')

  const handleChange = (html: string, json: object) => {
    setContent(html)
    console.log('Content updated:', { html, json })
  }

  return (
    <div>
      <h2>Create Article</h2>
      <TiptapEditor
        content={content}
        onChange={handleChange}
        editable={true}
      />
    </div>
  )
}
```

### 27.7.2 Read-only Display

```typescript
// Display content without editing
function ArticleDisplay({ article }) {
  return (
    <div>
      <h1>{article.title}</h1>
      <TiptapEditor
        content={article.content}
        editable={false}  // Read-only mode
      />
    </div>
  )
}
```

### 27.7.3 Form Integration

```typescript
// Integrate with React Hook Form
import { useForm, Controller } from 'react-hook-form'
import { TiptapEditor } from '@/components/ui/tiptap-editor'

function AnnouncementForm() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      title: '',
      content: '',
    },
  })

  const onSubmit = (data) => {
    console.log('Submitting:', data)
    // Submit to API
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input name="title" placeholder="Title" />

      <Controller
        name="content"
        control={control}
        render={({ field }) => (
          <TiptapEditor
            content={field.value}
            onChange={(html) => field.onChange(html)}
            editable={true}
          />
        )}
      />

      <button type="submit">Publish</button>
    </form>
  )
}
```

### 27.7.4 Multiple Editors

```typescript
// Use multiple editors on the same page
function NewsArticleForm() {
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')

  return (
    <div className="space-y-8">
      <div>
        <label>Excerpt (Summary)</label>
        <TiptapEditor
          content={excerpt}
          onChange={(html) => setExcerpt(html)}
          editable={true}
        />
      </div>

      <div>
        <label>Full Content</label>
        <TiptapEditor
          content={content}
          onChange={(html) => setContent(html)}
          editable={true}
        />
      </div>
    </div>
  )
}
```

---

## 27.8 Best Practices

### 27.8.1 Performance Optimization

```typescript
// 1. Use debouncing for onChange callbacks
const debouncedOnChange = useMemo(
  () => debounce((html: string) => {
    // Save to API or state
  }, 500),
  []
)

<TiptapEditor
  content={content}
  onChange={debouncedOnChange}
/>

// 2. Memoize editor instance
const memoizedEditor = useMemo(() => (
  <TiptapEditor
    content={content}
    onChange={handleChange}
  />
), [content])

// 3. Use immediatelyRender: false to prevent SSR issues
const editor = useEditor({
  immediatelyRender: false,
  // ... other options
})
```

### 27.8.2 Content Validation

```typescript
// Validate content before submission
function validateEditorContent(html: string): boolean {
  // Check if content is not empty
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  const textContent = tempDiv.textContent || tempDiv.innerText || ''

  if (textContent.trim().length === 0) {
    return false
  }

  // Check minimum length (e.g., 100 characters)
  if (textContent.trim().length < 100) {
    return false
  }

  return true
}
```

### 27.8.3 Accessibility

```typescript
// Ensure editor is accessible
const editor = useEditor({
  editorProps: {
    attributes: {
      role: 'textbox',
      'aria-label': 'Rich text editor',
      'aria-multiline': 'true',
    },
  },
})
```

### 27.8.4 Error Handling

```typescript
// Handle image upload errors gracefully
handleDrop: (view, event, slice, moved) => {
  try {
    // Upload logic
    newsApi.uploadImage(file)
      .then((result) => {
        // Success
      })
      .catch((error) => {
        // Show user-friendly error
        toast({
          title: "Upload Failed",
          description: error.message || "Please try again",
          variant: "destructive",
        })
      })
  } catch (error) {
    console.error('Upload error:', error)
    return false
  }
}
```

### 27.8.5 Keyboard Shortcuts Reference

Provide users with a keyboard shortcuts guide:

```typescript
const shortcuts = [
  { keys: 'Ctrl+B', action: 'Bold' },
  { keys: 'Ctrl+I', action: 'Italic' },
  { keys: 'Ctrl+K', action: 'Add Link' },
  { keys: 'Ctrl+Z', action: 'Undo' },
  { keys: 'Ctrl+Y', action: 'Redo' },
  { keys: 'Ctrl+Shift+8', action: 'Bullet List' },
  { keys: 'Ctrl+Shift+7', action: 'Numbered List' },
  // ... more shortcuts
]

function KeyboardShortcutsGuide() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {shortcuts.map((shortcut) => (
        <div key={shortcut.keys} className="flex justify-between">
          <span>{shortcut.action}</span>
          <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">
            {shortcut.keys}
          </kbd>
        </div>
      ))}
    </div>
  )
}
```

---

## Summary

The Tiptap rich text editor provides a powerful, flexible content creation experience for the Southville 8B NHS Edge platform. Key features include:

- **Comprehensive Formatting**: All essential text formatting and structural elements
- **Image Management**: Seamless Cloudflare integration for image uploads
- **Extensible Architecture**: Custom extensions for specialized features
- **Excellent UX**: Drag-and-drop, paste support, and keyboard shortcuts
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Optimized for large documents and multiple instances
- **Type Safety**: Full TypeScript support throughout
- **Theme Integration**: Seamless dark mode support

The editor is production-ready and used throughout the platform for announcements, articles, notes, and other content creation needs.

---

**Navigation:**
- [← Previous: Chat & Messaging System](./26-chat-messaging.md)
- [Next: Charts & Data Visualization →](./28-charts-visualization.md)
- [↑ Back to Volume 4 Index](./README.md)
