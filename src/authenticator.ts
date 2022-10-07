import { ClientOptions } from './types'
import { JWT } from './jwt'

export class Authenticator {
  public readonly issuer: string
  private _options: ClientOptions

  constructor(issuer: string, options: ClientOptions) {
    this.issuer = issuer
    this._options = options
  }

  get options(): ClientOptions {
    return {
      ...this._options,
      secret: ''
    }
  }

  get discoveryURL(): string {
    return `${this.issuer}/.well-known/openid-configuration`
  }

  authorizeWith(state: string, scope: string[]): Response {
    return Response.redirect(
      `${this.options.authorizationEndpoint}?response_type=code&client_id=${this.options.id}&redirect_uri=${this.options.redirectUri}&scope=${scope.join('%20')}&state=${state}`,
      302
    )
  }

  async discovery() {
    const config: any = await fetch(
      this.discoveryURL,
      { cf: { cacheTtl: this.options.discoveryCacheTTL || 0, cacheEverything: true } }
    ).then(res => res.json())

    this._options = {
      ...this._options,
      authorizationEndpoint: config.authorization_endpoint,
      tokenEndpoint: config.token_endpoint,
      keysEndpoint: config.jwks_uri,
    }
  }

  async exchange(code): Promise<JWT> {
    const body = JSON.stringify({
      grant_type: 'authorization_code',
      client_id: this.options.id,
      client_secret: this._options.secret,
      code,
      redirect_uri: this.options.redirectUri,
    })

    const res:any = await fetch(this.options.tokenEndpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: body }).then(res => res.json())
    const token: JWT = new JWT(res.id_token)
    const isValid: boolean = await this.verify(token)

    return token
  }

  async verify(token: JWT): Promise<boolean> {
    const jwks: any = await fetch(
      this.options.keysEndpoint,
      { cf: { cacheTtl: this.options.discoveryCacheTTL || 0, cacheEverything: true }}
    ).then(res => res.json())

    const keyData = jwks.keys.find(key => key.kid == token.header.kid)
    const key = await crypto.subtle.importKey('jwk', keyData, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])

    return await token.verify(key)
  }
}
