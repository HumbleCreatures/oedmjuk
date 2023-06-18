import { z } from "zod";
import { SpaceFeedEventTypes } from "../../../utils/enums";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import sanitizeHtml from 'sanitize-html';

export const bodyTemplateRouter = createTRPCRouter({
  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.bodyTemplate.create({
        data: {
          bodyTemplateVersions: {
            create: {
              name: input.name,
              body: input.body,
              isCurrentVersion: true
            }
          }
        },
      })
    }),
  updateTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        name: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {

      const template = await ctx.prisma.bodyTemplate.findUnique({
        where: {id: input.templateId}
      });

      if(!template) {
        throw new Error('Template not found');
      }
      
      const items = await ctx.prisma.$transaction([
        ctx.prisma.bodyTemplateVersion.updateMany({
          where: { bodyTemplateId: input.templateId },
          data: {
            isCurrentVersion: false
          },
        }),

        ctx.prisma.bodyTemplateVersion.create({
          data: {
            name: input.name,
            body: input.body,
            isCurrentVersion: true,
            bodyTemplateId: input.templateId,
          },
        })
      ]);

      return items[1];

    }),
  getTemplate: protectedProcedure
    .input(z.object({ templateId: z.string() }))
    .query(async ({ ctx, input }) => {
      const content = await ctx.prisma.bodyTemplate.findUnique({
        where: { id: input.templateId },
        include: { 
          bodyTemplateVersions: {
            where: { isCurrentVersion: true }
          }
        }
      });

      return content;
    }),
  getAllTemplates: protectedProcedure
    .query(async ({ ctx }) => {
      const content = await ctx.prisma.bodyTemplate.findMany({
        include: { 
          bodyTemplateVersions: {
            where: { isCurrentVersion: true }
          }
        }
      });
      return content;
    })
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
