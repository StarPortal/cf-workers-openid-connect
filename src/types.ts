export type Environment = {
  OIDC_ISSUER: string
  OIDC_DISCOVERY_CACHE_TTL: string
  OIDC_CLIENT_ID: string
  OIDC_CLIENT_SECRET: string
  OIDC_CLIENT_REDIRECT_URI: string
  OIDC_CLIENT_AUTHORIZATION_ENDPOINT: string
  OIDC_CLIENT_TOKEN_ENDPOINT: string
  OIDC_CLIENT_KEYS_ENDPOINT: string
}

export type ClientOptions = {
  id: string,
  secret: string
  redirectUri: string
  authorizationEndpoint?: string,
  tokenEndpoint?: string
  keysEndpoint?: string
  discoveryCacheTTL?: number
}
