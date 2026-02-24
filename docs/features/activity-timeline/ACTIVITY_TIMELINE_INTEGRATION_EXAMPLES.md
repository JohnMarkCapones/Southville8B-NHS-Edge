# Activity Timeline Integration Examples

This document provides copy-paste code examples for integrating the Activity Timeline with existing systems.

---

## 📌 Table of Contents
1. [Quiz System Integration](#quiz-system-integration)
2. [Club System Integration](#club-system-integration)
3. [Module System Integration](#module-system-integration)
4. [Achievement System Integration](#achievement-system-integration)
5. [Academic Updates Integration](#academic-updates-integration)
6. [Event System Integration](#event-system-integration)

---

## Quiz System Integration

### 1. Update Quiz Module
**File**: `src/quiz/quiz.module.ts`

```typescript
import { StudentActivitiesModule } from '../student-activities/student-activities.module';

@Module({
  imports: [
    // ... existing imports
    StudentActivitiesModule, // Add this
  ],
  // ... rest of module
})
export class QuizModule {}
```

### 2. Update Quiz Attempts Service
**File**: `src/quiz/services/quiz-attempts.service.ts`

```typescript
import { StudentActivitiesService } from '../../student-activities/student-activities.service';
import { ActivityType } from '../../student-activities/entities/student-activity.entity';

export class QuizAttemptsService {
  constructor(
    // ... existing dependencies
    private readonly studentActivitiesService: StudentActivitiesService,
  ) {}

  // When student starts a quiz
  async startQuizAttempt(quizId: string, studentId: string): Promise<QuizAttempt> {
    // ... existing logic to create attempt ...

    const attempt = await this.createAttempt(quizId, studentId);

    // Create activity
    try {
      await this.studentActivitiesService.create({
        studentUserId: studentId,
        activityType: ActivityType.QUIZ_STARTED,
        title: `Started ${quiz.title}`,
        description: 'You began taking this quiz',
        metadata: {
          quiz_id: quizId,
          quiz_title: quiz.title,
          time_limit: quiz.time_limit_minutes,
        },
        relatedEntityId: quizId,
        relatedEntityType: 'quiz',
        icon: 'BookOpen',
        color: 'text-blue-500',
        isHighlighted: false,
      });
    } catch (error) {
      // Log but don't fail the quiz start if activity creation fails
      console.error('[QuizAttempts] Failed to create activity:', error);
    }

    return attempt;
  }

  // When student submits a quiz
  async submitQuizAttempt(attemptId: string): Promise<QuizAttempt> {
    // ... existing submission logic ...

    const attempt = await this.getAttemptById(attemptId);
    const quiz = await this.getQuizById(attempt.quiz_id);

    // Update attempt status
    await this.updateAttemptStatus(attemptId, 'submitted');

    // Create activity
    try {
      await this.studentActivitiesService.create({
        studentUserId: attempt.student_id,
        activityType: ActivityType.QUIZ_SUBMITTED,
        title: `Submitted ${quiz.title}`,
        description: 'Your quiz has been submitted for grading',
        metadata: {
          quiz_id: quiz.id,
          quiz_title: quiz.title,
          time_taken: attempt.time_taken_seconds,
          submitted_at: new Date().toISOString(),
        },
        relatedEntityId: quiz.id,
        relatedEntityType: 'quiz',
        icon: 'CheckCircle2',
        color: 'text-green-500',
        isHighlighted: false,
      });
    } catch (error) {
      console.error('[QuizAttempts] Failed to create activity:', error);
    }

    return attempt;
  }
}
```

### 3. Update Grading Service
**File**: `src/quiz/services/grading.service.ts`

```typescript
import { StudentActivitiesService } from '../../student-activities/student-activities.service';
import { ActivityType } from '../../student-activities/entities/student-activity.entity';

export class GradingService {
  constructor(
    // ... existing dependencies
    private readonly studentActivitiesService: StudentActivitiesService,
  ) {}

  // When quiz is auto-graded or manually graded
  async gradeQuizAttempt(attemptId: string): Promise<QuizAttempt> {
    // ... existing grading logic ...

    const attempt = await this.getAttemptById(attemptId);
    const quiz = await this.getQuizById(attempt.quiz_id);

    // Calculate score
    const score = await this.calculateScore(attemptId);
    const maxScore = quiz.max_possible_score;
    const percentage = (score / maxScore) * 100;

    // Update attempt with score
    await this.updateAttemptScore(attemptId, score, maxScore);

    // Determine color based on score
    let color = 'text-orange-500';
    if (percentage >= 90) color = 'text-green-500';
    else if (percentage >= 75) color = 'text-blue-500';

    // Create activity
    try {
      await this.studentActivitiesService.create({
        studentUserId: attempt.student_id,
        activityType: ActivityType.QUIZ_GRADED,
        title: `${quiz.title} Graded`,
        description: `You scored ${score} out of ${maxScore} (${percentage.toFixed(1)}%)`,
        metadata: {
          quiz_id: quiz.id,
          quiz_title: quiz.title,
          score: score,
          max_score: maxScore,
          percentage: percentage.toFixed(1),
          graded_at: new Date().toISOString(),
        },
        relatedEntityId: quiz.id,
        relatedEntityType: 'quiz',
        icon: 'Award',
        color: color,
        isHighlighted: true, // Always highlight graded quizzes
      });
    } catch (error) {
      console.error('[Grading] Failed to create activity:', error);
    }

    return attempt;
  }
}
```

---

## Club System Integration

### 1. Update Club Memberships Service
**File**: `src/clubs/services/club-memberships.service.ts`

```typescript
import { StudentActivitiesService } from '../../student-activities/student-activities.service';
import { ActivityType } from '../../student-activities/entities/student-activity.entity';

export class ClubMembershipsService {
  constructor(
    // ... existing dependencies
    private readonly studentActivitiesService: StudentActivitiesService,
  ) {}

  // When student joins a club
  async createMembership(createDto: CreateClubMembershipDto): Promise<ClubMembership> {
    // ... existing logic to create membership ...

    const membership = await this.create(createDto);
    const club = await this.clubsService.findOne(createDto.clubId);
    const position = await this.getPosition(createDto.positionId);

    // Create activity
    try {
      await this.studentActivitiesService.create({
        studentUserId: createDto.studentId,
        activityType: ActivityType.CLUB_JOINED,
        title: `Joined ${club.name}`,
        description: `You are now a ${position.name} of ${club.name}`,
        metadata: {
          club_id: club.id,
          club_name: club.name,
          club_logo: club.logo_url,
          position_id: position.id,
          position: position.name,
          joined_at: new Date().toISOString(),
        },
        relatedEntityId: club.id,
        relatedEntityType: 'club',
        icon: 'Users',
        color: 'text-blue-500',
        isHighlighted: false,
      });
    } catch (error) {
      console.error('[ClubMemberships] Failed to create activity:', error);
    }

    return membership;
  }

  // When student leaves a club
  async removeMembership(membershipId: string): Promise<void> {
    const membership = await this.findOne(membershipId);
    const club = await this.clubsService.findOne(membership.clubId);

    // ... existing logic to remove membership ...

    await this.remove(membershipId);

    // Create activity
    try {
      await this.studentActivitiesService.create({
        studentUserId: membership.studentId,
        activityType: ActivityType.CLUB_LEFT,
        title: `Left ${club.name}`,
        description: `You are no longer a member of ${club.name}`,
        metadata: {
          club_id: club.id,
          club_name: club.name,
          left_at: new Date().toISOString(),
        },
        relatedEntityId: club.id,
        relatedEntityType: 'club',
        icon: 'Users',
        color: 'text-gray-500',
        isHighlighted: false,
      });
    } catch (error) {
      console.error('[ClubMemberships] Failed to create activity:', error);
    }
  }

  // When student is promoted/position changes
  async updateMembershipPosition(
    membershipId: string,
    newPositionId: string,
  ): Promise<ClubMembership> {
    const membership = await this.findOne(membershipId);
    const club = await this.clubsService.findOne(membership.clubId);
    const oldPosition = await this.getPosition(membership.positionId);
    const newPosition = await this.getPosition(newPositionId);

    // ... existing logic to update position ...

    const updated = await this.update(membershipId, { positionId: newPositionId });

    // Create activity
    try {
      await this.studentActivitiesService.create({
        studentUserId: membership.studentId,
        activityType: ActivityType.CLUB_POSITION_CHANGED,
        title: `Promoted in ${club.name}`,
        description: `Your role changed from ${oldPosition.name} to ${newPosition.name}`,
        metadata: {
          club_id: club.id,
          club_name: club.name,
          old_position: oldPosition.name,
          new_position: newPosition.name,
          promoted_at: new Date().toISOString(),
        },
        relatedEntityId: club.id,
        relatedEntityType: 'club',
        icon: 'Trophy',
        color: 'text-yellow-500',
        isHighlighted: true, // Promotions are important
      });
    } catch (error) {
      console.error('[ClubMemberships] Failed to create activity:', error);
    }

    return updated;
  }
}
```

---

## Module System Integration

### Update Modules Service
**File**: `src/modules/modules.service.ts`

```typescript
import { StudentActivitiesService } from '../student-activities/student-activities.service';
import { ActivityType } from '../student-activities/entities/student-activity.entity';

export class ModulesService {
  constructor(
    // ... existing dependencies
    private readonly studentActivitiesService: StudentActivitiesService,
  ) {}

  // When student downloads a module
  async downloadModule(moduleId: string, studentId: string): Promise<string> {
    const module = await this.findOne(moduleId);

    // ... existing download logic ...

    const downloadUrl = await this.generateDownloadUrl(moduleId);

    // Create activity
    try {
      await this.studentActivitiesService.create({
        studentUserId: studentId,
        activityType: ActivityType.MODULE_DOWNLOADED,
        title: `Downloaded ${module.title}`,
        description: 'Learning material downloaded',
        metadata: {
          module_id: moduleId,
          module_title: module.title,
          file_name: module.file_name,
          file_size: module.file_size,
          subject_id: module.subject_id,
          downloaded_at: new Date().toISOString(),
        },
        relatedEntityId: moduleId,
        relatedEntityType: 'module',
        icon: 'BookOpen',
        color: 'text-purple-500',
        isHighlighted: false,
      });
    } catch (error) {
      console.error('[Modules] Failed to create activity:', error);
    }

    return downloadUrl;
  }
}
```

---

## Achievement System Integration

### Create Achievement Service (New)
**File**: `src/achievements/achievements.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { StudentActivitiesService } from '../student-activities/student-activities.service';
import { ActivityType } from '../student-activities/entities/student-activity.entity';

@Injectable()
export class AchievementsService {
  constructor(
    private readonly studentActivitiesService: StudentActivitiesService,
  ) {}

  async awardBadge(studentId: string, badgeName: string, reason: string): Promise<void> {
    // ... logic to award badge in database ...

    // Create activity
    await this.studentActivitiesService.create({
      studentUserId: studentId,
      activityType: ActivityType.BADGE_EARNED,
      title: `Earned ${badgeName} Badge`,
      description: reason,
      metadata: {
        badge_name: badgeName,
        badge_icon: this.getBadgeIcon(badgeName),
        earned_at: new Date().toISOString(),
      },
      relatedEntityType: 'achievement',
      icon: 'Trophy',
      color: 'text-yellow-500',
      isHighlighted: true,
    });
  }

  async checkPerfectAttendance(studentId: string): Promise<void> {
    // Check if student has perfect attendance for the month
    const hasMetCondition = await this.verifyPerfectAttendance(studentId);

    if (hasMetCondition) {
      await this.awardBadge(
        studentId,
        'Perfect Attendance',
        'You had perfect attendance this month!',
      );
    }
  }

  async checkHonorRoll(studentId: string, gwa: number): Promise<void> {
    if (gwa >= 95) {
      await this.awardBadge(
        studentId,
        'High Honors',
        `Congratulations on achieving a GWA of ${gwa}!`,
      );
    } else if (gwa >= 90) {
      await this.awardBadge(
        studentId,
        'Honor Roll',
        `Great job achieving a GWA of ${gwa}!`,
      );
    }
  }

  private getBadgeIcon(badgeName: string): string {
    const iconMap: Record<string, string> = {
      'Perfect Attendance': 'Trophy',
      'High Honors': 'Award',
      'Honor Roll': 'Award',
      'Top Performer': 'Target',
      'Quiz Master': 'Brain',
    };
    return iconMap[badgeName] || 'Award';
  }
}
```

---

## Academic Updates Integration

### Update GWA Service
**File**: `src/gwa/gwa.service.ts`

```typescript
import { StudentActivitiesService } from '../student-activities/student-activities.service';
import { ActivityType } from '../student-activities/entities/student-activity.entity';

export class GwaService {
  constructor(
    // ... existing dependencies
    private readonly studentActivitiesService: StudentActivitiesService,
  ) {}

  async updateStudentGWA(studentId: string, newGwa: number): Promise<void> {
    // ... existing logic to calculate and update GWA ...

    const oldGwa = await this.getCurrentGwa(studentId);
    await this.setGwa(studentId, newGwa);

    // Determine if GWA improved or declined
    const improved = newGwa > oldGwa;
    const trend = improved ? 'improved' : 'declined';

    // Create activity
    try {
      await this.studentActivitiesService.create({
        studentUserId: studentId,
        activityType: ActivityType.GWA_UPDATED,
        title: `GWA Updated: ${newGwa}`,
        description: `Your GWA ${trend} from ${oldGwa} to ${newGwa}`,
        metadata: {
          old_gwa: oldGwa,
          new_gwa: newGwa,
          trend: trend,
          updated_at: new Date().toISOString(),
        },
        relatedEntityType: 'academic',
        icon: 'TrendingUp',
        color: improved ? 'text-green-500' : 'text-orange-500',
        isHighlighted: true,
      });
    } catch (error) {
      console.error('[GWA] Failed to create activity:', error);
    }
  }
}
```

### Update Student Rankings Service
**File**: `src/students/students.service.ts`

```typescript
import { StudentActivitiesService } from '../student-activities/student-activities.service';
import { ActivityType } from '../student-activities/entities/student-activity.entity';

export class StudentsService {
  constructor(
    // ... existing dependencies
    private readonly studentActivitiesService: StudentActivitiesService,
  ) {}

  async updateStudentRank(studentId: string, newRank: number, totalStudents: number): Promise<void> {
    // ... existing logic to update rank ...

    const oldRank = await this.getCurrentRank(studentId);
    await this.setRank(studentId, newRank);

    // Determine if rank improved (lower number = better rank)
    const improved = newRank < oldRank;
    const change = Math.abs(newRank - oldRank);

    // Create activity
    try {
      await this.studentActivitiesService.create({
        studentUserId: studentId,
        activityType: ActivityType.RANK_UPDATED,
        title: `Class Rank: #${newRank}`,
        description: improved
          ? `Your rank improved by ${change} ${change === 1 ? 'position' : 'positions'}!`
          : `Rank updated to #${newRank} out of ${totalStudents}`,
        metadata: {
          old_rank: oldRank,
          new_rank: newRank,
          total_students: totalStudents,
          improved: improved,
          change: change,
          updated_at: new Date().toISOString(),
        },
        relatedEntityType: 'academic',
        icon: 'Target',
        color: improved ? 'text-green-500' : 'text-blue-500',
        isHighlighted: improved && change >= 5, // Highlight significant improvements
      });
    } catch (error) {
      console.error('[Students] Failed to create activity:', error);
    }
  }
}
```

---

## Event System Integration

### Update Events Service
**File**: `src/events/events.service.ts`

```typescript
import { StudentActivitiesService } from '../student-activities/student-activities.service';
import { ActivityType } from '../student-activities/entities/student-activity.entity';

export class EventsService {
  constructor(
    // ... existing dependencies
    private readonly studentActivitiesService: StudentActivitiesService,
  ) {}

  // When student registers for an event
  async registerForEvent(eventId: string, studentId: string): Promise<void> {
    const event = await this.findOne(eventId);

    // ... existing registration logic ...

    await this.createRegistration(eventId, studentId);

    // Create activity
    try {
      await this.studentActivitiesService.create({
        studentUserId: studentId,
        activityType: ActivityType.EVENT_REGISTERED,
        title: `Registered for ${event.title}`,
        description: `You're signed up for this event on ${new Date(event.start_date).toLocaleDateString()}`,
        metadata: {
          event_id: eventId,
          event_title: event.title,
          event_date: event.start_date,
          event_location: event.location,
          registered_at: new Date().toISOString(),
        },
        relatedEntityId: eventId,
        relatedEntityType: 'event',
        icon: 'CalendarIcon',
        color: 'text-purple-500',
        isHighlighted: false,
      });
    } catch (error) {
      console.error('[Events] Failed to create activity:', error);
    }
  }

  // When student attends an event
  async markEventAttendance(eventId: string, studentId: string): Promise<void> {
    const event = await this.findOne(eventId);

    // ... existing attendance logic ...

    await this.recordAttendance(eventId, studentId);

    // Create activity
    try {
      await this.studentActivitiesService.create({
        studentUserId: studentId,
        activityType: ActivityType.EVENT_ATTENDED,
        title: `Attended ${event.title}`,
        description: 'Your attendance has been recorded',
        metadata: {
          event_id: eventId,
          event_title: event.title,
          event_date: event.start_date,
          attended_at: new Date().toISOString(),
        },
        relatedEntityId: eventId,
        relatedEntityType: 'event',
        icon: 'CheckCircle2',
        color: 'text-green-500',
        isHighlighted: false,
      });
    } catch (error) {
      console.error('[Events] Failed to create activity:', error);
    }
  }
}
```

---

## Quick Reference: Common Patterns

### Pattern 1: Simple Activity (No Metadata)
```typescript
await this.studentActivitiesService.create({
  studentUserId: studentId,
  activityType: ActivityType.PROFILE_UPDATED,
  title: 'Profile Updated',
  description: 'You updated your profile information',
  icon: 'Users',
  color: 'text-blue-500',
});
```

### Pattern 2: Activity with Metadata
```typescript
await this.studentActivitiesService.create({
  studentUserId: studentId,
  activityType: ActivityType.QUIZ_GRADED,
  title: `${quizTitle} Graded`,
  description: `You scored ${score} out of ${maxScore}`,
  metadata: {
    quiz_id: quizId,
    quiz_title: quizTitle,
    score: score,
    max_score: maxScore,
  },
  relatedEntityId: quizId,
  relatedEntityType: 'quiz',
  icon: 'Award',
  color: 'text-green-500',
  isHighlighted: true,
});
```

### Pattern 3: Error Handling (Don't Fail Parent Operation)
```typescript
try {
  await this.studentActivitiesService.create({
    // ... activity data
  });
} catch (error) {
  // Log but don't fail the main operation
  console.error('[ServiceName] Failed to create activity:', error);
}
```

---

## Icon & Color Reference

### Icons (Lucide React)
```typescript
const ACTIVITY_ICONS = {
  // Quiz
  quiz_started: 'BookOpen',
  quiz_submitted: 'CheckCircle2',
  quiz_graded: 'Award',

  // Clubs
  club_joined: 'Users',
  club_position_changed: 'Trophy',

  // Achievements
  badge_earned: 'Trophy',
  milestone_reached: 'Target',

  // Academic
  gwa_updated: 'TrendingUp',
  rank_updated: 'Target',
  grade_published: 'BookMarked',

  // Events
  event_registered: 'CalendarIcon',
  event_attended: 'CheckCircle2',

  // General
  profile_updated: 'Users',
  module_downloaded: 'BookOpen',
};
```

### Colors (Tailwind)
```typescript
const ACTIVITY_COLORS = {
  // Status-based
  success: 'text-green-500',
  info: 'text-blue-500',
  warning: 'text-orange-500',
  error: 'text-red-500',

  // Category-based
  quiz: 'text-blue-500',
  club: 'text-purple-500',
  achievement: 'text-yellow-500',
  academic: 'text-green-500',
  event: 'text-pink-500',
  general: 'text-gray-500',
};
```

---

## Summary

1. **Always inject** `StudentActivitiesService` in module imports
2. **Wrap in try-catch** to prevent activity creation failures from breaking main operations
3. **Provide meaningful metadata** for rich activity display
4. **Use appropriate icons and colors** for visual consistency
5. **Highlight important activities** (grades, promotions, achievements)
6. **Include timestamps** in metadata for tracking

This will create a rich, engaging activity timeline for students! 🎉
