# News System - Frontend Integration Guide

Complete guide for integrating the News/Journalism system into the Next.js frontend.

---

## Table of Contents

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Tiptap Editor Integration](#tiptap-editor-integration)
4. [API Endpoints](#api-endpoints)
5. [Component Architecture](#component-architecture)
6. [Workflow Implementation](#workflow-implementation)
7. [Image Upload](#image-upload)
8. [State Management](#state-management)
9. [UI/UX Guidelines](#uiux-guidelines)
10. [Example Code](#example-code)

---

## Overview

The News System provides a complete journalism/publishing platform with:

- **Dual content storage** (ProseMirror JSON + HTML)
- **R2 image upload** for article images
- **Approval workflow** (draft → pending → approved → published)
- **Position-based permissions** (Adviser, Co-Adviser, EIC, Co-EIC, Publisher, Writer, Member)
- **Co-authors support**
- **Dynamic categories and auto-created tags**
- **Public and journalism-only visibility**

---

## Database Setup

### Step 1: Run Migration SQL

Execute the database migration to create all tables and seed data:

```bash
psql -h <supabase-host> -U postgres -d postgres -f news_system_migration.sql
```

This creates:
- `news` table for articles
- `news_categories` table (pre-seeded with 10 categories)
- `tags` table (auto-created on use)
- `news_co_authors` junction table
- `news_approval` approval history table
- `news_tags` junction table
- Journalism domain with 7 positions
- Permissions and role assignments

### Step 2: Apply RLS Policies

Execute the RLS policies for database-level security:

```bash
psql -h <supabase-host> -U postgres -d postgres -f news_system_rls_policies.sql
```

### Step 3: Verify Setup

Check that tables exist:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'news%';
```

---

## Tiptap Editor Integration

### Dual Storage: JSON + HTML

The news system requires **both** ProseMirror JSON (for editing) and HTML (for display).

#### Update TiptapEditor Component

Location: `frontend-nextjs/components/editor/TiptapEditor.tsx` (or wherever your Tiptap component is)

**Key Changes:**

1. **Export both JSON and HTML** on content change
2. **Upload images to R2** instead of using base64

```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useState } from 'react';

interface TiptapEditorProps {
  initialContent?: object; // ProseMirror JSON
  onChange: (json: object, html: string) => void; // Pass BOTH
  editable?: boolean;
}

export function TiptapEditor({ initialContent, onChange, editable = true }: TiptapEditorProps) {
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: false, // Disable base64, force R2 URLs
      }),
    ],
    content: initialContent || {},
    editable,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON(); // ProseMirror JSON
      const html = editor.getHTML(); // Rendered HTML
      onChange(json, html); // Pass BOTH to parent
    },
  });

  // Image upload handler (see next section)
  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:3000/api/v1/news/upload-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAccessToken()}`, // Your auth token
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      return data.url; // R2 public URL
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Add image from file input
  const addImageFromFile = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const url = await handleImageUpload(file);
        editor?.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        alert('Failed to upload image');
      }
    };
    input.click();
  };

  return (
    <div className="tiptap-editor border rounded-lg p-4">
      {/* Toolbar */}
      <div className="border-b pb-2 mb-2 flex gap-2">
        <button onClick={() => editor?.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button onClick={addImageFromFile} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Add Image'}
        </button>
        {/* Add more toolbar buttons */}
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}

// Helper to get access token (adjust based on your auth)
function getAccessToken(): string {
  // Example: from localStorage, Zustand store, or Supabase client
  return localStorage.getItem('supabase_access_token') || '';
}
```

---

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Authentication

All authenticated endpoints require:
```
Authorization: Bearer <supabase-jwt-token>
```

### Public Endpoints (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/news/public` | Get all published public articles |
| GET | `/news/public/slug/:slug` | Get article by slug (public) |
| GET | `/news-categories/public` | Get all categories |

**Example:**
```typescript
// Get published articles
const response = await fetch('http://localhost:3000/api/v1/news/public?limit=10&offset=0');
const articles = await response.json();
```

### Article Management (Authenticated)

| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| POST | `/news` | Create article | Publishing positions only |
| GET | `/news` | Get articles with filters | All authenticated |
| GET | `/news/my-articles` | Get current user's articles | All authenticated |
| GET | `/news/pending-approval` | Get pending articles | Advisers only |
| GET | `/news/:id` | Get article by ID | Based on visibility |
| PATCH | `/news/:id` | Update article | Author (draft/pending) or Advisers |
| DELETE | `/news/:id` | Soft delete article | Author (drafts only) or Advisers |

**Example: Create Article**
```typescript
const createArticle = async (articleData: {
  title: string;
  articleJson: object;
  articleHtml: string;
  categoryId: string;
  tags?: string[];
  featuredImageUrl?: string;
  description?: string;
  visibility: 'public' | 'journalism';
}) => {
  const response = await fetch('http://localhost:3000/api/v1/news', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(articleData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
};
```

### Approval Workflow (Authenticated)

| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| POST | `/news/:id/submit` | Submit for approval | Author only |
| POST | `/news/:id/approve` | Approve article | Advisers only |
| POST | `/news/:id/reject` | Reject article | Advisers only |
| POST | `/news/:id/publish` | Publish article | Advisers only |
| GET | `/news/:id/approval-history` | Get approval history | Author, co-authors, Advisers |

**Example: Submit for Approval**
```typescript
const submitForApproval = async (articleId: string) => {
  const response = await fetch(`http://localhost:3000/api/v1/news/${articleId}/submit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!response.ok) throw new Error('Failed to submit');
  return response.json();
};
```

**Example: Approve Article (Advisers)**
```typescript
const approveArticle = async (articleId: string, remarks?: string) => {
  const response = await fetch(`http://localhost:3000/api/v1/news/${articleId}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ remarks }),
  });

  if (!response.ok) throw new Error('Failed to approve');
  return response.json();
};
```

### Image Upload (Authenticated)

| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| POST | `/news/upload-image` | Upload image for Tiptap | All authenticated |

**Example:**
```typescript
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('http://localhost:3000/api/v1/news/upload-image', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error('Upload failed');

  const data = await response.json();
  // Returns: { url: string, fileName: string, fileSize: number }
  return data.url;
};
```

### Categories (Authenticated)

| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| POST | `/news-categories` | Create category | Advisers only |
| GET | `/news-categories` | Get all categories | All authenticated |
| GET | `/news-categories/:id` | Get category by ID | All authenticated |
| PATCH | `/news-categories/:id` | Update category | Advisers only |
| DELETE | `/news-categories/:id` | Delete category | Advisers only |

---

## Component Architecture

Suggested component structure for the frontend:

```
app/
├── student/
│   └── publisher/                    # Student journalism portal
│       ├── page.tsx                  # Publisher dashboard
│       ├── articles/
│       │   ├── page.tsx              # List my articles
│       │   ├── new/
│       │   │   └── page.tsx          # Create new article
│       │   └── [id]/
│       │       ├── page.tsx          # View article
│       │       └── edit/
│       │           └── page.tsx      # Edit article
│       └── drafts/
│           └── page.tsx              # My draft articles
│
├── teacher/
│   └── journalism/                   # Teacher journalism portal
│       ├── page.tsx                  # Adviser dashboard
│       ├── pending/
│       │   └── page.tsx              # Pending approval articles
│       ├── articles/
│       │   └── page.tsx              # All articles (manage)
│       └── categories/
│           └── page.tsx              # Manage categories
│
└── guess/
    └── news/
        ├── page.tsx                  # Public news listing
        └── [slug]/
            └── page.tsx              # Public article view

components/
├── news/
│   ├── NewsEditor.tsx                # Tiptap editor wrapper
│   ├── ArticleCard.tsx               # Article preview card
│   ├── ArticleList.tsx               # List of articles
│   ├── ArticleForm.tsx               # Create/Edit form
│   ├── ApprovalPanel.tsx             # Approval workflow UI
│   ├── CategorySelect.tsx            # Category dropdown
│   ├── TagInput.tsx                  # Tag input (auto-complete)
│   └── StatusBadge.tsx               # Article status badge
│
└── editor/
    └── TiptapEditor.tsx              # Base Tiptap component

lib/
├── api/
│   └── news.ts                       # API client functions
└── stores/
    └── newsStore.ts                  # Zustand store (optional)
```

---

## Workflow Implementation

### Article Creation Flow (Student/Teacher)

```
1. User navigates to "Create Article"
2. Form displays:
   - Title input
   - Category dropdown
   - Tiptap editor (dual storage)
   - Tags input (comma-separated)
   - Featured image upload (optional)
   - Visibility toggle (public/journalism)
   - Description textarea (auto-generated if empty)
3. User writes content in Tiptap
   - Images uploaded to R2 on insert
   - Content saved as both JSON and HTML
4. User clicks "Save Draft"
   - POST /news with status: 'draft'
   - Redirect to drafts list
5. User can later click "Submit for Approval"
   - POST /news/:id/submit
   - Status changes: draft → pending_approval
```

### Approval Flow (Advisers Only)

```
1. Adviser navigates to "Pending Approval"
   - GET /news/pending-approval
2. Adviser reviews article
   - View title, content, author, category
   - See approval history if any
3. Adviser can:
   - Approve: POST /news/:id/approve (with optional remarks)
     → Status: pending_approval → approved
   - Reject: POST /news/:id/reject (with required remarks)
     → Status: pending_approval → rejected (author can re-submit)
4. After approval, Adviser can:
   - Publish: POST /news/:id/publish
     → Status: approved → published
     → Published date set
     → Article visible to public/journalism members
```

### Article States

| Status | Description | Who Can Edit | Who Can View |
|--------|-------------|--------------|--------------|
| `draft` | Initial state | Author | Author, Advisers |
| `pending_approval` | Submitted for review | Advisers only | Author, Advisers |
| `approved` | Approved by Adviser | Advisers only | Author, Advisers |
| `published` | Live and visible | NO ONE (immutable) | Based on visibility |
| `rejected` | Rejected by Adviser | Author can edit & re-submit | Author, Advisers |
| `archived` | Soft deleted | NO ONE | NO ONE |

---

## Image Upload

### Tiptap Image Extension Configuration

```typescript
import Image from '@tiptap/extension-image';

const CustomImage = Image.configure({
  inline: true,
  allowBase64: false, // Force R2 URLs only
  HTMLAttributes: {
    class: 'article-image rounded-lg max-w-full h-auto',
  },
});

// Use in editor
const editor = useEditor({
  extensions: [CustomImage, /* other extensions */],
});
```

### Upload Function

```typescript
const uploadImageToR2 = async (file: File): Promise<string> => {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, GIF, WebP allowed.');
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Image too large. Maximum 10MB allowed.');
  }

  // Upload to backend
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('http://localhost:3000/api/v1/news/upload-image', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  const data = await response.json();
  return data.url; // R2 public URL
};
```

### Featured Image Upload

For featured images, you can use a separate file input:

```typescript
const [featuredImage, setFeaturedImage] = useState<string | null>(null);

const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const url = await uploadImageToR2(file);
    setFeaturedImage(url);
  } catch (error) {
    alert(error.message);
  }
};

// In form
<input
  type="file"
  accept="image/*"
  onChange={handleFeaturedImageUpload}
/>
{featuredImage && <img src={featuredImage} alt="Featured" className="w-32 h-32 object-cover" />}
```

---

## State Management

### Option 1: Zustand Store (Recommended)

```typescript
// lib/stores/newsStore.ts
import { create } from 'zustand';

interface Article {
  id: string;
  title: string;
  slug: string;
  articleJson: object;
  articleHtml: string;
  status: string;
  visibility: string;
  // ... other fields
}

interface NewsStore {
  articles: Article[];
  currentArticle: Article | null;
  isLoading: boolean;
  error: string | null;

  fetchArticles: () => Promise<void>;
  fetchArticle: (id: string) => Promise<void>;
  createArticle: (data: Partial<Article>) => Promise<void>;
  updateArticle: (id: string, data: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  submitForApproval: (id: string) => Promise<void>;
}

export const useNewsStore = create<NewsStore>((set, get) => ({
  articles: [],
  currentArticle: null,
  isLoading: false,
  error: null,

  fetchArticles: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('http://localhost:3000/api/v1/news', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      const data = await response.json();
      set({ articles: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createArticle: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('http://localhost:3000/api/v1/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create article');

      await get().fetchArticles(); // Refresh list
      set({ isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // ... other methods
}));
```

### Option 2: React Query (Alternative)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetch articles
export const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/api/v1/news', {
        headers: { Authorization: `Bearer ${getAccessToken()}` },
      });
      return response.json();
    },
  });
};

// Create article mutation
export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Article>) => {
      const response = await fetch('http://localhost:3000/api/v1/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};
```

---

## UI/UX Guidelines

### Status Colors

```typescript
const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  published: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  archived: 'bg-gray-100 text-gray-500',
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
    {status.replace('_', ' ').toUpperCase()}
  </span>
);
```

### Article Card Component

```typescript
interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    description: string;
    featuredImage: string;
    status: string;
    publishedDate: string | null;
    author: { fullName: string };
    category: { name: string };
  };
}

export const ArticleCard = ({ article }: ArticleCardProps) => (
  <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
    {/* Featured Image */}
    <img
      src={article.featuredImage}
      alt={article.title}
      className="w-full h-48 object-cover"
    />

    <div className="p-4">
      {/* Status and Category */}
      <div className="flex justify-between items-center mb-2">
        <StatusBadge status={article.status} />
        <span className="text-xs text-gray-500">{article.category.name}</span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mb-2">{article.title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {article.description}
      </p>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>By {article.author.fullName}</span>
        {article.publishedDate && (
          <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  </div>
);
```

### Approval Panel (Advisers)

```typescript
export const ApprovalPanel = ({ article }: { article: Article }) => {
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`http://localhost:3000/api/v1/news/${article.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({ remarks }),
      });
      alert('Article approved!');
      // Refresh or redirect
    } catch (error) {
      alert('Failed to approve');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      alert('Remarks required for rejection');
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch(`http://localhost:3000/api/v1/news/${article.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({ remarks }),
      });
      alert('Article rejected');
      // Refresh or redirect
    } catch (error) {
      alert('Failed to reject');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Approval Actions</h3>

      <textarea
        placeholder="Add remarks (optional for approve, required for reject)"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        className="w-full border rounded p-2 mb-4"
        rows={3}
      />

      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={isSubmitting}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          {isSubmitting ? 'Processing...' : 'Approve'}
        </button>
        <button
          onClick={handleReject}
          disabled={isSubmitting}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Reject
        </button>
      </div>
    </div>
  );
};
```

---

## Example Code

### Complete Article Creation Page

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TiptapEditor } from '@/components/editor/TiptapEditor';

export default function CreateArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'journalism'>('public');
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');

  // Tiptap content (dual storage)
  const [articleJson, setArticleJson] = useState<object>({});
  const [articleHtml, setArticleHtml] = useState<string>('');

  // Handle Tiptap content change
  const handleContentChange = (json: object, html: string) => {
    setArticleJson(json);
    setArticleHtml(html);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !categoryId || !articleHtml) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3000/api/v1/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({
          title,
          articleJson,
          articleHtml,
          categoryId,
          tags,
          featuredImageUrl: featuredImage,
          description: description || undefined, // Auto-generated if empty
          visibility,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const article = await response.json();
      alert('Article created successfully!');
      router.push(`/student/publisher/articles/${article.id}`);
    } catch (error) {
      alert(`Failed to create article: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Article</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium mb-2">Category *</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          >
            <option value="">Select category...</option>
            {/* Fetch categories from API and map */}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
          <input
            type="text"
            placeholder="e.g., sports, events, achievements"
            onChange={(e) => setTags(e.target.value.split(',').map(t => t.trim()))}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium mb-2">Visibility</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="public"
                checked={visibility === 'public'}
                onChange={(e) => setVisibility(e.target.value as 'public')}
                className="mr-2"
              />
              Public (everyone)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="journalism"
                checked={visibility === 'journalism'}
                onChange={(e) => setVisibility(e.target.value as 'journalism')}
                className="mr-2"
              />
              Journalism (members only)
            </label>
          </div>
        </div>

        {/* Featured Image (optional) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Featured Image (optional - first article image used if not provided)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const url = await uploadImageToR2(file);
                setFeaturedImage(url);
              }
            }}
            className="w-full"
          />
          {featuredImage && <img src={featuredImage} alt="Featured" className="mt-2 w-32 h-32 object-cover" />}
        </div>

        {/* Description (optional) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description (optional - auto-generated from content if empty)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Brief summary of the article..."
          />
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium mb-2">Content *</label>
          <TiptapEditor onChange={handleContentChange} />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Helper function (define in lib/api/news.ts)
function getAccessToken(): string {
  return localStorage.getItem('supabase_access_token') || '';
}

async function uploadImageToR2(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('http://localhost:3000/api/v1/news/upload-image', {
    method: 'POST',
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: formData,
  });

  if (!response.ok) throw new Error('Upload failed');
  const data = await response.json();
  return data.url;
}
```

---

## Summary Checklist

- [ ] Run `news_system_migration.sql` in Supabase
- [ ] Run `news_system_rls_policies.sql` in Supabase
- [ ] Verify journalism domain and positions exist
- [ ] Update Tiptap component to export both JSON and HTML
- [ ] Implement image upload to R2 endpoint
- [ ] Create article creation form
- [ ] Create article listing pages
- [ ] Implement approval workflow UI (Advisers)
- [ ] Test all permissions (Writer, Publisher, EIC, Adviser)
- [ ] Test visibility (public vs journalism-only)
- [ ] Test approval workflow (submit → approve → publish)
- [ ] Test co-authors functionality
- [ ] Test tags auto-creation
- [ ] Deploy frontend to production

---

## Need Help?

If you encounter issues:

1. Check backend logs: `npm run start:dev` in core-api-layer
2. Check Supabase logs in dashboard
3. Verify RLS policies are enabled: `SELECT * FROM pg_policies WHERE tablename = 'news'`
4. Test API endpoints with Postman/Thunder Client
5. Check Swagger docs at `http://localhost:3000/api/docs`

For questions or bugs, contact the development team or create an issue in the repository.

---

**Version:** 1.0
**Last Updated:** 2025-10-19
**Author:** Claude Code
