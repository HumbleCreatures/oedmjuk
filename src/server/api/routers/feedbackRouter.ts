import { z } from "zod";
import { FeedEventTypes } from "../../../utils/enums";

import { createTRPCRouter, protectedProcedure } from "../trpc";

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
          body: input.body,
          spaceId: input.spaceId,
          creatorId: ctx.session.user.id,
          feedbackColumn: {
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
              feedEventType: FeedEventTypes.FeedbackRoundCreated,
            },
          },
        },
      });
    }),
  getFeedbackRound: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      const content = await ctx.prisma.feedbackRound.findUnique({
        where: { id: input.itemId },
        include: {
          feedbackColumn: {
            include: {
              feedbackItems: true
            }
          }
        }
      });

      return content;
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
          authorId: ctx.session.user.id,
          columnId: null,
        },
      });

      return ctx.prisma.feedbackItem.create({
        data: {
          title: input.title,
          body: input.body,
          feedbackRoundId: input.feedbackRoundId,
          authorId: ctx.session.user.id,
          createdByExternalUser: myMembership.length === 0,
          order: (numberOfFeedbackItems + 1) * 1024,
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
        });
  
        if (!feedbackItem) {
          throw new Error("Feedback item not found");
        }
  
        return ctx.prisma.feedbackNote.create({
          data: {
            body: input.body,
            feedbackItemId: input.feedbackItemId,
            authorId: ctx.session.user.id,
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

          const currentItem =await ctx.prisma.feedbackItem.findUnique({
            where: { id: input.feedbackItemId },
          });

          if(!currentItem) {
            throw new Error("Feedback item not found");
          }
          
          const nextItem = input.itemNextPreviousId && await ctx.prisma.feedbackItem.findUnique({
            where: { id: input.itemNextPreviousId },
          });

          const previousItem = input.itemNextPreviousId && await ctx.prisma.feedbackItem.findUnique({
            where: { id: input.itemNextPreviousId },
          });
    
          let order = (!previousItem && !nextItem) ? 1024 : -1;
          if(previousItem && !nextItem) { 
            order = previousItem.order + 1024;
          }
          if(!previousItem && nextItem) { 
            order = nextItem.order / 2;
          }

          if(previousItem && nextItem) { 
            order = (previousItem.order + nextItem.order) / 2;
          }

          //TODO: if order exits, recalculate order for all items in the column

          if(currentItem.columnId === input.feedbackColumnId) { 
            return ctx.prisma.feedbackItem.update({
              where: { id: input.feedbackItemId },
              data: {
                order,
              },
            });
          }

          return ctx.prisma.feedbackItem.update({
            where: { id: input.feedbackItemId },
            data: {
              order,
              feedbackMovement: {
                create: { 
                  feedbackColumnId: input.feedbackColumnId,
                  moverId: ctx.session.user.id,
                }
              }
            },
          });
        }),
});

//Get my non placed feedback items.
//Get external feedback items.
