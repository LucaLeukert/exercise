import type { TRPCRouterRecord } from '@trpc/server'
import { TRPCError } from '@trpc/server'
import z from 'zod'

import { ExerciseJSONPreprocessor, type ExerciseType } from '@acme/validators'

import { protectedProcedure, publicProcedure } from '../trpc.js'

export const exerciseRouter = {
    cursor: protectedProcedure
        .input(
            z.object({
                cursor: z.string().nullish(),
                take: z.number().min(1).max(100).nullish()
            })
        )
        .query(async ({ ctx, input }): Promise<{ exercises: ExerciseType[]; nextCursor: string | null }> => {
            const limit = input.take ?? 20

            const result = await ctx.env.KV.list({
                limit,
                cursor: input.cursor ?? undefined
            })

            const exercisesData = await Promise.all(
                result.keys.map(async (item) => {
                    const exerciseData = await ctx.env.KV.get(item.name)
                    if (!exerciseData) return null

                    const parseResult = ExerciseJSONPreprocessor.parse(exerciseData)

                    return parseResult
                })
            )
            
            const exercises = exercisesData.filter((ex): ex is ExerciseType => ex !== null)
            const nextCursor = result.list_complete ? null : result.cursor

            return {
                exercises,
                nextCursor
            }
        }),
    amount: protectedProcedure.query(async ({ ctx }) => {
        const result = await ctx.env.KV.list()
        return {
            amount: result.keys.length
        }
    }),
    fetchExercise: protectedProcedure
        .input(
            z.object({
                id: z.string()
            })
        )
        .query(async ({ ctx, input }) => {
            const exercise = await ctx.env.KV.get(input.id)
            if (!exercise) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Exercise not found'
                })
            }

            const result = ExerciseJSONPreprocessor.safeParse(exercise)
            if (!result.success) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to parse exercise data'
                })
            }

            return {
                exercise: result.data
            }
        })
} satisfies TRPCRouterRecord
