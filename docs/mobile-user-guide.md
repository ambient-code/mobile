# ACP Mobile User Guide

Welcome to the ACP Mobile app! This guide will help you get started and make the most of monitoring your AI coding sessions on the go.

## Table of Contents

- [Getting Started](#getting-started)
  - [Installing the App](#installing-the-app)
  - [First Login](#first-login)
- [Main Screens](#main-screens)
  - [Dashboard (Home)](#dashboard-home)
  - [Sessions List](#sessions-list)
  - [Session Details](#session-details)
  - [Notifications](#notifications)
  - [Settings](#settings)
- [Key Features](#key-features)
  - [Real-time Session Monitoring](#real-time-session-monitoring)
  - [Offline Mode](#offline-mode)
  - [Theme Switching](#theme-switching)
- [Settings & Preferences](#settings-preferences)
  - [Appearance](#appearance)
  - [Notification Preferences](#notification-preferences)
  - [Repository Management](#repository-management)
  - [Profile & Sign Out](#profile-sign-out)
- [Tips & Troubleshooting](#tips-troubleshooting)

---

## Getting Started

### Installing the App

The ACP Mobile app is available for both iOS and Android devices.

**iOS (iPhone/iPad)**

1. Open the TestFlight invitation link sent to your email
2. Tap "Accept" to join the beta
3. Tap "Install" to download the app
4. Open ACP Mobile from your home screen

**Android**

1. Download the APK file from the provided link
2. Open the APK file on your Android device
3. Allow installation from unknown sources if prompted
4. Tap "Install"
5. Open ACP Mobile from your app drawer

!!! info "For Red Hat Users"
Red Hat employees can request access through the internal distribution channel. Contact the AI Engineering team for TestFlight invitations or APK download links.

![Screenshot: Login screen](images/screenshots/mobile-login-oauth.png)
_The OAuth login screen when you first open the app_

### First Login

When you first open the app, you'll be prompted to log in:

1. **Tap "Sign In"** on the welcome screen
2. **Authorize the app** using OAuth
   - You'll be redirected to the authentication page
   - Review the permissions requested
   - Tap "Authorize" to continue

!!! info "For Red Hat Users"
Authentication uses Red Hat SSO. Use your Red Hat credentials (username@redhat.com) to log in. If you encounter issues, ensure you have access to the ACP platform first.

3. **Grant permissions** (if prompted)
   - Notifications: Allows the app to send you alerts about session updates
   - These can be configured later in Settings

4. **You're in!** The app will load your dashboard

---

## Main Screens

### Dashboard (Home)

The dashboard is your command center for monitoring AI sessions.

![Screenshot: Main dashboard](images/screenshots/mobile-dashboard-main.png)
_The main dashboard showing active sessions and quick actions_

**Quick Action Buttons**

At the top of the dashboard, you'll find shortcut buttons:

- **Interactive**: Opens the interactive chat interface (coming soon)
- **Running Sessions**: Shows all currently running sessions
- **Notifications**: View GitHub notifications and alerts
- **Other Actions**: Additional quick actions like "I'm Feeling Lucky" and "Inspire Me"

**Active Sessions**

Below the quick actions, you'll see your active AI coding sessions:

- **Session Cards**: Each card shows:
  - Session name/description
  - Current status (Running, Paused, Done, Failed)
  - Progress bar with percentage
  - AI model being used (e.g., Sonnet 4.5, Opus 4.5)
  - Time information
- **Tap a card** to view full session details
- **Pull down to refresh** the session list

**Connection Status**

![Screenshot: Connection status](images/screenshots/mobile-connection-status.png)
_Connection status indicator with retry button_

At the bottom of the screen, you'll see the connection status:

- **Connected**: Green indicator, real-time updates active
- **Connecting...**: Yellow indicator, attempting to reconnect
- **Disconnected**: Red indicator with "Retry" button

If disconnected, tap "Retry" to manually reconnect.

**Offline Mode**

![Screenshot: Offline banner](images/screenshots/mobile-dashboard-offline.png)
_Dashboard with offline mode banner_

When you're offline, a banner appears at the top:

- You can still view cached session data
- Real-time updates are paused
- The app will automatically reconnect when online

---

### Sessions List

View and filter all your AI coding sessions.

![Screenshot: Sessions list](images/screenshots/mobile-sessions-list.png)
_The sessions list view showing all sessions_

**Accessing Sessions List**

- Tap "View All" on the dashboard, or
- Tap the "{N} Running" quick action button

**Filter Sessions**

![Screenshot: Filter chips](images/screenshots/mobile-sessions-filters.png)
_Filter chips for viewing different session types_

Use the filter chips at the top to view:

- **All**: Every session
- **Running**: Currently active sessions
- **Paused**: Sessions that are paused
- **Done**: Completed sessions
- **Failed**: Sessions that encountered errors

**Session Actions**

- **Tap a session** to view details
- **Pull down** to refresh the list
- **Scroll** to load more sessions (if many exist)

---

### Session Details

View detailed information about a specific AI coding session.

![Screenshot: Session details](images/screenshots/mobile-session-detail.png)
_Detailed view of a session showing progress, model, and logs_

**Session Information**

- **Status**: Current state (Running, Paused, Done, Failed)
- **Progress**: Overall completion percentage with visual bar
- **Model**: Which AI model is handling this session
- **Created**: When the session started
- **Updated**: Last activity timestamp
- **Description**: Session purpose or task description

**Progress Updates**

For running sessions, you'll see:

- **Real-time progress updates**: The progress bar updates automatically
- **Current task**: What the AI is currently working on
- **Status changes**: Transitions from Running → Paused → Done

**Session Actions** (coming in future updates)

- Pause/Resume session
- Stop session
- View generated code
- Download session artifacts

---

### Notifications

View GitHub notifications and important alerts.

![Screenshot: Notifications](images/screenshots/mobile-notifications.png)
_Notifications screen showing GitHub activity_

**Accessing Notifications**

- Tap the "Notifications" quick action on the dashboard, or
- Tap the notifications icon in the header

**Types of Notifications**

- **GitHub Activity**: Pull requests, issues, mentions
- **Review Requests**: Code reviews needing your attention
- **Session Updates**: Important session events (if enabled)
- **Blocking Alerts**: Critical issues requiring immediate attention

**Managing Notifications**

- **Tap a notification** to view details or navigate to the related item
- **Swipe left** (iOS) or **long-press** (Android) for actions (coming soon)
- **Pull down** to refresh notifications

!!! info "For Red Hat Users"
GitHub notifications are filtered to show repositories you have access to within your Red Hat organization.

---

### Settings

Customize your app experience and manage your account.

![Screenshot: Settings main](images/screenshots/mobile-settings-main.png)
_Main settings screen_

**Accessing Settings**

- Tap your avatar (profile picture) in the top-right corner of the dashboard

**Settings Sections**

1. **Profile**: View your account information
2. **Notifications**: Configure notification preferences
3. **Integrations**: Manage connected repositories (coming soon)
4. **Preferences**: App appearance and behavior
5. **Actions**: Feedback and sign out

---

## Key Features

### Real-time Session Monitoring

The app uses Server-Sent Events (SSE) to provide real-time updates without draining your battery:

**What Updates in Real-Time**

- Session progress percentages
- Status changes (Running → Paused → Done)
- Current task descriptions
- Error notifications

**How It Works**

- Updates appear automatically (no need to refresh)
- Minimal battery impact (efficient SSE connection)
- Works in background when app is open
- Automatically reconnects if connection drops

**Connection Management**

If the real-time connection drops:

1. The app will automatically attempt to reconnect
2. You'll see a "Connecting..." status indicator
3. If reconnection fails, tap "Retry" manually
4. Cached data remains available while offline

---

### Offline Mode

The app works offline with cached data:

**What Works Offline**

- View previously loaded sessions
- See cached session details
- Browse notifications (cached)
- Access settings

**What Doesn't Work Offline**

- Real-time updates (progress, status changes)
- Creating new sessions
- Refreshing data
- GitHub integration

**Getting Back Online**

- The app automatically detects when you're back online
- Real-time updates resume automatically
- You may want to pull-to-refresh to get the latest data

---

### Theme Switching

Customize the app's appearance to match your preference or device settings.

**Available Themes**

- **Light Mode**: Light background with dark text
- **Dark Mode**: Dark background with light text
- **System Default**: Matches your device's theme setting (recommended)

**How to Change Theme**

See [Appearance Settings](#appearance) below.

---

## Settings & Preferences

### Appearance

Customize how the app looks.

![Screenshot: Appearance settings](images/screenshots/mobile-settings-appearance.png)
_Appearance settings screen showing theme options_

**To Change Theme:**

1. Open **Settings** (tap your avatar)
2. Tap **Preferences** → **Appearance**
3. Select your preferred theme:
   - **Light**: Always use light mode
   - **Dark**: Always use dark mode
   - **System Default**: Match your device settings (recommended)
4. The theme changes immediately

**Tip**: System Default is recommended as it automatically adapts to your device's day/night settings.

---

### Notification Preferences

Control what notifications you receive.

![Screenshot: Notification preferences](images/screenshots/mobile-settings-notifications.png)
_Notification preferences screen_

**To Configure Notifications:**

1. Open **Settings** (tap your avatar)
2. Tap **Notifications**
3. Toggle each notification type:

**Notification Types**

- **Blocking Alerts** (Recommended: ON)
  - Critical issues requiring immediate attention
  - Sessions that have failed
  - Security alerts

- **Review Requests** (Recommended: ON)
  - Code reviews assigned to you
  - Pull request mentions
  - Review comments

- **Session Updates** (Recommended: ON)
  - Session completion notifications
  - Status changes (Running → Done)
  - Progress milestones

- **Features and News** (Recommended: OFF)
  - New feature announcements
  - Product updates
  - Tips and tricks

**Quiet Hours**

Configure specific times when notifications should be silenced:

1. Open **Settings** → **Notifications** → **Quiet Hours**
2. Toggle "Enable Quiet Hours" ON
3. Set your **Start Time** (e.g., 22:00 / 10:00 PM)
4. Set your **End Time** (e.g., 08:00 / 8:00 AM)
5. Changes save automatically

**Note**: All notifications will be silenced during quiet hours, including blocking alerts. You can review any missed notifications after quiet hours end.

---

### Repository Management

View and manage connected GitHub repositories.

![Screenshot: Repository management](images/screenshots/mobile-settings-repos.png)
_Repository management screen_

**To Manage Repositories:**

1. Open **Settings** (tap your avatar)
2. Tap **Integrations** → **Repositories**
3. View currently connected repositories

**Connected Repositories** (Coming Soon)

- See all repositories you have access to
- Connect/disconnect repositories
- Configure repository-specific settings

!!! info "For Red Hat Users"
Only repositories within your Red Hat organization are accessible. Contact your team lead if you need access to additional repositories.

---

### Profile & Sign Out

View your profile information and manage your account.

**Viewing Your Profile**

1. Open **Settings** (tap your avatar)
2. Your profile information is displayed at the top:
   - Name
   - Email
   - Avatar

**Sending Feedback**

1. Open **Settings**
2. Tap **Send Feedback**
3. You'll be redirected to a feedback form
4. Share your thoughts, report issues, or request features

**Signing Out**

1. Open **Settings**
2. Scroll to the bottom
3. Tap **Sign Out**
4. Confirm when prompted

**What Happens When You Sign Out:**

- You'll be logged out of the app
- Cached data is cleared for security
- You'll return to the login screen
- Your sessions remain safe in the cloud

---

## Tips & Troubleshooting

### Using the App Effectively

**Best Practices**

- **Enable notifications** to stay informed about session completions
- **Use System Default theme** for automatic light/dark mode switching
- **Pull to refresh** when you want the latest data
- **Check connection status** if updates seem delayed

**Power Saving Tips**

- The app is designed to be battery-efficient
- Real-time updates use minimal power
- Close the app when not actively monitoring sessions
- Offline mode saves battery while still providing access to cached data

---

### Common Issues

**App Won't Connect**

1. Check your internet connection
2. Tap the "Retry" button in the connection status indicator
3. Try closing and reopening the app
4. If problems persist, try signing out and back in

**Sessions Not Updating**

1. Check the connection status indicator at the bottom
2. Ensure you're online
3. Pull down to refresh manually
4. Verify the session is actually running (not paused/done)

**Login Issues**

!!! info "For Red Hat Users"
If you can't log in with your Red Hat credentials:

    1. Verify you have access to the ACP web platform first
    2. Ensure you're using your full email (username@redhat.com)
    3. Try logging in from a web browser first
    4. Contact the AI Engineering team if issues persist

**For external users**:

1. Verify your OAuth credentials are correct
2. Check that you've been granted access to the platform
3. Try resetting your password if needed

**Notifications Not Working**

1. Check notification settings in the app
2. Verify app permissions in your device settings:
   - iOS: Settings → Notifications → ACP Mobile
   - Android: Settings → Apps → ACP Mobile → Notifications
3. Ensure "Blocking Alerts" or desired categories are enabled

**App Crashes or Freezes**

1. Force close the app and reopen
2. Restart your device
3. Check for app updates in TestFlight/Play Store
4. Report the issue via Settings → Send Feedback

---

### Getting Help

**Need Assistance?**

- **Send Feedback**: Settings → Send Feedback
- **Documentation**: Visit the [full documentation site](https://ambient-code.github.io/acp-mobile)
- **Report Bugs**: Use the GitHub Issues page (link in feedback form)

!!! info "For Red Hat Users"
Contact the AI Engineering team via Slack or email for immediate assistance with access issues or critical bugs.

**Feature Requests**

Have an idea for improving the app? We'd love to hear it!

1. Go to Settings → Send Feedback
2. Describe your feature request
3. Explain how it would help your workflow

---

## What's Coming Next

The following features are currently in development:

- **Interactive Chat**: Chat with Claude directly from your mobile device
- **Create New Sessions**: Start AI coding sessions on the go
- **GitHub Integration**: Enhanced repository management and code viewing
- **Push Notifications**: Get alerts even when the app is closed
- **Quiet Hours**: Schedule notification quiet times
- **Session Actions**: Pause, resume, and stop sessions from your phone
- **Code Preview**: View generated code in session details

---

**Thank you for using ACP Mobile!** We're constantly improving the app based on your feedback. Happy monitoring! 🚀
