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
