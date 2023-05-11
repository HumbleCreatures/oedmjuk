import { z } from "zod";
import { FeedEventTypes } from "../../../utils/enums";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const dataIndexRouter = createTRPCRouter({
    createDataIndexType: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        unitName: z.string().max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
        return ctx.prisma.dataIndexType.create({
          data: {
            name: input.name,
            description: input.description,
            unitName: input.unitName,            
          },
        })
    }),
    getAllIndexTypes: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.prisma.dataIndexType.findMany();
    }),
  createDataIndex: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        unitTypeId: z.string(),
        spaceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        return ctx.prisma.dataIndex.create({
          data: {
            title: input.title,
            description: input.description,
            spaceId: input.spaceId,
            authorId: ctx.session.user.id,
            unitTypeId: input.unitTypeId,            
            spaceFeedItem: {
              create: {
                spaceId: input.spaceId,
                feedEventType: FeedEventTypes.DataIndexCreated,
              },
            },            
          },
        })
    }),
  getDataIndex: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      const content = await ctx.prisma.dataIndex.findUnique({
        where: { id: input.itemId },
        include: {
          dataIndexPoints: true,
          unitType: true,
        }
      });
      
      return content;
    }),
    upsertDataIndexPoint: protectedProcedure
    .input(
      z.object({
        datestamp: z.date(),
        value: z.number(),
        dataIndexId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        const fixedDatestamp = new Date(new Date().toDateString());
        const currentDataIndexPoint = await ctx.prisma.dataIndexPoint.findFirst({
          where: {
            dataIndexId: input.dataIndexId,
            datestamp: fixedDatestamp,
          }
        });

        if(currentDataIndexPoint) {
          return ctx.prisma.dataIndexPoint.update({
            where: {
              id: currentDataIndexPoint.id
            },
            data: {
              value: input.value,
            }
          })
        }

        return ctx.prisma.dataIndexPoint.create({
          data: {
            dataIndexId: input.dataIndexId,
            datestamp: fixedDatestamp,
            value: input.value,
          }});

    }),

});
