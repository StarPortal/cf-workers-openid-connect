import { ClientOptions, Environment } from './types'
import { Authenticator } from './authenticator'
export * from './types'
export * from './authenticator'
export * from './jwt'

export function buildAuthenticator(env: Environment): Authenticator {
  const options = {
    id: env.OIDC_CLIENT_ID,
    secret: env.OIDC_CLIENT_SECRET,
    redirectUri: env.OIDC_CLIENT_REDIRECT_URI,
    authorizationEndpoint: env.OIDC_CLIENT_AUTHORIZATION_ENDPOINT,
    tokenEndpoint: env.OIDC_CLIENT_TOKEN_ENDPOINT,
    keysEndpoint: env.OIDC_CLIENT_KEYS_ENDPOINT,
    discoveryCacheTTL: Number(env.OIDC_DISCOVERY_CACHE_TTL)
  }

  return new Authenticator(env.OIDC_ISSUER, options)
}

export function extractAuthReturn(request): string[] {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  return [code, state]
}
