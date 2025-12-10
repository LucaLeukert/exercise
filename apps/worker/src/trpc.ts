import type { SignedInAuthObject } from '@clerk/backend/internal'
import { createClerkClient } from '@clerk/backend'
import { TokenType } from '@clerk/backend/internal'
import { initTRPC, TRPCError } from '@trpc/server'
import { env } from 'cloudflare:workers'
import superjson from 'superjson'
import { z, ZodError } from 'zod/v4'

import { createDbClient } from '@acme/db/client'

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */

const createClerkClientInternal = () => {
    const publishableKey = env.CLERK_PUBLISHABLE_KEY
    const secretKey = env.CLERK_SECRET_KEY

    if (!secretKey || !publishableKey) {
        throw new Error('Clerk keys are not set in environment variables')
    }

    return {
        publishableKey,
        secretKey,
        client: createClerkClient({
            publishableKey,
            secretKey
        })
    }
}

export const createTRPCContext = async (opts: { request: Request }) => {
    const { client: clerkClient, publishableKey, secretKey } = createClerkClientInternal()
    const { isAuthenticated, toAuth } = await clerkClient.authenticateRequest(opts.request, {
        publishableKey,
        secretKey,
        acceptsToken: TokenType.SessionToken
    })

    // Create DB client with Cloudflare Workers env
    const db = createDbClient(env.POSTGRES_URL)

    return {
        clerkClient,
        db,
        env,
        session: { isAuthenticated, user: toAuth() }
    }
}
/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter: ({ shape, error }) => ({
        ...shape,
        data: {
            ...shape.data,
            zodError:
                error.cause instanceof ZodError
                    ? z.flattenError(error.cause as ZodError<Record<string, unknown>>)
                    : null
        }
    })
})

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.session.isAuthenticated) {
        throw new TRPCError({ code: 'UNAUTHORIZED' })
    }
    return next({
        ctx: {
            // infers the `session` as non-nullable
            session: { ...ctx.session, user: ctx.session.user as SignedInAuthObject }
        }
    })
})
