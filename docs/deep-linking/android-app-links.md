# Android App Links Configuration

This document explains how to configure Android App Links for the ACP Mobile app.

## Overview

Android App Links allow the app to open automatically when users click on web links to the ACP platform. This provides a seamless experience and ensures deep links work correctly on Android devices.

## Configuration Steps

### 1. App Configuration (Already Complete)

The app is configured in `app.json` with the following settings:

```json
{
  "android": {
    "package": "com.redhat.acp.mobile",
    "intentFilters": [
      {
        "action": "VIEW",
        "autoVerify": true,
        "data": [
          {
            "scheme": "https",
            "host": "ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com",
            "pathPrefix": "/"
          },
          {
            "scheme": "https",
            "host": "ambient-code.redhat.com",
            "pathPrefix": "/"
          }
        ],
        "category": ["BROWSABLE", "DEFAULT"]
      }
    ]
  }
}
```

### 2. Server Configuration (Backend Team Action Required)

The backend team must host a Digital Asset Links JSON file at:

**Staging:**

```
https://ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com/.well-known/assetlinks.json
```

**Production:**

```
https://ambient-code.redhat.com/.well-known/assetlinks.json
```

### 3. Digital Asset Links File Content

The `assetlinks.json` file must contain:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.redhat.acp.mobile",
      "sha256_cert_fingerprints": ["REPLACE_WITH_RELEASE_KEYSTORE_SHA256_FINGERPRINT"]
    }
  }
]
```

### 4. Generating the SHA-256 Fingerprint

#### Development Build (Debug Keystore)

For testing during development:

```bash
# Find the debug keystore location
KEYSTORE_PATH="$HOME/.android/debug.keystore"

# Generate SHA-256 fingerprint
keytool -list -v -keystore "$KEYSTORE_PATH" -alias androiddebugkey -storepass android -keypass android | grep "SHA256"
```

Copy the SHA-256 fingerprint (format: `XX:XX:XX:XX:...`) and convert it to uppercase without colons:

```
Example: AA:BB:CC:DD:... → AABBCCDD...
```

#### Production Build (Release Keystore)

For production releases:

```bash
# Use the release keystore
keytool -list -v -keystore /path/to/release-keystore.jks -alias release-key | grep "SHA256"
```

**Important**: The production fingerprint must match the keystore used to sign the app in Google Play Store.

### 5. Testing Android App Links

#### Test with adb (Android Debug Bridge)

```bash
# Test staging URL
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com/sessions/abc123"

# Test production URL
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://ambient-code.redhat.com/sessions/abc123"
```

#### Verify Link Association

```bash
# Check if app is verified for domain
adb shell pm get-app-links com.redhat.acp.mobile

# Expected output should show "verified" status
```

#### Manual Testing

1. Send yourself an email or message with a deep link:

   ```
   https://ambient-code.redhat.com/sessions/abc123
   ```

2. Tap the link on your Android device

3. The app should open directly (not show a disambiguation dialog)

### 6. Troubleshooting

#### Link Opens in Browser Instead of App

**Possible causes:**

- Digital Asset Links file is missing or incorrect
- SHA-256 fingerprint doesn't match the app's signing certificate
- `autoVerify: true` is not set in `intentFilters`
- Domain verification failed

**Solution:**

```bash
# Clear verification state
adb shell pm set-app-links --package com.redhat.acp.mobile 0 all

# Re-verify
adb shell pm verify-app-links --re-verify com.redhat.acp.mobile

# Check status
adb shell pm get-app-links com.redhat.acp.mobile
```

#### Digital Asset Links Validation Errors

Use Google's Statement List Generator and Tester:

```
https://developers.google.com/digital-asset-links/tools/generator
```

#### Verify assetlinks.json is Accessible

```bash
# Staging
curl https://ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com/.well-known/assetlinks.json

# Production
curl https://ambient-code.redhat.com/.well-known/assetlinks.json
```

Expected response:

- HTTP 200 status
- `Content-Type: application/json`
- Valid JSON matching the format above

### 7. Security Considerations

1. **HTTPS Required**: App Links only work over HTTPS (not HTTP)

2. **Certificate Validation**: Android verifies the domain's SSL certificate

3. **Fingerprint Accuracy**: SHA-256 fingerprint MUST match the signing certificate exactly

4. **File Location**: Must be served from `/.well-known/assetlinks.json` (exact path)

5. **No Redirects**: The assetlinks.json file must be served directly (no 301/302 redirects)

### 8. Backend Team Checklist

- [ ] Create `assetlinks.json` file with correct package name
- [ ] Obtain SHA-256 fingerprint from mobile team
- [ ] Add fingerprint to assetlinks.json (remove colons, uppercase)
- [ ] Deploy file to `/.well-known/assetlinks.json` on both staging and production
- [ ] Verify file is accessible via HTTPS
- [ ] Verify `Content-Type: application/json` header is set
- [ ] Test with Google's validation tool
- [ ] Notify mobile team when deployed

### 9. Development vs. Production

#### Development (Debug Builds)

- Uses debug keystore: `~/.android/debug.keystore`
- Fingerprint changes per developer machine
- For local testing only
- Not suitable for App Links verification

#### Production (Release Builds)

- Uses release keystore from Google Play Console
- Single consistent fingerprint across all builds
- Required for App Links to work in production
- Managed by Red Hat's mobile CI/CD pipeline

### 10. References

- [Android App Links Documentation](https://developer.android.com/training/app-links)
- [Digital Asset Links Protocol](https://developers.google.com/digital-asset-links/v1/getting-started)
- [Expo Linking Configuration](https://docs.expo.dev/guides/linking/)
- [Android Intent Filters](https://developer.android.com/guide/components/intents-filters)

## Quick Start

**For Backend Team:**

1. Generate assetlinks.json using [Google's tool](https://developers.google.com/digital-asset-links/tools/generator)
2. Get SHA-256 fingerprint from mobile team
3. Deploy to `/.well-known/assetlinks.json`
4. Verify with `curl`

**For Mobile Team:**

1. Generate SHA-256 fingerprint: `keytool -list -v -keystore ...`
2. Send to backend team
3. Test with `adb shell pm get-app-links com.redhat.acp.mobile`
4. Verify links open app directly
