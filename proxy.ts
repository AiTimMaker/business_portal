import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ token }) => process.env.DEMO_MODE === "true" || Boolean(token),
  },
});

export const config = {
  matcher: ["/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)"],
};
