# Contributing to ACP Mobile

Thank you for your interest in contributing to ACP Mobile! This document provides guidelines and instructions for contributing to this project.

## Development Setup

### Prerequisites

- **Node.js 20+** - Latest LTS version
- **iOS Development** (macOS only):
  - Xcode (latest version)
  - iOS Simulator
  - Mac with macOS 13+ (for iOS builds)
- **Android Development**:
  - Android Studio
  - Android Emulator
- **For Testing**:
  - Expo Go app on physical device (iOS/Android)
- **Apple Developer Account** - $99/year (required for App Store submission)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/ambient-code/acp-mobile.git
cd acp-mobile

# Install dependencies
npm install

# Start development server
npm start

# Run on simulator/emulator
npm run ios     # iOS Simulator
npm run android # Android Emulator
```

### OAuth Integration

The app uses OAuth 2.0 + PKCE for authentication with Red Hat SSO:

- **Development**: Uses mock authentication for local testing
- **Production**: Requires Red Hat SSO configuration
- **OAuth Proxy**: <https://ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com>

## Code Style

We enforce consistent code style using automated tools. All code must pass linting and formatting checks before being committed.

### Tools

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

### Standards

- **TypeScript 5.x strict mode** - All type errors must be resolved
- **No semicolons** - Prettier enforces this
- **Single quotes** for strings
- **2 space indentation**
- **100 character line width**
- **Trailing commas** in ES5 style

### Type Imports

Always use `import type` for type-only imports:

```typescript
// Good
import type { Session } from '@/types/session'
import { useAuth } from '@/hooks/useAuth'

// Bad
import { Session } from '@/types/session'
```

### React Patterns

- Use **functional components** with hooks (no class components)
- Follow React Hooks rules (enforced by ESLint)
- Use `useCallback` and `useMemo` appropriately for performance
- Keep components small and focused

### File Organization

```typescript
// Import order: React → libraries → local components → types
import React, { useState, useEffect } from 'react'
import { View, Text } from 'react-native'
import { useQuery } from '@tanstack/react-query'

import { SessionCard } from '@/components/session/SessionCard'
import type { Session } from '@/types/session'
```

## Branching Strategy

We follow [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow):

### Branch Naming

- **Feature branches**: `feature/description` or `<issue-number>-description`
- **Bug fixes**: `bugfix/description` or `fix/description`
- **Hotfixes**: `hotfix/description`

### Example Workflow

```bash
# Create feature branch from main
git checkout -b feature/realtime-notifications

# Make changes and commit frequently
git add .
git commit -m "Add SSE service for realtime updates"

# Push to remote
git push origin feature/realtime-notifications

# Create pull request on GitHub
```

## Making Changes

### Commit Conventions

We use conventional commit messages for clarity:

```
type(scope): subject

body (optional)
```

**Types**:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks, dependency updates

**Examples**:

```bash
git commit -m "feat(auth): add OAuth PKCE flow"
git commit -m "fix(sessions): resolve cache invalidation race condition"
git commit -m "docs: update API documentation for useAuth hook"
git commit -m "chore: upgrade Expo SDK to 54"
```

### Pre-commit Hooks

The project uses **Husky** and **lint-staged** to automatically lint and format code before commits.

When you run `git commit`, the following happens automatically:

1. **Prettier** formats all staged files (`.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.md`)
2. **ESLint** runs with `--fix` on staged TypeScript/JavaScript files
3. If any issues can't be auto-fixed, the commit is blocked

```bash
# To bypass pre-commit hooks (not recommended)
git commit --no-verify
```

### Running Linting Manually

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Format all files with Prettier
npm run format

# Check formatting without making changes
npm run format:check

# Run TypeScript compiler checks
npm run type-check

# Run all checks (type-check + lint + format)
npm run validate
```

## Submitting Pull Requests

### Before Creating a PR

1. **Ensure your branch is up to date**:

   ```bash
   git checkout main
   git pull origin main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Run all validation checks**:

   ```bash
   npm run validate
   ```

3. **Test your changes**:
   - Run the app on iOS simulator
   - Run the app on Android emulator
   - Test on physical device if possible
   - Verify no console errors or warnings

4. **Update documentation** if needed:
   - Update relevant `.md` files in `docs/`
   - Update API documentation if you changed interfaces
   - Add comments to complex logic

### Creating the PR

1. **Push your branch** to GitHub:

   ```bash
   git push origin your-feature-branch
   ```

2. **Create a Pull Request** on GitHub with:
   - **Clear title** describing the change
   - **Description** explaining what and why
   - **Screenshots** (if UI changes)
   - **Testing instructions** for reviewers
   - **Related issue** number (if applicable)

3. **Ensure CI checks pass**:
   - All linting and formatting checks must pass
   - No TypeScript errors
   - No breaking changes (unless intentional and documented)

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] Tested on physical device
- [ ] No console errors or warnings

## Screenshots (if applicable)

[Add screenshots here]

## Checklist

- [ ] Code follows project style guidelines
- [ ] Lint and format checks pass
- [ ] TypeScript compiles without errors
- [ ] Documentation updated (if needed)
- [ ] Changelog entry added (see CHANGELOG.md)
```

## Code Review Process

### As an Author

- Respond to reviewer feedback promptly
- Make requested changes in new commits (don't force push)
- Re-request review after addressing feedback
- Squash commits before merging (optional, can be done at merge time)

### As a Reviewer

- Be constructive and respectful
- Focus on code quality, not personal preferences
- Check for:
  - Logic errors and bugs
  - Security vulnerabilities
  - Performance issues
  - Code style consistency
  - Missing error handling
  - Insufficient type safety

## Changelog Requirements

We maintain a changelog following [Keep a Changelog](https://keepachangelog.com/) format.

### When to Update CHANGELOG.md

Update the changelog for:

- New features
- Bug fixes
- Breaking changes
- Security fixes
- Deprecations
- Removals

### How to Update

Add your change under `## [Unreleased]` in the appropriate category:

```markdown
## [Unreleased]

### Added

- Your new feature description

### Fixed

- Your bug fix description

### Security

- Your security improvement description
```

**Categories**:

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security improvements

Alternatively, use the `/changelog add` command (Claude Code skill) for guided changelog updates.

## Project Structure

```
acp-mobile/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab-based navigation
│   ├── sessions/          # Session-related screens
│   └── _layout.tsx        # Root layout with providers
├── components/            # Reusable React components
│   ├── session/          # Session-specific components
│   ├── ui/               # Base UI components
│   └── layout/           # Layout components
├── services/             # Business logic
│   ├── api/             # API clients (sessions, auth, realtime)
│   ├── auth/            # Authentication (OAuth, token management)
│   └── storage/         # Data persistence (SecureStore, AsyncStorage)
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and constants
├── docs/                # Documentation (MkDocs)
└── .claude/             # Claude Code configuration
```

## Testing

> **Note**: Test infrastructure is not yet set up. This section will be updated when testing is implemented.

Planned testing approach:

- **Unit tests**: Jest + React Native Testing Library
- **Integration tests**: API and hook testing
- **E2E tests**: Detox (future)

## Getting Help

- **Documentation**: See `/docs` directory or visit the [documentation site](https://ambient-code.github.io/acp-mobile)
- **Issues**: Check [GitHub Issues](https://github.com/ambient-code/acp-mobile/issues)
- **Questions**: Ask in pull requests or create a discussion

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow)

---

Thank you for contributing to ACP Mobile!
