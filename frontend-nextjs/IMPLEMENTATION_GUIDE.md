# Security Implementation Guide

Quick start guide for implementing the security system in your forms and components.

---

## Quick Start

### 1. Install Additional Dependencies (Optional but Recommended)

```bash
cd Southville8B-NHS-Edge/frontend-nextjs
npm install isomorphic-dompurify validator
```

**Note**: You already have all essential dependencies (`zod`, `react-hook-form`, `@hookform/resolvers`)

---

## Usage Examples

### Example 1: Secure Login Form

```tsx
"use client"

import { useSecureForm } from "@/hooks/useSecureForm"
import { studentLoginSchema } from "@/lib/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const form = useSecureForm({
    schema: studentLoginSchema,
    defaultValues: {
      studentId: "",
      password: "",
      rememberMe: false,
    },
    // Optional: Get notified of security threats
    onSecurityThreat: (threats) => {
      console.warn("Security threats detected:", threats)
    },
  })

  const onSubmit = async (data) => {
    // Data is already validated and sanitized!
    console.log("Safe data:", data)

    // Call your API here
    // await loginUser(data)
  }

  return (
    <form onSubmit={form.handleSecureSubmit(onSubmit)} className="space-y-4">
      {/* Student ID */}
      <div>
        <Label htmlFor="studentId">Student ID</Label>
        <Input
          id="studentId"
          {...form.register("studentId")}
          placeholder="S123456"
        />
        {form.formState.errors.studentId && (
          <p className="text-sm text-red-500">
            {form.formState.errors.studentId.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-red-500">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      {/* Remember Me */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="rememberMe"
          {...form.register("rememberMe")}
        />
        <Label htmlFor="rememberMe">Remember me</Label>
      </div>

      {/* Submit Error */}
      {form.submitError && (
        <p className="text-sm text-red-500">{form.submitError}</p>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={form.isSubmitting}
        className="w-full"
      >
        {form.isSubmitting ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}
```

---

### Example 2: File Upload with Validation

```tsx
"use client"

import { useState } from "react"
import { validateDocument, sanitizeFilename } from "@/lib/validation"
import { Button } from "@/components/ui/button"

export function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setError(null)

    // Validate file with magic number check
    const validation = await validateDocument(selectedFile)

    if (!validation.valid) {
      setError(validation.error || "Invalid file")
      setFile(null)
      return
    }

    // Sanitize filename
    const safeName = sanitizeFilename(selectedFile.name)
    const safeFile = new File([selectedFile], safeName, { type: selectedFile.type })

    setFile(safeFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    try {
      // Upload logic here
      console.log("Uploading:", file.name)
      // await uploadFile(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.docx,.doc,.pptx,.ppt"
        className="block w-full"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      {file && (
        <p className="text-sm text-green-500">
          File selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? "Uploading..." : "Upload Document"}
      </Button>
    </div>
  )
}
```

---

### Example 3: Secure Tiptap Editor (Comments)

```tsx
"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Button } from "@/components/ui/button"
import {
  sanitizeTiptapContent,
  checkTiptapContentSecurity,
  getSecureLinkOptions,
  getSecureImageOptions,
  MAX_COMMENT_LENGTH,
} from "@/lib/security"

export function SecureCommentEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure(getSecureLinkOptions()),
      Image.configure(getSecureImageOptions()),
    ],
    content: "<p>Write your comment...</p>",
  })

  const handleSubmit = () => {
    if (!editor) return

    const html = editor.getHTML()

    // Check security
    const security = checkTiptapContentSecurity(html)
    if (!security.safe) {
      alert("Your comment contains unsafe content: " + security.threats.join(", "))
      return
    }

    // Sanitize content
    const sanitized = sanitizeTiptapContent(html)

    // Check length (plain text)
    const text = editor.getText()
    if (text.length > MAX_COMMENT_LENGTH) {
      alert(`Comment is too long. Maximum ${MAX_COMMENT_LENGTH} characters.`)
      return
    }

    // Submit
    console.log("Safe comment:", sanitized)
    // await submitComment(sanitized)
  }

  return (
    <div className="space-y-4">
      <EditorContent
        editor={editor}
        className="prose max-w-none border rounded-lg p-4 min-h-[200px]"
      />

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          {editor?.getText().length || 0} / {MAX_COMMENT_LENGTH} characters
        </p>

        <Button onClick={handleSubmit}>
          Post Comment
        </Button>
      </div>
    </div>
  )
}
```

---

### Example 4: Student Registration Form

```tsx
"use client"

import { useSecureForm } from "@/hooks/useSecureForm"
import { studentRegistrationSchema } from "@/lib/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function StudentRegistrationForm() {
  const form = useSecureForm({
    schema: studentRegistrationSchema,
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      birthdate: new Date(),
      gender: "prefer_not_to_say",
      email: "",
      phone: "",
      studentId: "",
      gradeLevel: 7,
      section: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
      privacyAccepted: false,
      parentalConsent: false,
    },
  })

  const onSubmit = async (data) => {
    console.log("Validated registration data:", data)
    // await registerStudent(data)
  }

  return (
    <form onSubmit={form.handleSecureSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" {...form.register("firstName")} />
          {form.formState.errors.firstName && (
            <p className="text-sm text-red-500">
              {form.formState.errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="middleName">Middle Name</Label>
          <Input id="middleName" {...form.register("middleName")} />
        </div>

        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" {...form.register("lastName")} />
          {form.formState.errors.lastName && (
            <p className="text-sm text-red-500">
              {form.formState.errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">School Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="student@student.southville8b.edu.ph"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="09XXXXXXXXX"
            {...form.register("phone")}
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-red-500">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {/* Consent Checkboxes */}
      <div className="space-y-3">
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="termsAccepted"
            {...form.register("termsAccepted")}
            className="mt-1"
          />
          <Label htmlFor="termsAccepted" className="font-normal">
            I accept the Terms and Conditions *
          </Label>
        </div>
        {form.formState.errors.termsAccepted && (
          <p className="text-sm text-red-500">
            {form.formState.errors.termsAccepted.message}
          </p>
        )}

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="privacyAccepted"
            {...form.register("privacyAccepted")}
            className="mt-1"
          />
          <Label htmlFor="privacyAccepted" className="font-normal">
            I accept the Privacy Policy *
          </Label>
        </div>

        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="parentalConsent"
            {...form.register("parentalConsent")}
            className="mt-1"
          />
          <Label htmlFor="parentalConsent" className="font-normal">
            Parental/Guardian consent provided *
          </Label>
        </div>
      </div>

      {/* Submit */}
      {form.submitError && (
        <p className="text-sm text-red-500">{form.submitError}</p>
      )}

      <Button
        type="submit"
        disabled={form.isSubmitting}
        className="w-full"
        size="lg"
      >
        {form.isSubmitting ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  )
}
```

---

## Available Validation Schemas

Import from `@/lib/validation`:

### Authentication
- `studentLoginSchema`
- `teacherLoginSchema`
- `parentLoginSchema`
- `emailLoginSchema`
- `studentRegistrationSchema`
- `teacherRegistrationSchema`
- `passwordResetSchema`
- `changePasswordSchema`

### Profile
- `studentProfileUpdateSchema`
- `teacherProfileUpdateSchema`
- `emergencyContactSchema`
- `addressSchema`
- `notificationPreferencesSchema`
- `privacySettingsSchema`
- `appearancePreferencesSchema`

### Academic
- `assignmentSubmissionSchema`
- `assignmentCreationSchema`
- `gradeEntrySchema`
- `quizCreationSchema`
- `quizSubmissionSchema`
- `courseEnrollmentSchema`
- `announcementSchema`
- `teacherCommentSchema`

### File Upload
- `documentFileSchema`
- `imageFileSchema`
- `avatarFileSchema`
- `multipleFilesSchema`

### Common
- `safeString()` - Configurable safe string
- `emailSchema` - Email validation
- `schoolEmailSchema` - School email only
- `phoneSchema` - Philippine phone numbers
- `urlSchema` - Safe URL validation
- `passwordSchema` - Strong password
- `studentIdSchema` - Student ID format
- `teacherIdSchema` - Teacher ID format
- And many more...

---

## Available Security Functions

Import from `@/lib/security`:

### String Sanitization
- `sanitizeString(input)` - Remove HTML/scripts
- `sanitizeHtml(html)` - Allow safe HTML only
- `escapeHtml(text)` - Escape special chars
- `sanitizeUrl(url)` - Prevent XSS URLs
- `sanitizeFilename(name)` - Safe filenames
- `sanitizeSearchQuery(query)` - Safe search

### Tiptap Security
- `sanitizeTiptapContent(html)` - Sanitize editor HTML
- `checkTiptapContentSecurity(content)` - Detect threats
- `validateTiptapLink(url)` - Validate links
- `sanitizeComment(content)` - Sanitize comments
- `getSecureLinkOptions()` - Secure link config
- `getSecureImageOptions()` - Secure image config

### Threat Detection
- `detectXss(input)` - Detect XSS attempts
- `detectSqlInjection(input)` - Detect SQL injection
- `detectHomographAttack(text)` - Detect unicode attacks

### File Validation
- `validateDocument(file)` - Async doc validation
- `validateImage(file)` - Async image validation
- `validateAvatar(file)` - Async avatar validation
- `verifyFileType(file)` - Magic number check

---

## Next Steps

1. **Update your existing login form** (`app/guess/login/page.tsx`):
   - Replace with secure form implementation
   - Add validation schema
   - Test with XSS payloads

2. **Add security to all forms**:
   - Registration forms
   - Profile update forms
   - Assignment submission forms
   - Comment forms

3. **Implement file uploads**:
   - Add validation to file inputs
   - Use magic number verification
   - Sanitize filenames

4. **Configure Tiptap securely**:
   - Use secure link/image options
   - Sanitize on paste and submit
   - Add content length limits

5. **Add Next.js security headers**:
   - Edit `next.config.js`
   - Add CSP, X-Frame-Options, etc.
   - See `SECURITY_PLAN.md` section 8

6. **Test security**:
   - Try XSS payloads: `<script>alert('xss')</script>`
   - Try SQL injection: `' OR '1'='1`
   - Try path traversal: `../../etc/passwd`
   - Try malicious file uploads

---

## Common Patterns

### Pattern 1: Form with Custom Validation

```tsx
const form = useSecureForm({
  schema: mySchema.refine(
    (data) => data.password === data.confirmPassword,
    { message: "Passwords must match", path: ["confirmPassword"] }
  ),
  defaultValues: {...}
})
```

### Pattern 2: Async Validation (Username Availability)

```tsx
const schema = z.object({
  username: z.string()
    .min(3)
    .refine(async (username) => {
      const available = await checkUsername(username)
      return available
    }, "Username is already taken")
})
```

### Pattern 3: Conditional Validation

```tsx
const schema = z.object({
  userType: z.enum(["student", "teacher"]),
  studentId: z.string().optional(),
  teacherId: z.string().optional(),
}).refine(
  (data) => {
    if (data.userType === "student") return !!data.studentId
    if (data.userType === "teacher") return !!data.teacherId
    return true
  },
  { message: "ID is required for your user type" }
)
```

---

## Troubleshooting

**Q: Form validation not working?**
A: Make sure you're using `form.register()` on all inputs and `form.handleSecureSubmit()` on the form.

**Q: Sanitization removing valid content?**
A: Adjust the sanitization options or use `sanitize: false` in `useSecureForm` options.

**Q: File upload validation failing?**
A: Check file type, size, and magic number. Enable `checkMagicNumber: false` if needed.

**Q: Tiptap content being stripped?**
A: Check `ALLOWED_TIPTAP_TAGS` and adjust if you need more tags.

---

For detailed security information, see **`SECURITY_PLAN.md`**
