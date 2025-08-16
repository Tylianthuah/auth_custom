import { OAuthClient } from "@/auth/core/base";
import { GithubUserSchema } from "@/auth/nextjs/schema";
import { OAuthProvider } from "@prisma/client";
import { redirect } from "next/navigation";
import { NextRequest} from "next/server";
import { prisma } from "../../../../../prisma/primsa";

export async function GET(req: NextRequest, {params} : {params : {provider : OAuthProvider}}) {
  let {provider} = params
  console.log(provider);
  const code = req.nextUrl.searchParams.get("code");
  if (typeof code !== "string") {
    redirect(
      `/sign-in?oauthError=${encodeURIComponent("Failed to connect.Try again")}`
    );
  }

  const user = await new OAuthClient().fetchUser(code);
  console.log(user)
}


async function connectUserToAccount(
  { id, email, name }: { id: string; email: string; name: string },
  provider: OAuthProvider
) {
  return prisma.$transaction(async (tx) => {
    // 1. Try to find user by email
    let user = await tx.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    })

    // 2. If not found, create new user
    if (!user) {
      user = await tx.user.create({
        data: {
          email,
          name,
        },
        select: { id: true, role: true },
      })
    }

    // 3. Connect account, ignore if already exists
    await tx.userOAuthAccount.create({
      data: {
        provider,
        providerAccountId: id,
        userId: user.id,
      },
    }).catch(() => {
      // ignore conflict if unique constraint fails
    })

    return user
  })
}

