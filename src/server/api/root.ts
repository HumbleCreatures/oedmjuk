import { createTRPCRouter } from "./trpc";
import { spaceRouter } from "./routers/spaceRouter";
import { contentRouter } from "./routers/contentRouter";
import { userRouter } from "./routers/userRouter";
import { calendarEventRouter } from "./routers/calendarEventRouter";
import { proposalRouter } from "./routers/proposalRouter";
import { selectionRouter } from "./routers/selectionRouter";
import { feedbackRouter } from "./routers/feedbackRouter";
import { dataIndexRouter } from "./routers/dataIndexRouter";
import { bodyTemplateRouter } from "./routers/bodyTemplateRouter";
import { accessRequestRouter } from "./routers/accessRequestRouter";
import { connectAccessRequestRouter } from "./routers/accessRequestTypes/connectAccessRequestRouter";
import { connectCalendarEventRouter } from "./routers/accessRequestTypes/connectCalendarEventRouter";
import { connectFeedbackRoundRouter } from "./routers/accessRequestTypes/connectFeedbackRoundRouter";
import { initTRPC } from '@trpc/server';
const t = initTRPC.create();
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
  dataIndex: dataIndexRouter,
  bodyTemplate: bodyTemplateRouter,
  accessRequest:  t.mergeRouters(accessRequestRouter, connectAccessRequestRouter, connectFeedbackRoundRouter, connectCalendarEventRouter)
});

// export type definition of API
export type AppRouter = typeof appRouter;
