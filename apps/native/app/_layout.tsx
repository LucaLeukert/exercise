import { Slot, Stack } from 'expo-router'
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { err, ok, Result } from 'neverthrow'

function getConvexUrl(): Result<string, Error> {
    const url = process.env.EXPO_PUBLIC_CONVEX_URL
    if (!url) {
        return err(new Error('Missing EXPO_PUBLIC_CONVEX_URL in your .env file'))
    }
    return ok(url)
}

const convexUrlResult = getConvexUrl()
if (convexUrlResult.isErr()) {
    throw convexUrlResult.error
}
const convexUrl = convexUrlResult.value

const convex = new ConvexReactClient(convexUrl)

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
