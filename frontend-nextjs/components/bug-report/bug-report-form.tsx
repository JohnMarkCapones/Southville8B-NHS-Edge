"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bug, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const bugReportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  stepsToReproduce: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]),
  userEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  userName: z.string().optional(),
});

type BugReportFormData = z.infer<typeof bugReportSchema>;

export function BugReportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [browserInfo, setBrowserInfo] = useState("");

  useEffect(() => {
    // Capture browser info on client side
    if (typeof window !== "undefined") {
      setBrowserInfo(navigator.userAgent);
    }
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BugReportFormData>({
    resolver: zodResolver(bugReportSchema),
    defaultValues: {
      severity: "medium",
    },
  });

  const onSubmit = async (data: BugReportFormData) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/bug-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
          browser: browserInfo,
          userRole: "User", // You can enhance this to get actual user role from auth
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit bug report");
      }

      setSubmitStatus("success");
      reset();
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === "success") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-700 dark:text-green-400 mb-2">
              Bug Report Submitted!
            </h3>
            <p className="text-muted-foreground mb-6">
              Thank you for helping us improve. Our development team will review your report shortly.
            </p>
            <Button onClick={() => setSubmitStatus("idle")} variant="outline">
              Submit Another Report
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-school-blue" />
          Report a Bug
        </CardTitle>
        <CardDescription>
          Found something wrong? Help us fix it by providing details below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Bug Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Bug Title *</Label>
            <Input
              id="title"
              placeholder="Brief description of the issue"
              {...register("title")}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label htmlFor="severity">Severity *</Label>
            <Select
              onValueChange={(value) => setValue("severity", value as "low" | "medium" | "high" | "critical")}
              defaultValue="medium"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Low - Minor issue, doesn&apos;t affect functionality
                  </span>
                </SelectItem>
                <SelectItem value="medium">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Medium - Affects some functionality
                  </span>
                </SelectItem>
                <SelectItem value="high">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500" />
                    High - Major feature broken
                  </span>
                </SelectItem>
                <SelectItem value="critical">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Critical - System unusable
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what happened and what you expected to happen..."
              rows={4}
              {...register("description")}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Steps to Reproduce */}
          <div className="space-y-2">
            <Label htmlFor="stepsToReproduce">Steps to Reproduce (Optional)</Label>
            <Textarea
              id="stepsToReproduce"
              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
              rows={3}
              {...register("stepsToReproduce")}
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Your Name (Optional)</Label>
              <Input
                id="userName"
                placeholder="John Doe"
                {...register("userName")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userEmail">Your Email (Optional)</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="your@email.com"
                {...register("userEmail")}
                className={errors.userEmail ? "border-red-500" : ""}
              />
              {errors.userEmail && (
                <p className="text-sm text-red-500">{errors.userEmail.message}</p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {submitStatus === "error" && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-school-blue hover:bg-school-blue/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Sending Report...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Bug Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
