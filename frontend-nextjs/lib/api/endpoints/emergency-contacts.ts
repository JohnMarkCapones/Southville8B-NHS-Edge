/**
 * Emergency Contacts API Endpoints
 * Handles CRUD operations for student emergency contacts
 */

import { apiClient } from '../client';
import type { EmergencyContact } from '../types';

/**
 * Get emergency contacts for a student
 * @param studentUserId - The user_id from the students table (same as user.id)
 */
export async function getEmergencyContacts(studentUserId: string): Promise<EmergencyContact[]> {
  return apiClient.get<EmergencyContact[]>(`/students/${studentUserId}/emergency-contacts`);
}

/**
 * Create a new emergency contact
 */
export async function createEmergencyContact(
  studentId: string,
  contactData: Partial<EmergencyContact>
): Promise<EmergencyContact> {
  return apiClient.post<EmergencyContact>(`/students/${studentId}/emergency-contacts`, contactData);
}

/**
 * Update an emergency contact
 */
export async function updateEmergencyContact(
  studentId: string,
  contactId: string,
  contactData: Partial<EmergencyContact>
): Promise<EmergencyContact> {
  return apiClient.patch<EmergencyContact>(
    `/students/${studentId}/emergency-contacts/${contactId}`,
    contactData
  );
}

/**
 * Delete an emergency contact
 */
export async function deleteEmergencyContact(
  studentId: string,
  contactId: string
): Promise<void> {
  return apiClient.delete(`/students/${studentId}/emergency-contacts/${contactId}`);
}
