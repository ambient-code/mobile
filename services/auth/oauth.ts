import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { getRandomBytes, digestStringAsync, CryptoDigestAlgorithm } from 'expo-crypto'
import { API_BASE_URL, OAUTH_CONFIG } from '@/utils/constants'

// Required for web browser to close after auth
WebBrowser.maybeCompleteAuthSession()

const discovery = {
  authorizationEndpoint: `${API_BASE_URL}/auth/login`,
  tokenEndpoint: `${API_BASE_URL}/auth/token`,
}

/**
 * Generate a random code verifier for PKCE
 */
function generateCodeVerifier(): string {
  const randomBytes = getRandomBytes(32)
  return base64URLEncode(randomBytes)
}

/**
 * Generate code challenge from code verifier using SHA256
 */
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const digest = await digestStringAsync(CryptoDigestAlgorithm.SHA256, codeVerifier)
  return base64URLEncode(hexToBytes(digest))
}

/**
 * Base64 URL encode (RFC 4648)
 */
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

export class OAuthService {
  private static codeVerifier: string | null = null

  static async initiateLogin(): Promise<AuthSession.AuthSessionResult> {
    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier()
    this.codeVerifier = codeVerifier

    const codeChallenge = await generateCodeChallenge(codeVerifier)

    const authRequest = new AuthSession.AuthRequest({
      clientId: OAUTH_CONFIG.clientId,
      scopes: OAUTH_CONFIG.scopes,
      redirectUri: OAUTH_CONFIG.redirectUri,
      usePKCE: true,
      codeChallenge,
      codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
    })

    return await authRequest.promptAsync(discovery)
  }

  static getCodeVerifier(): string | null {
    return this.codeVerifier
  }

  static clearCodeVerifier(): void {
    this.codeVerifier = null
  }
}
