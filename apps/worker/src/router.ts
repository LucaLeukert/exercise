import { exerciseRouter } from './router/exercise'
import { routineRouter } from './router/routine'
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({
    exercise: exerciseRouter,
    routine: routineRouter
})

export type AppRouter = typeof appRouter
