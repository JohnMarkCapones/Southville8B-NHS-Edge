export interface ClubFaq {
  id: string;
  club_id: string;
  question: string;
  answer: string;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}
