import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import { BackButton } from '@/components/BackButton'
import { Avatar, Button, Card, Separator, Text, Theme, useTheme } from '@/ui'
import { api } from '@/utils/convex'
import { useUser } from '@clerk/clerk-expo'
import { useQuery as useReactQuery } from '@tanstack/react-query'
import { useAction, useQuery } from 'convex/react'

const Screen = ({ theme }: { theme: Theme }) => (
    <Stack.Screen
        options={{
            title: 'Profile',
            headerShown: true,
            headerLeft: () => <BackButton />,
            headerStyle: {
                backgroundColor: theme.colors.surface
            },
            headerTintColor: theme.colors.text
        }}
    />
)

export default function UserProfilePage() {
    const { theme } = useTheme()
    const { user: currentUser } = useUser()
    const { id } = useLocalSearchParams<{ id: string }>()
    const isOwnProfile = currentUser?.id === id

    const profile = useQuery(api.userProfiles.getByUserId, { userId: id })
    const clerkProfileAction = useAction(api.userProfiles.getClerkPublicInfo)

    // Use React Query to call the Convex action for Clerk info
    const { data: clerkInfo, isLoading: isLoadingClerkInfo } = useReactQuery({
        queryKey: ['clerkProfile', id],
        queryFn: async () => {
            return await clerkProfileAction({ userId: id })
        },
        enabled: !!id && !isOwnProfile,
        staleTime: 5 * 60 * 1000 // Cache for 5 minutes
    })

    // For own profile, use current user's Clerk data; for others, use fetched Clerk info
    const displayName = isOwnProfile
        ? currentUser?.fullName || currentUser?.firstName || 'User'
        : clerkInfo?.fullName || clerkInfo?.firstName || id.slice(0, 8) + '...'
    const avatarUrl = isOwnProfile ? currentUser?.imageUrl || null : clerkInfo?.imageUrl || null
    const fallback = isOwnProfile
        ? currentUser?.firstName?.[0] || currentUser?.fullName?.[0] || 'U'
        : clerkInfo?.firstName?.[0]?.toUpperCase() ||
          clerkInfo?.fullName?.[0]?.toUpperCase() ||
          id[0]?.toUpperCase() ||
          'U'

    if (profile === undefined || isLoadingClerkInfo) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                edges={['bottom']}
            >
                <Screen theme={theme} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            edges={['bottom']}
        >
            <Screen theme={theme} />

            <View style={[styles.content, { padding: theme.spacing[5] }]}>
                <Card elevation="sm" padding="lg">
                    <View style={[styles.profileHeader]}>
                        <Avatar size="xl" source={avatarUrl} fallback={fallback} />
                        <View style={[styles.profileInfo, { marginLeft: theme.spacing[4] }]}>
                            <Text
                                variant="default"
                                size="2xl"
                                weight="bold"
                                style={{ marginBottom: theme.spacing[1] }}
                            >
                                {displayName}
                            </Text>
                            {profile?.level && (
                                <Text variant="secondary" size="sm">
                                    {profile.level.charAt(0).toUpperCase() + profile.level.slice(1)}
                                </Text>
                            )}
                            {!isOwnProfile && (
                                <Text
                                    variant="tertiary"
                                    size="xs"
                                    style={{ marginTop: theme.spacing[1] }}
                                >
                                    {id}
                                </Text>
                            )}
                        </View>
                    </View>

                    <Separator orientation="horizontal" />

                    {profile?.bio && (
                        <Text
                            variant="secondary"
                            size="md"
                            style={{ marginBottom: theme.spacing[4] }}
                        >
                            {profile.bio}
                        </Text>
                    )}

                    <View style={[styles.stats, { gap: theme.spacing[4] }]}>
                        <View style={styles.statItem}>
                            <Text variant="default" size="2xl" weight="bold">
                                {profile?.totalWorkouts || 0}
                            </Text>
                            <Text variant="secondary" size="sm">
                                Workouts
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text variant="default" size="2xl" weight="bold">
                                {profile?.totalWorkoutTime
                                    ? Math.floor(profile.totalWorkoutTime / 60000)
                                    : 0}
                            </Text>
                            <Text variant="secondary" size="sm">
                                Minutes
                            </Text>
                        </View>
                    </View>

                    {isOwnProfile && (
                        <>
                            <Separator
                                orientation="horizontal"
                                style={{ marginVertical: theme.spacing[4] }}
                            />
                            <Button
                                title="Edit Profile"
                                onPress={() => router.push('/profile/edit')}
                                variant="outline"
                                fullWidth
                            />
                        </>
                    )}
                </Card>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        flex: 1
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    profileInfo: {
        flex: 1
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    statItem: {
        alignItems: 'center'
    }
})
