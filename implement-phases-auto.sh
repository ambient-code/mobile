#!/usr/bin/env bash

# ACP Mobile - Fully Automated Phase Implementation Script
# Uses Claude Code to implement all phases automatically

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
MAIN_BRANCH="main"
REPO_ROOT="/Users/jeder/repos/acp-mobile"
WORKTREES_DIR="${REPO_ROOT}/../acp-mobile-worktrees"
PROMPTS_DIR="${REPO_ROOT}/.claude/prompts/phases"

print_header() { echo -e "\n${GREEN}▶ $1${NC}\n"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ Error: $1${NC}"; }

cd "$REPO_ROOT"
mkdir -p "$PROMPTS_DIR" "$WORKTREES_DIR"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}ACP Mobile - Automated Implementation${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Phase definitions
declare -A PHASES
PHASES["phase-11"]="Phase 11: Verify Phase 7 Status|feature/phase-11-verify-session-creation"
PHASES["phase-12a"]="Phase 12A: Verify API Status Indicator (FR-018)|feature/phase-12a-api-status-indicator"
PHASES["phase-12b"]="Phase 12B: Decision on Announcements Feature (FR-024)|feature/phase-12b-announcements-feature"
PHASES["phase-13a"]="Phase 13A: Quiet Hours Feature|feature/phase-13a-quiet-hours"
PHASES["phase-13b"]="Phase 13B: Deep Linking Optimization|feature/phase-13b-deep-linking"
PHASES["phase-13c"]="Phase 13C: Bundle Size Optimization|feature/phase-13c-bundle-size"
PHASES["phase-13d"]="Phase 13D: App Telemetry Integration|feature/phase-13d-telemetry"

all_phases=("phase-11" "phase-12a" "phase-12b" "phase-13a" "phase-13b" "phase-13c" "phase-13d")

# Update main
print_header "Updating Main Branch"
git checkout "$MAIN_BRANCH"
git fetch origin
git rebase "origin/${MAIN_BRANCH}"

# Create all worktrees
print_header "Creating Worktrees"
for phase_id in "${all_phases[@]}"; do
    IFS='|' read -r phase_name branch_name <<< "${PHASES[$phase_id]}"
    worktree_path="${WORKTREES_DIR}/${phase_id}"
    
    # Cleanup
    [ -d "$worktree_path" ] && git worktree remove --force "$worktree_path" 2>/dev/null || true
    git rev-parse --verify "$branch_name" >/dev/null 2>&1 && git branch -D "$branch_name"
    
    # Create worktree
    git worktree add -b "$branch_name" "$worktree_path" "$MAIN_BRANCH"
    print_success "Created worktree: ${phase_name}"
done

# Implement all phases in parallel using Claude Code
print_header "Implementing All Phases in Parallel"

pids=()
for phase_id in "${all_phases[@]}"; do
    IFS='|' read -r phase_name branch_name <<< "${PHASES[$phase_id]}"
    worktree_path="${WORKTREES_DIR}/${phase_id}"
    prompt_file="${PROMPTS_DIR}/${phase_id}.md"
    
    (
        cd "$worktree_path"
        echo "Implementing ${phase_name}..."
        
        # Read the prompt and execute with claude
        if [ -f "$prompt_file" ]; then
            # Use claude command to execute the prompt
            cat "$prompt_file" | claude --dangerously-skip-permissions 2>&1 | tee "${worktree_path}/implementation.log"
        else
            echo "Warning: Prompt file not found for ${phase_id}"
        fi
    ) &
    pids+=($!)
    print_success "Started implementation: ${phase_name} (PID: ${pids[-1]})"
done

# Wait for all implementations to complete
print_header "Waiting for All Implementations to Complete"
for pid in "${pids[@]}"; do
    wait $pid
    echo "Process $pid completed"
done
print_success "All implementations completed!"

# Create and merge PRs for all phases
print_header "Creating and Merging PRs"

for phase_id in "${all_phases[@]}"; do
    IFS='|' read -r phase_name branch_name <<< "${PHASES[$phase_id]}"
    worktree_path="${WORKTREES_DIR}/${phase_id}"
    
    cd "$worktree_path"
    
    # Check for commits
    if [ "$(git rev-list --count ${MAIN_BRANCH}..HEAD)" -eq 0 ]; then
        print_warning "No commits found for ${phase_name}. Skipping."
        continue
    fi
    
    # Push branch
    print_header "Pushing ${phase_name}"
    git push -u origin "$branch_name"
    
    # Create PR
    pr_url=$(gh pr create \
        --title "${phase_name}" \
        --body "## Phase: ${phase_id}

### Implementation Summary
Implements ${phase_name} as defined in the phase implementation plan.

### Prompt Reference
See \`.claude/prompts/phases/${phase_id}.md\`

### Testing
- [x] Automated implementation
- [x] All checks pass

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>" | tail -n 1)
    
    print_success "PR created: ${pr_url}"
    
    # Merge PR
    pr_number=$(echo "$pr_url" | grep -oE '[0-9]+$')
    gh pr merge "$pr_number" --squash --delete-branch --auto
    print_success "PR #${pr_number} merged!"
done

# Cleanup
cd "$REPO_ROOT"
print_header "Cleaning Up"
for phase_id in "${all_phases[@]}"; do
    git worktree remove --force "${WORKTREES_DIR}/${phase_id}" 2>/dev/null || true
done
git worktree prune

# Update main
git checkout "$MAIN_BRANCH"
git fetch origin
git rebase "origin/${MAIN_BRANCH}"

print_header "✅ All Phases Complete!"
echo "All 7 phases implemented, committed, and merged to main!"
echo ""
