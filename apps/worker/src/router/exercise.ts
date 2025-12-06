import type { TRPCRouterRecord } from '@trpc/server'
import { Exercise, ExerciseWithJson } from '@acme/validators'
import { TRPCError } from '@trpc/server'
import z from 'zod'

import { protectedProcedure, publicProcedure } from '../trpc.js'

export const exerciseRouter = {
	all: publicProcedure.query(({ ctx }) => {
		// const keys = await ctx.env.KV.list();
		return { test: ctx.session.user?.userId, fwa: 'exercise all test' }
	}),
	fetchExercise: publicProcedure
		.input(
			z.object({
				id: Exercise.shape.id,
			}),
		)
		.query(async ({ ctx, input }) => {
			const exercise = await ctx.env.KV.get(input.id)
			if (!exercise) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Exercise not found',
				})
			}

			const result = ExerciseWithJson.safeParse(exercise)
			if (!result.success) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to parse exercise data',
				})
			}

			return {
				exercise: result.data,
			}
		}),
} satisfies TRPCRouterRecord
