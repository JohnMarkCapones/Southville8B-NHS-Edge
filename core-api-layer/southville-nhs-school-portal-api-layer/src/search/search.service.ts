import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private supabase: SupabaseClient | null = null;

  constructor(private readonly configService: ConfigService) {}

  private getClient(): SupabaseClient {
    if (!this.supabase) {
      const url = this.configService.get<string>('supabase.url');
      const key = this.configService.get<string>('supabase.serviceRoleKey');
      if (!url || !key) throw new Error('Supabase configuration missing');
      this.supabase = createClient(url, key);
    }
    return this.supabase;
  }

  async suggest(userId: string, q: string, limit: number) {
    const client = this.getClient();
    const ilike = `%${q}%`;

    const [ann, ev, sch, al] = await Promise.all([
      client
        .from('announcements')
        .select('id, title, type, created_at')
        .ilike('title', ilike)
        .order('created_at', { ascending: false })
        .limit(limit),
      client
        .from('events')
        .select('id, title, date')
        .or(`title.ilike.${ilike},date.ilike.${ilike}`)
        .order('date', { ascending: true })
        .limit(limit),
      client
        .from('class_schedules')
        .select(
          'id, day_of_week, start_time, end_time, subject:subjects(subject_name)',
        )
        .eq('student_user_id', userId)
        .ilike('subjects.subject_name', ilike)
        .limit(limit),
      client
        .from('alerts')
        .select('id, title, type, recipient_id')
        .or(
          `title.ilike.${ilike},recipient_id.is.null,recipient_id.eq.${userId}`,
        )
        .order('created_at', { ascending: false })
        .limit(limit),
    ]);

    const unwrap = (res: any) => (res.error ? [] : res.data || []);

    return {
      announcements: unwrap(ann).map((a: any) => ({
        id: a.id,
        kind: 'announcement',
        title: a.title,
        subtitle: a.type,
      })),
      events: unwrap(ev).map((e: any) => ({
        id: e.id,
        kind: 'event',
        title: e.title,
        subtitle: e.date,
      })),
      schedules: unwrap(sch).map((s: any) => ({
        id: s.id,
        kind: 'schedule',
        title: s.subject?.subject_name ?? 'Subject',
        subtitle: `${s.day_of_week} ${s.start_time}-${s.end_time}`,
      })),
      alerts: unwrap(al).map((r: any) => ({
        id: r.id,
        kind: 'alert',
        title: r.title,
        subtitle: r.type,
      })),
    };
  }
}
