import { base64url } from 'rfc4648'

type Header = {
  typ: string
  alg: string
}

type Payload = {
  iss: string,
  sub: string,
  aud: string,
  exp: number,
  iat: number,
  nbf?: number,
  jti?: string
}

export class JWT {
  protected readonly data: string;
  protected readonly parts: string[];

  constructor(data: string) {
    this.data = data
    this.parts = data.split('.')
  }

  get header(): Header & any {
    return JSON.parse(new TextDecoder().decode(base64url.parse(this.parts[0], { loose: true })))
  }

  get payload(): Payload & any {
    return JSON.parse(new TextDecoder().decode(base64url.parse(this.parts[1], { loose: true })))
  }

  get signature(): ArrayBuffer {
    return base64url.parse(this.parts[2], { loose: true })
  }

  toJWT(): string {
    return this.data
  }

  async verify(key: CryptoKey): Promise<boolean> {
    const data = this.parts.slice(0, 2).join('.')
    return await crypto.subtle.verify(key.algorithm, key, this.signature, new TextEncoder().encode(data))
  }
}
