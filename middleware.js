// middleware.js

import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // Specify routes that should remain public (no authentication required)
  publicRoutes: ["/", "/sign-in(.*)", "/sign-up(.*)"],
});

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes as well
    '/(api|trpc)(.*)',
  ],
};
