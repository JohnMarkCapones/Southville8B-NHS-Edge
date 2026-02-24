# Quick Start Guide - Technical Documentation

This guide helps you get started with the Southville 8B NHS Edge Technical Documentation system.

---

## 📚 For Readers

### Viewing Documentation

The documentation is organized into 8 volumes plus appendices. Each volume focuses on a specific aspect of the system.

#### Browse on GitHub
Simply navigate through the markdown files in your browser on GitHub. Start with:
- [README.md](./README.md) - Main documentation index
- [Volume 1: System Overview](./volume-1-system-overview/) - Understanding the system

#### Generate PDF
```bash
# Navigate to documentation directory
cd docs/technical-manual

# Install dependencies
npm install

# Build all PDFs
npm run build:pdf

# Or build specific volume
npm run build:pdf:volume1
```

PDFs will be generated in `build/pdf/` directory.

#### View as HTML Website
```bash
# Navigate to documentation directory
cd docs/technical-manual

# Install dependencies
npm install

# Build HTML site
npm run build:html

# Serve locally
npm run serve:html
```

Visit `http://localhost:8080` in your browser.

---

## ✍️ For Documentation Writers

### Prerequisites
- Node.js 18+ installed
- Git installed
- Text editor (VS Code recommended)

### Setup

1. **Navigate to documentation directory:**
   ```bash
   cd docs/technical-manual
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify setup:**
   ```bash
   npm run stats
   ```

### Writing Documentation

#### Creating a New Chapter

1. Navigate to the appropriate volume directory:
   ```bash
   cd volume-1-system-overview
   ```

2. Create a new markdown file:
   ```bash
   # Use descriptive names with numbers
   touch 04-new-chapter.md
   ```

3. Use the chapter template:
   ```markdown
   # Chapter Number. Chapter Title

   **Last Updated:** YYYY-MM-DD
   **Status:** 🚧 In Progress | ✅ Complete | 📋 Planned

   ---

   ## Section 1

   Content here...

   ---

   ## Navigation

   - [← Previous: Chapter Title](./previous-chapter.md)
   - [Next: Chapter Title →](./next-chapter.md)
   - [↑ Back to Volume Index](./README.md)
   ```

#### Markdown Guidelines

**Headers:**
```markdown
# H1 - Chapter Title
## H2 - Major Section
### H3 - Subsection
#### H4 - Detail Section
```

**Code Blocks:**
````markdown
```typescript
// TypeScript example
const greeting: string = "Hello";
```
````

**Tables:**
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
```

**Admonitions:**
```markdown
> **Note:** General information

> **Important:** Critical information

> **Warning:** Potential issues

> **Tip:** Best practices
```

**Links:**
```markdown
[Internal Link](./other-file.md)
[External Link](https://example.com)
```

**Images:**
```markdown
![Alt text](./diagrams/image.png)
```

### Building Documentation

#### Check Statistics
```bash
npm run stats
```

Shows word count, file count, and estimated reading time.

#### Validate Links
```bash
npm run validate
```

Checks for broken internal links.

#### Lint Markdown
```bash
npm run lint:docs
```

Checks markdown formatting.

#### Build PDFs
```bash
npm run build:pdf
```

Generates PDF versions of all documentation.

#### Build HTML Site
```bash
npm run build:html
npm run serve:html
```

Creates and serves an HTML documentation site.

---

## 🔧 For Maintainers

### Documentation Structure

```
technical-manual/
├── README.md                    # Main index
├── QUICK_START.md              # This file
├── package.json                # Build tools
├── pdf-config.json             # PDF generation config
│
├── scripts/                    # Build scripts
│   ├── build-pdf.js           # PDF builder
│   ├── build-html.js          # HTML builder
│   ├── doc-stats.js           # Statistics generator
│   └── validate-links.js      # Link validator
│
├── volume-1-system-overview/   # Volume 1
│   ├── README.md              # Volume index
│   ├── 01-executive-summary.md
│   ├── 02-system-overview.md
│   └── ...
│
├── volume-2-installation/      # Volume 2
├── volume-3-developer-guide/   # Volume 3
├── ...                         # Other volumes
│
└── appendices/                 # Appendices
    └── ...
```

### Adding a New Volume

1. Create volume directory:
   ```bash
   mkdir volume-X-name
   cd volume-X-name
   ```

2. Create volume README:
   ```bash
   touch README.md
   ```

3. Add chapters as needed

4. Update main README.md to include new volume

### Version Management

Update version information in:
- `package.json` - Increment version number
- `README.md` - Update version and date
- `volume-1-system-overview/01-executive-summary.md` - Update change log

### Publishing Updates

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "docs: update technical documentation"
   ```

2. **Build artifacts:**
   ```bash
   npm run build:all
   ```

3. **Verify builds:**
   ```bash
   npm run validate
   npm run stats
   ```

4. **Push to repository:**
   ```bash
   git push origin main
   ```

---

## 📋 Common Tasks

### Add a New Diagram
1. Create diagram (use draw.io, Mermaid, or other tools)
2. Save to appropriate `diagrams/` folder
3. Reference in markdown:
   ```markdown
   ![Diagram Description](./diagrams/diagram-name.png)
   ```

### Update Existing Content
1. Edit the markdown file
2. Update "Last Updated" date
3. Validate links: `npm run validate`
4. Rebuild: `npm run build:all`

### Fix Broken Links
1. Run link checker: `npm run validate`
2. Fix reported broken links
3. Revalidate: `npm run validate`

### Generate Full Documentation Package
```bash
# Install dependencies
npm install

# Build everything
npm run build:all

# Check statistics
npm run stats

# Validate
npm run validate
```

---

## 🆘 Troubleshooting

### Build Errors

**Issue:** `npm install` fails
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Issue:** PDF generation fails
```bash
# Solution: Install dependencies manually
npm install -g md-to-pdf puppeteer
```

**Issue:** Link validation fails
```bash
# Solution: Check the reported links and fix them
# Links should be relative: ./other-file.md
# Not absolute: /full/path/to/file.md
```

### Common Mistakes

1. **Broken links**: Use relative paths, not absolute
2. **Missing navigation**: Always include navigation footer
3. **Inconsistent formatting**: Use the chapter template
4. **Large images**: Optimize images before adding (< 500KB)

---

## 📞 Getting Help

- **Documentation Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Questions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Style Guide**: See [Appendix H: Contributing Guidelines](./appendices/H-contributing-guidelines.md)

---

## 🎯 Next Steps

### For Readers
1. Start with [README.md](./README.md)
2. Choose the volume relevant to your role
3. Navigate through chapters sequentially

### For Writers
1. Read the chapter template
2. Review existing chapters for style consistency
3. Start writing!

### For Maintainers
1. Set up build tools: `npm install`
2. Review current statistics: `npm run stats`
3. Plan documentation improvements

---

**Happy Documenting! 📚**
