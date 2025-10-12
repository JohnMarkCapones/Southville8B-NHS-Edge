import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PermissionValidationPipe } from './permission-validation.pipe';

describe('PermissionValidationPipe', () => {
  let pipe: PermissionValidationPipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PermissionValidationPipe],
    }).compile();

    pipe = module.get<PermissionValidationPipe>(PermissionValidationPipe);
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    it('should pass through non-string values', () => {
      expect(pipe.transform(123, {} as any)).toBe(123);
      expect(pipe.transform(null, {} as any)).toBe(null);
      expect(pipe.transform(undefined, {} as any)).toBe(undefined);
      expect(pipe.transform({}, {} as any)).toEqual({});
    });

    it('should pass through strings without dots', () => {
      expect(pipe.transform('simple-string', {} as any)).toBe('simple-string');
      expect(pipe.transform('no_dots_here', {} as any)).toBe('no_dots_here');
    });

    it('should validate correct permission format', () => {
      expect(pipe.transform('club.manage_finances', {} as any)).toBe(
        'club.manage_finances',
      );
      expect(pipe.transform('user.read_profile', {} as any)).toBe(
        'user.read_profile',
      );
      expect(pipe.transform('admin.delete_user', {} as any)).toBe(
        'admin.delete_user',
      );
    });

    it('should throw BadRequestException for invalid domain format', () => {
      expect(() => pipe.transform('.action', {} as any)).toThrow(
        BadRequestException,
      );
      expect(() => pipe.transform('123domain.action', {} as any)).toThrow(
        BadRequestException,
      );
      expect(() =>
        pipe.transform('domain-with-dash.action', {} as any),
      ).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid action format', () => {
      expect(() => pipe.transform('domain.', {} as any)).toThrow(
        BadRequestException,
      );
      expect(() => pipe.transform('domain.123action', {} as any)).toThrow(
        BadRequestException,
      );
      expect(() =>
        pipe.transform('domain.action-with-dash', {} as any),
      ).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for multiple dots', () => {
      expect(() =>
        pipe.transform('domain.action.subaction', {} as any),
      ).toThrow(BadRequestException);
    });

    it('should provide helpful error messages', () => {
      try {
        pipe.transform('.action', {} as any);
      } catch (error) {
        expect(error.message).toContain('Invalid permission format');
        expect(error.message).toContain('Expected format: "domain.action"');
      }
    });
  });
});
