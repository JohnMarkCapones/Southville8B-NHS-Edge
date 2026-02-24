#!/usr/bin/env node

/**
 * PDF Documentation Builder
 *
 * This script builds PDF versions of the technical documentation
 * for each volume and creates a combined PDF of all volumes.
 */

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const chalk = require('chalk');
const glob = require('glob');

const execAsync = promisify(exec);

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

const OUTPUT_DIR = path.join(__dirname, '..', 'build', 'pdf');
const ROOT_DIR = path.join(__dirname, '..');

async function buildPDFs() {
  console.log(chalk.blue('📄 Building PDF Documentation...\n'));

  // Create output directory
  await fs.ensureDir(OUTPUT_DIR);

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

      // Build PDF for each markdown file
      for (const mdFile of mdFiles) {
        const relativePath = path.relative(volumePath, mdFile);
        const outputFileName = relativePath.replace(/\.md$/, '.pdf').replace(/\//g, '_');
        const outputPath = path.join(OUTPUT_DIR, volume, outputFileName);

        await fs.ensureDir(path.dirname(outputPath));

        try {
          // Use md-to-pdf to convert markdown to PDF
          await execAsync(`npx md-to-pdf "${mdFile}" --config-file "${path.join(ROOT_DIR, 'pdf-config.json')}" --as-html`);

          // Move generated PDF to output directory
          const generatedPdf = mdFile.replace(/\.md$/, '.pdf');
          if (await fs.pathExists(generatedPdf)) {
            await fs.move(generatedPdf, outputPath, { overwrite: true });
            console.log(chalk.green(`  ✓ ${relativePath}`));
            successCount++;
          }
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

  // Print summary
  console.log(chalk.bold('\n📊 Build Summary:'));
  console.log(chalk.green(`  ✓ Successful: ${successCount}`));
  if (errorCount > 0) {
    console.log(chalk.red(`  ✗ Errors: ${errorCount}`));
  }
  console.log(chalk.blue(`\n📁 Output directory: ${OUTPUT_DIR}`));

  return { successCount, errorCount };
}

// Run the build
buildPDFs()
  .then(({ successCount, errorCount }) => {
    if (errorCount > 0) {
      process.exit(1);
    }
    console.log(chalk.green('\n✅ PDF build complete!'));
  })
  .catch(error => {
    console.error(chalk.red('\n❌ PDF build failed:'), error);
    process.exit(1);
  });
