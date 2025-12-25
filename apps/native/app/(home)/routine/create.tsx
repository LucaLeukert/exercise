import { useState } from 'react'
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { VisibilitySelector } from '@/components/VisibilitySelector'
import { useRoutineStore } from '@/store/store'
import { Button, Card, Input, useTheme } from '@/ui'
import { api } from '@/utils/convex'
import { wrapConvexMutation } from '@/utils/result'
import { useExerciseDatabase } from '@/utils/useExerciseDatabase'
import { useMutation } from 'convex/react'

export default function CreateRoutinePage() {
    const { theme } = useTheme()
    const {
        name,
        description,
        exercises,
        visibility,
        setName,
        setDescription,
        setVisibility,
        removeExercise,
        updateExercise,
        reset
    } = useRoutineStore()

    const createRoutineMutation = useMutation(api.routines.create)
    const [isCreating, setIsCreating] = useState(false)

    // Use local exercise database
    const { exercises: allExercises, isInitialized, isSyncing, error } = useExerciseDatabase()

    const handleCreateRoutine = async () => {
        if (!name.trim() || exercises.length === 0) {
            alert('Please enter a routine name and add at least one exercise')
            return
        }

        if (isCreating) {
            return
        }

        setIsCreating(true)

        const result = await wrapConvexMutation(
            createRoutineMutation,
            {
                name,
                description: description || undefined,
                exercises,
                visibility
            },
            (error) => ({
                type: 'mutation_error' as const,
                message: 'Failed to create routine',
                originalError: error
            })
        )

        result.match(
            () => {
                alert('Routine created successfully!')
                reset()
                router.back()
            },
            (error) => {
                alert('Failed to create routine')
                console.error(error)
                setIsCreating(false)
            }
        )
    }

    const handleUpdateExercise = (exerciseId: string, field: 'sets' | 'reps', value: string) => {
        const numValue = parseInt(value) || 0
        updateExercise(exerciseId, { [field]: numValue })
    }

    if (!isInitialized || (isSyncing && allExercises.length === 0)) {
        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                edges={['bottom']}
            >
                <View style={[styles.loadingContainer, { gap: theme.spacing[3] }]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text
                        style={[
                            styles.loadingText,
                            {
                                color: theme.colors.textSecondary,
                                fontSize: theme.fontSizes.md
                            }
                        ]}
                    >
                        {isSyncing ? 'Syncing exercises...' : 'Loading exercises...'}
                    </Text>
                </View>
            </SafeAreaView>
        )
    }

    if (error) {
        console.error('Exercise Database Error:', error)

        return (
            <SafeAreaView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                edges={['bottom']}
            >
                <View style={styles.loadingContainer}>
                    <Text
                        style={[
                            styles.errorText,
                            {
                                color: theme.colors.error,
                                fontSize: theme.fontSizes.xl,
                                fontWeight: theme.fontWeights.semibold,
                                marginBottom: theme.spacing[2]
                            }
                        ]}
                    >
                        {error}
                    </Text>
                    <Text
                        style={[
                            styles.errorSubtext,
                            {
                                color: theme.colors.textSecondary,
                                fontSize: theme.fontSizes.sm
                            }
                        ]}
                    >
                        Please check your connection and try again.
                    </Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            edges={['bottom']}
        >
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.content, { paddingBottom: theme.spacing[10] }]}
            >
                {/* Routine Info Section */}
                <Card
                    elevation="sm"
                    padding="md"
                    style={{
                        marginHorizontal: theme.spacing[4],
                        marginTop: theme.spacing[4]
                    }}
                >
                    <Text
                        style={[
                            styles.sectionTitle,
                            {
                                color: theme.colors.text,
                                fontSize: theme.fontSizes.xl,
                                fontWeight: theme.fontWeights.bold,
                                marginBottom: theme.spacing[4]
                            }
                        ]}
                    >
                        Routine Information
                    </Text>

                    <View style={[styles.inputContainer, { marginBottom: theme.spacing[4] }]}>
                        <Text
                            style={[
                                styles.label,
                                {
                                    color: theme.colors.text,
                                    fontSize: theme.fontSizes.sm,
                                    fontWeight: theme.fontWeights.semibold,
                                    marginBottom: theme.spacing[2]
                                }
                            ]}
                        >
                            Routine Name *
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    borderWidth: 1,
                                    borderColor: theme.colors.border,
                                    borderRadius: theme.borderRadius.md,
                                    padding: theme.spacing[3],
                                    fontSize: theme.fontSizes.sm,
                                    color: theme.colors.text,
                                    backgroundColor: theme.colors.surfaceSecondary
                                }
                            ]}
                            placeholder="Enter routine name"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor={theme.colors.textMuted}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text
                            style={[
                                styles.label,
                                {
                                    color: theme.colors.text,
                                    fontSize: theme.fontSizes.sm,
                                    fontWeight: theme.fontWeights.semibold,
                                    marginBottom: theme.spacing[2]
                                }
                            ]}
                        >
                            Description
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                styles.textArea,
                                {
                                    borderWidth: 1,
                                    borderColor: theme.colors.border,
                                    borderRadius: theme.borderRadius.md,
                                    padding: theme.spacing[3],
                                    fontSize: theme.fontSizes.sm,
                                    color: theme.colors.text,
                                    backgroundColor: theme.colors.surfaceSecondary
                                }
                            ]}
                            placeholder="Enter routine description (optional)"
                            value={description}
                            onChangeText={setDescription}
                            placeholderTextColor={theme.colors.textMuted}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    <VisibilitySelector value={visibility} onChange={setVisibility} />
                </Card>

                {/* Exercises Section */}
                <Card
                    elevation="sm"
                    padding="md"
                    style={{
                        marginHorizontal: theme.spacing[4],
                        marginTop: theme.spacing[4]
                    }}
                >
                    <View style={[styles.sectionHeader, { marginBottom: theme.spacing[4] }]}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: theme.colors.text,
                                    fontSize: theme.fontSizes.xl,
                                    fontWeight: theme.fontWeights.bold,
                                    marginBottom: 0
                                }
                            ]}
                        >
                            Exercises
                        </Text>
                        <Button
                            title="+ Add Exercise"
                            onPress={() => router.push('/routine/select-exercise')}
                            size="sm"
                        />
                    </View>

                    {exercises.length === 0 ? (
                        <View style={[styles.emptyState, { paddingVertical: theme.spacing[10] }]}>
                            <Text
                                style={[
                                    styles.emptyStateText,
                                    {
                                        color: theme.colors.textTertiary,
                                        fontSize: theme.fontSizes.md,
                                        fontWeight: theme.fontWeights.semibold,
                                        marginBottom: theme.spacing[2]
                                    }
                                ]}
                            >
                                No exercises added yet
                            </Text>
                            <Text
                                style={[
                                    styles.emptyStateSubtext,
                                    {
                                        color: theme.colors.textMuted,
                                        fontSize: theme.fontSizes.sm
                                    }
                                ]}
                            >
                                Tap Add Exercise to get started
                            </Text>
                        </View>
                    ) : (
                        exercises.map((exercise, index) => {
                            const exerciseData = allExercises.find(
                                (e) => e.externalId === exercise.exerciseId
                            )
                            return (
                                <View
                                    key={exercise.exerciseId}
                                    style={[
                                        styles.exerciseCard,
                                        {
                                            borderWidth: 1,
                                            borderColor: theme.colors.border,
                                            borderRadius: theme.borderRadius.md,
                                            padding: theme.spacing[3],
                                            marginBottom: theme.spacing[3]
                                        }
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.exerciseCardHeader,
                                            { marginBottom: theme.spacing[3] }
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.exerciseNumber,
                                                {
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: 14,
                                                    backgroundColor: theme.colors.primary,
                                                    marginRight: theme.spacing[3]
                                                }
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.exerciseNumberText,
                                                    {
                                                        color: theme.colors.primaryForeground,
                                                        fontSize: theme.fontSizes.sm,
                                                        fontWeight: theme.fontWeights.bold
                                                    }
                                                ]}
                                            >
                                                {index + 1}
                                            </Text>
                                        </View>
                                        <Text
                                            style={[
                                                styles.exerciseName,
                                                {
                                                    color: theme.colors.text,
                                                    fontSize: theme.fontSizes.md,
                                                    fontWeight: theme.fontWeights.semibold
                                                }
                                            ]}
                                        >
                                            {exerciseData?.name}
                                        </Text>
                                        <Pressable
                                            onPress={() => removeExercise(exercise.exerciseId)}
                                            style={[
                                                styles.removeButton,
                                                {
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 16,
                                                    backgroundColor: theme.colors.error
                                                }
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.removeButtonText,
                                                    {
                                                        color: theme.colors.errorForeground,
                                                        fontSize: theme.fontSizes.xl,
                                                        fontWeight: theme.fontWeights.semibold
                                                    }
                                                ]}
                                            >
                                                ✕
                                            </Text>
                                        </Pressable>
                                    </View>

                                    <View
                                        style={[styles.exerciseInputs, { gap: theme.spacing[3] }]}
                                    >
                                        <View style={styles.inputGroup}>
                                            <Text
                                                style={[
                                                    styles.inputLabel,
                                                    {
                                                        color: theme.colors.textSecondary,
                                                        fontSize: theme.fontSizes.xs,
                                                        fontWeight: theme.fontWeights.semibold,
                                                        marginBottom: theme.spacing[1.5]
                                                    }
                                                ]}
                                            >
                                                Sets
                                            </Text>
                                            <TextInput
                                                style={[
                                                    styles.numberInput,
                                                    {
                                                        borderWidth: 1,
                                                        borderColor: theme.colors.border,
                                                        borderRadius: theme.borderRadius.sm,
                                                        padding: theme.spacing[2.5],
                                                        fontSize: theme.fontSizes.md,
                                                        fontWeight: theme.fontWeights.semibold,
                                                        color: theme.colors.text,
                                                        backgroundColor: theme.colors.surface
                                                    }
                                                ]}
                                                value={String(exercise.sets)}
                                                onChangeText={(val) =>
                                                    handleUpdateExercise(
                                                        exercise.exerciseId,
                                                        'sets',
                                                        val
                                                    )
                                                }
                                                keyboardType="numeric"
                                                placeholder="3"
                                                placeholderTextColor={theme.colors.textMuted}
                                            />
                                        </View>

                                        <View style={styles.inputGroup}>
                                            <Text
                                                style={[
                                                    styles.inputLabel,
                                                    {
                                                        color: theme.colors.textSecondary,
                                                        fontSize: theme.fontSizes.xs,
                                                        fontWeight: theme.fontWeights.semibold,
                                                        marginBottom: theme.spacing[1.5]
                                                    }
                                                ]}
                                            >
                                                Reps
                                            </Text>
                                            <TextInput
                                                style={[
                                                    styles.numberInput,
                                                    {
                                                        borderWidth: 1,
                                                        borderColor: theme.colors.border,
                                                        borderRadius: theme.borderRadius.sm,
                                                        padding: theme.spacing[2.5],
                                                        fontSize: theme.fontSizes.md,
                                                        fontWeight: theme.fontWeights.semibold,
                                                        color: theme.colors.text,
                                                        backgroundColor: theme.colors.surface
                                                    }
                                                ]}
                                                value={String(exercise.reps)}
                                                onChangeText={(val) =>
                                                    handleUpdateExercise(
                                                        exercise.exerciseId,
                                                        'reps',
                                                        val
                                                    )
                                                }
                                                keyboardType="numeric"
                                                placeholder="10"
                                                placeholderTextColor={theme.colors.textMuted}
                                            />
                                        </View>
                                    </View>
                                </View>
                            )
                        })
                    )}
                </Card>
            </ScrollView>

            {/* Action Buttons */}
            <View
                style={[
                    styles.actionSection,
                    {
                        marginHorizontal: theme.spacing[4],
                        marginTop: theme.spacing[6]
                    }
                ]}
            >
                <Button
                    title="Create Routine"
                    onPress={handleCreateRoutine}
                    disabled={exercises.length === 0 || !name.trim() || isCreating}
                    loading={isCreating}
                    fullWidth
                    style={{ marginBottom: theme.spacing[3] }}
                />

                <Button
                    title="Cancel"
                    variant="ghost"
                    onPress={() => router.back()}
                    disabled={isCreating}
                    fullWidth
                />
            </View>
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
    content: {},
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sectionTitle: {},
    inputContainer: {},
    label: {},
    input: {},
    textArea: {
        textAlignVertical: 'top',
        minHeight: 80
    },
    emptyState: {
        alignItems: 'center'
    },
    emptyStateText: {},
    emptyStateSubtext: {},
    exerciseCard: {},
    exerciseCardHeader: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    exerciseNumber: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    exerciseNumberText: {},
    exerciseName: {
        flex: 1
    },
    removeButton: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    removeButtonText: {},
    exerciseInputs: {
        flexDirection: 'row'
    },
    inputGroup: {
        flex: 1
    },
    inputLabel: {},
    numberInput: {
        textAlign: 'center'
    },
    actionSection: {},
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24
    },
    loadingText: {},
    errorText: {
        textAlign: 'center'
    },
    errorSubtext: {
        textAlign: 'center'
    }
})
