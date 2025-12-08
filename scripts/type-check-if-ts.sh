#!/bin/bash
# Only run type-check if TypeScript files are staged

staged_ts_files=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$')

if [ -n "$staged_ts_files" ]; then
  echo "TypeScript files changed, running type-check..."
  npm run type-check
else
  echo "No TypeScript files changed, skipping type-check"
  exit 0
fi
