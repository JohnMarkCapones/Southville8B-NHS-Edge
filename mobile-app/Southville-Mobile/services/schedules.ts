import { apiRequest } from '@/lib/api-client';
import type { Schedule } from '@/lib/types/schedule';

export async function fetchMySchedule(): Promise<Schedule[]> {
  return apiRequest<Schedule[]>('/schedules/my-schedule');
}
