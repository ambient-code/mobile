# Design System

## Theme & Colors

### Color Modes

The app supports light and dark modes, following the system setting by default with manual override available in Settings > Appearance.

### Light Mode Colors

| Element        | Hex Code  | Usage                                |
| -------------- | --------- | ------------------------------------ |
| Background     | `#f1f5f9` | Main screen background               |
| Card           | `#ffffff` | Card backgrounds, elevated surfaces  |
| Text           | `#0f172a` | Primary text color                   |
| Text Secondary | `#475569` | Secondary text, subtitles            |
| Accent         | `#4f46e5` | Buttons, links, interactive elements |
| Border         | `#e2e8f0` | Dividers, borders                    |
| Success        | `#10b981` | Success states, online indicators    |
| Warning        | `#f59e0b` | Warning states                       |
| Error          | `#ef4444` | Error states, failed indicators      |

### Dark Mode Colors

| Element        | Hex Code  | Usage                                |
| -------------- | --------- | ------------------------------------ |
| Background     | `#0f172a` | Main screen background               |
| Card           | `#1e293b` | Card backgrounds, elevated surfaces  |
| Text           | `#f1f5f9` | Primary text color                   |
| Text Secondary | `#cbd5e1` | Secondary text, subtitles            |
| Accent         | `#6366f1` | Buttons, links, interactive elements |
| Border         | `#334155` | Dividers, borders                    |
| Success        | `#10b981` | Success states, online indicators    |
| Warning        | `#f59e0b` | Warning states                       |
| Error          | `#ef4444` | Error states, failed indicators      |

### Model Badge Colors

| Model      | Color  | Hex Code  |
| ---------- | ------ | --------- |
| sonnet-4.5 | Purple | `#8b5cf6` |
| opus-4.5   | Blue   | `#3b82f6` |

## Navigation

### No Bottom Tab Bar

The app intentionally avoids a bottom tab bar navigation pattern, which is considered outdated. Instead, it uses:

- **Primary Navigation**: Single screen with quick actions and cards
- **Deep Navigation**: Stack-based navigation with back buttons
- **Floating Action Button (FAB)**: For primary action (create new session)

### Floating Action Button (FAB)

- **Position**: Bottom right corner
- **Color**: Purple circle (`#8b5cf6`)
- **Icon**: Plus icon (white)
- **Action**: Opens "New Session" screen
- **Size**: 56x56 dp

### Header Elements

The header layout (left to right):

1. **Greeting/Title** (left side)
   - Dashboard: Time-based greeting ("Good morning/afternoon/evening/night Jeremy")
   - Sub-screens: Screen title with back button

2. **Present Icon** (red/gold gift box SVG)
   - Platform features & announcements menu
   - Purple notification badge when unread items

3. **Spacer** (12px)

4. **Avatar** ("J" placeholder)
   - User menu with session notifications
   - Red notification badge when unread items

### Back Navigation

Sub-screens include a back button in the header (left side) for returning to the previous screen.

## Typography

### Font Family

- **iOS**: System font (San Francisco)
- **Android**: System font (Roboto)

### Font Scales

| Style      | Size | Weight         | Usage                    |
| ---------- | ---- | -------------- | ------------------------ |
| H1         | 28px | Bold (700)     | Screen titles            |
| H2         | 24px | Bold (700)     | Section headers          |
| H3         | 20px | Semibold (600) | Card titles              |
| Body       | 16px | Regular (400)  | Primary text             |
| Body Small | 14px | Regular (400)  | Secondary text, metadata |
| Caption    | 12px | Regular (400)  | Labels, timestamps       |
| Button     | 16px | Semibold (600) | Button labels            |

## Spacing

We use an 8px base unit for consistent spacing:

| Token | Value | Usage                            |
| ----- | ----- | -------------------------------- |
| xs    | 4px   | Tight spacing, small gaps        |
| sm    | 8px   | Component internal spacing       |
| md    | 16px  | Default spacing between elements |
| lg    | 24px  | Section spacing                  |
| xl    | 32px  | Large section gaps               |
| 2xl   | 48px  | Major section separation         |

## Components & UI Patterns

### Cards

All content containers use card-based layouts:

- **Background**: Card color (white/dark)
- **Border Radius**: 12px
- **Padding**: 16px
- **Shadow** (light mode):
  - Elevation: 2
  - Color: `rgba(0, 0, 0, 0.1)`
  - Offset: (0, 2)
  - Blur: 8px

### Badges

#### Status Badges

- **Running**: Green background (`#10b981`), white text
- **Paused**: Yellow background (`#f59e0b`), dark text
- **Done**: Blue background (`#3b82f6`), white text
- **Failed**: Red background (`#ef4444`), white text

**Style**:

- Border Radius: 12px
- Padding: 4px 8px
- Font Size: 12px
- Font Weight: 600

#### Model Badges

Display the AI model used for a session:

- **sonnet-4.5**: Purple badge (`#8b5cf6`)
  - Label: "Fast & efficient"
- **opus-4.5**: Blue badge (`#3b82f6`)
  - Label: "Most capable"

**Style**:

- Border Radius: 8px
- Padding: 4px 8px
- Font Size: 11px
- Font Weight: 500

#### "Soon" Badges

Used for features not yet implemented:

- **Background**: Light gray (`#e5e7eb`)
- **Text**: Dark gray (`#6b7280`)
- **Style**: Same as model badges

#### Notification Badges

Small circular badges on icons:

- **Size**: 8px diameter
- **Colors**:
  - Red (`#ef4444`) - Urgent notifications
  - Purple (`#8b5cf6`) - New features/announcements
- **Position**: Top-right corner of icon

### Progress Bars

Session progress visualization:

- **Height**: 4px
- **Border Radius**: 2px
- **Background**: Light gray (`#e5e7eb`)
- **Fill**: Accent color (purple/indigo)
- **Animation**: Smooth transition (300ms)

### Buttons

#### Primary Button

- **Background**: Accent color
- **Text**: White
- **Border Radius**: 8px
- **Padding**: 12px 24px
- **Font**: 16px Semibold

#### Secondary Button

- **Background**: Transparent
- **Border**: 1px solid accent color
- **Text**: Accent color
- **Border Radius**: 8px
- **Padding**: 12px 24px

#### Disabled State

- **Background**: Light gray (`#e5e7eb`)
- **Text**: Gray (`#9ca3af`)
- **Cursor**: Not allowed

### Input Fields

- **Border**: 1px solid border color
- **Border Radius**: 8px
- **Padding**: 12px
- **Font**: 16px Regular
- **Focus State**: Border changes to accent color

### Filter Chips

Used in Sessions List for filtering:

- **Active**:
  - Background: Accent color
  - Text: White
- **Inactive**:
  - Background: Transparent
  - Border: 1px solid border color
  - Text: Text color
- **Border Radius**: 16px
- **Padding**: 8px 16px

## UX Patterns

### Session Name Generation

Session names auto-generate using the pattern:

```
{repo-name} {Workflow} - {Month Day}
```

Examples:

- `platform Review - Nov 26`
- `acp-mobile Bugfix - Nov 25`
- `docs Ideate - Nov 24`

Users can edit the generated name if needed.

### Context Field

The context field (repository selection) accepts:

- **Connected Repos**: Dropdown list from saved repositories
- **Manual Entry**: Full GitHub URL (e.g., `https://github.com/ambient-code/platform`)

### Mandatory Field Indicators

Required fields are marked with a red asterisk (\*) next to the label.

### "Soon" Badge Usage

Features not yet implemented display a "Soon" badge to set user expectations:

- Workflow type: "New..." option
- Notification actions: "Start Workflow" and "Choose Different Workflow"

### Scrollable Lists

Lists use `nestedScrollEnabled` where necessary to prevent scroll conflicts:

- Sessions List
- Notifications List
- Connected Repositories
- Awaiting Review section

### Time-based Greeting

The dashboard greeting updates every 60 seconds based on local time:

- **Good morning**: 5:00 AM - 11:59 AM
- **Good afternoon**: 12:00 PM - 4:59 PM
- **Good evening**: 5:00 PM - 8:59 PM
- **Good night**: 9:00 PM - 4:59 AM

## Menus & Modals

### Present (Gift) Menu

Accessed via present icon in header.

**Structure**:

- Header: "What's New" with present icon
- Feature announcements with NEW badges
- Platform news
- Send Feedback link

**Style**:

- Modal presentation
- Full-height drawer from right (iOS) or bottom sheet (Android)
- Close button (X) in top-left

### User Menu

Accessed via avatar in header.

**Structure**:

- **Profile Section**:
  - Avatar
  - Name (e.g., "Jeremy Eder")
  - Role (e.g., "Distinguished Engineer")

- **Notifications Section**:
  - Blocking alerts (count badge if > 0)
  - Review requests (count badge if > 0)
  - Completions (count badge if > 0)

- **Quick Actions**:
  - All Sessions
  - GitHub Notifications (badge if unread)
  - Settings
  - Send Feedback
  - Sign Out

**Style**:

- Dropdown menu
- White/dark background with shadow
- Hover states on menu items

### Context Picker Modal

Used when selecting repository context for new sessions.

**Structure**:

- Title: "Select Repository"
- List of connected repos (name + branch)
- "Manage Repositories" link at bottom

**Style**:

- Bottom sheet modal
- Swipeable to dismiss
- Search bar at top (if > 10 repos)

### Interactive Chat Modal

Slide-up modal for chatting with Claude.

**Structure**:

- **Header**:
  - Close button (X) - left
  - "Claude" title with green online dot
  - "sonnet-4.5" subtitle
  - More options button (three dots) - right

- **Message Bubbles**:
  - Assistant (left): Gray background, "A" avatar
  - User (right): Accent color background, no avatar

- **Input**:
  - Rounded text field
  - Send button (arrow up icon)

- **Disclaimer**: "Claude can make mistakes. Consider checking important info."

**Style**:

- `pageSheet` presentation (iOS)
- Full-screen modal (Android)
- Keyboard-aware scroll view

## Iconography

### Icon Library

Primary: **Feather Icons** from `@expo/vector-icons`

Common icons:

- `plus` - Create new session (FAB)
- `refresh-cw` - Refresh/reload
- `check-circle` - Success, completed
- `x-circle` - Error, failed
- `pause-circle` - Paused state
- `play-circle` - Running state
- `bell` - Notifications
- `settings` - Settings
- `user` - Profile/user menu
- `github` - GitHub integration
- `message-square` - Chat

### Custom Icons

Custom SVG icons are used for:

- **Present Icon**: Red/gold gift box (features/announcements)
- **Ideate Icon**: Lightbulb (workflow type)

Custom icons are implemented using `react-native-svg`.

## Accessibility

### Color Contrast

All text meets WCAG AA standards:

- Normal text: Minimum 4.5:1 contrast ratio
- Large text (18px+): Minimum 3:1 contrast ratio

### Touch Targets

All interactive elements meet minimum touch target size:

- **Minimum**: 44x44 dp (iOS) / 48x48 dp (Android)
- **Recommended**: 48x48 dp for all platforms

### Screen Reader Support

- Meaningful labels on all interactive elements
- Proper heading hierarchy
- Descriptive button labels (not just icons)

### Dark Mode

Full dark mode support with appropriate color adjustments for readability.

## Responsive Design

### Screen Sizes

The app is optimized for:

- **iPhone**: 5.5" to 6.7" screens (primary target)
- **iPad**: Tablet layout (future enhancement)
- **Android**: 5" to 6.5" screens

### Breakpoints

- **Small**: < 375px width (iPhone SE)
- **Medium**: 375px - 414px (iPhone 12/13/14)
- **Large**: > 414px (iPhone Pro Max, Android large)

### Adaptive Layouts

- Text scales based on user's system font size preferences
- Images scale proportionally
- Touch targets expand on smaller screens

---

For implementation details, see:

- [API Reference](../api/index.md) - TypeScript API documentation
