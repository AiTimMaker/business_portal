import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

async function refreshAccessToken(token: Record<string, unknown>) {
  try {
    const tenantId = process.env.AZURE_AD_TENANT_ID;
    const body = new URLSearchParams({
      client_id: process.env.AZURE_AD_CLIENT_ID ?? "",
      client_secret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: String(token.refreshToken ?? ""),
      scope: "openid profile email offline_access User.Read Files.ReadWrite.All Sites.Read.All Tasks.ReadWrite Group.Read.All Schedule.ReadWrite.All Team.ReadBasic.All Community.Read.All",
    });
    const response = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body },
    );
    const refreshed = await response.json();
    if (!response.ok) throw refreshed;
    return {
      ...token,
      accessToken: refreshed.access_token,
      expiresAt: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Unable to refresh Microsoft access token", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? "demo-client-id",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "demo-client-secret",
      tenantId: process.env.AZURE_AD_TENANT_ID ?? "common",
      authorization: {
        params: {
          scope: "openid profile email offline_access User.Read Files.ReadWrite.All Sites.Read.All Tasks.ReadWrite Group.Read.All Schedule.ReadWrite.All Team.ReadBasic.All Community.Read.All",
        },
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600_000;
        return token;
      }
      if (Date.now() < Number(token.expiresAt ?? 0) - 60_000) return token;
      if (!token.refreshToken) return { ...token, error: "RefreshAccessTokenError" };
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      if (session.user) {
        const email = session.user.email?.toLowerCase();
        const hrAdmins = (process.env.HR_ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase());
        session.user.role = email && hrAdmins.includes(email) ? "HR" : "Nhân viên";
      }
      return session;
    },
  },
};
