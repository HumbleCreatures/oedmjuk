import { z } from "zod";
import {
  FeedEventTypes,
  ProposalStates,
  SelectionStates,
} from "../../../utils/enums";

import { createTRPCRouter, protectedProcedure } from "../trpc";



export const selectionRouter = createTRPCRouter({
  createSelection: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        spaceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.selection.create({
        data: {
          title: input.title,
          body: input.body,
          spaceId: input.spaceId,
          creatorId: ctx.session.user.id,
          spaceFeedItem: {
            create: {
              spaceId: input.spaceId,
              feedEventType: FeedEventTypes.SelectionCreated,
            },
          },
        },
      });
    }),

  addAlternative: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        selectionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.selectionAlternative.create({
        data: {
          selectionId: input.selectionId,
          body: input.body,
          title: input.title,
          authorId: ctx.session.user.id,
        },
      });
    }),
  
  startBuyingRound: protectedProcedure
    .input(
      z.object({
        comment: z.string().optional(),
        selectionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const selection = await ctx.prisma.selection.findUnique({
        where: { id: input.selectionId },
        include: { alternatives: true },
      });

      if (!selection) throw new Error("Selection not found");

    
      if (selection.alternatives.length < 3)
        throw new Error("A selection needs at least 3 alternatives");

      const allSpaceUsers = await ctx.prisma.spaceMember.findMany({
        where: {
          spaceId: selection.spaceId,
        },
      });

      return await ctx.prisma.selection.update({
        where: {
          id: input.selectionId,
        },
        data: {
          status: SelectionStates.BuyingStarted,
          votingCapital: selection.alternatives.length ^ 2,
          participants: {
            create: allSpaceUsers.map((u) => ({ participantId: u.userId })),
          },
        },
      });
    }),
  buyVotes: protectedProcedure
    .input(
      z.object({
        selectionId: z.string(),
        alternativeId: z.string(),
        numberOfVotes: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const selection = await ctx.prisma.selection.findUnique({
        where: { id: input.selectionId },
        include: { participants: true },
      });

      if (!selection) throw new Error("Selection not found");

      if (selection.status !== SelectionStates.BuyingStarted) throw new Error("Selection not in buying vote s state");

      const isParticipant = selection.participants.some(p => p.participantId === ctx.session.user.id);
      if(!isParticipant) throw new Error("You are not a participant of this selection");

      const myVotes = await ctx.prisma.selectionVoteEntry.findMany({
        where: { 
          selectionId: input.selectionId,
          userId: ctx.session.user.id,
        }
       });

       if(!selection.votingCapital) {
        throw new Error("Voting capital is not set");
       }

       const currentSpending = myVotes.reduce((acc, vote) => acc + vote.numberOfVotes^2, 0);
       const voteBalanceResult = selection.votingCapital - currentSpending - input.numberOfVotes^2;
       if(voteBalanceResult < 0) {
          throw new Error("Not enough vote capital");
       }

       const voteOnAlternative = myVotes.find(v => v.alternativeId === input.alternativeId);
       if(voteOnAlternative) { 
          return await ctx.prisma.selectionVoteEntry.update({
            where: {
              id: voteOnAlternative.id
            },
            data: {
              numberOfVotes: voteOnAlternative.numberOfVotes + input.numberOfVotes
            }
          })
       }

       return await ctx.prisma.selectionVoteEntry.create({
          data: {
            selectionId: input.selectionId,
            alternativeId: input.alternativeId,
            userId: ctx.session.user.id,
            numberOfVotes: input.numberOfVotes
          }
        });
       
    }),
  endVoting: protectedProcedure
    .input(
      z.object({
        selectionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const selection = await ctx.prisma.selection.findUnique({
        where: { id: input.selectionId },
        include: { participants: true },
      });

      if (!selection) throw new Error("Proposal not found");

      return await ctx.prisma.selection.update({
        where: {
          id: input.selectionId,
        },
        data: {
          status: ProposalStates.VoteClosed,
        },
      });
    }),
  getUserVotes: protectedProcedure
    .input(z.object({ selectionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const selection = await ctx.prisma.selection.findUnique({
        where: { id: input.selectionId },
        include: { participants: true },
      });

      if (!selection) throw new Error("Selection not found");
      
      const isParticipant = selection.participants.some(p => p.participantId === ctx.session.user.id);
      if(!isParticipant) {
        return {canBuyVotes: false}
      }
      

      const votes = await ctx.prisma.selectionVoteEntry.findMany({
        where: { selectionId: input.selectionId, userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
      });
      const spentOnVoting = votes.reduce((acc, vote) => acc + vote.numberOfVotes^2, 0);

      return {canBuyVotes: false, votes, spentOnVoting};

    }),
  
  getSelection: protectedProcedure
    .input(z.object({ selectionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const selection = await ctx.prisma.selection.findUnique({
        where: { id: input.selectionId },
        include: { alternatives: {
          include: { votes: true }
        }, participants: true },
      });

      if (!selection) throw new Error("Proposal not found");

      return selection;
    }),
});
