# API Contract Verification - Phase 7 Session Creation

## Issue Summary

**Location**: `services/api/sessions.ts:85`
**Status**: ⚠️ POTENTIAL MISMATCH
**Severity**: Medium - May cause runtime failures in production

## The Problem

The `createSessionFromRepo()` helper function contains a suspicious API contract mapping:

```typescript
// services/api/sessions.ts:71-89
export async function createSessionFromRepo(params: {
  name: string
  repositoryId: string // ← Input parameter
  workflowType: string
  model: string
  description?: string
}): Promise<Session> {
  const request: CreateSessionRequest = {
    name: params.name,
    workflowType: params.workflowType,
    model: params.model as ModelType,
    repositoryUrl: params.repositoryId, // ← Passed as repositoryUrl (LINE 85)
  }

  return SessionsAPI.createSession(request)
}
```

### The Code Comment

Line 85 includes the comment: `// Backend should handle this`

This suggests uncertainty about whether:

1. The backend API actually expects `repositoryUrl` but the frontend has `repositoryId`
2. The backend will accept a repository ID in the `repositoryUrl` field
3. This is a temporary workaround pending backend changes

## Type Definitions

### Frontend Type (types/session.ts:41-47)

```typescript
export interface CreateSessionRequest {
  name?: string
  workflowType: string
  model: ModelType
  repositoryUrl: string // ← API expects URL, but receives ID
  branch?: string
}
```

### Repository Type (types/api.ts)

```typescript
export interface Repository {
  id: string // ← This is what we have
  name: string
  url: string // ← This is what API expects?
  branch: string
  isConnected: boolean
}
```

## Potential Issues

### 1. Runtime Validation Failure

If the backend validates `repositoryUrl` as a URL (e.g., must start with `https://`), passing a repository ID like `"repo-123"` will fail.

**Expected format**: `https://github.com/user/repo`
**Actual value sent**: `repo-123`

### 2. Backend Lookup Failure

If the backend uses `repositoryUrl` to look up the repository in its database, it won't find a match for the ID.

### 3. Inconsistent Data Model

The type system says `repositoryUrl: string`, but the implementation passes `repositoryId`. This creates a lie in the type system.

## Test Coverage

The unit tests in `services/api/__tests__/sessions-helper.test.ts` explicitly verify this behavior:

```typescript
// Line 129-146: API contract verification test
it('passes repositoryId as repositoryUrl to backend', async () => {
  let capturedPayload: any

  mock.onPost('/sessions').reply((config) => {
    capturedPayload = JSON.parse(config.data)
    // ...
  })

  await createSessionFromRepo({
    name: 'test session',
    repositoryId: 'repo-123',
    workflowType: 'review',
    model: 'sonnet-4.5',
  })

  // Verify the API contract quirk
  expect(capturedPayload.repositoryUrl).toBe('repo-123')
  expect(capturedPayload.repositoryId).toBeUndefined()
})
```

## Verification Steps Required

### Step 1: Check Backend API Documentation

Find the backend API specification for `POST /sessions`:

- What field name does it expect? (`repositoryId` or `repositoryUrl`)
- What format does it expect? (ID string or full GitHub URL)
- Does it validate the format?

### Step 2: Test with Real Backend

If backend is available:

```typescript
// Test Case 1: Send repository ID
POST /sessions
{
  "name": "Test Session",
  "workflowType": "review",
  "model": "sonnet-4.5",
  "repositoryUrl": "repo-123"  // ID instead of URL
}

// Expected: Does this succeed or fail?
```

```typescript
// Test Case 2: Send repository URL
POST /sessions
{
  "name": "Test Session",
  "workflowType": "review",
  "model": "sonnet-4.5",
  "repositoryUrl": "https://github.com/user/my-app"
}

// Expected: Does this succeed?
```

### Step 3: Check Backend Code

If you have access to backend code, search for:

- Session creation endpoint handler
- Parameter validation logic
- Repository lookup logic

## Recommended Solutions

### Option 1: Fix the API Contract (Preferred)

Change the frontend to send the actual repository URL:

```typescript
export async function createSessionFromRepo(params: {
  name: string
  repository: Repository // ← Pass full repository object
  workflowType: string
  model: string
  description?: string
}): Promise<Session> {
  const request: CreateSessionRequest = {
    name: params.name,
    workflowType: params.workflowType,
    model: params.model as ModelType,
    repositoryUrl: params.repository.url, // ← Send the actual URL
  }

  return SessionsAPI.createSession(request)
}
```

**Impact**: Requires updating `app/sessions/new.tsx:63-68` to pass the full repository object.

### Option 2: Update Type Definition

If backend actually accepts repository ID, update the type:

```typescript
export interface CreateSessionRequest {
  name?: string
  workflowType: string
  model: ModelType
  repositoryId: string // ← Rename to match reality
  branch?: string
}
```

**Impact**: Changes the API contract to match actual implementation.

### Option 3: Backend Lookup

If backend needs URL but only has ID, do a repository lookup first:

```typescript
export async function createSessionFromRepo(params: {
  name: string
  repositoryId: string
  workflowType: string
  model: string
}): Promise<Session> {
  // Fetch the repository to get the URL
  const repos = await fetchRepos()
  const repo = repos.find((r) => r.id === params.repositoryId)

  if (!repo) {
    throw new Error(`Repository not found: ${params.repositoryId}`)
  }

  const request: CreateSessionRequest = {
    name: params.name,
    workflowType: params.workflowType,
    model: params.model as ModelType,
    repositoryUrl: repo.url, // ← Use the actual URL
  }

  return SessionsAPI.createSession(request)
}
```

**Impact**: Adds extra API call, but maintains type safety.

## Files Affected

If we implement Option 1 (recommended):

1. `services/api/sessions.ts` - Update `createSessionFromRepo()` signature
2. `app/sessions/new.tsx` - Pass full repository object instead of just ID
3. `services/api/__tests__/sessions-helper.test.ts` - Update test expectations
4. `app/sessions/__tests__/new.test.tsx` - Update integration test expectations

## Next Steps

1. **Immediate**: Document this issue (✅ Done)
2. **Short-term**: Contact backend team to verify API contract
3. **Before production**: Test with real backend API
4. **If mismatch confirmed**: Implement Option 1 or 3 above

## Related Files

- `services/api/sessions.ts:71-89` - The problematic function
- `types/session.ts:41-47` - CreateSessionRequest interface
- `types/api.ts` - Repository interface
- `services/api/__tests__/sessions-helper.test.ts:129-146` - Test verifying current behavior
- `app/sessions/new.tsx:55-83` - Usage of createSessionFromRepo

---

**Created**: 2025-11-27 (Phase 11 verification)
**Last Updated**: 2025-11-27
**Owner**: Jeremy Eder
**Status**: NEEDS BACKEND VERIFICATION
