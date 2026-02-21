# Club Forms Integration Plan

## Overview
The backend API for club forms is **fully implemented** and ready. We need to connect the frontend form builder UI to the real API endpoints to enable teachers to create custom application forms for their clubs.

---

## Backend API Summary

### Base URL
```
/api/v1/clubs/:clubId/forms
```

### Available Endpoints

#### Form Management
- **POST** `/api/v1/clubs/:clubId/forms` - Create new form
- **GET** `/api/v1/clubs/:clubId/forms` - Get all forms for club
- **GET** `/api/v1/clubs/:clubId/forms/:formId` - Get form with questions
- **PATCH** `/api/v1/clubs/:clubId/forms/:formId` - Update form
- **DELETE** `/api/v1/clubs/:clubId/forms/:formId` - Delete form

#### Question Management
- **POST** `/api/v1/clubs/:clubId/forms/:formId/questions` - Add question
- **PATCH** `/api/v1/clubs/:clubId/forms/:formId/questions/:questionId` - Update question
- **DELETE** `/api/v1/clubs/:clubId/forms/:formId/questions/:questionId` - Delete question

#### Response Management
- **POST** `/api/v1/clubs/:clubId/forms/:formId/responses` - Submit response (student)
- **GET** `/api/v1/clubs/:clubId/forms/:formId/responses` - Get all responses (teacher)
- **GET** `/api/v1/clubs/:clubId/forms/:formId/responses/:responseId` - Get single response
- **PATCH** `/api/v1/clubs/:clubId/forms/:formId/responses/:responseId/review` - Review response (approve/reject)

### Data Models

#### ClubForm
```typescript
{
  id: string;                    // UUID
  club_id: string;               // UUID
  created_by: string;            // User UUID
  name: string;                  // Form name
  description?: string;          // Optional description
  is_active: boolean;            // Whether form is active
  auto_approve: boolean;         // Auto-approve responses
  form_type: FormType;           // Enum: member_registration, event_signup, etc.
  created_at: Date;
  updated_at: Date;
  questions?: ClubFormQuestion[]; // Populated questions
}
```

#### ClubFormQuestion
```typescript
{
  id: string;                    // UUID
  form_id: string;               // UUID
  question_text: string;         // The question
  question_type: QuestionType;   // Enum: text, textarea, dropdown, radio, checkbox, number, email, date
  required: boolean;             // Is required
  order_index: number;           // Sort order (0-based)
  options?: QuestionOption[];    // For dropdown/radio/checkbox
}
```

#### QuestionOption
```typescript
{
  id: string;
  question_id: string;
  option_text: string;           // Display text
  option_value: string;          // Value submitted
  order_index: number;
}
```

#### FormResponse
```typescript
{
  id: string;
  form_id: string;
  student_id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
  review_notes?: string;
  answers: FormAnswer[];         // Array of answers
}
```

#### FormAnswer
```typescript
{
  id: string;
  response_id: string;
  question_id: string;
  answer_value: string;          // JSON string or text
}
```

---

## Frontend Implementation Plan

### Phase 1: API Layer Setup ✅ TODO

**File**: `frontend-nextjs/lib/api/endpoints/club-forms.ts` (NEW)

Create TypeScript interfaces and API functions:

```typescript
// Types
export interface ClubForm {
  id: string;
  clubId: string;
  createdBy: string;
  name: string;
  description?: string;
  isActive: boolean;
  autoApprove: boolean;
  formType: FormType;
  createdAt: string;
  updatedAt: string;
  questions?: FormQuestion[];
}

export interface FormQuestion {
  id: string;
  formId: string;
  questionText: string;
  questionType: QuestionType;
  required: boolean;
  orderIndex: number;
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  optionValue: string;
  orderIndex: number;
}

export interface FormResponse {
  id: string;
  formId: string;
  studentId: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  answers: FormAnswer[];
}

export interface FormAnswer {
  id: string;
  responseId: string;
  questionId: string;
  answerValue: string;
}

// DTOs
export interface CreateClubFormDto {
  name: string;
  description?: string;
  is_active?: boolean;
  auto_approve?: boolean;
  form_type?: FormType;
}

export interface UpdateClubFormDto {
  name?: string;
  description?: string;
  is_active?: boolean;
  auto_approve?: boolean;
}

export interface CreateFormQuestionDto {
  question_text: string;
  question_type?: QuestionType;
  required?: boolean;
  order_index?: number;
  options?: {
    option_text: string;
    option_value: string;
    order_index?: number;
  }[];
}

export interface UpdateFormQuestionDto {
  question_text?: string;
  question_type?: QuestionType;
  required?: boolean;
  order_index?: number;
}

export interface SubmitFormResponseDto {
  answers: {
    question_id: string;
    answer_value: string;
  }[];
}

export interface ReviewFormResponseDto {
  status: 'approved' | 'rejected';
  review_notes?: string;
}

// Enums
export enum FormType {
  MEMBER_REGISTRATION = 'member_registration',
  TEACHER_APPLICATION = 'teacher_application',
  EVENT_SIGNUP = 'event_signup',
  SURVEY = 'survey',
  FEEDBACK = 'feedback',
}

export enum QuestionType {
  TEXT = 'text',           // Maps to "short-text" in UI
  TEXTAREA = 'textarea',   // Maps to "long-text" in UI
}

// API Functions
export const getClubForms = (clubId: string) =>
  apiClient.get<ClubForm[]>(`/clubs/${clubId}/forms`);

export const getClubForm = (clubId: string, formId: string) =>
  apiClient.get<ClubForm>(`/clubs/${clubId}/forms/${formId}`);

export const createClubForm = (clubId: string, data: CreateClubFormDto) =>
  apiClient.post<ClubForm>(`/clubs/${clubId}/forms`, data);

export const updateClubForm = (clubId: string, formId: string, data: UpdateClubFormDto) =>
  apiClient.patch<ClubForm>(`/clubs/${clubId}/forms/${formId}`, data);

export const deleteClubForm = (clubId: string, formId: string) =>
  apiClient.delete(`/clubs/${clubId}/forms/${formId}`);

export const addFormQuestion = (clubId: string, formId: string, data: CreateFormQuestionDto) =>
  apiClient.post<FormQuestion>(`/clubs/${clubId}/forms/${formId}/questions`, data);

export const updateFormQuestion = (
  clubId: string,
  formId: string,
  questionId: string,
  data: UpdateFormQuestionDto
) =>
  apiClient.patch<FormQuestion>(`/clubs/${clubId}/forms/${formId}/questions/${questionId}`, data);

export const deleteFormQuestion = (clubId: string, formId: string, questionId: string) =>
  apiClient.delete(`/clubs/${clubId}/forms/${formId}/questions/${questionId}`);

export const getFormResponses = (clubId: string, formId: string) =>
  apiClient.get<FormResponse[]>(`/clubs/${clubId}/forms/${formId}/responses`);

export const getFormResponse = (clubId: string, formId: string, responseId: string) =>
  apiClient.get<FormResponse>(`/clubs/${clubId}/forms/${formId}/responses/${responseId}`);

export const submitFormResponse = (clubId: string, formId: string, data: SubmitFormResponseDto) =>
  apiClient.post<FormResponse>(`/clubs/${clubId}/forms/${formId}/responses`, data);

export const reviewFormResponse = (
  clubId: string,
  formId: string,
  responseId: string,
  data: ReviewFormResponseDto
) =>
  apiClient.patch<FormResponse>(
    `/clubs/${clubId}/forms/${formId}/responses/${responseId}/review`,
    data
  );
```

**Export in index**:
```typescript
// lib/api/endpoints/index.ts
export * from './club-forms';
```

---

### Phase 2: React Query Hooks ✅ TODO

**File**: `frontend-nextjs/hooks/useClubForms.ts` (NEW)

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { getClubForms, getClubForm } from '@/lib/api/endpoints/club-forms';

// Fetch all forms for a club
export function useClubForms(clubId: string, enabled = true) {
  return useQuery({
    queryKey: ['club-forms', clubId],
    queryFn: () => getClubForms(clubId),
    enabled,
  });
}

// Fetch single form with questions
export function useClubForm(clubId: string, formId: string, enabled = true) {
  return useQuery({
    queryKey: ['club-form', clubId, formId],
    queryFn: () => getClubForm(clubId, formId),
    enabled: enabled && !!formId,
  });
}
```

**File**: `frontend-nextjs/hooks/useClubFormMutations.ts` (NEW)

```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createClubForm,
  updateClubForm,
  deleteClubForm,
  addFormQuestion,
  updateFormQuestion,
  deleteFormQuestion,
  type CreateClubFormDto,
  type UpdateClubFormDto,
  type CreateFormQuestionDto,
  type UpdateFormQuestionDto,
} from '@/lib/api/endpoints/club-forms';
import { useToast } from '@/hooks/use-toast';

export function useClubFormMutations(clubId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create form
  const createForm = useMutation({
    mutationFn: (data: CreateClubFormDto) => createClubForm(clubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-forms', clubId] });
      toast({
        title: 'Success',
        description: 'Form created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create form',
        variant: 'destructive',
      });
    },
  });

  // Update form
  const updateForm = useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: UpdateClubFormDto }) =>
      updateClubForm(clubId, formId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['club-forms', clubId] });
      queryClient.invalidateQueries({ queryKey: ['club-form', clubId, variables.formId] });
      toast({
        title: 'Success',
        description: 'Form updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update form',
        variant: 'destructive',
      });
    },
  });

  // Delete form
  const deleteForm = useMutation({
    mutationFn: (formId: string) => deleteClubForm(clubId, formId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club-forms', clubId] });
      toast({
        title: 'Success',
        description: 'Form deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete form',
        variant: 'destructive',
      });
    },
  });

  // Add question
  const addQuestion = useMutation({
    mutationFn: ({ formId, data }: { formId: string; data: CreateFormQuestionDto }) =>
      addFormQuestion(clubId, formId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['club-form', clubId, variables.formId] });
      toast({
        title: 'Success',
        description: 'Question added successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to add question',
        variant: 'destructive',
      });
    },
  });

  // Update question
  const updateQuestion = useMutation({
    mutationFn: ({
      formId,
      questionId,
      data,
    }: {
      formId: string;
      questionId: string;
      data: UpdateFormQuestionDto;
    }) => updateFormQuestion(clubId, formId, questionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['club-form', clubId, variables.formId] });
      toast({
        title: 'Success',
        description: 'Question updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to update question',
        variant: 'destructive',
      });
    },
  });

  // Delete question
  const deleteQuestion = useMutation({
    mutationFn: ({ formId, questionId }: { formId: string; questionId: string }) =>
      deleteFormQuestion(clubId, formId, questionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['club-form', clubId, variables.formId] });
      toast({
        title: 'Success',
        description: 'Question deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete question',
        variant: 'destructive',
      });
    },
  });

  return {
    createForm,
    updateForm,
    deleteForm,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  };
}
```

**File**: `frontend-nextjs/hooks/useFormResponses.ts` (NEW)

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { getFormResponses, getFormResponse } from '@/lib/api/endpoints/club-forms';

export function useFormResponses(clubId: string, formId: string, enabled = true) {
  return useQuery({
    queryKey: ['form-responses', clubId, formId],
    queryFn: () => getFormResponses(clubId, formId),
    enabled: enabled && !!formId,
  });
}

export function useFormResponse(
  clubId: string,
  formId: string,
  responseId: string,
  enabled = true
) {
  return useQuery({
    queryKey: ['form-response', clubId, formId, responseId],
    queryFn: () => getFormResponse(clubId, formId, responseId),
    enabled: enabled && !!formId && !!responseId,
  });
}
```

**File**: `frontend-nextjs/hooks/useFormResponseMutations.ts` (NEW)

```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitFormResponse,
  reviewFormResponse,
  type SubmitFormResponseDto,
  type ReviewFormResponseDto,
} from '@/lib/api/endpoints/club-forms';
import { useToast } from '@/hooks/use-toast';

export function useFormResponseMutations(clubId: string, formId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const submitResponse = useMutation({
    mutationFn: (data: SubmitFormResponseDto) => submitFormResponse(clubId, formId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-responses', clubId, formId] });
      toast({
        title: 'Success',
        description: 'Application submitted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to submit application',
        variant: 'destructive',
      });
    },
  });

  const reviewResponse = useMutation({
    mutationFn: ({ responseId, data }: { responseId: string; data: ReviewFormResponseDto }) =>
      reviewFormResponse(clubId, formId, responseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-responses', clubId, formId] });
      toast({
        title: 'Success',
        description: 'Application reviewed successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to review application',
        variant: 'destructive',
      });
    },
  });

  return {
    submitResponse,
    reviewResponse,
  };
}
```

**Update hooks index**:
```typescript
// hooks/index.ts
export * from './useClubForms';
export * from './useClubFormMutations';
export * from './useFormResponses';
export * from './useFormResponseMutations';
```

---

### Phase 3: Integrate into Club Detail Page ✅ TODO

**File**: `frontend-nextjs/app/teacher/clubs/[id]/page.tsx`

#### 3.1 Add imports and hooks

```typescript
import {
  useClubForms,
  useClubForm,
  useClubFormMutations,
  useFormResponses,
  useFormResponseMutations,
} from '@/hooks';
import { QuestionType } from '@/lib/api/endpoints/club-forms';
```

#### 3.2 Replace mock state with real data

**Current mock state** (lines ~160-180):
```typescript
const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([
  // ... mock data
])
```

**Replace with**:
```typescript
// Fetch forms for this club
const { data: forms, isLoading: formsLoading } = useClubForms(clubId);

// Get active form (or first form)
const activeFormId = forms?.find(f => f.isActive)?.id || forms?.[0]?.id;

// Fetch form details with questions
const { data: formData, isLoading: formLoading } = useClubForm(
  clubId,
  activeFormId || '',
  !!activeFormId
);

// Get mutations
const formMutations = useClubFormMutations(clubId);

// Local state for editing
const [localQuestions, setLocalQuestions] = useState<FormQuestion[]>([]);
const [hasChanges, setHasChanges] = useState(false);

// Sync form data to local state
useEffect(() => {
  if (formData?.questions) {
    setLocalQuestions(formData.questions);
    setHasChanges(false);
  }
}, [formData]);
```

#### 3.3 Update form operations

**Create/Update form** (Save Form button):
```typescript
const saveForm = async () => {
  if (!activeFormId) {
    // Create new form
    const result = await formMutations.createForm.mutateAsync({
      name: 'Member Application Form',
      description: 'Application form for club membership',
      is_active: true,
      auto_approve: false,
    });

    // After creating form, add questions
    if (result && localQuestions.length > 0) {
      for (const [index, question] of localQuestions.entries()) {
        await formMutations.addQuestion.mutateAsync({
          formId: result.id,
          data: {
            question_text: question.questionText,
            question_type: question.questionType,
            required: question.required,
            order_index: index,
          },
        });
      }
    }
  } else {
    // Update existing questions
    // This is complex - might want to handle individually
    for (const [index, question] of localQuestions.entries()) {
      if (question.id) {
        // Update existing
        await formMutations.updateQuestion.mutateAsync({
          formId: activeFormId,
          questionId: question.id,
          data: {
            order_index: index,
            // other changes...
          },
        });
      } else {
        // Add new
        await formMutations.addQuestion.mutateAsync({
          formId: activeFormId,
          data: {
            question_text: question.questionText,
            question_type: question.questionType,
            required: question.required,
            order_index: index,
          },
        });
      }
    }
  }

  setHasChanges(false);
  setShowFormBuilder(false);
};
```

**Add question**:
```typescript
const addQuestion = () => {
  const newQuestion: Partial<FormQuestion> = {
    questionText: '',
    questionType: QuestionType.TEXT,
    required: true,
    orderIndex: localQuestions.length,
  };
  setLocalQuestions([...localQuestions, newQuestion as FormQuestion]);
  setHasChanges(true);
};
```

**Delete question**:
```typescript
const deleteQuestion = async (questionId: string) => {
  if (activeFormId && questionId) {
    await formMutations.deleteQuestion.mutateAsync({
      formId: activeFormId,
      questionId,
    });
  }

  // Also remove from local state
  setLocalQuestions(localQuestions.filter(q => q.id !== questionId));
  setHasChanges(true);
};
```

**Update question**:
```typescript
const updateQuestion = (questionId: string, field: string, value: any) => {
  setLocalQuestions(
    localQuestions.map(q =>
      q.id === questionId ? { ...q, [field]: value } : q
    )
  );
  setHasChanges(true);
};
```

**Reorder questions**:
```typescript
const moveQuestionUp = (index: number) => {
  if (index === 0) return;
  const newQuestions = [...localQuestions];
  [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
  setLocalQuestions(newQuestions);
  setHasChanges(true);
};

const moveQuestionDown = (index: number) => {
  if (index === localQuestions.length - 1) return;
  const newQuestions = [...localQuestions];
  [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
  setLocalQuestions(newQuestions);
  setHasChanges(true);
};
```

---

### Phase 4: Form Responses Integration ✅ TODO

**File**: `frontend-nextjs/app/teacher/clubs/[id]/page.tsx`

#### 4.1 Fetch responses

```typescript
// Add to component
const { data: responses, isLoading: responsesLoading } = useFormResponses(
  clubId,
  activeFormId || '',
  !!activeFormId
);

const responseMutations = useFormResponseMutations(clubId, activeFormId || '');
```

#### 4.2 Display responses table

Replace mock applications table with real data:

```typescript
{responses?.map((response) => (
  <TableRow key={response.id}>
    <TableCell>
      <Checkbox />
    </TableCell>
    <TableCell>
      {/* Get student info from response.studentId */}
      {response.studentId}
    </TableCell>
    <TableCell>
      {/* Display first answer or summary */}
      {response.answers[0]?.answerValue || 'No answers'}
    </TableCell>
    <TableCell>
      <Badge className={getStatusBadgeClass(response.status)}>
        {response.status}
      </Badge>
    </TableCell>
    <TableCell>
      {new Date(response.submittedAt).toLocaleDateString()}
    </TableCell>
    <TableCell>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => handleViewResponse(response.id)}
        >
          View
        </Button>
        {response.status === 'pending' && (
          <>
            <Button
              size="sm"
              className="bg-green-600"
              onClick={() => handleApprove(response.id)}
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleReject(response.id)}
            >
              Reject
            </Button>
          </>
        )}
      </div>
    </TableCell>
  </TableRow>
))}
```

#### 4.3 Review actions

```typescript
const handleApprove = async (responseId: string) => {
  await responseMutations.reviewResponse.mutateAsync({
    responseId,
    data: {
      status: 'approved',
    },
  });
};

const handleReject = async (responseId: string) => {
  await responseMutations.reviewResponse.mutateAsync({
    responseId,
    data: {
      status: 'rejected',
      review_notes: 'Rejected by teacher',
    },
  });
};
```

---

## Phase 5: Testing Checklist ✅ TODO

### Form Management
- [ ] Create a new form for a club
- [ ] Fetch and display form
- [ ] Update form settings (name, description, isActive)
- [ ] Delete form
- [ ] Handle errors (unauthorized, not found, etc.)

### Question Management
- [ ] Add text question
- [ ] Add textarea question
- [ ] Add dropdown question with options
- [ ] Add radio question with options
- [ ] Update question text
- [ ] Update question type
- [ ] Toggle required flag
- [ ] Reorder questions (move up/down)
- [ ] Delete question
- [ ] Question order persists after save

### Response Management
- [ ] View all form responses
- [ ] View individual response details
- [ ] Approve response
- [ ] Reject response with notes
- [ ] Filter by status (pending/approved/rejected)
- [ ] Export responses (future enhancement)

### Error Handling
- [ ] Network errors show toast
- [ ] 403 Forbidden (not club advisor)
- [ ] 404 Not Found (invalid form ID)
- [ ] Validation errors displayed
- [ ] Optimistic updates with rollback

### UI/UX
- [ ] Loading states during fetch
- [ ] Disabled buttons during mutation
- [ ] Success toasts on save
- [ ] Confirm dialogs for delete
- [ ] Unsaved changes warning
- [ ] Form preview shows current state

---

## Implementation Order

1. **Phase 1**: Create API layer (`club-forms.ts`)
2. **Phase 2**: Create React Query hooks (4 files)
3. **Phase 3**: Integrate form builder into club detail page
4. **Phase 4**: Integrate responses table and review
5. **Phase 5**: Test all operations

---

## Notes

### Backend Compatibility
- The backend uses **snake_case** (e.g., `question_text`)
- Frontend uses **camelCase** (e.g., `questionText`)
- The apiClient should handle transformation automatically
- Double-check data mapping when creating DTOs

### Question Types Mapping
**Backend** ↔ **Frontend**:
- `text` ↔ `short-text` (Short Text)
- `textarea` ↔ `long-text` (Long Text/Essay)

**Note**: The UI only supports these 2 question types. The backend supports more types (dropdown, radio, checkbox, etc.) but we're not using them in the frontend yet.

### Authorization
- Teachers can manage forms for clubs where they are advisor/co-advisor
- Students can submit responses
- Only advisors can review responses
- The backend enforces this via PBAC (Permission-Based Access Control)

### Future Enhancements
1. Support more question types (dropdown, radio, checkbox, number, email, date)
2. Form templates (pre-built questions)
3. Conditional questions (show Q2 if Q1 = "Yes")
4. File upload questions
5. Bulk approve/reject
6. Export responses to CSV/Excel
7. Email notifications on submission
8. Form analytics (response rate, average time)

---

## Questions for Clarification

1. Should we create a form automatically when a club is created, or only when teacher clicks "Customize Form"?
2. Can a club have multiple active forms, or just one?
3. ✅ **CONFIRMED**: Only text/textarea questions (short-text and long-text)
4. Do we need to fetch student details for responses, or is student ID enough?
5. Should form responses automatically create club memberships when approved?

---

## Estimated Time

- **Phase 1**: 1-2 hours (API layer + types)
- **Phase 2**: 2-3 hours (React Query hooks)
- **Phase 3**: 3-4 hours (Form builder integration)
- **Phase 4**: 2-3 hours (Responses integration)
- **Phase 5**: 2-3 hours (Testing)

**Total**: 10-15 hours

---

## Success Criteria

✅ Teachers can create custom application forms
✅ Teachers can add/edit/delete questions
✅ Teachers can reorder questions
✅ Students can submit responses (via form)
✅ Teachers can view all responses
✅ Teachers can approve/reject responses
✅ All operations use real backend API
✅ Proper error handling and loading states
✅ Optimistic updates for better UX
