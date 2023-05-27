import { z } from "zod";
import { SpaceFeedEventTypes, UserFeedEventTypes } from "../../../utils/enums";

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
      const space = await ctx.prisma.space.findUnique({
        where: { id: input.spaceId },
        include: { spaceMembers: true },
      });

      if (!space) throw new Error("Space not found");

      const isMember = space.spaceMembers.some(
        (sm) => sm.userId === ctx.session.user.id
      );

      const userFeedItems = space.spaceMembers.map((sm) => ({
        spaceId: input.spaceId,
        userId: sm.userId,
        eventType: UserFeedEventTypes.CalendarEventCreated,
      }));

      if (!isMember) {
        userFeedItems.push({
          spaceId: input.spaceId,
          userId: ctx.session.user.id,
          eventType: UserFeedEventTypes.CalendarEventCreated,
        });
      }

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
                feedEventType: SpaceFeedEventTypes.CalendarEventCreated,
              },
            },
            userCalendar: {
              create: {
                userId: ctx.session.user.id,
                startAt: input.startAt,
                endAt: input.endAt,
              },
            },
            UserFeedItem: {
              create: userFeedItems,
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
        itemId: z.string(),
        startAt: z.date(),
        endAt: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const calendarEvent = await ctx.prisma.calendarEvent.findUnique({
        where: { id: input.itemId },
        include: { calendarEventAttendee: true },
      });

      if (!calendarEvent) {
        throw new Error("Calendar event not found");
      }

      const updateUserFeedList = calendarEvent.calendarEventAttendee
        .filter((cea) => cea.isAttending)
        .map((cea) => ({
          spaceId: calendarEvent.spaceId,
          userId: cea.userId,
          eventType: UserFeedEventTypes.CalendarEventUpdate,
          calendarEventId: calendarEvent.id,
        }));

      if (
        !updateUserFeedList.some((uf) => uf.userId === calendarEvent.authorId)
      ) {
        updateUserFeedList.push({
          spaceId: calendarEvent.spaceId,
          userId: calendarEvent.authorId,
          eventType: UserFeedEventTypes.CalendarEventUpdate,
          calendarEventId: calendarEvent.id,
        });
      }

      await Promise.all(updateUserFeedList.map((uf) => {
        return ctx.prisma.userFeedItem.create({
          data: uf,
        });
       }));

       await ctx.prisma.spaceFeedItem.create({
        data: {
          spaceId: calendarEvent.spaceId,
          calendarEventId: calendarEvent.id,
          feedEventType: SpaceFeedEventTypes.CalendarEventUpdated,
        }          
       });

      const updatedEvent = await ctx.prisma.calendarEvent.update({
        where: { id: input.itemId },
        data: {
          title: input.title,
          body: input.body,
          startAt: input.startAt,
          endAt: input.endAt,
        },
      });

      return updatedEvent;
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
        where: { id: input.calendarEventId },
        data: {
          proposals: {
            connect: { id: input.proposalId },
          },
        },
      });
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
        where: { id: input.calendarEventId },
        data: {
          proposals: {
            disconnect: input.proposalIds.map((id) => ({ id })),
          },
        },
      });
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
        where: { id: input.calendarEventId },
        data: {
          selections: {
            connect: { id: input.selectionId },
          },
        },
      });
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
        where: { id: input.calendarEventId },
        data: {
          selections: {
            disconnect: input.selectionIds.map((id) => ({ id })),
          },
        },
      });
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
        where: { id: input.calendarEventId },
        data: {
          dataIndices: {
            connect: { id: input.dataIndexId },
          },
        },
      });
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
        where: { id: input.calendarEventId },
        data: {
          dataIndices: {
            disconnect: input.dataIndexIds.map((id) => ({ id })),
          },
        },
      });
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
        where: { id: input.calendarEventId },
        data: {
          feedbackRoundId: input.feedbackRoundId,
        },
      });
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
        where: { id: input.calendarEventId },
        data: {
          feedbackRoundId: null,
        },
      });
    }),
  setAttending: protectedProcedure
    .input(
      z.object({
        calendarEventId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const calendarEvent = await ctx.prisma.calendarEvent.findUnique({
        where: { id: input.calendarEventId },
      });

      if (!calendarEvent) {
        throw new Error("Calendar event not found");
      }

      const attendee = await ctx.prisma.calendarEventAttendee.findFirst({
        where: {
          calendarEventId: input.calendarEventId,
          userId: ctx.session.user.id,
        },
      });

      if (attendee && !attendee.isAttending) {
        const updatedAttendee = ctx.prisma.calendarEventAttendee.update({
          where: {
            id: attendee.id,
          },
          data: {
            isAttending: true,
          },
        });

        await ctx.prisma.userFeedItem.create({
          data: {
            userId: attendee.userId,
            calendarEventId: attendee.calendarEventId,
            eventType: UserFeedEventTypes.CalendarEventAttending,
            spaceId: calendarEvent.spaceId,
          },
        });

        return updatedAttendee;
      }

      if (!attendee) {
        const newAttendee = await ctx.prisma.calendarEventAttendee.create({
          data: {
            calendarEventId: input.calendarEventId,
            userId: ctx.session.user.id,
            isAttending: true,
          },
        });

        await ctx.prisma.userFeedItem.create({
          data: {
            userId: newAttendee.userId,
            calendarEventId: newAttendee.calendarEventId,
            eventType: UserFeedEventTypes.CalendarEventAttending,
            spaceId: calendarEvent.spaceId,
          },
        });

        return newAttendee;
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
      const calendarEvent = await ctx.prisma.calendarEvent.findUnique({
        where: { id: input.calendarEventId },
      });

      if (!calendarEvent) {
        throw new Error("Calendar event not found");
      }

      const attendee = await ctx.prisma.calendarEventAttendee.findFirst({
        where: {
          calendarEventId: input.calendarEventId,
          userId: ctx.session.user.id,
        },
      });

      if (attendee && attendee.isAttending) {
        const updatedAttending = await ctx.prisma.calendarEventAttendee.update({
          where: {
            id: attendee.id,
          },
          data: {
            isAttending: false,
          },
        });

        await ctx.prisma.userFeedItem.create({
          data: {
            userId: updatedAttending.userId,
            calendarEventId: updatedAttending.calendarEventId,
            eventType: UserFeedEventTypes.CalendarEventNotAttending,
            spaceId: calendarEvent.spaceId,
          },
        });

        return updatedAttending;
      }

      if (!attendee) {
        const newAttendee = await ctx.prisma.calendarEventAttendee.create({
          data: {
            calendarEventId: input.calendarEventId,
            userId: ctx.session.user.id,
            isAttending: false,
          },
        });

        await ctx.prisma.userFeedItem.create({
          data: {
            userId: newAttendee.userId,
            calendarEventId: newAttendee.calendarEventId,
            eventType: UserFeedEventTypes.CalendarEventNotAttending,
            spaceId: calendarEvent.spaceId,
          },
        });

        return newAttendee;
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
  getMyCalendarEvents: protectedProcedure.query(async ({ ctx }) => {
    const spacesThings = await ctx.prisma.spaceMember.findMany({
      where: { userId: ctx.session.user.id, leftAt: null },
      include: {
        space: {
          include: {
            calendarEvents: true,
          },
        },
      },
    });
    return spacesThings.flatMap((spaceThing) => {
      return spaceThing.space.calendarEvents;
    });
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
