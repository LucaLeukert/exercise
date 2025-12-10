import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { WorkerEntrypoint } from 'cloudflare:workers'

import type { AppRouter } from './router'
import { appRouter } from './router'
import { createTRPCContext } from './trpc'

export default class TRPCCloudflareWorkerExample extends WorkerEntrypoint {
    async fetch(request: Request): Promise<Response> {
        if (request.method === 'OPTIONS') {
            return handleCORSPreflight()
        }

        return fetchRequestHandler({
            endpoint: '/trpc',
            req: request,
            router: appRouter,
            createContext: () => createTRPCContext({ request })
        })
    }
}

const handleCORSPreflight = () => {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        }
    })
}

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 */
type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 */
type RouterOutputs = inferRouterOutputs<AppRouter>

export { type AppRouter, appRouter } from './router'
export { createTRPCContext } from './trpc'
export type { RouterInputs, RouterOutputs }
