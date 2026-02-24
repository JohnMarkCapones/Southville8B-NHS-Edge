# Contributing to Technical Documentation

Thank you for your interest in improving the Southville 8B NHS Edge technical documentation! This guide will help you contribute effectively.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Documentation Standards](#documentation-standards)
3. [Contribution Workflow](#contribution-workflow)
4. [Writing Guidelines](#writing-guidelines)
5. [Review Process](#review-process)
6. [Style Guide](#style-guide)

---

## 🚀 Getting Started

### Prerequisites

- Git installed and configured
- Node.js 18+ installed
- Text editor (VS Code recommended)
- Basic knowledge of Markdown

### Setup

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/southville-8b-nhs-edge.git
   cd southville-8b-nhs-edge/docs/technical-manual
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a feature branch:**
   ```bash
   git checkout -b docs/your-feature-name
   ```

---

## 📐 Documentation Standards

### File Organization

- Place files in the appropriate volume directory
- Use descriptive, kebab-case filenames
- Number chapters sequentially (e.g., `01-`, `02-`)
- Include navigation links at the bottom

### Markdown Format

#### Front Matter
Every chapter should start with:
```markdown
# Chapter Number. Chapter Title

**Last Updated:** YYYY-MM-DD
**Status:** 🚧 In Progress | ✅ Complete | 📋 Planned | 🔄 Under Review

---
```

#### Navigation Footer
Every chapter should end with:
```markdown
---

## Navigation

- [← Previous: Chapter Title](./previous-chapter.md)
- [Next: Chapter Title →](./next-chapter.md)
- [↑ Back to Volume Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
```

### Chapter Structure

1. **Title and Metadata**
2. **Table of Contents** (for long chapters)
3. **Content Sections**
4. **Summary** (optional)
5. **Navigation Footer**

---

## 🔄 Contribution Workflow

### 1. Choose What to Contribute

- **Fix errors**: Typos, broken links, outdated information
- **Expand content**: Add missing sections, examples, diagrams
- **New chapters**: Write new documentation sections
- **Improve clarity**: Rewrite confusing sections

### 2. Make Your Changes

```bash
# Create feature branch
git checkout -b docs/improve-architecture-section

# Make your changes
# Edit files in your text editor

# Test your changes
npm run validate     # Check for broken links
npm run lint:docs    # Check markdown formatting
npm run build:pdf    # Test PDF generation
```

### 3. Commit Your Changes

Follow conventional commit format:

```bash
git add .
git commit -m "docs(volume-1): improve architecture diagrams"
```

**Commit message format:**
```
docs(<scope>): <description>

[optional body]

[optional footer]
```

**Scopes:**
- `volume-1` - System Overview
- `volume-2` - Installation
- `volume-3` - Developer Guide
- `volume-4` - Feature Documentation
- `volume-5` - API Integration
- `volume-6` - User Guides
- `volume-7` - Maintenance
- `volume-8` - Security
- `appendices` - Appendices
- `tooling` - Documentation build tools
- `general` - General documentation

**Examples:**
```bash
docs(volume-1): add system architecture diagrams
docs(volume-3): update TypeScript guidelines
docs(tooling): improve PDF generation script
docs(general): fix broken links across all volumes
```

### 4. Push and Create Pull Request

```bash
# Push to your fork
git push origin docs/your-feature-name

# Create pull request on GitHub
# Provide clear description of changes
```

---

## ✍️ Writing Guidelines

### Tone and Voice

- **Clear and Concise**: Use simple, direct language
- **Professional**: Maintain technical professionalism
- **Consistent**: Follow established patterns
- **Helpful**: Anticipate reader questions

### Audience Awareness

Consider your audience when writing:

| Audience | Tone | Detail Level | Technical Terms |
|----------|------|--------------|-----------------|
| Developers | Technical, practical | High | Yes |
| Administrators | Professional, procedural | Medium | Some |
| End Users | Friendly, instructional | Low | Minimal |
| Executives | Strategic, high-level | Very Low | Rarely |

### Code Examples

#### Good Example
```typescript
// Good: Complete, runnable example with context
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  );
}
```

#### Bad Example
```typescript
// Bad: Incomplete, no context
const [count, setCount] = useState(0);
<Button onClick={() => setCount(count + 1)}>Increment</Button>
```

### Diagrams and Images

1. **Create diagrams using:**
   - Draw.io / diagrams.net
   - Mermaid (for text-based diagrams)
   - Lucidchart
   - PlantUML

2. **Save diagrams:**
   - PNG format for raster images
   - SVG format when possible
   - Keep file size < 500KB
   - Use descriptive filenames

3. **Place in appropriate directory:**
   ```
   volume-X-name/
   └── diagrams/
       └── architecture-diagram.png
   ```

4. **Reference in markdown:**
   ```markdown
   ![Architecture Diagram](./diagrams/architecture-diagram.png)
   *Figure 1: System Architecture Overview*
   ```

### Tables

Use tables for structured data:

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
```

**Guidelines:**
- Keep tables simple and readable
- Use header row
- Align columns for readability in source
- Consider breaking complex tables into multiple tables

### Lists

**Ordered Lists** - For sequential steps:
```markdown
1. First step
2. Second step
3. Third step
```

**Unordered Lists** - For non-sequential items:
```markdown
- Item one
- Item two
- Item three
```

**Nested Lists**:
```markdown
1. Main item
   - Sub-item A
   - Sub-item B
2. Another main item
   - Sub-item C
```

---

## 🔍 Review Process

### Before Submitting

Run these checks:

```bash
# Validate links
npm run validate

# Check markdown formatting
npm run lint:docs

# Generate statistics
npm run stats

# Build PDFs to test
npm run build:pdf

# Build HTML to preview
npm run build:html
npm run serve:html
```

### Pull Request Checklist

- [ ] Content is accurate and up-to-date
- [ ] No broken links (verified with `npm run validate`)
- [ ] Markdown is properly formatted (checked with `npm run lint:docs`)
- [ ] Code examples are tested and work correctly
- [ ] Images are optimized and properly referenced
- [ ] Navigation links are correct
- [ ] "Last Updated" date is current
- [ ] Commit messages follow conventional format
- [ ] Changes are described in PR description

### Review Criteria

Reviewers will check:

1. **Accuracy**: Is the information correct?
2. **Completeness**: Are all necessary details included?
3. **Clarity**: Is it easy to understand?
4. **Consistency**: Does it match existing style?
5. **Grammar**: No spelling or grammatical errors?
6. **Links**: All links work correctly?
7. **Examples**: Code examples are valid?

---

## 📝 Style Guide

### Headings

```markdown
# H1 - Chapter Title (One per file)
## H2 - Major Section
### H3 - Subsection
#### H4 - Detail Section
```

**Rules:**
- Only one H1 per file
- Don't skip heading levels
- Use sentence case (not Title Case)

### Emphasis

```markdown
**Bold** - Important terms, strong emphasis
*Italic* - Variables, parameters, light emphasis
`Code` - Code, commands, file names
```

### Code Blocks

Specify language for syntax highlighting:

````markdown
```typescript
const greeting: string = "Hello";
```

```bash
npm run dev
```

```json
{
  "name": "example"
}
```
````

### Links

```markdown
[Link Text](./relative-path.md)         # Internal links (relative)
[Link Text](https://example.com)        # External links (absolute)
[Link Text](#section-anchor)            # Anchor links (same page)
```

### Admonitions

```markdown
> **Note:** General information and helpful tips

> **Important:** Critical information that must not be overlooked

> **Warning:** Potential issues or risks

> **Tip:** Best practices and recommendations
```

### File References

Reference files with line numbers when applicable:

```markdown
See `frontend-nextjs/app/page.tsx:15` for implementation.
```

### Version Numbers

Use consistent version format:

```markdown
- Next.js 15.x (major.minor.x for any patch)
- TypeScript 5.3.2 (major.minor.patch for specific version)
```

---

## 🎯 Common Contribution Scenarios

### Fixing a Typo

```bash
# 1. Create branch
git checkout -b docs/fix-typo-in-architecture

# 2. Fix the typo in the file
# Edit the file

# 3. Commit and push
git add .
git commit -m "docs(volume-1): fix typo in architecture section"
git push origin docs/fix-typo-in-architecture

# 4. Create pull request
```

### Adding a New Section

```bash
# 1. Create branch
git checkout -b docs/add-deployment-section

# 2. Create or edit file
# Add new content following chapter template

# 3. Update table of contents in volume README
# Edit volume-X/README.md

# 4. Validate and build
npm run validate
npm run build:pdf

# 5. Commit and push
git add .
git commit -m "docs(volume-2): add deployment section"
git push origin docs/add-deployment-section

# 6. Create pull request with description
```

### Updating Diagrams

```bash
# 1. Create branch
git checkout -b docs/update-architecture-diagram

# 2. Update diagram source file (e.g., .drawio file)
# 3. Export to PNG/SVG
# 4. Place in diagrams folder
# 5. Update references in markdown

# 6. Commit and push
git add .
git commit -m "docs(volume-1): update architecture diagram"
git push origin docs/update-architecture-diagram
```

---

## 🏆 Recognition

Contributors will be acknowledged in:
- [README.md](./README.md) - Contributors section
- [Appendix J: Change Log](./appendices/J-changelog-release-notes.md) - Version history

---

## 📞 Questions?

- **Documentation Questions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Style Questions**: Review existing chapters for examples

---

**Thank you for contributing to better documentation! 🎉**
