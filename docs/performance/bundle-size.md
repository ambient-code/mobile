# Bundle Size Report

**Generated:** 11/27/2025, 7:40:30 AM

## Platform Bundles

No bundles found. Run `npm run bundle:ios` or `npm run bundle:android` first.

## Bundle Size Targets

| Platform | Target | Status |
| -------- | ------ | ------ |

## Analysis Tips

Run `npm run bundle:analyze` to visualize which modules contribute most to bundle size.

### Common Optimizations

- Replace `axios` with native `fetch` API
- Enable Hermes engine (already enabled)
- Use dynamic imports for large dependencies
- Remove unused Expo modules
- Verify tree-shaking is working
