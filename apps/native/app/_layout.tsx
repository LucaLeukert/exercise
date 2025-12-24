import { Slot } from 'expo-router'
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'

import { env } from '../env'
import { ThemeProvider } from '../ui/theme'

const convex = new ConvexReactClient(env.EXPO_PUBLIC_CONVEX_URL)

export default function RootLayout() {
    return (
        <ClerkProvider
            publishableKey={env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
            tokenCache={tokenCache}
        >
            {/* eslint-disable-next-line react-compiler/react-compiler */}
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <ThemeProvider>
                    <Slot />
                </ThemeProvider>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    )
}
