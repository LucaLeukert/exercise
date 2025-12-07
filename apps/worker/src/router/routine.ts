import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { desc, eq } from "@acme/db";
import { CreateRoutineSchema, Routine, UpdateRoutineSchema } from "@acme/db/schema";
import { protectedProcedure, publicProcedure } from "../trpc";

export const routineRouter = {
  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.Routine.findMany({
      orderBy: desc(Routine.createdAt),
    });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => {
      return ctx.db.query.Routine.findFirst({
        where: eq(Routine.id, input.id),
      });
    }),

  create: protectedProcedure
    .input(CreateRoutineSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.insert(Routine).values(input).returning();
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: UpdateRoutineSchema,
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.db
        .update(Routine)
        .set(input.data)
        .where(eq(Routine.id, input.id))
        .returning();
    }),

  delete: protectedProcedure
    .input(z.string().uuid())
    .mutation(({ ctx, input }) => {
      return ctx.db.delete(Routine).where(eq(Routine.id, input)).returning();
    }),
} satisfies TRPCRouterRecord;
