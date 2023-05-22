import { z } from "zod";
import {
  FeedEventTypes,
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
    updateSelection: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        title: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.selection.update({
        where: { id: input.itemId },
        data: {
          title: input.title,
          body: input.body,
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
          state: SelectionStates.BuyingStarted,
          votingCapital: Math.pow(selection.alternatives.length, 2),
          participants: {
            create: allSpaceUsers.map((u) => ({ participantId: u.userId })),
          },
        },
      });
    }),
  buyVotes: protectedProcedure
    .input(
      z.object({
        alternativeId: z.string(),
        numberOfVotes: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const alternative = await ctx.prisma.selectionAlternative.findUnique({
        where: { id: input.alternativeId },
        include: {
          selection: {
            include: { participants: true },
          },
        },
      });

      if (!alternative) throw new Error("Alternative not found");

      if (alternative.selection.state !== SelectionStates.BuyingStarted)
        throw new Error("Selection not in buying vote s state");

      const isParticipant = alternative.selection.participants.some(
        (p) => p.participantId === ctx.session.user.id
      );
      if (!isParticipant)
        throw new Error("You are not a participant of this selection");

      if (!alternative.selection.votingCapital) {
        throw new Error("Voting capital is not set");
      }

      const myVotes = await ctx.prisma.selectionVoteEntry.findMany({
        where: {
          alternativeId: input.alternativeId,
          userId: ctx.session.user.id,
        },
      });

      const voteOnAlternative = myVotes.find(
        (v) => v.alternativeId === input.alternativeId
      );
      const currentSpending = myVotes.reduce(
        (acc, vote) => acc + Math.pow(vote.numberOfVotes, 2),
        0
      );

      if (voteOnAlternative) {       

        const voteDifference = Math.pow(input.numberOfVotes, 2) - Math.pow(voteOnAlternative.numberOfVotes,2);

        const voteBalanceResult =
          alternative.selection.votingCapital -
          currentSpending -
          voteDifference;
        if (voteBalanceResult < 0) {
          throw new Error("Not enough vote capital" +  Math.pow(voteDifference, 2).toString() + " " + input.numberOfVotes.toString());
        }

        return await ctx.prisma.selectionVoteEntry.update({
          where: {
            id: voteOnAlternative.id,
          },
          data: {
            numberOfVotes: input.numberOfVotes,
          },
        });
      }

      const voteBalanceResult =
        alternative.selection.votingCapital -
        currentSpending -
        Math.pow(input.numberOfVotes, 2);
      if (voteBalanceResult < 0) {
        throw new Error("Not enough vote capital");
      }

      return await ctx.prisma.selectionVoteEntry.create({
        data: {
          selectionId: alternative.selectionId,
          alternativeId: input.alternativeId,
          userId: ctx.session.user.id,
          numberOfVotes: input.numberOfVotes,
        },
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
          state: SelectionStates.VoteClosed,
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

      const isParticipant = selection.participants.some(
        (p) => p.participantId === ctx.session.user.id
      );
      if (!isParticipant) {
        return { canBuyVotes: false };
      }

      const votes = await ctx.prisma.selectionVoteEntry.findMany({
        where: { selectionId: input.selectionId, userId: ctx.session.user.id },
        orderBy: { createdAt: "desc" },
      });
      const spentOnVoting = votes.reduce(
        (acc, vote) => acc + Math.pow(vote.numberOfVotes,2),
        0
      );
      const leftToSpend = selection.votingCapital
        ? selection.votingCapital - spentOnVoting
        : 0;

      return { canBuyVotes: true, data: { votes, spentOnVoting, leftToSpend } };
    }),

  getSelection: protectedProcedure
    .input(z.object({ selectionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const selection = await ctx.prisma.selection.findUnique({
        where: { id: input.selectionId },
        include: {
          alternatives: {
            include: { votes: true },
          },
          participants: true,
        },
      });

      if (!selection) throw new Error("Proposal not found");

      return selection;
    }),
    getSelectionsForSpace: protectedProcedure
    .input(z.object({ spaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.selection.findMany({
        where: { spaceId: input.spaceId },
      });
    }),
    getActiveSelectionsForSpace: protectedProcedure
    .input(z.object({ spaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.selection.findMany({
        where: { spaceId: input.spaceId, state: SelectionStates.Created },
      });
    }),
});
