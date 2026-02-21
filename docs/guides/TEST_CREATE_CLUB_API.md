# Test Create Club API

## Backend API Testing Guide

### Endpoint
```
POST http://localhost:3004/api/v1/clubs
```

### Headers
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

---

## Test Case 1: Minimal Club (Name Only)

```json
{
  "name": "Test Club"
}
```

**Expected Result:** ✅ Club created successfully

---

## Test Case 2: Full Club with All Data

```json
{
  "name": "Science Innovation Club",
  "description": "A club dedicated to fostering scientific curiosity and innovation through hands-on experiments and research projects",
  "mission_statement": "To inspire the next generation of scientists and innovators by providing opportunities for exploration, experimentation, and collaboration",

  "goals": [
    {
      "goal_text": "Promote STEM education and scientific literacy among students",
      "order_index": 0
    },
    {
      "goal_text": "Organize and host annual science fairs and exhibitions",
      "order_index": 1
    },
    {
      "goal_text": "Conduct weekly hands-on experiments and lab sessions",
      "order_index": 2
    },
    {
      "goal_text": "Collaborate with professional scientists and research institutions",
      "order_index": 3
    },
    {
      "goal_text": "Participate in regional and national science competitions",
      "order_index": 4
    }
  ],

  "benefits": [
    {
      "title": "Hands-on Learning",
      "description": "Participate in weekly science experiments and practical lab work to deepen your understanding of scientific concepts",
      "order_index": 0
    },
    {
      "title": "Competition Opportunities",
      "description": "Represent the school in regional science olympiads and research competitions with full support and mentorship",
      "order_index": 1
    },
    {
      "title": "Networking with Professionals",
      "description": "Meet and learn from professional scientists, researchers, and industry experts through guest lectures and field trips",
      "order_index": 2
    },
    {
      "title": "College Application Boost",
      "description": "Build a strong academic portfolio with documented research projects and leadership experience",
      "order_index": 3
    },
    {
      "title": "Access to Equipment",
      "description": "Use advanced laboratory equipment and research tools not typically available in regular classes",
      "order_index": 4
    },
    {
      "title": "Peer Collaboration",
      "description": "Work with like-minded students who share your passion for science and innovation",
      "order_index": 5
    }
  ],

  "faqs": [
    {
      "question": "When and where do we meet?",
      "answer": "We meet every Wednesday from 3:00 PM to 4:30 PM in Room 205 (Science Lab). Additional sessions may be scheduled for special projects or competitions.",
      "order_index": 0
    },
    {
      "question": "Do I need prior science experience to join?",
      "answer": "No! All skill levels are welcome. We'll teach you everything you need to know, from basic lab safety to advanced experimental techniques.",
      "order_index": 1
    },
    {
      "question": "Is there a membership fee?",
      "answer": "No, membership is completely free for all students. We cover the cost of basic materials and equipment. For special field trips, there may be optional fees.",
      "order_index": 2
    },
    {
      "question": "Can I join if I'm already in other clubs?",
      "answer": "Absolutely! Many of our members participate in multiple clubs. We understand you have other commitments and we're flexible with attendance.",
      "order_index": 3
    },
    {
      "question": "What types of experiments do we do?",
      "answer": "We conduct a wide range of experiments including chemistry reactions, physics demonstrations, biology dissections, and engineering projects. Members can also propose their own experiments!",
      "order_index": 4
    },
    {
      "question": "How do I sign up?",
      "answer": "Simply attend our first meeting or contact our club advisor Mr. Johnson at room 205. You can also fill out the membership form on the school portal.",
      "order_index": 5
    },
    {
      "question": "Are there leadership opportunities?",
      "answer": "Yes! After one semester of active participation, members can apply for leadership positions including President, Vice President, Secretary, and Lab Coordinators.",
      "order_index": 6
    }
  ]
}
```

**Expected Result:** ✅ Club created with 5 goals, 6 benefits, and 7 FAQs

---

## Test Case 3: Validate Max Goals Limit (Should Pass)

```json
{
  "name": "Test Max Goals Club",
  "goals": [
    {"goal_text": "Goal 1", "order_index": 0},
    {"goal_text": "Goal 2", "order_index": 1},
    {"goal_text": "Goal 3", "order_index": 2},
    {"goal_text": "Goal 4", "order_index": 3},
    {"goal_text": "Goal 5", "order_index": 4}
  ]
}
```

**Expected Result:** ✅ Club created successfully (max 5 goals allowed)

---

## Test Case 4: Exceed Max Goals Limit (Should Fail)

```json
{
  "name": "Test Too Many Goals Club",
  "goals": [
    {"goal_text": "Goal 1", "order_index": 0},
    {"goal_text": "Goal 2", "order_index": 1},
    {"goal_text": "Goal 3", "order_index": 2},
    {"goal_text": "Goal 4", "order_index": 3},
    {"goal_text": "Goal 5", "order_index": 4},
    {"goal_text": "Goal 6", "order_index": 5}
  ]
}
```

**Expected Result:** ❌ 400 Bad Request - "goals must contain no more than 5 elements"

---

## Test Case 5: Exceed Max Benefits Limit (Should Fail)

```json
{
  "name": "Test Too Many Benefits Club",
  "benefits": [
    {"title": "Benefit 1", "description": "Description 1", "order_index": 0},
    {"title": "Benefit 2", "description": "Description 2", "order_index": 1},
    {"title": "Benefit 3", "description": "Description 3", "order_index": 2},
    {"title": "Benefit 4", "description": "Description 4", "order_index": 3},
    {"title": "Benefit 5", "description": "Description 5", "order_index": 4},
    {"title": "Benefit 6", "description": "Description 6", "order_index": 5},
    {"title": "Benefit 7", "description": "Description 7", "order_index": 6}
  ]
}
```

**Expected Result:** ❌ 400 Bad Request - "benefits must contain no more than 6 elements"

---

## Test Case 6: Max Length Validation (Should Fail)

```json
{
  "name": "Test Validation Club",
  "mission_statement": "This mission statement is way too long and exceeds the 300 character limit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
}
```

**Expected Result:** ❌ 400 Bad Request - "mission_statement must be shorter than or equal to 300 characters"

---

## Test Case 7: Unlimited FAQs (Should Pass)

```json
{
  "name": "Test Unlimited FAQs Club",
  "faqs": [
    {"question": "FAQ 1?", "answer": "Answer 1", "order_index": 0},
    {"question": "FAQ 2?", "answer": "Answer 2", "order_index": 1},
    {"question": "FAQ 3?", "answer": "Answer 3", "order_index": 2},
    {"question": "FAQ 4?", "answer": "Answer 4", "order_index": 3},
    {"question": "FAQ 5?", "answer": "Answer 5", "order_index": 4},
    {"question": "FAQ 6?", "answer": "Answer 6", "order_index": 5},
    {"question": "FAQ 7?", "answer": "Answer 7", "order_index": 6},
    {"question": "FAQ 8?", "answer": "Answer 8", "order_index": 7},
    {"question": "FAQ 9?", "answer": "Answer 9", "order_index": 8},
    {"question": "FAQ 10?", "answer": "Answer 10", "order_index": 9}
  ]
}
```

**Expected Result:** ✅ Club created with 10 FAQs (FAQs are unlimited)

---

## Verify in Database

After creating a club, verify the data in Supabase:

### 1. Check clubs table
```sql
SELECT * FROM clubs WHERE name = 'Science Innovation Club';
```

**Expected:** 1 row with `mission_statement` populated

### 2. Check club_goals table
```sql
SELECT * FROM club_goals WHERE club_id = 'YOUR_CLUB_ID' ORDER BY order_index;
```

**Expected:** 5 rows with correct `goal_text` and `order_index` (0-4)

### 3. Check club_benefits table
```sql
SELECT * FROM club_benefits WHERE club_id = 'YOUR_CLUB_ID' ORDER BY order_index;
```

**Expected:** 6 rows with correct `title`, `description`, and `order_index` (0-5)

### 4. Check club_faqs table
```sql
SELECT * FROM club_faqs WHERE club_id = 'YOUR_CLUB_ID' ORDER BY order_index;
```

**Expected:** 7 rows with correct `question`, `answer`, and `order_index` (0-6)

---

## Test GET /clubs/:id

After creating a club, test the GET endpoint to verify nested data is returned:

```
GET http://localhost:3004/api/v1/clubs/{CLUB_ID}
```

**Expected Response Structure:**
```json
{
  "id": "uuid",
  "name": "Science Innovation Club",
  "description": "...",
  "mission_statement": "...",
  "created_at": "2025-10-22T...",
  "updated_at": "2025-10-22T...",

  "goals": [
    {
      "id": "uuid",
      "club_id": "uuid",
      "goal_text": "Promote STEM education...",
      "order_index": 0,
      "created_at": "2025-10-22T...",
      "updated_at": "2025-10-22T..."
    },
    // ... 4 more goals
  ],

  "benefits": [
    {
      "id": "uuid",
      "club_id": "uuid",
      "title": "Hands-on Learning",
      "description": "Participate in weekly...",
      "order_index": 0,
      "created_at": "2025-10-22T...",
      "updated_at": "2025-10-22T..."
    },
    // ... 5 more benefits
  ],

  "faqs": [
    {
      "id": "uuid",
      "club_id": "uuid",
      "question": "When and where do we meet?",
      "answer": "We meet every Wednesday...",
      "order_index": 0,
      "created_at": "2025-10-22T...",
      "updated_at": "2025-10-22T..."
    },
    // ... 6 more FAQs
  ]
}
```

---

## Common Errors

### Error: "Domain with ID ... not found"
**Cause:** Trying to create club with `domain_id` that doesn't exist
**Fix:** Remove `domain_id` from request or use valid domain UUID

### Error: "Failed to create club goals"
**Cause:** Database table `club_goals` doesn't exist
**Fix:** Run the SQL migration script

### Error: "row-level security policy violation"
**Cause:** RLS policies blocking insert
**Fix:** Ensure you're using service client (backend should handle this automatically)

### Error: "Foreign key violation"
**Cause:** `club_id` in nested tables doesn't match created club
**Fix:** This shouldn't happen - check backend code for bugs

---

## Success Criteria

✅ Test Case 1: Minimal club created
✅ Test Case 2: Full club with all nested data created
✅ Test Case 3: Max 5 goals accepted
✅ Test Case 4: 6+ goals rejected with validation error
✅ Test Case 5: 7+ benefits rejected with validation error
✅ Test Case 6: Long mission_statement rejected
✅ Test Case 7: 10+ FAQs accepted (unlimited)
✅ Database verification shows all data in correct tables
✅ GET /clubs/:id returns club with nested goals, benefits, faqs

---

## Next: Test Frontend UI

After backend API tests pass, test the frontend:

1. Navigate to `http://localhost:3000/superadmin/clubs/create`
2. Fill out the form with club data
3. Click "Create Club"
4. Verify success toast and redirect to `/superadmin/clubs`
5. Check that new club appears in the table
