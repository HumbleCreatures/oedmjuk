import { z } from "zod";
import { FeedEventTypes, ProposalStates } from "../../../utils/enums";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const proposalRouter = createTRPCRouter({
  createProposal: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        spaceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.proposal.create({
        data: {
          title: input.title,
          body: input.body,
          spaceId: input.spaceId,
          authorId: ctx.session.user.id,
          spaceFeedItem: {
            create: {
              spaceId: input.spaceId,
              feedEventType: FeedEventTypes.ProposalEventCreated,
            },
          },
        },
      });
    }),
    addObjection: protectedProcedure
    .input(
      z.object({
        body: z.string(),
        proposalId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.objection.create({
        data: {
          proposalId: input.proposalId,
          body: input.body,
          authorId: ctx.session.user.id,
        },
      });
    }),
    resolveObjection: protectedProcedure
    .input(
      z.object({
        comment: z.string(),
        objectionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const objection = await ctx.prisma.objection.findUnique({
        where: { id: input.objectionId },
      });

      if(!objection) throw new Error("Objection not found");

      if(objection.resolvedAt) throw new Error("Objection already resolved");
      
      return await ctx.prisma.objection.update({
        where: { 
          id: input.objectionId
        },
        data: {
          resolvedComment: input.comment,
          resolvedById: ctx.session.user.id,
          resolvedAt: new Date(),
        },
      });
    }),
    closeObjectionRound: protectedProcedure
    .input(
      z.object({
        comment: z.string().optional(),
        proposalId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.proposalId },
        include: { objections: true }
      });

      if(!proposal) throw new Error("Objection not found");

      const openObjections = proposal.objections.filter(o => !o.resolvedAt);
      if(openObjections.length > 0) throw new Error("There are still open objections");

      return await ctx.prisma.proposal.update({
        where: { 
          id: input.proposalId
        },
        data: {
          proposalState: ProposalStates.ObjectionsResolved, 
        },
      });
    }),
    getSpaceProposals: protectedProcedure
    .input(z.object({ spaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.proposal.findMany({
        where: { spaceId: input.spaceId },
        include: {
          objections: true
        }
      });

    }),
  getProposal: protectedProcedure
    .input(z.object({ proposalId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.proposal.findUnique({
        where: { id: input.proposalId },
        include: { objections: true }
      });
    }),

});
