import { Slot } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { tokenCache } from '@clerk/clerk-expo/token-cache'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { err, ok, Result } from 'neverthrow'

import { ThemeProvider } from '../ui/theme'

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
        <SafeAreaProvider>
            <ClerkProvider
                publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
                tokenCache={tokenCache}
            >
                {/* eslint-disable-next-line react-compiler/react-compiler */}
                <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                    <ThemeProvider>
                        <Slot />
                    </ThemeProvider>
                </ConvexProviderWithClerk>
            </ClerkProvider>
        </SafeAreaProvider>
    )
}
