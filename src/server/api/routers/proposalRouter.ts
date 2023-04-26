import { z } from "zod";
import { FeedEventTypes, ProposalStates, VoteValue } from "../../../utils/enums";

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

      const allSpaceUsers = await ctx.prisma.spaceMember.findMany({
        where: {
          spaceId: proposal.spaceId,
        }
       });

      return await ctx.prisma.proposal.update({
        where: { 
          id: input.proposalId
        },
        data: {
          proposalState: ProposalStates.ObjectionsResolved,
          participants: {
            create: allSpaceUsers.map(u => ({ participantId: u.userId }))
          }
        },
      });
    }),
    castVote: protectedProcedure
    .input(
      z.object({
        proposalId: z.string(),
        voteValue: z.enum([VoteValue.Accept, VoteValue.Reject, VoteValue.Abstain]),
        myPickId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.proposalId },
        include: { participants: true }
      });

      if(!proposal) throw new Error("Objection not found");

      if(proposal.proposalState !== ProposalStates.ObjectionsResolved) throw new Error("Proposal not in votable state");
      if(input.myPickId && !proposal.participants.some(p => p.participantId === input.myPickId)) throw new Error("Your myPick is invalid.");
      
      return await ctx.prisma.proposalVote.create({
        data: {
          proposalId: input.proposalId,
          myPickId: input.myPickId,
          userId: ctx.session.user.id,
          accept: input.voteValue === VoteValue.Abstain ? undefined : input.voteValue === VoteValue.Accept,
        }
      });
    }),
    getUserVote: protectedProcedure
    .input(z.object({ proposalId: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.prisma.proposalVote.findMany({
        where: { proposalId: input.proposalId, userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
      });

      return result[0];
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
        include: { objections: true, participants:true }
      });
    }),

});