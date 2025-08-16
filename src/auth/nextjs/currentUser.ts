import { cookies } from "next/headers"
import { getUserSessionById, validateSession } from "../core/session"
import { cache } from "react"
import { redirect } from "next/navigation"

export const getCurrentUser = cache(async () => {
  const session = await validateSession( await cookies());
  if(!session) return null;
  const user = await getUserSessionById(session.sessionId)

  if(!user) return null;
  return user;
});
