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
          from: "WaterNearMe by Linus <waternearme@mail.linus.id.au>",
          to: email,
          subject: "Your Account Sign-in Link",
          html: `
            <div style="font-family: 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #ffffff; color: #111;">
              <h1 style="font-size: 28px; color: #000;">Sign in to <span style="color: #6366f1;">WaterNearMe</span> 👋</h1>
              <p style="font-size: 16px; line-height: 1.6;">
                Click the button below to sign in. This link will expire in 10 minutes.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${url}" style="background-color: #6366f1; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Sign in</a>
              </div>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
              <p style="font-size: 12px; color: #999;">
                If you didn't request this email, you can safely ignore it.
              </p>
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
