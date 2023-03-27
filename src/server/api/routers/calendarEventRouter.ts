import { z } from "zod";
import { FeedEventTypes } from "../../../utils/enums";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const calendarEventRouter = createTRPCRouter({
  createCalendarEvent: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        spaceId: z.string(),
        startAt: z.date(),
        endAt: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const items = await ctx.prisma.$transaction([
        ctx.prisma.calendarEvent.create({
          data: {
            title: input.title,
            body: input.body,
            spaceId: input.spaceId,
            startAt: input.startAt,
            endAt: input.endAt,
            authorId: ctx.session.user.id,
            spaceFeedItem: {
              create: {
                spaceId: input.spaceId,
                feedEventType: FeedEventTypes.CalendarEventCreated,
              },
            },
            userCalendar: {
              create: {
                userId: ctx.session.user.id,
                startAt: input.startAt,
                endAt: input.endAt
              },
            },
          },
        }),
      ]);

      return items[0];
    }),
  getCalendarEvent: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      const calendarEvent = await ctx.prisma.calendarEvent.findUnique({
        where: { id: input.itemId },
        include: {
          space: true,
        },
      });
      
      return calendarEvent;
    })

});
