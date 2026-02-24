#!/usr/bin/env node

/**
 * Documentation Link Validator
 *
 * Validates all internal links in the documentation to ensure
 * there are no broken references.
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const glob = require('glob');

const ROOT_DIR = path.join(__dirname, '..');

async function validateLinks() {
  console.log(chalk.blue.bold('\n🔗 Validating Documentation Links\n'));
  console.log(chalk.gray('═'.repeat(80)));

  // Find all markdown files
  const mdFiles = glob.sync(`${ROOT_DIR}/**/*.md`, {
    ignore: ['**/node_modules/**', '**/build/**']
  });

  let totalLinks = 0;
  let brokenLinks = 0;
  const brokenLinkDetails = [];

  // Regular expression to match markdown links
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  for (const file of mdFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const relativePath = path.relative(ROOT_DIR, file);

    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const [fullMatch, linkText, linkUrl] = match;
      totalLinks++;

      // Skip external links (http/https)
      if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
        continue;
      }

      // Skip anchor links
      if (linkUrl.startsWith('#')) {
        continue;
      }

      // Resolve the link path
      const linkPath = linkUrl.split('#')[0]; // Remove anchor
      const absoluteLinkPath = path.resolve(path.dirname(file), linkPath);

      // Check if the linked file exists
      if (!await fs.pathExists(absoluteLinkPath)) {
        brokenLinks++;
        brokenLinkDetails.push({
          file: relativePath,
          linkText,
          linkUrl,
          resolvedPath: path.relative(ROOT_DIR, absoluteLinkPath)
        });
      }
    }
  }

  console.log(chalk.cyan(`\n📄 Analyzed ${mdFiles.length} markdown files`));
  console.log(chalk.cyan(`🔗 Found ${totalLinks} total links`));

  if (brokenLinks === 0) {
    console.log(chalk.green.bold('\n✅ All links are valid!\n'));
  } else {
    console.log(chalk.red.bold(`\n❌ Found ${brokenLinks} broken links:\n`));

    brokenLinkDetails.forEach(({ file, linkText, linkUrl, resolvedPath }) => {
      console.log(chalk.yellow(`\n📄 File: ${file}`));
      console.log(chalk.white(`   Link: [${linkText}](${linkUrl})`));
      console.log(chalk.red(`   ✗ Target not found: ${resolvedPath}`));
    });

    console.log(chalk.gray('\n' + '═'.repeat(80)));
    console.log(chalk.red.bold(`\n❌ Validation failed: ${brokenLinks} broken links\n`));
    process.exit(1);
  }

  console.log(chalk.gray('═'.repeat(80)));
  console.log(chalk.gray(`\nValidated: ${new Date().toLocaleString()}\n`));
}

// Run link validation
validateLinks()
  .then(() => {
    console.log(chalk.green('✅ Link validation complete\n'));
  })
  .catch(error => {
    console.error(chalk.red('\n❌ Link validation failed:'), error);
    process.exit(1);
  });
