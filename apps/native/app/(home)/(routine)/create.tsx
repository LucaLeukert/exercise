import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useRoutineStore } from '@/store/store'
import { useCreateRoutine } from '@/utils/convex'
import { useExerciseDatabase } from '@/utils/useExerciseDatabase'

export default function CreateRoutinePage() {
    const {
        name,
        description,
        exercises,
        setName,
        setDescription,
        removeExercise,
        updateExercise,
        reset
    } = useRoutineStore()

    const createRoutineMutation = useCreateRoutine()

    // Use local exercise database
    const { exercises: allExercises, isInitialized, isSyncing, error } = useExerciseDatabase()

    const handleCreateRoutine = async () => {
        if (!name.trim() || exercises.length === 0) {
            alert('Please enter a routine name and add at least one exercise')
            return
        }

        try {
            await createRoutineMutation({
                name,
                description: description || undefined,
                exercises
            })
            alert('Routine created successfully!')
            reset()
            router.back()
        } catch (error) {
            alert('Failed to create routine')
            console.error(error)
        }
    }

    const handleUpdateExercise = (exerciseId: string, field: 'sets' | 'reps', value: string) => {
        const numValue = parseInt(value) || 0
        updateExercise(exerciseId, { [field]: numValue })
    }

    if (!isInitialized || (isSyncing && allExercises.length === 0)) {
        return (
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>
                        {isSyncing ? 'Syncing exercises...' : 'Loading exercises...'}
                    </Text>
                </View>
            </SafeAreaView>
        )
    }

    if (error) {
        console.error('Exercise Database Error:', error)
        
        return (
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Text style={styles.errorSubtext}>
                        Please check your connection and try again.
                    </Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Routine Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Routine Information</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Routine Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter routine name"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor="#999"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter routine description (optional)"
                            value={description}
                            onChangeText={setDescription}
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                </View>

                {/* Exercises Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Exercises</Text>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => router.push('/select-exercise')}
                        >
                            <Text style={styles.addButtonText}>+ Add Exercise</Text>
                        </TouchableOpacity>
                    </View>

                    {exercises.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No exercises added yet</Text>
                            <Text style={styles.emptyStateSubtext}>
                                Tap Add Exercise to get started
                            </Text>
                        </View>
                    ) : (
                        exercises.map((exercise, index) => {
                            const exerciseData = allExercises.find(
                                (e) => e.externalId === exercise.exerciseId
                            )
                            return (
                                <View key={exercise.exerciseId} style={styles.exerciseCard}>
                                    <View style={styles.exerciseCardHeader}>
                                        <View style={styles.exerciseNumber}>
                                            <Text style={styles.exerciseNumberText}>
                                                {index + 1}
                                            </Text>
                                        </View>
                                        <Text style={styles.exerciseName}>
                                            {exerciseData?.name}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => removeExercise(exercise.exerciseId)}
                                            style={styles.removeButton}
                                        >
                                            <Text style={styles.removeButtonText}>✕</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.exerciseInputs}>
                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>Sets</Text>
                                            <TextInput
                                                style={styles.numberInput}
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
                                            />
                                        </View>

                                        <View style={styles.inputGroup}>
                                            <Text style={styles.inputLabel}>Reps</Text>
                                            <TextInput
                                                style={styles.numberInput}
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
                                            />
                                        </View>
                                    </View>
                                </View>
                            )
                        })
                    )}
                </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionSection}>
                <TouchableOpacity
                    style={[
                        styles.createButton,
                        (exercises.length === 0 || !name.trim()) &&
                            styles.createButtonDisabled
                    ]}
                    onPress={handleCreateRoutine}
                    disabled={exercises.length === 0 || !name.trim()}
                >
                    <Text style={styles.createButtonText}>Create Routine</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9'
    },
    scrollView: {
        flex: 1
    },
    content: {
        paddingBottom: 40
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16
    },
    inputContainer: {
        marginBottom: 16
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#000',
        backgroundColor: '#f5f5f5'
    },
    textArea: {
        textAlignVertical: 'top',
        minHeight: 80
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8
    },
    addButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600'
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#999',
        marginBottom: 8
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#bbb'
    },
    exerciseCard: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12
    },
    exerciseCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },
    exerciseNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12
    },
    exerciseNumberText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700'
    },
    exerciseName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#000'
    },
    removeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ff6b6b',
        alignItems: 'center',
        justifyContent: 'center'
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600'
    },
    exerciseInputs: {
        flexDirection: 'row',
        gap: 12
    },
    inputGroup: {
        flex: 1
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginBottom: 6
    },
    numberInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        padding: 10,
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        backgroundColor: '#fff',
        textAlign: 'center'
    },
    actionSection: {
        marginHorizontal: 16,
        marginTop: 24
    },
    createButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12
    },
    createButtonDisabled: {
        backgroundColor: '#ccc',
        opacity: 0.6
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700'
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        gap: 12
    },
    loadingText: {
        fontSize: 16,
        color: '#666'
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ff3b30',
        textAlign: 'center',
        marginBottom: 8
    },
    errorSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center'
    }
})
