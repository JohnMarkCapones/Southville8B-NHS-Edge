# Quiz Monitoring System - Recommendations & Improvements

## ✅ Completed: Section Information Feature

### Implementation
- Added JOIN to `students` table → `sections` table
- Displays formatted section info: `"Grade 10 - Section A"` or `"Section A"`
- Handles missing sections gracefully with `"N/A"` fallback

**Location**: `monitoring.service.ts:67-105, 149`

---

## 🚀 Recommended Improvements

### 1. Performance Optimizations

#### A. Database Query Optimization
**Priority**: HIGH | **Effort**: LOW

**Current Issue**: Multiple separate queries slow down response time
- Query 1: Get participants (with JOINs)
- Query 2: Get student sections
- Query 3: Get tab switch flags

**Recommendation**: Combine into a single query with subquery for flags

```typescript
const { data: participants, error } = await supabase
  .from('quiz_participants')
  .select(`
    *,
    quiz_active_sessions!inner (
      session_id, attempt_id, started_at, last_heartbeat,
      is_active, initial_device_fingerprint
    ),
    users!quiz_participants_student_id_fkey (
      id, full_name, email,
      students!inner (
        id, section_id,
        sections (id, name, grade_level)
      )
    )
  `)
  .eq('quiz_id', quizId)
  .in('status', ['active', 'not_started', 'flagged']);

// Then aggregate flags separately (still needed due to Supabase limitations)
```

**Benefits**:
- Reduces from 3 queries to 2 queries
- Faster response time (~30-50% improvement)
- Less database load

---

#### B. Add Response Caching
**Priority**: MEDIUM | **Effort**: MEDIUM

**Current Issue**: Every poll (10 seconds) hits the database even if no changes

**Recommendation**: Implement Redis caching with short TTL

```typescript
// In monitoring.service.ts
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export class MonitoringService {
  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getActiveParticipants(quizId: string, teacherId: string): Promise<any> {
    const cacheKey = `quiz:${quizId}:participants`;

    // Try cache first
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const result = await this.fetchParticipantsFromDB(quizId, teacherId);

    // Cache for 5 seconds
    await this.cacheManager.set(cacheKey, result, 5000);

    return result;
  }
}
```

**Benefits**:
- Reduces database load by 90%
- Faster API responses
- Can handle more concurrent teachers monitoring

**Setup Required**:
1. Install: `npm install @nestjs/cache-manager cache-manager`
2. Add to `app.module.ts`:
```typescript
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 5, // seconds
      max: 100, // maximum items in cache
    }),
    // ...
  ],
})
```

---

#### C. Add Database Indexes
**Priority**: HIGH | **Effort**: LOW

**Current Issue**: Queries scan entire tables without indexes

**Recommendation**: Create composite indexes

```sql
-- Speed up participant lookups
CREATE INDEX idx_quiz_participants_quiz_status
ON quiz_participants(quiz_id, status)
WHERE status IN ('active', 'not_started', 'flagged');

-- Speed up flag aggregation
CREATE INDEX idx_quiz_flags_student_type
ON quiz_flags(quiz_id, student_id, flag_type);

-- Speed up session lookups
CREATE INDEX idx_quiz_active_sessions_quiz_active
ON quiz_active_sessions(quiz_id, is_active)
WHERE is_active = true;
```

**Benefits**:
- 5-10x faster queries on large datasets
- Essential when scaling to 100+ simultaneous quiz takers

---

### 2. Real-Time Updates (WebSocket)

#### Upgrade from Polling to Push Notifications
**Priority**: MEDIUM | **Effort**: HIGH

**Current Issue**: Polling every 10 seconds wastes bandwidth and has 10-second delay

**Recommendation**: Use Supabase Realtime subscriptions

**Backend** (`monitoring.controller.ts`):
```typescript
import { Sse, MessageEvent } from '@nestjs/common';
import { Observable, interval, switchMap } from 'rxjs';

@Sse('quiz-monitoring/quiz/:quizId/stream')
participantStream(@Param('quizId') quizId: string): Observable<MessageEvent> {
  return new Observable((observer) => {
    const supabase = this.supabaseService.getClient();

    // Subscribe to changes
    const subscription = supabase
      .channel(`quiz:${quizId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'quiz_participants',
        filter: `quiz_id=eq.${quizId}`
      }, (payload) => {
        observer.next({
          data: { type: 'participant_update', payload }
        });
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'quiz_flags',
        filter: `quiz_id=eq.${quizId}`
      }, (payload) => {
        observer.next({
          data: { type: 'flag_created', payload }
        });
      })
      .subscribe();

    // Cleanup on disconnect
    return () => {
      subscription.unsubscribe();
    };
  });
}
```

**Frontend** (`useQuizMonitoring.ts`):
```typescript
useEffect(() => {
  if (!quizId) return;

  const eventSource = new EventSource(
    `${API_URL}/quiz-monitoring/quiz/${quizId}/stream`,
    { withCredentials: true }
  );

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'participant_update') {
      // Update participants state immediately
      fetchParticipants(quizId);
    } else if (data.type === 'flag_created') {
      // Update flags state immediately
      fetchFlags(quizId);
    }
  };

  return () => {
    eventSource.close();
  };
}, [quizId]);
```

**Benefits**:
- Instant updates (no 10-second delay)
- 90% less bandwidth usage
- Better user experience

---

### 3. Enhanced Security Features

#### A. Add IP Address Tracking
**Priority**: HIGH | **Effort**: LOW

**Current Issue**: No IP tracking to detect location changes

**Recommendation**: Display IP changes in monitoring UI

```typescript
// In monitoring.service.ts, add to participant transformation:
return {
  // ... existing fields
  initial_ip: session?.initial_ip_address || 'Unknown',
  current_ip: session?.current_ip_address || 'Unknown',
  ip_changed: session?.initial_ip_address !== session?.current_ip_address,
};
```

**Frontend Display**:
```tsx
{participant.ip_changed && (
  <Badge variant="destructive">
    <AlertTriangle className="h-3 w-3 mr-1" />
    IP Changed
  </Badge>
)}
```

---

#### B. Add Screen Recording Detection
**Priority**: MEDIUM | **Effort**: MEDIUM

**Recommendation**: Detect screen recording software

**Frontend** (`useQuizFlags.ts`):
```typescript
useEffect(() => {
  // Detect if screen is being captured
  const detectScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      // If this succeeds, screen is being shared
      submitFlag(FlagType.SCREEN_RECORDING, {
        detected: true,
        timestamp: new Date().toISOString()
      });

      stream.getTracks().forEach(track => track.stop());
    } catch (e) {
      // User denied or no screen sharing active (good)
    }
  };

  // Check every 30 seconds
  const interval = setInterval(detectScreenCapture, 30000);

  return () => clearInterval(interval);
}, [attemptId]);
```

---

#### C. Add Mouse Activity Tracking
**Priority**: LOW | **Effort**: LOW

**Recommendation**: Detect if student is idle but clock is running

```typescript
// Track mouse movements
let lastMouseMove = Date.now();

document.addEventListener('mousemove', () => {
  lastMouseMove = Date.now();
});

// Check for inactivity every minute
setInterval(() => {
  const idleSeconds = (Date.now() - lastMouseMove) / 1000;

  if (idleSeconds > 180) { // 3 minutes idle
    submitFlag(FlagType.IDLE, {
      idleSeconds,
      possibleReasonAwayFromComputer: true
    });
  }
}, 60000);
```

---

### 4. Enhanced Monitoring UI Features

#### A. Live Video Proctoring (Optional)
**Priority**: LOW | **Effort**: VERY HIGH

**Recommendation**: Add optional webcam monitoring

**Requirements**:
- Student consent required
- GDPR/privacy compliance needed
- Significant bandwidth usage

**Implementation**: Use WebRTC peer-to-peer video streaming

---

#### B. Question-Level Analytics
**Priority**: MEDIUM | **Effort**: MEDIUM

**Recommendation**: Show which question each student is currently on

**Backend**: Already tracked in `quiz_participants.current_question_index`

**Frontend Enhancement**:
```tsx
<div className="flex items-center gap-2">
  <FileText className="h-4 w-4" />
  <span>Currently on: Q{participant.currentQuestionIndex + 1}</span>
  {participant.timeOnCurrentQuestion > 300 && (
    <Badge variant="warning">Stuck (5+ min)</Badge>
  )}
</div>
```

---

#### C. Add Live Chat/Messaging
**Priority**: MEDIUM | **Effort**: MEDIUM

**Recommendation**: Allow teacher to message students during quiz

```typescript
// Use case: "You have 5 minutes remaining"
const sendMessage = async (studentId: string, message: string) => {
  await quizApi.monitoring.sendMessage({
    quizId,
    studentId,
    message,
    priority: 'info' // or 'warning'
  });
};
```

**Student Side**: Show toast notification with teacher's message

---

#### D. Add Bulk Actions
**Priority**: MEDIUM | **Effort**: LOW

**Recommendation**: Add ability to terminate/flag multiple students at once

```tsx
<Button
  onClick={() => terminateSelected()}
  disabled={selectedStudents.length === 0}
>
  Terminate Selected ({selectedStudents.length})
</Button>
```

---

#### E. Add Export/Report Generation
**Priority**: HIGH | **Effort**: MEDIUM

**Recommendation**: Export monitoring data as PDF/CSV report

```typescript
const exportMonitoringReport = async (quizId: string) => {
  const data = await quizApi.monitoring.generateReport(quizId);

  // CSV format
  const csv = generateCSV(data);
  downloadFile(csv, `quiz-${quizId}-monitoring.csv`);

  // PDF format with charts
  const pdf = generatePDF(data);
  downloadFile(pdf, `quiz-${quizId}-report.pdf`);
};
```

**Report Includes**:
- List of all participants
- Flag summary by student
- Time spent per question
- Suspicious activity timeline
- Charts and graphs

---

### 5. Database Schema Enhancements

#### A. Add Monitoring Snapshots Table
**Priority**: MEDIUM | **Effort**: LOW

**Recommendation**: Store periodic snapshots for historical analysis

```sql
CREATE TABLE quiz_monitoring_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id),
  snapshot_time TIMESTAMPTZ DEFAULT NOW(),
  active_count INTEGER,
  flagged_count INTEGER,
  completed_count INTEGER,
  average_progress DECIMAL,
  snapshot_data JSONB, -- Full participant data
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Take snapshot every 60 seconds
CREATE INDEX idx_snapshots_quiz_time
ON quiz_monitoring_snapshots(quiz_id, snapshot_time DESC);
```

**Use Case**: Replay quiz session after completion to see how it unfolded

---

#### B. Add Alert Rules Table
**Priority**: LOW | **Effort**: MEDIUM

**Recommendation**: Define custom alert rules per quiz

```sql
CREATE TABLE quiz_alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(quiz_id),
  rule_type VARCHAR(50), -- 'tab_switch_threshold', 'time_per_question', etc.
  threshold INTEGER,
  action VARCHAR(50), -- 'notify_teacher', 'auto_terminate', 'flag_student'
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example: Auto-terminate if 5 tab switches
INSERT INTO quiz_alert_rules (quiz_id, rule_type, threshold, action)
VALUES ('quiz-123', 'tab_switch_threshold', 5, 'auto_terminate');
```

---

### 6. Notification System

#### Add Teacher Alert Notifications
**Priority**: HIGH | **Effort**: MEDIUM

**Recommendation**: Notify teacher when critical flags occur

**Backend** (`monitoring.service.ts`):
```typescript
async createFlag(/* ... */) {
  // ... existing code

  // If critical severity, notify teacher
  if (severity === 'critical') {
    await this.notificationService.sendTeacherAlert({
      teacherId: quiz.teacher_id,
      type: 'critical_flag',
      message: `Student ${studentName} triggered critical flag: ${flagType}`,
      quizId,
      studentId,
      actionUrl: `/teacher/quiz/${quizId}/monitor`
    });
  }
}
```

**Frontend**: Show real-time notification toast
```tsx
{newCriticalFlag && (
  <Toast variant="destructive">
    <AlertTriangle className="h-5 w-5" />
    <div>
      <p className="font-semibold">Critical Flag Detected</p>
      <p>{newCriticalFlag.student_name} - {newCriticalFlag.description}</p>
    </div>
  </Toast>
)}
```

---

### 7. Advanced Analytics

#### A. Add Anomaly Detection
**Priority**: LOW | **Effort**: HIGH

**Recommendation**: Use ML to detect unusual patterns

**Examples**:
- Student answering too fast (possible cheating)
- Student answering in perfect sequential order (suspicious)
- Sudden accuracy spike (possible external help)

**Implementation**: Use simple statistical analysis first
```typescript
const detectAnomalies = (participant) => {
  const avgTimePerQuestion = participant.time_elapsed / participant.questions_answered;

  // Flag if average < 10 seconds per question
  if (avgTimePerQuestion < 10) {
    return {
      type: 'too_fast',
      severity: 'critical',
      message: `Averaging ${avgTimePerQuestion}s per question`
    };
  }

  return null;
};
```

---

#### B. Add Heatmap View
**Priority**: LOW | **Effort**: MEDIUM

**Recommendation**: Visualize question difficulty

```tsx
<div className="grid grid-cols-10 gap-2">
  {questions.map((q, idx) => {
    const correctRate = getCorrectRate(q.id);
    return (
      <div
        key={q.id}
        className={`
          aspect-square rounded
          ${correctRate > 0.8 ? 'bg-green-500' :
            correctRate > 0.5 ? 'bg-yellow-500' : 'bg-red-500'}
        `}
        title={`Q${idx + 1}: ${correctRate * 100}% correct`}
      >
        {idx + 1}
      </div>
    );
  })}
</div>
```

---

## 📊 Priority Matrix

| Feature | Priority | Effort | Impact | Recommended Order |
|---------|----------|--------|--------|-------------------|
| Database Indexes | HIGH | LOW | HIGH | 1 |
| Section Info (Done) | HIGH | LOW | MEDIUM | ✅ |
| Export Reports | HIGH | MEDIUM | HIGH | 2 |
| IP Tracking | HIGH | LOW | MEDIUM | 3 |
| Teacher Notifications | HIGH | MEDIUM | HIGH | 4 |
| Query Optimization | HIGH | LOW | MEDIUM | 5 |
| Response Caching | MEDIUM | MEDIUM | MEDIUM | 6 |
| Real-Time WebSocket | MEDIUM | HIGH | HIGH | 7 |
| Question Analytics | MEDIUM | MEDIUM | MEDIUM | 8 |
| Bulk Actions | MEDIUM | LOW | LOW | 9 |
| Live Chat | MEDIUM | MEDIUM | LOW | 10 |

---

## 🎯 Quick Wins (Do These First)

1. **Add Database Indexes** (10 minutes)
   - Immediate performance boost
   - No code changes needed

2. **Add IP Tracking Display** (30 minutes)
   - Data already captured
   - Just display in UI

3. **Add Export Button** (2 hours)
   - Teachers want this
   - Easy implementation

---

## 💡 Final Recommendations

### For Production Launch:
1. ✅ Implement database indexes (MUST)
2. ✅ Add export reports feature (MUST)
3. ✅ Add teacher notifications (MUST)
4. ⚠️ Consider WebSocket for scale (SHOULD)
5. 📝 Document monitoring features for teachers (MUST)

### For Future Iterations:
- AI-powered cheating detection
- Video proctoring (with consent)
- Integration with school disciplinary system
- Mobile app for monitoring on-the-go

---

## 📝 Documentation Needs

Create teacher guide:
- How to interpret flags
- When to terminate attempts
- How to review suspicious activity
- Best practices for quiz security

---

**Total Estimated Effort for All High-Priority Items**: ~2-3 days
**Expected Performance Improvement**: 3-5x faster, more reliable
