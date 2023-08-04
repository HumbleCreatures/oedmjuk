import { z } from "zod";
import { ChannelEventTypes, EventChannels, FeedbackRoundStates, SpaceFeedEventTypes } from "../../../utils/enums";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import sanitizeHtml from 'sanitize-html';

import * as Pusher from "pusher"
import { env } from "../../../env/server.mjs";


const pusher = new Pusher.default({
  appId: env.PUSHER_APP_ID,
  key: env.PUHSER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: env.PUSHER_CLUSTER,
  useTLS: true
});



export const feedbackRouter = createTRPCRouter({
  createFeedbackRound: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        spaceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.feedbackRound.create({
        data: {
          title: input.title,
          body: sanitizeHtml(input.body),
          spaceId: input.spaceId,
          creatorId: ctx.session.user.id,
          feedbackColumns: {
            create: [
              {
                title: "Ongoing",
                wipLimit: 1,
                order: 1024,
              },
              {
                title: "Done",
                order: 2048,
              },
            ],
          },
          spaceFeedItem: {
            create: {
              spaceId: input.spaceId,
              eventType: SpaceFeedEventTypes.FeedbackRoundCreated,
            },
          },
        },
      });
    }),
  updateFeedbackRound: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        title: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.feedbackRound.update({
        where: { id: input.itemId },
        data: {
          title: input.title,
          body: sanitizeHtml(input.body),
        },
      });
    }),
  getFeedbackRound: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      const content = await ctx.prisma.feedbackRound.findUnique({
        where: { id: input.itemId },
        include: {
          feedbackColumns: {
            include: {
              feedbackItems: true,
            },
          },
        },
      });

      return content;
    }),
  getFeedbackRoundsForSpace: protectedProcedure
    .input(z.object({ spaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const content = await ctx.prisma.feedbackRound.findMany({
        where: { spaceId: input.spaceId },
      });

      return content;
    }),
  getActiveFeedbackRoundsForSpace: protectedProcedure
    .input(z.object({ spaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const content = await ctx.prisma.feedbackRound.findMany({
        where: {
          spaceId: input.spaceId,
          state: FeedbackRoundStates.Created,
        },
      });

      return content;
    }),
  getFeedbackItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      const content = await ctx.prisma.feedbackItem.findUnique({
        where: { id: input.itemId },
        include: {
          column: true,
          feedbackRound: true,
          feedbackMovement: {
            include: {
              feedbackColumn: true,
            },
          },
          feedbackNotes: {
            include: {
              creator: true,
            },
          },
        },
      });

      if (!content) {
        return content;
      }

      if (
        content.createdByExternalUser ||
        content.columnId ||
        content.creatorId === ctx.session.user.id
      ) {
        return content;
      }

      return content;
    }),
  getMyFeedbackItems: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      const feedbackItems = await ctx.prisma.feedbackItem.findMany({
        where: {
          feedbackRoundId: input.itemId,
          creatorId: ctx.session.user.id,
          createdByExternalUser: false,
          columnId: null,
        },
      });

      return feedbackItems;
    }),
    getNamedFeedbackItems: protectedProcedure
    .input(z.object({ itemId: z.string(), columnName: z.string() }))
    .query(async ({ ctx, input }) => {
      const feedbackItems = await ctx.prisma.feedbackItem.findMany({
        where: {
          feedbackRoundId: input.itemId,
          column: {
            title: input.columnName
          }
        },
      });

      return feedbackItems;
    }),
  getExternalFeedbackItems: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      const feedbackItems = await ctx.prisma.feedbackItem.findMany({
        where: { feedbackRoundId: input.itemId, createdByExternalUser: true },
      });

      return feedbackItems;
    }),
  createFeedbackItem: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        feedbackRoundId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const feedbackRound = await ctx.prisma.feedbackRound.findUnique({
        where: { id: input.feedbackRoundId },
      });

      if (!feedbackRound) {
        throw new Error("Feedback round not found");
      }

      if (feedbackRound.state === FeedbackRoundStates.Closed) {
        throw new Error("Feedback round closed, can't add more items.");
      }

      const myMembership = await ctx.prisma.spaceMember.findMany({
        where: {
          spaceId: feedbackRound.spaceId,
          userId: ctx.session.user.id,
          leftAt: null,
        },
      });

      const numberOfFeedbackItems = await ctx.prisma.feedbackItem.count({
        where: {
          feedbackRoundId: input.feedbackRoundId,
          creatorId: ctx.session.user.id,
          columnId: null,
        },
      });

      return ctx.prisma.feedbackItem.create({
        data: {
          title: input.title,
          body: sanitizeHtml(input.body),
          feedbackRoundId: input.feedbackRoundId,
          creatorId: ctx.session.user.id,
          createdByExternalUser: myMembership.length === 0,
          order: (numberOfFeedbackItems + 1) * 1024,
        },
      });
    }),
  closeFeedbackRound: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const feedbackRound = await ctx.prisma.feedbackRound.findUnique({
        where: { id: input.itemId },
      });

      if (!feedbackRound) {
        throw new Error("Feedback item not found");
      }

      return ctx.prisma.feedbackRound.update({
        where: {
          id: input.itemId,
        },
        data: {
          state: FeedbackRoundStates.Closed,
        },
      });
    }),
    startFeedbackRound: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const feedbackRound = await ctx.prisma.feedbackRound.findUnique({
        where: { id: input.itemId },
      });

      if (!feedbackRound) {
        throw new Error("Feedback item not found");
      }

      if (feedbackRound.state !== FeedbackRoundStates.Created) {
        throw new Error("Feedback can only be started if it is created.");
      }

      return ctx.prisma.feedbackRound.update({
        where: {
          id: input.itemId,
        },
        data: {
          state: FeedbackRoundStates.Started
        },
      });
    }),
  addFeedbackNote: protectedProcedure
    .input(
      z.object({
        body: z.string(),
        feedbackItemId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const feedbackItem = await ctx.prisma.feedbackItem.findUnique({
        where: { id: input.feedbackItemId },
        include: { feedbackRound: true },
      });

      if (!feedbackItem) {
        throw new Error("Feedback item not found");
      }

      if (feedbackItem.feedbackRound.state !== FeedbackRoundStates.Started) {
        throw new Error("Feedback must be started");
      }

      return ctx.prisma.feedbackNote.create({
        data: {
          body: sanitizeHtml(input.body),
          feedbackItemId: input.feedbackItemId,
          creatorId: ctx.session.user.id,
        },
      });
    }),
  moveFeedbackTo: protectedProcedure
    .input(
      z.object({
        feedbackItemId: z.string(),
        feedbackColumnId: z.string(),
        itemNextPreviousId: z.string().nullable(),
        itemPositionPreviousId: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const currentItem = await ctx.prisma.feedbackItem.findUnique({
        where: { id: input.feedbackItemId },
        include: { feedbackRound: true },
      });

      if (!currentItem) {
        throw new Error("Feedback item not found");
      }

      if (currentItem.feedbackRound.state !== FeedbackRoundStates.Started) {
        throw new Error("Feedback needs to be started to be moved.");
      }

      const nextItem =
        input.itemNextPreviousId &&
        (await ctx.prisma.feedbackItem.findUnique({
          where: { id: input.itemNextPreviousId },
        }));

      const previousItem =
        input.itemNextPreviousId &&
        (await ctx.prisma.feedbackItem.findUnique({
          where: { id: input.itemNextPreviousId },
        }));

      let order = !previousItem && !nextItem ? 1024 : -1;
      if (previousItem && !nextItem) {
        order = previousItem.order + 1024;
      }
      if (!previousItem && nextItem) {
        order = nextItem.order / 2;
      }

      if (previousItem && nextItem) {
        order = (previousItem.order + nextItem.order) / 2;
      }

      //TODO: if order exits, recalculate order for all items in the column
      void pusher.trigger(EventChannels.FeedbackRound + currentItem.feedbackRoundId, ChannelEventTypes.FeedbackItemMoved, {
        message: "move executed"
      });
      
      if (currentItem.columnId === input.feedbackColumnId) {
        return ctx.prisma.feedbackItem.update({
          where: { id: input.feedbackItemId },
          data: {
            order,
          },
        });
      }
      if(input.feedbackColumnId) {
        const feedbackColumn = await ctx.prisma.feedbackColumn.findUnique({ where: { id: input.feedbackColumnId }, include: { feedbackItems: true }});
        if(!feedbackColumn) {
          throw new Error("Feedback column not found");
        }

        if(feedbackColumn.wipLimit && feedbackColumn.wipLimit <= feedbackColumn.feedbackItems.length) {
          throw new Error("Feedback column is full");
        }
      }    

      return ctx.prisma.feedbackItem.update({
        where: { id: input.feedbackItemId },
        data: {
          columnId: input.feedbackColumnId,
          order,
          feedbackMovement: {
            create: {
              feedbackColumnId: input.feedbackColumnId,
              moverId: ctx.session.user.id,
            },
          },
        },
      });
    }),
});

//Get my non placed feedback items.
//Get external feedback items.
