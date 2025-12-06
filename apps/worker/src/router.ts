import { exerciseRouter } from "./router/exercise"
import { createTRPCRouter } from "./trpc"

export const appRouter = createTRPCRouter({
  exercise: exerciseRouter,
})

export type AppRouter = typeof appRouter
