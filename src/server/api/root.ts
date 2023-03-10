import { createTRPCRouter } from "./trpc";
import { spaceRouter } from "./routers/spaceRouter";
import { contentRouter } from "./routers/contentRouter";
import { userRouter } from "./routers/user";
import { calendarEventRouter } from "./routers/calendarEventRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  space: spaceRouter,
  content: contentRouter,
  user: userRouter,
  calendarEvents: calendarEventRouter

});

// export type definition of API
export type AppRouter = typeof appRouter;
