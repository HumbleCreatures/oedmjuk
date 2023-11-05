import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { AccessRequestStates, AccessRequestStepTypes } from "../../../../utils/enums";
import type { Prisma, PrismaClient } from "@prisma/client";

export const connectFeedbackRoundRouter = createTRPCRouter({
    markConnectFeedbackRoundAsDone: protectedProcedure
    .input(
      z.object({
        stepId: z.string(),
        accessRequestId: z.string(),
        connectedFeedbackRoundId: z.string(),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        const accessRequestStep = await ctx.prisma.accessRequestStep.findUnique({
          where: { id: input.stepId },
          include: {
            stepExecutions: true,
          }
        });

        if(!accessRequestStep) {
          throw new Error('Access Request Type Step not found');
        }

        if(accessRequestStep.stepType !== AccessRequestStepTypes.Feedback) {
          throw new Error('Access Request Type has to be access request');
        }

        const accessRequest = await ctx.prisma.accessRequest.findUnique(
          {where: { id: input.accessRequestId }}
          
        );
        if(!accessRequest) {
          throw new Error('Access Request not found');
        }
        const membership = await ctx.prisma.spaceMember.findMany({
          where: {
            spaceId: accessRequest.spaceId,
            userId: ctx.session.user.id
          }
        })
        if(!membership) {
          throw new Error('only members can set done.');
        }

        if(accessRequestStep.stepExecutions.some(step => step.stepFinished  && step.id === input.stepId)) {
          throw new Error('Step already finished.');
        }

        const createResult = await ctx.prisma.accessRequestStepExecution.create({
            data: {
              accessRequestId: accessRequest.id,
              accessRequestStepId: accessRequestStep.id,
              executingUserId: ctx.session.user.id,
              connectedFeedbackRoundId: input.connectedFeedbackRoundId,
              done: true,
              log: input.comment,
              stepFinished: true 
            }
          });

          if(await ShouldFinishAccessRequest(ctx.session.user.id, accessRequest.id, ctx.prisma)){
            await ctx.prisma.accessRequest.update({
              where: {id: accessRequest.id},
              data: {
                state: AccessRequestStates.Finished,
              }
              
            })
          }
          
          return createResult;
    }),

    markConnectFeedbackRoundAsFailure: protectedProcedure
    .input(
      z.object({
        stepId: z.string(),
        accessRequestId: z.string(),
        comment: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        const accessRequestStep = await ctx.prisma.accessRequestStep.findUnique({
          where: { id: input.stepId },
          include: {
            stepExecutions: true,
          }
        });

        if(!accessRequestStep) {
          throw new Error('Access Request Type Step not found');
        }

        if(accessRequestStep.stepType !== AccessRequestStepTypes.Feedback) {
          throw new Error('Access Request Type has to be access request');
        }

        const accessRequest = await ctx.prisma.accessRequest.findUnique(
          {where: { id: input.stepId }}
          
        );
        if(!accessRequest) {
          throw new Error('Access Request Type Step not found');
        }
        const membership = await ctx.prisma.spaceMember.findMany({
          where: {
            spaceId: accessRequest.spaceId,
            userId: ctx.session.user.id
          }
        })
        if(!membership) {
          throw new Error('only members can set done.');
        }

        if(accessRequestStep.stepExecutions.some(step => step.stepFinished)) {
          throw new Error('Step already finished.');
        }
        
        const createResult = await ctx.prisma.accessRequestStepExecution.create({
            data: {
              accessRequestId: accessRequest.id,
              accessRequestStepId: accessRequestStep.id,
              executingUserId: ctx.session.user.id,
              failed: true,
              log: input.comment, 
            }
          });

          
          return createResult;
    }),

    markConnectFeedbackRoundAsSkipped: protectedProcedure
    .input(
      z.object({
        stepId: z.string(),
        accessRequestId: z.string(),
        comment: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        const accessRequestStep = await ctx.prisma.accessRequestStep.findUnique({
          where: { id: input.stepId },
          include: {
            stepExecutions: true,
          }
        });

        if(!accessRequestStep) {
          throw new Error('Access Request Type Step not found');
        }

        if(accessRequestStep.stepType !== AccessRequestStepTypes.Feedback) {
          throw new Error('Access Request Type has to be access request');
        }

        const accessRequest = await ctx.prisma.accessRequest.findUnique(
          {where: { id: input.stepId }}
          
        );
        if(!accessRequest) {
          throw new Error('Access Request Type Step not found');
        }
        const membership = await ctx.prisma.spaceMember.findMany({
          where: {
            spaceId: accessRequest.spaceId,
            userId: ctx.session.user.id
          }
        })
        if(!membership) {
          throw new Error('only members can set done.');
        }

        if(accessRequestStep.stepExecutions.some(step => step.stepFinished)) {
          throw new Error('Step already finished.');
        }
        
        const createResult = await ctx.prisma.accessRequestStepExecution.create({
            data: {
              accessRequestId: accessRequest.id,
              accessRequestStepId: accessRequestStep.id,
              executingUserId: ctx.session.user.id,
              done: true,
              stepFinished: true,
              log: input.comment, 
            }
          });

          
          return createResult;
    }),
});

async function ShouldFinishAccessRequest (userId:string,accessRequestId: string, prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>) {
  const accessRequest = await prisma.accessRequest.findUnique({
    where: { id: accessRequestId },
    include: {
      stepExecutions: true,
      accessRequestType: { 
        include: {
          steps: true
        }
      }
    }
  });

  if(!accessRequest) {
    return false;
  }

  const stepsLeft = accessRequest.accessRequestType.steps.filter(step => {
    return !accessRequest.stepExecutions.some(execution => execution.stepFinished && execution.accessRequestStepId === step.id);
  });

  if(stepsLeft.length === 0){
    return true;
  }

  if(stepsLeft[0] && stepsLeft[0].stepType === AccessRequestStepTypes.JoinSpace) {
    const existingMemberships = await prisma.spaceMember.findMany({
      where:{
        spaceId: accessRequest.spaceId,
        userId: userId,
        leftAt: null
      }
    });

    if(existingMemberships.length !== 0) { 
      return stepsLeft.length === 1;
    }

    await prisma.spaceMember.create({
      data: {
        spaceId: accessRequest.spaceId,
        userId: userId
       }
    });

    return stepsLeft.length === 1;
  } 

  
}