import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure
  .input(z.object({ userId: z.string()}))
  .query(({ ctx, input }) => { 
    return ctx.prisma.user.findUnique({where:{ id:input.userId }});
  }),
  getUserFeed: protectedProcedure
  .query(({ ctx }) => { 
    return ctx.prisma.userFeedItem.findMany({
      where:{ userId: ctx.session?.user?.id },
      include: {
        content: true,
        calendarEvent: true,
        proposal: true,
        selection: true,
        feedbackRound: true,
        space: true,
        dataIndex: {
          include: {
            unitType: true,
          }
        }
      }});
  }),
})
