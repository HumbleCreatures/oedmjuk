import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

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
      const space = await ctx.prisma.$transaction([
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

      return space[0];
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
  /*getAllSpaces: publicProcedure.query(({ ctx }) => { 
    return ctx.prisma.space.findMany();
  }),

  getMySpaces: protectedProcedure
  .query(({ ctx }) => { 
    return ctx.prisma.space.findMany();
  }),

  getSpace: protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(({ ctx }) => { 
    return ctx.prisma.space.findMany();
  }),

  getSpaceMembers: protectedProcedure
  .input(z.object({ spaceId: z.string() }))
  .query(({ ctx }) => { 
    return ctx.prisma.spaceMembership.findMany();
  }),*/
});
