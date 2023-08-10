import { z } from "zod";
import {
  FeedEventTypes,
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
        eventType: FeedEventTypes.ProposalEventCreated,
      }))

      if(!isMember) {
        userFeedItems.push({
          spaceId: input.spaceId,
          userId: ctx.session.user.id,
          eventType: FeedEventTypes.ProposalEventCreated,
        })
      }

      return await ctx.prisma.proposal.create({
        data: {
          title: input.title,
          body: input.body,
          spaceId: input.spaceId,
          creatorId: ctx.session.user.id,
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
    openObjectionRound: protectedProcedure
    .input(
      z.object({
        proposalId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const proposal = await ctx.prisma.proposal.findUnique({
        where: { id: input.proposalId }
      });

      if (!proposal) throw new Error("Objection not found");

      if(proposal.state !== ProposalStates.ProposalCreated) 
          throw new Error("Can only open created proposal");

      const space = await ctx.prisma.space.findUnique({where: {id: proposal.spaceId},
        include: {spaceMembers: true}});

      if(!space) throw new Error("Space not found");
      
      const isMember = space.spaceMembers.some((sm) => sm.userId === ctx.session.user.id);
      if(!isMember && proposal.creatorId !== ctx.session.user.id) 
        throw new Error("You are not a member of this space");

      const userFeedItems = space.spaceMembers.map((sm) => ({ 
        spaceId: proposal.spaceId,
        userId: sm.userId,
        eventType: FeedEventTypes.ProposalEventCreated,
      }))

      const updatedProposal = await ctx.prisma.proposal.update({
        where: {
          id: input.proposalId,
        },
        data: {
          state: ProposalStates.ProposalOpen,
          spaceFeedItem: {
            create: {
              spaceId: proposal.spaceId,
              eventType: FeedEventTypes.ProposalEventCreated,
            },
          },
          UserFeedItem: {
            create: userFeedItems,
          },
        },
      });

      await ctx.prisma.userFeedItem.create({
        data: {
          userId: updatedProposal.creatorId,
          proposalId: input.proposalId,
          eventType: FeedEventTypes.ProposalVotingStarted,
          spaceId: proposal.spaceId,
        }
      });

      await ctx.prisma.spaceFeedItem.create({
        data: {
          proposalId: input.proposalId,
          eventType: FeedEventTypes.ProposalVotingStarted,
          spaceId: proposal.spaceId,
        }          
       });

      return updatedProposal
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
      if(proposal.state !== ProposalStates.ProposalOpen) 
        throw new Error("Proposal needs to be open for objections");

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
          eventType: FeedEventTypes.ProposalObjectionAdded,
          spaceId: proposal.spaceId,
        }
      });

      await ctx.prisma.spaceFeedItem.create({
        data: {
          proposalId: input.proposalId,
          eventType: FeedEventTypes.ProposalObjectionAdded,
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
      if (proposal.state !== ProposalStates.ProposalOpen) 
        throw new Error("Can only close open proposals");

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
          state: ProposalStates.ObjectionsResolved,
          participants: {
            create: allSpaceUsers.map((u) => ({ participantId: u.userId })),
          },
        },
      });

      await ctx.prisma.userFeedItem.create({
        data: {
          userId: updatedProposal.creatorId,
          proposalId: input.proposalId,
          eventType: FeedEventTypes.ProposalVotingStarted,
          spaceId: proposal.spaceId,
        }
      });

      await ctx.prisma.spaceFeedItem.create({
        data: {
          proposalId: input.proposalId,
          eventType: FeedEventTypes.ProposalVotingStarted,
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

      if (proposal.state !== ProposalStates.ObjectionsResolved)
        throw new Error("Proposal not in votable state");

      const isParticipant = proposal.participants.some(p => p.participantId === ctx.session.user.id);
      if(!isParticipant) throw new Error("You are not a participant of this proposal");

      if (
        input.myPickId &&
        !proposal.participants.some((p) => p.participantId === input.myPickId)
      )
        throw new Error("Your my Pick is invalid.");

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

      if (proposal.state !== ProposalStates.ObjectionsResolved) 
        throw new Error("Can only end voting on resolved proposals");

      const updatedProposal = await ctx.prisma.proposal.update({
        where: {
          id: input.proposalId,
        },
        data: {
          state: ProposalStates.VoteClosed,
        },
      });

      await ctx.prisma.userFeedItem.create({
        data: {
          userId: updatedProposal.creatorId,
          proposalId: input.proposalId,
          eventType: FeedEventTypes.ProposalVotingEnded,
          spaceId: proposal.spaceId,
        }
      });

      await ctx.prisma.spaceFeedItem.create({
        data: {
          proposalId: input.proposalId,
          eventType: FeedEventTypes.ProposalVotingEnded,
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
        where: { spaceId: input.spaceId, state: ProposalStates.ProposalCreated },
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

      if (proposal.state === ProposalStates.VoteClosed) {
        const votes = await ctx.prisma.proposalVote.findMany({
          where: { proposalId: proposal.id },
        });

        const uniqueVotes = votes.reduce((acc, vote) => {
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

        const voteArray = Array.from(uniqueVotes.values());
        //TODO: Calculate accept results in %
        //TODO: Calculate myPick results
        const myPickResults = voteArray.reduce((acc, vote) => {
          if (vote.myPickId) {
            const pickVote = uniqueVotes.get(vote.myPickId);
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
          numberOfVotes: uniqueVotes.size,
          numberOfAccepts: voteArray.filter((v) => v.accept).length,
          numberOfRejects: voteArray.filter((v) => !v.accept).length,
          numberOfAbstains: voteArray.filter((v) => v.accept === undefined).length,
          numberOfMissedVotes: (proposal.participants.length - uniqueVotes.size),
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
