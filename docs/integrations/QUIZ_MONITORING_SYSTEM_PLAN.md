# Quiz Monitoring System - Complete Implementation Plan

**Date**: 2025-01-15
**Status**: 🎯 **READY FOR IMPLEMENTATION**
**Goal**: Create a powerful, real-time quiz monitoring system for teachers

---

## 🎯 System Overview

This system provides **3-layer monitoring** for quiz sessions:

1. **`quiz_participants`** - Real-time student progress tracking
2. **`quiz_device_sessions`** - Device usage history & switching detection
3. **`quiz_flags`** - Security alerts & suspicious behavior detection

---

## 📊 Part 1: Real-Time Participant Tracking

### Purpose
Track each student's progress through the quiz in real-time so teachers can see:
- Which question each student is on
- How many questions they've answered
- Their progress percentage
- How long they've been idle
- Security flag count

### Database: `quiz_participants`

Already exists in schema. Key fields:
- `current_question_index` - Which question they're on (0-indexed)
- `questions_answered` - Count of completed questions
- `progress` - Percentage complete (0-100)
- `status` - not_started, in_progress, completed, abandoned
- `idle_time_seconds` - Total time inactive
- `flag_count` - Number of security incidents

### Backend Implementation

#### 1. Create Participant on Quiz Start
**Location**: `quiz-attempts.service.ts` → `startAttempt()`

```typescript
// After creating quiz_active_sessions
const { data: participant, error: participantError } = await supabase
  .from('quiz_participants')
  .insert({
    session_id: sessionData.session_id,
    quiz_id: quizId,
    student_id: studentId,
    status: 'in_progress',
    progress: 0,
    current_question_index: 0,
    questions_answered: 0,
    total_questions: questionsToShow.length,
    start_time: new Date().toISOString(),
    flag_count: 0,
    idle_time_seconds: 0,
  })
  .select()
  .single();
```

#### 2. Update Progress on Question Navigation
**New Endpoint**: `POST /api/quiz-sessions/:attemptId/progress`

**DTO**: `update-progress.dto.ts`
```typescript
export class UpdateProgressDto {
  @IsInt()
  @Min(0)
  currentQuestionIndex: number;

  @IsInt()
  @Min(0)
  questionsAnswered: number;

  @IsInt()
  @Min(0)
  @Max(100)
  progress: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  idleTimeSeconds?: number;
}
```

**Service Method**: `session-management.service.ts`
```typescript
async updateProgress(
  attemptId: string,
  studentId: string,
  progressDto: UpdateProgressDto,
): Promise<void> {
  const supabase = this.supabaseService.getServiceClient();

  // Get session
  const { data: session } = await supabase
    .from('quiz_active_sessions')
    .select('session_id')
    .eq('attempt_id', attemptId)
    .eq('student_id', studentId)
    .single();

  if (!session) {
    throw new NotFoundException('Active session not found');
  }

  // Update participant
  const { error } = await supabase
    .from('quiz_participants')
    .update({
      current_question_index: progressDto.currentQuestionIndex,
      questions_answered: progressDto.questionsAnswered,
      progress: progressDto.progress,
      idle_time_seconds: progressDto.idleTimeSeconds || 0,
      updated_at: new Date().toISOString(),
    })
    .eq('session_id', session.session_id);

  if (error) {
    this.logger.error('Failed to update progress:', error);
    throw new InternalServerErrorException('Failed to update progress');
  }

  this.logger.log(
    `Progress updated: Student ${studentId} at question ${progressDto.currentQuestionIndex + 1}`,
  );
}
```

#### 3. Get All Participants (Teacher Monitoring)
**Endpoint**: `GET /api/quiz-monitoring/quiz/:quizId/participants`

Already exists, but enhance response:
```typescript
// Return format
{
  "participants": [
    {
      "studentId": "uuid",
      "studentName": "John Doe",
      "currentQuestion": 3,
      "totalQuestions": 10,
      "questionsAnswered": 2,
      "progress": 20,
      "status": "in_progress",
      "startTime": "2025-01-15T14:00:00Z",
      "idleTime": 30,
      "flagCount": 2,
      "lastHeartbeat": "2025-01-15T14:15:00Z"
    }
  ]
}
```

### Frontend Implementation

#### Student Side
**File**: `hooks/useQuizProgress.ts` (NEW)

```typescript
export const useQuizProgress = () => {
  const sendProgress = async (
    attemptId: string,
    currentQuestionIndex: number,
    questionsAnswered: number,
    progress: number,
  ) => {
    await quizApi.student.updateProgress(attemptId, {
      currentQuestionIndex,
      questionsAnswered,
      progress,
    });
  };

  return { sendProgress };
};
```

**Integration**: Call `sendProgress()` when:
- Student navigates to next/previous question
- Student answers a question
- Every 30 seconds (with idle time calculation)

#### Teacher Side
**File**: `app/teacher/quiz/[id]/monitor/page.tsx`

Real-time participant list with:
- Student name & avatar
- Current question indicator (e.g., "Question 3/10")
- Progress bar (visual percentage)
- Status badge (In Progress, Completed, Abandoned)
- Flag count indicator (🚩 if > 0)
- Idle time warning (⚠️ if > 2 minutes)

---

## 🖥️ Part 2: Device Session Tracking

### Purpose
Create an audit trail of all devices used during a quiz attempt to:
- Detect device switching (cheating indicator)
- Track device fingerprint changes
- Provide forensic evidence for academic integrity

### Database: `quiz_device_sessions`

Key fields:
- `device_fingerprint` - Unique device identifier
- `ip_address` - Network address
- `user_agent` - Browser/OS information
- `first_seen_at` - When device first detected
- `last_seen_at` - Last heartbeat from device
- `is_current` - Boolean (only one device should be current)

### Backend Implementation

#### 1. Create Initial Device Session on Quiz Start
**Location**: `quiz-attempts.service.ts` → `startAttempt()`

```typescript
// After creating quiz_active_sessions
const { error: deviceSessionError } = await supabase
  .from('quiz_device_sessions')
  .insert({
    session_id: sessionData.session_id,
    device_fingerprint: startDto.deviceFingerprint,
    ip_address: ipAddress,
    user_agent: startDto.userAgent,
    screen_resolution: startDto.screenResolution || null,
    browser_info: startDto.browserInfo || null,
    device_type: this.detectDeviceType(startDto.userAgent),
    first_seen_at: new Date().toISOString(),
    last_seen_at: new Date().toISOString(),
    is_current: true,
  });
```

#### 2. Detect Device Changes on Heartbeat
**Location**: `session-management.service.ts` → `heartbeat()`

```typescript
// After updating quiz_active_sessions
const currentFingerprint = session.current_device_fingerprint;

if (currentFingerprint !== heartbeatData.deviceFingerprint) {
  this.logger.warn(
    `🚨 DEVICE CHANGE DETECTED: ${currentFingerprint} → ${heartbeatData.deviceFingerprint}`,
  );

  // Mark old device as no longer current
  await supabase
    .from('quiz_device_sessions')
    .update({ is_current: false, last_seen_at: new Date().toISOString() })
    .eq('session_id', session.session_id)
    .eq('device_fingerprint', currentFingerprint);

  // Create new device session
  await supabase
    .from('quiz_device_sessions')
    .insert({
      session_id: session.session_id,
      device_fingerprint: heartbeatData.deviceFingerprint,
      ip_address: heartbeatData.ipAddress,
      user_agent: heartbeatData.userAgent,
      device_type: this.detectDeviceType(heartbeatData.userAgent),
      first_seen_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      is_current: true,
    });

  // Create security flag
  await this.createFlag(
    session.session_id,
    session.quiz_id,
    session.student_id,
    'device_changed',
    `Device changed from ${currentFingerprint} to ${heartbeatData.deviceFingerprint}`,
    'warning',
  );
}

// Update last_seen_at for current device
await supabase
  .from('quiz_device_sessions')
  .update({ last_seen_at: new Date().toISOString() })
  .eq('session_id', session.session_id)
  .eq('device_fingerprint', heartbeatData.deviceFingerprint);
```

#### 3. Get Device History (Teacher View)
**Endpoint**: `GET /api/quiz-monitoring/attempt/:attemptId/devices`

```typescript
async getDeviceHistory(attemptId: string): Promise<DeviceSession[]> {
  const supabase = this.supabaseService.getClient();

  const { data: session } = await supabase
    .from('quiz_active_sessions')
    .select('session_id')
    .eq('attempt_id', attemptId)
    .single();

  const { data: devices } = await supabase
    .from('quiz_device_sessions')
    .select('*')
    .eq('session_id', session.session_id)
    .order('first_seen_at', { ascending: true });

  return devices;
}
```

**Response Format**:
```json
{
  "devices": [
    {
      "deviceFingerprint": "abc123",
      "deviceType": "desktop",
      "browserInfo": { "name": "Chrome", "version": "120" },
      "ipAddress": "192.168.1.100",
      "firstSeenAt": "2025-01-15T14:00:00Z",
      "lastSeenAt": "2025-01-15T14:15:00Z",
      "isCurrent": false
    },
    {
      "deviceFingerprint": "def456",
      "deviceType": "mobile",
      "browserInfo": { "name": "Safari", "version": "17" },
      "ipAddress": "192.168.1.101",
      "firstSeenAt": "2025-01-15T14:15:30Z",
      "lastSeenAt": "2025-01-15T14:30:00Z",
      "isCurrent": true
    }
  ],
  "deviceChangeCount": 1
}
```

### Frontend Implementation

#### Student Side
**Enhanced Device Fingerprint**: `lib/utils/device-fingerprint.ts`

Add more data collection:
```typescript
export async function generateDeviceFingerprint() {
  return {
    fingerprint: hash,
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    browserInfo: {
      name: getBrowserName(),
      version: getBrowserVersion(),
    },
  };
}
```

#### Teacher Side
**File**: `app/teacher/quiz/[id]/devices/page.tsx` (NEW)

Timeline view showing:
- Device switch events
- Device details (type, browser, IP)
- Duration on each device
- Visual timeline with color coding

---

## 🚩 Part 3: Security Flags System

### Purpose
Real-time security alerts for suspicious behavior during quizzes.

### Database: `quiz_flags`

Key fields:
- `flag_type` - Type of security incident
- `message` - Human-readable description
- `severity` - info, warning, critical
- `metadata` - Additional JSON data
- `timestamp` - When incident occurred

### Flag Types & Severity Levels

#### 🔵 INFO (Informational)
1. **`session_started`**
   - When: Student starts quiz
   - Message: "Student started quiz attempt"
   - Metadata: `{ attemptId, deviceType }`

2. **`heartbeat_missed`**
   - When: Heartbeat not received for 3+ minutes
   - Message: "No heartbeat received for X minutes"
   - Metadata: `{ minutesMissed }`

3. **`question_skipped`**
   - When: Student skips question without answering
   - Message: "Student skipped question X"
   - Metadata: `{ questionIndex, questionId }`

#### 🟡 WARNING (Potentially Suspicious)
1. **`tab_switch`**
   - When: Student switches browser tab
   - Message: "Student switched away from quiz tab"
   - Metadata: `{ tabSwitchCount, timestamp }`
   - Trigger: Create flag on EACH tab switch

2. **`device_changed`**
   - When: Device fingerprint changes
   - Message: "Device changed from [device1] to [device2]"
   - Metadata: `{ oldDevice, newDevice }`

3. **`ip_changed`**
   - When: IP address changes
   - Message: "IP address changed from [ip1] to [ip2]"
   - Metadata: `{ oldIp, newIp }`

4. **`rapid_answering`**
   - When: Student answers multiple questions in < 5 seconds each
   - Message: "Rapid answering detected (X questions in Y seconds)"
   - Metadata: `{ questionCount, timeSpent }`

5. **`excessive_idle`**
   - When: No activity for 5+ minutes (but still active)
   - Message: "Student idle for X minutes"
   - Metadata: `{ idleMinutes }`

6. **`copy_paste_detected`**
   - When: Student pastes content into answer field
   - Message: "Paste action detected on question X"
   - Metadata: `{ questionId, pasteLength }`

7. **`fullscreen_exit`**
   - When: Student exits fullscreen mode (if required)
   - Message: "Student exited fullscreen mode"
   - Metadata: `{ timestamp }`

#### 🔴 CRITICAL (High Cheating Risk)
1. **`multiple_devices_simultaneous`**
   - When: >1 active device at same time
   - Message: "Multiple devices detected simultaneously"
   - Metadata: `{ deviceCount, devices[] }`

2. **`tab_switch_threshold_exceeded`**
   - When: Tab switches exceed threshold (e.g., 5 times)
   - Message: "Tab switch limit exceeded (X switches)"
   - Metadata: `{ tabSwitchCount, threshold }`

3. **`suspicious_pattern`**
   - When: AI detects unusual answer patterns
   - Message: "Suspicious answering pattern detected"
   - Metadata: `{ pattern, confidence }`

4. **`screenshot_detected`**
   - When: Screenshot attempt detected (if monitoring enabled)
   - Message: "Screenshot attempt detected"
   - Metadata: `{ timestamp }`

5. **`session_hijack_attempt`**
   - When: Same session accessed from different IP/device without proper handoff
   - Message: "Possible session hijack detected"
   - Metadata: `{ suspiciousActivity }`

### Backend Implementation

#### 1. Centralized Flag Creation Service
**Location**: `session-management.service.ts`

```typescript
async createFlag(
  sessionId: string,
  quizId: string,
  studentId: string,
  flagType: FlagType,
  message: string,
  severity: 'info' | 'warning' | 'critical',
  metadata?: any,
): Promise<void> {
  const supabase = this.supabaseService.getServiceClient();

  // Get participant_id
  const { data: participant } = await supabase
    .from('quiz_participants')
    .select('id')
    .eq('session_id', sessionId)
    .single();

  // Create flag
  const { error } = await supabase
    .from('quiz_flags')
    .insert({
      participant_id: participant?.id,
      session_id: sessionId,
      quiz_id: quizId,
      student_id: studentId,
      flag_type: flagType,
      message: message,
      severity: severity,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    });

  if (error) {
    this.logger.error('Failed to create flag:', error);
  }

  // Increment flag count in participants
  if (participant) {
    await supabase
      .from('quiz_participants')
      .update({
        flag_count: participant.flag_count + 1,
      })
      .eq('id', participant.id);
  }

  this.logger.warn(
    `🚩 FLAG CREATED: [${severity.toUpperCase()}] ${flagType} - ${message}`,
  );
}
```

#### 2. Auto-Flag Creation Points

**In Heartbeat** (`session-management.service.ts`):
```typescript
// Device change detection
if (deviceChanged) {
  await this.createFlag(
    session.session_id,
    session.quiz_id,
    session.student_id,
    'device_changed',
    `Device changed`,
    'warning',
    { oldDevice, newDevice },
  );
}

// IP change detection
if (ipChanged) {
  await this.createFlag(..., 'ip_changed', ..., 'warning', ...);
}

// Heartbeat missed
const lastHeartbeat = new Date(session.last_heartbeat);
const minutesSinceHeartbeat = (Date.now() - lastHeartbeat.getTime()) / 60000;
if (minutesSinceHeartbeat > 3) {
  await this.createFlag(..., 'heartbeat_missed', ..., 'info', ...);
}
```

**New Endpoint for Client-Side Flags**: `POST /api/quiz-sessions/:attemptId/flag`

```typescript
// DTO
export class CreateClientFlagDto {
  @IsString()
  flagType: 'tab_switch' | 'copy_paste_detected' | 'fullscreen_exit';

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  metadata?: any;
}

// Service method
async createClientFlag(
  attemptId: string,
  studentId: string,
  flagDto: CreateClientFlagDto,
): Promise<void> {
  // Get session
  const session = await this.getSession(attemptId, studentId);

  // Determine severity
  const severity = this.getSeverityForFlagType(flagDto.flagType);

  // Create flag
  await this.createFlag(
    session.session_id,
    session.quiz_id,
    studentId,
    flagDto.flagType,
    flagDto.message || this.getDefaultMessage(flagDto.flagType),
    severity,
    flagDto.metadata,
  );
}
```

#### 3. Get Flags for Monitoring
**Endpoint**: `GET /api/quiz-monitoring/quiz/:quizId/flags`

Filter by:
- Severity (query param: `?severity=warning,critical`)
- Student (query param: `?studentId=uuid`)
- Time range (query params: `?from=timestamp&to=timestamp`)

**Response**:
```json
{
  "flags": [
    {
      "id": "uuid",
      "studentId": "uuid",
      "studentName": "John Doe",
      "flagType": "tab_switch",
      "message": "Student switched away from quiz tab",
      "severity": "warning",
      "timestamp": "2025-01-15T14:10:30Z",
      "metadata": { "tabSwitchCount": 3 }
    },
    {
      "flagType": "device_changed",
      "severity": "warning",
      "timestamp": "2025-01-15T14:15:00Z"
    }
  ],
  "summary": {
    "total": 15,
    "info": 5,
    "warning": 8,
    "critical": 2
  }
}
```

### Frontend Implementation

#### Student Side - Flag Detection

**File**: `hooks/useQuizMonitoring.ts` (NEW)

```typescript
export const useQuizMonitoring = (attemptId: string) => {
  const sendFlag = async (
    flagType: string,
    message?: string,
    metadata?: any,
  ) => {
    await quizApi.student.createFlag(attemptId, {
      flagType,
      message,
      metadata,
    });
  };

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendFlag('tab_switch', 'Student switched away from quiz tab', {
          timestamp: new Date().toISOString(),
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [attemptId]);

  // Copy/paste detection
  const handlePaste = (questionId: string) => {
    sendFlag('copy_paste_detected', `Paste detected on question`, {
      questionId,
    });
  };

  // Fullscreen exit detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        sendFlag('fullscreen_exit', 'Student exited fullscreen mode');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [attemptId]);

  return { sendFlag, handlePaste };
};
```

**Integration in Quiz Page**: `app/student/quiz/[id]/page.tsx`

```typescript
const { sendFlag, handlePaste } = useQuizMonitoring(attempt.attempt_id);

// Add paste detection to answer inputs
<textarea
  onPaste={() => handlePaste(currentQuestion.question_id)}
  // ... other props
/>
```

#### Teacher Side - Flag Dashboard

**File**: `app/teacher/quiz/[id]/monitor/page.tsx`

Real-time flag feed:
- Live updating list of flags
- Color-coded by severity
- Filter by student/severity
- Flag details on click
- Auto-refresh every 10 seconds

Visual indicators:
- 🔵 Info flags (subtle)
- 🟡 Warning flags (highlighted)
- 🔴 Critical flags (prominent, requires attention)

Flag summary cards:
- Total flags
- Critical flag count (big red number)
- Most flagged student
- Flag breakdown by type

---

## 🎨 Teacher Monitoring Dashboard Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  QUIZ MONITORING: Math Quiz                             │
│  📊 Live: 15 students  |  ⚠️ 8 Flags  |  🔴 2 Critical  │
├─────────────────────────────────────────────────────────┤
│  [Participants] [Flags] [Devices] [Analytics]           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  PARTICIPANTS (15 Active)                               │
│  ┌──────────────────────────────────────────────┐      │
│  │ 🟢 John Doe          Question 3/10  [████░░] 40%│    │
│  │    Started: 2:00 PM  •  🚩 2 flags  •  💻 Laptop│    │
│  ├──────────────────────────────────────────────┤      │
│  │ 🟢 Jane Smith        Question 8/10  [████████] 80%│  │
│  │    Started: 2:00 PM  •  🚩 0 flags  •  📱 Mobile│    │
│  ├──────────────────────────────────────────────┤      │
│  │ 🔴 Bob Lee           Question 1/10  [█░░░░░░░] 10%│  │
│  │    Started: 2:00 PM  •  🚩 5 flags  •  💻→📱   │    │
│  │    ⚠️ CRITICAL: Multiple device switches        │    │
│  └──────────────────────────────────────────────┘      │
│                                                          │
│  RECENT FLAGS                                           │
│  ┌──────────────────────────────────────────────┐      │
│  │ 🔴 Bob Lee - Device Changed (2:15 PM)         │      │
│  │ 🟡 John Doe - Tab Switch (2:10 PM)            │      │
│  │ 🟡 Mary Jane - Excessive Idle: 5 min (2:08 PM)│      │
│  └──────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

### Key Features

1. **Real-Time Updates**: Poll every 10 seconds
2. **Sort Options**: By progress, flags, start time
3. **Filter Options**: By status, flag severity
4. **Action Buttons**:
   - Terminate attempt
   - View details
   - Export report
5. **Notifications**: Toast alerts for critical flags

---

## 🚀 Implementation Order

### Phase 1: Participant Tracking (Week 1)
1. ✅ Add participant creation in startAttempt
2. ✅ Create progress update endpoint
3. ✅ Implement frontend progress tracking
4. ✅ Build basic monitoring dashboard
5. ✅ Test real-time updates

### Phase 2: Device Session Tracking (Week 2)
1. ✅ Add device session creation on start
2. ✅ Implement device change detection in heartbeat
3. ✅ Create device history endpoint
4. ✅ Build device timeline view
5. ✅ Test device switching scenarios

### Phase 3: Security Flags (Week 3)
1. ✅ Create centralized flag service
2. ✅ Implement auto-flags (device change, IP change)
3. ✅ Create client flag endpoint
4. ✅ Implement frontend flag detection (tab switch, paste, etc.)
5. ✅ Build flag dashboard
6. ✅ Add flag filtering and sorting
7. ✅ Test all flag types

### Phase 4: Polish & Testing (Week 4)
1. ✅ Real-time polling optimization
2. ✅ Performance testing with 100+ students
3. ✅ Mobile responsive design
4. ✅ Export reports feature
5. ✅ Teacher training documentation

---

## 📈 Success Metrics

### Technical Metrics
- ✅ Progress updates within 1 second
- ✅ Flags created within 2 seconds of event
- ✅ Dashboard loads in < 500ms
- ✅ Supports 200+ concurrent students

### User Experience Metrics
- ✅ Teachers can identify struggling students quickly
- ✅ Clear visual indicators for suspicious behavior
- ✅ No false positives for legitimate behavior
- ✅ Easy-to-understand flag descriptions

---

## 🎓 Teacher Use Cases

### Use Case 1: Catching Cheaters
**Scenario**: Bob opens quiz on laptop, switches to phone to look up answers.

**System Response**:
1. Device change detected → 🔴 Critical flag created
2. `quiz_device_sessions` logs both devices
3. Teacher sees "🔴 Bob Lee - Device Changed" in real-time
4. Teacher can terminate attempt or review after quiz

### Use Case 2: Helping Struggling Students
**Scenario**: Sarah stuck on Question 2 for 10 minutes, not progressing.

**System Response**:
1. Progress tracking shows "Question 2/10" for 10+ minutes
2. 🟡 Warning flag "Excessive Idle: 10 minutes"
3. Teacher sees Sarah isn't moving forward
4. Teacher can reach out to help during quiz

### Use Case 3: Technical Issues
**Scenario**: John's internet drops, missing heartbeats.

**System Response**:
1. 🔵 Info flag "Heartbeat missed for 5 minutes"
2. Last heartbeat timestamp shows when connection lost
3. Teacher knows it's technical issue, not cheating
4. Can offer extended time or retake

---

## 🔐 Security & Privacy

### Data Protection
- ✅ Device fingerprints are hashed (not personally identifiable)
- ✅ IP addresses stored securely (GDPR compliant)
- ✅ Flags only accessible to quiz creator and admins
- ✅ Data retention: 1 year, then archived

### False Positive Prevention
- ✅ Info flags for benign events (no punishment)
- ✅ Warning flags require multiple occurrences
- ✅ Critical flags need strong evidence
- ✅ Teachers can dismiss flags with notes

---

## 🎉 Summary

This monitoring system is **POWERFUL** but **FAIR**:

✅ **Real-time visibility** into student progress
✅ **Comprehensive device tracking** for academic integrity
✅ **Smart flag system** with severity levels
✅ **Teacher-friendly dashboard** for quick action
✅ **Privacy-conscious** implementation

**Goal**: Maintain quiz integrity while supporting legitimate students.

---

**Ready to implement?** Let's start with Phase 1! 🚀
