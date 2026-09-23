// netlify-auth-providers ships no types. This covers only the surface
// we actually use — see node_modules/netlify-auth-providers/lib/netlify.js
// for the real (untyped) implementation.
declare module "netlify-auth-providers" {
  export type NetlifyAuthOptions = {
    provider: "github" | "gitlab" | "bitbucket" | "email";
    scope?: string;
    site_id?: string;
    login?: boolean;
  };

  export type NetlifyAuthData = {
    token: string;
    provider: string;
  };

  export type NetlifyAuthError = {
    toString(): string;
  };

  export default class NetlifyAuthenticator {
    constructor(config?: { site_id?: string; base_url?: string });
    authenticate(
      options: NetlifyAuthOptions,
      callback: (err: NetlifyAuthError | null, data?: NetlifyAuthData) => void
    ): void;
  }
}
