import { useState } from 'react'
import { Alert, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Stack } from 'expo-router'
import { Button, Card, Input, Text, useTheme } from '@/ui'
import { api } from '@/utils/convex'
import { useUser } from '@clerk/clerk-expo'
import { useMutation } from 'convex/react'

export default function OnboardingPage() {
    const { user } = useUser()
    const { theme } = useTheme()
    const createOnboarding = useMutation(api.userProfiles.createOnboarding)

    const [step, setStep] = useState(1)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        bio: '',
        level: null as 'beginner' | 'intermediate' | 'expert' | null,
        units: 'metric' as 'metric' | 'imperial',
        preferredWorkoutTime: null as 'morning' | 'afternoon' | 'evening' | 'anytime' | null
    })

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1)
        } else {
            handleComplete()
        }
    }

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1)
        }
    }

    const handleComplete = async () => {
        console.log('formData', formData)
        setIsSaving(true)
        try {
            await createOnboarding({
                bio: formData.bio.trim() || undefined,
                level: formData.level,
                units: formData.units,
                preferredWorkoutTime: formData.preferredWorkoutTime
            })
            console.log('onboarding created')
            router.replace('/')
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to complete onboarding')
            setIsSaving(false)
        }
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen
                options={{
                    title: 'Welcome!',
                    headerShown: false
                }}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { padding: theme.spacing[5] }]}
            >
                <View style={styles.header}>
                    <Text
                        variant="default"
                        size="3xl"
                        weight="bold"
                        style={{ marginBottom: theme.spacing[2] }}
                    >
                        Welcome, {user?.firstName || 'there'}!
                    </Text>
                    <Text variant="secondary" size="md">
                        {"Let's setup your profile to get started"}
                    </Text>
                </View>

                <Card elevation="sm" padding="lg" style={styles.card}>
                    {step === 1 && (
                        <View style={styles.stepContent}>
                            <Text
                                variant="default"
                                size="xl"
                                weight="bold"
                                style={{ marginBottom: theme.spacing[4] }}
                            >
                                Fitness Level
                            </Text>
                            <Text
                                variant="secondary"
                                size="sm"
                                style={{ marginBottom: theme.spacing[4] }}
                            >
                                Select your current fitness level
                            </Text>
                            <View style={{ gap: theme.spacing[3] }}>
                                {(['beginner', 'intermediate', 'expert'] as const).map((level) => (
                                    <Button
                                        key={level}
                                        title={level.charAt(0).toUpperCase() + level.slice(1)}
                                        onPress={() => setFormData({ ...formData, level })}
                                        variant={formData.level === level ? 'primary' : 'outline'}
                                        fullWidth
                                    />
                                ))}
                            </View>
                        </View>
                    )}

                    {step === 2 && (
                        <View style={styles.stepContent}>
                            <Text
                                variant="default"
                                size="xl"
                                weight="bold"
                                style={{ marginBottom: theme.spacing[4] }}
                            >
                                Preferences
                            </Text>
                            <View style={{ gap: theme.spacing[4] }}>
                                <View>
                                    <Text
                                        variant="secondary"
                                        size="sm"
                                        style={{ marginBottom: theme.spacing[2] }}
                                    >
                                        Units
                                    </Text>
                                    <View
                                        style={{ flexDirection: 'column', gap: theme.spacing[2] }}
                                    >
                                        <Button
                                            title="Metric (kg)"
                                            onPress={() =>
                                                setFormData({ ...formData, units: 'metric' })
                                            }
                                            variant={
                                                formData.units === 'metric' ? 'primary' : 'outline'
                                            }
                                            fullWidth
                                        />
                                        <Button
                                            title="Imperial (lbs)"
                                            onPress={() =>
                                                setFormData({ ...formData, units: 'imperial' })
                                            }
                                            variant={
                                                formData.units === 'imperial'
                                                    ? 'primary'
                                                    : 'outline'
                                            }
                                            fullWidth
                                        />
                                    </View>
                                </View>
                                <View>
                                    <Text
                                        variant="secondary"
                                        size="sm"
                                        style={{ marginBottom: theme.spacing[2] }}
                                    >
                                        Preferred Workout Time
                                    </Text>
                                    <View style={{ gap: theme.spacing[2] }}>
                                        {(
                                            ['morning', 'afternoon', 'evening', 'anytime'] as const
                                        ).map((time) => (
                                            <Button
                                                key={time}
                                                title={time.charAt(0).toUpperCase() + time.slice(1)}
                                                onPress={() =>
                                                    setFormData({
                                                        ...formData,
                                                        preferredWorkoutTime:
                                                            formData.preferredWorkoutTime === time
                                                                ? null
                                                                : time
                                                    })
                                                }
                                                variant={
                                                    formData.preferredWorkoutTime === time
                                                        ? 'primary'
                                                        : 'outline'
                                                }
                                                fullWidth
                                            />
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {step === 3 && (
                        <View style={styles.stepContent}>
                            <Text
                                variant="default"
                                size="xl"
                                weight="bold"
                                style={{ marginBottom: theme.spacing[4] }}
                            >
                                Tell us about yourself
                            </Text>
                            <Text
                                variant="secondary"
                                size="sm"
                                style={{ marginBottom: theme.spacing[4] }}
                            >
                                Add a bio to your profile (optional)
                            </Text>
                            <Input
                                placeholder="Bio"
                                value={formData.bio}
                                onChangeText={(text) => setFormData({ ...formData, bio: text })}
                                multiline
                                numberOfLines={4}
                                style={{
                                    minHeight: 100,
                                    textAlignVertical: 'top'
                                }}
                            />
                        </View>
                    )}

                    <View
                        style={[
                            styles.footer,
                            { marginTop: theme.spacing[6], gap: theme.spacing[3] }
                        ]}
                    >
                        {step > 1 && (
                            <Button
                                title="Back"
                                onPress={handleBack}
                                variant="outline"
                                fullWidth
                                disabled={isSaving}
                            />
                        )}
                        <Button
                            title={step === 3 ? (isSaving ? 'Completing...' : 'Complete') : 'Next'}
                            onPress={handleNext}
                            variant="primary"
                            fullWidth
                            disabled={isSaving || (step === 1 && !formData.level)}
                        />
                    </View>
                </Card>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollView: {
        flex: 1
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center'
    },
    header: {
        marginBottom: 32,
        alignItems: 'center'
    },
    card: {
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center'
    },
    stepContent: {
        minHeight: 200
    },
    footer: {
        flexDirection: 'column'
    }
})

