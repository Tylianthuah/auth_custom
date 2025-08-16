import crypto from "crypto";
import { prisma } from "../../../prisma/primsa";

const SESSION_EXPIRATION_SECONDS =  10 ;
const COOKIE_SESSION_KEY = "session-id";

export type Cookies = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax";
      expires?: number;
    }
  ) => void;
  get: (key: string) => { name: string; value: string } | undefined;
  delete: (key: string) => void;
};

export const createUserSession = async (
  user: { id: string; role: string },
  cookies: Pick<Cookies, "set">
) => {
  try {
    const sessionId = crypto.randomBytes(32).toString("hex").normalize();
    const data = await prisma.session.create({
      data: {
        sessionId,
        userId: user.id,
        role: user.role,
        expires: new Date(Date.now() + SESSION_EXPIRATION_SECONDS * 1000),
      },
    });

    console.log(sessionId);

    if (data?.sessionId) {
      setCookies(data.sessionId, cookies);
      return true;
    }

    return false;
  } catch (error) {
    return "Unable to create a session";
  }
};

const setCookies = (sessionId: string, cookies: Pick<Cookies, "set">) => {
  cookies.set(COOKIE_SESSION_KEY, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: Date.now() + 10 * 1000,
  });
};

export const removeUserFromSession = async (
  cookies: Pick<Cookies, "get" | "delete">
) => {
  let sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;

  if (sessionId) {
    await prisma.session.delete({ where: { sessionId } });
    cookies.delete(COOKIE_SESSION_KEY);
  }
};

export async function getUserSessionById(sessionId: string) {
  let session = await prisma.session.findUnique({
    where: { sessionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
        },
      },
    },
  });

  if (!session) return null;

  return session?.user;
}


// ! This function will check if there is any session and when the session expires, on next validation, delete it from db.
export async function validateSession(cookies: Cookies) {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value; 
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { sessionId },
  });

  if (!session) return null;

  // Check expiration
  if (session.expires < new Date()) {
    // Remove expired session
    await prisma.session.delete({ where: { sessionId } });
    return null;
  }

  return session;
}
