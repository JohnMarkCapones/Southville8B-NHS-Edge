# Chapter 41: Audit Logging

## Table of Contents
- [Introduction](#introduction)
- [Audit Logging Strategy](#audit-logging-strategy)
- [What to Log](#what-to-log)
- [Log Structure and Format](#log-structure-and-format)
- [Logging Architecture](#logging-architecture)
- [Application Logging](#application-logging)
- [Database Audit Logs](#database-audit-logs)
- [Security Event Logging](#security-event-logging)
- [User Activity Tracking](#user-activity-tracking)
- [Compliance Audit Trails](#compliance-audit-trails)
- [Log Retention Policies](#log-retention-policies)
- [Log Analysis and Monitoring](#log-analysis-and-monitoring)
- [Log Security and Integrity](#log-security-and-integrity)
- [Forensic Investigation](#forensic-investigation)
- [Implementation Examples](#implementation-examples)
- [Monitoring and Alerting](#monitoring-and-alerting)
- [Compliance Reporting](#compliance-reporting)

## Introduction

Audit logging is a critical component of security, compliance, and operational excellence. Comprehensive audit logs provide accountability, enable security incident investigation, support compliance requirements, and help identify system issues before they become problems.

This chapter provides a complete framework for implementing audit logging across the Southville 8B NHS Edge platform, covering application logs, database audit trails, security event logging, and compliance reporting.

### Why Audit Logging Matters

Audit logging serves multiple critical purposes:

1. **Security**: Detect unauthorized access, suspicious activities, and security incidents
2. **Compliance**: Meet FERPA, privacy law, and internal policy requirements
3. **Accountability**: Track who did what, when, and why
4. **Forensics**: Investigate incidents and reconstruct event sequences
5. **Operations**: Troubleshoot issues and optimize performance
6. **Trust**: Demonstrate responsible data stewardship to stakeholders

### Logging Principles

Our audit logging implementation follows these core principles:

```typescript
interface LoggingPrinciple {
  name: string;
  description: string;
  implementation: string[];
}

const loggingPrinciples: LoggingPrinciple[] = [
  {
    name: 'Completeness',
    description: 'Log all security-relevant events without gaps',
    implementation: [
      'Comprehensive event coverage',
      'No blind spots in logging',
      'Log both success and failure',
      'Include sufficient context'
    ]
  },

  {
    name: 'Integrity',
    description: 'Protect logs from tampering and unauthorized modification',
    implementation: [
      'Immutable log storage',
      'Cryptographic signatures',
      'Tamper-evident logging',
      'Separate log infrastructure'
    ]
  },

  {
    name: 'Confidentiality',
    description: 'Protect sensitive information in logs',
    implementation: [
      'Redact sensitive data (passwords, SSNs)',
      'Encrypt logs containing personal data',
      'Access controls on log storage',
      'Secure log transmission'
    ]
  },

  {
    name: 'Availability',
    description: 'Ensure logs are accessible when needed',
    implementation: [
      'Reliable log collection',
      'Redundant log storage',
      'Fast log retrieval',
      'Long-term log retention'
    ]
  },

  {
    name: 'Usability',
    description: 'Make logs easy to search, analyze, and understand',
    implementation: [
      'Structured logging format (JSON)',
      'Consistent field naming',
      'Indexed log storage',
      'Powerful search capabilities'
    ]
  },

  {
    name: 'Performance',
    description: 'Minimize performance impact of logging',
    implementation: [
      'Asynchronous logging',
      'Efficient log formats',
      'Batch log transmission',
      'Optimized log storage'
    ]
  }
];
```

## Audit Logging Strategy

### Logging Objectives

```typescript
interface LoggingObjective {
  category: string;
  objective: string;
  requirements: string[];
  retention: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

const loggingObjectives: LoggingObjective[] = [
  {
    category: 'Security',
    objective: 'Detect and investigate security incidents',
    requirements: [
      'Log all authentication attempts',
      'Log authorization decisions',
      'Log security-relevant actions',
      'Log anomalous behavior',
      'Enable correlation across systems'
    ],
    retention: '7 years',
    priority: 'critical'
  },

  {
    category: 'Compliance',
    objective: 'Demonstrate regulatory compliance',
    requirements: [
      'Log access to education records (FERPA)',
      'Log processing of personal data',
      'Log consent and withdrawal',
      'Log data subject rights requests',
      'Support compliance audits'
    ],
    retention: '7 years',
    priority: 'critical'
  },

  {
    category: 'Accountability',
    objective: 'Track user and system actions',
    requirements: [
      'Log all data modifications',
      'Log administrative actions',
      'Log system configuration changes',
      'Attribute actions to specific users',
      'Provide non-repudiation'
    ],
    retention: '5 years',
    priority: 'high'
  },

  {
    category: 'Operations',
    objective: 'Support troubleshooting and optimization',
    requirements: [
      'Log application errors',
      'Log performance metrics',
      'Log system health indicators',
      'Enable root cause analysis',
      'Support capacity planning'
    ],
    retention: '1 year',
    priority: 'medium'
  },

  {
    category: 'Business Intelligence',
    objective: 'Understand usage patterns and trends',
    requirements: [
      'Log feature usage',
      'Log user engagement metrics',
      'Log system utilization',
      'Support analytics and reporting',
      'Inform product decisions'
    ],
    retention: '2 years',
    priority: 'low'
  }
];
```

### Logging Maturity Model

```typescript
enum LoggingMaturityLevel {
  LEVEL_1_BASIC = 'basic',           // Basic error logging
  LEVEL_2_SECURITY = 'security',     // Security event logging
  LEVEL_3_COMPLIANCE = 'compliance', // Compliance audit trails
  LEVEL_4_ANALYTICS = 'analytics',   // Advanced analytics
  LEVEL_5_PROACTIVE = 'proactive'    // Predictive monitoring
}

interface MaturityLevel {
  level: LoggingMaturityLevel;
  characteristics: string[];
  capabilities: string[];
}

const maturityLevels: MaturityLevel[] = [
  {
    level: LoggingMaturityLevel.LEVEL_1_BASIC,
    characteristics: [
      'Basic application error logs',
      'Manual log review',
      'No centralized logging',
      'Limited retention'
    ],
    capabilities: [
      'Debug application errors',
      'Basic troubleshooting'
    ]
  },

  {
    level: LoggingMaturityLevel.LEVEL_2_SECURITY,
    characteristics: [
      'Authentication and authorization logging',
      'Security event monitoring',
      'Centralized log collection',
      'Real-time alerting'
    ],
    capabilities: [
      'Detect security incidents',
      'Investigate unauthorized access',
      'Monitor suspicious activity'
    ]
  },

  {
    level: LoggingMaturityLevel.LEVEL_3_COMPLIANCE,
    characteristics: [
      'Comprehensive audit trails',
      'Data access logging',
      'Compliance reporting',
      'Long-term retention',
      'Tamper-evident logs'
    ],
    capabilities: [
      'Demonstrate compliance',
      'Support regulatory audits',
      'Track data access',
      'Generate audit reports'
    ]
  },

  {
    level: LoggingMaturityLevel.LEVEL_4_ANALYTICS,
    characteristics: [
      'Advanced log analytics',
      'Behavioral analysis',
      'Anomaly detection',
      'Correlation across sources',
      'Automated investigation'
    ],
    capabilities: [
      'Identify advanced threats',
      'Detect insider threats',
      'Predict incidents',
      'Optimize operations'
    ]
  },

  {
    level: LoggingMaturityLevel.LEVEL_5_PROACTIVE,
    characteristics: [
      'Machine learning-based detection',
      'Predictive analytics',
      'Automated response',
      'Continuous improvement',
      'Risk-based monitoring'
    ],
    capabilities: [
      'Prevent incidents before they occur',
      'Automated threat response',
      'Self-optimizing logging',
      'Proactive risk management'
    ]
  }
];

// Target maturity: Level 3 (Compliance) with selective Level 4 capabilities
```

## What to Log

### Authentication Events

```typescript
interface AuthenticationLog {
  eventType: 'auth_attempt' | 'auth_success' | 'auth_failure' | 'logout' | 'session_expired';
  timestamp: Date;
  userId?: string;
  username: string;
  authMethod: 'password' | 'oauth' | 'sso' | 'mfa' | 'magic_link';

  context: {
    ipAddress: string;
    userAgent: string;
    location?: GeoLocation;
    device?: DeviceInfo;
    sessionId?: string;
  };

  result: {
    success: boolean;
    failureReason?: 'invalid_credentials' | 'account_locked' | 'mfa_failed' | 'account_disabled';
    mfaUsed?: boolean;
    mfaMethod?: string;
  };

  risk: {
    riskScore?: number;
    riskFactors?: string[];
    anomalous?: boolean;
  };

  metadata: {
    requestId: string;
    serverTime: Date;
    processingTime: number;
  };
}

// Examples of what to log:
const authEventsToLog = [
  'User login attempt',
  'Successful login',
  'Failed login (incorrect password)',
  'Failed login (account not found)',
  'Failed login (account locked)',
  'Multi-factor authentication challenge',
  'MFA success',
  'MFA failure',
  'Password reset request',
  'Password reset completion',
  'Account lockout',
  'Account unlock',
  'Session creation',
  'Session expiration',
  'Explicit logout',
  'Concurrent session detected',
  'Suspicious login attempt',
  'Login from new device',
  'Login from new location'
];
```

### Authorization Events

```typescript
interface AuthorizationLog {
  eventType: 'access_granted' | 'access_denied' | 'permission_check';
  timestamp: Date;
  userId: string;
  userRole: string;

  resource: {
    type: string;
    id: string;
    classification: DataClassification;
    owner?: string;
  };

  action: {
    type: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'export' | 'share';
    description: string;
  };

  decision: {
    granted: boolean;
    reason?: string;
    policy?: string;
    conditions?: string[];
  };

  context: {
    ipAddress: string;
    sessionId: string;
    requestPath: string;
    method: string;
  };

  metadata: {
    requestId: string;
    timestamp: Date;
    processingTime: number;
  };
}

// Examples of what to log:
const authzEventsToLog = [
  'Access to student record granted',
  'Access to student record denied (insufficient permissions)',
  'Access to grade data granted',
  'Attempt to access another teacher\'s class',
  'Attempt to modify read-only data',
  'Administrative action performed',
  'Privileged operation executed',
  'Data export initiated',
  'Bulk data access',
  'API access granted',
  'API rate limit exceeded',
  'Attempted privilege escalation'
];
```

### Data Access and Modification

```typescript
interface DataAccessLog {
  eventType: 'data_create' | 'data_read' | 'data_update' | 'data_delete';
  timestamp: Date;
  userId: string;

  data: {
    table: string;
    recordId: string;
    classification: DataClassification;
    dataCategory: string;
    sensitiveFields?: string[];
  };

  operation: {
    type: 'create' | 'read' | 'update' | 'delete' | 'bulk_read' | 'export';
    affectedRows?: number;
    query?: string; // Sanitized query
  };

  changes?: {
    field: string;
    oldValue: any; // Redacted if sensitive
    newValue: any; // Redacted if sensitive
  }[];

  purpose?: string;
  legalBasis?: string;

  context: {
    ipAddress: string;
    sessionId: string;
    source: string; // 'web_ui', 'api', 'batch_job'
  };

  metadata: {
    requestId: string;
    timestamp: Date;
  };
}

// Examples of what to log:
const dataEventsToLog = [
  'Student record created',
  'Student record updated (with field changes)',
  'Student record deleted',
  'Student grade entered',
  'Student grade modified',
  'Bulk grade import',
  'Student data exported',
  'Health record accessed',
  'Disciplinary record created',
  'Transcript generated',
  'Report card published',
  'Parent contact information updated',
  'Teacher assignment changed',
  'Class roster modified',
  'Attendance record updated',
  'Assessment score recorded'
];
```

### Administrative Actions

```typescript
interface AdminActionLog {
  eventType: 'admin_action';
  timestamp: Date;
  adminUserId: string;
  adminRole: string;

  action: {
    category: 'user_management' | 'system_config' | 'security_setting' | 'data_management';
    type: string;
    description: string;
    critical: boolean;
  };

  target?: {
    type: string;
    id: string;
    name: string;
  };

  changes?: {
    setting: string;
    oldValue: any;
    newValue: any;
  }[];

  justification?: string;
  approvalRequired?: boolean;
  approvedBy?: string;

  context: {
    ipAddress: string;
    sessionId: string;
  };

  metadata: {
    requestId: string;
    timestamp: Date;
  };
}

// Examples of what to log:
const adminEventsToLog = [
  'User account created',
  'User account disabled',
  'User role changed',
  'Password reset by admin',
  'Account unlocked by admin',
  'Permissions modified',
  'System configuration changed',
  'Security setting modified',
  'Data retention policy updated',
  'Encryption key rotated',
  'Backup initiated',
  'Data restoration performed',
  'Database migration executed',
  'User data exported by admin',
  'Bulk user import',
  'System maintenance mode enabled',
  'Feature flag changed',
  'API key generated',
  'API key revoked',
  'Integration configured'
];
```

### Security Events

```typescript
interface SecurityEventLog {
  eventType: 'security_event';
  timestamp: Date;
  severity: 'info' | 'warning' | 'critical';

  event: {
    category: 'intrusion_attempt' | 'malware' | 'data_exfiltration' | 'policy_violation' | 'anomaly';
    type: string;
    description: string;
  };

  indicators: {
    ipAddress?: string;
    userId?: string;
    userAgent?: string;
    pattern?: string;
    signatures?: string[];
  };

  detection: {
    method: 'rule_based' | 'anomaly_detection' | 'signature' | 'manual';
    confidence: number; // 0-1
    source: string;
  };

  response: {
    automated: boolean;
    actions: string[];
    escalated: boolean;
    assignedTo?: string;
  };

  metadata: {
    incidentId?: string;
    correlatedEvents?: string[];
    timestamp: Date;
  };
}

// Examples of what to log:
const securityEventsToLog = [
  'Multiple failed login attempts (brute force)',
  'SQL injection attempt detected',
  'XSS attempt detected',
  'CSRF token mismatch',
  'Rate limit exceeded',
  'Unusual data access pattern',
  'Large data export',
  'Access from blacklisted IP',
  'Login from suspicious location',
  'Privilege escalation attempt',
  'File upload of disallowed type',
  'Malicious file detected',
  'Port scan detected',
  'DDoS attempt detected',
  'Unauthorized API access',
  'Session hijacking attempt',
  'Man-in-the-middle attempt detected',
  'Certificate validation failure',
  'Encryption downgrade attempt'
];
```

### Application Events

```typescript
interface ApplicationLog {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  timestamp: Date;
  message: string;

  context: {
    service: string;
    component: string;
    function?: string;
    version: string;
  };

  error?: {
    type: string;
    message: string;
    stack?: string;
    code?: string;
  };

  user?: {
    id?: string;
    sessionId?: string;
  };

  request?: {
    id: string;
    method: string;
    path: string;
    statusCode?: number;
    duration?: number;
  };

  metadata: {
    environment: 'development' | 'staging' | 'production';
    hostname: string;
    processId: number;
    threadId?: number;
  };
}

// Examples of what to log:
const appEventsToLog = [
  'Application startup',
  'Application shutdown',
  'Database connection established',
  'Database connection lost',
  'External API call',
  'External API failure',
  'File upload started',
  'File upload completed',
  'File upload failed',
  'Email sent',
  'Email failed',
  'Job started',
  'Job completed',
  'Job failed',
  'Cache hit',
  'Cache miss',
  'Configuration loaded',
  'Feature flag evaluated',
  'Unexpected error',
  'Performance degradation detected'
];
```

## Log Structure and Format

### JSON Structured Logging

All logs use structured JSON format for consistency and parsability:

```typescript
interface StandardLogEntry {
  // Core fields (present in all logs)
  '@timestamp': string;        // ISO 8601 timestamp
  level: LogLevel;              // debug, info, warn, error, fatal
  message: string;              // Human-readable message
  logger: string;               // Logger name/component

  // Event identification
  event: {
    type: string;               // Event type (e.g., 'auth_attempt')
    category: string;           // Event category (e.g., 'authentication')
    id: string;                 // Unique event ID
    action: string;             // Action performed (e.g., 'login')
    outcome: 'success' | 'failure' | 'unknown';
  };

  // Actor (who performed the action)
  actor?: {
    id: string;                 // User ID
    type: 'user' | 'system' | 'service';
    role?: string;              // User role
    email?: string;             // User email
  };

  // Target (what was acted upon)
  target?: {
    type: string;               // Resource type
    id: string;                 // Resource ID
    name?: string;              // Resource name
    classification?: DataClassification;
  };

  // Context
  context: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    requestId: string;
    geolocation?: {
      country?: string;
      city?: string;
      coordinates?: [number, number];
    };
  };

  // Application metadata
  application: {
    name: string;               // 'frontend-nextjs' or 'backend-nestjs'
    version: string;            // Application version
    environment: 'dev' | 'staging' | 'prod';
  };

  // Host metadata
  host: {
    name: string;               // Hostname
    ip?: string;                // Host IP
  };

  // Request metadata (for HTTP requests)
  http?: {
    request: {
      method: string;
      path: string;
      query?: string;
      headers?: Record<string, string>; // Selected headers
      body?: any;               // Sanitized body
    };
    response: {
      statusCode: number;
      duration: number;         // Milliseconds
      size?: number;            // Bytes
    };
  };

  // Error details (if applicable)
  error?: {
    type: string;
    message: string;
    stack?: string;
    code?: string;
  };

  // Security metadata
  security?: {
    classification: DataClassification;
    sensitivity: 'high' | 'medium' | 'low';
    riskScore?: number;
    threats?: string[];
  };

  // Compliance metadata
  compliance?: {
    regulation: string[];       // e.g., ['FERPA', 'Privacy Law']
    purpose?: string;           // Processing purpose
    legalBasis?: string;        // Legal basis for processing
    dataCategory?: string;      // Type of data processed
  };

  // Custom fields (application-specific)
  [key: string]: any;
}
```

### Example Log Entries

#### Authentication Success

```json
{
  "@timestamp": "2026-01-11T10:30:45.123Z",
  "level": "info",
  "message": "User successfully authenticated",
  "logger": "authentication-service",

  "event": {
    "type": "auth_success",
    "category": "authentication",
    "id": "evt_abc123",
    "action": "login",
    "outcome": "success"
  },

  "actor": {
    "id": "usr_12345",
    "type": "user",
    "role": "student",
    "email": "student@example.com"
  },

  "context": {
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "sessionId": "ses_xyz789",
    "requestId": "req_def456",
    "geolocation": {
      "country": "PH",
      "city": "Manila"
    }
  },

  "application": {
    "name": "backend-nestjs",
    "version": "1.2.3",
    "environment": "prod"
  },

  "host": {
    "name": "app-server-01"
  },

  "http": {
    "request": {
      "method": "POST",
      "path": "/api/auth/login"
    },
    "response": {
      "statusCode": 200,
      "duration": 152
    }
  },

  "security": {
    "mfaUsed": true,
    "mfaMethod": "totp",
    "newDevice": false,
    "newLocation": false,
    "riskScore": 0.1
  }
}
```

#### Data Access

```json
{
  "@timestamp": "2026-01-11T10:31:20.456Z",
  "level": "info",
  "message": "User accessed student record",
  "logger": "data-access-service",

  "event": {
    "type": "data_read",
    "category": "data_access",
    "id": "evt_ghi789",
    "action": "read",
    "outcome": "success"
  },

  "actor": {
    "id": "usr_67890",
    "type": "user",
    "role": "teacher",
    "email": "teacher@example.com"
  },

  "target": {
    "type": "student_record",
    "id": "std_11111",
    "name": "John Doe",
    "classification": "confidential"
  },

  "context": {
    "ipAddress": "192.168.1.101",
    "sessionId": "ses_abc123",
    "requestId": "req_jkl012"
  },

  "application": {
    "name": "frontend-nextjs",
    "version": "1.2.3",
    "environment": "prod"
  },

  "security": {
    "classification": "confidential",
    "sensitivity": "high"
  },

  "compliance": {
    "regulation": ["FERPA"],
    "purpose": "educational_instruction",
    "legalBasis": "legitimate_interest",
    "dataCategory": "education_records"
  },

  "data": {
    "fields": ["name", "grade_level", "current_grades"],
    "reason": "Viewing student progress for class instruction"
  }
}
```

#### Security Event

```json
{
  "@timestamp": "2026-01-11T10:32:00.789Z",
  "level": "warn",
  "message": "Multiple failed login attempts detected",
  "logger": "security-monitoring",

  "event": {
    "type": "brute_force_attempt",
    "category": "security",
    "id": "evt_sec456",
    "action": "auth_attempt",
    "outcome": "failure"
  },

  "actor": {
    "id": null,
    "type": "unknown"
  },

  "context": {
    "ipAddress": "203.0.113.42",
    "userAgent": "python-requests/2.28.0",
    "requestId": "req_mno345"
  },

  "application": {
    "name": "backend-nestjs",
    "version": "1.2.3",
    "environment": "prod"
  },

  "security": {
    "sensitivity": "high",
    "riskScore": 0.85,
    "threats": ["brute_force", "credential_stuffing"],
    "failedAttempts": 15,
    "timeWindow": "5 minutes",
    "targetAccounts": ["admin@example.com", "teacher@example.com"],
    "automated": true,
    "blocked": true
  },

  "response": {
    "action": "ip_temporary_block",
    "duration": "1 hour",
    "notified": ["security_team"],
    "incidentCreated": true,
    "incidentId": "inc_789xyz"
  }
}
```

### Log Field Standards

```typescript
// Standard field naming conventions
const fieldNamingConventions = {
  // Use camelCase for field names
  correct: 'userId',
  incorrect: 'user_id',

  // Use specific, descriptive names
  correct: 'authenticationMethod',
  incorrect: 'method',

  // Use consistent naming across all logs
  userId: 'Always userId, never user_id, uid, or user',
  ipAddress: 'Always ipAddress, never ip, ip_address',
  timestamp: 'Always @timestamp in ISO 8601 format',

  // Use standard field types
  timestamps: 'ISO 8601 string',
  durations: 'Number in milliseconds',
  sizes: 'Number in bytes',
  booleans: 'true/false, not "yes"/"no" or 1/0'
};

// Sensitive data handling
const sensitiveDataPolicy = {
  passwords: 'NEVER log passwords or password hashes',
  tokens: 'NEVER log access tokens, refresh tokens, API keys',
  ssn: 'NEVER log Social Security Numbers',
  creditCards: 'NEVER log credit card numbers',

  pii: {
    policy: 'Redact or hash PII in logs',
    methods: {
      redaction: '[REDACTED]',
      hashing: 'SHA-256 hash with salt',
      masking: 'student***@example.com, 555-***-1234'
    }
  },

  queries: {
    policy: 'Sanitize SQL queries and remove sensitive parameters',
    example: {
      bad: "SELECT * FROM students WHERE ssn = '123-45-6789'",
      good: "SELECT * FROM students WHERE ssn = '[REDACTED]'"
    }
  }
};
```

## Logging Architecture

### Centralized Logging System

```typescript
interface LoggingArchitecture {
  // Log sources
  sources: {
    frontend: {
      component: 'Next.js Application';
      logs: ['client-side errors', 'user actions', 'performance'];
      transport: 'HTTP API';
    };
    backend: {
      component: 'NestJS API';
      logs: ['API requests', 'business logic', 'errors'];
      transport: 'Direct to logging service';
    };
    database: {
      component: 'Supabase PostgreSQL';
      logs: ['Audit triggers', 'RLS violations'];
      transport: 'Database triggers';
    };
    infrastructure: {
      component: 'Servers, Load Balancers';
      logs: ['System logs', 'Access logs'];
      transport: 'Log forwarders';
    };
  };

  // Log collection
  collection: {
    method: 'Push model (applications push logs)';
    protocol: 'HTTPS';
    format: 'JSON';
    buffering: 'Local buffer with retry';
    batchSize: 100;
    flushInterval: '5 seconds';
  };

  // Log storage
  storage: {
    hotStorage: {
      duration: '30 days';
      technology: 'Elasticsearch or similar';
      indexing: 'Full-text search enabled';
      queryPerformance: 'Optimized for recent data';
    };
    warmStorage: {
      duration: '31-365 days';
      technology: 'Compressed storage';
      indexing: 'Reduced indexing';
      queryPerformance: 'Moderate';
    };
    coldStorage: {
      duration: '1-7 years';
      technology: 'Archive storage (S3 Glacier, etc.)';
      indexing: 'Minimal';
      queryPerformance: 'Slow, batch retrieval';
    };
  };

  // Log processing
  processing: {
    parsing: 'Parse JSON, extract fields';
    enrichment: 'Add geolocation, user details';
    normalization: 'Standardize formats';
    filtering: 'Remove debug logs in prod';
    aggregation: 'Calculate metrics';
  };

  // Log access
  access: {
    search: 'Full-text search interface';
    visualization: 'Dashboards and charts';
    alerting: 'Real-time alerts on patterns';
    export: 'Export for compliance/investigation';
    api: 'Programmatic access via API';
  };
}
```

### Logging Flow

```typescript
class LoggingFlow {
  /**
   * 1. Log Generation
   * Application generates log entry
   */
  async generateLog(event: LogEvent): Promise<LogEntry> {
    const logEntry: LogEntry = {
      '@timestamp': new Date().toISOString(),
      level: event.level,
      message: event.message,
      logger: event.logger,
      event: event.event,
      actor: event.actor,
      target: event.target,
      context: await this.enrichContext(event.context),
      application: this.getApplicationMetadata(),
      host: this.getHostMetadata(),
      ...event.customFields
    };

    // Sanitize sensitive data
    return this.sanitize(logEntry);
  }

  /**
   * 2. Local Buffering
   * Buffer logs locally before sending
   */
  private buffer: LogEntry[] = [];
  private readonly bufferSize = 100;
  private readonly flushInterval = 5000; // 5 seconds

  async bufferLog(logEntry: LogEntry): Promise<void> {
    this.buffer.push(logEntry);

    if (this.buffer.length >= this.bufferSize) {
      await this.flush();
    }
  }

  /**
   * 3. Batch Transmission
   * Send logs in batches
   */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const batch = [...this.buffer];
    this.buffer = [];

    try {
      await this.sendToLoggingService(batch);
    } catch (error) {
      // On failure, write to local disk for retry
      await this.writeToFailoverStorage(batch);
    }
  }

  /**
   * 4. Centralized Collection
   * Logging service receives logs
   */
  async sendToLoggingService(logs: LogEntry[]): Promise<void> {
    await fetch(process.env.LOGGING_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LOGGING_API_KEY}`
      },
      body: JSON.stringify({ logs })
    });
  }

  /**
   * 5. Processing Pipeline
   * Enrich, parse, normalize logs
   */
  async processLogs(logs: LogEntry[]): Promise<ProcessedLogEntry[]> {
    return await Promise.all(
      logs.map(async log => {
        // Parse JSON structure
        const parsed = this.parseStructure(log);

        // Enrich with additional data
        const enriched = await this.enrich(parsed);

        // Normalize to standard schema
        const normalized = this.normalize(enriched);

        // Extract metrics
        await this.extractMetrics(normalized);

        return normalized;
      })
    );
  }

  /**
   * 6. Storage
   * Store in appropriate tier based on age
   */
  async store(logs: ProcessedLogEntry[]): Promise<void> {
    // Index in hot storage (e.g., Elasticsearch)
    await this.hotStorage.index(logs);

    // Store raw in warm storage
    await this.warmStorage.write(logs);
  }

  /**
   * 7. Alerting
   * Check for alert conditions
   */
  async checkAlerts(log: ProcessedLogEntry): Promise<void> {
    const alerts = await this.alertRuleEngine.evaluate(log);

    for (const alert of alerts) {
      await this.notificationService.send(alert);
      await this.incidentManagement.createIncident(alert);
    }
  }
}
```

## Application Logging

### Next.js Frontend Logging

```typescript
// frontend-nextjs/lib/logger.ts

import pino from 'pino';

// Create logger instance
const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  browser: {
    asObject: true,
    write: {
      // Send logs to backend API
      info: (o: any) => {
        sendLogToBackend('info', o);
      },
      warn: (o: any) => {
        sendLogToBackend('warn', o);
      },
      error: (o: any) => {
        sendLogToBackend('error', o);
      }
    }
  },
  formatters: {
    level: (label: string) => {
      return { level: label };
    }
  }
});

async function sendLogToBackend(level: string, logObject: any): Promise<void> {
  // Only send important logs from client (warn and error)
  if (level === 'info' && process.env.NODE_ENV === 'production') {
    return;
  }

  try {
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level,
        ...logObject,
        '@timestamp': new Date().toISOString(),
        application: {
          name: 'frontend-nextjs',
          version: process.env.NEXT_PUBLIC_APP_VERSION,
          environment: process.env.NODE_ENV
        },
        context: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          referrer: document.referrer
        }
      })
    });
  } catch (error) {
    // Fallback to console if logging fails
    console.error('Failed to send log to backend:', error);
  }
}

// Structured logging helpers
export const log = {
  auth: {
    loginAttempt: (email: string) => {
      logger.info({
        event: { type: 'auth_attempt', category: 'authentication', action: 'login' },
        actor: { email }
      }, 'Login attempt');
    },

    loginSuccess: (userId: string, email: string) => {
      logger.info({
        event: { type: 'auth_success', category: 'authentication', action: 'login', outcome: 'success' },
        actor: { id: userId, email }
      }, 'Login successful');
    },

    loginFailure: (email: string, reason: string) => {
      logger.warn({
        event: { type: 'auth_failure', category: 'authentication', action: 'login', outcome: 'failure' },
        actor: { email },
        error: { message: reason }
      }, 'Login failed');
    },

    logout: (userId: string) => {
      logger.info({
        event: { type: 'logout', category: 'authentication', action: 'logout', outcome: 'success' },
        actor: { id: userId }
      }, 'User logged out');
    }
  },

  dataAccess: {
    read: (userId: string, resourceType: string, resourceId: string) => {
      logger.info({
        event: { type: 'data_read', category: 'data_access', action: 'read', outcome: 'success' },
        actor: { id: userId },
        target: { type: resourceType, id: resourceId }
      }, `User accessed ${resourceType}`);
    },

    create: (userId: string, resourceType: string, resourceId: string) => {
      logger.info({
        event: { type: 'data_create', category: 'data_access', action: 'create', outcome: 'success' },
        actor: { id: userId },
        target: { type: resourceType, id: resourceId }
      }, `User created ${resourceType}`);
    },

    update: (userId: string, resourceType: string, resourceId: string, changes: any) => {
      logger.info({
        event: { type: 'data_update', category: 'data_access', action: 'update', outcome: 'success' },
        actor: { id: userId },
        target: { type: resourceType, id: resourceId },
        changes: changes
      }, `User updated ${resourceType}`);
    },

    delete: (userId: string, resourceType: string, resourceId: string) => {
      logger.warn({
        event: { type: 'data_delete', category: 'data_access', action: 'delete', outcome: 'success' },
        actor: { id: userId },
        target: { type: resourceType, id: resourceId }
      }, `User deleted ${resourceType}`);
    }
  },

  security: {
    suspiciousActivity: (description: string, severity: string, indicators: any) => {
      logger.warn({
        event: { type: 'suspicious_activity', category: 'security' },
        security: { severity, indicators },
        message: description
      }, 'Suspicious activity detected');
    },

    accessDenied: (userId: string, resourceType: string, resourceId: string, reason: string) => {
      logger.warn({
        event: { type: 'access_denied', category: 'authorization', action: 'read', outcome: 'failure' },
        actor: { id: userId },
        target: { type: resourceType, id: resourceId },
        error: { message: reason }
      }, 'Access denied');
    }
  },

  error: {
    application: (error: Error, context?: any) => {
      logger.error({
        event: { type: 'application_error', category: 'error' },
        error: {
          type: error.name,
          message: error.message,
          stack: error.stack
        },
        context
      }, 'Application error occurred');
    },

    api: (endpoint: string, status: number, error: any) => {
      logger.error({
        event: { type: 'api_error', category: 'error' },
        http: {
          request: { path: endpoint },
          response: { statusCode: status }
        },
        error: { message: error.message }
      }, 'API request failed');
    }
  },

  performance: {
    pageLoad: (pageName: string, duration: number) => {
      logger.info({
        event: { type: 'page_load', category: 'performance' },
        performance: { pageName, duration }
      }, `Page loaded: ${pageName}`);
    },

    slowOperation: (operation: string, duration: number, threshold: number) => {
      logger.warn({
        event: { type: 'slow_operation', category: 'performance' },
        performance: { operation, duration, threshold }
      }, `Slow operation detected: ${operation}`);
    }
  }
};

export default logger;
```

### Next.js API Route Logging

```typescript
// frontend-nextjs/app/api/logs/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { validateLogEntry } from '@/lib/validation';
import { forwardToLoggingService } from '@/lib/logging-service';

export async function POST(request: NextRequest) {
  try {
    const logEntry = await request.json();

    // Validate log entry structure
    const validationResult = validateLogEntry(logEntry);
    if (!validationResult.valid) {
      return NextResponse.json(
        { error: 'Invalid log entry', details: validationResult.errors },
        { status: 400 }
      );
    }

    // Enrich with server-side data
    const enrichedLog = {
      ...logEntry,
      context: {
        ...logEntry.context,
        ipAddress: request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown',
        requestId: crypto.randomUUID()
      },
      host: {
        name: process.env.HOSTNAME || 'unknown'
      }
    };

    // Forward to centralized logging service
    await forwardToLoggingService(enrichedLog);

    return NextResponse.json({ status: 'logged' });
  } catch (error) {
    console.error('Failed to process log:', error);
    return NextResponse.json(
      { error: 'Failed to process log' },
      { status: 500 }
    );
  }
}
```

### NestJS Backend Logging

```typescript
// backend-nestjs/src/common/logger/app-logger.service.ts

import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: {
        application: {
          name: 'backend-nestjs',
          version: process.env.APP_VERSION,
          environment: process.env.NODE_ENV
        },
        host: {
          name: process.env.HOSTNAME
        }
      },
      transports: [
        // Console output for local development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        // File output
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error'
        }),
        new winston.transports.File({
          filename: 'logs/combined.log'
        }),
        // Send to centralized logging service
        new winston.transports.Http({
          host: process.env.LOGGING_SERVICE_HOST,
          port: parseInt(process.env.LOGGING_SERVICE_PORT),
          path: '/logs',
          ssl: true,
          auth: {
            bearer: process.env.LOGGING_API_KEY
          }
        })
      ]
    });
  }

  log(message: string, context?: any) {
    this.logger.info(message, context);
  }

  error(message: string, trace?: string, context?: any) {
    this.logger.error(message, { trace, ...context });
  }

  warn(message: string, context?: any) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: any) {
    this.logger.debug(message, context);
  }

  verbose(message: string, context?: any) {
    this.logger.verbose(message, context);
  }

  // Structured logging methods
  logAuthEvent(event: AuthEvent) {
    this.logger.info('Authentication event', {
      event: {
        type: event.type,
        category: 'authentication',
        action: event.action,
        outcome: event.outcome
      },
      actor: event.actor,
      context: event.context,
      security: event.security
    });
  }

  logDataAccess(access: DataAccessEvent) {
    this.logger.info('Data access event', {
      event: {
        type: 'data_access',
        category: 'data_access',
        action: access.action,
        outcome: 'success'
      },
      actor: access.actor,
      target: access.target,
      context: access.context,
      compliance: access.compliance
    });
  }

  logSecurityEvent(securityEvent: SecurityEvent) {
    this.logger.warn('Security event', {
      event: {
        type: 'security_event',
        category: 'security'
      },
      security: securityEvent,
      context: securityEvent.context
    });
  }
}
```

### NestJS Logging Interceptor

```typescript
// backend-nestjs/src/common/interceptors/logging.interceptor.ts

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppLoggerService } from '../logger/app-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const requestId = headers['x-request-id'] || crypto.randomUUID();

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const duration = Date.now() - startTime;

          this.logger.log('HTTP Request', {
            event: {
              type: 'http_request',
              category: 'http',
              action: method.toLowerCase(),
              outcome: 'success'
            },
            actor: user ? {
              id: user.id,
              type: 'user',
              role: user.role
            } : undefined,
            http: {
              request: {
                method,
                path: url,
                query: request.query,
                headers: this.sanitizeHeaders(headers),
                body: this.sanitizeBody(body)
              },
              response: {
                statusCode,
                duration
              }
            },
            context: {
              ipAddress: ip,
              userAgent,
              requestId
            }
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.logger.error('HTTP Request Error', error.stack, {
            event: {
              type: 'http_request',
              category: 'http',
              action: method.toLowerCase(),
              outcome: 'failure'
            },
            actor: user ? {
              id: user.id,
              type: 'user',
              role: user.role
            } : undefined,
            http: {
              request: {
                method,
                path: url,
                query: request.query
              },
              response: {
                statusCode: error.status || 500,
                duration
              }
            },
            error: {
              type: error.name,
              message: error.message,
              code: error.code
            },
            context: {
              ipAddress: ip,
              userAgent,
              requestId
            }
          });
        }
      })
    );
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    // Remove sensitive headers
    delete sanitized['authorization'];
    delete sanitized['cookie'];
    delete sanitized['x-api-key'];
    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body) return undefined;

    const sanitized = { ...body };
    // Remove sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.ssn;
    delete sanitized.creditCard;

    return sanitized;
  }
}
```

## Database Audit Logs

### Supabase Audit Triggers

```sql
-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Event information
  event_type TEXT NOT NULL, -- 'create', 'update', 'delete'
  table_name TEXT NOT NULL,
  record_id TEXT,

  -- Actor information
  user_id UUID,
  user_role TEXT,

  -- Changes
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],

  -- Context
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,

  -- Classification
  data_classification TEXT,

  -- Compliance
  compliance_tags TEXT[]
);

-- Index for performance
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins and auditors can read audit logs
CREATE POLICY audit_logs_read_policy ON audit_logs
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'auditor', 'superadmin')
  );

-- Policy: Prevent modification of audit logs
CREATE POLICY audit_logs_immutable ON audit_logs
  FOR UPDATE
  USING (false);

CREATE POLICY audit_logs_no_delete ON audit_logs
  FOR DELETE
  USING (false);

-- Generic audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  user_id UUID;
  user_role TEXT;
  ip_address INET;
  user_agent TEXT;
  changed_fields TEXT[];
  classification TEXT;
BEGIN
  -- Get current user information from JWT
  user_id := COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );

  user_role := current_setting('request.jwt.claims', true)::json->>'role';

  -- Get context from custom settings
  ip_address := current_setting('request.headers', true)::json->>'x-real-ip';
  user_agent := current_setting('request.headers', true)::json->>'user-agent';

  -- Determine data classification based on table
  classification := CASE TG_TABLE_NAME
    WHEN 'students' THEN 'confidential'
    WHEN 'health_records' THEN 'restricted'
    WHEN 'grades' THEN 'confidential'
    ELSE 'internal'
  END;

  -- Determine changed fields
  IF TG_OP = 'UPDATE' THEN
    SELECT ARRAY_AGG(key)
    INTO changed_fields
    FROM jsonb_each(to_jsonb(NEW))
    WHERE to_jsonb(NEW)->>key IS DISTINCT FROM to_jsonb(OLD)->>key;
  END IF;

  -- Insert audit log
  INSERT INTO audit_logs (
    event_type,
    table_name,
    record_id,
    user_id,
    user_role,
    old_values,
    new_values,
    changed_fields,
    ip_address,
    user_agent,
    data_classification,
    compliance_tags
  ) VALUES (
    LOWER(TG_OP),
    TG_TABLE_NAME,
    COALESCE(NEW.id::TEXT, OLD.id::TEXT),
    user_id,
    user_role,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    changed_fields,
    ip_address::INET,
    user_agent,
    classification,
    ARRAY['FERPA', 'privacy']
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER audit_students_trigger
  AFTER INSERT OR UPDATE OR DELETE ON students
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_grades_trigger
  AFTER INSERT OR UPDATE OR DELETE ON grades
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_health_records_trigger
  AFTER INSERT OR UPDATE OR DELETE ON health_records
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Function to query audit logs with filters
CREATE OR REPLACE FUNCTION get_audit_logs(
  p_user_id UUID DEFAULT NULL,
  p_table_name TEXT DEFAULT NULL,
  p_record_id TEXT DEFAULT NULL,
  p_event_type TEXT DEFAULT NULL,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  timestamp TIMESTAMPTZ,
  event_type TEXT,
  table_name TEXT,
  record_id TEXT,
  user_id UUID,
  user_role TEXT,
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  ip_address INET,
  data_classification TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.timestamp,
    a.event_type,
    a.table_name,
    a.record_id,
    a.user_id,
    a.user_role,
    a.old_values,
    a.new_values,
    a.changed_fields,
    a.ip_address,
    a.data_classification
  FROM audit_logs a
  WHERE
    (p_user_id IS NULL OR a.user_id = p_user_id) AND
    (p_table_name IS NULL OR a.table_name = p_table_name) AND
    (p_record_id IS NULL OR a.record_id = p_record_id) AND
    (p_event_type IS NULL OR a.event_type = p_event_type) AND
    (p_start_date IS NULL OR a.timestamp >= p_start_date) AND
    (p_end_date IS NULL OR a.timestamp <= p_end_date)
  ORDER BY a.timestamp DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Application-Level Audit Logging

```typescript
// backend-nestjs/src/common/services/audit.service.ts

import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

interface AuditLogEntry {
  eventType: 'create' | 'read' | 'update' | 'delete' | 'export';
  tableName: string;
  recordId?: string;
  userId: string;
  userRole: string;
  oldValues?: any;
  newValues?: any;
  changedFields?: string[];
  ipAddress?: string;
  userAgent?: string;
  purpose?: string;
  legalBasis?: string;
  dataClassification?: string;
  complianceTags?: string[];
}

@Injectable()
export class AuditService {
  constructor(private readonly supabase: SupabaseClient) {}

  async logDataAccess(entry: AuditLogEntry): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('audit_logs')
        .insert({
          timestamp: new Date().toISOString(),
          event_type: entry.eventType,
          table_name: entry.tableName,
          record_id: entry.recordId,
          user_id: entry.userId,
          user_role: entry.userRole,
          old_values: entry.oldValues,
          new_values: entry.newValues,
          changed_fields: entry.changedFields,
          ip_address: entry.ipAddress,
          user_agent: entry.userAgent,
          data_classification: entry.dataClassification,
          compliance_tags: entry.complianceTags,
          metadata: {
            purpose: entry.purpose,
            legal_basis: entry.legalBasis
          }
        });

      if (error) {
        console.error('Failed to write audit log:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
      // Never let audit logging failure break the main operation
    }
  }

  async getAuditTrail(
    filters: {
      userId?: string;
      tableName?: string;
      recordId?: string;
      eventType?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<any[]> {
    const { data, error } = await this.supabase.rpc('get_audit_logs', {
      p_user_id: filters.userId,
      p_table_name: filters.tableName,
      p_record_id: filters.recordId,
      p_event_type: filters.eventType,
      p_start_date: filters.startDate?.toISOString(),
      p_end_date: filters.endDate?.toISOString(),
      p_limit: filters.limit || 100,
      p_offset: filters.offset || 0
    });

    if (error) {
      throw new Error(`Failed to retrieve audit logs: ${error.message}`);
    }

    return data;
  }

  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    complianceTag: string
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .contains('compliance_tags', [complianceTag])
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      throw new Error(`Failed to generate compliance report: ${error.message}`);
    }

    return {
      reportPeriod: { start: startDate, end: endDate },
      complianceTag,
      totalEvents: data.length,
      eventsByType: this.groupByEventType(data),
      eventsByTable: this.groupByTable(data),
      eventsByUser: this.groupByUser(data),
      events: data
    };
  }

  private groupByEventType(logs: any[]): Record<string, number> {
    return logs.reduce((acc, log) => {
      acc[log.event_type] = (acc[log.event_type] || 0) + 1;
      return acc;
    }, {});
  }

  private groupByTable(logs: any[]): Record<string, number> {
    return logs.reduce((acc, log) => {
      acc[log.table_name] = (acc[log.table_name] || 0) + 1;
      return acc;
    }, {});
  }

  private groupByUser(logs: any[]): Record<string, number> {
    return logs.reduce((acc, log) => {
      acc[log.user_id] = (acc[log.user_id] || 0) + 1;
      return acc;
    }, {});
  }
}
```

## Security Event Logging

### Security Monitoring Service

```typescript
// backend-nestjs/src/security/security-monitoring.service.ts

import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '../common/logger/app-logger.service';

interface SecurityEvent {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  description: string;
  indicators: any;
  userId?: string;
  ipAddress?: string;
  automated: boolean;
  response?: any;
}

@Injectable()
export class SecurityMonitoringService {
  private failedLoginAttempts: Map<string, number> = new Map();
  private suspiciousIPs: Set<string> = new Set();

  constructor(private readonly logger: AppLoggerService) {}

  trackLoginAttempt(email: string, ipAddress: string, success: boolean): void {
    if (success) {
      // Clear failed attempts on successful login
      this.failedLoginAttempts.delete(email);
      return;
    }

    // Track failed attempt
    const attempts = (this.failedLoginAttempts.get(email) || 0) + 1;
    this.failedLoginAttempts.set(email, attempts);

    // Check for brute force
    if (attempts >= 5) {
      this.logSecurityEvent({
        type: 'brute_force_attempt',
        severity: 'warning',
        description: `Multiple failed login attempts for ${email}`,
        indicators: {
          email,
          ipAddress,
          attempts,
          timeWindow: '5 minutes'
        },
        ipAddress,
        automated: true,
        response: {
          action: 'temporary_block',
          duration: '1 hour'
        }
      });

      // Add to suspicious IPs
      this.suspiciousIPs.add(ipAddress);
    }
  }

  async detectAnomalousDataAccess(
    userId: string,
    resourceType: string,
    count: number,
    timeWindow: string
  ): Promise<void> {
    // Anomaly detection logic
    const threshold = this.getThresholdForResource(resourceType);

    if (count > threshold) {
      this.logSecurityEvent({
        type: 'anomalous_data_access',
        severity: 'warning',
        description: `Unusual data access pattern detected`,
        indicators: {
          userId,
          resourceType,
          count,
          timeWindow,
          threshold
        },
        userId,
        automated: true
      });
    }
  }

  async detectSQLInjection(query: string, ipAddress: string): Promise<boolean> {
    const sqlInjectionPatterns = [
      /(\bUNION\b.*\bSELECT\b)/i,
      /(\bOR\b.*=.*)/i,
      /(;.*DROP\s+TABLE)/i,
      /(--)/,
      /('.*OR.*'.*=.*')/i
    ];

    const detected = sqlInjectionPatterns.some(pattern => pattern.test(query));

    if (detected) {
      this.logSecurityEvent({
        type: 'sql_injection_attempt',
        severity: 'critical',
        description: 'SQL injection attempt detected',
        indicators: {
          query: this.sanitizeQuery(query),
          ipAddress,
          patterns: 'redacted'
        },
        ipAddress,
        automated: true,
        response: {
          action: 'blocked',
          ipBanned: true
        }
      });
    }

    return detected;
  }

  async detectXSS(input: string, ipAddress: string): Promise<boolean> {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=\s*["'][^"']*["']/gi,
      /<iframe/gi
    ];

    const detected = xssPatterns.some(pattern => pattern.test(input));

    if (detected) {
      this.logSecurityEvent({
        type: 'xss_attempt',
        severity: 'critical',
        description: 'XSS attempt detected',
        indicators: {
          input: input.substring(0, 100), // Limited sample
          ipAddress
        },
        ipAddress,
        automated: true,
        response: {
          action: 'blocked'
        }
      });
    }

    return detected;
  }

  private logSecurityEvent(event: SecurityEvent): void {
    this.logger.logSecurityEvent(event);

    // If critical, trigger immediate alert
    if (event.severity === 'critical') {
      this.triggerSecurityAlert(event);
    }
  }

  private async triggerSecurityAlert(event: SecurityEvent): Promise<void> {
    // Send alert to security team
    // Implementation depends on alerting system (email, Slack, PagerDuty, etc.)
    console.error('SECURITY ALERT:', event);
  }

  private getThresholdForResource(resourceType: string): number {
    const thresholds: Record<string, number> = {
      student_record: 50,
      grade: 100,
      health_record: 10,
      financial_record: 20
    };

    return thresholds[resourceType] || 100;
  }

  private sanitizeQuery(query: string): string {
    // Remove sensitive data from query for logging
    return query.replace(/('.*?')|(\d+)/g, '[REDACTED]');
  }
}
```

## User Activity Tracking

### Activity Tracking Service

```typescript
// backend-nestjs/src/activity/activity-tracking.service.ts

import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

interface UserActivity {
  userId: string;
  activityType: string;
  activityCategory: string;
  details: any;
  timestamp: Date;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class ActivityTrackingService {
  constructor(private readonly supabase: SupabaseClient) {}

  async trackActivity(activity: UserActivity): Promise<void> {
    await this.supabase.from('user_activities').insert({
      user_id: activity.userId,
      activity_type: activity.activityType,
      activity_category: activity.activityCategory,
      details: activity.details,
      timestamp: activity.timestamp.toISOString(),
      session_id: activity.sessionId,
      ip_address: activity.ipAddress,
      user_agent: activity.userAgent
    });
  }

  async getUserActivitySummary(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const { data, error } = await this.supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return {
      userId,
      period: { start: startDate, end: endDate },
      totalActivities: data.length,
      activitiesByCategory: this.groupByCategory(data),
      activitiesByType: this.groupByType(data),
      activities: data
    };
  }

  private groupByCategory(activities: any[]): Record<string, number> {
    return activities.reduce((acc, activity) => {
      acc[activity.activity_category] = (acc[activity.activity_category] || 0) + 1;
      return acc;
    }, {});
  }

  private groupByType(activities: any[]): Record<string, number> {
    return activities.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
      return acc;
    }, {});
  }
}
```

## Compliance Audit Trails

### FERPA Compliance Logging

```typescript
// backend-nextjs/src/compliance/ferpa-audit.service.ts

import { Injectable } from '@nestjs/common';
import { AuditService } from '../common/services/audit.service';

interface FERPAAccessLog {
  studentId: string;
  accessedBy: string;
  accessorRole: string;
  recordType: 'transcript' | 'grades' | 'attendance' | 'discipline' | 'health';
  purpose: string;
  legalBasis: 'consent' | 'school_official' | 'legitimate_interest' | 'legal_requirement';
  timestamp: Date;
  ipAddress: string;
}

@Injectable()
export class FERPAuditService {
  constructor(private readonly auditService: AuditService) {}

  async logEducationRecordAccess(access: FERPAAccessLog): Promise<void> {
    await this.auditService.logDataAccess({
      eventType: 'read',
      tableName: 'education_records',
      recordId: access.studentId,
      userId: access.accessedBy,
      userRole: access.accessorRole,
      ipAddress: access.ipAddress,
      purpose: access.purpose,
      legalBasis: access.legalBasis,
      dataClassification: 'confidential',
      complianceTags: ['FERPA', 'education_records']
    });
  }

  async generateFERPAComplianceReport(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const report = await this.auditService.generateComplianceReport(
      startDate,
      endDate,
      'FERPA'
    );

    return {
      ...report,
      summary: {
        totalAccess: report.totalEvents,
        accessByRole: this.analyzeAccessByRole(report.events),
        accessByPurpose: this.analyzeAccessByPurpose(report.events),
        unauthorizedAttempts: this.countUnauthorizedAttempts(report.events),
        studentsAffected: this.countAffectedStudents(report.events)
      }
    };
  }

  private analyzeAccessByRole(events: any[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.user_role] = (acc[event.user_role] || 0) + 1;
      return acc;
    }, {});
  }

  private analyzeAccessByPurpose(events: any[]): Record<string, number> {
    return events.reduce((acc, event) => {
      const purpose = event.metadata?.purpose || 'unknown';
      acc[purpose] = (acc[purpose] || 0) + 1;
      return acc;
    }, {});
  }

  private countUnauthorizedAttempts(events: any[]): number {
    // Count events where access was denied
    return events.filter(event =>
      event.event_type === 'access_denied' ||
      event.metadata?.outcome === 'failure'
    ).length;
  }

  private countAffectedStudents(events: any[]): number {
    const uniqueStudents = new Set(
      events.map(event => event.record_id)
    );
    return uniqueStudents.size;
  }
}
```

## Log Retention Policies

### Retention Configuration

```typescript
interface LogRetentionPolicy {
  logCategory: string;
  hotRetention: string;      // Fast access period
  warmRetention: string;     // Moderate access period
  coldRetention: string;     // Archive period
  totalRetention: string;    // Total retention before deletion
  legalRequirement?: string;
  complianceReason?: string;
}

const logRetentionPolicies: LogRetentionPolicy[] = [
  {
    logCategory: 'security_events',
    hotRetention: '90 days',
    warmRetention: '1 year',
    coldRetention: '6 years',
    totalRetention: '7 years',
    legalRequirement: 'SOX, PCI-DSS',
    complianceReason: 'Security incident investigation'
  },
  {
    logCategory: 'audit_logs',
    hotRetention: '90 days',
    warmRetention: '1 year',
    coldRetention: '6 years',
    totalRetention: '7 years',
    legalRequirement: 'FERPA, State regulations',
    complianceReason: 'Compliance audits and legal requirements'
  },
  {
    logCategory: 'authentication_logs',
    hotRetention: '90 days',
    warmRetention: '1 year',
    coldRetention: '1 year',
    totalRetention: '2 years',
    complianceReason: 'Security monitoring and incident response'
  },
  {
    logCategory: 'application_logs',
    hotRetention: '30 days',
    warmRetention: '3 months',
    coldRetention: '9 months',
    totalRetention: '1 year',
    complianceReason: 'Troubleshooting and performance optimization'
  },
  {
    logCategory: 'performance_logs',
    hotRetention: '30 days',
    warmRetention: '60 days',
    coldRetention: 'none',
    totalRetention: '90 days',
    complianceReason: 'System optimization'
  }
];
```

## Log Analysis and Monitoring

### Log Analysis Tools

```typescript
// Log analysis and search interface
interface LogSearchQuery {
  query: string;              // Lucene-style query
  startTime?: Date;
  endTime?: Date;
  logLevel?: string[];
  eventType?: string[];
  userId?: string;
  ipAddress?: string;
  limit?: number;
  offset?: number;
}

class LogAnalysisService {
  async search(query: LogSearchQuery): Promise<LogSearchResult> {
    // Example: Elasticsearch query
    const results = await this.elasticsearch.search({
      index: 'logs-*',
      body: {
        query: {
          bool: {
            must: [
              {
                query_string: {
                  query: query.query
                }
              }
            ],
            filter: [
              query.startTime && {
                range: {
                  '@timestamp': {
                    gte: query.startTime.toISOString(),
                    lte: query.endTime?.toISOString()
                  }
                }
              },
              query.logLevel && {
                terms: {
                  level: query.logLevel
                }
              },
              query.eventType && {
                terms: {
                  'event.type': query.eventType
                }
              },
              query.userId && {
                term: {
                  'actor.id': query.userId
                }
              },
              query.ipAddress && {
                term: {
                  'context.ipAddress': query.ipAddress
                }
              }
            ].filter(Boolean)
          }
        },
        sort: [
          { '@timestamp': { order: 'desc' } }
        ],
        size: query.limit || 100,
        from: query.offset || 0
      }
    });

    return {
      total: results.hits.total.value,
      logs: results.hits.hits.map(hit => hit._source),
      aggregations: results.aggregations
    };
  }

  async detectAnomalies(timeWindow: string): Promise<Anomaly[]> {
    // Use statistical analysis to detect anomalies
    // E.g., sudden spike in failed logins, unusual data access patterns

    const anomalies: Anomaly[] = [];

    // Example: Detect spike in failed logins
    const failedLogins = await this.countEventsByType(
      'auth_failure',
      timeWindow
    );

    const baseline = await this.getBaseline('auth_failure', timeWindow);

    if (failedLogins > baseline * 3) {
      anomalies.push({
        type: 'failed_login_spike',
        severity: 'high',
        description: `Failed login attempts ${failedLogins} exceed baseline ${baseline} by 3x`,
        timeWindow,
        recommendations: [
          'Review recent login attempts',
          'Check for brute force attacks',
          'Verify IP addresses'
        ]
      });
    }

    return anomalies;
  }
}
```

## Log Security and Integrity

### Tamper-Evident Logging

```typescript
// Implement cryptographic log integrity
class TamperEvidentLogger {
  private previousHash: string = '0'.repeat(64);

  async logWithIntegrity(logEntry: LogEntry): Promise<void> {
    // Add integrity fields
    const entryWithIntegrity = {
      ...logEntry,
      previousHash: this.previousHash,
      sequenceNumber: await this.getNextSequenceNumber(),
      timestamp: new Date().toISOString()
    };

    // Calculate hash
    const hash = await this.calculateHash(entryWithIntegrity);
    entryWithIntegrity.hash = hash;

    // Store log
    await this.storeLog(entryWithIntegrity);

    // Update previous hash for next entry
    this.previousHash = hash;
  }

  private async calculateHash(entry: any): Promise<string> {
    const canonical = JSON.stringify(entry, Object.keys(entry).sort());
    const encoder = new TextEncoder();
    const data = encoder.encode(canonical);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async verifyLogIntegrity(logEntries: LogEntry[]): Promise<VerificationResult> {
    let valid = true;
    let previousHash = '0'.repeat(64);

    for (const entry of logEntries) {
      // Verify previous hash matches
      if (entry.previousHash !== previousHash) {
        valid = false;
        break;
      }

      // Verify entry hash
      const entryWithoutHash = { ...entry };
      delete entryWithoutHash.hash;
      const calculatedHash = await this.calculateHash(entryWithoutHash);

      if (calculatedHash !== entry.hash) {
        valid = false;
        break;
      }

      previousHash = entry.hash;
    }

    return {
      valid,
      entriesVerified: logEntries.length,
      firstInvalidEntry: valid ? null : logEntries.findIndex(/* ... */)
    };
  }
}
```

## Forensic Investigation

### Log-Based Investigation

```typescript
class ForensicInvestigationService {
  async investigateSecurityIncident(
    incidentId: string,
    timeWindow: { start: Date; end: Date }
  ): Promise<InvestigationReport> {
    // 1. Collect all relevant logs
    const logs = await this.collectIncidentLogs(incidentId, timeWindow);

    // 2. Build timeline
    const timeline = this.buildTimeline(logs);

    // 3. Identify actors
    const actors = this.identifyActors(logs);

    // 4. Trace data flow
    const dataFlow = await this.traceDataFlow(logs);

    // 5. Identify indicators of compromise
    const iocs = this.identifyIOCs(logs);

    // 6. Assess impact
    const impact = await this.assessImpact(logs);

    return {
      incidentId,
      timeWindow,
      timeline,
      actors,
      dataFlow,
      indicatorsOfCompromise: iocs,
      impact,
      recommendations: this.generateRecommendations(logs, iocs, impact)
    };
  }

  private buildTimeline(logs: LogEntry[]): Timeline {
    return logs
      .sort((a, b) => new Date(a['@timestamp']).getTime() - new Date(b['@timestamp']).getTime())
      .map(log => ({
        timestamp: log['@timestamp'],
        event: log.event.type,
        actor: log.actor?.id,
        description: log.message,
        significance: this.assessEventSignificance(log)
      }));
  }

  private identifyActors(logs: LogEntry[]): Actor[] {
    const actorMap = new Map<string, Actor>();

    for (const log of logs) {
      if (log.actor) {
        if (!actorMap.has(log.actor.id)) {
          actorMap.set(log.actor.id, {
            id: log.actor.id,
            type: log.actor.type,
            role: log.actor.role,
            actions: [],
            ipAddresses: new Set(),
            firstSeen: log['@timestamp'],
            lastSeen: log['@timestamp']
          });
        }

        const actor = actorMap.get(log.actor.id)!;
        actor.actions.push({
          timestamp: log['@timestamp'],
          type: log.event.type,
          target: log.target
        });

        if (log.context?.ipAddress) {
          actor.ipAddresses.add(log.context.ipAddress);
        }

        actor.lastSeen = log['@timestamp'];
      }
    }

    return Array.from(actorMap.values());
  }

  private async traceDataFlow(logs: LogEntry[]): Promise<DataFlow> {
    // Trace how data moved through the system
    const dataAccessLogs = logs.filter(log =>
      log.event.category === 'data_access'
    );

    const flow: DataFlow = {
      sources: new Set(),
      destinations: new Set(),
      transformations: [],
      exfiltration: []
    };

    for (const log of dataAccessLogs) {
      if (log.event.action === 'read') {
        flow.sources.add(log.target?.id);
      }

      if (log.event.action === 'export' || log.event.action === 'download') {
        flow.exfiltration.push({
          timestamp: log['@timestamp'],
          actor: log.actor?.id,
          data: log.target,
          destination: log.context?.ipAddress
        });
      }
    }

    return flow;
  }
}
```

## Monitoring and Alerting

### Real-Time Alerting

```typescript
interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: AlertCondition;
  severity: 'info' | 'warning' | 'critical';
  notification: NotificationConfig;
  enabled: boolean;
}

interface AlertCondition {
  logQuery: string;
  threshold?: number;
  timeWindow?: string;
  aggregation?: 'count' | 'sum' | 'avg' | 'max' | 'min';
  field?: string;
}

const alertRules: AlertRule[] = [
  {
    id: 'failed-login-spike',
    name: 'Failed Login Spike',
    description: 'Detect sudden increase in failed login attempts',
    condition: {
      logQuery: 'event.type:auth_failure',
      threshold: 10,
      timeWindow: '5m',
      aggregation: 'count'
    },
    severity: 'warning',
    notification: {
      channels: ['email', 'slack'],
      recipients: ['security-team@school.edu']
    },
    enabled: true
  },

  {
    id: 'unauthorized-data-access',
    name: 'Unauthorized Data Access Attempt',
    description: 'Access denied to sensitive data',
    condition: {
      logQuery: 'event.type:access_denied AND security.classification:restricted'
    },
    severity: 'critical',
    notification: {
      channels: ['email', 'slack', 'pagerduty'],
      recipients: ['security-team@school.edu', 'dpo@school.edu']
    },
    enabled: true
  },

  {
    id: 'bulk-data-export',
    name: 'Large Data Export',
    description: 'User exported large amount of data',
    condition: {
      logQuery: 'event.action:export',
      threshold: 1000,
      timeWindow: '1h',
      aggregation: 'sum',
      field: 'data.recordCount'
    },
    severity: 'warning',
    notification: {
      channels: ['email'],
      recipients: ['compliance-team@school.edu']
    },
    enabled: true
  },

  {
    id: 'admin-action-suspicious',
    name: 'Suspicious Administrative Action',
    description: 'Administrative action outside business hours',
    condition: {
      logQuery: 'actor.role:admin AND event.category:admin_action',
      // Additional logic to check time of day
    },
    severity: 'warning',
    notification: {
      channels: ['email', 'slack'],
      recipients: ['it-management@school.edu']
    },
    enabled: true
  }
];
```

## Compliance Reporting

### Automated Compliance Reports

```typescript
class ComplianceReportingService {
  async generateMonthlyComplianceReport(
    month: Date
  ): Promise<ComplianceReport> {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // Collect metrics
    const [
      authMetrics,
      dataAccessMetrics,
      securityMetrics,
      incidentMetrics
    ] = await Promise.all([
      this.getAuthenticationMetrics(startDate, endDate),
      this.getDataAccessMetrics(startDate, endDate),
      this.getSecurityMetrics(startDate, endDate),
      this.getIncidentMetrics(startDate, endDate)
    ]);

    return {
      period: { start: startDate, end: endDate },

      executiveSummary: {
        totalUsers: authMetrics.uniqueUsers,
        totalLogins: authMetrics.successfulLogins,
        failedLoginRate: authMetrics.failureRate,
        securityIncidents: incidentMetrics.totalIncidents,
        criticalIncidents: incidentMetrics.criticalIncidents,
        complianceViolations: 0, // From compliance checks
        overallRiskScore: this.calculateRiskScore(securityMetrics, incidentMetrics)
      },

      authentication: {
        successfulLogins: authMetrics.successfulLogins,
        failedLogins: authMetrics.failedLogins,
        failureRate: authMetrics.failureRate,
        mfaAdoption: authMetrics.mfaAdoption,
        accountLockouts: authMetrics.accountLockouts
      },

      dataAccess: {
        totalAccess: dataAccessMetrics.totalAccess,
        accessByRole: dataAccessMetrics.byRole,
        accessByClassification: dataAccessMetrics.byClassification,
        educationRecordsAccess: dataAccessMetrics.ferpaRecords,
        unauthorizedAttempts: dataAccessMetrics.deniedAccess
      },

      security: {
        securityEvents: securityMetrics.totalEvents,
        eventsBySeverity: securityMetrics.bySeverity,
        topThreats: securityMetrics.topThreats,
        blockedAttacks: securityMetrics.blockedAttacks,
        vulnerabilities: securityMetrics.vulnerabilities
      },

      incidents: {
        totalIncidents: incidentMetrics.totalIncidents,
        incidentsByType: incidentMetrics.byType,
        incidentsBySeverity: incidentMetrics.bySeverity,
        meanTimeToDetect: incidentMetrics.mttd,
        meanTimeToResolve: incidentMetrics.mttr,
        resolvedIncidents: incidentMetrics.resolved,
        openIncidents: incidentMetrics.open
      },

      compliance: {
        ferpaCompliance: {
          recordsAccessed: dataAccessMetrics.ferpaRecords,
          unauthorizedAttempts: 0,
          breaches: 0,
          complianceRate: 100
        },
        privacyCompliance: {
          dataSubjectRequests: 0, // From privacy request tracking
          requestsFulfilled: 0,
          averageResponseTime: 0,
          breaches: 0
        }
      },

      recommendations: this.generateRecommendations(
        authMetrics,
        dataAccessMetrics,
        securityMetrics,
        incidentMetrics
      )
    };
  }

  private calculateRiskScore(
    security: SecurityMetrics,
    incidents: IncidentMetrics
  ): number {
    // Risk scoring algorithm
    let riskScore = 0;

    // Factor in security events
    riskScore += security.criticalEvents * 10;
    riskScore += security.highEvents * 5;
    riskScore += security.mediumEvents * 2;

    // Factor in incidents
    riskScore += incidents.criticalIncidents * 20;
    riskScore += incidents.highIncidents * 10;

    // Factor in resolution time
    if (incidents.mttr > 48 * 60) { // > 48 hours
      riskScore += 10;
    }

    // Normalize to 0-100 scale
    return Math.min(100, riskScore);
  }

  private generateRecommendations(
    auth: AuthMetrics,
    dataAccess: DataAccessMetrics,
    security: SecurityMetrics,
    incidents: IncidentMetrics
  ): string[] {
    const recommendations: string[] = [];

    // Authentication recommendations
    if (auth.failureRate > 0.1) {
      recommendations.push('High failed login rate detected. Consider implementing stricter account lockout policies.');
    }

    if (auth.mfaAdoption < 0.8) {
      recommendations.push('MFA adoption below 80%. Encourage or require MFA for all users.');
    }

    // Data access recommendations
    if (dataAccess.deniedAccess > 50) {
      recommendations.push('Significant number of unauthorized access attempts. Review access control policies and user permissions.');
    }

    // Security recommendations
    if (security.criticalEvents > 0) {
      recommendations.push('Critical security events detected. Immediate investigation and remediation required.');
    }

    // Incident recommendations
    if (incidents.mttr > 24 * 60) {
      recommendations.push('Mean time to resolve exceeds 24 hours. Review incident response procedures.');
    }

    return recommendations;
  }
}
```

## Conclusion

Comprehensive audit logging is essential for security, compliance, and operational excellence. This chapter has provided a complete framework for implementing audit logging across the Southville 8B NHS Edge platform, including:

- Structured JSON logging with consistent schemas
- Centralized log collection and storage
- Application and database audit trails
- Security event monitoring
- Compliance reporting
- Log analysis and forensic investigation
- Real-time alerting and monitoring

By implementing these audit logging practices, the platform ensures accountability, enables rapid incident response, supports regulatory compliance, and provides valuable insights for continuous improvement.

---

**Document Information**
- **Version**: 1.0
- **Last Updated**: 2026-01-11
- **Word Count**: ~8,500 words
- **Previous Chapter**: [40-data-privacy-compliance.md](./40-data-privacy-compliance.md)
- **Next Volume**: Volume 9: Testing & Quality Assurance
