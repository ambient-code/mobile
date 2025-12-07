# acp-mobile Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-26

## Active Technologies

- TypeScript 5.x with React Native 0.76 + Expo SDK 52, Expo Router (file-based routing), React Native, @expo/vector-icons, react-native-svg (001-acp-mobile)

## Project Structure

```text
src/
tests/
```

## Commands

### Development

- `npm start` - Start Expo dev server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator

### Linting & Formatting

- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Fix linting errors automatically
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check formatting without making changes
- `npm run type-check` - Run TypeScript compiler checks
- `npm run validate` - Run all checks (type-check + lint + format)

### Pre-commit Hook

This project uses Husky and lint-staged to automatically lint and format staged files before commits.
When you run `git commit`, the following happens automatically:

1. Prettier formats all staged `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, and `.md` files
2. ESLint runs with `--fix` on all staged TypeScript/JavaScript files
3. If any issues can't be auto-fixed, the commit is blocked

To bypass the pre-commit hook (not recommended):

```bash
git commit --no-verify
```

## Code Style

### TypeScript

- Use TypeScript 5.x strict mode
- Prefer `type` imports: `import type { Foo } from './types'`
- Avoid `any` - use `unknown` or proper types
- Use underscore prefix for unused variables: `_unusedVar`

### React Native

- Use functional components with hooks
- Follow React Hooks rules (enforced by ESLint)
- Use `useCallback` and `useMemo` appropriately

### Formatting (Prettier)

- No semicolons
- Single quotes for strings
- 2 space indentation
- 100 character line width
- Trailing commas in ES5 style

### File Organization

- Group imports: React → libraries → local components → types
- Keep components small and focused
- Use meaningful variable and function names
- Extract complex logic into custom hooks

## Recent Changes

- 001-acp-mobile: Added TypeScript 5.x with React Native 0.76 + Expo SDK 52, Expo Router (file-based routing), React Native, @expo/vector-icons, react-native-svg

## Skills

This project includes specialized Claude Code skills for advanced topics:

### SSE + React Query Realtime Sync

**Location**: `.claude/skills/sse-react-query-sync/`

Comprehensive guidance on implementing Server-Sent Events (SSE) with React Query cache synchronization for real-time data updates.

**What it covers**:

- Step-by-step SSE implementation (700-line guide)
- Architecture decisions (5 ADRs explaining design choices)
- Working code examples (6 complete examples)
- Troubleshooting guides (5 common issues with solutions)
- Production-ready reference code (920 lines ready to copy)

**How to use**: Ask Claude any SSE/React Query question naturally:

- "How do I set up SSE with React Query?"
- "Why did we choose SSE over WebSockets?"
- "Show me SSE implementation examples"
- "The SSE connection keeps dropping, how do I debug it?"

Claude will automatically route you to the right documentation.

**Quick start**: See `.claude/skills/sse-react-query-sync/README.md`

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

- Use the Makefile in the platform repo to control the local developer environment. Use as necessary. Before beginning, ALWAYS confirm the dev local version that is running is the target version you actually want.
