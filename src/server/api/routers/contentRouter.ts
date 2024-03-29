import { z } from "zod";
import { FeedEventTypes } from "../../../utils/enums";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const contentRouter = createTRPCRouter({
  createContent: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        spaceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        return ctx.prisma.content.create({
          data: {
            title: input.title,
            body: input.body,
            spaceId: input.spaceId,
            creatorId: ctx.session.user.id,
            order: 0,
            spaceFeedItem: {
              create: {
                spaceId: input.spaceId,
                eventType: FeedEventTypes.ContentCreated,
              },
            },            
          },
        })
    }),
    updateContent: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        title: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        return ctx.prisma.content.update({
          where: { id: input.itemId},
          data: {
            title: input.title,
            body: input.body,                        
          },
        })
    }),
  getContent: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      const content = await ctx.prisma.content.findUnique({
        where: { id: input.itemId }
      });
      
      return content;
    }),
    getAllContentForSpace: protectedProcedure
    .input(z.object({ spaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const content = await ctx.prisma.content.findMany({
        where: { spaceId: input.spaceId },
        orderBy: { createdAt: 'desc' },
      });
      
      return content;
    })
});
