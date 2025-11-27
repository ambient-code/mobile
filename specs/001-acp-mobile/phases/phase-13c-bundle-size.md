# Phase 13C: Bundle Size Optimization

**Priority**: Medium
**Estimated Effort**: 4 hours
**Confidence**: 80%
**Status**: In Progress

## Overview

Bundle size optimization is a production-readiness task that establishes monitoring, baseline metrics, and identifies optimization opportunities for the ACP Mobile app. This phase focuses on visibility and actionable insights rather than aggressive optimization.

## Current State Analysis

### Baseline Metrics (2025-11-27)

**iOS Bundle Breakdown:**

- **Total Bundle**: 7.77 MB ✅ Good (target: < 10 MB)
  - JavaScript Bundle (Hermes Bytecode): 3.9 MB (50%)
  - Icon Fonts: ~3.87 MB (49%)
    - MaterialCommunityIcons.ttf: 1.31 MB
    - FontAwesome6_Solid.ttf: 424 KB
    - Ionicons.ttf: 390 KB
    - MaterialIcons.ttf: 357 KB
    - FontAwesome6_Brands.ttf: 209 KB
    - FontAwesome5_Solid.ttf: 203 KB
    - FontAwesome.ttf: 166 KB
    - Other fonts: ~1.2 MB

**Current Status**: ✅ **Within Target**

The app is currently healthy at 7.77 MB, well under the 10 MB target. No urgent optimizations needed before production release.

## Key Findings

### 1. Icon Fonts (Largest Asset Category)

**Impact**: ~3.87 MB (49% of bundle)

**Analysis**:

- @expo/vector-icons includes 19 font families by default
- Most apps only use 2-3 icon families
- This is the single largest optimization opportunity

**Recommended Actions**:

1. Audit actual icon usage across the codebase
2. Switch to selective icon imports (expo-icons-cli)
3. Remove unused icon families
4. **Estimated Savings**: 2-3 MB (26-39%)

### 2. JavaScript Bundle

**Impact**: 3.9 MB (50% of bundle)

**Analysis**:

- 1,280 modules included in bundle
- Hermes bytecode compilation already enabled ✅
- React Compiler enabled ✅

**Current Dependencies to Review**:

```json
Large Libraries (potential optimization targets):
- axios: 1.13.2 - Consider replacing with fetch API
- @tanstack/react-query: 5.90.11 - Essential, keep
- lucide-react-native: 0.555.0 - Review if tree-shaking works
- react-native-svg: 15.12.1 - Essential for icons, keep
```

**Recommended Actions**:

1. Replace `axios` with native `fetch` API
2. Verify tree-shaking is working for lucide-react-native
3. Use dynamic imports for non-critical screens
4. **Estimated Savings**: 200-500 KB (5-13%)

### 3. Unused Expo Modules

**Status**: Needs Investigation

**Recommended Actions**:

1. Run `npx expo-doctor` to identify unused modules
2. Review expo config for auto-linking
3. Remove development-only dependencies from production builds

## Goals & Success Criteria

### Primary Goals

1. **Establish Monitoring** ✅
   - Bundle analysis tooling installed
   - Baseline metrics captured
   - Historical tracking system created

2. **Document Optimization Opportunities**
   - Identify largest contributors
   - Estimate savings for each optimization
   - Prioritize based on effort vs. impact

3. **Stay Under 10 MB Target**
   - Current: 7.77 MB ✅
   - Buffer for future features: 2.23 MB
   - Monitor on every build

### Success Metrics

- ✅ Bundle size < 10 MB (current: 7.77 MB)
- ✅ Automated bundle size reporting
- ✅ Historical tracking system
- ⏳ Bundle visualizer working
- ⏳ Optimization recommendations documented

## Implementation Plan

### Phase 13C Tasks

#### T-BS-001: Bundle Size Monitoring Infrastructure ✅

**Status**: Completed

**Deliverables**:

- [x] Install react-native-bundle-visualizer
- [x] Install source-map-explorer
- [x] Add bundle analysis npm scripts
- [x] Create bundle-report.js script
- [x] Generate baseline metrics

**Files Modified**:

- `package.json`: Added bundle analysis scripts
- `scripts/bundle-report.js`: Automated reporting
- `docs/performance/bundle-size.md`: Initial report
- `docs/performance/bundle-history.json`: Historical tracking

#### T-BS-002: Icon Font Optimization

**Status**: Not Started
**Estimated Effort**: 1.5 hours
**Potential Savings**: 2-3 MB

**Steps**:

1. Audit icon usage across codebase

   ```bash
   grep -r "@expo/vector-icons" app/ components/ --include="*.tsx" > icon-usage.txt
   ```

2. Identify which icon families are actually used
   - Example: If only using Ionicons and MaterialIcons, remove other 17 families

3. Switch to selective icon loading

   ```bash
   npm install expo-icons-cli
   npx expo-icons-cli optimize
   ```

4. Configure selective icon families in app.json

   ```json
   {
     "expo": {
       "plugins": [
         [
           "@expo/vector-icons",
           {
             "fonts": ["Ionicons", "MaterialIcons"]
           }
         ]
       ]
     }
   }
   ```

5. Re-run bundle analysis to measure savings

**Risk**: Low - Expo officially supports selective icon loading

#### T-BS-003: Replace axios with Fetch API

**Status**: Not Started
**Estimated Effort**: 2 hours
**Potential Savings**: 200-500 KB

**Steps**:

1. Create fetch-based API client wrapper in `services/api/fetch-client.ts`
   - Maintain existing interceptor pattern
   - Handle token refresh logic
   - Support request/response transformations

2. Update all API service files to use new client
   - `services/api/auth.ts`
   - `services/api/sessions.ts`
   - `services/api/notifications.ts`
   - `services/api/chat.ts`
   - `services/api/repositories.ts`
   - `services/api/user.ts`

3. Remove axios dependency

   ```bash
   npm uninstall axios axios-mock-adapter
   ```

4. Update tests to mock fetch instead of axios

5. Re-run bundle analysis to measure savings

**Risk**: Medium - Requires testing all API endpoints thoroughly

**Alternative**: Defer until after production launch if time-constrained

#### T-BS-004: Verify Tree-Shaking

**Status**: Not Started
**Estimated Effort**: 30 minutes
**Potential Savings**: Unknown (diagnostic task)

**Steps**:

1. Run bundle visualizer to identify large modules

   ```bash
   npm run bundle:ios
   npm run bundle:analyze
   ```

2. Check if lucide-react-native is tree-shaking properly
   - Ensure using named imports: `import { IconName } from 'lucide-react-native'`
   - Avoid default imports: `import * as Icons from 'lucide-react-native'`

3. Review Metro bundler configuration for tree-shaking settings

4. Document findings in bundle-size.md

**Risk**: Low - Diagnostic only

#### T-BS-005: Dynamic Import for Non-Critical Screens

**Status**: Not Started
**Estimated Effort**: 1 hour
**Potential Savings**: 100-300 KB

**Steps**:

1. Identify low-traffic screens suitable for dynamic loading
   - Settings screens (rarely accessed)
   - Onboarding/tutorial screens
   - Documentation/help screens

2. Implement React.lazy() for these screens

   ```typescript
   const SettingsScreen = React.lazy(() => import('./app/settings/index'))
   ```

3. Add proper loading fallbacks

4. Test on both iOS and Android

5. Re-run bundle analysis to measure impact

**Risk**: Low - React.lazy() is well-supported in React Native 0.76+

#### T-BS-006: Bundle Size CI/CD Integration

**Status**: Not Started
**Estimated Effort**: 1 hour
**Impact**: Prevention (not optimization)

**Steps**:

1. Add bundle size check to CI pipeline

   ```yaml
   # .github/workflows/bundle-check.yml
   - name: Check bundle size
     run: |
       npm run bundle:ios
       npm run bundle:report
       # Fail if bundle exceeds 10 MB
   ```

2. Set up bundle size budget alerts
   - Warn at 8 MB (80% of target)
   - Fail at 10 MB (100% of target)

3. Generate bundle size comparison comments on PRs

**Risk**: Low - Informational only

## Monitoring & Maintenance

### Ongoing Tasks

1. **Weekly Bundle Size Review**
   - Run `npm run bundle:report` after major features
   - Review bundle-history.json for trends
   - Flag any sudden size increases

2. **Quarterly Optimization Review**
   - Re-evaluate dependency sizes
   - Check for new optimization techniques
   - Update bundle size targets if needed

3. **Pre-Release Checks**
   - Verify bundle < 10 MB on both platforms
   - Run bundle visualizer to identify regressions
   - Document any known size increases

## Dependencies

### Tools Installed

- `react-native-bundle-visualizer` - Visual bundle composition analysis
- `source-map-explorer` - JavaScript source map analysis
- `@rnx-kit/metro-plugin-cyclic-dependencies-detector` - Dependency graph analysis

### Scripts Added

```json
{
  "bundle:analyze": "npx react-native-bundle-visualizer",
  "bundle:ios": "npx expo export --platform ios && npm run bundle:analyze",
  "bundle:android": "npx expo export --platform android && npm run bundle:analyze",
  "bundle:report": "node scripts/bundle-report.js"
}
```

## References

### Internal Documentation

- `docs/performance/bundle-size.md` - Current bundle size report
- `docs/performance/bundle-history.json` - Historical size tracking
- `scripts/bundle-report.js` - Automated reporting script

### External Resources

- [Expo Bundle Size Optimization](https://docs.expo.dev/guides/analyzing-bundle-size/)
- [React Native Performance Best Practices](https://reactnative.dev/docs/performance)
- [Hermes Bytecode Compilation](https://reactnative.dev/docs/hermes)

## Risk Assessment

### Low Risk

- Icon font optimization (officially supported)
- Tree-shaking verification (diagnostic only)
- Bundle size monitoring (informational)

### Medium Risk

- Replacing axios with fetch (requires thorough testing)
- Dynamic imports (potential loading state issues)

### High Risk

- None identified

## Timeline

**Total Estimated Effort**: 6-7 hours

### Immediate (Phase 13C - This Session)

- [x] Set up monitoring infrastructure (1 hour)
- [x] Generate baseline metrics (30 minutes)
- [x] Document current state (30 minutes)

### Short-term (Next Sprint)

- [ ] Icon font optimization (1.5 hours)
- [ ] Verify tree-shaking (30 minutes)
- [ ] Bundle size CI/CD integration (1 hour)

### Medium-term (Pre-Production)

- [ ] Replace axios with fetch (2 hours)
- [ ] Dynamic imports for non-critical screens (1 hour)

## Acceptance Criteria

### Phase 13C Completion

- ✅ Bundle size monitoring tooling installed and working
- ✅ Baseline metrics captured and documented
- ✅ Historical tracking system in place
- ✅ Optimization opportunities identified and prioritized
- ✅ Bundle size < 10 MB maintained
- ⏳ Bundle visualizer report generated
- ⏳ Implementation plan for optimizations documented

### Production Release Criteria

- Bundle size < 10 MB on both iOS and Android
- No unused icon fonts included
- Tree-shaking verified for all libraries
- CI/CD bundle size checks in place
- Bundle size tracked in every release

## Notes

### Current Status: ✅ Production-Ready

The app is already within bundle size targets. Optimizations listed above are **opportunities for improvement**, not blockers for production release.

### Recommended Prioritization

1. **Must-Do Before Production**:
   - Icon font optimization (highest ROI)
   - Bundle size CI/CD integration (prevent regressions)

2. **Should-Do for v1.1**:
   - Replace axios with fetch (reduce dependencies)
   - Verify tree-shaking (ensure efficiency)

3. **Nice-to-Have**:
   - Dynamic imports (marginal gains)

### Trade-offs

**Icon Font Optimization**:

- ✅ Pros: Significant size reduction (2-3 MB)
- ⚠️ Cons: Need to be careful not to remove icons in use

**Axios → Fetch Migration**:

- ✅ Pros: Removes dependency, reduces bundle size
- ⚠️ Cons: Requires rewriting all API client code and tests

**Dynamic Imports**:

- ✅ Pros: Reduces initial bundle size
- ⚠️ Cons: Adds complexity, potential loading state issues
