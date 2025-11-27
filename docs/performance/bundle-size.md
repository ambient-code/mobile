# Bundle Size Report

**Generated:** 11/27/2025, 3:11:41 AM

## Platform Bundles

### iOS

- **Total Size:** 7.77 MB

## Bundle Size Targets

| Platform | Target  | Status            |
| -------- | ------- | ----------------- |
| iOS      | < 10 MB | ✅ Good (7.77 MB) |

## Analysis Tips

Run `npm run bundle:analyze` to visualize which modules contribute most to bundle size.

### Common Optimizations

- Replace `axios` with native `fetch` API
- Enable Hermes engine (already enabled)
- Use dynamic imports for large dependencies
- Remove unused Expo modules
- Verify tree-shaking is working
