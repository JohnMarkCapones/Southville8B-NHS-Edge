# Quiz Security Flags - Complete Guide

## Overview

The quiz system automatically detects and logs suspicious behavior during quiz attempts. These "flags" help teachers identify potential cheating or integrity issues.

---

## 🚩 All Flag Types

### 1. **Tab Switch** (`tab_switch`)
**Severity**: ⚠️ Warning

**What it detects**: Student switches away from the quiz tab (Alt+Tab, clicking another window, etc.)

**How it works**:
- Frontend: `document.visibilitychange` event
- Triggers when `document.hidden === true`
- Tracks total count

**Metadata**:
```json
{
  "count": 3,
  "documentHidden": true,
  "timestamp": "2025-11-08T01:40:00Z",
  "userAgent": "Mozilla/5.0..."
}
```

**Teacher sees**: "Student switched tabs 3 times during quiz"

**Configuration**: Set `trackTabSwitches: true` in quiz settings

---

### 2. **Copy/Paste** (`copy_paste`)
**Severity**: ⚠️ Warning

**What it detects**: Student attempts to copy text from the quiz or paste content into answers

**How it works**:
- Frontend: `copy` and `paste` events
- Tracks separate counts for copy vs paste
- Can be disabled for certain question types (e.g., essay questions where paste is allowed)

**Metadata**:
```json
{
  "action": "copy" | "paste",
  "count": 2,
  "timestamp": "2025-11-08T01:40:00Z"
}
```

**Teacher sees**: "Student copied text 2 times" or "Student pasted content 1 time"

**Configuration**: Set `disableCopyPaste: true` in quiz settings to prevent copy/paste entirely

---

### 3. **Fullscreen Exit** (`fullscreen_exit`)
**Severity**: ⚠️ Warning

**What it detects**: Student exits fullscreen mode during quiz

**How it works**:
- Frontend: `fullscreenchange` event
- Only flags if quiz requires fullscreen mode
- Tracks how many times student exited fullscreen

**Metadata**:
```json
{
  "count": 1,
  "timestamp": "2025-11-08T01:40:00Z"
}
```

**Teacher sees**: "Student exited fullscreen 1 time"

**Configuration**: Set `requireFullscreen: true` in quiz settings

---

### 4. **Device Change** (`device_change`)
**Severity**: 🚨 Critical

**What it detects**: Student switches to a different device mid-quiz (different browser, computer, phone, etc.)

**How it works**:
- Backend: Compares device fingerprint on each heartbeat
- Fingerprint includes: browser, OS, screen resolution, timezone, etc.
- Automatically detected during heartbeat (every 30s)

**Metadata**:
```json
{
  "previous_device": "chrome-windows-1920x1080-utc-0",
  "new_device": "safari-iphone-390x844-utc-0",
  "previous_ip": "192.168.1.100",
  "new_ip": "192.168.1.200",
  "user_agent": "Mozilla/5.0...",
  "device_type": "mobile",
  "timestamp": "2025-11-08T01:40:00Z"
}
```

**Teacher sees**: "Student changed devices from Desktop (Chrome) to Mobile (Safari)"

**Configuration**: Set `trackDeviceChanges: true` in quiz settings

---

### 5. **Network Disconnect** (`network_disconnect`)
**Severity**: ℹ️ Info

**What it detects**: Student's internet connection drops during quiz

**How it works**:
- Frontend: `offline` event
- Automatically logs when connection is lost
- Usually not suspicious (could be legitimate network issue)

**Metadata**:
```json
{
  "online": false,
  "timestamp": "2025-11-08T01:40:00Z"
}
```

**Teacher sees**: "Student lost network connection"

**Configuration**: Always tracked (can't be disabled)

---

### 6. **Browser Back Button** (`browser_back`)
**Severity**: ℹ️ Info

**What it detects**: Student presses browser back button

**How it works**:
- Frontend: `popstate` event
- Could indicate attempt to navigate away or confusion

**Metadata**:
```json
{
  "action": "browser_back_button",
  "timestamp": "2025-11-08T01:40:00Z"
}
```

**Teacher sees**: "Student pressed browser back button"

**Configuration**: Always tracked

---

### 7. **Multiple Sessions** (`multiple_sessions`)
**Severity**: 🚨 Critical

**What it detects**: Student has multiple active quiz sessions (e.g., opened quiz on 2 different browsers)

**How it works**:
- Backend: Checks for duplicate `(student_id, quiz_id)` in `quiz_active_sessions`
- Automatically terminates old sessions when new one starts
- Creates flag for audit trail

**Metadata**:
```json
{
  "session_count": 2,
  "previous_session_id": "abc-123...",
  "new_session_id": "def-456...",
  "timestamp": "2025-11-08T01:40:00Z"
}
```

**Teacher sees**: "Student had multiple simultaneous sessions"

**Configuration**: Always enforced (can't have multiple sessions)

---

## 📊 Flag Severity Levels

### ℹ️ Info (Informational)
- **Color**: Blue
- **Meaning**: Noteworthy event, not necessarily suspicious
- **Examples**: Network disconnect, browser back button
- **Action**: Teacher can review but usually no action needed

### ⚠️ Warning (Suspicious)
- **Color**: Orange/Yellow
- **Meaning**: Potentially suspicious behavior, warrants investigation
- **Examples**: Tab switches, copy/paste, fullscreen exits
- **Action**: Teacher should review and decide if action needed
- **Threshold**: Quiz settings can define max warnings before action

### 🚨 Critical (High Risk)
- **Color**: Red
- **Meaning**: High probability of cheating or integrity violation
- **Examples**: Device changes, multiple sessions
- **Action**: Teacher should investigate immediately, may warrant invalidating quiz

---

## 🔧 Backend Implementation

### Flag Storage (Database)

**Table**: `quiz_flags`

**Schema**:
```sql
CREATE TABLE quiz_flags (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES quiz_active_sessions,
  quiz_id UUID REFERENCES quizzes,
  participant_id UUID REFERENCES quiz_participants,
  student_id UUID,
  flag_type VARCHAR(100),  -- 'tab_switch', 'copy_paste', etc.
  severity VARCHAR(50),     -- 'info', 'warning', 'critical'
  message TEXT,
  metadata JSONB,           -- Additional context
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### Flag Creation Methods

**1. Optimized (Use existing data)**:
```typescript
await createFlagDirect(
  sessionId,   // Already have from heartbeat
  quizId,      // Already have from heartbeat
  studentId,
  'device_change',
  'critical',
  metadata
);
```
**Queries**: 2 (fetch participant + insert flag)

**2. Standard (Fetch data first)**:
```typescript
await createFlag(
  attemptId,
  studentId,
  'tab_switch',
  'warning',
  metadata
);
```
**Queries**: 4 (fetch session + fetch participant + insert flag)

---

## 🎨 Frontend Implementation

### Using the Hook

**Basic usage**:
```typescript
import { useQuizFlags } from '@/hooks/useQuizFlags';

const {
  tabSwitchCount,
  copyCount,
  pasteCount,
  fullscreenExitCount,
  isFullscreen,
  submitFlag,
  requestFullscreen,
  exitFullscreen,
} = useQuizFlags(attemptId, {
  detectTabSwitch: true,
  detectCopyPaste: true,
  detectFullscreenExit: true,
  detectNetworkDisconnect: true,
  detectBrowserBack: true,
});
```

**Manual flag submission**:
```typescript
// Submit custom flag
await submitFlag(FlagType.COPY_PASTE, {
  customData: 'value'
});
```

**Fullscreen control**:
```typescript
// Request fullscreen
await requestFullscreen();

// Exit fullscreen
await exitFullscreen();
```

---

## 👨‍🏫 Teacher Monitoring

### Viewing Flags

**Monitor Page** (`/teacher/quiz/[id]/monitor`):
- Real-time flag notifications
- Student-by-student flag history
- Severity-based filtering
- Flag timeline view

**Grading Page** (`/teacher/quiz/[id]/grade`):
- Flags shown per student submission
- Quick review of flagged attempts
- Option to invalidate quiz based on flags

### Flag Display

**Example**:
```
🚨 Critical: Device Change
   Student: John Doe
   Time: 1:45 PM
   Details: Changed from Desktop (Chrome) to Mobile (Safari)
   IP: 192.168.1.100 → 192.168.1.200

⚠️ Warning: Tab Switch (3 times)
   Student: Jane Smith
   Time: 2:10 PM
   Details: Switched tabs 3 times during quiz

ℹ️ Info: Network Disconnect
   Student: Bob Johnson
   Time: 3:00 PM
   Details: Lost connection briefly
```

---

## ⚙️ Quiz Settings Configuration

### Enable/Disable Flags

**In Quiz Builder** (`/teacher/quiz/create`):

```typescript
{
  quizSettings: {
    // Security monitoring
    trackTabSwitches: true,
    trackDeviceChanges: true,
    trackIPChanges: true,

    // Restrictions
    disableCopyPaste: true,
    disableRightClick: true,
    requireFullscreen: true,
    lockdownBrowser: false,

    // Thresholds
    tabSwitchWarningThreshold: 3  // Flag after 3 switches
  }
}
```

### Backend Validation

Flags are created **regardless** of settings (for audit trail), but thresholds can trigger automatic actions:

```typescript
// Example: Auto-terminate quiz after too many tab switches
if (tabSwitchCount > quizSettings.tabSwitchWarningThreshold) {
  await terminateQuizAttempt(attemptId, 'too_many_tab_switches');
}
```

---

## 📈 Analytics

### Flag Statistics

**Per Quiz**:
- Total flags by type
- Average flags per student
- Most flagged question

**Per Student**:
- Flag history across all quizzes
- Pattern detection (consistent tab switching, etc.)
- Integrity score

---

## 🔒 Privacy & Ethics

### What We Track

✅ **We do track**:
- Browser visibility changes (tab switches)
- Copy/paste events
- Fullscreen state
- Device fingerprint (browser, OS, screen size)
- Network connectivity
- Navigation events

❌ **We don't track**:
- Actual clipboard content
- Keystrokes outside quiz
- Screenshots
- Other browser tabs/windows
- Personal files

### Student Notification

Students should be informed that:
1. Quiz behavior is monitored
2. Specific actions trigger flags
3. Teachers review flags for integrity
4. Flags don't auto-fail quiz (teacher discretion)

**Display warning before quiz**:
```
This quiz uses monitoring to ensure academic integrity.
The following will be logged:
• Tab switches
• Copy/paste attempts
• Fullscreen exits
• Device changes

Your responses will be submitted to your teacher for review.
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Too many false positives**:
- **Problem**: Tab switch flags when student using calculator app
- **Solution**: Adjust `tabSwitchWarningThreshold` or allow calculator in quiz

**2. Flags not appearing**:
- **Problem**: No flags showing in teacher monitor
- **Solution**: Check quiz settings, verify frontend hook is initialized

**3. Duplicate flags**:
- **Problem**: Same flag submitted multiple times
- **Solution**: Hook uses `submittingRef` to prevent duplicates (already implemented)

**4. Device change false alarm**:
- **Problem**: Same student, same computer flagged as device change
- **Solution**: Browser fingerprint changed (user cleared cache, updated browser, etc.) - this is expected

---

## 📝 Summary

| Flag Type | Severity | Auto-Detected | Can Disable | Common Cause |
|-----------|----------|---------------|-------------|--------------|
| Tab Switch | ⚠️ Warning | Yes | Via settings | Alt+Tab, multiple windows |
| Copy/Paste | ⚠️ Warning | Yes | Via settings | Ctrl+C/Ctrl+V |
| Fullscreen Exit | ⚠️ Warning | Yes | Via settings | ESC key, F11 |
| Device Change | 🚨 Critical | Yes | No | Different browser/device |
| Network Disconnect | ℹ️ Info | Yes | No | WiFi drop, network issue |
| Browser Back | ℹ️ Info | Yes | No | Back button click |
| Multiple Sessions | 🚨 Critical | Yes | No | Opening quiz twice |

---

**Date**: November 8, 2025
**Status**: ✅ All flags implemented and working
**Performance**: Optimized with `createFlagDirect()` for faster processing
