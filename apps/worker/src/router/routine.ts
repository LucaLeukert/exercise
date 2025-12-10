import type { TRPCRouterRecord } from '@trpc/server'
import { z } from 'zod/v4'

import { and, desc, eq } from '@acme/db'
import { CreateRoutineSchema, Routine, UpdateRoutineSchema } from '@acme/db/schema'

import { protectedProcedure } from '../trpc'

export const routineRouter = {
    all: protectedProcedure.query(({ ctx }) => {
        return ctx.db.query.Routine.findMany({
            where: eq(Routine.userId, ctx.session.user.userId),
            orderBy: desc(Routine.createdAt)
        })
    }),

    byId: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(({ ctx, input }) => {
        const routine = ctx.db.query.Routine.findFirst({
            where: and(eq(Routine.id, input.id), eq(Routine.userId, ctx.session.user.userId))
        })

        return routine
    }),

    create: protectedProcedure.input(CreateRoutineSchema).mutation(async ({ ctx, input }) => {
        const result = await ctx.db
            .insert(Routine)
            .values({
                userId: ctx.session.user.userId,
                name: input.name,
                description: input.description,
                exercises: input.exercises
            })
            .returning()
        return result
    }),

    update: protectedProcedure
        .input(
            z.object({
                id: z.string().uuid(),
                data: UpdateRoutineSchema
            })
        )
        .mutation(({ ctx, input }) => {
            return ctx.db
                .update(Routine)
                .set(input.data)
                .where(eq(Routine.id, input.id))
                .returning()
        }),

    delete: protectedProcedure.input(z.string().uuid()).mutation(({ ctx, input }) => {
        return ctx.db.delete(Routine).where(eq(Routine.id, input)).returning()
    })
} satisfies TRPCRouterRecord
