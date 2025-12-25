import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Stack, router } from 'expo-router'
import { BackButton } from '@/components/BackButton'
import { Avatar, Button, Card, Text, useTheme } from '@/ui'
import { api } from '@/utils/convex'
import { useUser } from '@clerk/clerk-expo'
import { useQuery, useMutation } from 'convex/react'
import { Ionicons } from '@expo/vector-icons'

export default function ProfilePage() {
    const { user } = useUser()
    const { theme } = useTheme()
    const userId = user?.id || ''

    const profile = useQuery(api.userProfiles.getByUserId, { userId })
    const updateProfile = useMutation(api.userProfiles.update)

    const isLoading = profile === undefined

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <View style={[styles.content, { padding: theme.spacing[5] }]}>
                    <Card elevation="sm" padding="lg" style={styles.profileCard}>
                        <View style={[styles.profileHeader, { marginBottom: theme.spacing[4] }]}>
                            <Avatar
                                size="xl"
                                source={profile?.profileImageUrl || user?.imageUrl || null}
                                fallback={user?.firstName?.[0] || 'U'}
                            />
                            <View style={[styles.profileInfo, { marginLeft: theme.spacing[4] }]}>
                                <Text
                                    variant="default"
                                    size="2xl"
                                    weight="bold"
                                    style={{ marginBottom: theme.spacing[1] }}
                                >
                                    {profile?.username || user?.firstName || 'User'}
                                </Text>
                                {profile?.level && (
                                    <Text variant="secondary" size="sm">
                                        {profile.level.charAt(0).toUpperCase() + profile.level.slice(1)}
                                    </Text>
                                )}
                            </View>
                        </View>

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
                    </Card>

                    <Button
                        title="Edit Profile"
                        onPress={() => {
                            // TODO: Navigate to edit profile page
                        }}
                        variant="outline"
                        fullWidth
                        style={{ marginTop: theme.spacing[4] }}
                    />
                </View>
            )}
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
    profileCard: {
        marginBottom: 16
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
        justifyContent: 'space-around',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)'
    },
    statItem: {
        alignItems: 'center'
    }
})

