"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { PageTransition } from "@/components/superadmin/page-transition"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Star, AlertCircle, Loader2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useGallery } from "@/hooks/useGallery"
import type { GalleryItem } from "@/lib/api/types/gallery"
import { getCardUrl, getImageAltText } from "@/lib/utils/gallery-images"

export default function EditGalleryPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { loadItem, updateItem } = useGallery()
  
  const [item, setItem] = useState<GalleryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    caption: "",
    alt_text: "",
    is_featured: false,
    photographer_name: "",
    photographer_credit: "",
    taken_at: "",
    location: "",
    display_order: 0,
  })

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const itemId = params.id as string
        const fetchedItem = await loadItem(itemId)
        if (fetchedItem) {
          setItem(fetchedItem)
          setFormData({
            title: fetchedItem.title || "",
            caption: fetchedItem.caption || "",
            alt_text: fetchedItem.alt_text || "",
            is_featured: fetchedItem.is_featured || false,
            photographer_name: fetchedItem.photographer_name || "",
            photographer_credit: fetchedItem.photographer_credit || "",
            taken_at: fetchedItem.taken_at ? new Date(fetchedItem.taken_at).toISOString().split('T')[0] : "",
            location: fetchedItem.location || "",
            display_order: fetchedItem.display_order || 0,
          })
        }
      } catch (error) {
        console.error('Error fetching item:', error)
        toast({
          title: "Error",
          description: "Failed to load gallery item details.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [params.id, loadItem, toast])

  const handleSave = async () => {
    if (!item) return

    setSaving(true)
    try {
      await updateItem(item.id, {
        title: formData.title,
        caption: formData.caption,
        alt_text: formData.alt_text,
        is_featured: formData.is_featured,
        photographer_name: formData.photographer_name,
        photographer_credit: formData.photographer_credit,
        taken_at: formData.taken_at,
        location: formData.location,
        display_order: formData.display_order,
      })

      toast({
        title: "✅ Gallery Item Updated",
        description: "The gallery item has been successfully updated.",
        className: "border-green-500/20 bg-green-500/5",
      })

      router.push("/superadmin/gallery")
    } catch (error) {
      console.error('Error updating item:', error)
      toast({
        title: "❌ Update Failed",
        description: "There was an error updating the gallery item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading gallery item...</span>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (!item) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Gallery Item Not Found</h2>
            <p className="text-muted-foreground mb-4">The gallery item you're looking for doesn't exist.</p>
            <Button onClick={() => router.push("/superadmin/gallery")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gallery
            </Button>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push("/superadmin/gallery")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Edit Gallery Item</h1>
              <p className="text-muted-foreground">Update gallery item details</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/superadmin/gallery")}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Image Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={getCardUrl(item)}
                  alt={getImageAltText(item)}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p><strong>File:</strong> {item.original_filename}</p>
                <p><strong>Size:</strong> {item.file_size_bytes ? `${(item.file_size_bytes / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}</p>
                <p><strong>Type:</strong> {item.mime_type}</p>
                <p><strong>Views:</strong> {item.views_count || 0}</p>
                <p><strong>Downloads:</strong> {item.downloads_count || 0}</p>
              </div>
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>Update the gallery item information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter photo title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caption">Caption/Description</Label>
                  <Textarea
                    id="caption"
                    value={formData.caption}
                    onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                    placeholder="Enter photo description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alt_text">Alt Text (Accessibility)</Label>
                  <Input
                    id="alt_text"
                    value={formData.alt_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                    placeholder="Describe the image for screen readers"
                  />
                </div>
              </div>

              {/* Photographer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Photographer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="photographer_name">Photographer Name</Label>
                    <Input
                      id="photographer_name"
                      value={formData.photographer_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, photographer_name: e.target.value }))}
                      placeholder="e.g., John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="photographer_credit">Photographer Credit</Label>
                    <Input
                      id="photographer_credit"
                      value={formData.photographer_credit}
                      onChange={(e) => setFormData(prev => ({ ...prev, photographer_credit: e.target.value }))}
                      placeholder="e.g., Photo by John Doe, School Journalism Club"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Photo Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taken_at">Date Taken</Label>
                    <Input
                      id="taken_at"
                      type="date"
                      value={formData.taken_at}
                      onChange={(e) => setFormData(prev => ({ ...prev, taken_at: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., School Gymnasium"
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="is_featured" className="text-base">Featured</Label>
                      <p className="text-sm text-muted-foreground">Show this item prominently on the homepage</p>
                    </div>
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      min="0"
                      value={formData.display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}


















