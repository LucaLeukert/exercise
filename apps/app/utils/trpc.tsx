import { useState } from 'react'
import Constants from 'expo-constants'
import { useAuth } from '@clerk/clerk-expo'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import superjson from 'superjson'

import type { AppRouter } from '@acme/worker'

export const api = createTRPCReact<AppRouter>()

export const queryClient = new QueryClient()

export const getBaseUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri
    const localhost = debuggerHost?.split(':')[0]

    if (!localhost) {
        return `https://exercise-api.luca-acc.workers.dev`
    }
    return 'http://10.25.97.135:8787'
}

export function TRPCProvider(props: { children: React.ReactNode }) {
    const { getToken } = useAuth()
    const [trpcClient] = useState(() =>
        api.createClient({
            links: [
                loggerLink({
                    enabled: (opts) =>
                        process.env.NODE_ENV === 'development' ||
                        (opts.direction === 'down' && opts.result instanceof Error),
                    colorMode: 'ansi'
                }),
                httpBatchLink({
                    transformer: superjson,
                    url: `${getBaseUrl()}/trpc`,
                    async headers() {
                        const token = await getToken()
                        return {
                            Authorization: token ?? undefined
                        }
                    }
                })
            ]
        })
    )
    return (
        <QueryClientProvider client={queryClient}>
            <api.Provider client={trpcClient} queryClient={queryClient}>
                {props.children}
            </api.Provider>
        </QueryClientProvider>
    )
}
