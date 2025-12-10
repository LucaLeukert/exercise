import type { TRPCRouterRecord } from '@trpc/server'
import { TRPCError } from '@trpc/server'
import { z } from 'zod/v4'

import type { ExerciseType } from '@acme/validators'
import { ExerciseJSONPreprocessor } from '@acme/validators'

import { protectedProcedure } from '../trpc.js'

async function fetchExercisesInBatches(kv: KVNamespace, keys: string[]): Promise<ExerciseType[]> {
    const exercises: ExerciseType[] = []

    for (let i = 0; i < keys.length; i += 100) {
        const batch = keys.slice(i, i + 100)

        // Fetch up to 100 keys at once using bulk get
        const batchResults = await kv.get(batch, { type: 'json' })

        // Parse each result from the Map
        for (const [_, item] of batchResults) {
            if (item) {
                const parsed = ExerciseJSONPreprocessor.safeParse(item)
                if (parsed.success) {
                    exercises.push(parsed.data)
                }
            }
        }
    }

    return exercises
}

export const exerciseRouter = {
    getByIds: protectedProcedure
        .input(z.object({ ids: z.array(z.string()) }))
        .query(async ({ ctx, input }): Promise<{ exercises: ExerciseType[] }> => {
            const exercisesData = await Promise.all(
                input.ids.map(async (id) => {
                    const exerciseData = await ctx.env.KV.get(id)
                    if (!exerciseData) return null

                    const parseResult = ExerciseJSONPreprocessor.parse(exerciseData)

                    return parseResult
                })
            )

            const exercises = exercisesData.filter((ex): ex is ExerciseType => ex !== null)

            return {
                exercises
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
        }),

    version: protectedProcedure.query(async ({ ctx }) => {
        const result = await ctx.env.KV.list()
        const totalKeys = result.keys.length

        // Create a simple version string based on count and a timestamp
        // In production, you might want to store this in KV or use a more sophisticated versioning
        const version = `v1.0.${totalKeys}`

        return {
            version,
            totalExercises: totalKeys,
            timestamp: Date.now()
        }
    }),

    // Fetch all exercises for initial sync
    sync: protectedProcedure.query(
        async ({
            ctx
        }): Promise<{
            version: string
            exercises: ExerciseType[]
            timestamp: number
        }> => {
            const allKeys = (await ctx.env.KV.list()).keys.map((k) => k.name)
            const exercises = await fetchExercisesInBatches(ctx.env.KV, allKeys)

            // Create version
            const version = `v1.0.${exercises.length}`

            return {
                version,
                exercises,
                timestamp: Date.now()
            }
        }
    )
} satisfies TRPCRouterRecord
