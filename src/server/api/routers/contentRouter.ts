import { z } from "zod";
import { SpaceFeedEventTypes } from "../../../utils/enums";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import sanitizeHtml from 'sanitize-html';

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
            body: sanitizeHtml(input.body),
            spaceId: input.spaceId,
            creatorId: ctx.session.user.id,
            order: 0,
            spaceFeedItem: {
              create: {
                spaceId: input.spaceId,
                eventType: SpaceFeedEventTypes.ContentCreated,
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
            body: sanitizeHtml(input.body),                        
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
        where: { spaceId: input.spaceId }
      });
      
      return content;
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
