import { Redirect, Stack } from 'expo-router'
import { SignedIn, SignedOut } from '@clerk/clerk-expo'

export default function HomeLayout() {
    return (
        <>
            <SignedIn>
                <Stack>
                    <Stack.Screen
                        name="exercise/[id]"
                        options={{
                            presentation: 'modal',
                            title: 'Exercise Details',
                            headerShown: true
                        }}
                    />
                    <Stack.Screen
                        name="exercises"
                        options={{
                            presentation: 'modal',
                            title: 'Exercises',
                            headerShown: false
                        }}
                    />
                </Stack>
            </SignedIn>
            <SignedOut>
                <Redirect href="/(auth)" />
            </SignedOut>
        </>
    )
}
