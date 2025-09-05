import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { AuthOptions } from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/prisma"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY!)

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      // This function is called when NextAuth wants to send the magic link
      async sendVerificationRequest({ identifier: email, url, provider }) {
        // Send your custom email using Resend
        await resend.emails.send({
          from: "Bubbly <bubbly@mail.linus.id.au>",
          to: email,
          subject: "Your Account Sign-in Link",
          html: `
            <div style="font-family: 'Segoe UI', Roboto, sans-serif; background: #f9fafb; padding: 40px 0;">
              <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="margin: 0; font-size: 26px; color: #111; font-weight: 600;">
                    Sign in to <span style="color: #6366f1;">WaterNearMe</span> 👋
                  </h1>
                </div>

                <p style="font-size: 16px; line-height: 1.6; color: #444; text-align: center;">
                  Welcome back! Click the button below to securely sign in. <br/>
                  <strong>This link expires in 10 minutes.</strong>
                </p>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="${url}" 
                    style="display: inline-block; background-color: #6366f1; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 3px 6px rgba(0,0,0,0.1);">
                    Sign in
                  </a>
                </div>

                <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />

                <p style="font-size: 14px; color: #888; line-height: 1.5; text-align: center;">
                  Didn’t request this email? You can safely ignore it.<br/>
                  For security reasons, never share this link.
                </p>
              </div>
            </div>
          `,
        })
      },
      maxAge: 10 * 60, // 10 minutes
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add username to the session object
      if (session.user) {
        session.user.id = user.id
        session.user.username = user.username
        session.user.image = user.image
      }
      return session
    },
  },
  session: { strategy: "database" },
  secret: process.env.NEXTAUTH_SECRET,
}
