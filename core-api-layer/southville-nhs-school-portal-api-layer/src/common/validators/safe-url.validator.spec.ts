import { validate } from 'class-validator';
import { IsOptional } from 'class-validator';
import { IsSafeUrl } from './safe-url.validator';

class TestDto {
  @IsOptional()
  @IsSafeUrl()
  url?: string;
}

describe('IsSafeUrl Validator', () => {
  it('should validate correct HTTPS URLs', async () => {
    const dto = new TestDto();
    dto.url = 'https://example.com';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate correct HTTP URLs', async () => {
    const dto = new TestDto();
    dto.url = 'http://example.com';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate URLs with paths and query parameters', async () => {
    const dto = new TestDto();
    dto.url = 'https://example.com/path?param=value';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject invalid URLs', async () => {
    const dto = new TestDto();
    dto.url = 'not-a-url';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('url');
  });

  it('should reject URLs with invalid protocols', async () => {
    const dto = new TestDto();
    dto.url = 'ftp://example.com';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('url');
  });

  it('should reject localhost URLs', async () => {
    const dto = new TestDto();
    dto.url = 'http://localhost:3000';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('url');
  });

  it('should reject private IP addresses', async () => {
    const dto = new TestDto();
    dto.url = 'http://192.168.1.1';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('url');
  });

  it('should handle empty string', async () => {
    const dto = new TestDto();
    dto.url = '';

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('url');
  });

  it('should handle undefined values (optional)', async () => {
    const dto = new TestDto();
    dto.url = undefined;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should handle null values (optional)', async () => {
    const dto = new TestDto();
    (dto as any).url = null;

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should reject URLs that would bypass validator.js validation', async () => {
    // These are examples of URLs that could bypass the vulnerable validator.js
    const maliciousUrls = [
      'javascript:alert("xss")',
      'data:text/html,<script>alert("xss")</script>',
      'vbscript:msgbox("xss")',
      'file:///etc/passwd',
    ];

    for (const url of maliciousUrls) {
      const dto = new TestDto();
      dto.url = url;

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('url');
    }
  });
});
