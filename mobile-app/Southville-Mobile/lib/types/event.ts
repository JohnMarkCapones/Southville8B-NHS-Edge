export interface EventTag {
  id: string;
  name: string;
  color?: string;
}

export interface EventAdditionalInfo {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizerId: string;
  eventImage?: string;
  status: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  organizer?: {
    id: string;
    fullName: string;
    email: string;
  };
  tags?: EventTag[];
  additionalInfo?: EventAdditionalInfo[];
}
