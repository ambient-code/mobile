# Security Best Practices

Guidelines for maintaining security in the ACP Mobile codebase.

## Data Storage

### Sensitive Data

**ALWAYS** use SecureStore for:

- OAuth access tokens
- OAuth refresh tokens
- API keys
- User credentials
- Session tokens
- Code verifiers (PKCE)

```typescript
import * as SecureStore from 'expo-secure-store'

// Store sensitive data
await SecureStore.setItemAsync('accessToken', token)

// Retrieve sensitive data
const token = await SecureStore.getItemAsync('accessToken')

// Delete sensitive data
await SecureStore.deleteItemAsync('accessToken')
```

### Non-Sensitive Data

Use AsyncStorage for:

- Cached session data (non-sensitive)
- User preferences
- Theme settings
- UI state

**NEVER** store sensitive data in AsyncStorage - it's unencrypted.

## Authentication

### Token Management

1. **Validate token expiration** before using:

   ```typescript
   if (TokenManager.isTokenExpired(token)) {
     await TokenManager.refreshToken()
   }
   ```

2. **Implement automatic token refresh**:
   - Refresh 5 minutes before expiration
   - Queue requests during refresh
   - Handle refresh failures gracefully

3. **Clear tokens on logout**:
   ```typescript
   await TokenManager.clearTokens()
   await AsyncStorage.clear() // Clear cached data
   ```

### OAuth Security

1. **Use PKCE flow** (Proof Key for Code Exchange):
   - Generate random code verifier
   - Store in SecureStore (NOT memory)
   - Use code challenge in authorization request

2. **Validate redirect URIs**:
   - Use Universal Links (iOS) / App Links (Android)
   - NEVER use custom URL schemes in production (`acp://`)

3. **Implement state parameter**:
   - Prevent CSRF attacks
   - Validate state on callback

## API Security

### Request Validation

1. **Validate all API responses** with Zod schemas:

   ```typescript
   import { z } from 'zod'

   const SessionSchema = z.object({
     id: z.string(),
     status: z.enum(['running', 'paused', 'done', 'failed']),
     progress: z.number().min(0).max(100),
   })

   // Validate response
   const session = SessionSchema.parse(apiResponse)
   ```

2. **Handle validation errors**:
   ```typescript
   try {
     const data = Schema.parse(response)
   } catch (error) {
     logger.error('Invalid API response', error)
     // Show user-friendly error
   }
   ```

### Network Security

1. **Use HTTPS only**:
   - All API requests must use `https://`
   - Reject `http://` in production

2. **Implement certificate pinning** (production):

   ```typescript
   // TODO: Implement SSL pinning
   // See SECURITY_AUDIT_SUMMARY.md for details
   ```

3. **Set request timeouts**:
   ```typescript
   const client = axios.create({
     timeout: 10000, // 10 seconds
     timeoutErrorMessage: 'Request timed out',
   })
   ```

## Input Validation

### User Input

1. **Sanitize all user input**:

   ```typescript
   const sanitizedInput = input.trim().slice(0, 1000)
   ```

2. **Validate URL inputs**:

   ```typescript
   const isValidGitHubUrl = (url: string) => {
     return url.match(/^https:\/\/github\.com\/[\w-]+\/[\w-]+/)
   }
   ```

3. **Prevent injection attacks**:
   - NEVER concatenate user input into queries
   - Use parameterized queries/requests
   - Escape special characters

## Error Handling

### Logging Security

1. **NEVER log sensitive data**:

   ```typescript
   // ❌ BAD
   console.log('Token:', accessToken)

   // ✅ GOOD
   logger.debug('Token refreshed successfully')
   ```

2. **Use logger utility** (strips logs in production):

   ```typescript
   import { logger } from '@/utils/logger'

   logger.error('API error', { endpoint, statusCode })
   // Sensitive data like tokens automatically redacted
   ```

3. **Sanitize error messages**:

   ```typescript
   // ❌ BAD - exposes internal details
   throw new Error(`Database connection failed: ${dbHost}`)

   // ✅ GOOD - generic message
   throw new Error('Unable to connect to server')
   ```

### Production Error Handling

1. **Implement global error handler**:

   ```typescript
   ErrorUtils.setGlobalHandler((error, isFatal) => {
     logger.error('Global error', { error, isFatal })
     // Send to error tracking (Sentry)
     // Show user-friendly message
   })
   ```

2. **Use Error Boundaries**:
   - Wrap critical components
   - Provide fallback UI
   - Log errors for debugging

## Code Security

### Dependencies

1. **Keep dependencies updated**:

   ```bash
   npm audit
   npm audit fix
   ```

2. **Review dependency changes**:
   - Check changelogs before updating
   - Test thoroughly after updates
   - Use lock files (`package-lock.json`)

3. **Avoid insecure packages**:
   - Check npm advisory database
   - Use `npm audit` in CI/CD

### Code Review Checklist

Before merging, verify:

- [ ] No hardcoded credentials or tokens
- [ ] Sensitive data stored in SecureStore
- [ ] All API responses validated with Zod
- [ ] No `console.log()` with sensitive data
- [ ] Error messages don't expose internal details
- [ ] User input is sanitized and validated
- [ ] HTTPS used for all network requests
- [ ] Token expiration checked before use

## Deep Linking Security

### URL Validation

1. **Validate deep link URLs**:

   ```typescript
   const isValidDeepLink = (url: string) => {
     // Whitelist of allowed deep link patterns
     const allowedPatterns = [
       /^https:\/\/acp\.redhat\.com\/sessions\/[\w-]+$/,
       /^https:\/\/acp\.redhat\.com\/notifications\/[\w-]+$/,
     ]
     return allowedPatterns.some((pattern) => pattern.test(url))
   }
   ```

2. **Prevent open redirects**:
   - NEVER redirect to user-controlled URLs
   - Validate redirect destinations
   - Use whitelist of allowed domains

## Platform Security

### iOS Specific

1. **App Transport Security** (ATS):
   - Enabled by default
   - Only allows HTTPS connections
   - Don't disable without security review

2. **Keychain access**:
   - SecureStore uses iOS Keychain
   - Data encrypted with device passcode
   - Survives app uninstall (configurable)

### Android Specific

1. **Network Security Config**:
   - Configure in `android/app/src/main/res/xml/network_security_config.xml`
   - Pin certificates for production
   - Clear text traffic disabled

2. **ProGuard/R8**:
   - Obfuscate code in production builds
   - Remove unused code
   - Makes reverse engineering harder

## Jailbreak/Root Detection

### Detection Strategy

1. **Implement device integrity checks**:

   ```typescript
   import JailMonkey from 'jail-monkey'

   if (JailMonkey.isJailBroken()) {
     // Show warning or block sensitive operations
   }
   ```

2. **Handle detected devices**:
   - **Option 1**: Block authentication
   - **Option 2**: Show warning but allow use
   - **Option 3**: Reduced functionality

## Compliance

### OWASP Mobile Top 10

See [Security Audit](../../SECURITY_AUDIT_SUMMARY.md) for current compliance status.

### Privacy Manifest (iOS)

Required for App Store submission:

1. **Data Collection Declaration**:
   - User ID
   - Email address
   - Session data

2. **Tracking Domains**: None (we don't track users)

3. **Required Reason APIs**: None used

### GDPR Compliance

For European users:

1. **Data Minimization**: Only collect necessary data
2. **Consent**: Clear opt-in for analytics (if added)
3. **Data Deletion**: Provide account deletion option
4. **Data Portability**: Export user data on request

## Security Testing

### Before Each Release

1. **Run security audit**:

   ```bash
   npm audit
   npm run lint
   npm run type-check
   ```

2. **Manual security checks**:
   - [ ] Test with expired tokens
   - [ ] Test with invalid API responses
   - [ ] Test with network offline
   - [ ] Test OAuth flow end-to-end
   - [ ] Verify no sensitive data in logs

3. **Penetration testing** (production):
   - Test SSL certificate pinning
   - Attempt MITM attack
   - Test deep link injection
   - Review network traffic

## Incident Response

### If Security Issue Discovered

1. **Assess severity**:
   - Critical: Immediate action required
   - High: Fix within 24 hours
   - Medium: Fix in next patch release
   - Low: Fix in next regular release

2. **Notify stakeholders**:
   - Security team
   - Product owner
   - Affected users (if data breach)

3. **Implement fix**:
   - Create hotfix branch
   - Test thoroughly
   - Deploy emergency update

4. **Document incident**:
   - Root cause analysis
   - Timeline of events
   - Lessons learned
   - Prevention measures

## Resources

- [OWASP Mobile Security Project](https://owasp.org/www-project-mobile-security/)
- [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
- [Expo Security Best Practices](https://docs.expo.dev/guides/security/)
- [React Native Security](https://reactnative.dev/docs/security)

---

For current security status, see:

- [Security Audit Summary](../../SECURITY_AUDIT_SUMMARY.md)
- [Development Backlog](../../BACKLOG.md) - Security improvements planned
