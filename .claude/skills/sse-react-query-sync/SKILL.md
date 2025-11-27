---
name: sse-react-query-sync
description: Expert guidance on implementing Server-Sent Events (SSE) with React Query cache synchronization for real-time data updates in the acp-mobile React Native application. Covers SSE connection management, React Query integration, race condition prevention, background/foreground handling, and performance optimization.
version: 1.0.0
---

# SSE + React Query Realtime Sync Skill

**Version**: 1.0.0
**Last Updated**: 2025-11-26
**Codebase**: acp-mobile (React Native 0.76 + Expo SDK 52)

## Skill Overview

This skill provides comprehensive guidance on implementing and maintaining the Server-Sent Events (SSE) + React Query synchronization pattern used in the acp-mobile codebase for real-time session updates.

### What This Skill Covers

- **SSE Connection Management**: EventSource API, reconnection logic, exponential backoff
- **React Query Integration**: Direct cache updates, dual cache synchronization
- **Race Condition Prevention**: Event queuing, timestamp comparison, SSE as source of truth
- **App Lifecycle**: Background/foreground transitions, connection state management
- **Performance Optimization**: Event deduplication, batching, memory management
- **Development Workflow**: Mock SSE service for local development
- **Production Patterns**: Authentication, error handling, observability

### Key Capabilities

1. **Step-by-step implementation** from scratch to production
2. **Architecture decision explanations** (5 ADRs covering key design choices)
3. **Working code examples** extracted from production implementation
4. **Troubleshooting guides** for common issues and debugging
5. **Production-ready reference code** ready to copy/paste

---

## Skill Invocation

This skill is automatically invoked when you ask questions related to:

- Server-Sent Events (SSE) implementation
- React Query cache synchronization
- Real-time data updates in React Native
- Connection lifecycle management
- Background/foreground state handling
- Race condition prevention between SSE and API
- Event batching and performance optimization
- Mock service setup for development

### Example Invocations

```
"How do I set up SSE with React Query?"
"The SSE connection keeps dropping when the app backgrounds"
"Cache shows stale data even though SSE sent an update"
"How do I prevent race conditions between SSE and API calls?"
"Show me a complete working SSE implementation"
```

---

## Skill Routing

Based on your question, you'll be directed to the most relevant documentation:

### 🏗️ Implementation Questions → [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

**When to read**: Setting up SSE for the first time, integrating with React Query, development workflow

**Topics covered**:

- Installing dependencies (react-native-sse, React Query)
- Creating RealtimeService class with reconnection logic
- Building useRealtimeSession hook for React integration
- Setting up MockSSEService for local development
- Testing strategies and validation
- Production deployment checklist

**Example questions**:

- "How do I set up SSE in my React Native app?"
- "How do I integrate SSE with React Query?"
- "How do I test without a real backend?"
- "What dependencies do I need?"

---

### 🏛️ Architecture Questions → [ARCHITECTURE.md](./ARCHITECTURE.md)

**When to read**: Understanding design decisions, evaluating trade-offs, learning best practices

**Topics covered** (5 Architecture Decision Records):

1. **Why SSE Instead of WebSockets?** - Protocol selection rationale
2. **Why Direct Cache Updates Instead of Invalidation?** - Performance optimization
3. **Why Update Both List and Detail Caches?** - Consistency across UI surfaces
4. **Why Event Deduplication?** - Preventing excessive re-renders
5. **Why Background/Foreground Disconnect?** - iOS/Android lifecycle handling

**Example questions**:

- "Why use SSE instead of WebSockets?"
- "Why not just invalidate queries on SSE events?"
- "Why update both list and detail caches?"
- "Why disconnect when app backgrounds?"
- "What are the trade-offs of this approach?"

---

### 💡 Code Examples → [EXAMPLES.md](./EXAMPLES.md)

**When to read**: Need working code to copy/paste, learning by example

**Topics covered**:

- **Example 1**: Basic SSE connection setup
- **Example 2**: React Query cache integration
- **Example 3**: Progress updates from SSE events
- **Example 4**: Status changes with toast notifications
- **Example 5**: Optimistic updates with SSE confirmation
- **Example 6**: Mock SSE service for development

**Example questions**:

- "Show me a complete SSE implementation"
- "How do I update progress from SSE events?"
- "How do I show notifications on status changes?"
- "How do I implement optimistic updates?"
- "Show me the mock service code"

---

### 🐛 Debugging Questions → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**When to read**: Connection issues, stale data, performance problems, race conditions

**Topics covered**:

- **Issue 1**: Connection drops constantly
- **Issue 2**: Cache shows stale data despite SSE events
- **Issue 3**: UI lags with rapid SSE events
- **Issue 4**: Race conditions between SSE and API
- **Issue 5**: Memory leaks from event listeners

Each issue includes:

- Symptom description
- Diagnostic steps (with commands/tools)
- Root cause explanation
- Step-by-step solution with code

**Example questions**:

- "SSE connection keeps disconnecting"
- "Cache doesn't update when SSE event arrives"
- "UI freezes when receiving many events"
- "API response overwrites SSE data"
- "App slows down over time"

---

### 📚 Reference Code → [REFERENCE_CODE/](./REFERENCE_CODE/)

**When to read**: Need production-ready code to copy into your project

**Files available**:

- `RealtimeService.ts.example` - Full SSE service implementation (254 lines)
- `useRealtimeSession.ts.example` - React hook for SSE integration (380 lines)
- `MockSSEService.ts.example` - Mock service for development (163 lines)
- `types-realtime.ts.example` - TypeScript type definitions (123 lines)

All reference code includes:

- Inline comments explaining each section
- Production-tested implementation
- TypeScript types
- Error handling
- Performance optimizations

---

## Quick Reference Table

| Your Goal                   | Document to Read                                     | What You'll Learn                               |
| --------------------------- | ---------------------------------------------------- | ----------------------------------------------- |
| Set up SSE from scratch     | [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) | Step-by-step setup, dependencies, configuration |
| Understand why we chose SSE | [ARCHITECTURE.md](./ARCHITECTURE.md)                 | Design rationale, trade-offs, alternatives      |
| See working code            | [EXAMPLES.md](./EXAMPLES.md)                         | Complete examples with explanations             |
| Fix connection problems     | [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)           | Diagnostic steps, solutions, debugging          |
| Copy production code        | [REFERENCE_CODE/](./REFERENCE_CODE/)                 | Ready-to-use TypeScript files                   |

---

## Document Map

```
.claude/skills/sse-react-query-sync/
│
├── SKILL.md (this file)
│   └── Entry point, routing, quick reference
│
├── README.md
│   └── Overview, prerequisites, architecture diagram, 5-minute quick start
│
├── IMPLEMENTATION_GUIDE.md (700 lines)
│   ├── Section 1: Environment Setup
│   ├── Section 2: Core Implementation
│   ├── Section 3: Mock Service Setup
│   ├── Section 4: Testing Strategies
│   └── Section 5: Production Deployment
│
├── ARCHITECTURE.md (500 lines)
│   ├── ADR 1: Why SSE Instead of WebSockets?
│   ├── ADR 2: Why Direct Cache Updates?
│   ├── ADR 3: Why Update Both Caches?
│   ├── ADR 4: Why Event Deduplication?
│   └── ADR 5: Why Background/Foreground Disconnect?
│
├── EXAMPLES.md (600 lines)
│   ├── Example 1: Basic SSE Connection
│   ├── Example 2: React Query Integration
│   ├── Example 3: Progress Updates
│   ├── Example 4: Status Changes with Toasts
│   ├── Example 5: Optimistic Updates
│   └── Example 6: Mock SSE Service
│
├── TROUBLESHOOTING.md (400 lines)
│   ├── Issue 1: Connection Drops
│   ├── Issue 2: Stale Cache
│   ├── Issue 3: UI Lag
│   ├── Issue 4: Race Conditions
│   └── Issue 5: Memory Leaks
│
└── REFERENCE_CODE/
    ├── RealtimeService.ts.example (254 lines)
    ├── useRealtimeSession.ts.example (380 lines)
    ├── MockSSEService.ts.example (163 lines)
    └── types-realtime.ts.example (123 lines)
```

---

## Prerequisites

Before using this skill, ensure you understand:

- **React Query fundamentals**: Queries, mutations, cache management
- **React hooks**: useEffect, useCallback, useState, useRef
- **TypeScript basics**: Types, interfaces, generics
- **React Native lifecycle**: AppState, background/foreground events

If you're new to React Query, start here: https://tanstack.com/query/latest/docs/react/overview

---

## Learning Path

### Beginner (New to SSE + React Query)

1. Read [README.md](./README.md) - Understand the big picture
2. Follow Quick Start in README (5 minutes)
3. Read [ARCHITECTURE.md](./ARCHITECTURE.md) ADR 1 - Why SSE?
4. Study [EXAMPLES.md](./EXAMPLES.md) Example 1 - Basic connection

### Intermediate (Implementing SSE)

1. Read [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) Section 1 & 2
2. Copy code from [REFERENCE_CODE/](./REFERENCE_CODE/)
3. Read [ARCHITECTURE.md](./ARCHITECTURE.md) ADRs 2 & 3 - Cache strategies
4. Implement based on [EXAMPLES.md](./EXAMPLES.md) Examples 2 & 3

### Advanced (Optimization & Production)

1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) ADRs 4 & 5 - Performance
2. Study [EXAMPLES.md](./EXAMPLES.md) Example 5 - Optimistic updates
3. Review [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for edge cases
4. Follow [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) Section 5 - Production

---

## Skill Boundaries

### ✅ This Skill Covers

- SSE implementation specific to acp-mobile codebase
- React Query cache synchronization patterns
- Connection lifecycle and state management
- Background/foreground handling in React Native
- Event deduplication and batching
- Mock service for development

### ❌ This Skill Does NOT Cover

- Generic SSE protocol details (see MDN docs)
- React Query fundamentals (see TanStack docs)
- Backend SSE endpoint implementation
- WebSocket implementation (different protocol)
- GraphQL subscriptions (different pattern)
- Firebase Realtime Database (different service)

---

## Maintenance

This skill is maintained as part of the acp-mobile codebase.

**Update Triggers**:

- Production code changes in `services/api/realtime.ts`
- New event types added to `types/realtime.ts`
- New bugs discovered in SSE implementation
- New patterns emerge from production use

**Version History**:

- `1.0.0` (2025-11-26): Initial extraction from production code

---

## Getting Help

If you encounter issues not covered in this skill:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) first
2. Review production code in [REFERENCE_CODE/](./REFERENCE_CODE/)
3. Check React Query DevTools for cache state
4. Enable debug logging (see IMPLEMENTATION_GUIDE.md)
5. Open an issue in the acp-mobile repository

---

## Next Steps

**New to this skill?** → Start with [README.md](./README.md)

**Ready to implement?** → Jump to [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

**Need working code?** → Browse [EXAMPLES.md](./EXAMPLES.md) or [REFERENCE_CODE/](./REFERENCE_CODE/)

**Debugging a problem?** → Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Understanding the design?** → Read [ARCHITECTURE.md](./ARCHITECTURE.md)
