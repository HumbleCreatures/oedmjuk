import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { AccessRequestStates, AccessRequestStepTypes } from "../../../utils/enums";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime";

export const accessRequestRouter = createTRPCRouter({
  createAccessRequestType: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        spaceId: z.string(),
        hasOnBehalfOfUser: z.boolean(),
        onBehalfOfUserIsRequired: z.boolean(),
        hasOnBehalfOfSpace: z.boolean(),
        onBehalfOfSpaceIsRequired: z.boolean(),
        minimumNumberOfApprovals: z.number()
      })
    )
    .mutation(async ({ ctx, input }) => {
        return ctx.prisma.accessRequestType.create({
          data: {
            name: input.name,
            description: input.description,
            spaceId: input.spaceId,
            hasOnBehalfOfUser: input.hasOnBehalfOfUser,
            onBehalfOfUserIsRequired: input.onBehalfOfUserIsRequired,
            hasOnBehalfOfSpace: input.hasOnBehalfOfSpace,
            onBehalfOfSpaceIsRequired: input.onBehalfOfSpaceIsRequired,
            minimumNumberOfApprovals: input.minimumNumberOfApprovals         
          },
        })
    }),
    updateAccessRequestType: protectedProcedure
    .input(
      z.object({
        accessRequestTypeId: z.string(),
        name: z.string(),
        description: z.string(),
        hasOnBehalfOfUser: z.boolean(),
        onBehalfOfUserIsRequired: z.boolean(),
        hasOnBehalfOfSpace: z.boolean(),
        onBehalfOfSpaceIsRequired: z.boolean(),
        minimumNumberOfApprovals: z.number()
      })
    )
    .mutation(async ({ ctx, input }) => {
        return ctx.prisma.accessRequestType.update({
          where: { id: input.accessRequestTypeId},
          data: {
            name: input.name,
            description: input.description,
            hasOnBehalfOfUser: input.hasOnBehalfOfUser,
            onBehalfOfUserIsRequired: input.onBehalfOfUserIsRequired,
            hasOnBehalfOfSpace: input.hasOnBehalfOfSpace,
            onBehalfOfSpaceIsRequired: input.onBehalfOfSpaceIsRequired,
            minimumNumberOfApprovals: input.minimumNumberOfApprovals                       
          },
        })
    }),
  getAccessRequestType: protectedProcedure
    .input(z.object({ accessRequestTypeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const accessRequestType = await ctx.prisma.accessRequestType.findUnique({
        where: { id: input.accessRequestTypeId }
      });
      
      return accessRequestType;
    }),
    getAllAccessRequestTypesForSpace: protectedProcedure
    .input(z.object({ spaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const accessRequestTypes = await ctx.prisma.accessRequestType.findMany({
        where: { spaceId: input.spaceId },
        orderBy: { createdAt: 'desc' },
      });
      
      return accessRequestTypes;
    }),

    createAccessRequestStep: protectedProcedure
    .input(
      z.object({
        accessRequestTypeId: z.string(),
        stepType: z.nativeEnum(AccessRequestStepTypes),
        name: z.string(),
        description: z.string(),
        manualAction: z.number(),
        approvalFromOnBehalfOfSpace: z.number(),        
      })
    )
    .mutation(async ({ ctx, input }) => {
        return ctx.prisma.accessRequestStep.create({
          data: {
            stepType: input.stepType,
            name: input.name,
            description: input.description,
            accessRequestTypeId: input.accessRequestTypeId,
            joinSpace: input.stepType === AccessRequestStepTypes.JoinSpace,
            manualAction: input.manualAction,
            approvalFromRequester: input.stepType === AccessRequestStepTypes.RequesterApproval,
            approvalFromOnBehalfOfUser: input.stepType === AccessRequestStepTypes.OnBehalfOfUserApproval,
            approvalFromOnBehalfOfSpace: input.approvalFromOnBehalfOfSpace,
            order: 0,         
          },
        })
    }),
    deleteAccessRequestStep: protectedProcedure
    .input(
      z.object({
        accessRequestStepId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        return ctx.prisma.accessRequestStep.update({
          where: { id: input.accessRequestStepId},
          data: {
            deletedAt: new Date(),       
          },
        })
    }),
    getAllAccessRequestStepsForType: protectedProcedure
    .input(z.object({ accessRequestTypeId: z.string() }))
    .query(async ({ ctx, input }) => {
      const accessRequestTypes = await ctx.prisma.accessRequestStep.findMany({
        where: { accessRequestTypeId: input.accessRequestTypeId, 
          deletedAt: null },
        orderBy: { createdAt: 'asc' },
      });
      
      return accessRequestTypes;
    }),
    createAccessRequest: protectedProcedure
    .input(
      z.object({
        accessRequestTypeId: z.string(),
        body: z.string(),
        onBehalfOfUserId: z.string().optional(),
        onBehalfOfSpaceId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        const accessRequestType = await ctx.prisma.accessRequestType.findUnique({
          where: { id: input.accessRequestTypeId }
        });
        if(!accessRequestType) {
          throw new Error('Access Request Type not found');
        }
        if(accessRequestType.hasOnBehalfOfUser && !input.onBehalfOfUserId) {
          throw new Error('On Behalf Of User is required');
        }
        if(accessRequestType.hasOnBehalfOfSpace && !input.onBehalfOfSpaceId) {
          throw new Error('On Behalf Of Space is required');
        }

        return ctx.prisma.accessRequest.create({
          data: {
            body: input.body,
            state: AccessRequestStates.Created,
            accessRequestTypeId: input.accessRequestTypeId,
            onBehalfOfUserId: input.onBehalfOfUserId,
            onBehalfOfSpaceId: input.onBehalfOfSpaceId,
            creatorId: ctx.session.user.id,
            spaceId: accessRequestType.spaceId,
          },
        })
    }),
    getAccessRequest: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.accessRequest.findUnique({
        where: { id: input.itemId },
        include: { 
          accessRequestType: {
            include: { 
              steps: true
            }
          },
          accessRequestApproval: true,
          accessRequestObjection: true,
          stepExecutions: true,
        }
      });
    }),
    getAllAccessRequestsForSpace: protectedProcedure
    .input(z.object({ spaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.accessRequest.findMany({
        where: { spaceId: input.spaceId },
        include: {accessRequestType: true },
        orderBy: { createdAt: 'desc' },
      });      
    }),
    acceptAccessRequest: protectedProcedure
    .input(
      z.object({
        accessRequestId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        const accessRequest = await ctx.prisma.accessRequest.findUnique({
          where: { id: input.accessRequestId },
          include: {accessRequestType: true}
        });
        if(!accessRequest) {
          throw new Error('Access Request Type not found');
        }

        if(accessRequest.state !== AccessRequestStates.Created) {
          throw new Error('Only created access request can be approved.');
        }

        const membership = await ctx.prisma.spaceMember.findMany({
          where: {
            spaceId: accessRequest.spaceId,
            userId: ctx.session.user.id
          }
        })
        if(!membership) {
          throw new Error('only members can approve requests');
        }

        const currentApproves = await ctx.prisma.accessRequestApproval.findMany({
          where: {
            accessRequestId: accessRequest.id,
          }
        });

        if(currentApproves.some(approve => approve.creatorId === ctx.session.user.id)) {
          throw new Error('member has already approved.');
        }

        const allApprovesAreProvided = !accessRequest.accessRequestType.minimumNumberOfApprovals
        || accessRequest.accessRequestType.minimumNumberOfApprovals <= (currentApproves.length + 1);

        if(!allApprovesAreProvided) {
          return ctx.prisma.accessRequestApproval.create({
            data: {
              accessRequestId: accessRequest.id,
              creatorId: ctx.session.user.id,
            }
          })
        }
        
        return ctx.prisma.$transaction([
          ctx.prisma.accessRequestApproval.create({
            data: {
              accessRequestId: accessRequest.id,
              creatorId: ctx.session.user.id,
            }
          }),
  
          ctx.prisma.accessRequest.update({
            where: {id: accessRequest.id},
            data: {
              state: AccessRequestStates.Approved
            }
          })
        ]);

    }),

    denyAccessRequest: protectedProcedure
    .input(
      z.object({
        accessRequestId: z.string(),
        comment: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        const accessRequest = await ctx.prisma.accessRequest.findUnique({
          where: { id: input.accessRequestId },
          include: {accessRequestType: true}
        });
        if(!accessRequest) {
          throw new Error('Access Request Type not found');
        }

        if(accessRequest.state !== AccessRequestStates.Created) {
          throw new Error('Only created access request can be approved.');
        }

        const membership = await ctx.prisma.spaceMember.findMany({
          where: {
            spaceId: accessRequest.spaceId,
            userId: ctx.session.user.id
          }
        });
        if(!membership) {
          throw new Error('only members can approve requests');
        }

        
        return ctx.prisma.$transaction([
          ctx.prisma.accessRequestObjection.create({
            data: {
              accessRequestId: accessRequest.id,
              creatorId: ctx.session.user.id,
              comment: input.comment
            }
          }),
  
          ctx.prisma.accessRequest.update({
            where: {id: accessRequest.id},
            data: {
              state: AccessRequestStates.Denied
            }
          })
        ]);

    }),

    markManualStepAsDone: protectedProcedure
    .input(
      z.object({
        stepId: z.string(),
        accessRequestId: z.string(),
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

        const stepFinished = accessRequestStep.manualAction ? accessRequestStep.manualAction <=
        accessRequestStep.stepExecutions.filter(step => step.done).length + 1 : true;

        const createResult = await ctx.prisma.accessRequestStepExecution.create({
            data: {
              accessRequestId: accessRequest.id,
              accessRequestStepId: accessRequestStep.id,
              executingUserId: ctx.session.user.id,
              done: true,
              log: input.comment,
              stepFinished 
            }
          });

          if(await ShouldFinishAccessRequest(accessRequest.id, ctx.prisma)){
            await ctx.prisma.accessRequest.update({
              where: {id: accessRequest.id},
              data: {
                state: AccessRequestStates.Finished,
              }
              
            })
          }
          
          return createResult;
    }),

    markManualStepAsFailure: protectedProcedure
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
    getStepStatusForUser: protectedProcedure
    .input(z.object({ 
      stepId: z.string(),
      accessRequestId: z.string() 
    }))
    .query(async ({ ctx, input }) => {
      const accessRequest = await ctx.prisma.accessRequest.findUnique({
        where: { id: input.accessRequestId },
        include: { stepExecutions: true },
      });

      if(!accessRequest) {
        throw new Error('Access Request Type Step not found'); 
      }

      if(accessRequest.state !== AccessRequestStates.Approved) {
        throw new Error('Access Request Needs to be approved'); 
      }

      const stepExecutions = accessRequest.stepExecutions.filter(execution =>
        execution.accessRequestStepId === input.stepId);

      const stepFinished = accessRequest.stepExecutions.some(execution => execution.accessRequestStepId === input.stepId && execution.stepFinished)
      if(stepFinished) {
        throw new Error("Step is finished");
      }
      const step = await ctx.prisma.accessRequestStep.findUnique({
        where: {id: input.stepId}
      });

      if(!step) {
        throw new Error('Access RequestStep not found'); 
      }

      if(step.stepType === AccessRequestStepTypes.JoinSpace) {
        return {stepExecutions, canInteract: false};
      }

      if(step.stepType === AccessRequestStepTypes.RequesterApproval) {
        return {stepExecutions, canInteract: accessRequest.creatorId === ctx.session.user.id};
      }

      if(step.stepType === AccessRequestStepTypes.OnBehalfOfUserApproval) {
        return {stepExecutions, canInteract: accessRequest.onBehalfOfUserId === ctx.session.user.id};
      }

      if(step.manualAction) {
        const manualActionTaken = accessRequest.stepExecutions.some(execution =>
          execution.accessRequestStepId === input.stepId && execution.executingUserId === ctx.session.user.id
          )
          if(manualActionTaken) {
            return {stepExecutions, canInteract: false, hasTakenAction: true};
          }

          const membership = await ctx.prisma.spaceMember.findMany({
            where: {
              spaceId: accessRequest.spaceId,
              userId: ctx.session.user.id
            }
          });

          return {stepExecutions, canInteract: !!membership};
      }

      if(step.approvalFromOnBehalfOfSpace) {
        if(!accessRequest.onBehalfOfSpaceId) {
          return {stepExecutions, canInteract: false};
        }
        const actionTaken = accessRequest.stepExecutions.some(execution =>
          execution.accessRequestStepId === input.stepId && execution.executingUserId === ctx.session.user.id
          )
          if(actionTaken) {
            return {stepExecutions, canInteract: false, hasTakenAction: true};
          }

          

          const membership = await ctx.prisma.spaceMember.findMany({
            where: {
              spaceId: accessRequest.onBehalfOfSpaceId,
              userId: ctx.session.user.id
            }
          });

          return {stepExecutions, canInteract: !!membership};
      }
      return {stepExecutions, canInteract: false};
    }),
    
  
});

async function ShouldFinishAccessRequest (accessRequestId: string, prisma: PrismaClient<Prisma.PrismaClientOptions, never, Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined, DefaultArgs>) {
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

  return accessRequest.accessRequestType.steps.filter(step => {
    return accessRequest.stepExecutions.some(execution => execution.stepFinished);
  }).length === 0;

}