#!/usr/bin/env node

/**
 * Bundle Size Report Generator
 *
 * Analyzes Expo build output to track bundle size metrics over time
 */

const fs = require('fs')
const path = require('path')

const REPORT_DIR = path.join(__dirname, '..', 'docs', 'performance')
const DIST_DIR = path.join(__dirname, '..', 'dist')

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function getDirectorySize(dirPath) {
  let totalSize = 0

  if (!fs.existsSync(dirPath)) {
    return 0
  }

  const files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    const filePath = path.join(dirPath, file)
    const stats = fs.statSync(filePath)

    if (stats.isDirectory()) {
      totalSize += getDirectorySize(filePath)
    } else {
      totalSize += stats.size
    }
  })

  return totalSize
}

function analyzeBundles() {
  const report = {
    timestamp: new Date().toISOString(),
    platforms: {},
  }

  // Check for iOS bundle
  const iosBundle = path.join(DIST_DIR, 'ios')
  if (fs.existsSync(iosBundle)) {
    report.platforms.ios = {
      totalSize: getDirectorySize(iosBundle),
      formatted: formatBytes(getDirectorySize(iosBundle)),
    }
  }

  // Check for Android bundle
  const androidBundle = path.join(DIST_DIR, 'android')
  if (fs.existsSync(androidBundle)) {
    report.platforms.android = {
      totalSize: getDirectorySize(androidBundle),
      formatted: formatBytes(getDirectorySize(androidBundle)),
    }
  }

  return report
}

function generateMarkdownReport(report) {
  const lines = [
    '# Bundle Size Report',
    '',
    `**Generated:** ${new Date(report.timestamp).toLocaleString()}`,
    '',
    '## Platform Bundles',
    '',
  ]

  if (report.platforms.ios) {
    lines.push(`### iOS`)
    lines.push(`- **Total Size:** ${report.platforms.ios.formatted}`)
    lines.push('')
  }

  if (report.platforms.android) {
    lines.push(`### Android`)
    lines.push(`- **Total Size:** ${report.platforms.android.formatted}`)
    lines.push('')
  }

  if (!report.platforms.ios && !report.platforms.android) {
    lines.push('No bundles found. Run `npm run bundle:ios` or `npm run bundle:android` first.')
    lines.push('')
  }

  lines.push('## Bundle Size Targets', '')
  lines.push('| Platform | Target | Status |')
  lines.push('|----------|--------|--------|')

  if (report.platforms.ios) {
    const iosSize = report.platforms.ios.totalSize / (1024 * 1024) // MB
    const status = iosSize < 10 ? '✅ Good' : iosSize < 20 ? '⚠️ Monitor' : '❌ Too Large'
    lines.push(`| iOS | < 10 MB | ${status} (${report.platforms.ios.formatted}) |`)
  }

  if (report.platforms.android) {
    const androidSize = report.platforms.android.totalSize / (1024 * 1024) // MB
    const status = androidSize < 10 ? '✅ Good' : androidSize < 20 ? '⚠️ Monitor' : '❌ Too Large'
    lines.push(`| Android | < 10 MB | ${status} (${report.platforms.android.formatted}) |`)
  }

  lines.push('')
  lines.push('## Analysis Tips', '')
  lines.push(
    'Run `npm run bundle:analyze` to visualize which modules contribute most to bundle size.'
  )
  lines.push('')
  lines.push('### Common Optimizations', '')
  lines.push('- Replace `axios` with native `fetch` API')
  lines.push('- Enable Hermes engine (already enabled)')
  lines.push('- Use dynamic imports for large dependencies')
  lines.push('- Remove unused Expo modules')
  lines.push('- Verify tree-shaking is working')
  lines.push('')

  return lines.join('\n')
}

function saveHistoricalData(report) {
  const historyFile = path.join(REPORT_DIR, 'bundle-history.json')
  let history = []

  if (fs.existsSync(historyFile)) {
    history = JSON.parse(fs.readFileSync(historyFile, 'utf8'))
  }

  history.push(report)

  // Keep last 30 reports
  if (history.length > 30) {
    history = history.slice(-30)
  }

  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2))
}

function main() {
  console.log('📦 Analyzing bundle sizes...\n')

  const report = analyzeBundles()
  const markdown = generateMarkdownReport(report)

  // Ensure report directory exists
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true })
  }

  // Save markdown report
  const reportPath = path.join(REPORT_DIR, 'bundle-size.md')
  fs.writeFileSync(reportPath, markdown)

  // Save historical data
  saveHistoricalData(report)

  console.log('✅ Bundle size report generated:')
  console.log(`   ${reportPath}\n`)
  console.log(markdown)
}

main()
