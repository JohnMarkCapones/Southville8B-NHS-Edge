#!/usr/bin/env node

/**
 * HTML Documentation Builder
 *
 * This script converts markdown documentation to HTML with
 * navigation, styling, and search functionality.
 */

const fs = require('fs-extra');
const path = require('path');
const MarkdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItToc = require('markdown-it-toc-done-right');
const chalk = require('chalk');
const glob = require('glob');

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    return `<pre class="language-${lang}"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
})
  .use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink()
  })
  .use(markdownItToc, {
    level: [1, 2, 3],
    listType: 'ul'
  });

const VOLUMES = [
  'volume-1-system-overview',
  'volume-2-installation',
  'volume-3-developer-guide',
  'volume-4-feature-documentation',
  'volume-5-api-integration',
  'volume-6-user-guides',
  'volume-7-maintenance',
  'volume-8-security',
  'appendices'
];

const OUTPUT_DIR = path.join(__dirname, '..', 'build', 'html');
const ROOT_DIR = path.join(__dirname, '..');

// HTML Template
const getHTMLTemplate = (title, content, navigation) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Southville 8B NHS Edge Documentation</title>
  <link rel="stylesheet" href="/styles/documentation.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
</head>
<body>
  <div class="documentation-container">
    <aside class="sidebar">
      <div class="logo">
        <h1>📚 Southville 8B</h1>
        <p>Technical Documentation</p>
      </div>
      <nav class="navigation">
        ${navigation}
      </nav>
    </aside>
    <main class="content">
      <div class="content-wrapper">
        ${content}
      </div>
    </main>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-jsx.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-tsx.min.js"></script>
  <script src="/scripts/documentation.js"></script>
</body>
</html>
`;

// Generate navigation HTML
function generateNavigation(volumes) {
  let nav = '<ul class="nav-list">';

  volumes.forEach(volume => {
    const volumeName = volume
      .replace(/^volume-\d+-/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    nav += `
      <li class="nav-item">
        <a href="/${volume}/index.html">${volumeName}</a>
      </li>
    `;
  });

  nav += '</ul>';
  return nav;
}

async function buildHTML() {
  console.log(chalk.blue('🌐 Building HTML Documentation...\n'));

  // Create output directory
  await fs.ensureDir(OUTPUT_DIR);

  const navigation = generateNavigation(VOLUMES);
  let successCount = 0;
  let errorCount = 0;

  for (const volume of VOLUMES) {
    const volumePath = path.join(ROOT_DIR, volume);

    // Check if volume directory exists
    if (!await fs.pathExists(volumePath)) {
      console.log(chalk.yellow(`⚠️  Skipping ${volume} (directory not found)`));
      continue;
    }

    console.log(chalk.cyan(`📖 Building ${volume}...`));

    try {
      // Find all markdown files in the volume
      const mdFiles = glob.sync(`${volumePath}/**/*.md`);

      if (mdFiles.length === 0) {
        console.log(chalk.yellow(`  ⚠️  No markdown files found in ${volume}`));
        continue;
      }

      // Build HTML for each markdown file
      for (const mdFile of mdFiles) {
        const relativePath = path.relative(volumePath, mdFile);
        const outputFileName = relativePath.replace(/\.md$/, '.html');
        const outputPath = path.join(OUTPUT_DIR, volume, outputFileName);

        await fs.ensureDir(path.dirname(outputPath));

        try {
          // Read markdown file
          const markdownContent = await fs.readFile(mdFile, 'utf-8');

          // Convert to HTML
          const htmlContent = md.render(markdownContent);

          // Get title from first h1 or filename
          const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
          const title = titleMatch ? titleMatch[1] : path.basename(mdFile, '.md');

          // Generate complete HTML page
          const fullHTML = getHTMLTemplate(title, htmlContent, navigation);

          // Write HTML file
          await fs.writeFile(outputPath, fullHTML);

          console.log(chalk.green(`  ✓ ${relativePath}`));
          successCount++;
        } catch (error) {
          console.log(chalk.red(`  ✗ ${relativePath}: ${error.message}`));
          errorCount++;
        }
      }

      console.log(chalk.green(`✅ ${volume} complete\n`));
    } catch (error) {
      console.log(chalk.red(`❌ Error building ${volume}: ${error.message}\n`));
      errorCount++;
    }
  }

  // Copy styles and scripts
  await copyAssets();

  // Generate index page
  await generateIndexPage(navigation);

  // Print summary
  console.log(chalk.bold('\n📊 Build Summary:'));
  console.log(chalk.green(`  ✓ Successful: ${successCount}`));
  if (errorCount > 0) {
    console.log(chalk.red(`  ✗ Errors: ${errorCount}`));
  }
  console.log(chalk.blue(`\n📁 Output directory: ${OUTPUT_DIR}`));

  return { successCount, errorCount };
}

async function copyAssets() {
  console.log(chalk.cyan('\n📦 Copying assets...'));

  // Create styles directory
  const stylesDir = path.join(OUTPUT_DIR, 'styles');
  await fs.ensureDir(stylesDir);

  // Create basic CSS
  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .documentation-container { display: flex; min-height: 100vh; }
    .sidebar { width: 280px; background: #1E293B; color: white; padding: 20px; overflow-y: auto; }
    .logo { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #334155; }
    .logo h1 { font-size: 24px; margin-bottom: 5px; }
    .logo p { font-size: 14px; color: #94A3B8; }
    .nav-list { list-style: none; }
    .nav-item { margin-bottom: 10px; }
    .nav-item a { color: #E2E8F0; text-decoration: none; display: block; padding: 8px 12px; border-radius: 6px; transition: all 0.2s; }
    .nav-item a:hover { background: #334155; color: white; }
    .content { flex: 1; padding: 40px; max-width: 1200px; }
    .content-wrapper { max-width: 900px; }
    h1 { color: #2563EB; border-bottom: 3px solid #2563EB; padding-bottom: 10px; margin-bottom: 20px; }
    h2 { color: #1E40AF; border-bottom: 2px solid #DBEAFE; padding-bottom: 8px; margin-top: 40px; margin-bottom: 20px; }
    h3 { color: #1E3A8A; margin-top: 30px; margin-bottom: 15px; }
    code { background: #F3F4F6; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 14px; }
    pre { background: #1F2937; color: #F9FAFB; padding: 20px; border-radius: 8px; overflow-x: auto; margin: 20px 0; }
    pre code { background: transparent; color: #F9FAFB; padding: 0; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #E5E7EB; padding: 12px; text-align: left; }
    th { background: #2563EB; color: white; font-weight: 600; }
    tr:nth-child(even) { background: #F9FAFB; }
    blockquote { border-left: 4px solid #2563EB; padding-left: 20px; margin: 20px 0; color: #6B7280; font-style: italic; }
    img { max-width: 100%; height: auto; border-radius: 8px; margin: 20px 0; }
    a { color: #2563EB; text-decoration: none; }
    a:hover { text-decoration: underline; }
  `;

  await fs.writeFile(path.join(stylesDir, 'documentation.css'), css);

  // Create scripts directory
  const scriptsDir = path.join(OUTPUT_DIR, 'scripts');
  await fs.ensureDir(scriptsDir);

  const js = `
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Highlight current page in navigation
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-item a').forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.style.background = '#334155';
        link.style.color = 'white';
      }
    });
  `;

  await fs.writeFile(path.join(scriptsDir, 'documentation.js'), js);

  console.log(chalk.green('✅ Assets copied'));
}

async function generateIndexPage(navigation) {
  console.log(chalk.cyan('\n📝 Generating index page...'));

  const indexContent = `
    <h1>Southville 8B NHS Edge - Technical Documentation</h1>
    <p class="lead">Welcome to the comprehensive technical documentation for the Southville 8B National High School Digital Portal.</p>

    <h2>📚 Documentation Volumes</h2>
    <div class="volume-grid">
      ${VOLUMES.map(volume => {
        const volumeName = volume
          .replace(/^volume-\d+-/, '')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        return `
          <div class="volume-card">
            <h3><a href="/${volume}/README.html">${volumeName}</a></h3>
          </div>
        `;
      }).join('')}
    </div>
  `;

  const fullHTML = getHTMLTemplate('Home', indexContent, navigation);
  await fs.writeFile(path.join(OUTPUT_DIR, 'index.html'), fullHTML);

  console.log(chalk.green('✅ Index page generated'));
}

// Run the build
buildHTML()
  .then(({ successCount, errorCount }) => {
    if (errorCount > 0) {
      process.exit(1);
    }
    console.log(chalk.green('\n✅ HTML build complete!'));
    console.log(chalk.blue('\n💡 Run "npm run serve:html" to preview the documentation'));
  })
  .catch(error => {
    console.error(chalk.red('\n❌ HTML build failed:'), error);
    process.exit(1);
  });
