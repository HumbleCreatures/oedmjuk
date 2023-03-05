import { z } from "zod";

import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const spaceRouter = createTRPCRouter({
  createSpace: protectedProcedure
  .input(z.object({ name: z.string() }))
  .mutation(async ({ctx, input}) => {
    const space = await ctx.prisma.$transaction([ 
      ctx.prisma.space.create({
        data: {
          name: input.name,
          spaceMembers: {
            create: {
              userId: ctx.session.user.id, 
            }
          }
        }
      })
    ]);

    return space[0];
  }),
  getAllSpaces: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.space.findMany();
  }),
  getSpace: protectedProcedure
  .input(z.object({ spaceId: z.string() }))
  .query(({ ctx, input }) => { 
    return ctx.prisma.space.findUnique({where:{ id:input.spaceId }, include: {
      spaceMembers: true,
    },});
  }),
  getUser: protectedProcedure
  .input(z.object({ userId: z.string() }))
  .query(({ ctx, input }) => { 
    return ctx.prisma.user.findUnique({where:{ id:input.userId }});
  }),


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
