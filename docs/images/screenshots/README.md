# Screenshot Requirements

This directory contains screenshots for the ACP Mobile user guide documentation.

## Naming Convention

Use consistent naming pattern: `mobile-{feature}-{variant}.png`

Examples:

- `mobile-dashboard-main.png`
- `mobile-settings-appearance.png`
- `mobile-session-detail.png`

## Required Screenshots

The following screenshots are needed for the mobile user guide:

1. **mobile-login-oauth.png** - OAuth login screen
2. **mobile-dashboard-main.png** - Main dashboard view with active sessions
3. **mobile-dashboard-offline.png** - Dashboard with offline banner displayed
4. **mobile-sessions-list.png** - Sessions list view with all sessions
5. **mobile-sessions-filters.png** - Filter chips showing All/Running/Paused/Done options
6. **mobile-session-detail.png** - Individual session details screen
7. **mobile-notifications.png** - GitHub notifications screen
8. **mobile-settings-main.png** - Main settings screen
9. **mobile-settings-appearance.png** - Appearance/theme settings screen
10. **mobile-settings-notifications.png** - Notification preferences screen
11. **mobile-settings-repos.png** - Repository management screen
12. **mobile-connection-status.png** - Connection status indicator with retry button

## Screenshot Specifications

- **Device**: iPhone 14 (primary test device) or similar modern iOS device
- **Format**: PNG with transparency where applicable
- **Size**: Native resolution (retina display preferred)
- **Theme**: Show both light and dark mode variants where relevant (use `-light` or `-dark` suffix)
- **Status Bar**: Include status bar for authenticity, but hide sensitive information
- **Content**: Use realistic but non-sensitive demo data

## Adding New Screenshots

1. Take screenshots on the target device
2. Rename according to the naming convention above
3. Optimize file size (use tools like ImageOptim or similar)
4. Place in this directory (`docs/images/screenshots/`)
5. Reference in user guide with format:
   ```markdown
   ![Screenshot: Description](images/screenshots/mobile-feature-name.png)
   _Caption describing what the screenshot shows_
   ```

## Notes

- Keep file sizes reasonable (< 500KB per image) for fast page loads
- Ensure screenshots are up-to-date with current UI
- Avoid including personal or sensitive information in screenshots
- Use demo data or placeholder content where applicable
