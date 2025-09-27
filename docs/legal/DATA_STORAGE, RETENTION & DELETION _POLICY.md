________________________________________
Southville 8B NHS Edge
Learning Management System (LMS)
Data Storage, Retention, and Deletion Policy
________________________________________
Policy Header
•	Policy Title: Data Storage, Retention, and Deletion Policy
•	Version: 1.0
•	Effective Date: September 28, 2025
•	Last Review Date: September 28, 2025
•	Next Scheduled Review: September 28, 2026
•	Approved By: School Administration & Data Protection Officer (DPO)
________________________________________
1. Purpose
This policy establishes a formal framework for the storage, retention, archiving, backup, and secure disposal of data within the Southville 8B NHS Edge LMS. It ensures:
  •	Optimal utilization of the allocated 1 TB Cloudflare R2 storage.
  •	Cost efficiency through tiered storage management.
  •	Compliance with the Department of Education (DepEd), the Philippine Data Privacy Act of 2012 (RA 10173), and international standards (ISO/IEC 27001, 27701, 27018, GDPR).
  •	Preservation of academic, administrative, and operational records to meet institutional obligations.
________________________________________
2. Scope
This policy applies to:
  •	Faculty Members: Course materials, lesson content, and resources.
  •	Students: Assignment submissions, project deliverables, quiz responses (excluding videos).
  •	Administrative Staff: Reports, compliance documents, and operational records.
  •	System Components: PostgreSQL (Supabase), Cloudflare R2, Cloudflare Stream, and Railway-hosted services.
________________________________________
3. Data Classification & Storage Allocation
Category	Examples	Storage Medium	Retention Period	Archiving & Disposal Notes
->Course & Lesson Files	PDFs, PPTX, DOCX, images	Cloudflare R2	5 years	Auto-archived after 3 years of inactivity. Deduplication audits required.

->Assignment Submissions	Projects, homework	Cloudflare R2	2 years	Archived after 1 year; purged unless under dispute.

->Quizzes & Exams	Questions, responses	PostgreSQL (Supabase)	Indefinite	Minimal storage footprint.

->Progress Tracking	Logs, grades, metadata	PostgreSQL (Supabase)	Indefinite	Required for accreditation.

Audit & System Logs	Access logs, activity trails	PostgreSQL (Supabase)	2 years	Rotated securely; tamper-proof enforcement.
  Maximum File Sizes:
    •	Lesson Files: 200 MB
    •	Assignment Submissions: 50 MB
    •	Video Content: No limit (Cloudflare Stream)
  Quota Allocation:
    •	Courses & Lessons: ~80% R2
    •	Assignments: ~15% R2
    •	Miscellaneous/Buffer: ~5%
  ________________________________________
4. Retention & Archiving Policy
  •	Courses & Lessons: Retained for 5 years; auto-archived after 3 years of inactivity.
  •	Assignments: Retained for 2 years; archived after 1 year; permanently purged after 2 years unless disputed.
  •	Grades & Progress: Retained indefinitely.
  •	Audit & System Logs: Retained for 2 years; securely rotated.
  •	Backups: Weekly and quarterly, retained for 90 days with encrypted deletion protocols.
________________________________________
5. Backup & Recovery
  •	Frequency: Weekly and quarterly backups of PostgreSQL and Cloudflare R2.
  •	Location: Same-region cloud redundancy.
  •	Restoration Authority: Only the Principal, ICT Department, or DPO may authorize recovery.
  •	RPO (Recovery Point Objective): 1–3 hours.
  •	RTO (Recovery Time Objective): 24 hours.
  •	Verification: Annual backup and recovery tests are conducted, with results reviewed and validated by the Developer Team.
  •	Integrity Controls: AES-256 encryption at rest, TLS 1.2+ encryption in transit.
________________________________________
6. Archival & Disposal
  •	Archival: Inactive data is moved to encrypted archival storage with restricted access.
  •	Soft Deletion: Data is flagged or anonymized for auditability while remaining recoverable.
  •	Hard Deletion: Data is permanently purged from all systems and backups after retention expiration.
  •	Secure Disposal: Disposal follows NIST SP 800-88 and DoD 5220.22-M standards.
________________________________________
7. Governance & Responsibilities
  •	Faculty Members: Conduct annual file reviews, eliminate duplicates, and retain only relevant instructional content.
  •	Students: Submit assignments in approved formats and within file size limits.
  •	ICT Department: Perform quarterly capacity audits, enforce data lifecycle policies, respond to breaches, and manage deletion exceptions.
  •	Data Protection Officer (DPO, Ronie Gonzales): Ensure compliance with RA 10173, oversee data subject rights, and approve deletions, legal holds, and exceptions.
________________________________________
8. Enforcement Mechanisms
  •	Technical Controls: File type validation, automated lifecycle enforcement, and alert triggers at 80% storage utilization.
  •	Administrative Controls: Block non-compliant uploads, require written approval for restorations/archivals, and maintain logs of all deletions.
________________________________________
9. Data Subject Rights
  •	Rights include access, rectification, erasure, and restriction.
  •	All verified requests must be completed within 30 days and logged in the system.
________________________________________
10. Compliance & Vendor Assurance
  •	Adheres to DepEd, Philippine RA 10173, ISO/IEC 27001/27701/27018, GDPR, and NIST SP 800-88.
  •	Vendors (Supabase, Railway, Cloudflare) must maintain security certifications (SOC 2, ISO).
  •	Contracts with vendors include breach notification and compliance reporting obligations.
________________________________________
11. Review & Portability
  •	Annual Review: Conducted jointly by the ICT Department and the Academic Council.
  •	Out-of-Cycle Reviews: Triggered by regulatory changes, incidents, system upgrades, restructuring, or legal holds.
  •	Data Portability: Export available in CSV, JSON, MP4, or PDF formats to support LMS migration or transfer.
________________________________________
12. Legal Hold Procedures
  •	Legal Holds may be issued by the Principal, ICT Department, or DPO.
  •	Data subject to a hold must not be modified, deleted, or transferred.
  •	The DPO coordinates identification and protection of affected data.
  •	Holds remain in effect until formally released by the Principal or DPO.
  •	All hold actions are logged in the audit system.
________________________________________
13. Audit Trail Enhancement
  •	All deletion and restoration events are logged with details: item, timestamp, method, actor, and reason.
  •	Immutability: Audit logs are stored in tamper-proof, immutable storage (e.g., WORM or cryptographic sealing).
  •	Logs are retained for a minimum of 7 years.
  •	ICT Department performs annual reviews, supported by random integrity checks.
________________________________________
14. Exceptions
  •	Exception requests (e.g., for retention, format, or file size) require written submission.
  •	Approval must be granted by the ICT Department or the DPO.
  •	Sunset Clause: All exceptions automatically expire after 12 months, unless formally renewed.
  •	All exceptions are reviewed during the annual policy cycle.
________________________________________
15. Enforcement & Accountability
  •	Administrative Consequences: Suspension of system access, internal disciplinary measures, or referral to Academic Council.
  •	Legal Consequences: Escalation under RA 10173, including potential penalties, liabilities, or external investigations.
  •	Ultimate Responsibility: Lies with the School Administration and the DPO (Ronie Gonzales).
________________________________________
16. Definitions & Glossary
  •	RA 10173 – Republic Act 10173, the Philippine Data Privacy Act of 2012.
  •	DepEd – Department of Education (Philippines).
  •	DPO – Data Protection Officer, responsible for ensuring compliance with data privacy regulations.
  •	ICT Department – Information and Communications Technology unit managing technical operations, audits, and enforcement.
  •	RPO (Recovery Point Objective) – The maximum tolerable data loss measured in time.
  •	RTO (Recovery Time Objective) – The targeted duration to restore systems after disruption.
  •	Soft Deletion – Data flagged or anonymized, recoverable for audits.
  •	Hard Deletion – Permanent and irretrievable removal of data.
  •	Legal Hold – A directive to preserve data for investigations or litigation.
  •	Audit Trail – A tamper-proof record of actions performed in the system for compliance and accountability.
________________________________________
