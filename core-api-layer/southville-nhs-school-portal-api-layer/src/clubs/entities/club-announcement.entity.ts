export interface ClubAnnouncement {
  id: string;
  club_id: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ClubAnnouncementWithAuthor extends ClubAnnouncement {
  author?: {
    id: string;
    full_name: string;
    email: string;
  };
}
