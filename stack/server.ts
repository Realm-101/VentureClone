import { StackServerApp } from "@stackframe/react";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up",
    afterSignIn: "/home",
    afterSignUp: "/home",
    afterSignOut: "/",
  },
});
