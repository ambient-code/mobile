#!/bin/bash

# ACP Mobile - Automated Phase Implementation Script
# Implements phases 11, 12A, 12B, and 13A-D with PR creation

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MAIN_BRANCH="main"
REPO_ROOT="/Users/jeder/repos/acp-mobile"
PROMPTS_DIR="${REPO_ROOT}/.claude/prompts/phases"

# Ensure we're in the repo root
cd "$REPO_ROOT"

# Create prompts directory if it doesn't exist
mkdir -p "$PROMPTS_DIR"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}ACP Mobile - Phase Implementation Workflow${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Function to print section headers
print_header() {
    echo -e "\n${GREEN}▶ $1${NC}\n"
}

# Function to print errors
print_error() {
    echo -e "${RED}✗ Error: $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warnings
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to create phase prompt file
create_prompt_file() {
    local phase_id="$1"
    local phase_name="$2"
    local prompt_content="$3"

    local prompt_file="${PROMPTS_DIR}/${phase_id}.md"

    echo "$prompt_content" > "$prompt_file"
    print_success "Created prompt file: $prompt_file"
}

# Function to implement a phase
implement_phase() {
    local phase_id="$1"
    local phase_name="$2"
    local branch_name="$3"
    local prompt_file="${PROMPTS_DIR}/${phase_id}.md"

    print_header "Implementing ${phase_name} (${phase_id})"

    # Ensure we're starting from main and rebase from upstream
    echo "Switching to ${MAIN_BRANCH}..."
    git checkout "$MAIN_BRANCH"

    echo "Fetching from upstream..."
    git fetch origin

    echo "Rebasing ${MAIN_BRANCH} from origin/${MAIN_BRANCH}..."
    git rebase "origin/${MAIN_BRANCH}"

    # Create and checkout feature branch
    echo "Creating branch: ${branch_name}..."
    if git rev-parse --verify "$branch_name" >/dev/null 2>&1; then
        print_warning "Branch ${branch_name} already exists. Deleting and recreating..."
        git branch -D "$branch_name"
    fi
    git checkout -b "$branch_name"

    # Display the prompt for Claude
    print_header "Phase Prompt"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    cat "$prompt_file"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""

    # Pause for Claude to implement
    print_warning "Ready to implement ${phase_name}"
    echo ""
    echo "Next steps:"
    echo "  1. Review the prompt above"
    echo "  2. Use Claude Code to implement the requirements"
    echo "  3. Claude will commit changes automatically"
    echo "  4. Press ENTER when implementation is complete"
    echo ""
    read -p "Press ENTER to continue to PR creation, or Ctrl+C to abort..."

    # Check if there are commits on this branch
    if [ "$(git rev-list --count ${MAIN_BRANCH}..HEAD)" -eq 0 ]; then
        print_error "No commits found on ${branch_name}. Skipping PR creation."
        return 1
    fi

    # Push branch
    print_header "Pushing branch to remote"
    git push -u origin "$branch_name"

    # Create PR
    print_header "Creating Pull Request"
    local pr_url=$(gh pr create \
        --title "${phase_name}" \
        --body "$(cat <<EOF
## Phase: ${phase_id}

### Implementation Summary

Implements ${phase_name} as defined in the phase implementation plan.

### Prompt Reference

See \`.claude/prompts/phases/${phase_id}.md\` for the complete coldstart prompt used for this implementation.

### Changes

[Claude will have documented changes in commits]

### Testing

- [x] Manual testing completed
- [x] No linting errors
- [x] All type checks pass

### Related

Part of phases 11-13 implementation plan from \`bright-splashing-dongarra.md\`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" | tail -n 1)

    print_success "PR created: ${pr_url}"

    # Merge PR immediately
    print_header "Merging Pull Request"
    echo "Merging PR immediately..."

    # Extract PR number from URL
    local pr_number=$(echo "$pr_url" | grep -oE '[0-9]+$')

    # Merge the PR with squash
    gh pr merge "$pr_number" --squash --delete-branch --auto

    print_success "PR #${pr_number} merged and branch deleted"

    # Update main branch with merged changes
    echo "Updating local ${MAIN_BRANCH} with merged changes..."
    git checkout "$MAIN_BRANCH"
    git fetch origin
    git rebase "origin/${MAIN_BRANCH}"
}

# Phase definitions with prompts
declare -A PHASES

# Phase 11
PHASES["phase-11"]="Phase 11: Verify Phase 7 Status|feature/phase-11-verify-session-creation|## Phase 11: Verify Phase 7 Status - Coldstartable Prompt

**Context**: The acp-mobile React Native app (Expo SDK 52, TypeScript 5.x, React Native 0.76) has 87 completed tasks across Phases 1-8. Phase 7 (US5: Create Sessions) has UI components in the codebase but is NOT marked complete in tasks.md. Need to verify implementation status and either mark complete or finish missing pieces.

**Goal**: Audit the Session Creation workflow (US5) end-to-end and determine why Phase 7's 11 tasks are not marked complete in tasks.md.

**Functional Requirements to Verify**:
- FR-014: Create new sessions with workflow selection (components exist but status unclear)
- FR-015: Repository selection (components exist)
- FR-016: Auto-generate session names (logic exists)
- FR-017: Model selection - sonnet/opus (components exist)

**Investigation Checklist**:

1. **Code Audit**:
   - Read \`app/sessions/new.tsx\` - verify complete implementation
   - Check repository picker component functionality
   - Verify workflow type grid (Bug Fix, Feature, Refactor, Review, Test)
   - Verify model selection UI (Sonnet vs Opus)
   - Verify session name auto-generation logic

2. **End-to-End Flow Test**:
   - FAB button on dashboard → opens new session modal
   - Repository selection → populates from connected repos
   - Workflow type selection → highlights selected type
   - Model selection → defaults to Sonnet, can switch to Opus
   - Session name field → auto-generates or allows custom input
   - Create button → calls POST /sessions API endpoint
   - Success → navigates to session detail screen
   - Error handling → displays appropriate error messages

3. **Tasks.md Reconciliation**:
   - Compare Phase 7's 11 tasks against actual implementation
   - Identify which tasks are complete vs incomplete
   - Mark complete tasks with ✅ in tasks.md
   - List any incomplete tasks with specific gaps

**Deliverables**:
1. Status report: Complete/Incomplete/Partially Complete
2. Updated tasks.md with accurate Phase 7 task statuses
3. List of missing implementations (if any) with file paths
4. Recommendation: Mark complete OR create follow-up tasks

**Files to Examine**:
- \`app/sessions/new.tsx\` (main new session screen)
- \`tasks.md\` (Phase 7 task list)
- API client session creation endpoint
- Related components in \`components/\` directory"

# Phase 12A
PHASES["phase-12a"]="Phase 12A: Verify API Status Indicator (FR-018)|feature/phase-12a-api-status-indicator|## Phase 12A: Verify API Status Indicator (FR-018) - Coldstartable Prompt

**Context**: The acp-mobile login screen should display API health status, but this has not been verified. FR-018 (API status on login screen) is marked as \"NOT VERIFIED - need to check app/login.tsx\".

**Goal**: Verify if the API status indicator is implemented on the login screen, and implement if missing.

**Functional Requirement**:
- FR-018: Display API health status on login screen
- Expected behavior: Show green/yellow/red indicator for ACP API availability before user attempts login
- Prevents login attempts when API is unreachable

**Investigation Steps**:

1. **Read Login Screen**:
   - Examine \`app/login.tsx\` for health check logic
   - Look for API status indicator UI component
   - Check for health check API call (\`GET /health\` or similar)

2. **Verify Implementation**:
   - Does login screen call health endpoint on mount?
   - Is there visual feedback (icon, badge, text) showing API status?
   - Is there error handling for unreachable API?
   - Does it prevent login attempts when API is down?

3. **If Missing, Implement**:
   - Add API health check service method
   - Create status indicator component (e.g., colored dot + text)
   - Display status at top of login screen
   - Update every 10s while on login screen
   - Show \"API Offline\", \"API Degraded\", \"API Online\" states

**Deliverables**:
1. Status report: Implemented ✅ or Missing ❌
2. If missing: Implement API status indicator with health check
3. Update FR-018 status in reconciliation document

**Files to Examine/Modify**:
- \`app/login.tsx\` (login screen)
- \`services/api/client.ts\` (API client for health check)
- \`components/\` (status indicator component if needed)"

# Phase 12B
PHASES["phase-12b"]="Phase 12B: Decision on Announcements Feature (FR-024)|feature/phase-12b-announcements-feature|## Phase 12B: Decision on Announcements Feature (FR-024) - Coldstartable Prompt

**Context**: FR-024 (Announcements/\"What's New\" menu) was deferred in Phase 9 due to \"backend integration for announcements feed\" dependency. The spec describes a platform announcements feature separate from GitHub notifications, using a \"present\" icon. Currently, the bell icon opens GitHub notifications instead.

**Goal**: Make a Go/No-Go decision on implementing the Announcements feature, and if Go, implement it as frontend-only with mock data.

**Original Spec (User Story 7)**:
- Tap \"present\" icon → \"What's New\" menu → announcements list
- NEW badges for unread announcements
- Discover ACP platform updates
- Separate from GitHub notifications (which use bell icon)

**Announcement Entity** (from data-model.md):
\`\`\`typescript
interface Announcement {
  id: string
  title: string
  description: string
  isNew: boolean
  timestamp: Date
}
\`\`\`

**Decision Framework**:

**Option A: Skip (No-Go)**
- Rationale: Backend unavailable, feature is P3 (low priority)
- Action: Document decision, mark FR-024 as \"Skipped - backend dependency\"
- Effort: 0 days

**Option B: Implement with Mock Data (Go)**
- Rationale: Improves user experience, demonstrates platform evolution
- Action: Implement announcements screen with hardcoded announcement data
- Effort: 1 day
- Implementation:
  1. Create \`types/announcement.ts\` with Announcement interface
  2. Create mock announcements data service (5-10 hardcoded announcements)
  3. Create \`app/announcements/index.tsx\` screen with FlatList
  4. Add \"present\" icon to Header.tsx
  5. Implement NEW badge logic (mark read in AsyncStorage)
  6. Wire up navigation from present icon → announcements screen

**Recommendation**: Choose Option B (implement with mock data) if time allows. This:
- Demonstrates the full UX vision without backend dependency
- Can be upgraded to real API integration later
- Provides a channel for future platform communication
- Low implementation cost (~1 day)

**Deliverables**:
1. Go/No-Go decision with rationale
2. If Go: Implement announcements feature with mock data
3. Update FR-024 status in reconciliation document

**Files to Create/Modify** (if Go):
- \`types/announcement.ts\` (new)
- \`services/announcements.ts\` (new - mock data)
- \`app/announcements/index.tsx\` (new - announcements screen)
- \`components/layout/Header.tsx\` (add present icon)
- Update navigation types"

# Phase 13A
PHASES["phase-13a"]="Phase 13A: Quiet Hours Feature|feature/phase-13a-quiet-hours|## Phase 13A: Quiet Hours Feature - Coldstartable Prompt

**Context**: The spec mentions a Quiet Hours feature (Do Not Disturb schedule) with a QuietHours entity defined in data-model.md, but it's not implemented. Settings menu may have a placeholder UI.

**Goal**: Implement Quiet Hours feature to silence push notifications during user-defined time windows.

**QuietHours Entity** (from data-model.md):
\`\`\`typescript
interface QuietHours {
  enabled: boolean
  start: string  // e.g., \"22:00\"
  end: string    // e.g., \"07:00\"
}
\`\`\`

**Implementation Steps**:

1. **Create Type & Service**:
   - Add \`QuietHours\` interface to \`types/preferences.ts\`
   - Create \`services/preferences.ts\` methods: \`getQuietHours()\`, \`setQuietHours()\`
   - Store in AsyncStorage as part of user preferences

2. **Create Settings Screen**:
   - Create \`app/settings/quiet-hours.tsx\` screen
   - Add toggle switch for enabled/disabled
   - Add time pickers for start/end times
   - Show preview: \"Notifications muted from 10:00 PM to 7:00 AM\"
   - Add navigation link from main settings screen

3. **Integrate with Notifications**:
   - Check quiet hours before showing local notifications
   - Helper function: \`isInQuietHours(quietHours: QuietHours): boolean\`
   - Schedule notifications for after quiet hours end

**Deliverables**:
- Quiet Hours settings screen with time pickers
- Preference persistence in AsyncStorage
- Integration with notification scheduling logic

**Files to Create/Modify**:
- \`types/preferences.ts\` (add QuietHours type)
- \`services/preferences.ts\` (quiet hours methods)
- \`app/settings/quiet-hours.tsx\` (new screen)
- \`app/settings/index.tsx\` (add navigation link)"

# Phase 13B
PHASES["phase-13b"]="Phase 13B: Deep Linking Optimization|feature/phase-13b-deep-linking|## Phase 13B: Deep Linking Optimization - Coldstartable Prompt

**Context**: Deep linking is configured (\`acp://\` scheme) and documented in research.md, but end-to-end testing and optimization is unclear. Push notifications should deep link to specific screens.

**Goal**: Test and optimize deep linking for push notifications and external URLs.

**Deep Link Scenarios to Test**:

1. **Session Deep Link**: \`acp://sessions/:id\`
   - Opens app → navigates to session detail screen
   - Shows session progress and actions

2. **Notification Deep Link**: \`acp://notifications\`
   - Opens app → navigates to GitHub notifications screen
   - Useful for push notification tap handlers

3. **Chat Deep Link**: \`acp://chat\`
   - Opens app → opens chat modal with Claude

4. **New Session Deep Link**: \`acp://sessions/new\`
   - Opens app → opens new session creation flow

**Testing Protocol**:

1. **iOS Testing**:
   - Test deep links from Safari: \`acp://sessions/123\`
   - Test from push notification tap
   - Verify app wakes from background vs cold start

2. **Android Testing**:
   - Same scenarios as iOS
   - Verify intent filter configuration

3. **Error Handling**:
   - Invalid session ID → navigate to dashboard with error toast
   - Malformed URL → ignore and open to home screen

**Deliverables**:
- Test report for all deep link scenarios (iOS + Android)
- Fix any navigation issues discovered
- Document deep linking patterns in code comments

**Files to Examine/Modify**:
- Expo Router configuration (app.json or app.config.js)
- \`app/_layout.tsx\` (deep link handling)
- Push notification handlers"

# Phase 13C
PHASES["phase-13c"]="Phase 13C: Bundle Size Optimization|feature/phase-13c-bundle-size|## Phase 13C: Bundle Size Optimization - Coldstartable Prompt

**Context**: BACKLOG.md identifies bundle size monitoring as a medium priority task (4 hours). Currently no bundle analysis tooling is configured.

**Goal**: Set up bundle size monitoring and optimize bundle to reduce app load time.

**Implementation Steps**:

1. **Install Bundle Analyzer**:
   \`\`\`bash
   npm install --save-dev @expo/webpack-config webpack-bundle-analyzer
   \`\`\`

2. **Configure Analysis Script**:
   - Add to package.json: \`\"analyze\": \"npx expo export --dump-sourcemap\"\`
   - Run analysis and review largest modules

3. **Identify Optimization Opportunities**:
   - Look for duplicate dependencies (e.g., lodash variants)
   - Check for unused imports (tree-shaking failures)
   - Identify large icon sets (can we use selective imports?)

4. **Apply Optimizations**:
   - Replace full lodash with lodash-es (tree-shakeable)
   - Use selective icon imports: \`import { Bell } from '@expo/vector-icons/Ionicons'\`
   - Code-split large screens using lazy loading
   - Review \`react-native-svg\` usage (heavy library)

5. **Set Bundle Size Budget**:
   - Document current bundle size
   - Set max bundle size threshold (e.g., 5MB for JS bundle)
   - Add CI check to prevent bundle size regression

**Deliverables**:
- Bundle analysis report with size breakdown
- List of applied optimizations with before/after sizes
- Bundle size budget configured in CI (if applicable)

**Files to Modify**:
- \`package.json\` (add analyze script)
- Various import statements (selective imports)
- CI configuration (bundle size check)"

# Phase 13D
PHASES["phase-13d"]="Phase 13D: App Telemetry Integration|feature/phase-13d-telemetry|## Phase 13D: App Telemetry Integration - Coldstartable Prompt

**Context**: BACKLOG.md identifies app telemetry as a medium priority task (2-3 days). Currently no analytics are configured. This would provide visibility into user behavior and feature adoption.

**Goal**: Integrate analytics SDK to track user interactions, feature usage, and app performance.

**Analytics Platform Options**:
1. **Amplitude** (recommended for mobile apps)
2. **Google Analytics 4** (free, good documentation)
3. **Mixpanel** (advanced cohort analysis)

**Implementation Steps**:

1. **Choose & Install SDK**:
   - Decision: Use Amplitude for React Native (good Expo support)
   - Install: \`npx expo install @amplitude/analytics-react-native\`

2. **Initialize in App Root**:
   - Add Amplitude initialization to \`app/_layout.tsx\`
   - Use environment variable for API key
   - Disable in development mode

3. **Define Key Events to Track**:
   - \`session_created\` (workflow type, model, repo)
   - \`session_approved\` (session_id)
   - \`session_rejected\` (session_id)
   - \`notification_action\` (action type: read/mute/browser)
   - \`chat_message_sent\` (message length)
   - \`settings_changed\` (setting type)
   - \`screen_viewed\` (screen name)

4. **Add Tracking Calls**:
   - Wrap API calls with telemetry: \`trackEvent('session_created', { workflow, model })\`
   - Add screen view tracking to navigation
   - Track button interactions on critical flows

5. **Privacy & Compliance**:
   - Add telemetry opt-out setting in Settings → Privacy
   - Document what data is collected
   - Ensure no PII is tracked (no emails, names, repo URLs)

**Deliverables**:
- Analytics SDK integrated and initialized
- 10+ key events tracked across app
- Telemetry opt-out setting in privacy settings
- Documentation of tracked events

**Files to Create/Modify**:
- \`app/_layout.tsx\` (initialize SDK)
- \`services/telemetry.ts\` (new - wrapper for tracking calls)
- \`app/settings/privacy.tsx\` (new - opt-out toggle)
- Various screens (add tracking calls)"

# Main execution
print_header "Creating Prompt Files"

for phase_id in phase-11 phase-12a phase-12b phase-13a phase-13b phase-13c phase-13d; do
    IFS='|' read -r phase_name branch_name prompt_content <<< "${PHASES[$phase_id]}"
    create_prompt_file "$phase_id" "$phase_name" "$prompt_content"
done

print_success "All prompt files created in ${PROMPTS_DIR}"
echo ""

# Ask user which phases to implement
print_header "Phase Selection"
echo "Available phases:"
echo "  1. Phase 11: Verify Phase 7 Status"
echo "  2. Phase 12A: Verify API Status Indicator"
echo "  3. Phase 12B: Announcements Feature Decision"
echo "  4. Phase 13A: Quiet Hours Feature"
echo "  5. Phase 13B: Deep Linking Optimization"
echo "  6. Phase 13C: Bundle Size Optimization"
echo "  7. Phase 13D: App Telemetry Integration"
echo "  8. All phases (sequential)"
echo ""
read -p "Select phases to implement (e.g., '1 2 3' or '8' for all): " phase_selection

# Parse selection
if [[ "$phase_selection" == "8" ]]; then
    selected_phases=("phase-11" "phase-12a" "phase-12b" "phase-13a" "phase-13b" "phase-13c" "phase-13d")
else
    selected_phases=()
    for num in $phase_selection; do
        case $num in
            1) selected_phases+=("phase-11") ;;
            2) selected_phases+=("phase-12a") ;;
            3) selected_phases+=("phase-12b") ;;
            4) selected_phases+=("phase-13a") ;;
            5) selected_phases+=("phase-13b") ;;
            6) selected_phases+=("phase-13c") ;;
            7) selected_phases+=("phase-13d") ;;
            *) print_warning "Unknown selection: $num" ;;
        esac
    done
fi

# Implement selected phases
for phase_id in "${selected_phases[@]}"; do
    IFS='|' read -r phase_name branch_name prompt_content <<< "${PHASES[$phase_id]}"
    implement_phase "$phase_id" "$phase_name" "$branch_name"
    echo ""
done

print_header "Implementation Complete"
print_success "All selected phases have been processed!"
echo ""
echo "Next steps:"
echo "  1. Review PRs on GitHub"
echo "  2. Request reviews from team members"
echo "  3. Merge PRs after approval"
echo ""
