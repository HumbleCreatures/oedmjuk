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
  joinSpace: protectedProcedure
  .input(z.object({ spaceId: z.string() }))
  .mutation(async ({ctx, input}) => {

    const existingMemberships = await ctx.prisma.spaceMember.findMany({
      where:{
        spaceId: input.spaceId,
        userId: ctx.session.user.id
      }
    });
    console.log(ctx.session);
    const activeMemberships = existingMemberships.filter((membership) => membership.leftAt === null);
    console.log(activeMemberships);
    if(activeMemberships.length > 0) { 
      return activeMemberships[0];
    }

    return ctx.prisma.spaceMember.create({
      data: {
        spaceId: input.spaceId,
        userId: ctx.session.user.id
       }
    });
  }),
  leaveSpace: protectedProcedure
  .input(z.object({ spaceId: z.string() }))
  .mutation(async ({ctx, input}) => {

    const existingMemberships = await ctx.prisma.spaceMember.findMany({
      where:{
        spaceId: input.spaceId,
        userId: ctx.session.user.id
      }
    });

    const activeMemberships = existingMemberships.filter((membership) => membership.leftAt === null);
    if(activeMemberships.length === 0) { 
      return null
    }

    const updates = activeMemberships.map(async (membership) => { 
      await ctx.prisma.spaceMember.update({
        where: {
          id: membership.id
        },
        data: {
          leftAt: new Date()
        }
      })
      return null;
    });

    await Promise.all(updates);
    return null;
  }),
  getAllSpaces: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.space.findMany();
  }),
  getMySpaces: publicProcedure.query(async ({ ctx }) => {
    const spaceMembers = await ctx.prisma.spaceMember.findMany({
      where: {
        userId: ctx.session?.user.id,
        leftAt: null
      },
      include: {
        space: true,
      }
    });
    
    return spaceMembers.map((spaceMember) => spaceMember.space);
  }),

  getSpaceFeed: protectedProcedure
  .input(z.object({ spaceId: z.string() }))
  .query(async ({ ctx, input }) => { 
    return ctx.prisma.spaceFeedItem.findMany({
      where: {
        spaceId: input.spaceId
      },
      orderBy: {
        createdAt: "desc"
      },
      include: {
        content: true,
        calendarEvent: true,
        proposal: true,
        selection: true,
        feedbackRound: true,
        accessRequest: {
          include: {
            accessRequestType: true,
          }
        },
        dataIndex: {
          include: {
            unitType: true,
          }
        }
      }
     });
  }),
  getSpace: protectedProcedure
  .input(z.object({ spaceId: z.string() }))
  .query(async ({ ctx, input }) => { 
    const space = await ctx.prisma.space.findUnique({where:{ id:input.spaceId }, include: {
      spaceMembers: {
        where:{
          leftAt: null
        }
      },
    },});
    if(!space)  {
      throw new Error("Space not found");
    }
    const isMember = space.spaceMembers && space.spaceMembers.some((member) => member.userId === ctx.session.user.id)
    return {space, isMember };
  })
  
});
