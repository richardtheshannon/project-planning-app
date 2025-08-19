/**
 * Project Structure Analysis Script
 * Analyzes current project structure and identifies issues
 */

const fs = require('fs');
const path = require('path');

function analyzeStructure() {
  console.log('📊 Analyzing Project Structure...');
  console.log('═'.repeat(50));
  
  const projectRoot = path.join(__dirname, '..');
  const issues = [];
  const suggestions = [];
  
  // Check for large files that should be modularized
  function checkFileSize(filePath, maxSizeKB = 100) {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const sizeKB = stats.size / 1024;
      if (sizeKB > maxSizeKB) {
        return { 
          size: sizeKB, 
          oversized: true 
        };
      }
    }
    return { size: 0, oversized: false };
  }
  
  // Analyze src/app structure
  console.log('\n📁 Checking App Directory...');
  const appDir = path.join(projectRoot, 'src', 'app');
  const dashboardPage = path.join(appDir, 'dashboard', 'page.tsx');
  
  if (fs.existsSync(dashboardPage)) {
    const sizeCheck = checkFileSize(dashboardPage);
    if (sizeCheck.oversized) {
      issues.push(`Dashboard page is ${sizeCheck.size.toFixed(0)}KB - should be < 100KB`);
      suggestions.push('Break dashboard/page.tsx into smaller components');
    }
  }
  
  // Check for mixed concerns in API routes
  console.log('\n🔌 Checking API Routes...');
  const apiDir = path.join(appDir, 'api');
  if (fs.existsSync(apiDir)) {
    const apiRoutes = fs.readdirSync(apiDir);
    const largeRoutes = [];
    
    apiRoutes.forEach(route => {
      const routePath = path.join(apiDir, route, 'route.ts');
      const sizeCheck = checkFileSize(routePath, 50);
      if (sizeCheck.oversized) {
        largeRoutes.push(route);
      }
    });
    
    if (largeRoutes.length > 0) {
      issues.push(`Large API routes found: ${largeRoutes.join(', ')}`);
      suggestions.push('Extract business logic from API routes into service layer');
    }
  }
  
  // Check for missing directories
  console.log('\n📂 Checking Project Organization...');
  const recommendedDirs = [
    'src/services',
    'src/features',
    'src/types',
    'src/config',
    'documentation',
    'scripts',
    'backups'
  ];
  
  const missingDirs = [];
  recommendedDirs.forEach(dir => {
    const dirPath = path.join(projectRoot, dir);
    if (!fs.existsSync(dirPath)) {
      missingDirs.push(dir);
    }
  });
  
  if (missingDirs.length > 0) {
    suggestions.push(`Create missing directories: ${missingDirs.join(', ')}`);
  }
  
  // Check for build artifacts that should be gitignored
  console.log('\n🗑️ Checking for Build Artifacts...');
  const artifactsToIgnore = [
    '.next/cache/webpack',
    'prisma/src',
    '.next/cache/images'
  ];
  
  const foundArtifacts = [];
  artifactsToIgnore.forEach(artifact => {
    const artifactPath = path.join(projectRoot, artifact);
    if (fs.existsSync(artifactPath)) {
      foundArtifacts.push(artifact);
    }
  });
  
  if (foundArtifacts.length > 0) {
    issues.push('Build artifacts found that should be gitignored');
    suggestions.push(`Add to .gitignore: ${foundArtifacts.join(', ')}`);
  }
  
  // Check component organization
  console.log('\n🧩 Checking Component Organization...');
  const componentsDir = path.join(projectRoot, 'src', 'components');
  if (fs.existsSync(componentsDir)) {
    const componentFolders = fs.readdirSync(componentsDir)
      .filter(f => fs.statSync(path.join(componentsDir, f)).isDirectory());
    
    if (componentFolders.length > 20) {
      issues.push(`Too many component folders (${componentFolders.length}) - needs better organization`);
      suggestions.push('Group related components into feature folders');
    }
  }
  
  // Report findings
  console.log('\n' + '═'.repeat(50));
  console.log('📋 ANALYSIS REPORT\n');
  
  if (issues.length > 0) {
    console.log('❌ Issues Found:');
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
  } else {
    console.log('✅ No major issues found!');
  }
  
  if (suggestions.length > 0) {
    console.log('\n💡 Suggestions:');
    suggestions.forEach((suggestion, i) => {
      console.log(`   ${i + 1}. ${suggestion}`);
    });
  }
  
  // Create report file
  const report = {
    timestamp: new Date().toISOString(),
    issues,
    suggestions,
    stats: {
      totalIssues: issues.length,
      totalSuggestions: suggestions.length
    }
  };
  
  const reportPath = path.join(projectRoot, 'documentation', 'structure-analysis.json');
  if (!fs.existsSync(path.dirname(reportPath))) {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  }
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full report saved to: documentation/structure-analysis.json`);
  
  return report;
}

// Run if called directly
if (require.main === module) {
  analyzeStructure();
}

module.exports = { analyzeStructure };