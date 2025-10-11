"use client"

import type React from "react"

import { NodeViewWrapper } from "@tiptap/react"
import { Upload } from "lucide-react"
import { useCallback, useRef } from "react"

interface InlineImageUploaderProps {
  editor: any
  getPos: () => number
  deleteNode: () => void
}

export function InlineImageUploader({ editor, getPos, deleteNode }: InlineImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file")
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const src = event.target?.result as string
        const pos = getPos()

        // Replace the uploader node with an image node
        editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + 1 })
          .insertContentAt(pos, {
            type: "image",
            attrs: { src },
          })
          .run()
      }
      reader.readAsDataURL(file)
    },
    [editor, getPos],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const file = e.dataTransfer.files[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file")
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const src = event.target?.result as string
        const pos = getPos()

        // Replace the uploader node with an image node
        editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + 1 })
          .insertContentAt(pos, {
            type: "image",
            attrs: { src },
          })
          .run()
      }
      reader.readAsDataURL(file)
    },
    [editor, getPos],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <NodeViewWrapper className="my-4">
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="text-blue-600 dark:text-blue-400 underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum 3 files, 5MB each</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          multiple={false}
        />
      </div>
    </NodeViewWrapper>
  )
}
