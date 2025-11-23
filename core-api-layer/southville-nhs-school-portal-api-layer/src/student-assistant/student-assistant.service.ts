import { Injectable, Logger } from '@nestjs/common';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
import { EventsService } from '../events/events.service';
import { NewsService } from '../news/services/news.service';
import { SchedulesService } from '../schedules/schedules.service';
import { SubjectsService } from '../subjects/subjects.service';
import { ModulesService } from '../modules/modules.service';
import { QuizService } from '../quiz/services/quiz.service';
import { GwaService } from '../gwa/gwa.service';
import { ClubsService } from '../clubs/clubs.service';
import { ClubFormResponsesService } from '../clubs/services/club-form-responses.service';
import { StudentsService } from '../students/students.service';
import {
  StudentAssistantQueryDto,
  StudentAssistantQueryFilters,
  StudentAssistantQueryType,
} from './dto/student-assistant-query.dto';
import { StudentAssistantResponseDto } from './dto/student-assistant-response.dto';
import { ModuleQueryDto } from '../modules/dto/module-query.dto';
import { SubjectQueryDto } from '../subjects/dto/subject-query.dto';

@Injectable()
export class StudentAssistantService {
  private readonly logger = new Logger(StudentAssistantService.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly newsService: NewsService,
    private readonly schedulesService: SchedulesService,
    private readonly subjectsService: SubjectsService,
    private readonly modulesService: ModulesService,
    private readonly quizService: QuizService,
    private readonly gwaService: GwaService,
    private readonly clubsService: ClubsService,
    private readonly clubFormResponsesService: ClubFormResponsesService,
    private readonly studentsService: StudentsService,
  ) {}

  async handleQuery(
    dto: StudentAssistantQueryDto,
    user: SupabaseUser,
  ): Promise<StudentAssistantResponseDto> {
    switch (dto.type) {
      case StudentAssistantQueryType.EVENTS:
        return this.handleEvents(dto);
      case StudentAssistantQueryType.NEWS:
        return this.handleNews(dto);
      case StudentAssistantQueryType.SCHEDULE:
        return this.handleSchedule(dto, user);
      case StudentAssistantQueryType.SUBJECTS:
        return this.handleSubjects(dto);
      case StudentAssistantQueryType.MODULES:
        return this.handleModules(dto, user);
      case StudentAssistantQueryType.QUIZZES:
        return this.handleQuizzes(dto, user);
      case StudentAssistantQueryType.GRADES:
        return this.handleGrades(dto, user);
      case StudentAssistantQueryType.CLUBS:
        return this.handleClubs(dto, user);
      default:
        this.logger.warn(`Unsupported student assistant query type: ${dto.type}`);
        return this.buildResponse(dto.type, [], {
          warning: 'Unsupported query type',
        });
    }
  }

  private async handleEvents(
    dto: StudentAssistantQueryDto,
  ): Promise<StudentAssistantResponseDto> {
    const filters: StudentAssistantQueryFilters = dto.filters ?? {};
    const page = this.getNumberFilter(filters, 'page', 1);
    const limit = this.getNumberFilter(filters, 'limit', 5);

    const result = await this.eventsService.findAll({
      page,
      limit,
      status: this.getStringFilter(filters, 'status') ?? 'published',
      visibility: this.getStringFilter(filters, 'visibility') ?? 'public',
      startDate: this.getStringFilter(filters, 'startDate'),
      endDate: this.getStringFilter(filters, 'endDate'),
      organizerId: this.getStringFilter(filters, 'organizerId'),
      tagId: this.getStringFilter(filters, 'tagId'),
      search: this.getStringFilter(filters, 'search'),
    });

    return this.buildResponse(StudentAssistantQueryType.EVENTS, result.data, {
      pagination: result.pagination,
      appliedFilters: { page, limit, ...filters },
    });
  }

  private async handleNews(
    dto: StudentAssistantQueryDto,
  ): Promise<StudentAssistantResponseDto> {
    const filters: StudentAssistantQueryFilters = dto.filters ?? {};
    const limit = this.getNumberFilter(filters, 'limit', 5);
    const offset = this.getNumberFilter(filters, 'offset', 0);

    const news = await this.newsService.findAll({
      status: this.getStringFilter(filters, 'status') ?? 'published',
      visibility: this.getStringFilter(filters, 'visibility') ?? 'public',
      categoryId: this.getStringFilter(filters, 'categoryId'),
      authorId: this.getStringFilter(filters, 'authorId'),
      limit,
      offset,
    });

    return this.buildResponse(StudentAssistantQueryType.NEWS, news, {
      count: news.length,
      appliedFilters: { limit, offset, ...filters },
    });
  }

  private async handleSchedule(
    dto: StudentAssistantQueryDto,
    user: SupabaseUser,
  ): Promise<StudentAssistantResponseDto> {
    const studentId = await this.resolveStudentId(dto, user);
    const schedule = await this.schedulesService.getStudentSchedule(studentId);

    return this.buildResponse(StudentAssistantQueryType.SCHEDULE, schedule, {
      studentId,
    });
  }

  private async handleSubjects(
    dto: StudentAssistantQueryDto,
  ): Promise<StudentAssistantResponseDto> {
    const filters: StudentAssistantQueryFilters = dto.filters ?? {};
    const page = this.getNumberFilter(filters, 'page', 1);
    const limit = this.getNumberFilter(filters, 'limit', 10);

    const subjectQuery: SubjectQueryDto = {
      page,
      limit,
      search: this.getStringFilter(filters, 'search'),
      sortBy: this.getStringFilter(filters, 'sortBy') ?? 'created_at',
      sortOrder: (this.getStringFilter(filters, 'sortOrder') as 'asc' | 'desc') ?? 'desc',
      status: this.getStringFilter(filters, 'status'),
      departmentId: this.getStringFilter(filters, 'departmentId'),
    };

    const result = await this.subjectsService.findAll(subjectQuery);

    return this.buildResponse(StudentAssistantQueryType.SUBJECTS, result.data, {
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      appliedFilters: { page, limit, ...filters },
    });
  }

  private async handleModules(
    dto: StudentAssistantQueryDto,
    user: SupabaseUser,
  ): Promise<StudentAssistantResponseDto> {
    const filters: StudentAssistantQueryFilters = dto.filters ?? {};
    const userId = this.resolveUserId(dto, user);

    const query: ModuleQueryDto = {
      page: this.getNumberFilter(filters, 'page', 1),
      limit: this.getNumberFilter(filters, 'limit', 10),
      search: this.getStringFilter(filters, 'search'),
      subjectId: this.getStringFilter(filters, 'subjectId'),
      sectionId: this.getStringFilter(filters, 'sectionId'),
      sortBy: this.getStringFilter(filters, 'sortBy'),
      sortOrder: this.getStringFilter(filters, 'sortOrder') as 'asc' | 'desc' | undefined,
    };

    const result = await this.modulesService.findAccessibleModules(userId, query);

    return this.buildResponse(StudentAssistantQueryType.MODULES, result.modules, {
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
      appliedFilters: { ...query },
    });
  }

  private async handleQuizzes(
    dto: StudentAssistantQueryDto,
    user: SupabaseUser,
  ): Promise<StudentAssistantResponseDto> {
    const filters: StudentAssistantQueryFilters = dto.filters ?? {};
    const userId = this.resolveUserId(dto, user);
    const page = this.getNumberFilter(filters, 'page', 1);
    const limit = this.getNumberFilter(filters, 'limit', 10);

    const result = await this.quizService.getAvailableQuizzes(userId, {
      subjectId: this.getStringFilter(filters, 'subjectId'),
      status: this.getStringFilter(filters, 'status') ?? 'published',
      page,
      limit,
    });

    return this.buildResponse(StudentAssistantQueryType.QUIZZES, result.data, {
      pagination: result.pagination,
      appliedFilters: { page, limit, ...filters },
    });
  }

  private async handleGrades(
    dto: StudentAssistantQueryDto,
    user: SupabaseUser,
  ): Promise<StudentAssistantResponseDto> {
    const filters: StudentAssistantQueryFilters = dto.filters ?? {};
    const userId = this.resolveUserId(dto, user);

    const records = await this.gwaService.getStudentGwa(
      userId,
      this.getStringFilter(filters, 'gradingPeriod'),
      this.getStringFilter(filters, 'schoolYear'),
    );

    return this.buildResponse(StudentAssistantQueryType.GRADES, records, {
      count: records.length,
      appliedFilters: filters,
    });
  }

  private async handleClubs(
    dto: StudentAssistantQueryDto,
    user: SupabaseUser,
  ): Promise<StudentAssistantResponseDto> {
    const userId = this.resolveUserId(dto, user);
    const [clubs, applications] = await Promise.all([
      this.clubsService.findAll(),
      this.clubFormResponsesService.findUserResponses(userId),
    ]);

    return this.buildResponse(
      StudentAssistantQueryType.CLUBS,
      {
        clubs,
        applications,
      },
      {
        counts: {
          clubs: clubs.length,
          applications: applications.length,
        },
      },
    );
  }

  private resolveUserId(
    dto: StudentAssistantQueryDto,
    user: SupabaseUser,
  ): string {
    return dto.targetUserId ?? user.id;
  }

  private async resolveStudentId(
    dto: StudentAssistantQueryDto,
    user: SupabaseUser,
  ): Promise<string> {
    if (dto.targetStudentId) {
      return dto.targetStudentId;
    }
    const userId = this.resolveUserId(dto, user);
    return this.studentsService.getStudentIdByUserId(userId);
  }

  private buildResponse<T>(
    type: StudentAssistantQueryType,
    data: T,
    metadata?: Record<string, unknown>,
  ): StudentAssistantResponseDto<T> {
    return { type, data, metadata };
  }

  private getNumberFilter(
    filters: StudentAssistantQueryFilters,
    key: string,
    defaultValue: number,
  ): number {
    const raw = filters[key];
    if (raw === undefined || raw === null) {
      return defaultValue;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  }

  private getStringFilter(
    filters: StudentAssistantQueryFilters,
    key: string,
  ): string | undefined {
    const raw = filters[key];
    if (typeof raw === 'string' && raw.trim().length > 0) {
      return raw.trim();
    }
    return undefined;
  }
}
