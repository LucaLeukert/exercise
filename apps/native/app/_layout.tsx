import { Slot, Stack } from 'expo-router'
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'

if (!process.env.EXPO_PUBLIC_CONVEX_URL) {
    throw new Error('Missing EXPO_PUBLIC_CONVEX_URL in your .env file')
}

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL)

export default function RootLayout() {
    return (
        <ClerkProvider
            publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
            tokenCache={tokenCache}
        >
            {/* eslint-disable-next-line react-compiler/react-compiler */}
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <Slot />
            </ConvexProviderWithClerk>
        </ClerkProvider>
    )
}
