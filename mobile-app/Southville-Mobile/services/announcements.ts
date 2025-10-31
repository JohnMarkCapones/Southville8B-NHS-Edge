import { apiRequest } from '@/lib/api-client';
import type { AnnouncementsResponse, AnnouncementsParams } from '@/lib/types/announcement';

export async function fetchAnnouncements(
  params: AnnouncementsParams = {}
): Promise<AnnouncementsResponse> {
  const {
    page = 1,
    limit = 10,
    visibility,
    type,
    roleId,
    includeExpired = false,
  } = params;

  const searchParams = new URLSearchParams();
  
  searchParams.set('page', page.toString());
  searchParams.set('limit', limit.toString());
  searchParams.set('includeExpired', includeExpired.toString());
  
  if (visibility) {
    searchParams.set('visibility', visibility);
  }
  
  if (type) {
    searchParams.set('type', type);
  }
  
  if (roleId) {
    searchParams.set('roleId', roleId);
  }

  const queryString = searchParams.toString();
  const path = `/announcements${queryString ? `?${queryString}` : ''}`;

  return apiRequest<AnnouncementsResponse>(path);
}
