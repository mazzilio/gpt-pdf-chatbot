import { authMiddleware } from '@clerk/nextjs';

// Middleware.ts is ran before anything else hits an endpoint client/server-side

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware

// All routes are private
export default authMiddleware({
	publicRoutes: ['/', '/api/middleware'],
});

export const config = {
	matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
