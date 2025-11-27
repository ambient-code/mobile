# Universal Links Setup for acp-mobile

## Overview

Universal Links provide a secure way to handle OAuth callbacks without the vulnerability of custom URL schemes being hijacked by malicious apps.

## iOS Configuration (Already Complete)

✅ Added to `app.json`:

```json
"associatedDomains": [
  "applinks:ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com",
  "applinks:ambient-code.redhat.com"
]
```

✅ Updated `utils/constants.ts` to use Universal Links in production

## Backend Configuration (Required)

### 1. Host apple-app-site-association File

The backend needs to serve an `apple-app-site-association` file at:

**Staging:**

```
https://ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com/.well-known/apple-app-site-association
```

**Production:**

```
https://ambient-code.redhat.com/.well-known/apple-app-site-association
```

### 2. File Contents

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.redhat.acp-mobile",
        "paths": ["/auth/callback/mobile"]
      }
    ]
  }
}
```

**Important:**

- Replace `TEAM_ID` with your Apple Developer Team ID
- Update bundle identifier if changed from `com.redhat.acp-mobile`
- File must be served with `Content-Type: application/json`
- HTTPS is required
- No redirects allowed (must be direct response)

### 3. Server Configuration

The file must be served:

- Without authentication
- With HTTPS
- Directly (no HTTP redirects)
- With header: `Content-Type: application/json`

Example nginx config:

```nginx
location /.well-known/apple-app-site-association {
    default_type application/json;
    add_header Content-Type application/json;
    root /var/www/static;
}
```

### 4. OAuth Callback Endpoint

Add a new endpoint to handle Universal Link callbacks:

```
POST /auth/callback/mobile
```

This should:

1. Accept the OAuth authorization code
2. Exchange it for tokens
3. Return a response (or use deep linking to return to app)

## Testing Universal Links

### 1. Verify apple-app-site-association

Use Apple's validator:

```bash
curl https://ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com/.well-known/apple-app-site-association
```

Or use online tool:
https://branch.io/resources/aasa-validator/

### 2. Test on Device

1. Build and install app on physical iOS device
2. Open Notes app
3. Type the Universal Link: `https://ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com/auth/callback/mobile?code=test`
4. Long-press the link
5. Should show "Open in ACP Mobile" option

### 3. Test OAuth Flow

1. Trigger OAuth login in app
2. Complete authentication
3. Verify app receives callback via Universal Link
4. Check logs to confirm Universal Link was used (not custom scheme)

## Security Benefits

✅ **Prevents URL Scheme Hijacking** - Only your app can claim these URLs
✅ **No User Confirmation** - Opens app directly without dialog
✅ **Verified Ownership** - Apple verifies you own the domain
✅ **Better UX** - Seamless transition from web to app

## Fallback Behavior

- **Development**: Uses custom scheme `acp://` for easier testing
- **Production**: Uses Universal Links for security
- Falls back gracefully if Universal Link fails

## Required Actions

- [ ] Add Team ID to apple-app-site-association file
- [ ] Deploy apple-app-site-association to staging server
- [ ] Deploy apple-app-site-association to production server
- [ ] Verify file is accessible via HTTPS
- [ ] Update OAuth redirect URI in backend configuration
- [ ] Test Universal Link on physical device
- [ ] Update App Store submission with production domain

## Troubleshooting

### Universal Link Not Working

1. **Check file is accessible**:

   ```bash
   curl -I https://ambient-code.apps.rosa.vteam-stage.7fpc.p3.openshiftapps.com/.well-known/apple-app-site-association
   ```

2. **Verify Team ID is correct**:
   - Login to https://developer.apple.com
   - Go to Membership
   - Copy Team ID

3. **Clear iOS Universal Link cache**:
   - Uninstall app
   - Restart device
   - Reinstall app

4. **Check device logs**:
   ```bash
   # Connect device to Mac
   Console.app > Device > swcd
   # Look for "apple-app-site-association" entries
   ```

### Still Using Custom Scheme

1. Check `__DEV__` flag in constants.ts
2. Verify production build, not development
3. Confirm associated domains in Xcode capabilities

## References

- [Apple Universal Links Documentation](https://developer.apple.com/ios/universal-links/)
- [Supporting Associated Domains](https://developer.apple.com/documentation/xcode/supporting-associated-domains)
- [Debugging Universal Links](https://developer.apple.com/library/archive/documentation/General/Conceptual/AppSearch/UniversalLinks.html)
