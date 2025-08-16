"use server"

import { SignInSchema, SignUpSchema } from "./schema";
import { prisma } from "../../../prisma/primsa";
import { comparePasswords, generateSalt, hashPassword } from "../core/passwordHasher";
import { cookies } from "next/headers";
import { createUserSession, removeUserFromSession, validateSession } from "../core/session";
import {redirect} from "next/navigation";
import { OAuthClient } from "../core/base";


//!This is for SignIn Logic
export const signIn = async (data: SignInSchema) => {
  if (!data) return "Unable to Login to your account.";

  let user = await prisma.user.findUnique({
    where: { email: data.email },
    select: { email: true , password : true , salt : true, id: true, role: true },
  });

 if (user == null || user.password == null || user.salt == null) {
    return "Unable to log you in"
  }


  let isCorrectPassword = await comparePasswords({hashedPassword: user.password, password: data.password, salt: user.salt})

  if(!isCorrectPassword) return "Unable to log you in"
  await createUserSession({ id: user.id, role: user.role}, await cookies())
  redirect("/");
};

//!This is for SignUp Logic
export const signUp = async (data: SignUpSchema) => {
  if (!data) return "Unable to create account.";

  let existingUser = await prisma.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });

  if (existingUser !== null) return "User already exist for this email!";

  try {
    let salt = generateSalt();
    let hashedPassword = await hashPassword(data.password, salt);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email:data.email,
        password: hashedPassword,
        salt
      },
      select : {
        id: true,
        role : true
      }
    });

    if (user == null) return "Unable to create account"
    await createUserSession(user, await cookies())
  } catch (error) {
    return "Unable to create account.";
  }
  redirect("/");
};


// !log out functionality : user->logout->remove the session from db and cookies
export async function logOut() {  
  await removeUserFromSession(await cookies())
  redirect("/sign-in")
}


// ! function to check if auth is still valid in db
export const checkAuth = async () => {
  const session = await validateSession(await cookies());
  if(!session) return false
  return true
}

// ! Oauth Sign in function

export const oAuthSignIn = async (provider : string) => {
  redirect( new OAuthClient().createAuthUrl(await cookies()))
} 
