import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure
  .input(z.object({ userId: z.string()}))
  .query(({ ctx, input }) => { 
    return ctx.prisma.user.findUnique({where:{ id:input.userId }});
  }),
  getUserFeed: protectedProcedure
  .input(z.object({ userId: z.string()}))
  .query(({ ctx, input }) => { 
    return ctx.prisma.user.findUnique({where:{ id:input.userId }});
  }),
})

