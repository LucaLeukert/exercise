import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Slot } from 'expo-router'
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'

import { env } from '../env'
import { ThemeProvider } from '../ui/theme'

const convex = new ConvexReactClient(env.EXPO_PUBLIC_CONVEX_URL)
const queryClient = new QueryClient()

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <ClerkProvider
                publishableKey={env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
                tokenCache={tokenCache}
            >
                {/* eslint-disable-next-line react-compiler/react-compiler */}
                <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                    <QueryClientProvider client={queryClient}>
                        <ThemeProvider>
                            <Slot />
                        </ThemeProvider>
                    </QueryClientProvider>
                </ConvexProviderWithClerk>
            </ClerkProvider>
        </SafeAreaProvider>
    )
}
