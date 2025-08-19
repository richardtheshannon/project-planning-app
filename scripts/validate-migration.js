/**
 * Migration Validation Script
 * Checks for dangerous operations in pending migrations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function validateMigration() {
  console.log('🔍 Validating pending migrations...');
  console.log('═'.repeat(50));
  
  try {
    // Check for pending migrations
    let status;
    try {
      status = execSync('npx prisma migrate status', { 
        encoding: 'utf8',
        shell: 'cmd.exe',
        stdio: ['pipe', 'pipe', 'pipe']
      });
    } catch (error) {
      // Status command returns non-zero when migrations are pending
      status = error.stdout || error.stderr || '';
    }
    
    if (status.includes('Database schema is up to date')) {
      console.log('✅ No pending migrations');
      return { success: true, warnings: [], errors: [] };
    }
    
    // Get migrations directory
    const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('📁 No migrations directory found');
      return { success: true, warnings: [], errors: [] };
    }
    
    // Find migration folders
    const migrations = fs.readdirSync(migrationsDir)
      .filter(f => f.match(/^\d{14}_/))
      .sort();
    
    if (migrations.length === 0) {
      console.log('📄 No migrations found');
      return { success: true, warnings: [], errors: [] };
    }
    
    // Analyze latest migration
    const latestMigration = migrations[migrations.length - 1];
    const migrationSQLPath = path.join(migrationsDir, latestMigration, 'migration.sql');
    
    if (!fs.existsSync(migrationSQLPath)) {
      console.log('⚠️  Migration SQL file not found for:', latestMigration);
      return { success: true, warnings: ['SQL file not found'], errors: [] };
    }
    
    const migrationSQL = fs.readFileSync(migrationSQLPath, 'utf8');
    
    console.log(`\n📄 Analyzing migration: ${latestMigration}`);
    console.log('─'.repeat(50));
    
    // Validation rules
    const validationRules = [
      {
        pattern: /DROP\s+TABLE/i,
        severity: 'error',
        message: 'DROP TABLE detected - this will permanently delete table and all data!'
      },
      {
        pattern: /DROP\s+DATABASE/i,
        severity: 'error',
        message: 'DROP DATABASE detected - this will destroy entire database!'
      },
      {
        pattern: /TRUNCATE/i,
        severity: 'error',
        message: 'TRUNCATE detected - this will delete all data in table!'
      },
      {
        pattern: /DROP\s+COLUMN/i,
        severity: 'warning',
        message: 'DROP COLUMN detected - ensure data is backed up'
      },
      {
        pattern: /ALTER\s+TABLE\s+\w+\s+MODIFY/i,
        severity: 'warning',
        message: 'Column modification detected - verify data compatibility'
      },
      {
        pattern: /DELETE\s+FROM/i,
        severity: 'warning',
        message: 'DELETE operation detected - verify this is intentional'
      },
      {
        pattern: /ALTER\s+TABLE\s+\w+\s+RENAME/i,
        severity: 'warning',
        message: 'Table rename detected - update all references'
      }
    ];
    
    const errors = [];
    const warnings = [];
    
    // Check each rule
    validationRules.forEach(rule => {
      if (rule.pattern.test(migrationSQL)) {
        const icon = rule.severity === 'error' ? '❌' : '⚠️';
        console.log(`${icon} ${rule.message}`);
        
        if (rule.severity === 'error') {
          errors.push(rule.message);
        } else {
          warnings.push(rule.message);
        }
      }
    });
    
    // Summary
    console.log('\n' + '═'.repeat(50));
    if (errors.length > 0) {
      console.error(`\n❌ VALIDATION FAILED: ${errors.length} error(s) found`);
      console.log('Fix these issues before proceeding.');
      process.exit(1);
    } else if (warnings.length > 0) {
      console.log(`\n⚠️  VALIDATION PASSED WITH WARNINGS: ${warnings.length} warning(s)`);
      console.log('Review warnings and ensure you have backups.');
    } else {
      console.log('\n✅ VALIDATION PASSED: Migration looks safe!');
    }
    
    return { success: errors.length === 0, warnings, errors };
    
  } catch (error) {
    console.error('❌ Validation script error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  validateMigration();
}

module.exports = { validateMigration };