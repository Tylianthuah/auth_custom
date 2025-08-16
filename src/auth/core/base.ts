import { GithubUserSchema, TokenResponse } from "../nextjs/schema";
import { Cookies } from "./session";

export class OAuthClient<T> {
  private get redirectURL() {
    return new URL("github", process.env.OAUTH_REDEIRECT_URL).toString();
  }

  createAuthUrl(cookies: Pick<Cookies, "set">) {
    let url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID as string);
    url.searchParams.set("redirect_uri", this.redirectURL);
    url.searchParams.set("scope", "read:user user:email");
    console.log(url.toString());
    return url.toString();
  }

  async fetchUser(code: string) {
    let { access_token, token_type } = await this.fetchToken(code);
    const userUrl = new URL("https://api.github.com/user");
    let response = await fetch(userUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}` ,
        "Content-Type": "application/json",
      },
    });

    let user = await response.json();

    // 2. If email is missing, fetch from /user/emails
    if (!user.email) {
      const emailRes = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const emails = await emailRes.json();

      const primaryEmail = emails.find((e: any) => e.primary && e.verified);
      user.email = primaryEmail?.email ?? null;
    }

    return {
      id: user.id,
      name: user.name,
      email : user.email,
    };
  }

  private async fetchToken(code: string): Promise<TokenResponse> {
    let response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        code,
        redirect_uri: this.redirectURL,
        client_id: process.env.GITHUB_CLIENT_ID as string,
        client_secret: process.env.GITHUB_CLIENT_SECRET as string,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status}`);
    }

    let rawData = await response.json();

    if (!rawData.access_token || !rawData.token_type) {
      console.log("Invalid Token");
    }

    return {
      access_token: rawData.access_token,
      token_type: rawData.token_type,
    };
  }
}
