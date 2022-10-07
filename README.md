Cloudflare Workers OpenID Connect
===

This package implements the minimum required logic to let Cloudflare Workers / Pages can support OpenID Connect authentication.

## Installation

```bash
npm install @starportal/cf-workers-openid-connect
```

## Usage

### buildAuthenticator

The factory to create `Authenticator` object

Will load client options from env

| Environment name                     | Description                                   |
|--------------------------------------|-----------------------------------------------|
| `OIDC_ISSUER`                        | The issuer url e.g. `http://user.example.com` |
| `OIDC_DISCOVERY_CACHE_TTL`           | The `fetch` cache when use discovery endpoint |
| `OIDC_CLIENT_ID`                     | The application client ID                     |
| `OIDC_CLIENT_SECRET`                 | The application secret                        |
| `OIDC_CLIENT_REDIRECT_URI`           | The callback url to redirect back             |
| `OIDC_CLIENT_AUTHORIZATION_ENDPOINT` | The authorization endpoint                    |
| `OIDC_CLIENT_TOKEN_ENDPOINT`         | The endpoint to exchange code                 |
| `OIDC_CLIENT_KEYS_ENDPOINT`          | The endpoint to get JWKS to verify ID token   |

## Examples

Add `GET /oidc` nd `GET /oidc/callback` to manage the flows

```ts
// functions/oidc/index.ts
// mounted to `GET /oidc`
import { buildAuthenticator } from '@starportal/cf-workers-openid-connect'

export async function onRequestGet({ request, env, data }) {
  // The factory to build Authenticator from environment variable
  const auth = buildAuthenticator(env)

  try {
    // If the endpoint is provided this is optional
    await auth.discovery()
  } catch(e: any) {
    // Return error if issuer unavailable
    return new Response(null, { status: 500 })
  }

  // Save state to verify response
  const state = crypto.randomUUID()
  await env.StateKV.put(`state-${state}`, state, { expirationTtl: ttl || 60 })

  return auth.authorizeWith(state, ['openid', 'email']);
}
```

```ts
// functions/oidc/callback.ts
// mounted to `GET /oidc/callback`

import { JWT, buildAuthenticator, extractAuthReturn } from '@starportal/pages-openid-connect'

export async function onRequestGet({ request, env }) {
  const auth = buildAuthenticator(env)
  try {
    await auth.discovery()
  } catch(e: any) {
    return new Response(null, { status: 500 })
  }

  const [code, state] = extractAuthReturn(request)

  // Return state mismatch
  const savedState = await env.StateKV.get(`state-${state}`)
  if (sate != savedState) {
    return new Response(null, { status: 401 })
  }

  // User reject authorize application
  if(!code) {
    return new Response(null, { status: 401 })
  }

  // Exchange ID Token
  const token: JWT = await auth.exchange(code)

  // Redirect user to `/`
  const response = new Response(null, { status: 302, headers: new Headers() })
  response.headers.append('Location', '/')

  // Save ID token in your way
  setCookieHelper(response, '_session', token.toJWT())

  return response;
}
```
