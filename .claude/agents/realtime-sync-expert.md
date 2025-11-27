---
name: realtime-sync-expert
description: ⚠️ DEPRECATED - This agent has been superseded by the sse-react-query-sync skill. Use the skill instead for comprehensive SSE + React Query guidance.\n\n**Migration Path**: Instead of using this agent, use the skill by asking questions naturally:\n- "How do I set up SSE with React Query?"\n- "The SSE connection keeps dropping"\n- "Show me SSE implementation examples"\n\nThe skill provides:\n- ✅ 700-line implementation guide\n- ✅ 500-line architecture documentation (5 ADRs)\n- ✅ 600-line examples document\n- ✅ 400-line troubleshooting guide\n- ✅ Production-ready reference code\n\n**Skill Location**: `.claude/skills/sse-react-query-sync/`
model: sonnet
---

# ⚠️ DEPRECATED: Realtime Sync Expert Agent

**This agent has been deprecated and replaced with a comprehensive skill.**

## Migration Notice

**Date**: 2025-11-26
**Status**: DEPRECATED
**Replacement**: `sse-react-query-sync` skill

### Why the Change?

This agent provided 455 lines of guidance, but has been superseded by a much more comprehensive skill that provides:

- **SKILL.md** (300 lines): Entry point with routing logic
- **README.md** (200 lines): Overview, quick start, prerequisites
- **IMPLEMENTATION_GUIDE.md** (700 lines): Step-by-step setup from scratch
- **ARCHITECTURE.md** (500 lines): 5 ADRs explaining design decisions
- **EXAMPLES.md** (600 lines): Complete working code examples
- **TROUBLESHOOTING.md** (400 lines): Diagnostic guides for common issues
- **REFERENCE_CODE/** (920 lines): Production-ready code to copy/paste

**Total**: ~3,100 lines of comprehensive, organized documentation vs. 455 lines in this agent.

### How to Use the Skill

Instead of invoking this agent, simply ask Claude naturally:

```
"How do I set up SSE with React Query?"
→ Automatically routed to IMPLEMENTATION_GUIDE.md

"Why did we choose SSE over WebSockets?"
→ Automatically routed to ARCHITECTURE.md ADR 1

"Show me a working SSE implementation"
→ Automatically routed to EXAMPLES.md

"The SSE connection keeps dropping"
→ Automatically routed to TROUBLESHOOTING.md Issue 1
```

Claude will automatically use the skill and provide the relevant documentation.

### Skill Location

All content is now in:

```
.claude/skills/sse-react-query-sync/
├── SKILL.md                          # Entry point
├── README.md                         # Overview & quick start
├── IMPLEMENTATION_GUIDE.md           # Step-by-step setup
├── ARCHITECTURE.md                   # Design decisions (ADRs)
├── EXAMPLES.md                       # Working code examples
├── TROUBLESHOOTING.md                # Debugging guides
└── REFERENCE_CODE/
    ├── RealtimeService.ts.example
    ├── useRealtimeSession.ts.example
    ├── MockSSEService.ts.example
    └── types-realtime.ts.example
```

### Benefits of the Skill

1. **Better Organization**: Content split by purpose (implementation, architecture, examples, troubleshooting)
2. **More Comprehensive**: 7x more content (3,100 vs 455 lines)
3. **Production Code**: Actual working code ready to copy/paste
4. **Step-by-Step**: Complete implementation guide from scratch
5. **Troubleshooting**: Detailed diagnostic guides for common issues
6. **Architecture**: 5 ADRs explaining design decisions

### Original Agent Content (Archived)

The original agent content has been fully migrated to the skill documents:

- **Connection Lifecycle** → IMPLEMENTATION_GUIDE.md Section 2
- **Background/Foreground Handling** → ARCHITECTURE.md ADR 5
- **React Query Cache Updates** → EXAMPLES.md Example 2 & 3
- **Race Condition Prevention** → TROUBLESHOOTING.md Issue 4
- **Event Batching** → ARCHITECTURE.md ADR 4
- **Mock Service** → REFERENCE_CODE/MockSSEService.ts.example
- **Debugging Strategies** → TROUBLESHOOTING.md (all issues)

### If You Must Use This Agent

If for some reason you need the old agent behavior, you can still invoke it explicitly, but you'll get much better results from the skill.

**Recommendation**: Use the skill instead. It's more comprehensive, better organized, and provides production-ready code.

---

## Quick Start with Skill

Start here: `.claude/skills/sse-react-query-sync/README.md`

Or ask Claude any SSE/React Query question and you'll be automatically routed to the right documentation.

**Example questions**:

- "How do I set up SSE?"
- "Why update both list and detail caches?"
- "Show me the progress update code"
- "My SSE connection keeps dropping, how do I debug it?"
- "How do I prevent race conditions between SSE and API?"

---

**End of Deprecation Notice**

**Action Required**: Update any documentation or scripts that reference this agent to use the skill instead.
