# Phase 13C: Bundle Size Optimization - Quickstart

**5-Minute Setup | Production-Ready Bundle Size Monitoring**

## TL;DR

```bash
# Already completed in this session:
✅ npm install --save-dev react-native-bundle-visualizer source-map-explorer
✅ Bundle analysis scripts added to package.json
✅ Baseline metrics: 7.77 MB (iOS) - Within target ✅

# Generate bundle report anytime:
npm run bundle:ios       # Build iOS bundle + analyze
npm run bundle:report    # Generate size report
```

**Current Status**: App is production-ready at 7.77 MB (target: <10 MB) ✅

## Quick Commands

### Analyze Current Bundle Size

```bash
# iOS bundle analysis
npm run bundle:ios

# Android bundle analysis
npm run bundle:android

# Generate text report
npm run bundle:report

# View visual breakdown
npm run bundle:analyze
```

### Monitor Bundle Size

```bash
# Check current size
cat docs/performance/bundle-size.md

# View historical trends
cat docs/performance/bundle-history.json | jq '.[-5:]'
```

## Implementation Checklist

### ✅ Phase 13C - Monitoring (Completed)

- [x] Install bundle analysis tools
- [x] Add npm scripts for bundle analysis
- [x] Generate baseline metrics (7.77 MB)
- [x] Create automated reporting script
- [x] Set up historical tracking
- [x] Document optimization opportunities

### ⏳ Next Steps - Optimization (Optional)

**Priority 1: Icon Font Optimization** (1.5 hours, 2-3 MB savings)

```bash
# 1. Audit icon usage
grep -r "@expo/vector-icons" app/ components/ --include="*.tsx" > docs/performance/icon-usage.txt

# 2. Identify which families are used
cat docs/performance/icon-usage.txt | grep -oP '(?<=from ")[^"]+' | sort | uniq

# 3. Install optimization CLI
npm install --save-dev expo-icons-cli

# 4. Run optimization
npx expo-icons-cli optimize
```

**Priority 2: Bundle Size CI Check** (1 hour)

```bash
# Add to .github/workflows/ci.yml
- name: Bundle Size Check
  run: |
    npm run bundle:ios
    npm run bundle:report
    # Fail if > 10 MB
```

**Priority 3: Replace axios with fetch** (2 hours, 200-500 KB savings)

```bash
# 1. Create fetch-based client
touch services/api/fetch-client.ts

# 2. Migrate all API services
# 3. Update tests
# 4. Remove axios
npm uninstall axios axios-mock-adapter
```

## Current Bundle Breakdown

### iOS (7.77 MB Total)

**JavaScript Bundle**: 3.9 MB (50%)

- 1,280 modules
- Hermes bytecode compiled ✅
- React Compiler enabled ✅

**Icon Fonts**: 3.87 MB (49%)

- MaterialCommunityIcons: 1.31 MB (largest)
- FontAwesome6_Solid: 424 KB
- Ionicons: 390 KB
- 16 other icon families (most unused)

**Other Assets**: 10 KB (1%)

## Optimization Opportunities (Ranked by ROI)

| Optimization              | Effort | Savings    | Priority |
| ------------------------- | ------ | ---------- | -------- |
| Remove unused icon fonts  | 1.5h   | 2-3 MB     | **High** |
| Replace axios with fetch  | 2h     | 200-500 KB | Medium   |
| Dynamic imports           | 1h     | 100-300 KB | Low      |
| Tree-shaking verification | 30m    | TBD        | Low      |

## Files Created

```
scripts/bundle-report.js                           # Automated size reporting
docs/performance/bundle-size.md                    # Current size report
docs/performance/bundle-history.json               # Historical tracking
specs/001-acp-mobile/phases/phase-13c-bundle-size.md  # Full documentation
```

## Package.json Scripts Added

```json
{
  "scripts": {
    "bundle:analyze": "npx react-native-bundle-visualizer",
    "bundle:ios": "npx expo export --platform ios && npm run bundle:analyze",
    "bundle:android": "npx expo export --platform android && npm run bundle:analyze",
    "bundle:report": "node scripts/bundle-report.js"
  }
}
```

## Success Metrics

- ✅ Bundle size < 10 MB (current: 7.77 MB)
- ✅ Automated reporting in place
- ✅ Historical tracking working
- ✅ Optimization opportunities documented
- ⏳ CI/CD size checks (optional)

## Next Session Commands

### To continue optimization work:

```bash
# 1. Review current bundle composition
npm run bundle:ios
npm run bundle:analyze

# 2. Check which icons are actually used
grep -r "from '@expo/vector-icons'" app/ components/ | \
  grep -oP '(?<=@expo/vector-icons/)[^/]+' | \
  sort | uniq -c

# 3. Implement icon optimization
npm install --save-dev expo-icons-cli
npx expo-icons-cli optimize --include Ionicons,MaterialIcons

# 4. Verify savings
npm run bundle:ios
npm run bundle:report
```

## Troubleshooting

### Bundle build fails

```bash
# Clear Metro cache
npx expo start --clear

# Clean build artifacts
rm -rf dist/ .expo/

# Rebuild
npm run bundle:ios
```

### Bundle visualizer doesn't open

```bash
# Manual analysis
npx react-native-bundle-visualizer dist/ios/_expo/static/js/ios/*.hbc
```

### Historical data not saving

```bash
# Check permissions
ls -la docs/performance/

# Manually create directory
mkdir -p docs/performance/

# Re-run report
npm run bundle:report
```

## Production Release Checklist

Before submitting to App Store / Google Play:

- [ ] Bundle size < 10 MB on iOS
- [ ] Bundle size < 10 MB on Android
- [ ] Icon fonts optimized (remove unused families)
- [ ] Bundle size report generated and reviewed
- [ ] No unexpected size increases vs. baseline

## References

- **Full Documentation**: `specs/001-acp-mobile/phases/phase-13c-bundle-size.md`
- **Current Report**: `docs/performance/bundle-size.md`
- **History**: `docs/performance/bundle-history.json`
- **BACKLOG Item**: `BACKLOG.md` - Item #7 (Medium Priority)

---

**Phase 13C Status**: ✅ **Complete**

Bundle size monitoring infrastructure is production-ready. Optimizations are optional enhancements that can be done in future sprints.
