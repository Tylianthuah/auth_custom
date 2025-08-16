import { Postpone } from "next/dist/server/app-render/dynamic-rendering";
import { Cookies } from "./session";
import { headers } from "next/headers";
import { raw } from "@prisma/client/runtime/library";

export class OAuthClient<T> {
  private get redirectURL() {
    return new URL("github", process.env.OAUTH_REDEIRECT_URL).toString();
  }

  createAuthUrl(cookies: Pick<Cookies, "set">) {
    let url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID as string);
    url.searchParams.set("redirect_uri", this.redirectURL);
    url.searchParams.set("scope", "user");

    return url.toString();
  }

  async fetchUsers(code: string) : Promise<{accessToken : string, tokenType: string}> {
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

    if(!response.ok) {
        throw new Error(`Token request failed: ${response.status}`)
    }

    let rawData = await response.json();

    if(!rawData.access_token || !rawData.token_type){
        console.log("Invalid Token")
    }

    console.log(rawData)
    return {
        accessToken : rawData.access_token,
        tokenType: rawData.token_type
    }
  }
}
