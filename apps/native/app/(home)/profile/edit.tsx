import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack } from 'expo-router'
import { BackButton } from '@/components/BackButton'
import { Avatar, Button, Card, Input, Text, Theme, useTheme } from '@/ui'
import { api } from '@/utils/convex'
import { useUser } from '@clerk/clerk-expo'
import { useMutation, useQuery } from 'convex/react'

const Screen = ({ theme }: { theme: Theme }) => (
    <Stack.Screen
        options={{
            title: 'Edit Profile',
            headerShown: true,
            headerLeft: () => <BackButton />,
            headerStyle: {
                backgroundColor: theme.colors.surface
            },
            headerTintColor: theme.colors.text
        }}
    />
)

export default function EditProfilePage() {
    const { user } = useUser()
    const { theme } = useTheme()
    const userId = user?.id || ''

    const profile = useQuery(api.userProfiles.getByUserId, { userId })
    const updateProfile = useMutation(api.userProfiles.update)

    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        bio: '',
        level: null as 'beginner' | 'intermediate' | 'expert' | null,
        units: 'metric' as 'metric' | 'imperial',
        preferredWorkoutTime: null as 'morning' | 'afternoon' | 'evening' | 'anytime' | null
    })

    const isLoading = profile === undefined

    // Initialize form data when profile loads
    useEffect(() => {
        if (profile) {
            setFormData({
                bio: profile.bio || '',
                level: profile.level,
                units: profile.units,
                preferredWorkoutTime: profile.preferredWorkoutTime
            })
        }
    }, [profile])

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await updateProfile({
                bio: formData.bio.trim() || undefined,
                level: formData.level,
                units: formData.units,
                preferredWorkoutTime: formData.preferredWorkoutTime
            })
            Alert.alert('Success', 'Profile updated successfully', [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ])
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile')
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <Screen theme={theme} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Screen theme={theme} />

            <View style={[styles.content, { padding: theme.spacing[5] }]}>
                <Card elevation="sm" padding="lg" style={styles.profileCard}>
                    <View style={[styles.profileHeader, { marginBottom: theme.spacing[4] }]}>
                        <Avatar
                            size="xl"
                            source={user?.imageUrl || null}
                            fallback={user?.firstName?.[0] || 'U'}
                        />
                        <View style={[styles.profileInfo, { marginLeft: theme.spacing[4] }]}>
                            <Text variant="default" size="2xl" weight="bold" style={{ marginBottom: theme.spacing[1] }}>
                                {user?.fullName || user?.firstName || 'User'}
                            </Text>
                            <Text variant="secondary" size="sm">
                                {user?.primaryEmailAddress?.emailAddress}
                            </Text>
                        </View>
                    </View>

                    <Input
                        placeholder="Bio"
                        value={formData.bio}
                        onChangeText={(text) => setFormData({ ...formData, bio: text })}
                        multiline
                        numberOfLines={4}
                        style={{
                            marginBottom: theme.spacing[4],
                            minHeight: 100,
                            textAlignVertical: 'top'
                        }}
                    />

                    <View style={{ marginBottom: theme.spacing[4] }}>
                        <Text
                            variant="secondary"
                            size="sm"
                            style={{ marginBottom: theme.spacing[2] }}
                        >
                            Level
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                gap: theme.spacing[2]
                            }}
                        >
                            {(['beginner', 'intermediate', 'expert'] as const).map((level) => (
                                <Button
                                    key={level}
                                    title={level.charAt(0).toUpperCase() + level.slice(1)}
                                    onPress={() =>
                                        setFormData({
                                            ...formData,
                                            level: formData.level === level ? null : level
                                        })
                                    }
                                    variant={formData.level === level ? 'primary' : 'outline'}
                                    size="sm"
                                />
                            ))}
                        </View>
                    </View>

                    <View style={{ marginBottom: theme.spacing[4] }}>
                        <Text variant="secondary" size="sm" style={{ marginBottom: theme.spacing[2] }}>
                            Units
                        </Text>
                        <View style={{ flexDirection: 'row', gap: theme.spacing[2] }}>
                            <Button
                                title="Metric (kg)"
                                onPress={() => setFormData({ ...formData, units: 'metric' })}
                                variant={formData.units === 'metric' ? 'primary' : 'outline'}
                                fullWidth
                            />
                            <Button
                                title="Imperial (lbs)"
                                onPress={() => setFormData({ ...formData, units: 'imperial' })}
                                variant={formData.units === 'imperial' ? 'primary' : 'outline'}
                                fullWidth
                            />
                        </View>
                    </View>

                    <View style={{ marginBottom: theme.spacing[4] }}>
                        <Text variant="secondary" size="sm" style={{ marginBottom: theme.spacing[2] }}>
                            Preferred Workout Time
                        </Text>
                        <View style={{ gap: theme.spacing[2] }}>
                            {(['morning', 'afternoon', 'evening', 'anytime'] as const).map((time) => (
                                <Button
                                    key={time}
                                    title={time.charAt(0).toUpperCase() + time.slice(1)}
                                    onPress={() =>
                                        setFormData({
                                            ...formData,
                                            preferredWorkoutTime:
                                                formData.preferredWorkoutTime === time ? null : time
                                        })
                                    }
                                    variant={formData.preferredWorkoutTime === time ? 'primary' : 'outline'}
                                    fullWidth
                                />
                            ))}
                        </View>
                    </View>

                    <View
                        style={{
                            flexDirection: 'column',
                            gap: theme.spacing[2]
                        }}
                    >
                        <Button
                            title="Cancel"
                            onPress={() => router.back()}
                            variant="outline"
                            fullWidth
                            disabled={isSaving}
                        />
                        <Button
                            title={isSaving ? 'Saving...' : 'Save'}
                            onPress={handleSave}
                            variant="primary"
                            fullWidth
                            disabled={isSaving}
                        />
                    </View>
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
    profileCard: {
        marginBottom: 16
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    profileInfo: {
        flex: 1
    }
})

