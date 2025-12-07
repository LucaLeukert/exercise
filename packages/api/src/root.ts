import { authRouter } from "./router/auth";
import { postRouter } from "./router/post";
import { routineRouter } from "../../../apps/worker/src/router/routine";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  routine: routineRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
