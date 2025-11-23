# 🧪 Testing Guidelines & Anti-Patterns to Avoid

## 🚨 **CRITICAL: What NOT to Do (Anti-Patterns)**

### ❌ **NEVER Modify Tests to Make Them Pass**

```typescript
// BAD: Changing test expectations to accommodate broken code
it('should create FAQ', async () => {
  // Don't do this - changing expectations instead of fixing code
  const result = await service.create(createFaqDto);
  expect(result).toBeDefined(); // Too vague - doesn't catch real issues
});

// GOOD: Specific expectations that catch real problems
it('should create FAQ with proper data', async () => {
  const result = await service.create(createFaqDto);
  expect(result.id).toBeDefined();
  expect(result.question).toBe(createFaqDto.question);
  expect(result.answer).toBe(createFaqDto.answer);
  expect(result.created_at).toBeDefined();
});
```

### ❌ **NEVER Use Excessive Mocking to Hide Real Issues**

```typescript
// BAD: Mocking everything to make tests pass
const mockSupabaseClient = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({ data: fakeData, error: null }),
      })),
    })),
  })),
};

// GOOD: Mock only what's necessary, test real integration
const mockSupabaseClient = {
  from: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest
          .fn()
          .mockResolvedValue({ data: expectedData, error: null }),
      }),
    }),
  }),
};
```

### ❌ **NEVER Use `any` Types to Bypass TypeScript Errors**

```typescript
// BAD: Using 'any' to hide type issues
const mockSelect: any = {
  order: jest.fn(),
  // ... other mocks
};

// GOOD: Proper typing that catches real issues
interface MockQuery {
  order: jest.Mock;
  range: jest.Mock;
  or: jest.Mock;
}
const mockSelect: MockQuery = {
  order: jest.fn(),
  range: jest.fn(),
  or: jest.fn(),
};
```

## ✅ **What TO Do (Best Practices)**

### 1. **Test-Driven Development (TDD) Flow**

```typescript
// 1. RED: Write failing test first
it('should create FAQ with real Supabase', async () => {
  const result = await service.create(createFaqDto);
  expect(result.id).toBeDefined();
  expect(result.question).toBe(createFaqDto.question);
});

// 2. GREEN: Write minimal code to pass
async create(dto: CreateFaqDto) {
  const { data, error } = await this.getSupabaseClient()
    .from('faq')
    .insert(dto)
    .select()
    .single();

  if (error) throw new InternalServerErrorException('Failed to create FAQ');
  return data;
}

// 3. REFACTOR: Improve while keeping tests green
// Add proper error handling, validation, etc.
```

### 2. **Write Tests That Catch Real Issues**

```typescript
// Test configuration issues
it('should throw error when Supabase config is missing', async () => {
  configService.get.mockReturnValue(undefined);

  await expect(service.create(createFaqDto)).rejects.toThrow(
    InternalServerErrorException,
  );
});

// Test database errors
it('should handle database errors gracefully', async () => {
  mockSupabaseClient.from.mockReturnValue({
    insert: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      }),
    }),
  });

  await expect(service.create(createFaqDto)).rejects.toThrow(
    InternalServerErrorException,
  );
});
```

### 3. **Integration Tests for Real Functionality**

```typescript
describe('FaqService Integration', () => {
  it('should work with real Supabase configuration', async () => {
    // Use real config, not mocked
    const result = await service.create(createFaqDto);
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
  });
});
```

### 4. **Test Error Scenarios**

```typescript
// Test missing dependencies
it('should fail when required dependencies are missing', async () => {
  const serviceWithoutConfig = new FaqService(null);
  await expect(serviceWithoutConfig.create(createFaqDto)).rejects.toThrow();
});

// Test validation errors
it('should reject invalid input data', async () => {
  const invalidDto = { question: '', answer: '' };
  await expect(service.create(invalidDto)).rejects.toThrow();
});
```

## 🎯 **Testing Layers & Responsibilities**

### **Unit Tests (Service Layer)**

- Test business logic in isolation
- Mock external dependencies (database, APIs)
- Test data validation and transformation
- Test error handling

### **Integration Tests (Controller Layer)**

- Test HTTP endpoints with mocked services
- Test request/response handling
- Test authentication/authorization
- Test parameter binding

### **E2E Tests (Full Application)**

- Test complete user workflows
- Use real database and external services
- Test actual API endpoints
- Verify end-to-end functionality

## 🔍 **Pre-Testing Checklist**

Before writing any tests, ask:

1. **Does the service have proper error handling?**
2. **Are all required dependencies properly injected?**
3. **Is the configuration properly validated?**
4. **Are there any missing environment variables?**
5. **Does the code handle edge cases?**
6. **Are there any TypeScript errors?**
7. **Does the code work with real data?**

## 🚨 **Red Flags to Watch For**

### **In Tests:**

- Using `any` types to bypass errors
- Mocking everything instead of testing real functionality
- Changing test expectations to make them pass
- Tests that don't catch real bugs
- Tests that are too vague or generic

### **In Code:**

- Missing error handling
- Hardcoded values instead of configuration
- Missing validation
- TypeScript errors being ignored
- Dependencies not properly injected

## 📋 **Testing Workflow**

### **1. Before Writing Tests**

- [ ] Check if the service has proper error handling
- [ ] Verify all dependencies are properly injected
- [ ] Ensure configuration is properly validated
- [ ] Check for TypeScript errors
- [ ] Verify the code works with real data

### **2. Writing Tests**

- [ ] Write failing tests first (RED)
- [ ] Write minimal code to pass (GREEN)
- [ ] Refactor while keeping tests green (REFACTOR)
- [ ] Test both success and error scenarios
- [ ] Test edge cases and validation
- [ ] Use proper typing, avoid `any`

### **3. After Writing Tests**

- [ ] Run tests to ensure they fail for the right reasons
- [ ] Fix the actual code, not the tests
- [ ] Verify tests catch real issues
- [ ] Test with real data/integration
- [ ] Ensure tests are maintainable

## 🎯 **Common Mistakes to Avoid**

1. **Making tests pass by changing expectations**
2. **Using excessive mocking to hide real issues**
3. **Using `any` types to bypass TypeScript errors**
4. **Not testing error scenarios**
5. **Not testing with real data/integration**
6. **Writing tests that don't catch real bugs**
7. **Not following TDD principles**
8. **Giving false confidence with passing tests**

## 📚 **Resources**

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)
- [Unit Testing Best Practices](https://stackoverflow.com/questions/153234/how-deep-are-your-unit-tests)

---

## 🎯 **Remember: Tests Should Catch Real Issues, Not Hide Them!**

**Good tests:**

- ✅ Catch real bugs and regressions
- ✅ Document expected behavior
- ✅ Drive code quality improvements
- ✅ Give confidence in the code

**Bad tests:**

- ❌ Hide real problems
- ❌ Give false confidence
- ❌ Don't catch actual issues
- ❌ Make maintenance harder

**Always ask: "If this code is broken, will my tests catch it?"**
