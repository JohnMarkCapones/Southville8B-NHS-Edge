"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Save,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useAnnouncementById,
  useUpdateAnnouncement,
} from "@/hooks/useAnnouncements";
import { AnnouncementVisibility } from "@/lib/api/types/announcements";
import { useRoles } from "@/hooks/useRoles";
import {
  validateExpirationDate,
  getVisibilityDuration,
  getMinimumExpirationDate,
  getMaximumExpirationDate,
  getSuggestedExpirationDate,
  type DateValidationResult,
  formatDateTimeLocal,
} from "@/lib/utils/announcement-date-validation";

export default function EditAnnouncementPage() {
  const params = useParams();
  const announcementId = params.id as string;
  const { toast } = useToast();
  const router = useRouter();

  // Fetch existing announcement
  const {
    data: announcement,
    isLoading: loadingAnnouncement,
    error: fetchError,
  } = useAnnouncementById(announcementId);
  const updateMutation = useUpdateAnnouncement();
  const { data: roles, isLoading: rolesLoading } = useRoles();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<
    "urgent" | "academic" | "event" | "general"
  >("general");
  const [expirationDate, setExpirationDate] = useState("");

  // Target audience
  const [targetStudents, setTargetStudents] = useState(false);
  const [targetTeachers, setTargetTeachers] = useState(false);
  const [targetParents, setTargetParents] = useState(false);
  const [targetStaff, setTargetStaff] = useState(false);

  // Date validation state
  const [dateValidation, setDateValidation] = useState<DateValidationResult>({
    isValid: true,
  });

  // UI state
  const [isSaving, setIsSaving] = useState(false);

  // Pre-fill form when announcement loads
  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
      setCategory((announcement.type as any) || "general");

      if (announcement.expiresAt) {
        const expiresDate = new Date(announcement.expiresAt);
        setExpirationDate(formatDateTimeLocal(expiresDate));
      }

      // Set target audience based on roles
      const targetRoleNames =
        announcement.targetRoles?.map((r: any) => r.name) || [];
      setTargetStudents(targetRoleNames.includes("Student"));
      setTargetTeachers(targetRoleNames.includes("Teacher"));
      setTargetParents(targetRoleNames.includes("Parent"));
      setTargetStaff(targetRoleNames.includes("Staff"));
    }
  }, [announcement]);

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for the announcement.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add content to the announcement.",
        variant: "destructive",
      });
      return;
    }

    // Validate expiration date
    if (expirationDate) {
      const validation = validateExpirationDate(expirationDate);
      if (!validation.isValid) {
        toast({
          title: "Invalid Expiration Date",
          description: validation.error || "Please check the expiration date.",
          variant: "destructive",
        });
        return;
      }
    }

    // Build target role IDs array from fetched roles
    const targetRoleIds: string[] = [];
    if (roles) {
      if (targetStudents) {
        const studentRole = roles.find((r) => r.name === "Student");
        if (studentRole) targetRoleIds.push(studentRole.id);
      }
      if (targetTeachers) {
        const teacherRole = roles.find((r) => r.name === "Teacher");
        if (teacherRole) targetRoleIds.push(teacherRole.id);
      }
      if (targetParents) {
        const parentRole = roles.find((r) => r.name === "Parent");
        if (parentRole) targetRoleIds.push(parentRole.id);
      }
      if (targetStaff) {
        const staffRole = roles.find((r) => r.name === "Staff");
        if (staffRole) targetRoleIds.push(staffRole.id);
      }
    }

    if (targetRoleIds.length === 0) {
      toast({
        title: "Target Audience Required",
        description: "Please select at least one target audience.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Transform form data to match backend API schema
      const announcementData = {
        title: title.trim(),
        content: content.trim(),
        type: category,
        visibility: AnnouncementVisibility.PUBLIC,
        targetRoleIds,
        expiresAt: expirationDate || undefined,
      };

      // Update announcement via API
      await updateMutation.mutateAsync({
        id: announcementId,
        data: announcementData,
      });

      toast({
        title: "Announcement Updated!",
        description: `Your announcement "${title}" has been updated successfully.`,
      });

      // Navigate back to announcements list
      router.push("/superadmin/announcements");
    } catch (error: any) {
      console.error("Failed to update announcement:", error);
      toast({
        title: "Failed to Update Announcement",
        description:
          error?.message ||
          "An error occurred while updating the announcement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (loadingAnnouncement || rolesLoading) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading announcement...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (fetchError || !announcement) {
    return (
      <div className="container max-w-7xl mx-auto py-8">
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h2 className="text-2xl font-bold">Announcement Not Found</h2>
              <p className="text-muted-foreground">
                The announcement you're trying to edit could not be found.
              </p>
              <Button onClick={() => router.push("/superadmin/announcements")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Announcements
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Announcement</h1>
            <p className="text-muted-foreground">Update announcement details</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Content */}
          <Card>
            <CardHeader>
              <CardTitle>Announcement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter announcement title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <TiptapEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your announcement content..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Expiration */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule & Expiration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expiration">
                  Expiration Date & Time (Optional)
                </Label>
                <Input
                  id="expiration"
                  type="datetime-local"
                  value={expirationDate}
                  min={getMinimumExpirationDate()}
                  max={getMaximumExpirationDate()}
                  onChange={(e) => {
                    setExpirationDate(e.target.value);
                    const validation = validateExpirationDate(e.target.value);
                    setDateValidation(validation);
                  }}
                  className={
                    dateValidation.severity === "error"
                      ? "border-red-500 focus:border-red-500"
                      : dateValidation.severity === "warning"
                      ? "border-yellow-500 focus:border-yellow-500"
                      : ""
                  }
                />

                {/* Validation Messages */}
                {dateValidation.error && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {dateValidation.error}
                    </p>
                  </div>
                )}

                {dateValidation.warning && !dateValidation.error && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-900/20 dark:border-yellow-800">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      {dateValidation.warning}
                    </p>
                  </div>
                )}

                {/* Duration Preview */}
                {expirationDate && !dateValidation.error && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-800">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {getVisibilityDuration(expirationDate)}
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {!expirationDate
                    ? "Leave empty for no expiration (announcement will be visible indefinitely)"
                    : "Announcement will be hidden after this date"}
                </p>

                {/* Quick Actions */}
                {!expirationDate && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const suggested = getSuggestedExpirationDate();
                      setExpirationDate(suggested);
                      const validation = validateExpirationDate(suggested);
                      setDateValidation(validation);
                    }}
                    className="w-full"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Set to 30 days from now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={category}
                onValueChange={(v: any) => setCategory(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Target Audience */}
          <Card>
            <CardHeader>
              <CardTitle>Target Audience *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="target-students"
                  checked={targetStudents}
                  onCheckedChange={(checked) =>
                    setTargetStudents(checked as boolean)
                  }
                />
                <Label htmlFor="target-students">All Students</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="target-teachers"
                  checked={targetTeachers}
                  onCheckedChange={(checked) =>
                    setTargetTeachers(checked as boolean)
                  }
                />
                <Label htmlFor="target-teachers">All Teachers</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="target-parents"
                  checked={targetParents}
                  onCheckedChange={(checked) =>
                    setTargetParents(checked as boolean)
                  }
                />
                <Label htmlFor="target-parents">Parents</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="target-staff"
                  checked={targetStaff}
                  onCheckedChange={(checked) =>
                    setTargetStaff(checked as boolean)
                  }
                />
                <Label htmlFor="target-staff">Staff</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
