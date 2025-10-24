import { apiRequest } from '@/lib/api-client';
import type { Gwa, GwaParams } from '@/lib/types/gwa';

export async function fetchMyGwa(params?: GwaParams): Promise<Gwa[]> {
  const queryParams = new URLSearchParams();
  if (params?.grading_period) queryParams.append('grading_period', params.grading_period);
  if (params?.school_year) queryParams.append('school_year', params.school_year);
  
  const url = `/gwa/my-gwa${queryParams.toString() ? `?${queryParams}` : ''}`;
  return apiRequest<Gwa[]>(url, { method: 'GET' });
}
