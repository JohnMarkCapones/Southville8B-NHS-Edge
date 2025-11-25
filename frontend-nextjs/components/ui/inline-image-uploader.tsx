"use client"

import type React from "react"

import { NodeViewWrapper } from "@tiptap/react"
import { Upload, Loader2 } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import { newsApi } from "@/lib/api/endpoints/news"
import { useToast } from "@/hooks/use-toast"

interface InlineImageUploaderProps {
  editor: any
  getPos: () => number
  deleteNode: () => void
}

export function InlineImageUploader({ editor, getPos, deleteNode }: InlineImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const uploadToCloudflare = useCallback(
    async (file: File) => {
      setIsUploading(true)
      try {
        // Upload to Cloudflare via API
        const result = await newsApi.uploadImage(file)
        const cloudflareUrl = result.cf_image_url || result.url

        const pos = getPos()

        // Replace the uploader node with an image node using Cloudflare URL
        editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + 1 })
          .insertContentAt(pos, {
            type: "image",
            attrs: { src: cloudflareUrl },
          })
          .run()

        toast({
          title: "✅ Image uploaded",
          description: "Image uploaded to Cloudflare successfully",
        })
      } catch (error) {
        console.error("Failed to upload image:", error)
        toast({
          title: "❌ Upload failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        })
        deleteNode()
      } finally {
        setIsUploading(false)
      }
    },
    [editor, getPos, deleteNode, toast],
  )

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "❌ Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        })
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "❌ File too large",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        })
        return
      }

      await uploadToCloudflare(file)
    },
    [uploadToCloudflare, toast],
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const file = e.dataTransfer.files[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "❌ Invalid file type",
          description: "Please upload an image file",
          variant: "destructive",
        })
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "❌ File too large",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        })
        return
      }

      await uploadToCloudflare(file)
    },
    [uploadToCloudflare, toast],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <NodeViewWrapper className="my-4">
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isUploading ? (
                "Uploading to Cloudflare..."
              ) : (
                <>
                  <span className="text-blue-600 dark:text-blue-400 underline">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {isUploading ? "Please wait..." : "Maximum file size: 5MB"}
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          multiple={false}
          disabled={isUploading}
        />
      </div>
    </NodeViewWrapper>
  )
}
