# Changelog

All notable changes to ACP Mobile will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Initial mobile app setup with Expo SDK 54 and React Native 0.81.5
- TypeScript 5.x strict mode configuration
- Expo Router for file-based navigation
- OAuth 2.0 + PKCE authentication flow
- Red Hat SSO integration (prepared)
- Session monitoring dashboard with active sessions view
- Real-time session updates via Server-Sent Events (SSE)
- SSE service with automatic reconnection and exponential backoff
- Mock SSE service for development testing
- Session detail screen with progress tracking
- Sessions list screen with filtering (All/Running/Paused/Done)
- React Query for state management and caching
- Performance monitoring suite (development only)
- Comprehensive error boundary coverage
- Mock data infrastructure with environment-based feature flags
- Theme system with light/dark mode support
- SecureStore for sensitive token storage
- AsyncStorage for cached session data
- Offline support with cached data
- Connection status indicator with retry capability
- Pre-commit hooks (Husky + lint-staged)
- ESLint and Prettier configuration
- TypeScript type definitions for all services and components

### Security

- Implemented SecureStore for OAuth token storage
- Added Zod schema validation for API responses
- Implemented token expiration validation and automatic refresh
- Secure code verifier storage for OAuth PKCE flow
- API client with proactive token refresh (5 minutes before expiration)

## [0.1.0] - 2025-11-26

### Added

- Initial project scaffolding
- Basic project structure and configuration
