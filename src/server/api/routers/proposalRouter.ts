import { z } from "zod";
import {
  SpaceFeedEventTypes,
  UserFeedEventTypes,
  ProposalStates,
  VoteValue,
} from "../../../utils/enums";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import type { ProposalVote } from "@prisma/client";
import sanitizeHtml from 'sanitize-html';

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
      const space = await ctx.prisma.space.findUnique({where: {id: input.spaceId},
        include: {spaceMembers: true}});

      if(!space) throw new Error("Space not found");
      
      const isMember = space.spaceMembers.some((sm) => sm.userId === ctx.session.user.id);
      
      const userFeedItems = space.spaceMembers.map((sm) => ({ 
        spaceId: input.spaceId,
        userId: sm.userId,
        eventType: UserFeedEventTypes.ProposalEventCreated,
      }))

      if(!isMember) {
        userFeedItems.push({
          spaceId: input.spaceId,
          userId: ctx.session.user.id,
          eventType: UserFeedEventTypes.ProposalEventCreated,
        })
      }

      return await ctx.prisma.proposal.create({
        data: {
          title: input.title,
          body: sanitizeHtml(input.body),
          spaceId: input.spaceId,
          creatorId: ctx.session.user.id,
          spaceFeedItem: {
            create: {
              spaceId: input.spaceId,
              eventType: SpaceFeedEventTypes.ProposalEventCreated,
            },
          },
          UserFeedItem: {
            create: userFeedItems,
          },
        },
      });
    }),
    updateProposal: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        title: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.proposal.update({
        where: { id: input.itemId },
        data: {
          title: input.title,
          body: sanitizeHtml(input.body),          
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
      const proposal = await ctx.prisma.proposal.findUnique({ where: { id: input.proposalId } });
      if(!proposal) throw new Error("Proposal not found");
      const objection = await ctx.prisma.proposalObjection.create({
        data: {
          proposalId: input.proposalId,
          body: sanitizeHtml(input.body),
          creatorId: ctx.session.user.id,
        },
      });

      await ctx.prisma.userFeedItem.create({
        data: {
          userId: proposal.creatorId,
          proposalId: input.proposalId,
          eventType: UserFeedEventTypes.ProposalObjectionAdded,
          spaceId: proposal.spaceId,
        }
      });

      await ctx.prisma.spaceFeedItem.create({
        data: {
          proposalId: input.proposalId,
          eventType: UserFeedEventTypes.ProposalObjectionAdded,
          spaceId: proposal.spaceId,
        }          
       });

      return objection
    }),
  resolveObjection: protectedProcedure
    .input(
      z.object({
        comment: z.string(),
        objectionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const objection = await ctx.prisma.proposalObjection.findUnique({
        where: { id: input.objectionId },
      });

      if (!objection) throw new Error("Objection not found");

      if (objection.resolvedAt) throw new Error("Objection already resolved");

      return await ctx.prisma.proposalObjection.update({
        where: {
          id: input.objectionId,
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
        include: { objections: true },
      });

      if (!proposal) throw new Error("Objection not found");

      const openObjections = proposal.objections.filter((o) => !o.resolvedAt);
      if (openObjections.length > 0)
        throw new Error("There are still open objections");

      const allSpaceUsers = await ctx.prisma.spaceMember.findMany({
        where: {
          spaceId: proposal.spaceId,
        },
      });

      const updatedProposal = await ctx.prisma.proposal.update({
        where: {
          id: input.proposalId,
        },
        data: {
          proposalState: ProposalStates.ObjectionsResolved,
          participants: {
            create: allSpaceUsers.map((u) => ({ participantId: u.userId })),
          },
        },
      });

      await ctx.prisma.userFeedItem.create({
        data: {
          userId: updatedProposal.creatorId,
          proposalId: input.proposalId,
          eventType: UserFeedEventTypes.ProposalVotingStarted,
          spaceId: proposal.spaceId,
        }
      });

      await ctx.prisma.spaceFeedItem.create({
        data: {
          proposalId: input.proposalId,
          eventType: UserFeedEventTypes.ProposalVotingStarted,
          spaceId: proposal.spaceId,
        }          
       });

      return updatedProposal
    }),
  castVote: protectedProcedure
    .input(
      z.object({
        proposalId: z.string(),
        voteValue: z.enum([
          VoteValue.Accept,
          VoteValue.Reject,
          VoteValue.Abstain,
        ]),
        myPickId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.proposalId },
        include: { participants: true },
      });

      if (!proposal) throw new Error("Objection not found");

      const isParticipant = proposal.participants.some(p => p.participantId === ctx.session.user.id);
      if(!isParticipant) throw new Error("You are not a participant of this proposal");

      if (proposal.proposalState !== ProposalStates.ObjectionsResolved)
        throw new Error("Proposal not in votable state");

      if (
        input.myPickId &&
        !proposal.participants.some((p) => p.participantId === input.myPickId)
      )
        throw new Error("Your myPick is invalid.");

      return await ctx.prisma.proposalVote.create({
        data: {
          proposalId: input.proposalId,
          myPickId: input.myPickId,
          userId: ctx.session.user.id,
          accept:
            input.voteValue === VoteValue.Abstain
              ? undefined
              : input.voteValue === VoteValue.Accept,
        },
      });
    }),
  endVoting: protectedProcedure
    .input(
      z.object({
        proposalId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.proposalId },
        include: { participants: true },
      });

      if (!proposal) throw new Error("Proposal not found");

      const updatedProposal = await ctx.prisma.proposal.update({
        where: {
          id: input.proposalId,
        },
        data: {
          proposalState: ProposalStates.VoteClosed,
        },
      });

      await ctx.prisma.userFeedItem.create({
        data: {
          userId: updatedProposal.creatorId,
          proposalId: input.proposalId,
          eventType: UserFeedEventTypes.ProposalVotingEnded,
          spaceId: proposal.spaceId,
        }
      });

      await ctx.prisma.spaceFeedItem.create({
        data: {
          proposalId: input.proposalId,
          eventType: UserFeedEventTypes.ProposalVotingEnded,
          spaceId: proposal.spaceId,
        }          
       });

      return updatedProposal;
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
          objections: true,
        },
      });
    }),
    getActiveSpaceProposals: protectedProcedure
    .input(z.object({ spaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.proposal.findMany({
        where: { spaceId: input.spaceId, proposalState: ProposalStates.ProposalCreated },
        include: {
          objections: true,
        },
      });
    }),
  getProposal: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.itemId },
        include: { objections: true, participants: true },
      });

      if (!proposal) throw new Error("Proposal not found");

      if (proposal.proposalState === ProposalStates.VoteClosed) {
        const votes = await ctx.prisma.proposalVote.findMany({
          where: { proposalId: proposal.id },
        });

        const uniqeVotes = votes.reduce((acc, vote) => {
          if (!acc.has(vote.userId)) {
            acc.set(vote.userId, vote);
          } else {
            const recordedVote = acc.get(vote.userId);
            if (recordedVote && recordedVote.createdAt < vote.createdAt) {
              acc.set(vote.userId, vote);
            }
          }
          return acc;
        }, new Map<string, ProposalVote>());

        const voteArray = Array.from(uniqeVotes.values());
        //TODO: Calculate accept results in %
        //TODO: Calculate myPick results
        const myPickResults = voteArray.reduce((acc, vote) => {
          if (vote.myPickId) {
            const pickVote = uniqeVotes.get(vote.myPickId);
            if(!pickVote) {
              acc.numberOfMissedVotes = acc.numberOfMissedVotes++;
              return acc;
            }
            
            if (pickVote.accept) { 
              acc.numberOfAccepts = acc.numberOfAccepts++;
              return acc;
            }

            if (pickVote.accept === false) { 
              acc.numberOfRejects = acc.numberOfRejects++;
              return acc;
            }

            if (pickVote.accept === undefined) { 
              acc.numberOfAbstains = acc.numberOfAbstains++;
              return acc;
            }
          }
          return acc; 
        }, {numberOfAccepts: 0,
          numberOfRejects: 0,
          numberOfAbstains:0,
          numberOfMissedVotes: 0});


        const votingResult = {
          numberOfParticipants: proposal.participants.length,
          numberOfVotes: uniqeVotes.size,
          numberOfAccepts: voteArray.filter((v) => v.accept).length,
          numberOfRejects: voteArray.filter((v) => !v.accept).length,
          numberOfAbstains: voteArray.filter((v) => v.accept === undefined).length,
          numberOfMissedVotes: (proposal.participants.length - uniqeVotes.size),
        };

        return {
          proposal,
          votingResult,
          myPickResults
        };
      }
      return { proposal, votingResult: undefined };
    }),
});
