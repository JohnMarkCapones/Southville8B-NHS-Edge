import { apiRequest } from '@/lib/api-client';
import type { UserProfile } from '@/lib/types/user';

export async function fetchCurrentUser(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/users/me');
}
