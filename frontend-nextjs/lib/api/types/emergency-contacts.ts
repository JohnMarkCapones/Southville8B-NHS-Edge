/**
 * Emergency Contact Types
 * Based on backend emergency contact entity
 */

export interface EmergencyContact {
  id: string;
  studentId: string; // This is the student.id from students table
  guardianName: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContactsResponse {
  success: boolean;
  data: EmergencyContact[];
  message?: string;
}
