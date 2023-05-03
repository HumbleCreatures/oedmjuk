import { createTRPCRouter } from "./trpc";
import { spaceRouter } from "./routers/spaceRouter";
import { contentRouter } from "./routers/contentRouter";
import { userRouter } from "./routers/user";
import { calendarEventRouter } from "./routers/calendarEventRouter";
import { proposalRouter } from "./routers/proposalRouter";
import { selectionRouter } from "./routers/selectionRouter";
import { feedbackRouter } from "./routers/feedbackRouter";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  space: spaceRouter,
  content: contentRouter,
  user: userRouter,
  calendarEvents: calendarEventRouter,
  proposal: proposalRouter,
  selection: selectionRouter,
  feedback: feedbackRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
