import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class NewsKpiService {
  private readonly logger = new Logger(NewsKpiService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  private async getJournalismDomainId(): Promise<string | null> {
    const { data, error } = await this.supabaseService
      .getServiceClient()
      .from('domains')
      .select('id')
      .eq('type', 'journalism')
      .maybeSingle();

    if (error) {
      this.logger.error('Failed to get journalism domain', error);
      return null;
    }
    return data?.id ?? null;
  }

  async getKpis() {
    const supabase = this.supabaseService.getServiceClient();
    const domainId = await this.getJournalismDomainId();
    if (!domainId) {
      throw new BadRequestException('Journalism domain not found');
    }

    // Members by position
    const { data: membersByPosition, error: mbpError } = await supabase
      .from('domain_roles')
      .select('name, member_count:user_domain_roles(count)')
      .eq('domain_id', domainId);
    if (mbpError) {
      this.logger.error('Failed to load members by position', mbpError);
      throw new BadRequestException('Failed to load KPIs');
    }

    const membersByPositionMapped = (membersByPosition || []).map((r: any) => ({
      position: r.name,
      count: Array.isArray(r.member_count)
        ? (r.member_count[0]?.count ?? 0)
        : 0,
    }));

    const totalMembers = membersByPositionMapped.reduce(
      (s, r) => s + r.count,
      0,
    );

    // Unique positions occupancy
    const uniquePositions = ['Adviser', 'Editor-in-Chief'];
    const { data: uniqueData } = await supabase
      .from('domain_roles')
      .select('name, id')
      .eq('domain_id', domainId)
      .in('name', uniquePositions);
    const roleNameToId = new Map(
      uniqueData?.map((r: any) => [r.name, r.id]) || [],
    );

    const occupied: Record<string, boolean> = {};
    for (const up of uniquePositions) {
      const roleId = roleNameToId.get(up);
      if (!roleId) {
        occupied[up] = false;
        continue;
      }
      const { data } = await supabase
        .from('user_domain_roles')
        .select('id')
        .eq('domain_role_id', roleId)
        .maybeSingle();
      occupied[up] = !!data;
    }

    // Pipeline breakdown for journalism authors
    const { data: authorIds } = await supabase
      .from('user_domain_roles')
      .select('user_id')
      .in('domain_role_id', Array.from(roleNameToId.values()))
      .neq('user_id', null);
    const jmAuthorIds = (authorIds || []).map((r: any) => r.user_id);

    const statuses = [
      'draft',
      'pending_approval',
      'approved',
      'published',
      'archived',
    ];
    const breakdown: { status: string; count: number }[] = [];
    for (const s of statuses) {
      const { count } = await supabase
        .from('news')
        .select('id', { count: 'exact', head: true })
        .in(
          'author_id',
          jmAuthorIds.length
            ? jmAuthorIds
            : ['00000000-0000-0000-0000-000000000000'],
        )
        .eq('status', s);
      breakdown.push({ status: s, count: count || 0 });
    }

    // Active contributors 30d
    const { data: activeRows } = await supabase
      .from('news')
      .select('author_id')
      .gte(
        'updated_at',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      );
    const activeContributors30d = new Set(
      (activeRows || []).map((r: any) => r.author_id),
    ).size;

    // Top contributors 90d
    const { data: published90 } = await supabase
      .from('news')
      .select('author_id, users:author_id(full_name)')
      .eq('status', 'published')
      .gte(
        'published_date',
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      );
    const countMap = new Map<string, { name: string; count: number }>();
    for (const row of published90 || []) {
      const id = row.author_id;
      const name = (row.users as any)?.full_name || 'Unknown';
      const entry = countMap.get(id) || { name, count: 0 };
      entry.count += 1;
      countMap.set(id, entry);
    }
    const topContributors90d = Array.from(countMap.entries())
      .map(([userId, v]) => ({ userId, name: v.name, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalMembers,
      membersByPosition: membersByPositionMapped,
      uniquePositionsOccupied: {
        adviser: !!occupied['Adviser'],
        editorInChief: !!occupied['Editor-in-Chief'],
      },
      activeContributors30d,
      pipelineBreakdown: breakdown,
      topContributors90d,
    };
  }
}

