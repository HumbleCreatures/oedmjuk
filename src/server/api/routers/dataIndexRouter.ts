import { z } from "zod";
import { FeedEventTypes } from "../../../utils/enums";

import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getDatesBetween } from "../../../utils/dateFormaters";
import sanitizeHtml from 'sanitize-html';

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
            description: input.description && sanitizeHtml(input.description),
            unitName: input.unitName,            
          },
        })
    }),
    getAllIndexTypes: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.prisma.dataIndexType.findMany();
    }),
    getIndexType: protectedProcedure
    .input(
      z.object({
        dataIndexTypeId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await ctx.prisma.dataIndexType.findUnique({ where: { id: input.dataIndexTypeId }});
    }),
    updateIndexType: protectedProcedure
    .input(
      z.object({
        dataIndexTypeId: z.string(),
        name: z.string(),
        description: z.string().optional(),
        unitName: z.string().max(10),
      })
    )
    .mutation(async ({ ctx, input }) => {

      const indexType = await ctx.prisma.dataIndexType.findUnique({
        where: {id: input.dataIndexTypeId}
      });

      if(!indexType) {
        throw new Error('Data index type not found');
      }
      
      return ctx.prisma.dataIndexType.update({ 
        where: { id: input.dataIndexTypeId },
        data: { 
          name: input.name,
          description: input.description,
          unitName: input.unitName,
        }
      });
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
            creatorId: ctx.session.user.id,
            unitTypeId: input.unitTypeId,            
            spaceFeedItem: {
              create: {
                spaceId: input.spaceId,
                eventType: FeedEventTypes.DataIndexCreated,
              },
            },            
          },
        })
    }),
    updateDataIndex: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        title: z.string(),
        description: z.string(),
        unitTypeId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        return ctx.prisma.dataIndex.update({
          where: { id: input.itemId},
          data: {
            title: input.title,
            description: input.description,
            unitTypeId: input.unitTypeId,                           
          },
        })
    }),
  getDataIndex: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .query(async ({ ctx, input }) => {
      const content = await ctx.prisma.dataIndex.findUnique({
        where: { id: input.itemId },
        include: {
          unitType: true,
        }
      });
      
      return content;
    }),
    getDataIndicesForSpace: protectedProcedure
    .input(z.object({ spaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const sevenDaysAgo = new Date(new Date().setDate(new Date().getDate() - 7));
      const dataIndices = await ctx.prisma.dataIndex.findMany({
        where: { spaceId: input.spaceId },
        include: {
          unitType: true,
          dataIndexPoints: {
            where: { datestamp: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) } },
          },
        }
      });

      const result = dataIndices.map(dataIndex => { 
        const newPoints = getDatesBetween(sevenDaysAgo, new Date()).map(date => {
          const dataPoint = dataIndex.dataIndexPoints.find(point => point.datestamp.toISOString().split('T')[0] === date.toISOString().split('T')[0]);
          if(dataPoint) {
            return dataPoint;
          } else {
            return {
              id: date.toISOString(),
              datestamp: date,
              value: 0,
            }
          }
        });

        return {dataIndex, dataIndexPoints: newPoints}

      })

      
      return result;
    }),
    getDataPointsForIndex: protectedProcedure
    .input(z.object({ dataIndexId: z.string() }))
    .query(async ({ ctx, input }) => {
      const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
      const dataPoints = await ctx.prisma.dataIndexPoint.findMany({
        where: { 
          dataIndexId: input.dataIndexId, 
          datestamp: { gte: thirtyDaysAgo }
        },
        orderBy: { datestamp: 'asc' },
      });

      const dateSeries = getDatesBetween(thirtyDaysAgo, new Date()).map(date => {
        const dataPoint = dataPoints.find(point => point.datestamp.toISOString().split('T')[0] === date.toISOString().split('T')[0]);
        if(dataPoint) {
          return dataPoint;
        } else {
          return {
            id: date.toISOString(),
            datestamp: date,
            value: 0,
          }
        }
      });

      
      return dateSeries;
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
        const offset = input.datestamp.getTimezoneOffset()
        const offsetDate = new Date(input.datestamp.getTime() - (offset*60*1000))
        const resultingDate = offsetDate.toISOString().split('T')[0]

        if(!resultingDate) {
          throw new Error('Invalid datestamp');
        }
        const fixedDatestamp = new Date(resultingDate);
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
