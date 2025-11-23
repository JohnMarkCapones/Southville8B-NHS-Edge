# Event Reminder Automation Setup Guide

## Overview

This guide explains how to set up automated event reminders that notify students about upcoming events 24 hours and 1 hour before they start.

---

## What Was Implemented

### New Service: `event-reminders.service.ts`

Located at: `core-api-layer/southville-nhs-school-portal-api-layer/src/events/event-reminders.service.ts`

**Features**:

- ✅ Daily 24-hour reminders for events happening tomorrow
- ✅ Hourly 1-hour reminders for events starting soon
- ✅ Respects event visibility (public/private/club-specific)
- ✅ Includes event details (date, time, location)

### New API Endpoints

#### 1. Daily Reminders

```
POST /events/reminders/daily
Authorization: Bearer {ADMIN_TOKEN}
```

Sends reminders for all events happening tomorrow.

**Response**:

```json
{
  "message": "Daily event reminders sent successfully"
}
```

#### 2. Hourly Reminders

```
POST /events/reminders/hourly
Authorization: Bearer {ADMIN_TOKEN}
```

Sends reminders for events starting in approximately 1 hour.

**Response**:

```json
{
  "message": "Hourly event reminders sent successfully"
}
```

---

## Setup Options

### Option 1: External Cron Service (Recommended - No Server Access Needed)

Use an external cron service to automatically call the API endpoints.

#### A. Using cron-job.org (Free)

1. **Sign up**: Go to https://cron-job.org and create a free account

2. **Create Daily Reminder Job**:

   - Click "Create Cronjob"
   - **Title**: "Southville Event Daily Reminders"
   - **URL**: `https://your-api-domain.com/events/reminders/daily`
   - **Schedule**: Daily at 9:00 AM (your timezone)
   - **Request Method**: POST
   - **Custom Headers**:
     ```
     Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
     Content-Type: application/json
     ```
   - **Save Job**

3. **Create Hourly Reminder Job**:
   - Click "Create Cronjob"
   - **Title**: "Southville Event Hourly Reminders"
   - **URL**: `https://your-api-domain.com/events/reminders/hourly`
   - **Schedule**: Every hour
   - **Request Method**: POST
   - **Custom Headers**:
     ```
     Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
     Content-Type: application/json
     ```
   - **Save Job**

#### B. Using EasyCron (Free Tier Available)

1. **Sign up**: Go to https://www.easycron.com

2. **Add Daily Reminder Cron**:

   - Click "Add Cron Job"
   - **URL**: `https://your-api-domain.com/events/reminders/daily`
   - **Cron Expression**: `0 9 * * *` (Daily at 9:00 AM)
   - **HTTP Method**: POST
   - **HTTP Headers**:
     ```
     Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
     ```
   - **Enable**: Yes

3. **Add Hourly Reminder Cron**:
   - Click "Add Cron Job"
   - **URL**: `https://your-api-domain.com/events/reminders/hourly`
   - **Cron Expression**: `0 * * * *` (Every hour)
   - **HTTP Method**: POST
   - **HTTP Headers**:
     ```
     Authorization: Bearer YOUR_ADMIN_JWT_TOKEN
     ```
   - **Enable**: Yes

---

### Option 2: GitHub Actions (Free - If Using GitHub)

Create `.github/workflows/event-reminders.yml`:

```yaml
name: Event Reminders

on:
  schedule:
    # Daily at 9:00 AM UTC (adjust for your timezone)
    - cron: "0 9 * * *"
    # Every hour for hourly reminders
    - cron: "0 * * * *"

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Send Daily Reminder (if 9:00 AM)
        if: github.event.schedule == '0 9 * * *'
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.ADMIN_JWT_TOKEN }}" \
            -H "Content-Type: application/json" \
            https://your-api-domain.com/events/reminders/daily

      - name: Send Hourly Reminder (if hourly)
        if: github.event.schedule == '0 * * * *'
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.ADMIN_JWT_TOKEN }}" \
            -H "Content-Type: application/json" \
            https://your-api-domain.com/events/reminders/hourly
```

**Setup**:

1. Add `ADMIN_JWT_TOKEN` to your GitHub repository secrets
2. Commit the workflow file to your repository
3. GitHub will automatically run the scheduled jobs

---

### Option 3: Server Cron Job (Requires Server Access)

#### For Linux/Unix Servers

1. **SSH into your server**

2. **Get Admin JWT Token** (run this once):

   ```bash
   # Login as admin and copy the token
   TOKEN=$(curl -X POST https://your-api-domain.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"admin_password"}' \
     | jq -r '.access_token')

   echo "Your admin token: $TOKEN"
   ```

3. **Edit crontab**:

   ```bash
   crontab -e
   ```

4. **Add these lines**:

   ```bash
   # Daily reminder at 9:00 AM (local time)
   0 9 * * * curl -X POST -H "Authorization: Bearer YOUR_ADMIN_TOKEN" https://your-api-domain.com/events/reminders/daily

   # Hourly reminders
   0 * * * * curl -X POST -H "Authorization: Bearer YOUR_ADMIN_TOKEN" https://your-api-domain.com/events/reminders/hourly
   ```

5. **Save and exit**

6. **Verify cron is set up**:
   ```bash
   crontab -l
   ```

---

### Option 4: Windows Task Scheduler (For Windows Servers)

1. **Create PowerShell script** `event-reminders.ps1`:

   ```powershell
   $adminToken = "YOUR_ADMIN_JWT_TOKEN"
   $apiBase = "https://your-api-domain.com"

   # Get current hour
   $currentHour = (Get-Date).Hour

   # Send daily reminder at 9 AM
   if ($currentHour -eq 9) {
       Invoke-RestMethod -Uri "$apiBase/events/reminders/daily" `
           -Method POST `
           -Headers @{ "Authorization" = "Bearer $adminToken" }
   }

   # Send hourly reminder every hour
   Invoke-RestMethod -Uri "$apiBase/events/reminders/hourly" `
       -Method POST `
       -Headers @{ "Authorization" = "Bearer $adminToken" }
   ```

2. **Open Task Scheduler**:

   - Press `Win + R`, type `taskschd.msc`, press Enter

3. **Create Task**:
   - Click "Create Task"
   - **Name**: "Southville Event Reminders"
   - **Security**: Run whether user is logged on or not
   - **Triggers**: New trigger
     - Begin: On a schedule
     - Daily, recur every 1 day
     - Repeat task every: 1 hour
     - For a duration of: 1 day
     - Start time: 12:00 AM
   - **Actions**: New action
     - Action: Start a program
     - Program: `powershell.exe`
     - Arguments: `-File "C:\path\to\event-reminders.ps1"`
   - **Save**

---

### Option 5: Using @nestjs/schedule (Code-Based Automation)

If you want the reminders to run automatically within your NestJS application:

#### Step 1: Install Package

```bash
npm install @nestjs/schedule
```

#### Step 2: Update `app.module.ts`

```typescript
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    // ... other imports
  ],
})
export class AppModule {}
```

#### Step 3: Update `event-reminders.service.ts`

Add these imports at the top:

```typescript
import { Cron, CronExpression } from "@nestjs/schedule";
```

Add decorators to methods:

```typescript
@Cron('0 9 * * *') // Daily at 9:00 AM
async sendDailyEventReminders(): Promise<void> {
  // ... existing code
}

@Cron(CronExpression.EVERY_HOUR)
async sendHourlyEventReminders(): Promise<void> {
  // ... existing code
}
```

#### Step 4: Restart Application

The cron jobs will now run automatically within your application.

**Pros**:

- ✅ No external dependencies
- ✅ Runs automatically with the app
- ✅ Easy to debug and monitor

**Cons**:

- ❌ Requires app to be running 24/7
- ❌ Doesn't run if app crashes or restarts

---

## Getting Your Admin JWT Token

### Method 1: Login via API

```bash
curl -X POST https://your-api-domain.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@southville.edu.ph",
    "password": "your_admin_password"
  }'
```

Copy the `access_token` from the response.

### Method 2: Via Frontend

1. Login to the admin dashboard
2. Open browser Developer Tools (F12)
3. Go to Application/Storage → Local Storage
4. Find the auth token key
5. Copy the token value

**Important**: Admin JWT tokens may expire. If reminders stop working:

1. Generate a new token
2. Update the token in your cron service

---

## Recommended Schedule

### Daily Reminders

- **Time**: 9:00 AM (local timezone)
- **Why**: Gives students the full day to prepare for tomorrow's events
- **Frequency**: Once per day

### Hourly Reminders

- **Time**: Every hour
- **Why**: Catches events starting within the next hour
- **Frequency**: Every 60 minutes

### Timezone Considerations

Make sure your cron schedule matches your server's timezone or convert to UTC.

**Example**: If you want 9:00 AM Philippine Time (UTC+8):

- Cron expression: `0 1 * * *` (9 AM PHT = 1 AM UTC)

---

## Testing Your Setup

### Manual Testing

1. **Test Daily Reminders**:

   ```bash
   curl -X POST https://your-api-domain.com/events/reminders/daily \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

2. **Test Hourly Reminders**:

   ```bash
   curl -X POST https://your-api-domain.com/events/reminders/hourly \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

3. **Create Test Event**:
   - Create an event for tomorrow
   - Run the daily reminder endpoint
   - Check if notifications were created

### Monitoring

**Check application logs** for these messages:

```
🔔 Checking for events on 2024-11-22 to send reminders
Found 3 event(s) for tomorrow
📅 Sent reminder to 150 user(s) for event: Sports Festival
✅ Completed sending reminders for 3 event(s)
```

**Check database** for created notifications:

```sql
SELECT * FROM notifications
WHERE title LIKE 'Reminder:%'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Troubleshooting

### Issue: Reminders Not Being Sent

**Check**:

1. Is the cron job running? (check cron service logs)
2. Is the API accessible? (test with curl)
3. Is the admin token valid? (401 error means expired token)
4. Are there any events scheduled for tomorrow/next hour?

**Solutions**:

- Verify cron service is active
- Regenerate admin token
- Check application logs for errors

### Issue: Duplicate Notifications

**Cause**: Multiple cron jobs running or cron running too frequently

**Solution**:

- Review cron schedule
- Ensure only one instance of each job is running
- Add deduplication logic if needed

### Issue: Wrong Timezone

**Cause**: Cron schedule in different timezone than expected

**Solution**:

- Convert cron time to UTC
- Or use timezone-aware cron expressions
- Test with manual API calls first

---

## Maintenance

### Regular Tasks

1. **Weekly**: Check logs for errors
2. **Monthly**: Verify notification delivery rates
3. **Quarterly**: Clean up expired notifications
4. **Yearly**: Rotate admin tokens

### Updating Admin Token

When admin token expires:

1. Generate new token (see "Getting Your Admin JWT Token")
2. Update token in cron service
3. Test both endpoints
4. Monitor for 24 hours

---

## Cost Considerations

| Service          | Free Tier       | Paid Plans                 |
| ---------------- | --------------- | -------------------------- |
| cron-job.org     | 3 jobs          | Unlimited from €3.99/month |
| EasyCron         | 1 job           | More jobs from $0.99/month |
| GitHub Actions   | 2,000 min/month | Additional minutes billed  |
| @nestjs/schedule | Free            | Requires 24/7 server       |

**Recommendation**: Start with cron-job.org free tier (3 jobs) which is sufficient for daily + hourly reminders.

---

## Best Practices

1. **Use external cron service** for reliability (app doesn't need to be running)
2. **Monitor cron execution** regularly to ensure reminders are sent
3. **Keep admin token secure** - store in secrets/environment variables
4. **Set up alerts** for failed cron executions
5. **Test thoroughly** before going to production
6. **Document your setup** for future maintenance

---

## Summary

**Recommended Setup** (easiest):

1. ✅ Use cron-job.org (free, no server access needed)
2. ✅ Set up 2 jobs: daily at 9 AM + every hour
3. ✅ Use admin JWT token for authorization
4. ✅ Monitor logs for successful execution

**Alternative** (for developers):

- Install `@nestjs/schedule`
- Add cron decorators to the service
- Automatic execution within the app

Both approaches work perfectly - choose based on your infrastructure and preferences!

---

**Setup Date**: November 21, 2025
**Status**: Ready for Production
**Next Step**: Choose your automation method and set it up! 🚀
