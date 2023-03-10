import { z } from "zod";

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
      const space = await ctx.prisma.$transaction([
        ctx.prisma.content.create({
          data: {
            title: input.title,
            body: input.body,
            spaceId: input.spaceId,
            authorId: ctx.session.user.id,
            spaceFeedItem: {
              create: {
                spaceId: input.spaceId,
              },
            },
            
          },
        }),
      ]);

      return space[0];
    }),
  getContent: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log('--------------------------------------');
      console.log(input.itemId);
      const content = await ctx.prisma.content.findUnique({
        where: { id: input.itemId }
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
