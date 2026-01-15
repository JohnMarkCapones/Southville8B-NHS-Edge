# Gamification System Design Document
## Southville 8B NHS Edge - Technical Specification

**Version:** 1.0
**Last Updated:** 2025-11-20
**Status:** Implementation Phase

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Points & XP System](#points--xp-system)
5. [Badge System](#badge-system)
6. [Level Progression](#level-progression)
7. [Streak System](#streak-system)
8. [Leaderboard System](#leaderboard-system)
9. [API Endpoints](#api-endpoints)
10. [Frontend Components](#frontend-components)
11. [Integration Points](#integration-points)
12. [Security Considerations](#security-considerations)

---

## System Overview

### Purpose
Implement a comprehensive gamification system to increase student engagement, motivation, and healthy competition without physical rewards. Students earn points, unlock badges, level up, maintain streaks, and compete on leaderboards.

### Core Components
- **Points System**: Award points for various activities and achievements
- **Badge System**: Unlock badges based on specific criteria
- **Level System**: Progress through levels as points accumulate
- **Streak System**: Track daily login and activity streaks
- **Leaderboard**: Global, grade-level, and section rankings

### Key Principles
- ✅ **No Physical Rewards**: Pure digital recognition and achievements
- ✅ **Transparency**: Clear criteria for earning points and badges
- ✅ **Fairness**: Equal opportunities for all students
- ✅ **Privacy**: Personal data protected, opt-in leaderboard participation
- ✅ **Integration**: Seamlessly connects with existing systems

---

## Architecture

### Technology Stack
- **Backend**: NestJS 11 + Fastify
- **Database**: Supabase PostgreSQL with RLS
- **Frontend**: Next.js 15 + TypeScript
- **State Management**: React hooks + API caching
- **Real-time**: PostgreSQL triggers + webhooks (future)

### Module Structure

```
Backend (NestJS):
src/gamification/
├── gamification.module.ts
├── controllers/
│   ├── gamification.controller.ts
│   └── badge.controller.ts
├── services/
│   ├── points.service.ts
│   ├── badge.service.ts
│   ├── level.service.ts
│   ├── leaderboard.service.ts
│   └── streak.service.ts
├── entities/
│   ├── student-gamification.entity.ts
│   ├── badge.entity.ts
│   ├── student-badge.entity.ts
│   └── point-transaction.entity.ts
└── dto/
    ├── award-points.dto.ts
    ├── earn-badge.dto.ts
    └── leaderboard-query.dto.ts

Frontend (Next.js):
frontend-nextjs/
├── app/
│   ├── student/
│   │   ├── achievements/page.tsx (NEW)
│   │   ├── ranking/page.tsx (UPDATED)
│   │   └── page.tsx (UPDATED - dashboard)
│   └── superadmin/
│       └── gamification/page.tsx (NEW)
├── components/gamification/
│   ├── points-counter.tsx
│   ├── level-progress-bar.tsx
│   ├── badge-card.tsx
│   ├── badge-showcase.tsx
│   ├── leaderboard-table.tsx
│   ├── streak-calendar.tsx
│   ├── achievement-notification.tsx
│   └── mini-leaderboard.tsx
└── lib/api/endpoints/
    └── gamification.ts
```

---

## Database Schema

### 1. `student_gamification`
Core gamification profile for each student.

```sql
CREATE TABLE student_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Points & Level
  total_points INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  level_progress INTEGER NOT NULL DEFAULT 0,  -- 0-100 percentage
  points_to_next_level INTEGER NOT NULL DEFAULT 100,

  -- Streaks
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,

  -- Statistics
  total_badges INTEGER NOT NULL DEFAULT 0,
  quiz_points INTEGER NOT NULL DEFAULT 0,
  activity_points INTEGER NOT NULL DEFAULT 0,
  streak_points INTEGER NOT NULL DEFAULT 0,
  bonus_points INTEGER NOT NULL DEFAULT 0,

  -- Leaderboard
  global_rank INTEGER,
  grade_rank INTEGER,
  section_rank INTEGER,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(student_id)
);

-- Indexes
CREATE INDEX idx_student_gamification_student_id ON student_gamification(student_id);
CREATE INDEX idx_student_gamification_total_points ON student_gamification(total_points DESC);
CREATE INDEX idx_student_gamification_level ON student_gamification(level DESC);
CREATE INDEX idx_student_gamification_streak ON student_gamification(current_streak DESC);

-- Updated trigger
CREATE OR REPLACE FUNCTION update_student_gamification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_student_gamification_timestamp
BEFORE UPDATE ON student_gamification
FOR EACH ROW EXECUTE FUNCTION update_student_gamification_timestamp();
```

### 2. `badges`
Badge catalog with definitions and criteria.

```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification
  badge_key VARCHAR(100) UNIQUE NOT NULL,  -- e.g., 'quiz-master-bronze'
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Visual
  icon VARCHAR(100),  -- Lucide icon name (e.g., 'Trophy', 'Star', 'Award')
  color VARCHAR(50),  -- Tailwind color (e.g., 'text-yellow-500')
  image_url TEXT,     -- Optional custom badge image

  -- Classification
  category VARCHAR(50),  -- 'academic', 'participation', 'social', 'streak', 'special'
  tier VARCHAR(50),      -- 'bronze', 'silver', 'gold', 'platinum', 'diamond'
  rarity VARCHAR(50),    -- 'common', 'uncommon', 'rare', 'epic', 'legendary'

  -- Rewards
  points_reward INTEGER DEFAULT 0,

  -- Criteria (JSON for flexibility)
  criteria JSONB,  -- { "type": "quiz_score", "min_score": 95, "count": 10 }

  -- Progressive badges
  is_progressive BOOLEAN DEFAULT FALSE,
  progress_target INTEGER,  -- If progressive, target count

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_hidden BOOLEAN DEFAULT FALSE,  -- Hidden until earned

  -- Display order
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_badges_category ON badges(category);
CREATE INDEX idx_badges_tier ON badges(tier);
CREATE INDEX idx_badges_active ON badges(is_active);
CREATE INDEX idx_badges_display_order ON badges(display_order);
```

### 3. `student_badges`
Junction table tracking earned badges.

```sql
CREATE TABLE student_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,

  -- Progress tracking
  current_progress INTEGER DEFAULT 100,  -- 0-100 for progressive badges
  progress_count INTEGER DEFAULT 0,      -- Actual count (e.g., 7 of 10 quizzes)

  -- Earned status
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_showcased BOOLEAN DEFAULT FALSE,  -- Student can showcase favorite badges

  -- Metadata
  metadata JSONB,  -- Additional data (e.g., quiz details, score achieved)

  UNIQUE(student_id, badge_id)
);

-- Indexes
CREATE INDEX idx_student_badges_student_id ON student_badges(student_id);
CREATE INDEX idx_student_badges_badge_id ON student_badges(badge_id);
CREATE INDEX idx_student_badges_earned_at ON student_badges(earned_at DESC);
CREATE INDEX idx_student_badges_showcased ON student_badges(is_showcased) WHERE is_showcased = TRUE;
```

### 4. `point_transactions`
Audit trail for all point awards and deductions.

```sql
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  -- Transaction details
  points INTEGER NOT NULL,  -- Positive for awards, negative for deductions
  transaction_type VARCHAR(100) NOT NULL,  -- 'quiz_completion', 'badge_earned', 'streak_bonus'
  category VARCHAR(50),  -- 'quiz', 'activity', 'streak', 'bonus', 'penalty'

  -- Context
  reason TEXT,
  metadata JSONB,  -- Flexible data (quiz_id, score, badge_id, etc.)

  -- Related entities
  related_entity_id UUID,      -- e.g., quiz_attempt_id, badge_id
  related_entity_type VARCHAR(50),  -- e.g., 'quiz_attempt', 'badge'

  -- Attribution
  created_by UUID,  -- NULL for system-awarded, user_id for manual
  is_manual BOOLEAN DEFAULT FALSE,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Balance snapshot (for reconciliation)
  balance_after INTEGER
);

-- Indexes
CREATE INDEX idx_point_transactions_student_id ON point_transactions(student_id);
CREATE INDEX idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX idx_point_transactions_category ON point_transactions(category);
CREATE INDEX idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX idx_point_transactions_related_entity ON point_transactions(related_entity_id, related_entity_type);
```

### 5. `leaderboard_cache`
Cached leaderboard data for performance.

```sql
CREATE TABLE leaderboard_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Scope
  scope VARCHAR(50) NOT NULL,  -- 'global', 'grade_7', 'grade_8', 'section_A'
  scope_value VARCHAR(100),    -- e.g., '7', 'A', NULL for global

  -- Leaderboard data
  data JSONB NOT NULL,  -- Array of ranked students

  -- Metadata
  total_students INTEGER,
  last_refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(scope, scope_value)
);

-- Indexes
CREATE INDEX idx_leaderboard_cache_scope ON leaderboard_cache(scope);
CREATE INDEX idx_leaderboard_cache_refreshed ON leaderboard_cache(last_refreshed_at);
```

### 6. Materialized View: `leaderboard_global`
Fast read-only view for global leaderboard.

```sql
CREATE MATERIALIZED VIEW leaderboard_global AS
SELECT
  s.id AS student_id,
  s.user_id,
  s.first_name,
  s.last_name,
  s.student_id AS student_number,
  s.grade_level,
  s.section_id,
  sec.name AS section_name,
  sg.total_points,
  sg.level,
  sg.current_streak,
  sg.total_badges,
  sg.quiz_points,
  sg.activity_points,
  RANK() OVER (ORDER BY sg.total_points DESC, sg.level DESC) AS global_rank,
  RANK() OVER (PARTITION BY s.grade_level ORDER BY sg.total_points DESC) AS grade_rank,
  RANK() OVER (PARTITION BY s.section_id ORDER BY sg.total_points DESC) AS section_rank
FROM students s
JOIN student_gamification sg ON s.id = sg.student_id
LEFT JOIN sections sec ON s.section_id = sec.id
WHERE s.deleted_at IS NULL;

-- Indexes on materialized view
CREATE UNIQUE INDEX idx_leaderboard_global_student_id ON leaderboard_global(student_id);
CREATE INDEX idx_leaderboard_global_points ON leaderboard_global(total_points DESC);
CREATE INDEX idx_leaderboard_global_rank ON leaderboard_global(global_rank);
CREATE INDEX idx_leaderboard_global_grade ON leaderboard_global(grade_level, grade_rank);
CREATE INDEX idx_leaderboard_global_section ON leaderboard_global(section_id, section_rank);

-- Refresh function (call via cron or trigger)
CREATE OR REPLACE FUNCTION refresh_leaderboard_global()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_global;
END;
$$ LANGUAGE plpgsql;
```

### Row-Level Security (RLS) Policies

```sql
-- student_gamification: Students can read their own, everyone can read all
ALTER TABLE student_gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view all gamification data"
  ON student_gamification FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Students can update own gamification data"
  ON student_gamification FOR UPDATE
  TO authenticated
  USING (student_id IN (
    SELECT s.id FROM students s WHERE s.user_id = auth.uid()
  ));

-- badges: Everyone can read active badges
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active badges"
  ON badges FOR SELECT
  TO authenticated
  USING (is_active = true);

-- student_badges: Students can read their own, teachers can read all
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own badges"
  ON student_badges FOR SELECT
  TO authenticated
  USING (student_id IN (
    SELECT s.id FROM students s WHERE s.user_id = auth.uid()
  ));

-- point_transactions: Students can read their own
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own transactions"
  ON point_transactions FOR SELECT
  TO authenticated
  USING (student_id IN (
    SELECT s.id FROM students s WHERE s.user_id = auth.uid()
  ));
```

---

## Points & XP System

### Point Categories

| Category | Description | Example Activities |
|----------|-------------|-------------------|
| **Quiz** | Points from quiz performance | Quiz completion, high scores, perfect scores |
| **Activity** | General engagement points | Daily login, module download, club join |
| **Streak** | Consistency rewards | 7-day streak, 30-day streak, 100-day streak |
| **Bonus** | Special achievements | First quiz, helping peers, event participation |
| **Penalty** | Deductions (rare) | Policy violations (admin only) |

### Point Award Rules

#### Quiz-Based Points
```typescript
// Base formula
basePoints = (score / maxScore) * 100

// Multipliers
if (score === maxScore) basePoints *= 1.5;  // Perfect score bonus
if (timeTaken < timeLimit * 0.5) basePoints *= 1.2;  // Speed bonus
if (attemptNumber === 1) basePoints *= 1.1;  // First attempt bonus

// Final calculation
finalPoints = Math.round(basePoints);
```

**Examples:**
- Quiz 90% on first try: `(90/100) * 100 * 1.1 = 99 points`
- Perfect quiz: `(100/100) * 100 * 1.5 = 150 points`
- Perfect quiz + fast: `(100/100) * 100 * 1.5 * 1.2 = 180 points`

#### Activity-Based Points
- **Daily Login**: 10 points
- **Module Download**: 5 points
- **Club Join**: 20 points
- **Event Attendance**: 30 points
- **Article Published**: 50 points
- **Helping Peer**: 25 points (teacher-awarded)

#### Streak Milestones
- **7 days**: 50 bonus points + Bronze Streak badge
- **14 days**: 100 bonus points
- **30 days**: 250 bonus points + Silver Streak badge
- **60 days**: 500 bonus points
- **100 days**: 1000 bonus points + Gold Streak badge
- **365 days**: 5000 bonus points + Diamond Streak badge

### Point Transaction Types

```typescript
enum PointTransactionType {
  // Quiz
  QUIZ_COMPLETED = 'quiz_completed',
  QUIZ_PERFECT_SCORE = 'quiz_perfect_score',
  QUIZ_SPEED_BONUS = 'quiz_speed_bonus',
  QUIZ_FIRST_ATTEMPT = 'quiz_first_attempt',

  // Activity
  DAILY_LOGIN = 'daily_login',
  MODULE_DOWNLOAD = 'module_download',
  CLUB_JOINED = 'club_joined',
  EVENT_ATTENDED = 'event_attended',
  ARTICLE_PUBLISHED = 'article_published',

  // Streak
  STREAK_MILESTONE = 'streak_milestone',
  STREAK_MAINTAINED = 'streak_maintained',

  // Badge
  BADGE_EARNED = 'badge_earned',

  // Bonus
  HELPING_PEER = 'helping_peer',
  FIRST_PERFECT_QUIZ = 'first_perfect_quiz',
  TOP_GRADE_RANK = 'top_grade_rank',

  // Manual
  MANUAL_AWARD = 'manual_award',
  MANUAL_DEDUCTION = 'manual_deduction',

  // System
  LEVEL_UP_BONUS = 'level_up_bonus',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
}
```

---

## Badge System

### Badge Categories

1. **Academic** - Quiz and learning achievements
2. **Participation** - Engagement and activity
3. **Social** - Community and collaboration
4. **Streak** - Consistency and dedication
5. **Special** - Rare and unique achievements

### Badge Tiers

- **Bronze** - Entry level, easy to achieve
- **Silver** - Moderate difficulty
- **Gold** - Challenging, significant achievement
- **Platinum** - Very difficult, elite achievement
- **Diamond** - Extremely rare, legendary status

### Badge Rarity

- **Common** (60%) - Most students can earn
- **Uncommon** (25%) - Requires dedication
- **Rare** (10%) - Requires skill and consistency
- **Epic** (4%) - Very few students earn
- **Legendary** (1%) - Extremely exclusive

### Badge Criteria Format

Badges use flexible JSON criteria:

```json
{
  "type": "quiz_perfect_score",
  "count": 10,
  "conditions": {
    "min_quiz_points": 50,
    "time_limit_met": true
  }
}
```

```json
{
  "type": "streak_milestone",
  "days": 30
}
```

```json
{
  "type": "leaderboard_rank",
  "scope": "grade",
  "max_rank": 10,
  "duration_days": 7
}
```

### Initial Badge Catalog (Seed Data)

#### Academic Badges

| Key | Name | Tier | Criteria | Points |
|-----|------|------|----------|--------|
| `quiz-novice` | Quiz Novice | Bronze | Complete 5 quizzes | 50 |
| `quiz-master-bronze` | Quiz Master (Bronze) | Bronze | 10 perfect scores | 100 |
| `quiz-master-silver` | Quiz Master (Silver) | Silver | 25 perfect scores | 250 |
| `quiz-master-gold` | Quiz Master (Gold) | Gold | 50 perfect scores | 500 |
| `speed-demon` | Speed Demon | Silver | Complete 10 quizzes in <50% time | 200 |
| `perfectionist` | Perfectionist | Gold | 100% on first attempt × 20 | 400 |
| `scholar` | Scholar | Platinum | 1000 quiz points earned | 1000 |

#### Participation Badges

| Key | Name | Tier | Criteria | Points |
|-----|------|------|----------|--------|
| `early-bird` | Early Bird | Bronze | Login before 7 AM × 10 | 50 |
| `night-owl` | Night Owl | Bronze | Study after 9 PM × 10 | 50 |
| `club-member` | Club Member | Bronze | Join 1 club | 25 |
| `club-enthusiast` | Club Enthusiast | Silver | Join 3 clubs | 75 |
| `event-goer` | Event Goer | Bronze | Attend 5 events | 50 |
| `journalist` | Student Journalist | Silver | Publish 10 articles | 200 |

#### Streak Badges

| Key | Name | Tier | Criteria | Points |
|-----|------|------|----------|--------|
| `streak-week` | Week Warrior | Bronze | 7-day streak | 50 |
| `streak-month` | Monthly Master | Silver | 30-day streak | 250 |
| `streak-quarter` | Quarterly Champion | Gold | 90-day streak | 750 |
| `streak-year` | Yearly Legend | Diamond | 365-day streak | 5000 |

#### Social Badges

| Key | Name | Tier | Criteria | Points |
|-----|------|------|----------|--------|
| `helper` | Helpful Friend | Bronze | Help 5 peers | 50 |
| `mentor` | Peer Mentor | Silver | Help 20 peers | 200 |
| `leader` | Student Leader | Gold | Become club officer | 300 |

#### Special Badges

| Key | Name | Tier | Criteria | Points |
|-----|------|------|----------|--------|
| `first-blood` | First Blood | Bronze | First perfect quiz | 100 |
| `pioneer` | Pioneer | Legendary | First 10 users | 1000 |
| `top-ten` | Top Ten | Epic | Global rank ≤10 for 30 days | 2000 |
| `gwa-champion` | GWA Champion | Epic | Maintain #1 GWA for semester | 3000 |
| `completionist` | Completionist | Legendary | Earn all other badges | 10000 |

### Badge Eligibility Checking

```typescript
interface BadgeCriteria {
  type: string;
  count?: number;
  days?: number;
  min_score?: number;
  max_rank?: number;
  scope?: string;
  conditions?: Record<string, any>;
}

async function checkBadgeEligibility(
  studentId: string,
  badge: Badge
): Promise<{ eligible: boolean; progress: number }> {
  const criteria = badge.criteria as BadgeCriteria;

  switch (criteria.type) {
    case 'quiz_perfect_score':
      const perfectCount = await countPerfectQuizzes(studentId);
      return {
        eligible: perfectCount >= criteria.count,
        progress: Math.min(100, (perfectCount / criteria.count) * 100)
      };

    case 'streak_milestone':
      const streak = await getCurrentStreak(studentId);
      return {
        eligible: streak >= criteria.days,
        progress: Math.min(100, (streak / criteria.days) * 100)
      };

    // ... other criteria types
  }
}
```

---

## Level Progression

### Level Formula

```typescript
// XP required for each level increases progressively
function calculateRequiredXP(level: number): number {
  // Formula: 100 * (level ^ 1.5)
  // This creates smooth, balanced progression
  return Math.round(100 * Math.pow(level, 1.5));
}

// Example progression:
// Level 1 → 2: 100 XP
// Level 2 → 3: 283 XP
// Level 3 → 4: 520 XP
// Level 4 → 5: 800 XP
// Level 5 → 6: 1118 XP
// Level 10 → 11: 3162 XP
// Level 20 → 21: 8944 XP
// Level 50 → 51: 35355 XP
// Level 100 → 101: 100000 XP
```

### Level Calculation

```typescript
function calculateLevel(totalPoints: number): {
  level: number;
  currentLevelXP: number;
  nextLevelXP: number;
  progress: number;
} {
  let level = 1;
  let xpRemaining = totalPoints;

  // Find current level
  while (true) {
    const xpForNextLevel = calculateRequiredXP(level);
    if (xpRemaining < xpForNextLevel) break;
    xpRemaining -= xpForNextLevel;
    level++;
  }

  const nextLevelXP = calculateRequiredXP(level);
  const progress = Math.round((xpRemaining / nextLevelXP) * 100);

  return {
    level,
    currentLevelXP: xpRemaining,
    nextLevelXP,
    progress  // 0-100
  };
}
```

### Level Titles

| Level Range | Title | Icon |
|-------------|-------|------|
| 1-5 | Novice | Sprout |
| 6-10 | Apprentice | BookOpen |
| 11-20 | Scholar | GraduationCap |
| 21-30 | Expert | Brain |
| 31-40 | Master | Star |
| 41-50 | Grand Master | Stars |
| 51-60 | Legend | Crown |
| 61-70 | Champion | Trophy |
| 71-80 | Hero | Shield |
| 81-90 | Elite | Zap |
| 91-99 | Supreme | Sparkles |
| 100+ | Immortal | Infinity |

### Level-Up Rewards

```typescript
// Bonus points on level up
function getLevelUpBonus(newLevel: number): number {
  if (newLevel % 10 === 0) return 500;  // Milestone levels (10, 20, 30...)
  if (newLevel % 5 === 0) return 200;   // Half milestones (5, 15, 25...)
  return 50;                             // Regular levels
}

// Special badge awards
const LEVEL_BADGES = {
  10: 'level-10-apprentice',
  25: 'level-25-expert',
  50: 'level-50-master',
  75: 'level-75-legend',
  100: 'level-100-immortal',
};
```

---

## Streak System

### Streak Tracking

**Definition**: A streak is maintained by logging in on consecutive calendar days.

```typescript
interface StreakData {
  currentStreak: number;    // Current consecutive days
  longestStreak: number;    // All-time longest streak
  lastActivityDate: Date;   // Last day activity recorded
  streakStartDate: Date;    // When current streak started
}

// Streak update logic
async function updateStreak(studentId: string, today: Date): Promise<StreakData> {
  const gamification = await getStudentGamification(studentId);
  const lastActivity = new Date(gamification.last_activity_date);

  // Calculate days difference
  const daysDiff = Math.floor(
    (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
  );

  let newStreak = gamification.current_streak;

  if (daysDiff === 0) {
    // Same day - no change
    return { ...gamification };
  } else if (daysDiff === 1) {
    // Consecutive day - increment
    newStreak++;
  } else {
    // Streak broken - reset
    newStreak = 1;
  }

  // Update longest streak if needed
  const longestStreak = Math.max(gamification.longest_streak, newStreak);

  // Check for milestone rewards
  await checkStreakMilestones(studentId, newStreak);

  // Update database
  await updateStudentGamification(studentId, {
    current_streak: newStreak,
    longest_streak: longestStreak,
    last_activity_date: today
  });

  return { currentStreak: newStreak, longestStreak, lastActivityDate: today };
}
```

### Streak Milestones

| Days | Reward | Badge |
|------|--------|-------|
| 3 | 20 points | - |
| 7 | 50 points | Week Warrior (Bronze) |
| 14 | 100 points | - |
| 21 | 150 points | - |
| 30 | 250 points | Monthly Master (Silver) |
| 60 | 500 points | - |
| 90 | 750 points | Quarterly Champion (Gold) |
| 180 | 1500 points | - |
| 365 | 5000 points | Yearly Legend (Diamond) |

### Streak Protection

**Future Enhancement**: Allow students to "freeze" their streak for 1 day once per month (premium feature or high-level reward).

---

## Leaderboard System

### Leaderboard Scopes

1. **Global**: All students across all grades
2. **Grade-Level**: Students within same grade (7, 8, 9, 10)
3. **Section**: Students within same section
4. **Time-Based**: Daily, weekly, monthly, all-time

### Ranking Algorithm

```typescript
// Primary sort: Total points (DESC)
// Secondary sort: Level (DESC)
// Tertiary sort: Longest streak (DESC)
// Quaternary sort: Student ID (ASC for stability)

SELECT
  student_id,
  total_points,
  level,
  current_streak,
  RANK() OVER (
    ORDER BY
      total_points DESC,
      level DESC,
      current_streak DESC,
      student_id ASC
  ) AS rank
FROM student_gamification;
```

### Leaderboard Caching Strategy

**Problem**: Calculating ranks for thousands of students on every request is expensive.

**Solution**: Multi-tier caching

1. **Materialized View** (refreshed every 5 minutes)
   - Pre-calculated ranks for global leaderboard
   - Fast reads for most common queries

2. **Redis Cache** (optional, future enhancement)
   - Top 100 for each scope
   - TTL: 1 minute
   - Invalidate on point award

3. **Database Cache Table**
   - `leaderboard_cache` table
   - Stores JSON arrays of ranked students
   - Refreshed every 5-10 minutes via cron

### Leaderboard Response Format

```typescript
interface LeaderboardEntry {
  rank: number;
  previousRank?: number;      // For trend calculation
  student: {
    id: string;
    name: string;
    gradeLevel: number;
    section: string;
    avatarUrl?: string;
  };
  stats: {
    totalPoints: number;
    level: number;
    currentStreak: number;
    totalBadges: number;
  };
  trend: 'up' | 'down' | 'same';  // Compared to last refresh
  trendChange?: number;            // Rank positions changed
  isCurrentUser: boolean;
}

interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  currentUser: LeaderboardEntry;  // Always included
  lastUpdated: string;
}
```

### Privacy Considerations

- Students can opt-out of public leaderboards (setting in profile)
- Opted-out students still see their own rank and can see others
- Only first name + last initial shown by default (e.g., "John D.")
- Full names only visible to teachers/admins

---

## API Endpoints

### Student Endpoints

#### GET `/gamification/my-profile`
Get current user's gamification profile.

**Response:**
```json
{
  "student_id": "uuid",
  "points": {
    "total": 2450,
    "quiz": 1200,
    "activity": 800,
    "streak": 300,
    "bonus": 150
  },
  "level": {
    "current": 12,
    "title": "Scholar",
    "progress": 65,
    "currentXP": 520,
    "nextLevelXP": 800
  },
  "streak": {
    "current": 15,
    "longest": 28,
    "lastActivity": "2025-11-20"
  },
  "badges": {
    "total": 12,
    "recent": [
      {
        "id": "uuid",
        "name": "Quiz Master (Bronze)",
        "icon": "Trophy",
        "earnedAt": "2025-11-18T10:30:00Z"
      }
    ]
  },
  "ranks": {
    "global": 42,
    "grade": 8,
    "section": 3
  }
}
```

#### GET `/gamification/my-badges`
Get all earned and available badges.

**Query Params:**
- `filter`: `earned` | `unearned` | `all` (default: `all`)
- `category`: `academic` | `participation` | etc.

**Response:**
```json
{
  "earned": [
    {
      "id": "uuid",
      "badge": {
        "id": "uuid",
        "key": "quiz-master-bronze",
        "name": "Quiz Master (Bronze)",
        "description": "Achieve 10 perfect quiz scores",
        "icon": "Trophy",
        "color": "text-yellow-500",
        "tier": "bronze",
        "category": "academic",
        "pointsReward": 100
      },
      "earnedAt": "2025-11-18T10:30:00Z",
      "progress": 100,
      "isShowcased": true
    }
  ],
  "unearned": [
    {
      "id": "uuid",
      "key": "quiz-master-silver",
      "name": "Quiz Master (Silver)",
      "description": "Achieve 25 perfect quiz scores",
      "icon": "Trophy",
      "color": "text-gray-400",
      "tier": "silver",
      "category": "academic",
      "progress": 40,
      "progressCount": 10,
      "progressTarget": 25,
      "isLocked": false
    }
  ],
  "categories": {
    "academic": 5,
    "participation": 3,
    "streak": 2,
    "social": 1,
    "special": 1
  }
}
```

#### GET `/gamification/leaderboard`
Get leaderboard rankings.

**Query Params:**
- `scope`: `global` | `grade` | `section` (default: `global`)
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 50, max: 100)
- `period`: `daily` | `weekly` | `monthly` | `all-time` (default: `all-time`)

**Response:** See [Leaderboard Response Format](#leaderboard-response-format)

#### GET `/gamification/point-history`
Get point transaction history.

**Query Params:**
- `page`, `limit`: Pagination
- `category`: Filter by category
- `startDate`, `endDate`: Date range

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "points": 150,
      "type": "quiz_perfect_score",
      "category": "quiz",
      "reason": "Perfect score on Math Quiz #5",
      "metadata": {
        "quiz_id": "uuid",
        "score": 100,
        "max_score": 100
      },
      "createdAt": "2025-11-20T14:30:00Z",
      "balanceAfter": 2450
    }
  ],
  "summary": {
    "totalEarned": 2600,
    "totalSpent": 150,
    "currentBalance": 2450
  },
  "pagination": { ... }
}
```

#### POST `/gamification/showcase-badge`
Set badge as showcased on profile.

**Body:**
```json
{
  "studentBadgeId": "uuid",
  "isShowcased": true
}
```

### Teacher/Admin Endpoints

#### POST `/gamification/award-points` (Roles: Teacher, Admin)
Manually award points to a student.

**Body:**
```json
{
  "studentId": "uuid",
  "points": 50,
  "reason": "Excellent class participation",
  "category": "bonus"
}
```

#### POST `/badges` (Roles: Admin)
Create new badge.

**Body:**
```json
{
  "key": "math-genius",
  "name": "Math Genius",
  "description": "Score 100% on 5 consecutive math quizzes",
  "icon": "Calculator",
  "color": "text-blue-500",
  "category": "academic",
  "tier": "silver",
  "pointsReward": 200,
  "criteria": {
    "type": "consecutive_perfect_quizzes",
    "subject": "Math",
    "count": 5
  }
}
```

#### GET `/gamification/analytics` (Roles: Teacher, Admin)
Get gamification analytics.

**Response:**
```json
{
  "overview": {
    "totalStudents": 240,
    "activeStudents": 189,
    "totalPointsAwarded": 586000,
    "averagePointsPerStudent": 2441,
    "averageLevel": 11.5,
    "totalBadgesEarned": 1834
  },
  "engagement": {
    "dailyActiveUsers": 156,
    "weeklyActiveUsers": 203,
    "monthlyActiveUsers": 227,
    "streakDistribution": {
      "1-7": 89,
      "8-14": 45,
      "15-30": 31,
      "31+": 24
    }
  },
  "topPerformers": [
    {
      "studentId": "uuid",
      "name": "John D.",
      "points": 5240,
      "level": 28,
      "badges": 18
    }
  ]
}
```

---

## Frontend Components

### 1. `<PointsCounter>`
Displays current points with animated increments.

**Props:**
```typescript
interface PointsCounterProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
  onPointsChange?: (newPoints: number) => void;
}
```

**Features:**
- Animated number counting
- Sparkle effect on increase
- Color-coded by magnitude
- Clickable to view transaction history

### 2. `<LevelProgressBar>`
XP bar showing progress to next level.

**Props:**
```typescript
interface LevelProgressBarProps {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  progress: number;  // 0-100
  title: string;     // e.g., "Scholar"
}
```

**Features:**
- Gradient progress bar
- Level number badge
- Tooltip with exact XP values
- Pulsing animation near completion

### 3. `<BadgeCard>`
Individual badge display.

**Props:**
```typescript
interface BadgeCardProps {
  badge: Badge;
  earned: boolean;
  progress?: number;
  earnedAt?: Date;
  onClick?: () => void;
}
```

**Features:**
- Grayscale when unearned
- Glow effect when earned
- Progress ring for progressive badges
- Hover animation
- Click to view details modal

### 4. `<BadgeShowcase>`
Grid of all badges with filters.

**Features:**
- Category tabs
- Earned/unearned filter
- Search by name
- Sort by rarity, date earned
- Showcase toggle (favorite badges)
- Empty state for no badges

### 5. `<LeaderboardTable>`
Full leaderboard with rankings.

**Features:**
- Virtual scrolling for performance
- Highlight current user row
- Trend arrows (up/down/same)
- Avatar display
- Quick stats (points, level, badges)
- Filter by grade/section
- Time period selector

### 6. `<StreakCalendar>`
Visual calendar showing streak history.

**Props:**
```typescript
interface StreakCalendarProps {
  studentId: string;
  currentStreak: number;
  longestStreak: number;
  months?: number;  // How many months to show
}
```

**Features:**
- GitHub-style contribution graph
- Hover tooltip with date and activity
- Highlight streak ranges
- Show milestones
- Month/year navigation

### 7. `<AchievementNotification>`
Toast/modal for achievements.

**Props:**
```typescript
interface AchievementNotificationProps {
  type: 'points' | 'badge' | 'level-up' | 'streak';
  data: {
    title: string;
    description: string;
    points?: number;
    badge?: Badge;
    level?: number;
  };
  onClose: () => void;
}
```

**Features:**
- Slide-in animation
- Confetti effect for major achievements
- Sound effect (optional)
- Auto-dismiss after 5s
- Click to view details

### 8. `<MiniLeaderboard>`
Compact top-5 widget for dashboard.

**Features:**
- Shows top 3 with podium
- Current user rank always visible
- Animated rank changes
- Click to open full leaderboard
- Refreshes every 30s

---

## Integration Points

### 1. Quiz System Integration

**Location:** `src/quiz/controllers/quiz-attempts.controller.ts`

**Hook Point:** After quiz submission and grading

```typescript
// In quiz-attempts.controller.ts
@Post(':attemptId/submit')
async submitQuiz(@Param('attemptId') attemptId: string) {
  // ... existing quiz submission logic ...

  const attempt = await this.quizAttemptsService.submit(attemptId);

  // NEW: Award points for quiz
  await this.pointsService.awardQuizPoints(attempt);

  return attempt;
}

// In points.service.ts
async awardQuizPoints(attempt: QuizAttempt) {
  const quiz = await this.getQuiz(attempt.quiz_id);

  // Calculate points
  const basePoints = (attempt.score / attempt.max_possible_score) * 100;
  let totalPoints = basePoints;

  // Perfect score bonus
  if (attempt.score === attempt.max_possible_score) {
    totalPoints *= 1.5;
    await this.badgeService.checkBadge(attempt.student_id, 'perfect-score');
  }

  // Speed bonus
  if (quiz.time_limit && attempt.time_taken_seconds < quiz.time_limit * 0.5) {
    totalPoints *= 1.2;
  }

  // First attempt bonus
  if (attempt.attempt_number === 1) {
    totalPoints *= 1.1;
  }

  // Award points
  await this.awardPoints({
    studentId: attempt.student_id,
    points: Math.round(totalPoints),
    reason: `Completed ${quiz.title} (${attempt.score}/${attempt.max_possible_score})`,
    type: 'quiz_completed',
    category: 'quiz',
    metadata: {
      quiz_id: quiz.quiz_id,
      attempt_id: attempt.attempt_id,
      score: attempt.score,
      max_score: attempt.max_possible_score,
      time_taken: attempt.time_taken_seconds
    },
    relatedEntityId: attempt.attempt_id,
    relatedEntityType: 'quiz_attempt'
  });
}
```

### 2. Student Activities Integration

**Location:** `src/student-activities/student-activities.service.ts`

**Enhancement:** Add gamification activity types

```typescript
// Add to ActivityType enum
export enum ActivityType {
  // ... existing types ...

  // Gamification types
  POINTS_AWARDED = 'points_awarded',
  BADGE_EARNED = 'badge_earned',
  LEVEL_UP = 'level_up',
  STREAK_MILESTONE = 'streak_milestone',
  RANK_IMPROVED = 'rank_improved',
}

// Usage in points.service.ts
async awardPoints(params: AwardPointsParams) {
  // ... award points logic ...

  // Create activity log
  await this.studentActivitiesService.create({
    studentUserId: params.studentId,
    activityType: ActivityType.POINTS_AWARDED,
    title: `+${params.points} Points`,
    description: params.reason,
    metadata: {
      points: params.points,
      category: params.category,
      type: params.type,
      ...params.metadata
    },
    icon: 'Zap',
    color: 'text-yellow-500',
    isHighlighted: true,
    relatedEntityId: params.relatedEntityId,
    relatedEntityType: params.relatedEntityType
  });
}
```

### 3. Login Streak Tracking

**Location:** Create new middleware or guard

```typescript
// src/common/guards/streak-tracker.guard.ts
@Injectable()
export class StreakTrackerGuard implements CanActivate {
  constructor(
    private readonly streakService: StreakService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user && user.role === 'Student') {
      // Update streak asynchronously (don't block request)
      this.streakService.updateStreak(user.student_id).catch(err => {
        console.error('Failed to update streak:', err);
      });
    }

    return true;
  }
}

// Apply to all student routes
@Controller('student')
@UseGuards(SupabaseAuthGuard, RolesGuard, StreakTrackerGuard)
export class StudentController {
  // ... routes ...
}
```

### 4. Leaderboard Cache Refresh

**Location:** Create scheduled task

```typescript
// src/gamification/tasks/leaderboard-refresh.task.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class LeaderboardRefreshTask {
  constructor(
    private readonly leaderboardService: LeaderboardService
  ) {}

  // Refresh every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async refreshGlobalLeaderboard() {
    console.log('Refreshing global leaderboard...');
    await this.leaderboardService.refreshMaterializedView();
    console.log('Leaderboard refreshed successfully');
  }

  // Refresh grade/section leaderboards every 10 minutes
  @Cron('*/10 * * * *')
  async refreshScopedLeaderboards() {
    console.log('Refreshing scoped leaderboards...');
    await this.leaderboardService.refreshAllScopes();
    console.log('Scoped leaderboards refreshed');
  }
}
```

---

## Security Considerations

### 1. Point Manipulation Prevention

**Risks:**
- Students directly modifying database
- Race conditions in point transactions
- Double-spending badges

**Mitigations:**
- ✅ Use `serviceClient` for all writes (bypasses RLS)
- ✅ Wrap point transactions in database transactions
- ✅ Unique constraints on `student_badges` (student_id, badge_id)
- ✅ Audit trail in `point_transactions` table
- ✅ Server-side validation of all point awards
- ✅ Rate limiting on manual point awards

```typescript
// Example transaction safety
async awardPoints(params: AwardPointsParams) {
  const serviceClient = this.supabaseService.getServiceClient();

  // Start transaction
  const { data, error } = await serviceClient.rpc('award_points_transaction', {
    p_student_id: params.studentId,
    p_points: params.points,
    p_transaction_type: params.type,
    p_category: params.category,
    p_reason: params.reason,
    p_metadata: params.metadata
  });

  if (error) throw new Error('Point transaction failed');
  return data;
}

// Database function (atomic)
CREATE OR REPLACE FUNCTION award_points_transaction(
  p_student_id UUID,
  p_points INTEGER,
  p_transaction_type VARCHAR,
  p_category VARCHAR,
  p_reason TEXT,
  p_metadata JSONB
) RETURNS void AS $$
BEGIN
  -- Update student points
  UPDATE student_gamification
  SET total_points = total_points + p_points
  WHERE student_id = p_student_id;

  -- Insert transaction record
  INSERT INTO point_transactions (
    student_id, points, transaction_type, category, reason, metadata
  ) VALUES (
    p_student_id, p_points, p_transaction_type, p_category, p_reason, p_metadata
  );
END;
$$ LANGUAGE plpgsql;
```

### 2. Badge Eligibility Verification

- ✅ Always verify criteria server-side
- ✅ Never trust client-provided eligibility status
- ✅ Re-check criteria before awarding badge
- ✅ Log all badge awards with metadata

### 3. Leaderboard Privacy

- ✅ Respect opt-out preferences
- ✅ Sanitize displayed names (first name + last initial)
- ✅ Hide sensitive student info (student_id, email)
- ✅ Teachers/admins can see full data with proper roles

### 4. Rate Limiting

**Apply to:**
- Manual point awards (5 per minute per teacher)
- Badge showcase updates (10 per minute)
- Leaderboard queries (30 per minute)

```typescript
@Throttle(5, 60)  // 5 requests per 60 seconds
@Post('award-points')
@Roles('Teacher', 'Admin')
async awardPoints(@Body() dto: AwardPointsDto) {
  // ...
}
```

### 5. Input Validation

```typescript
// award-points.dto.ts
import { IsInt, IsUUID, IsString, Min, Max } from 'class-validator';

export class AwardPointsDto {
  @IsUUID()
  studentId: string;

  @IsInt()
  @Min(-1000)  // Allow deductions
  @Max(10000)  // Prevent absurd awards
  points: number;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason: string;

  @IsString()
  category: string;
}
```

---

## Implementation Checklist

### Phase 1: Foundation (Days 1-3)
- [ ] Create database migration file
- [ ] Run migration on dev database
- [ ] Create backend module structure
- [ ] Implement core entities and DTOs
- [ ] Create PointsService with basic award logic
- [ ] Create GamificationController with GET endpoints
- [ ] Test basic point awarding

### Phase 2: Badge System (Days 4-6)
- [ ] Create badge seed data file
- [ ] Implement BadgeService with eligibility checking
- [ ] Create BadgeController (admin CRUD)
- [ ] Seed initial badges into database
- [ ] Test badge awarding logic
- [ ] Implement badge progress tracking

### Phase 3: Level & Streak (Days 7-9)
- [ ] Implement LevelService with progression formula
- [ ] Create level-up detection and rewards
- [ ] Implement StreakService
- [ ] Create streak tracking middleware
- [ ] Test streak maintenance and breaking
- [ ] Implement streak milestone rewards

### Phase 4: Leaderboard (Days 10-12)
- [ ] Implement LeaderboardService
- [ ] Create materialized view refresh logic
- [ ] Implement scoped leaderboards (grade, section)
- [ ] Create caching layer
- [ ] Test leaderboard performance with large dataset
- [ ] Implement rank change tracking

### Phase 5: Integration (Days 13-15)
- [ ] Integrate quiz system point awards
- [ ] Extend student activities with gamification types
- [ ] Create login streak middleware
- [ ] Test end-to-end flows
- [ ] Implement scheduled tasks (leaderboard refresh)
- [ ] Create admin analytics endpoint

### Phase 6: Frontend API (Days 16-17)
- [ ] Create `lib/api/endpoints/gamification.ts`
- [ ] Define TypeScript interfaces for all responses
- [ ] Implement API client functions
- [ ] Test API integration

### Phase 7: Frontend Components (Days 18-22)
- [ ] Create `<PointsCounter>` component
- [ ] Create `<LevelProgressBar>` component
- [ ] Create `<BadgeCard>` and `<BadgeShowcase>` components
- [ ] Create `<LeaderboardTable>` component
- [ ] Create `<StreakCalendar>` component
- [ ] Create `<AchievementNotification>` component
- [ ] Create `<MiniLeaderboard>` component
- [ ] Test all components in isolation

### Phase 8: Frontend Pages (Days 23-25)
- [ ] Update `app/student/ranking/page.tsx` with real data
- [ ] Create `app/student/achievements/page.tsx`
- [ ] Update `app/student/page.tsx` dashboard with widgets
- [ ] Create `app/superadmin/gamification/page.tsx`
- [ ] Test responsive design on mobile

### Phase 9: Polish & Animations (Days 26-28)
- [ ] Add confetti animations for level-ups
- [ ] Implement achievement notification system
- [ ] Add sound effects (optional)
- [ ] Implement smooth transitions
- [ ] Add loading states and skeletons
- [ ] Polish UI details

### Phase 10: Testing & Deployment (Days 29-30)
- [ ] End-to-end testing of all flows
- [ ] Performance testing with large datasets
- [ ] Security audit
- [ ] Documentation review
- [ ] Deploy to staging
- [ ] User acceptance testing
- [ ] Deploy to production

---

## Future Enhancements

### Phase 2 (Future)
- **Real-time Updates**: WebSocket support for live point/badge notifications
- **Challenges**: Time-limited challenges with special rewards
- **Teams**: Group competitions and team leaderboards
- **Seasons**: Reset leaderboards quarterly with champion hall of fame
- **Achievements**: Meta-achievements for collections (earn all math badges, etc.)
- **Social Features**: Share achievements on profile, congratulate peers
- **Streak Freeze**: Allow one missed day per month for high-level users
- **Custom Avatars**: Unlock avatar items with points
- **Profile Customization**: Themes, backgrounds unlocked via achievements
- **Analytics Dashboard**: Detailed charts and insights for students
- **Teacher Challenges**: Teachers can create custom point-earning challenges
- **Parent Dashboard**: Parents can view child's gamification progress

### Technical Improvements
- **GraphQL API**: More efficient data fetching
- **Redis Caching**: Faster leaderboard queries
- **Elasticsearch**: Advanced badge and achievement search
- **Push Notifications**: Mobile alerts for achievements
- **Machine Learning**: Personalized badge recommendations

---

## Glossary

| Term | Definition |
|------|------------|
| **XP** | Experience Points - synonymous with points in this system |
| **Level** | Numerical representation of overall progress (1-100+) |
| **Badge** | Achievement earned by meeting specific criteria |
| **Tier** | Badge difficulty level (Bronze, Silver, Gold, Platinum, Diamond) |
| **Rarity** | How common a badge is (Common, Uncommon, Rare, Epic, Legendary) |
| **Streak** | Consecutive days of activity/login |
| **Leaderboard** | Ranked list of students by points |
| **Scope** | Leaderboard context (Global, Grade, Section) |
| **Progressive Badge** | Badge with multiple stages of completion |
| **Showcase** | Displaying favorite badges on profile |
| **RLS** | Row-Level Security - Supabase database security feature |
| **Materialized View** | Pre-computed database view for performance |

---

## Conclusion

This gamification system provides a comprehensive, engaging, and fair way to motivate students without physical rewards. By integrating seamlessly with existing systems and following established architectural patterns, the implementation will be robust, performant, and maintainable.

**Key Success Factors:**
1. ✅ Clear, transparent criteria for all achievements
2. ✅ Fair and balanced point distribution
3. ✅ Engaging visual design with animations
4. ✅ Privacy-respecting leaderboards
5. ✅ Seamless integration with existing features
6. ✅ Performance optimization for scale
7. ✅ Comprehensive audit trails
8. ✅ Extensible architecture for future enhancements

**Next Steps:**
1. Review and approve this design document
2. Begin Phase 1 implementation (database migration)
3. Set up development/staging environment
4. Assign implementation tasks to team
5. Establish testing protocols
6. Define success metrics and KPIs

---

**Document Owner:** Development Team
**Stakeholders:** Superadmin, Teachers, Students
**Review Date:** 2025-11-20
**Next Review:** Upon Phase 5 completion
