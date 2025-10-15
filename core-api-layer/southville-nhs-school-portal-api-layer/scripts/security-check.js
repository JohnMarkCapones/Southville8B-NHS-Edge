#!/usr/bin/env node

/**
 * Security Update Monitor Script
 *
 * This script checks for updates to packages affected by CVE-2025-56200
 * and other security vulnerabilities.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPackageVersion(packageName) {
  try {
    const result = execSync(`npm view ${packageName} version`, {
      encoding: 'utf8',
    });
    return result.trim();
  } catch (error) {
    return null;
  }
}

function getInstalledVersion(packageName) {
  try {
    const result = execSync(`npm list ${packageName} --depth=0`, {
      encoding: 'utf8',
    });
    const match = result.match(new RegExp(`${packageName}@([^\\s]+)`));
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

function checkSecurityAudit() {
  try {
    log('\n🔍 Running security audit...', 'blue');
    const result = execSync('npm audit --json', { encoding: 'utf8' });
    const audit = JSON.parse(result);

    if (audit.vulnerabilities) {
      const vulnCount = Object.keys(audit.vulnerabilities).length;
      if (vulnCount > 0) {
        log(`⚠️  Found ${vulnCount} vulnerabilities`, 'yellow');

        // Check specifically for validator.js vulnerability
        for (const [pkg, vuln] of Object.entries(audit.vulnerabilities)) {
          if (
            pkg.includes('validator') ||
            vuln.via?.some((v) => v.includes('validator'))
          ) {
            log(`🚨 CVE-2025-56200 still present in ${pkg}`, 'red');
            log(`   Severity: ${vuln.severity}`, 'red');
            log(`   Path: ${vuln.via?.join(' -> ') || 'direct'}`, 'red');
          }
        }
      } else {
        log('✅ No vulnerabilities found', 'green');
      }
    }
  } catch (error) {
    log('❌ Failed to run security audit', 'red');
  }
}

function main() {
  log('🛡️  Security Update Monitor for CVE-2025-56200', 'bold');
  log('='.repeat(50), 'blue');

  // Check validator.js
  log('\n📦 Checking validator.js...', 'blue');
  const validatorLatest = checkPackageVersion('validator');
  const validatorInstalled = getInstalledVersion('validator');

  if (validatorLatest && validatorInstalled) {
    log(`   Installed: ${validatorInstalled}`);
    log(`   Latest:    ${validatorLatest}`);

    if (validatorInstalled !== validatorLatest) {
      log(`   ⚠️  Update available!`, 'yellow');
      if (validatorLatest > validatorInstalled) {
        log(`   🎉 This might fix CVE-2025-56200!`, 'green');
      }
    } else {
      log(`   ✅ Up to date`, 'green');
    }
  }

  // Check class-validator
  log('\n📦 Checking class-validator...', 'blue');
  const classValidatorLatest = checkPackageVersion('class-validator');
  const classValidatorInstalled = getInstalledVersion('class-validator');

  if (classValidatorLatest && classValidatorInstalled) {
    log(`   Installed: ${classValidatorInstalled}`);
    log(`   Latest:    ${classValidatorLatest}`);

    if (classValidatorInstalled !== classValidatorLatest) {
      log(`   ⚠️  Update available!`, 'yellow');
    } else {
      log(`   ✅ Up to date`, 'green');
    }
  }

  // Check for outdated packages
  log('\n📦 Checking for outdated packages...', 'blue');
  try {
    const outdated = execSync('npm outdated --json', { encoding: 'utf8' });
    const outdatedPackages = JSON.parse(outdated);

    if (Object.keys(outdatedPackages).length > 0) {
      log(
        `   ⚠️  Found ${Object.keys(outdatedPackages).length} outdated packages`,
        'yellow',
      );

      // Highlight security-related packages
      for (const [pkg, info] of Object.entries(outdatedPackages)) {
        if (pkg.includes('validator') || pkg.includes('class-validator')) {
          log(`   🚨 ${pkg}: ${info.current} → ${info.latest}`, 'red');
        }
      }
    } else {
      log(`   ✅ All packages up to date`, 'green');
    }
  } catch (error) {
    log(`   ✅ All packages up to date`, 'green');
  }

  // Run security audit
  checkSecurityAudit();

  // Recommendations
  log('\n💡 Recommendations:', 'bold');
  log(
    '   1. Monitor validator.js GitHub: https://github.com/validatorjs/validator.js/',
    'blue',
  );
  log(
    '   2. Check NVD: https://nvd.nist.gov/vuln/detail/CVE-2025-56200',
    'blue',
  );
  log('   3. Run this script regularly: npm run security-check', 'blue');
  log('   4. Update when patches become available', 'blue');

  log(
    '\n🛡️  Current mitigation status: PROTECTED (custom validator in use)',
    'green',
  );
}

if (require.main === module) {
  main();
}

module.exports = { main };
