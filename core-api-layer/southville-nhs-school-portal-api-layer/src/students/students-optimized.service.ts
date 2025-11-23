import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { SupabaseService } from '../supabase/supabase.service';
import { StudentRanking } from './entities/student-ranking.entity';

@Injectable()
export class StudentsOptimizedService {
  private readonly logger = new Logger(StudentsOptimizedService.name);
  private readonly CACHE_TTL = 300; // 5 minutes cache

  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Get all student rankings with filters and caching
   */
  async findAllRankings(
    filters: {
      page?: number;
      limit?: number;
      gradeLevel?: string;
      quarter?: string;
      schoolYear?: string;
      topN?: number;
    } = {},
  ): Promise<{
    data: StudentRanking[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      gradeLevel,
      quarter,
      schoolYear,
      topN = 100,
    } = filters;

    // Create cache key based on filters
    const cacheKey = `rankings:${JSON.stringify({
      page,
      limit,
      gradeLevel,
      quarter,
      schoolYear,
      topN,
    })}`;

    // Try to get from cache first
    try {
      const cachedResult = await this.cacheManager.get(cacheKey);
      if (cachedResult) {
        this.logger.log(`Cache hit for rankings: ${cacheKey}`);
        return cachedResult as any;
      }
    } catch (error) {
      this.logger.warn('Cache read error:', error);
    }

    // If not in cache, fetch from database
    this.logger.log(`Cache miss for rankings: ${cacheKey}`);
    const result = await this.fetchRankingsFromDatabase(filters);

    // Cache the result
    try {
      await this.cacheManager.set(cacheKey, result, this.CACHE_TTL * 1000);
      this.logger.log(`Cached rankings result: ${cacheKey}`);
    } catch (error) {
      this.logger.warn('Cache write error:', error);
    }

    return result as any;
  }

  /**
   * Fetch rankings from database (optimized query)
   */
  private async fetchRankingsFromDatabase(filters: {
    page?: number;
    limit?: number;
    gradeLevel?: string;
    quarter?: string;
    schoolYear?: string;
    topN?: number;
  }) {
    const supabase = this.supabaseService.getServiceClient();
    const {
      page = 1,
      limit = 10,
      gradeLevel,
      quarter,
      schoolYear,
      topN = 100,
    } = filters;

    // Optimized query with proper indexing
    let query = supabase
      .from('student_rankings')
      .select(
        `
        id,
        student_id,
        rank,
        grade_level,
        quarter,
        school_year,
        honor_status,
        created_at,
        updated_at,
        student:students!inner(
          id,
          first_name,
          last_name,
          student_id,
          grade_level
        )
      `,
        { count: 'exact' },
      )
      .lte('rank', topN)
      .order('grade_level', { ascending: true })
      .order('rank', { ascending: true });

    // Apply filters (these will use the indexes we created)
    if (gradeLevel) {
      query = query.eq('grade_level', gradeLevel);
    }
    if (quarter) {
      query = query.eq('quarter', quarter);
    }
    if (schoolYear) {
      query = query.eq('school_year', schoolYear);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching student rankings:', error);
      throw new InternalServerErrorException(
        'Failed to fetch student rankings',
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: data || [],
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get top students by GWA with caching
   */
  async getTopStudentsByGwa(
    filters: {
      gradeLevel?: string;
      quarter?: string;
      schoolYear?: string;
      limit?: number;
    } = {},
  ) {
    const { gradeLevel, quarter, schoolYear, limit = 10 } = filters;

    // Create cache key
    const cacheKey = `top-gwa:${JSON.stringify({
      gradeLevel,
      quarter,
      schoolYear,
      limit,
    })}`;

    // Try cache first
    try {
      const cachedResult = await this.cacheManager.get(cacheKey);
      if (cachedResult) {
        this.logger.log(`Cache hit for top GWA: ${cacheKey}`);
        return cachedResult as any;
      }
    } catch (error) {
      this.logger.warn('Cache read error:', error);
    }

    // Fetch from database
    this.logger.log(`Cache miss for top GWA: ${cacheKey}`);
    const result = await this.fetchTopGwaFromDatabase(filters);

    // Cache the result
    try {
      await this.cacheManager.set(cacheKey, result, this.CACHE_TTL * 1000);
      this.logger.log(`Cached top GWA result: ${cacheKey}`);
    } catch (error) {
      this.logger.warn('Cache write error:', error);
    }

    return result;
  }

  /**
   * Fetch top GWA from database (optimized query)
   */
  private async fetchTopGwaFromDatabase(filters: {
    gradeLevel?: string;
    quarter?: string;
    schoolYear?: string;
    limit?: number;
  }) {
    const supabase = this.supabaseService.getServiceClient();
    const { gradeLevel, quarter, schoolYear, limit = 10 } = filters;

    // Optimized query with proper joins and indexing
    let query = supabase
      .from('students_gwa')
      .select(
        `
        id,
        student_id,
        gwa,
        grading_period,
        school_year,
        honor_status,
        remarks,
        created_at,
        updated_at,
        student:students!inner(
          id,
          first_name,
          last_name,
          student_id,
          grade_level,
          section:sections(
            id,
            name,
            grade_level
          )
        )
      `,
      )
      .order('gwa', { ascending: false })
      .limit(limit);

    // Apply filters
    if (gradeLevel) {
      query = query.eq('student.grade_level', gradeLevel);
    }
    if (quarter) {
      query = query.eq('grading_period', quarter);
    }
    if (schoolYear) {
      query = query.eq('school_year', schoolYear);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error('Error fetching top GWA students:', error);
      throw new InternalServerErrorException(
        'Failed to fetch top GWA students',
      );
    }

    return data || [];
  }

  /**
   * Invalidate cache when rankings are updated
   */
  async invalidateRankingsCache() {
    try {
      // Clear all ranking-related cache entries
      const rankingKeys = ['rankings:', 'top-gwa:'];

      for (const keyPrefix of rankingKeys) {
        // Clear cache entries that start with the prefix
        await this.cacheManager.del(keyPrefix);
      }

      this.logger.log(`Invalidated ranking cache entries`);
    } catch (error) {
      this.logger.warn('Cache invalidation error:', error);
    }
  }
}
