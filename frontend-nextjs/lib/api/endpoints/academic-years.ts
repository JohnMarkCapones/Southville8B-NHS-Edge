/**
 * Academic Years API Endpoints
 * 
 * Provides methods for interacting with the academic years backend API.
 * Handles academic year management, periods, templates, and settings.
 * 
 * @module lib/api/endpoints/academic-years
 */

import { apiClient } from '../client';

// Types
export interface AcademicYear {
  id: string;
  year_name: string;
  start_date: string;
  end_date: string;
  structure: 'quarters' | 'semesters' | 'trimesters' | 'custom';
  is_active: boolean;
  is_archived: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  periods?: AcademicPeriod[];
}

export interface AcademicPeriod {
  id: string;
  academic_year_id: string;
  period_name: string;
  period_order: number;
  start_date: string;
  end_date: string;
  is_grading_period: boolean;
  weight: number;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface AcademicYearTemplate {
  id: string;
  template_name: string;
  structure: 'quarters' | 'semesters' | 'trimesters';
  description?: string;
  periods_config: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AcademicYearSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  description?: string;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface CreateAcademicYearDto {
  year_name: string;
  start_date: string;
  end_date: string;
  structure: 'quarters' | 'semesters' | 'trimesters' | 'custom';
  is_active?: boolean;
  description?: string;
  auto_generate_periods?: boolean;
  template_id?: string;
}

export interface UpdateAcademicYearDto {
  year_name?: string;
  start_date?: string;
  end_date?: string;
  structure?: 'quarters' | 'semesters' | 'trimesters' | 'custom';
  is_active?: boolean;
  description?: string;
}

export interface CreateAcademicPeriodDto {
  academic_year_id: string;
  period_name: string;
  period_order: number;
  start_date: string;
  end_date: string;
  is_grading_period?: boolean;
  weight?: number;
  description?: string;
}

export interface UpdateAcademicPeriodDto {
  period_name?: string;
  period_order?: number;
  start_date?: string;
  end_date?: string;
  is_grading_period?: boolean;
  weight?: number;
  description?: string;
}

export interface DashboardOverview {
  active_year: AcademicYear | null;
  current_period: AcademicPeriod | null;
  total_years: number;
  upcoming_years: number;
  archived_years: number;
}

export interface OverlapCheckResult {
  has_overlap: boolean;
  overlapping_years: AcademicYear[];
}

/**
 * Academic Years API Class
 * 
 * Provides methods for all academic year related operations.
 */
export class AcademicYearsApi {
  /**
   * Get all academic years
   */
  async getAll(): Promise<AcademicYear[]> {
    return apiClient.get<AcademicYear[]>('/academic-years');
  }

  /**
   * Get active academic year
   */
  async getActive(): Promise<AcademicYear | null> {
    return apiClient.get<AcademicYear | null>('/academic-years/active');
  }

  /**
   * Get current academic period
   */
  async getCurrentPeriod(): Promise<AcademicPeriod | null> {
    return apiClient.get<AcademicPeriod | null>('/academic-years/current-period');
  }

  /**
   * Get academic year by ID
   */
  async getById(id: string): Promise<AcademicYear> {
    return apiClient.get<AcademicYear>(`/academic-years/${id}`);
  }

  /**
   * Create new academic year
   */
  async create(data: CreateAcademicYearDto): Promise<AcademicYear> {
    return apiClient.post<AcademicYear>('/academic-years', data);
  }

  /**
   * Update academic year
   */
  async update(id: string, data: UpdateAcademicYearDto): Promise<AcademicYear> {
    return apiClient.patch<AcademicYear>(`/academic-years/${id}`, data);
  }

  /**
   * Archive academic year (soft delete)
   */
  async archive(id: string): Promise<void> {
    return apiClient.delete<void>(`/academic-years/${id}`);
  }

  /**
   * Permanently delete academic year (hard delete)
   */
  async hardDelete(id: string): Promise<void> {
    return apiClient.delete<void>(`/academic-years/${id}/hard`);
  }

  /**
   * Get academic periods for a year
   */
  async getPeriods(academicYearId: string): Promise<AcademicPeriod[]> {
    return apiClient.get<AcademicPeriod[]>(`/academic-years/${academicYearId}/periods`);
  }

  /**
   * Create new academic period
   */
  async createPeriod(data: CreateAcademicPeriodDto): Promise<AcademicPeriod> {
    return apiClient.post<AcademicPeriod>('/academic-years/periods', data);
  }

  /**
   * Update academic period
   */
  async updatePeriod(id: string, data: UpdateAcademicPeriodDto): Promise<AcademicPeriod> {
    return apiClient.patch<AcademicPeriod>(`/academic-years/periods/${id}`, data);
  }

  /**
   * Delete academic period
   */
  async deletePeriod(id: string): Promise<void> {
    return apiClient.delete<void>(`/academic-years/periods/${id}`);
  }

  /**
   * Generate periods from template
   */
  async generatePeriods(academicYearId: string, templateId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/academic-years/${academicYearId}/generate-periods`, {
      template_id: templateId,
    });
  }

  /**
   * Get academic year templates
   */
  async getTemplates(): Promise<AcademicYearTemplate[]> {
    return apiClient.get<AcademicYearTemplate[]>('/academic-years/templates');
  }

  /**
   * Get academic year settings
   */
  async getSettings(): Promise<AcademicYearSetting[]> {
    return apiClient.get<AcademicYearSetting[]>('/academic-years/settings');
  }

  /**
   * Update academic year setting
   */
  async updateSetting(key: string, value: any): Promise<AcademicYearSetting> {
    return apiClient.patch<AcademicYearSetting>(`/academic-years/settings/${key}`, { value });
  }

  /**
   * Get dashboard overview
   */
  async getDashboardOverview(): Promise<DashboardOverview> {
    return apiClient.get<DashboardOverview>('/academic-years/dashboard/overview');
  }

  /**
   * Check for overlapping academic years
   */
  async checkOverlap(
    startDate: string,
    endDate: string,
    excludeId?: string
  ): Promise<OverlapCheckResult> {
    return apiClient.post<OverlapCheckResult>('/academic-years/validation/check-overlap', {
      start_date: startDate,
      end_date: endDate,
      exclude_id: excludeId,
    });
  }
}

/**
 * Singleton instance of AcademicYearsApi
 * 
 * Use this instance for all academic year API operations.
 * 
 * @example
 * ```typescript
 * import { academicYearsApi } from '@/lib/api/endpoints/academic-years';
 * 
 * const years = await academicYearsApi.getAll();
 * const activeYear = await academicYearsApi.getActive();
 * ```
 */
export const academicYearsApi = new AcademicYearsApi();
