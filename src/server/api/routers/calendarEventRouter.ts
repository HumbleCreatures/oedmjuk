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
                endAt: input.endAt,
              },
            },
          },
        }),
      ]);

      return items[0];
    }),
    updateCalendarEvent: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        spaceId: z.string(),
        itemId: z.string(),
        startAt: z.date(),
        endAt: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.calendarEvent.update({ 
        where: {id: input.itemId }, 
        data: { 
        title: input.title,
        body: input.body,
        spaceId: input.spaceId,
        startAt: input.startAt,
        endAt: input.endAt,
      }});
    }),
    addProposalToCalendarEvent: protectedProcedure
    .input(
      z.object({
        proposalId: z.string(),
        calendarEventId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.calendarEvent.update({ 
        where: {id: input.calendarEventId }, 
        data: { 
          proposals: {
            connect: {id: input.proposalId}
          }
      }});
    }),
    removeProposalFromCalendarEvent: protectedProcedure
    .input(
      z.object({
        proposalIds: z.string().array(),
        calendarEventId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.calendarEvent.update({ 
        where: {id: input.calendarEventId }, 
        data: { 
          proposals: {
            disconnect: input.proposalIds.map((id) => ({id}))
          }
      }});
    }),
    addSelectionToCalendarEvent: protectedProcedure
    .input(
      z.object({
        selectionId: z.string(),
        calendarEventId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.calendarEvent.update({ 
        where: {id: input.calendarEventId }, 
        data: { 
          selections: {
            connect: {id: input.selectionId}
          }
      }});
    }),
    removeSelectionFromCalendarEvent: protectedProcedure
    .input(
      z.object({
        selectionIds: z.string().array(),
        calendarEventId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.calendarEvent.update({ 
        where: {id: input.calendarEventId }, 
        data: { 
          selections: {
            disconnect: input.selectionIds.map((id) => ({id}))
          }
      }});
    }),
    addDataIndexToCalendarEvent: protectedProcedure
    .input(
      z.object({
        dataIndexId: z.string(),
        calendarEventId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.calendarEvent.update({ 
        where: {id: input.calendarEventId }, 
        data: { 
          dataIndices: {
            connect: {id: input.dataIndexId}
          }
      }});
    }),
    removeDataIndicesFromCalendarEvent: protectedProcedure
    .input(
      z.object({
        dataIndexIds: z.string().array(),
        calendarEventId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.calendarEvent.update({ 
        where: {id: input.calendarEventId }, 
        data: { 
          dataIndices: {
            disconnect: input.dataIndexIds.map((id) => ({id}))
          }
      }});
    }),
    addFeedbackRoundToCalendarEvent: protectedProcedure
    .input(
      z.object({
        feedbackRoundId: z.string(),
        calendarEventId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.calendarEvent.update({ 
        where: {id: input.calendarEventId }, 
        data: { 
          feedbackRoundId: input.feedbackRoundId
      }});
    }),
    removeFeedbackRoundFromCalendarEvent: protectedProcedure
    .input(
      z.object({
        feedbackRoundId: z.string(),
        calendarEventId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.calendarEvent.update({ 
        where: {id: input.calendarEventId }, 
        data: { 
          feedbackRoundId: null,
      }});
    }),
  setAttending: protectedProcedure
    .input(
      z.object({
        calendarEventId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const attendee = await ctx.prisma.calendarEventAttendee.findFirst({
        where: {
          calendarEventId: input.calendarEventId,
          userId: ctx.session.user.id,
        },
      });

      if (attendee && !attendee.isAttending) {
        return ctx.prisma.calendarEventAttendee.update({
          where: {
            id: attendee.id,
          },
          data: {
            isAttending: true,
          },
        });
      }

      if (!attendee) {
        return ctx.prisma.calendarEventAttendee.create({
          data: {
            calendarEventId: input.calendarEventId,
            userId: ctx.session.user.id,
            isAttending: true,
          },
        });
      }

      return attendee;
    }),
  setNotAttending: protectedProcedure
    .input(
      z.object({
        calendarEventId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const attendee = await ctx.prisma.calendarEventAttendee.findFirst({
        where: {
          calendarEventId: input.calendarEventId,
          userId: ctx.session.user.id,
        },
      });

      if (attendee && attendee.isAttending) {
        return ctx.prisma.calendarEventAttendee.update({
          where: {
            id: attendee.id,
          },
          data: {
            isAttending: false,
          },
        });
      }

      if (!attendee) {
        return ctx.prisma.calendarEventAttendee.create({
          data: {
            calendarEventId: input.calendarEventId,
            userId: ctx.session.user.id,
            isAttending: false,
          },
        });
      }

      return attendee;
    }),
  getCalendarEventsForSpace: protectedProcedure
    .input(z.object({ spaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.calendarEvent.findMany({
        where: { spaceId: input.spaceId },
      });
    }),
  getMyCalendarEvents: protectedProcedure
    .query(async ({ ctx }) => {
      const spacesThings = await ctx.prisma.spaceMember.findMany({
        where: { userId: ctx.session.user.id, leftAt: null },
        include: {
          space: {
            include: {
              calendarEvents:true
            }
          }
        }
      });
      return spacesThings.flatMap((spaceThing) => {
        return spaceThing.space.calendarEvents;
       })
    }),
  getCalendarEvent: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      const calendarEvent = await ctx.prisma.calendarEvent.findUnique({
        where: { id: input.itemId },
        include: {
          calendarEventAttendee: true,
          proposals: true,
          dataIndices: true,
          selections: true,
          feedbackRound: true,
        },
      });

      if (!calendarEvent) {
        return null;
      }

      const spaceMembers = await ctx.prisma.spaceMember.findMany({
        where: {
          spaceId: calendarEvent.spaceId,
          leftAt: null,
        },
      });

      const myAttendee = calendarEvent?.calendarEventAttendee.find(
        (attendee) => attendee.userId === ctx.session.user.id
      );
      const attending = calendarEvent?.calendarEventAttendee.filter(
        (attendee) => attendee.isAttending
      );
      const notAttending = calendarEvent?.calendarEventAttendee.filter(
        (attendee) => !attendee.isAttending
      );
      const notAnswered = spaceMembers.filter(
        (member) =>
          !calendarEvent?.calendarEventAttendee.find(
            (attendee) => attendee.userId === member.userId
          )
      );
      return {
        calendarEvent,
        myAttendee,
        attending,
        notAttending,
        notAnswered,
      };
    }),
});
