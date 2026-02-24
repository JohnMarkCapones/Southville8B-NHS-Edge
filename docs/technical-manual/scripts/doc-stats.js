#!/usr/bin/env node

/**
 * Documentation Statistics Generator
 *
 * Analyzes the documentation and provides statistics about:
 * - Total number of files
 * - Word count per volume
 * - Completion status
 * - Missing sections
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const glob = require('glob');

const ROOT_DIR = path.join(__dirname, '..');

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

function countWords(text) {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

async function analyzeVolume(volumePath) {
  const mdFiles = glob.sync(`${volumePath}/**/*.md`);

  let totalWords = 0;
  let totalFiles = mdFiles.length;
  let totalLines = 0;

  for (const file of mdFiles) {
    const content = await fs.readFile(file, 'utf-8');
    totalWords += countWords(content);
    totalLines += content.split('\n').length;
  }

  return {
    files: totalFiles,
    words: totalWords,
    lines: totalLines,
    avgWordsPerFile: totalFiles > 0 ? Math.round(totalWords / totalFiles) : 0
  };
}

async function generateStats() {
  console.log(chalk.blue.bold('\n📊 Documentation Statistics\n'));
  console.log(chalk.gray('═'.repeat(80)));

  let grandTotalFiles = 0;
  let grandTotalWords = 0;
  let grandTotalLines = 0;

  const volumeStats = [];

  for (const volume of VOLUMES) {
    const volumePath = path.join(ROOT_DIR, volume);

    if (!await fs.pathExists(volumePath)) {
      console.log(chalk.yellow(`⚠️  ${volume}: Directory not found`));
      continue;
    }

    const stats = await analyzeVolume(volumePath);

    grandTotalFiles += stats.files;
    grandTotalWords += stats.words;
    grandTotalLines += stats.lines;

    volumeStats.push({
      name: volume,
      ...stats
    });

    const volumeName = volume
      .replace(/^volume-\d+-/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    console.log(chalk.cyan(`\n📖 ${volumeName}`));
    console.log(chalk.gray('─'.repeat(80)));
    console.log(`   Files:           ${chalk.white(stats.files)}`);
    console.log(`   Words:           ${chalk.white(stats.words.toLocaleString())}`);
    console.log(`   Lines:           ${chalk.white(stats.lines.toLocaleString())}`);
    console.log(`   Avg Words/File:  ${chalk.white(stats.avgWordsPerFile.toLocaleString())}`);

    // Estimate reading time (average reading speed: 200 words/minute)
    const readingTime = Math.ceil(stats.words / 200);
    console.log(`   Reading Time:    ${chalk.white(`~${readingTime} minutes`)}`);
  }

  console.log(chalk.gray('\n' + '═'.repeat(80)));
  console.log(chalk.bold.green('\n📊 Grand Total'));
  console.log(chalk.gray('─'.repeat(80)));
  console.log(`   Total Files:     ${chalk.white.bold(grandTotalFiles)}`);
  console.log(`   Total Words:     ${chalk.white.bold(grandTotalWords.toLocaleString())}`);
  console.log(`   Total Lines:     ${chalk.white.bold(grandTotalLines.toLocaleString())}`);

  const totalReadingTime = Math.ceil(grandTotalWords / 200);
  const hours = Math.floor(totalReadingTime / 60);
  const minutes = totalReadingTime % 60;
  console.log(`   Total Reading:   ${chalk.white.bold(`~${hours}h ${minutes}m`)}`);

  console.log(chalk.gray('\n' + '═'.repeat(80)));

  // Calculate completion percentage (based on expected vs actual files)
  const expectedFilesPerVolume = 10; // Average expected files per volume
  const expectedTotalFiles = VOLUMES.length * expectedFilesPerVolume;
  const completionPercentage = Math.min(100, Math.round((grandTotalFiles / expectedTotalFiles) * 100));

  console.log(chalk.bold.blue(`\n📈 Estimated Completion: ${completionPercentage}%`));

  // Generate bar chart
  const barLength = 50;
  const filledLength = Math.round((completionPercentage / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  console.log(chalk.green(`   [${bar}] ${completionPercentage}%`));

  console.log(chalk.gray('\n' + '═'.repeat(80)));
  console.log(chalk.gray(`\nGenerated: ${new Date().toLocaleString()}\n`));
}

// Run statistics generation
generateStats()
  .then(() => {
    console.log(chalk.green('✅ Statistics generated successfully\n'));
  })
  .catch(error => {
    console.error(chalk.red('\n❌ Failed to generate statistics:'), error);
    process.exit(1);
  });
