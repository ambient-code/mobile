# Changelog Management Skill

Manage CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/) format.

## Usage

This skill provides commands for maintaining the project changelog in a consistent format.

---

## /changelog add

Add an entry to the Unreleased section of CHANGELOG.md.

### Interactive Flow

When you invoke `/changelog add`, the skill will prompt you for:

1. **Category** - Choose from:
   - Added (new features)
   - Changed (changes to existing functionality)
   - Deprecated (soon-to-be removed features)
   - Removed (removed features)
   - Fixed (bug fixes)
   - Security (security improvements)

2. **Description** - User-facing description of the change

3. **PR Number** (optional) - Pull request number (e.g., #123)

4. **Author** (optional) - GitHub username (e.g., @jeder)

### Implementation

The skill will:

1. Read CHANGELOG.md
2. Find the `## [Unreleased]` section
3. Find or create the appropriate `### {Category}` subsection
4. Add entry in format: `- {description} (#PR by @author)`
5. Check for duplicate entries
6. Write updated CHANGELOG.md
7. Confirm the addition

### Example

```markdown
## [Unreleased]

### Added

- Real-time session updates via Server-Sent Events (#42 by @jeder)
- Performance monitoring dashboard for development

### Fixed

- Token expiration validation in AuthAPI (#45 by @jeder)
```

---

## /changelog release [version]

Create a new release version from Unreleased entries.

### Usage

```
/changelog release 1.2.0
```

### Implementation

The skill will:

1. **Validate semver format** (X.Y.Z)
2. **Get today's date** (YYYY-MM-DD)
3. **Move [Unreleased] entries** to new version section
4. **Create empty [Unreleased]** section
5. **Optional**: Update package.json version
6. **Optional**: Create git commit and tag

### Example Output

```markdown
## [Unreleased]

## [1.0.0] - 2025-11-26

### Added

- Real-time session updates via Server-Sent Events
- Performance monitoring dashboard

### Fixed

- Token expiration validation in AuthAPI
```

### Post-Release Actions

After running `/changelog release`, you can:

```bash
# Review the changes
git diff CHANGELOG.md

# Commit the release
git add CHANGELOG.md package.json
git commit -m "Release v1.2.0"

# Tag the release
git tag -a v1.2.0 -m "Release v1.2.0"

# Push to remote
git push origin main --tags
```

---

## /changelog validate

Validate CHANGELOG.md format and structure.

### Checks Performed

1. **Valid Keep a Changelog header** present
2. **[Unreleased] section** exists
3. **Valid categories** (Added, Changed, Deprecated, Removed, Fixed, Security)
4. **Version format** matches semver (X.Y.Z)
5. **Date format** matches YYYY-MM-DD
6. **Entry format** follows `- Description` pattern
7. **No duplicate entries**

### Output

Reports:

- ✅ Validation passed
- ❌ Issues found with specific line numbers and suggestions

### Example

```
✅ Changelog validation passed!

Or:

❌ Changelog validation failed:
- Line 15: Invalid category "Features" (should be "Added")
- Line 23: Missing date for version 1.0.0
- Duplicate entry found: "Add OAuth authentication"
```

---

## Implementation Notes

### Keep a Changelog Format

The changelog follows this structure:

```markdown
# Changelog

All notable changes to ACP Mobile will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New features

### Changed

- Changes to existing functionality

### Deprecated

- Soon-to-be removed features

### Removed

- Removed features

### Fixed

- Bug fixes

### Security

- Security improvements

## [1.0.0] - 2025-11-26

### Added

- Initial release
```

### Semver Guidelines

Version numbers follow Semantic Versioning (semver):

- **Major (X.0.0)**: Breaking changes
- **Minor (0.X.0)**: New features (backwards compatible)
- **Patch (0.0.X)**: Bug fixes (backwards compatible)

### Entry Writing Guidelines

Good changelog entries:

- **Describe the change**, not the code
- **User-facing language** (avoid technical jargon)
- **Include context** when helpful
- **Link to PR or issue** when available

Examples:

```markdown
✅ GOOD:

- Add OAuth authentication with Red Hat SSO (#42)
- Fix session list not updating after SSE disconnect (#45)
- Improve performance of session list rendering by 40% (#47)

❌ BAD:

- Updated AuthAPI.ts
- Fixed bug
- Refactored code
```

---

## Integration with Release Process

### Recommended Workflow

1. **During development**: Add entries with `/changelog add` for each PR
2. **Before release**: Review and clean up Unreleased entries
3. **Create release**: Run `/changelog release X.Y.Z`
4. **Validate**: Run `/changelog validate`
5. **Commit and tag**: Create git commit and tag
6. **Deploy**: Push to trigger release pipeline

### GitHub Actions Integration

The changelog skill can be used in GitHub Actions for automated validation:

```yaml
- name: Validate Changelog
  run: |
    # Install Claude Code CLI (future)
    # claude /changelog validate
    # Exit with error if validation fails
```

---

## Tips

- **Commit frequently**: Add changelog entries as you make changes
- **Be specific**: "Add OAuth authentication" is better than "Add auth"
- **Group related changes**: Multiple related fixes can be in one entry
- **Update before PR**: Include changelog entry in your pull request
- **Use validation**: Run `/changelog validate` before committing

---

## Example Session

```
User: /changelog add

Skill: What category is this change?
1. Added
2. Changed
3. Deprecated
4. Removed
5. Fixed
6. Security

User: 1

Skill: What changed? (user-facing description)

User: Real-time session updates via Server-Sent Events

Skill: PR number (optional, press Enter to skip):

User: 42

Skill: Author (optional, press Enter to skip):

User: @jeder

Skill: ✅ Added to CHANGELOG.md under "Added":
- Real-time session updates via Server-Sent Events (#42 by @jeder)
```

---

For more information on Keep a Changelog, visit: https://keepachangelog.com/
