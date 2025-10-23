import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
};

// Mock createClient
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('FaqService', () => {
  let service: FaqService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FaqService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'supabase.url': 'https://test.supabase.co',
                'supabase.serviceKey': 'test-service-key',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<FaqService>(FaqService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new FAQ', async () => {
      const createFaqDto: CreateFaqDto = {
        question: 'How do I reset my password?',
        answer:
          'You can reset your password by clicking the "Forgot Password" link.',
      };

      const expectedFaq = {
        id: 'test-id',
        question: createFaqDto.question,
        answer: createFaqDto.answer,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockInsert = {
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: expectedFaq,
            error: null,
          }),
        }),
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue(mockInsert),
        select: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      });

      const result = await service.create(createFaqDto);

      expect(result).toEqual(expectedFaq);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('faq');
    });

    it('should throw InternalServerErrorException when creation fails', async () => {
      const createFaqDto: CreateFaqDto = {
        question: 'Test question?',
        answer: 'Test answer.',
      };

      const mockInsert = {
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue(mockInsert),
        select: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      });

      await expect(service.create(createFaqDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated FAQs', async () => {
      const mockFaqs = [
        {
          id: '1',
          question: 'Question 1?',
          answer: 'Answer 1.',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          question: 'Question 2?',
          answer: 'Answer 2.',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      const mockSelect = {
        order: jest.fn().mockReturnValue({
          range: jest.fn().mockResolvedValue({
            data: mockFaqs,
            error: null,
            count: 2,
          }),
        }),
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn(),
        select: jest.fn().mockReturnValue(mockSelect),
        update: jest.fn(),
        delete: jest.fn(),
      });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.data).toEqual(mockFaqs);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should apply search filter when provided', async () => {
      // Create a mock that supports chaining
      const mockQuery = {
        order: jest.fn(),
        range: jest.fn(),
        or: jest.fn(),
      };

      // Set up the chaining behavior
      mockQuery.order.mockReturnValue(mockQuery);
      mockQuery.range.mockResolvedValue({
        data: [],
        error: null,
        count: 0,
      });
      mockQuery.or.mockReturnValue(mockQuery);

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn(),
        select: jest.fn().mockReturnValue(mockQuery),
        update: jest.fn(),
        delete: jest.fn(),
      });

      await service.findAll({ page: 1, limit: 10, search: 'test' });

      expect(mockQuery.or).toHaveBeenCalledWith(
        'question.ilike.%test%,answer.ilike.%test%',
      );
    });
  });

  describe('findOne', () => {
    it('should return a FAQ by id', async () => {
      const faqId = 'test-id';
      const expectedFaq = {
        id: faqId,
        question: 'Test question?',
        answer: 'Test answer.',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockSelect = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: expectedFaq,
            error: null,
          }),
        }),
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn(),
        select: jest.fn().mockReturnValue(mockSelect),
        update: jest.fn(),
        delete: jest.fn(),
      });

      const result = await service.findOne(faqId);

      expect(result).toEqual(expectedFaq);
      expect(mockSelect.eq).toHaveBeenCalledWith('id', faqId);
    });

    it('should throw NotFoundException when FAQ not found', async () => {
      const faqId = 'non-existent-id';

      const mockSelect = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn(),
        select: jest.fn().mockReturnValue(mockSelect),
        update: jest.fn(),
        delete: jest.fn(),
      });

      await expect(service.findOne(faqId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a FAQ', async () => {
      const faqId = 'test-id';
      const updateFaqDto: UpdateFaqDto = {
        question: 'Updated question?',
        answer: 'Updated answer.',
      };

      const expectedFaq = {
        id: faqId,
        question: updateFaqDto.question,
        answer: updateFaqDto.answer,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      // Mock findOne to return existing FAQ
      const mockSelect = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: faqId, question: 'Old question', answer: 'Old answer' },
            error: null,
          }),
        }),
      };

      const mockUpdate = {
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: expectedFaq,
              error: null,
            }),
          }),
        }),
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn(),
        select: jest.fn().mockReturnValue(mockSelect),
        update: jest.fn().mockReturnValue(mockUpdate),
        delete: jest.fn(),
      });

      const result = await service.update(faqId, updateFaqDto);

      expect(result).toEqual(expectedFaq);
    });
  });

  describe('remove', () => {
    it('should delete a FAQ', async () => {
      const faqId = 'test-id';

      // Mock findOne to return existing FAQ
      const mockSelect = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: faqId,
              question: 'Test question',
              answer: 'Test answer',
            },
            error: null,
          }),
        }),
      };

      const mockDelete = {
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn(),
        select: jest.fn().mockReturnValue(mockSelect),
        update: jest.fn(),
        delete: jest.fn().mockReturnValue(mockDelete),
      });

      await service.remove(faqId);

      expect(mockDelete.eq).toHaveBeenCalledWith('id', faqId);
    });

    it('should throw NotFoundException when FAQ not found', async () => {
      const faqId = 'non-existent-id';

      const mockSelect = {
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn(),
        select: jest.fn().mockReturnValue(mockSelect),
        update: jest.fn(),
        delete: jest.fn(),
      });

      await expect(service.remove(faqId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('search', () => {
    it('should search FAQs by query', async () => {
      const query = 'password';
      const mockFaqs = [
        {
          id: '1',
          question: 'How to reset password?',
          answer: 'Click forgot password link.',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      const mockSelect = {
        or: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: mockFaqs,
            error: null,
            count: 1,
          }),
        }),
      };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn(),
        select: jest.fn().mockReturnValue(mockSelect),
        update: jest.fn(),
        delete: jest.fn(),
      });

      const result = await service.search(query);

      expect(result.data).toEqual(mockFaqs);
      expect(result.total).toBe(1);
      expect(mockSelect.or).toHaveBeenCalledWith(
        'question.ilike.%password%,answer.ilike.%password%',
      );
    });
  });
});
