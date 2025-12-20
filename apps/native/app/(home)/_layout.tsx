import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { useConvexAuth } from 'convex/react'

export default function HomeLayout() {
    const { isLoading, isAuthenticated } = useConvexAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/(auth)')
        }
    }, [isLoading, isAuthenticated, router])

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return (
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
    )
}
