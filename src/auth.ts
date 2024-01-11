import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthResult } from "next-auth";
console.log(process.env)
let providers = [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ]

  export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut
  } = NextAuth({
    providers: providers,
    trustHost:true
  })
