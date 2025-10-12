"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  AlertCircle,
  MessageSquare,
  Timer,
  Plus,
  Trash2,
  Save,
  Building2,
  HelpCircle,
  Camera,
  Navigation,
  ImageIcon,
  Upload,
  Eye,
  Link2,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Added for tabs

export default function StaticPagesManagement() {
  // Contact Information State
  const [contactInfo, setContactInfo] = useState({
    phone: "(02) 8123-4567",
    email: "info@southville8bnhs.edu.ph",
    address: "123 Education Street, Barangay 8B, Southville, Metro Manila",
    officeHours: "Monday - Friday: 7:00 AM - 5:00 PM",
    emergencyHotline: "(02) 8123-4568",
    generalInquiries: "inquiries@southville8bnhs.edu.ph",
    responseTime: "24-48 hours",
  })

  // Department Contacts State
  const [departments, setDepartments] = useState([
    {
      id: "1",
      office: "Principal's Office",
      name: "Dr. Maria Santos",
      description: "School administration and general inquiries",
      email: "principal@southville8bnhs.edu.ph",
      contactNumber: "(02) 8123-4570",
    },
    {
      id: "2",
      office: "Registrar's Office",
      name: "Ms. Ana Cruz",
      description: "Student records and enrollment",
      email: "registrar@southville8bnhs.edu.ph",
      contactNumber: "(02) 8123-4571",
    },
  ])

  // FAQ State
  const [faqs, setFaqs] = useState([
    {
      id: "1",
      question: "What are the enrollment requirements?",
      answer: "Students need to submit Form 138, birth certificate, and 2x2 ID photos.",
    },
    {
      id: "2",
      question: "What time does school start?",
      answer: "Classes begin at 7:30 AM and end at 4:30 PM.",
    },
  ])

  // Virtual Campus Tour State
  const [tourLocations, setTourLocations] = useState([
    {
      id: "1",
      name: "Main Building",
      description: "Administrative offices and faculty rooms",
      image: "/placeholder.svg?width=600&height=400&text=Main+Building",
      image360: "", // Added 360 image field
      hotspots: [
        { id: "h1", x: 30, y: 40, label: "Principal's Office" },
        { id: "h2", x: 70, y: 60, label: "Faculty Lounge" },
      ],
    },
    {
      id: "2",
      name: "Science Laboratory",
      description: "Fully equipped labs for physics, chemistry, and biology",
      image: "/placeholder.svg?width=600&height=400&text=Science+Lab",
      image360: "", // Added 360 image field
      hotspots: [
        { id: "h3", x: 25, y: 35, label: "Chemistry Station" },
        { id: "h4", x: 75, y: 45, label: "Microscope Area" },
      ],
    },
    {
      id: "3",
      name: "Library",
      description: "Quiet study spaces and extensive book collection",
      image: "/placeholder.svg?width=600&height=400&text=Library",
      image360: "", // Added 360 image field
      hotspots: [
        { id: "h5", x: 40, y: 30, label: "Reading Area" },
        { id: "h6", x: 60, y: 70, label: "Computer Section" },
      ],
    },
  ])

  const [isSaving, setIsSaving] = useState(false)

  // Add new department
  const addDepartment = () => {
    const newDept = {
      id: Date.now().toString(),
      office: "",
      name: "",
      description: "",
      email: "",
      contactNumber: "",
    }
    setDepartments([...departments, newDept])
  }

  // Remove department
  const removeDepartment = (id: string) => {
    setDepartments(departments.filter((dept) => dept.id !== id))
  }

  // Update department
  const updateDepartment = (id: string, field: string, value: string) => {
    setDepartments(departments.map((dept) => (dept.id === id ? { ...dept, [field]: value } : dept)))
  }

  // Add new FAQ
  const addFaq = () => {
    const newFaq = {
      id: Date.now().toString(),
      question: "",
      answer: "",
    }
    setFaqs([...faqs, newFaq])
  }

  // Remove FAQ
  const removeFaq = (id: string) => {
    setFaqs(faqs.filter((faq) => faq.id !== id))
  }

  // Update FAQ
  const updateFaq = (id: string, field: string, value: string) => {
    setFaqs(faqs.map((faq) => (faq.id === id ? { ...faq, [field]: value } : faq)))
  }

  // Virtual Tour Management Functions
  const addTourLocation = () => {
    const newLocation = {
      id: Date.now().toString(),
      name: "",
      description: "",
      image: "",
      image360: "", // Added 360 image field to new locations
      hotspots: [],
    }
    setTourLocations([...tourLocations, newLocation])
  }

  const removeTourLocation = (id: string) => {
    setTourLocations(tourLocations.filter((loc) => loc.id !== id))
  }

  const updateTourLocation = (id: string, field: string, value: string) => {
    setTourLocations(tourLocations.map((loc) => (loc.id === id ? { ...loc, [field]: value } : loc)))
  }

  const handle360Upload = async (locationId: string, file: File) => {
    console.log("[v0] 360° file selected:", file.name, file.type, file.size)

    // TODO: Connect your file upload logic here
    // Example:
    // const formData = new FormData()
    // formData.append('file', file)
    // const response = await fetch('/api/upload-360', { method: 'POST', body: formData })
    // const { url } = await response.json()
    // updateTourLocation(locationId, "image360", url)

    // For now, create a temporary preview URL
    const previewUrl = URL.createObjectURL(file)
    updateTourLocation(locationId, "image360", previewUrl)

    alert(`File selected: ${file.name}\n\nConnect your upload handler in handle360Upload() function`)
  }

  const handleImageUpload = async (locationId: string, file: File) => {
    console.log("[v0] Image file selected:", file.name, file.type, file.size)

    // TODO: Connect your file upload logic here
    const previewUrl = URL.createObjectURL(file)
    updateTourLocation(locationId, "image", previewUrl)

    alert(`File selected: ${file.name}\n\nConnect your upload handler in handleImageUpload() function`)
  }

  const addHotspot = (locationId: string) => {
    setTourLocations(
      tourLocations.map((loc) => {
        if (loc.id === locationId) {
          const newHotspot = {
            id: `h${Date.now()}`,
            x: 50,
            y: 50,
            label: "",
          }
          return { ...loc, hotspots: [...loc.hotspots, newHotspot] }
        }
        return loc
      }),
    )
  }

  const removeHotspot = (locationId: string, hotspotId: string) => {
    setTourLocations(
      tourLocations.map((loc) => {
        if (loc.id === locationId) {
          return { ...loc, hotspots: loc.hotspots.filter((h) => h.id !== hotspotId) }
        }
        return loc
      }),
    )
  }

  const updateHotspot = (locationId: string, hotspotId: string, field: string, value: string | number) => {
    setTourLocations(
      tourLocations.map((loc) => {
        if (loc.id === locationId) {
          return {
            ...loc,
            hotspots: loc.hotspots.map((h) => (h.id === hotspotId ? { ...h, [field]: value } : h)),
          }
        }
        return loc
      }),
    )
  }

  // Save all changes
  const handleSaveAll = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
    alert("Changes saved successfully!")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Static School Pages</h1>
          <p className="text-muted-foreground mt-1">Manage About Us, Contact Information, and Virtual Tour content</p>
        </div>
        <Button onClick={handleSaveAll} disabled={isSaving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      {/* Contact Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Contact Information
          </CardTitle>
          <CardDescription>Basic contact details displayed on the website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                placeholder="(02) 8123-4567"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                placeholder="info@southville8bnhs.edu.ph"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                School Address
              </Label>
              <Textarea
                id="address"
                value={contactInfo.address}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                placeholder="123 Education Street, Barangay 8B..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="officeHours" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Office Hours
              </Label>
              <Input
                id="officeHours"
                value={contactInfo.officeHours}
                onChange={(e) => setContactInfo({ ...contactInfo, officeHours: e.target.value })}
                placeholder="Monday - Friday: 7:00 AM - 5:00 PM"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Contact Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Quick Contact
          </CardTitle>
          <CardDescription>Emergency and general inquiry contact details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyHotline" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Emergency Hotline
              </Label>
              <Input
                id="emergencyHotline"
                value={contactInfo.emergencyHotline}
                onChange={(e) => setContactInfo({ ...contactInfo, emergencyHotline: e.target.value })}
                placeholder="(02) 8123-4568"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="generalInquiries" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                General Inquiries Email
              </Label>
              <Input
                id="generalInquiries"
                type="email"
                value={contactInfo.generalInquiries}
                onChange={(e) => setContactInfo({ ...contactInfo, generalInquiries: e.target.value })}
                placeholder="inquiries@southville8bnhs.edu.ph"
                className="mt-1"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="responseTime" className="flex items-center gap-2">
                <Timer className="w-4 h-4" />
                Response Time
              </Label>
              <Input
                id="responseTime"
                value={contactInfo.responseTime}
                onChange={(e) => setContactInfo({ ...contactInfo, responseTime: e.target.value })}
                placeholder="24-48 hours"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Contacts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Department Contacts
              </CardTitle>
              <CardDescription>School departments and their contact information</CardDescription>
            </div>
            <Button onClick={addDepartment} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {departments.map((dept, index) => (
            <div key={dept.id} className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Department {index + 1}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDepartment(dept.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Office Name</Label>
                  <Input
                    value={dept.office}
                    onChange={(e) => updateDepartment(dept.id, "office", e.target.value)}
                    placeholder="Principal's Office"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Contact Person</Label>
                  <Input
                    value={dept.name}
                    onChange={(e) => updateDepartment(dept.id, "name", e.target.value)}
                    placeholder="Dr. Maria Santos"
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={dept.description}
                    onChange={(e) => updateDepartment(dept.id, "description", e.target.value)}
                    placeholder="School administration and general inquiries"
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={dept.email}
                    onChange={(e) => updateDepartment(dept.id, "email", e.target.value)}
                    placeholder="principal@southville8bnhs.edu.ph"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Contact Number</Label>
                  <Input
                    value={dept.contactNumber}
                    onChange={(e) => updateDepartment(dept.id, "contactNumber", e.target.value)}
                    placeholder="(02) 8123-4570"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          ))}

          {departments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No departments added yet. Click "Add Department" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Common questions and answers for website visitors</CardDescription>
            </div>
            <Button onClick={addFaq} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">FAQ {index + 1}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFaq(faq.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Question</Label>
                  <Input
                    value={faq.question}
                    onChange={(e) => updateFaq(faq.id, "question", e.target.value)}
                    placeholder="What are the enrollment requirements?"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Answer</Label>
                  <Textarea
                    value={faq.answer}
                    onChange={(e) => updateFaq(faq.id, "answer", e.target.value)}
                    placeholder="Students need to submit Form 138, birth certificate..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}

          {faqs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <HelpCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No FAQs added yet. Click "Add FAQ" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Virtual Campus Tour Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Virtual Campus Tour
              </CardTitle>
              <CardDescription>
                Manage interactive tour locations with 360° panoramic images and hotspots
              </CardDescription>
            </div>
            <Button onClick={addTourLocation} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {tourLocations.map((location, index) => (
            <div key={location.id} className="border border-border rounded-lg p-6 space-y-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-base">
                  <MapPin className="w-4 h-4 mr-1" />
                  Location {index + 1}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTourLocation(location.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Location Details */}
              <div className="space-y-4">
                <div>
                  <Label>Location Name</Label>
                  <Input
                    value={location.name}
                    onChange={(e) => updateTourLocation(location.id, "name", e.target.value)}
                    placeholder="Main Building"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={location.description}
                    onChange={(e) => updateTourLocation(location.id, "description", e.target.value)}
                    placeholder="Administrative offices and faculty rooms"
                    className="mt-1"
                    rows={2}
                  />
                </div>

                <Tabs defaultValue="360" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="360" className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      360° Panoramic Image
                    </TabsTrigger>
                    <TabsTrigger value="regular" className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Regular Image
                    </TabsTrigger>
                  </TabsList>

                  {/* 360° Image Upload Tab */}
                  <TabsContent value="360" className="space-y-4 mt-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-6 bg-background">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-primary" />
                        </div>

                        <div className="text-center space-y-2">
                          <h4 className="font-semibold text-foreground">Upload 360° Panoramic Image</h4>
                          <p className="text-sm text-muted-foreground max-w-md">
                            Upload a 360° panoramic image (equirectangular format) for immersive virtual tour experience
                          </p>
                        </div>

                        {/* File Upload Input */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => {
                              const input = document.createElement("input")
                              input.type = "file"
                              input.accept = "image/*"
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (file) handle360Upload(location.id, file)
                              }
                              input.click()
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </Button>

                          {location.image360 && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                // TODO: Connect preview functionality
                                alert("Preview 360° image: " + location.image360)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        {/* Current 360° Image Display */}
                        {location.image360 && (
                          <div className="w-full max-w-md">
                            <div className="bg-muted rounded-lg p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                                  <Camera className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">360° Image Uploaded</p>
                                  <p className="text-xs text-muted-foreground truncate">{location.image360}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateTourLocation(location.id, "image360", "")}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Alternative: URL Input */}
                        <div className="w-full max-w-md">
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">Or use URL</span>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <div className="flex-1">
                              <Input
                                value={location.image360}
                                onChange={(e) => updateTourLocation(location.id, "image360", e.target.value)}
                                placeholder="https://example.com/360-image.jpg"
                                className="w-full"
                              />
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              disabled={!location.image360}
                              onClick={() => {
                                if (location.image360) {
                                  window.open(location.image360, "_blank")
                                }
                              }}
                            >
                              <Link2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Info Box */}
                        <div className="w-full max-w-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                360° Image Requirements
                              </p>
                              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                                <li>Use equirectangular format (2:1 aspect ratio)</li>
                                <li>Recommended resolution: 4096x2048 or higher</li>
                                <li>Supported formats: JPG, PNG</li>
                                <li>File size: Under 10MB for best performance</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Regular Image Upload Tab */}
                  <TabsContent value="regular" className="space-y-4 mt-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-6 bg-background">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-primary" />
                        </div>

                        <div className="text-center space-y-2">
                          <h4 className="font-semibold text-foreground">Upload Preview Image</h4>
                          <p className="text-sm text-muted-foreground max-w-md">
                            Upload a regular preview image for location thumbnail
                          </p>
                        </div>

                        {/* File Upload Input */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                          <Button
                            variant="outline"
                            className="flex-1 bg-transparent"
                            onClick={() => {
                              const input = document.createElement("input")
                              input.type = "file"
                              input.accept = "image/*"
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (file) handleImageUpload(location.id, file)
                              }
                              input.click()
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Choose File
                          </Button>

                          {location.image && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                window.open(location.image, "_blank")
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        {/* Current Image Preview */}
                        {location.image && (
                          <div className="w-full max-w-md">
                            <div className="relative rounded-lg overflow-hidden border border-border">
                              <img
                                src={location.image || "/placeholder.svg"}
                                alt={location.name}
                                className="w-full h-48 object-cover"
                              />
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => updateTourLocation(location.id, "image", "")}
                                className="absolute top-2 right-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Alternative: URL Input */}
                        <div className="w-full max-w-md">
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">Or use URL</span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <Input
                              value={location.image}
                              onChange={(e) => updateTourLocation(location.id, "image", e.target.value)}
                              placeholder="https://example.com/image.jpg"
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Hotspots Management */}
              <div className="border-t border-border pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <Label className="flex items-center gap-2 text-base">
                    <Navigation className="w-4 h-4" />
                    Interactive Hotspots
                    <Badge variant="secondary" className="ml-2">
                      {location.hotspots.length}
                    </Badge>
                  </Label>
                  <Button onClick={() => addHotspot(location.id)} size="sm" variant="outline">
                    <Plus className="w-3 h-3 mr-1" />
                    Add Hotspot
                  </Button>
                </div>

                {location.hotspots.length > 0 ? (
                  <div className="space-y-3">
                    {location.hotspots.map((hotspot, hIndex) => (
                      <div key={hotspot.id} className="bg-background rounded-lg p-4 border border-border">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="text-xs">
                            Hotspot {hIndex + 1}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHotspot(location.id, hotspot.id)}
                            className="text-red-500 hover:text-red-700 h-7 w-7 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs">Label</Label>
                            <Input
                              value={hotspot.label}
                              onChange={(e) => updateHotspot(location.id, hotspot.id, "label", e.target.value)}
                              placeholder="Principal's Office"
                              className="mt-1 h-9"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">X Position (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={hotspot.x}
                              onChange={(e) => updateHotspot(location.id, hotspot.id, "x", Number(e.target.value))}
                              placeholder="50"
                              className="mt-1 h-9"
                            />
                          </div>

                          <div>
                            <Label className="text-xs">Y Position (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={hotspot.y}
                              onChange={(e) => updateHotspot(location.id, hotspot.id, "y", Number(e.target.value))}
                              placeholder="50"
                              className="mt-1 h-9"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground bg-background rounded-lg border border-dashed border-border">
                    <Navigation className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No hotspots added yet. Click "Add Hotspot" to create interactive points.</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {tourLocations.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Camera className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium mb-1">No tour locations added yet</p>
              <p className="text-sm">Click "Add Location" to create your first virtual tour stop.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end">
        <Button onClick={handleSaveAll} disabled={isSaving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save All Changes"}
        </Button>
      </div>
    </div>
  )
}
