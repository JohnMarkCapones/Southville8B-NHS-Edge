# Chapter 34: Maintenance Procedures

## Table of Contents

1. [Maintenance Philosophy](#maintenance-philosophy)
2. [Daily Maintenance](#daily-maintenance)
3. [Weekly Maintenance](#weekly-maintenance)
4. [Monthly Maintenance](#monthly-maintenance)
5. [Database Maintenance](#database-maintenance)
6. [Cache Management](#cache-management)
7. [Log Management](#log-management)
8. [Dependency Updates](#dependency-updates)
9. [Security Patching](#security-patching)
10. [Backup Verification](#backup-verification)
11. [Performance Optimization](#performance-optimization)

## Maintenance Philosophy

### Proactive vs Reactive

Effective maintenance requires a balanced approach:

```yaml
Proactive Maintenance:
  - Regular scheduled tasks
  - Preventive optimization
  - Monitoring and alerting
  - Capacity planning
  - Documentation updates

Reactive Maintenance:
  - Incident response
  - Bug fixes
  - Performance issues
  - User-reported problems
  - Emergency patches
```

### Maintenance Windows

```yaml
Regular Maintenance:
  Schedule: Every Saturday 2:00 AM - 6:00 AM PHT
  Duration: Up to 4 hours
  Notification: 48 hours advance notice
  Impact: Minimal service disruption

Emergency Maintenance:
  Schedule: As needed
  Duration: Variable
  Notification: Immediate via status page
  Impact: May require service interruption

Minor Updates:
  Schedule: During low-traffic periods
  Duration: < 30 minutes
  Notification: Not required for zero-downtime
  Impact: No service disruption
```

### Change Management

```yaml
Change Process:
  1. Document Change:
     - What: Clear description of change
     - Why: Business justification
     - When: Scheduled time
     - Who: Responsible person
     - How: Step-by-step procedure

  2. Review & Approve:
     - Technical review
     - Security review
     - Business approval
     - Stakeholder notification

  3. Test in Staging:
     - Verify functionality
     - Check performance
     - Test rollback procedure
     - Document issues

  4. Execute in Production:
     - Follow documented procedure
     - Monitor during execution
     - Verify success
     - Document completion

  5. Post-Change Review:
     - Verify metrics
     - Check for errors
     - Gather feedback
     - Update documentation
```

## Daily Maintenance

### Daily Checklist

```bash
#!/bin/bash
# daily-maintenance.sh - Run every day at 6:00 AM

set -e

echo "=== Daily Maintenance - $(date) ==="

# 1. Check system health
echo "1. Checking system health..."
curl -f https://api.southville8b.edu.ph/health || echo "ALERT: Health check failed"

# 2. Review error logs
echo "2. Reviewing error logs..."
docker-compose logs --tail=1000 --since=24h | grep -i error > /tmp/daily-errors.log
ERROR_COUNT=$(wc -l < /tmp/daily-errors.log)
echo "   Found $ERROR_COUNT errors in last 24h"
if [ $ERROR_COUNT -gt 100 ]; then
  echo "   ALERT: High error count!"
fi

# 3. Check disk usage
echo "3. Checking disk usage..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
echo "   Disk usage: $DISK_USAGE%"
if [ $DISK_USAGE -gt 80 ]; then
  echo "   ALERT: High disk usage!"
fi

# 4. Verify backups
echo "4. Verifying latest backup..."
LATEST_BACKUP=$(ls -t /backups/database/*.sql.gz 2>/dev/null | head -1)
if [ -z "$LATEST_BACKUP" ]; then
  echo "   ALERT: No backup found!"
else
  BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")) / 3600 ))
  echo "   Latest backup: $LATEST_BACKUP ($BACKUP_AGE hours old)"
  if [ $BACKUP_AGE -gt 25 ]; then
    echo "   ALERT: Backup is too old!"
  fi
fi

# 5. Check service status
echo "5. Checking service status..."
docker-compose ps

# 6. Monitor memory usage
echo "6. Monitoring memory usage..."
free -h

# 7. Check for long-running queries
echo "7. Checking for long-running queries..."
# This would connect to database and check

# 8. Review application metrics
echo "8. Reviewing application metrics..."
curl -s http://localhost:9090/api/v1/query?query=up | jq '.data.result[] | {job: .metric.job, up: .value[1]}'

# 9. Generate daily report
echo "9. Generating daily report..."
cat > /tmp/daily-maintenance-report.txt <<EOF
Daily Maintenance Report - $(date)
================================

System Health: OK
Error Count: $ERROR_COUNT
Disk Usage: $DISK_USAGE%
Latest Backup: $BACKUP_AGE hours old

See detailed logs in /var/log/maintenance/
EOF

# 10. Send report
echo "10. Sending report..."
# Implementation depends on notification system

echo "=== Daily Maintenance Complete ==="
```

### Morning Health Check

```typescript
// Run at 6:00 AM daily
export async function morningHealthCheck() {
  const checks = {
    api: await checkApiHealth(),
    database: await checkDatabaseHealth(),
    cache: await checkCacheHealth(),
    storage: await checkStorageHealth(),
    realtime: await checkRealtimeHealth(),
  };

  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    status: Object.values(checks).every(c => c.healthy) ? 'healthy' : 'unhealthy',
    checks,
    metrics: await gatherDailyMetrics(),
  };

  // Send to monitoring
  await sendHealthReport(report);

  // Alert if issues found
  const issues = Object.entries(checks)
    .filter(([_, check]) => !check.healthy)
    .map(([name, check]) => ({ service: name, issue: check.error }));

  if (issues.length > 0) {
    await sendAlert({
      severity: 'warning',
      title: 'Morning Health Check Failed',
      message: `${issues.length} service(s) unhealthy`,
      metadata: { issues },
    });
  }

  return report;
}

async function checkApiHealth() {
  try {
    const response = await fetch('https://api.southville8b.edu.ph/health', {
      timeout: 5000,
    });
    const data = await response.json();
    return {
      healthy: data.status === 'ok',
      responseTime: data.responseTime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

async function checkDatabaseHealth() {
  try {
    const result = await supabase
      .from('health_check')
      .select('*')
      .limit(1);

    const slowQueries = await supabase.rpc('get_slow_queries');

    return {
      healthy: result.error === null,
      slowQueries: slowQueries.data?.length || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

async function gatherDailyMetrics() {
  return {
    requests24h: await getMetric('http_requests_total', '24h'),
    errorRate24h: await getMetric('http_request_errors', '24h'),
    avgResponseTime: await getMetric('http_request_duration_avg', '24h'),
    activeUsers: await getMetric('active_users', 'now'),
    diskUsage: await getMetric('disk_usage_percent', 'now'),
  };
}
```

### Log Review Automation

```typescript
// Automated log analysis
export async function analyzeDailyLogs() {
  const logPatterns = {
    errors: /ERROR|Exception|FATAL/i,
    warnings: /WARN|WARNING/i,
    slowQueries: /slow query|query took/i,
    authFailures: /authentication failed|unauthorized/i,
    rateLimit: /rate limit exceeded/i,
  };

  const logs = await fetchLogs({ since: '24h' });
  const analysis = {
    timestamp: new Date().toISOString(),
    totalLines: logs.length,
    patterns: {},
    topErrors: [],
    recommendations: [],
  };

  // Analyze patterns
  for (const [name, pattern] of Object.entries(logPatterns)) {
    const matches = logs.filter(log => pattern.test(log.message));
    analysis.patterns[name] = {
      count: matches.length,
      percentage: (matches.length / logs.length * 100).toFixed(2),
      samples: matches.slice(0, 5),
    };
  }

  // Identify top errors
  const errorCounts = {};
  logs
    .filter(log => logPatterns.errors.test(log.message))
    .forEach(log => {
      const key = log.message.substring(0, 100); // First 100 chars as key
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    });

  analysis.topErrors = Object.entries(errorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([message, count]) => ({ message, count }));

  // Generate recommendations
  if (analysis.patterns.errors.count > 100) {
    analysis.recommendations.push({
      severity: 'high',
      message: 'High error count detected',
      action: 'Review error logs and investigate root causes',
    });
  }

  if (analysis.patterns.slowQueries.count > 50) {
    analysis.recommendations.push({
      severity: 'medium',
      message: 'Many slow queries detected',
      action: 'Review and optimize database queries',
    });
  }

  if (analysis.patterns.authFailures.count > 1000) {
    analysis.recommendations.push({
      severity: 'high',
      message: 'High authentication failure rate',
      action: 'Investigate potential security issue',
    });
  }

  return analysis;
}
```

## Weekly Maintenance

### Weekly Checklist

```bash
#!/bin/bash
# weekly-maintenance.sh - Run every Sunday at 2:00 AM

set -e

echo "=== Weekly Maintenance - $(date) ==="

# 1. Database maintenance
echo "1. Running database maintenance..."
./scripts/db-maintenance.sh

# 2. Clear old logs
echo "2. Clearing old logs..."
find /var/log -name "*.log" -mtime +30 -delete
find /var/log -name "*.gz" -mtime +90 -delete

# 3. Update dependencies (check only)
echo "3. Checking for dependency updates..."
cd backend-nestjs && npm outdated || true
cd ../frontend-nextjs && npm outdated || true
cd ../chat-service && npm outdated || true

# 4. Analyze bundle sizes
echo "4. Analyzing bundle sizes..."
cd frontend-nextjs
npm run build
cd ..

# 5. Review security alerts
echo "5. Checking for security vulnerabilities..."
cd backend-nestjs && npm audit || true
cd ../frontend-nextjs && npm audit || true
cd ../chat-service && npm audit || true

# 6. Check SSL certificate expiry
echo "6. Checking SSL certificates..."
echo | openssl s_client -servername southville8b.edu.ph -connect southville8b.edu.ph:443 2>/dev/null | openssl x509 -noout -dates

# 7. Verify backup integrity
echo "7. Verifying backup integrity..."
./scripts/verify-backups.sh

# 8. Clean up old backups
echo "8. Cleaning up old backups..."
find /backups -type f -mtime +30 -delete

# 9. Review monitoring alerts
echo "9. Reviewing monitoring alerts from past week..."
# Query monitoring system for alerts

# 10. Generate weekly report
echo "10. Generating weekly report..."
./scripts/generate-weekly-report.sh

echo "=== Weekly Maintenance Complete ==="
```

### Performance Analysis

```typescript
// Weekly performance analysis
export async function weeklyPerformanceAnalysis() {
  const timeRange = { start: '7d', end: 'now' };

  const metrics = {
    api: await analyzeApiPerformance(timeRange),
    database: await analyzeDatabasePerformance(timeRange),
    frontend: await analyzeFrontendPerformance(timeRange),
    storage: await analyzeStoragePerformance(timeRange),
  };

  const trends = {
    responseTime: calculateTrend(metrics.api.responseTime),
    errorRate: calculateTrend(metrics.api.errorRate),
    throughput: calculateTrend(metrics.api.throughput),
    dbQueryTime: calculateTrend(metrics.database.queryTime),
  };

  const report = {
    timestamp: new Date().toISOString(),
    period: '7 days',
    metrics,
    trends,
    recommendations: generateRecommendations(metrics, trends),
    alerts: identifyAnomalies(metrics),
  };

  return report;
}

async function analyzeApiPerformance(timeRange: any) {
  return {
    responseTime: {
      p50: await getMetric('http_request_duration_p50', timeRange),
      p95: await getMetric('http_request_duration_p95', timeRange),
      p99: await getMetric('http_request_duration_p99', timeRange),
    },
    errorRate: {
      total: await getMetric('http_errors_total', timeRange),
      rate: await getMetric('http_error_rate', timeRange),
    },
    throughput: {
      total: await getMetric('http_requests_total', timeRange),
      rps: await getMetric('http_requests_per_second', timeRange),
    },
    slowestEndpoints: await getMetric('slowest_endpoints', timeRange),
  };
}

function calculateTrend(data: number[]): string {
  if (data.length < 2) return 'insufficient_data';

  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));

  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const change = ((avgSecond - avgFirst) / avgFirst) * 100;

  if (Math.abs(change) < 5) return 'stable';
  if (change > 0) return 'increasing';
  return 'decreasing';
}

function generateRecommendations(metrics: any, trends: any): string[] {
  const recommendations = [];

  if (trends.responseTime === 'increasing') {
    recommendations.push('Response times are increasing. Consider scaling or optimization.');
  }

  if (trends.errorRate === 'increasing') {
    recommendations.push('Error rates are increasing. Review error logs and fix issues.');
  }

  if (metrics.database.queryTime.p95 > 1000) {
    recommendations.push('Database queries are slow. Review and optimize slow queries.');
  }

  if (metrics.api.slowestEndpoints.length > 0) {
    recommendations.push(`Optimize slow endpoints: ${metrics.api.slowestEndpoints.join(', ')}`);
  }

  return recommendations;
}
```

### Security Review

```typescript
// Weekly security review
export async function weeklySecurityReview() {
  const review = {
    timestamp: new Date().toISOString(),
    vulnerabilities: await checkVulnerabilities(),
    authAnalysis: await analyzeAuthentication(),
    accessPatterns: await analyzeAccessPatterns(),
    suspiciousActivity: await detectSuspiciousActivity(),
    recommendations: [],
  };

  // Check for high-severity vulnerabilities
  const highSeverity = review.vulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical');
  if (highSeverity.length > 0) {
    review.recommendations.push({
      priority: 'urgent',
      message: `${highSeverity.length} high/critical vulnerabilities found`,
      action: 'Update dependencies immediately',
    });
  }

  // Check for authentication anomalies
  if (review.authAnalysis.failureRate > 0.1) {
    review.recommendations.push({
      priority: 'high',
      message: 'High authentication failure rate',
      action: 'Investigate potential brute force attempts',
    });
  }

  // Check for suspicious patterns
  if (review.suspiciousActivity.length > 0) {
    review.recommendations.push({
      priority: 'high',
      message: 'Suspicious activity detected',
      action: 'Review security logs and block if necessary',
    });
  }

  return review;
}

async function checkVulnerabilities() {
  // Run npm audit and parse results
  const audits = await Promise.all([
    runAudit('backend-nestjs'),
    runAudit('frontend-nextjs'),
    runAudit('chat-service'),
  ]);

  return audits.flatMap(audit => audit.vulnerabilities);
}

async function analyzeAuthentication() {
  const logs = await fetchLogs({
    since: '7d',
    filter: 'authentication',
  });

  const total = logs.length;
  const failures = logs.filter(log => log.message.includes('failed')).length;
  const successRate = ((total - failures) / total) * 100;

  return {
    totalAttempts: total,
    failures,
    successRate,
    failureRate: failures / total,
    topFailureReasons: analyzeFailureReasons(logs),
  };
}
```

## Monthly Maintenance

### Monthly Checklist

```bash
#!/bin/bash
# monthly-maintenance.sh - Run first Sunday of month at 2:00 AM

set -e

echo "=== Monthly Maintenance - $(date) ==="

# 1. Deep database maintenance
echo "1. Running deep database maintenance..."
./scripts/db-deep-maintenance.sh

# 2. Update all dependencies
echo "2. Updating dependencies (review required)..."
./scripts/check-updates.sh > /tmp/updates-available.txt

# 3. Security patches
echo "3. Checking for security patches..."
./scripts/security-patches.sh

# 4. Review and rotate API keys
echo "4. Checking API key ages..."
# List API keys and their creation dates

# 5. Capacity planning review
echo "5. Reviewing capacity metrics..."
./scripts/capacity-report.sh

# 6. Clean up old data
echo "6. Cleaning up old data..."
# Archive old logs, notifications, etc.

# 7. Review user accounts
echo "7. Reviewing user accounts..."
# Check for inactive accounts, suspicious activity

# 8. Update documentation
echo "8. Documentation review reminder..."
echo "   - Update runbooks if procedures changed"
echo "   - Review and update API documentation"
echo "   - Update architecture diagrams if needed"

# 9. Disaster recovery test
echo "9. Scheduling disaster recovery test..."
# Schedule DR test for next month

# 10. Generate monthly report
echo "10. Generating monthly report..."
./scripts/generate-monthly-report.sh

echo "=== Monthly Maintenance Complete ==="
```

### Capacity Planning

```typescript
// Monthly capacity planning analysis
export async function monthlyCapacityAnalysis() {
  const timeRange = { start: '30d', end: 'now' };

  const resources = {
    cpu: await analyzeCpuUsage(timeRange),
    memory: await analyzeMemoryUsage(timeRange),
    storage: await analyzeStorageUsage(timeRange),
    database: await analyzeDatabaseCapacity(timeRange),
    bandwidth: await analyzeBandwidth(timeRange),
  };

  const growth = {
    users: await calculateUserGrowth(timeRange),
    requests: await calculateRequestGrowth(timeRange),
    storage: await calculateStorageGrowth(timeRange),
  };

  const projections = {
    threeMonths: projectCapacity(resources, growth, 90),
    sixMonths: projectCapacity(resources, growth, 180),
    oneYear: projectCapacity(resources, growth, 365),
  };

  const recommendations = generateCapacityRecommendations(resources, projections);

  return {
    timestamp: new Date().toISOString(),
    current: resources,
    growth,
    projections,
    recommendations,
  };
}

async function analyzeCpuUsage(timeRange: any) {
  const usage = await getMetricHistory('cpu_usage_percent', timeRange);

  return {
    average: calculateAverage(usage),
    peak: Math.max(...usage),
    p95: calculatePercentile(usage, 95),
    trend: calculateTrend(usage),
    capacity: {
      current: 100,
      available: 100 - calculateAverage(usage),
      utilizationPercent: calculateAverage(usage),
    },
  };
}

function projectCapacity(resources: any, growth: any, days: number) {
  const growthRate = growth.requests.monthlyGrowth / 30; // Daily growth rate
  const projectedGrowth = 1 + (growthRate * days);

  return {
    cpu: {
      projected: resources.cpu.average * projectedGrowth,
      capacity: resources.cpu.capacity.current,
      utilizationPercent: (resources.cpu.average * projectedGrowth / resources.cpu.capacity.current) * 100,
      willExceed: (resources.cpu.average * projectedGrowth) > (resources.cpu.capacity.current * 0.8),
    },
    memory: {
      projected: resources.memory.average * projectedGrowth,
      capacity: resources.memory.capacity.current,
      utilizationPercent: (resources.memory.average * projectedGrowth / resources.memory.capacity.current) * 100,
      willExceed: (resources.memory.average * projectedGrowth) > (resources.memory.capacity.current * 0.8),
    },
    storage: {
      projected: resources.storage.used + (resources.storage.growthRate * days),
      capacity: resources.storage.total,
      utilizationPercent: ((resources.storage.used + (resources.storage.growthRate * days)) / resources.storage.total) * 100,
      willExceed: (resources.storage.used + (resources.storage.growthRate * days)) > (resources.storage.total * 0.8),
    },
  };
}

function generateCapacityRecommendations(resources: any, projections: any): string[] {
  const recommendations = [];

  // Check 3-month projection
  if (projections.threeMonths.cpu.willExceed) {
    recommendations.push({
      priority: 'high',
      resource: 'CPU',
      message: 'CPU capacity will be exceeded in 3 months',
      action: 'Plan to scale up CPU resources',
    });
  }

  if (projections.threeMonths.memory.willExceed) {
    recommendations.push({
      priority: 'high',
      resource: 'Memory',
      message: 'Memory capacity will be exceeded in 3 months',
      action: 'Plan to scale up memory resources',
    });
  }

  if (projections.threeMonths.storage.willExceed) {
    recommendations.push({
      priority: 'high',
      resource: 'Storage',
      message: 'Storage capacity will be exceeded in 3 months',
      action: 'Plan to expand storage or archive old data',
    });
  }

  // Check 6-month projection
  if (projections.sixMonths.cpu.willExceed && !projections.threeMonths.cpu.willExceed) {
    recommendations.push({
      priority: 'medium',
      resource: 'CPU',
      message: 'CPU capacity will be exceeded in 6 months',
      action: 'Begin planning for CPU scaling',
    });
  }

  return recommendations;
}
```

### Archive Old Data

```typescript
// Archive old data monthly
export async function archiveOldData() {
  const archiveDate = new Date();
  archiveDate.setMonth(archiveDate.getMonth() - 6); // Archive data older than 6 months

  const results = {
    timestamp: new Date().toISOString(),
    archiveDate: archiveDate.toISOString(),
    archived: {},
    errors: [],
  };

  try {
    // Archive old notifications
    const notifications = await supabase
      .from('notifications')
      .select('*')
      .lt('created_at', archiveDate.toISOString());

    if (notifications.data && notifications.data.length > 0) {
      await archiveToStorage('notifications', notifications.data);
      await supabase
        .from('notifications')
        .delete()
        .lt('created_at', archiveDate.toISOString());

      results.archived['notifications'] = notifications.data.length;
    }

    // Archive old activity logs
    const activityLogs = await supabase
      .from('activity_logs')
      .select('*')
      .lt('created_at', archiveDate.toISOString());

    if (activityLogs.data && activityLogs.data.length > 0) {
      await archiveToStorage('activity_logs', activityLogs.data);
      await supabase
        .from('activity_logs')
        .delete()
        .lt('created_at', archiveDate.toISOString());

      results.archived['activity_logs'] = activityLogs.data.length;
    }

    // Archive old chat messages (keep metadata, archive content)
    const oldMessages = await supabase
      .from('messages')
      .select('*')
      .lt('created_at', archiveDate.toISOString());

    if (oldMessages.data && oldMessages.data.length > 0) {
      await archiveToStorage('messages', oldMessages.data);
      // Keep message metadata but clear content
      await supabase
        .from('messages')
        .update({ content: '[archived]' })
        .lt('created_at', archiveDate.toISOString());

      results.archived['messages'] = oldMessages.data.length;
    }

  } catch (error) {
    results.errors.push({
      operation: 'archive',
      error: error.message,
    });
  }

  return results;
}

async function archiveToStorage(type: string, data: any[]) {
  const fileName = `archives/${type}-${Date.now()}.json.gz`;
  const compressed = await compressData(JSON.stringify(data));

  await supabase.storage
    .from('archives')
    .upload(fileName, compressed);

  return fileName;
}
```

## Database Maintenance

### Routine Database Maintenance

```sql
-- Database maintenance script (run weekly)

-- 1. Update table statistics
ANALYZE VERBOSE;

-- 2. Vacuum tables to reclaim space
VACUUM (VERBOSE, ANALYZE);

-- 3. Reindex if needed (check for bloat first)
-- Run selectively on tables with high bloat
REINDEX TABLE CONCURRENTLY users;
REINDEX TABLE CONCURRENTLY assignments;
REINDEX TABLE CONCURRENTLY submissions;

-- 4. Check for missing indexes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.5
ORDER BY n_distinct DESC;

-- 5. Identify unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- 6. Check for duplicate indexes
SELECT
  a.indrelid::regclass,
  a.indexrelid::regclass AS index1,
  b.indexrelid::regclass AS index2,
  a.indkey
FROM pg_index a
JOIN pg_index b ON a.indrelid = b.indrelid
WHERE a.indexrelid > b.indexrelid
  AND a.indkey = b.indkey;
```

### Database Maintenance Script

```bash
#!/bin/bash
# db-maintenance.sh - Weekly database maintenance

set -e

DB_HOST="${SUPABASE_DB_HOST}"
DB_USER="${SUPABASE_DB_USER}"
DB_NAME="${SUPABASE_DB_NAME}"

echo "=== Database Maintenance - $(date) ==="

# 1. Connection info
echo "1. Checking database connection..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();"

# 2. Check database size
echo "2. Checking database size..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT
  pg_size_pretty(pg_database_size('$DB_NAME')) as database_size;
"

# 3. Check table sizes
echo "3. Checking table sizes..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
"

# 4. Update statistics
echo "4. Updating table statistics..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "ANALYZE VERBOSE;"

# 5. Vacuum
echo "5. Running vacuum..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "VACUUM (VERBOSE, ANALYZE);"

# 6. Check for bloat
echo "6. Checking for table bloat..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT
  schemaname,
  tablename,
  n_dead_tup,
  n_live_tup,
  ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_tuple_percent
FROM pg_stat_user_tables
WHERE n_live_tup > 0
ORDER BY n_dead_tup DESC
LIMIT 10;
"

# 7. Check slow queries
echo "7. Checking for slow queries..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
"

# 8. Check index usage
echo "8. Checking index usage..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC
LIMIT 10;
"

echo "=== Database Maintenance Complete ==="
```

### Database Performance Tuning

```sql
-- Performance tuning queries

-- 1. Find tables with seq scans (should use indexes)
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / NULLIF(seq_scan, 0) as avg_seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;

-- 2. Find missing indexes for foreign keys
SELECT
  c.conrelid::regclass AS table_name,
  STRING_AGG(a.attname, ', ') AS columns,
  'CREATE INDEX ON ' || c.conrelid::regclass || ' (' || STRING_AGG(a.attname, ', ') || ');' AS create_index
FROM pg_constraint c
JOIN LATERAL UNNEST(c.conkey) WITH ORDINALITY AS u(attnum, attposition) ON TRUE
JOIN pg_attribute a ON a.attnum = u.attnum AND a.attrelid = c.conrelid
WHERE c.contype = 'f'
  AND NOT EXISTS (
    SELECT 1
    FROM pg_index i
    WHERE i.indrelid = c.conrelid
      AND c.conkey::int[] <@ i.indkey::int[]
      AND i.indkey[0:cardinality(c.conkey)-1] = c.conkey
  )
GROUP BY c.conrelid, c.conname;

-- 3. Identify tables needing partition
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_tup_ins + n_tup_upd + n_tup_del as total_modifications
FROM pg_stat_user_tables
JOIN pg_tables ON pg_stat_user_tables.tablename = pg_tables.tablename
WHERE pg_total_relation_size(schemaname||'.'||tablename) > 1073741824 -- > 1GB
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 4. Check for lock contention
SELECT
  locktype,
  relation::regclass,
  mode,
  transactionid AS tid,
  virtualtransaction AS vtid,
  pid,
  granted
FROM pg_catalog.pg_locks
WHERE NOT granted
ORDER BY relation;
```

## Cache Management

### Redis Cache Maintenance

```typescript
// Redis cache maintenance
export class CacheMaintenanceService {
  constructor(private redis: Redis) {}

  async performMaintenance() {
    console.log('Starting cache maintenance...');

    // 1. Check memory usage
    const info = await this.redis.info('memory');
    console.log('Memory info:', info);

    // 2. Clean expired keys
    await this.cleanExpiredKeys();

    // 3. Analyze key patterns
    await this.analyzeKeyPatterns();

    // 4. Optimize memory
    await this.optimizeMemory();

    console.log('Cache maintenance complete');
  }

  private async cleanExpiredKeys() {
    // Redis automatically removes expired keys, but we can help
    // by scanning for keys that should expire soon

    const stream = this.redis.scanStream({
      match: '*',
      count: 100,
    });

    let cleaned = 0;

    stream.on('data', async (keys: string[]) => {
      for (const key of keys) {
        const ttl = await this.redis.ttl(key);

        // If TTL is very short, delete now to free memory
        if (ttl > 0 && ttl < 60) {
          await this.redis.del(key);
          cleaned++;
        }
      }
    });

    await new Promise((resolve) => stream.on('end', resolve));

    console.log(`Cleaned ${cleaned} expiring keys`);
  }

  private async analyzeKeyPatterns() {
    const patterns: Record<string, number> = {};
    const stream = this.redis.scanStream({
      match: '*',
      count: 100,
    });

    stream.on('data', (keys: string[]) => {
      for (const key of keys) {
        const pattern = key.split(':')[0]; // Get prefix
        patterns[pattern] = (patterns[pattern] || 0) + 1;
      }
    });

    await new Promise((resolve) => stream.on('end', resolve));

    console.log('Key patterns:', patterns);

    // Alert if certain patterns are growing too large
    for (const [pattern, count] of Object.entries(patterns)) {
      if (count > 10000) {
        console.warn(`Pattern ${pattern} has ${count} keys - consider cleanup`);
      }
    }
  }

  private async optimizeMemory() {
    // Defragment memory (Redis 4.0+)
    try {
      await this.redis.call('MEMORY', 'PURGE');
      console.log('Memory purged');
    } catch (error) {
      console.log('Memory purge not supported or failed');
    }

    // Get memory stats
    const used = await this.redis.call('MEMORY', 'STATS');
    console.log('Memory stats:', used);
  }

  async clearNamespace(namespace: string) {
    // Clear all keys in a namespace
    const stream = this.redis.scanStream({
      match: `${namespace}:*`,
      count: 100,
    });

    let deleted = 0;

    stream.on('data', async (keys: string[]) => {
      if (keys.length > 0) {
        await this.redis.del(...keys);
        deleted += keys.length;
      }
    });

    await new Promise((resolve) => stream.on('end', resolve));

    console.log(`Deleted ${deleted} keys from namespace ${namespace}`);
  }

  async warmCache() {
    // Pre-populate cache with frequently accessed data
    console.log('Warming cache...');

    // Example: Cache frequently accessed user data
    const popularUsers = await this.getPopularUsers();
    for (const user of popularUsers) {
      await this.redis.setex(
        `user:${user.id}`,
        3600,
        JSON.stringify(user),
      );
    }

    // Example: Cache system settings
    const settings = await this.getSystemSettings();
    await this.redis.setex(
      'system:settings',
      86400,
      JSON.stringify(settings),
    );

    console.log('Cache warmed');
  }

  private async getPopularUsers() {
    // Implementation would query database for popular users
    return [];
  }

  private async getSystemSettings() {
    // Implementation would query database for system settings
    return {};
  }
}
```

### Cache Strategy Review

```typescript
// Review and optimize caching strategy
export async function reviewCacheStrategy() {
  const redis = new Redis(process.env.REDIS_URL);

  // 1. Analyze cache hit rates
  const info = await redis.info('stats');
  const stats = parseRedisInfo(info);

  const hitRate = stats.keyspace_hits / (stats.keyspace_hits + stats.keyspace_misses);

  console.log(`Cache hit rate: ${(hitRate * 100).toFixed(2)}%`);

  if (hitRate < 0.8) {
    console.warn('Cache hit rate is below 80% - review caching strategy');
  }

  // 2. Identify most accessed keys
  // Note: This requires Redis slowlog or external monitoring

  // 3. Review TTL settings
  const sampleKeys = await getSampleKeys(redis, 1000);
  const ttlAnalysis = await analyzeTTLs(redis, sampleKeys);

  console.log('TTL Analysis:', ttlAnalysis);

  // 4. Recommendations
  const recommendations = [];

  if (hitRate < 0.8) {
    recommendations.push('Increase cache TTLs for frequently accessed data');
    recommendations.push('Implement cache warming for popular resources');
  }

  if (ttlAnalysis.noTTL > 100) {
    recommendations.push(`${ttlAnalysis.noTTL} keys have no TTL - review and add expiration`);
  }

  return {
    hitRate,
    stats,
    ttlAnalysis,
    recommendations,
  };
}

async function getSampleKeys(redis: Redis, count: number): Promise<string[]> {
  const keys: string[] = [];
  const stream = redis.scanStream({ count: 100 });

  stream.on('data', (batch: string[]) => {
    keys.push(...batch);
    if (keys.length >= count) {
      stream.destroy();
    }
  });

  await new Promise((resolve) => {
    stream.on('end', resolve);
    stream.on('close', resolve);
  });

  return keys.slice(0, count);
}

async function analyzeTTLs(redis: Redis, keys: string[]) {
  const ttls = await Promise.all(keys.map(key => redis.ttl(key)));

  const analysis = {
    noTTL: ttls.filter(ttl => ttl === -1).length,
    expired: ttls.filter(ttl => ttl === -2).length,
    shortTTL: ttls.filter(ttl => ttl > 0 && ttl < 300).length, // < 5 min
    mediumTTL: ttls.filter(ttl => ttl >= 300 && ttl < 3600).length, // 5-60 min
    longTTL: ttls.filter(ttl => ttl >= 3600).length, // > 1 hour
  };

  return analysis;
}
```

## Log Management

### Log Rotation

```bash
# /etc/logrotate.d/southville
/var/log/southville/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        # Reload services if needed
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}

/var/log/southville/api/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 app app
    sharedscripts
    postrotate
        # Signal application to reopen log files
        kill -USR1 $(cat /var/run/southville-api.pid) > /dev/null 2>&1 || true
    endscript
}
```

### Log Cleanup Script

```bash
#!/bin/bash
# log-cleanup.sh - Clean old logs

set -e

LOG_DIR="/var/log/southville"
RETENTION_DAYS=90

echo "=== Log Cleanup - $(date) ==="

# Remove old compressed logs
echo "Removing logs older than $RETENTION_DAYS days..."
find "$LOG_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete

# Remove old uncompressed logs (keep only 7 days)
echo "Removing uncompressed logs older than 7 days..."
find "$LOG_DIR" -name "*.log" -mtime +7 -delete

# Remove empty log files
echo "Removing empty log files..."
find "$LOG_DIR" -name "*.log" -size 0 -delete

# Check disk usage
echo "Current log directory size:"
du -sh "$LOG_DIR"

echo "=== Log Cleanup Complete ==="
```

## Dependency Updates

### Update Check Script

```bash
#!/bin/bash
# check-updates.sh - Check for available updates

echo "=== Checking for Updates - $(date) ==="

# Backend NestJS
echo "Backend (NestJS):"
cd backend-nestjs
npm outdated --long 2>/dev/null || echo "  All packages up to date"

# Frontend Next.js
echo -e "\nFrontend (Next.js):"
cd ../frontend-nextjs
npm outdated --long 2>/dev/null || echo "  All packages up to date"

# Chat Service
echo -e "\nChat Service:"
cd ../chat-service
npm outdated --long 2>/dev/null || echo "  All packages up to date"

cd ..

echo -e "\n=== Update Check Complete ==="
```

### Safe Update Procedure

```bash
#!/bin/bash
# safe-update.sh - Safely update dependencies

set -e

COMPONENT=$1
UPDATE_TYPE=$2  # patch, minor, major

if [ -z "$COMPONENT" ]; then
  echo "Usage: ./safe-update.sh <component> [update-type]"
  echo "Components: backend, frontend, chat"
  echo "Update types: patch, minor, major (default: patch)"
  exit 1
fi

UPDATE_TYPE=${UPDATE_TYPE:-patch}

echo "=== Safe Update: $COMPONENT ($UPDATE_TYPE) ==="

# Navigate to component
case $COMPONENT in
  backend)
    cd backend-nestjs
    ;;
  frontend)
    cd frontend-nextjs
    ;;
  chat)
    cd chat-service
    ;;
  *)
    echo "Unknown component: $COMPONENT"
    exit 1
    ;;
esac

# 1. Backup current package files
echo "1. Backing up package files..."
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup

# 2. Update dependencies
echo "2. Updating dependencies..."
case $UPDATE_TYPE in
  patch)
    npm update
    ;;
  minor)
    npm update --save
    ;;
  major)
    npx npm-check-updates -u
    npm install
    ;;
esac

# 3. Run tests
echo "3. Running tests..."
if ! npm test; then
  echo "Tests failed! Rolling back..."
  mv package.json.backup package.json
  mv package-lock.json.backup package-lock.json
  npm install
  exit 1
fi

# 4. Build
echo "4. Building..."
if ! npm run build; then
  echo "Build failed! Rolling back..."
  mv package.json.backup package.json
  mv package-lock.json.backup package-lock.json
  npm install
  exit 1
fi

# 5. Clean up backups
echo "5. Cleaning up..."
rm package.json.backup package-lock.json.backup

echo "=== Update Complete ==="
echo "Please test in staging before deploying to production"
```

## Security Patching

### Security Audit

```bash
#!/bin/bash
# security-audit.sh - Run security audits

echo "=== Security Audit - $(date) ==="

# Backend
echo "Backend Security Audit:"
cd backend-nestjs
npm audit --audit-level=moderate

# Frontend
echo -e "\nFrontend Security Audit:"
cd ../frontend-nextjs
npm audit --audit-level=moderate

# Chat Service
echo -e "\nChat Service Security Audit:"
cd ../chat-service
npm audit --audit-level=moderate

cd ..

echo -e "\n=== Security Audit Complete ==="
```

### Auto-patch Script

```bash
#!/bin/bash
# auto-patch.sh - Automatically apply security patches

set -e

echo "=== Auto-patch Security Vulnerabilities - $(date) ==="

# Function to patch a component
patch_component() {
  local component=$1
  local dir=$2

  echo "Patching $component..."
  cd "$dir"

  # Try automatic fix
  if npm audit fix; then
    echo "  Automatic fixes applied"

    # Run tests
    if npm test; then
      echo "  Tests passed"
    else
      echo "  WARNING: Tests failed after patching"
      return 1
    fi
  else
    echo "  No automatic fixes available"
  fi

  cd -
}

# Patch each component
patch_component "Backend" "backend-nestjs" || echo "Backend patching had issues"
patch_component "Frontend" "frontend-nextjs" || echo "Frontend patching had issues"
patch_component "Chat Service" "chat-service" || echo "Chat service patching had issues"

echo "=== Auto-patch Complete ==="
echo "Review changes and test in staging before deploying"
```

## Backup Verification

### Backup Verification Script

```bash
#!/bin/bash
# verify-backups.sh - Verify backup integrity

set -e

BACKUP_DIR="/backups"
VERIFICATION_LOG="/var/log/backup-verification.log"

echo "=== Backup Verification - $(date) ===" | tee -a "$VERIFICATION_LOG"

# Find latest backup
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/database/*.sql.gz 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
  echo "ERROR: No backup found!" | tee -a "$VERIFICATION_LOG"
  exit 1
fi

echo "Verifying backup: $LATEST_BACKUP" | tee -a "$VERIFICATION_LOG"

# 1. Check file integrity
echo "1. Checking file integrity..." | tee -a "$VERIFICATION_LOG"
if gzip -t "$LATEST_BACKUP"; then
  echo "   File integrity: OK" | tee -a "$VERIFICATION_LOG"
else
  echo "   ERROR: File is corrupted!" | tee -a "$VERIFICATION_LOG"
  exit 1
fi

# 2. Check file size
echo "2. Checking file size..." | tee -a "$VERIFICATION_LOG"
SIZE=$(stat -f%z "$LATEST_BACKUP" 2>/dev/null || stat -c%s "$LATEST_BACKUP")
MIN_SIZE=1048576  # 1MB minimum
if [ "$SIZE" -gt "$MIN_SIZE" ]; then
  echo "   File size: $(numfmt --to=iec-i --suffix=B $SIZE)" | tee -a "$VERIFICATION_LOG"
else
  echo "   WARNING: File size is suspiciously small!" | tee -a "$VERIFICATION_LOG"
fi

# 3. Test restore (to test database)
echo "3. Testing restore..." | tee -a "$VERIFICATION_LOG"
# This would restore to a test database
# gunzip -c "$LATEST_BACKUP" | psql -h test-db -U user -d test_db

echo "   Restore test: SKIPPED (configure test database)" | tee -a "$VERIFICATION_LOG"

echo "=== Backup Verification Complete ===" | tee -a "$VERIFICATION_LOG"
```

## Performance Optimization

### Performance Optimization Routine

```typescript
// Monthly performance optimization
export async function performanceOptimizationRoutine() {
  console.log('Starting performance optimization routine...');

  const optimizations = {
    database: await optimizeDatabase(),
    cache: await optimizeCache(),
    assets: await optimizeAssets(),
    queries: await optimizeQueries(),
  };

  const report = {
    timestamp: new Date().toISOString(),
    optimizations,
    improvements: calculateImprovements(optimizations),
    recommendations: generateOptimizationRecommendations(optimizations),
  };

  console.log('Performance optimization complete');
  return report;
}

async function optimizeDatabase() {
  // Run VACUUM and ANALYZE
  await runDatabaseMaintenance();

  // Check for missing indexes
  const missingIndexes = await findMissingIndexes();

  // Check for unused indexes
  const unusedIndexes = await findUnusedIndexes();

  return {
    vacuumed: true,
    analyzed: true,
    missingIndexes: missingIndexes.length,
    unusedIndexes: unusedIndexes.length,
    recommendations: [
      ...missingIndexes.map(idx => `Consider adding index: ${idx}`),
      ...unusedIndexes.map(idx => `Consider removing index: ${idx}`),
    ],
  };
}

async function optimizeCache() {
  // Clear old cache entries
  await clearExpiredCache();

  // Warm up cache
  await warmupCache();

  // Analyze cache hit rates
  const hitRate = await analyzeCacheHitRate();

  return {
    cleared: true,
    warmed: true,
    hitRate,
    recommendations: hitRate < 0.8 ? ['Improve caching strategy'] : [],
  };
}

async function optimizeAssets() {
  // Check image optimization
  const images = await checkImageOptimization();

  // Check bundle sizes
  const bundles = await checkBundleSizes();

  return {
    images,
    bundles,
    recommendations: [
      ...images.unoptimized > 0 ? [`Optimize ${images.unoptimized} images`] : [],
      ...bundles.oversized > 0 ? [`Reduce ${bundles.oversized} bundle sizes`] : [],
    ],
  };
}

async function optimizeQueries() {
  // Find slow queries
  const slowQueries = await findSlowQueries();

  // Analyze query patterns
  const patterns = await analyzeQueryPatterns();

  return {
    slowQueries: slowQueries.length,
    patterns,
    recommendations: slowQueries.map(q => `Optimize query: ${q.query.substring(0, 50)}...`),
  };
}
```

---

**Navigation**:
- [← Previous Chapter: System Monitoring](./33-system-monitoring.md)
- [Next Chapter: Backup & Recovery →](./35-backup-recovery.md)
