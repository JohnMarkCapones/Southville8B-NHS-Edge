import { Test, TestingModule } from '@nestjs/testing';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
import { AuthService } from '../auth/auth.service';
import { RoleCacheService } from '../auth/services/role-cache.service';

describe('FaqController', () => {
  let controller: FaqController;
  let service: FaqService;

  const mockFaqService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    search: jest.fn(),
  };

  const mockUser: SupabaseUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'Admin',
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaqController],
      providers: [
        {
          provide: FaqService,
          useValue: mockFaqService,
        },
        {
          provide: AuthService,
          useValue: {
            verifyToken: jest.fn(),
          },
        },
        {
          provide: RoleCacheService,
          useValue: {
            getCachedRole: jest.fn(),
            setCachedRole: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FaqController>(FaqController);
    service = module.get<FaqService>(FaqService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll (Public)', () => {
    it('should return paginated FAQs', async () => {
      const mockResult = {
        data: [
          {
            id: '1',
            question: 'Test question?',
            answer: 'Test answer.',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockFaqService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    });

    it('should pass search parameter to service', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      mockFaqService.findAll.mockResolvedValue(mockResult);

      await controller.findAll(1, 10, 'search term');

      expect(service.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: 'search term',
      });
    });
  });

  describe('search (Public)', () => {
    it('should search FAQs by query', async () => {
      const mockResult = {
        data: [
          {
            id: '1',
            question: 'How to reset password?',
            answer: 'Click forgot password link.',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      mockFaqService.search.mockResolvedValue(mockResult);

      const result = await controller.search('password');

      expect(result).toEqual(mockResult);
      expect(service.search).toHaveBeenCalledWith('password');
    });
  });

  describe('findOne (Public)', () => {
    it('should return a single FAQ', async () => {
      const faqId = 'test-id';
      const mockFaq = {
        id: faqId,
        question: 'Test question?',
        answer: 'Test answer.',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockFaqService.findOne.mockResolvedValue(mockFaq);

      const result = await controller.findOne(faqId);

      expect(result).toEqual(mockFaq);
      expect(service.findOne).toHaveBeenCalledWith(faqId);
    });
  });

  describe('create (Admin)', () => {
    it('should create a new FAQ', async () => {
      const createFaqDto: CreateFaqDto = {
        question: 'How do I reset my password?',
        answer:
          'You can reset your password by clicking the "Forgot Password" link.',
      };

      const mockFaq = {
        id: 'test-id',
        question: createFaqDto.question,
        answer: createFaqDto.answer,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockFaqService.create.mockResolvedValue(mockFaq);

      const result = await controller.create(createFaqDto, mockUser);

      expect(result).toEqual(mockFaq);
      expect(service.create).toHaveBeenCalledWith(createFaqDto);
    });
  });

  describe('update (Admin)', () => {
    it('should update a FAQ', async () => {
      const faqId = 'test-id';
      const updateFaqDto: UpdateFaqDto = {
        question: 'Updated question?',
        answer: 'Updated answer.',
      };

      const mockFaq = {
        id: faqId,
        question: updateFaqDto.question,
        answer: updateFaqDto.answer,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z',
      };

      mockFaqService.update.mockResolvedValue(mockFaq);

      const result = await controller.update(faqId, updateFaqDto, mockUser);

      expect(result).toEqual(mockFaq);
      expect(service.update).toHaveBeenCalledWith(faqId, updateFaqDto);
    });
  });

  describe('remove (Admin)', () => {
    it('should delete a FAQ', async () => {
      const faqId = 'test-id';
      const mockMessage = { message: 'FAQ deleted successfully' };

      mockFaqService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(faqId, mockUser);

      expect(result).toEqual(mockMessage);
      expect(service.remove).toHaveBeenCalledWith(faqId);
    });
  });
});
