import type { ExerciseFilters } from '@/components/ExerciseFilters'
import { useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ExerciseFiltersModal } from '@/components/ExerciseFilters'
import { useRoutineStore } from '@/store/store'
import { applyLocalFilters } from '@/utils/exerciseSearch'
import { useExerciseDatabase } from '@/utils/useExerciseDatabase'
import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'

export default function SelectExercisePage() {
    const { exercises: selectedExercises, addExercise } = useRoutineStore()
    const [filters, setFilters] = useState<ExerciseFilters>({})
    const [showFilters, setShowFilters] = useState(false)

    // Local exercise database
    const { exercises: allExercises, isInitialized, isSyncing, error } = useExerciseDatabase()

    // Apply filters locally
    const filteredExercises = useMemo(
        () => applyLocalFilters(allExercises, filters),
        [allExercises, filters]
    )

    const selectedIds = useMemo(
        () => new Set(selectedExercises.map((e) => e.exerciseId)),
        [selectedExercises]
    )

    const handleSelectExercise = (exerciseId: string) => {
        addExercise({
            exerciseId,
            sets: 3,
            reps: 10,
            notes: ''
        })
        router.back()
    }

    const handleApplyFilters = (newFilters: ExerciseFilters) => {
        setFilters(newFilters)
    }

    const activeFilterCount =
        (filters.primaryMuscles?.length ?? 0) +
        (filters.secondaryMuscles?.length ?? 0) +
        (filters.level ? 1 : 0) +
        (filters.category ? 1 : 0) +
        (filters.equipment ? 1 : 0) +
        (filters.mechanic ? 1 : 0)

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
            <View style={styles.filterBar}>
                <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
                    <Ionicons name="filter" size={20} color="#007AFF" />
                    <Text style={styles.filterButtonText}>
                        Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </Text>
                </TouchableOpacity>
            </View>

            <ExerciseFiltersModal
                visible={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                onApplyFilters={handleApplyFilters}
            />

            <FlashList
                data={filteredExercises}
                renderItem={({ item }) => {
                    const isSelected = selectedIds.has(item.id)
                    return (
                        <TouchableOpacity
                            style={[styles.exerciseItem, isSelected && styles.exerciseItemSelected]}
                            onPress={() => handleSelectExercise(item.id)}
                            disabled={isSelected}
                        >
                            <View style={styles.exerciseContent}>
                                <View style={styles.exerciseInfo}>
                                    <Text style={styles.exerciseTitle}>{item.name}</Text>
                                    <View style={styles.metaRow}>
                                        <Text style={styles.exerciseCategory}>{item.category}</Text>
                                        <Text style={styles.exerciseLevel}>{item.level}</Text>
                                    </View>
                                </View>
                                {isSelected && (
                                    <View style={styles.selectedBadge}>
                                        <Text style={styles.selectedBadgeText}>Added</Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    style={styles.infoButton}
                                    onPress={() => {
                                        router.push(`/(home)/exercise/${item.id}`)
                                    }}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="chevron-forward" size={20} color="#007AFF" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    )
                }}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9'
    },
    filterBar: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        alignSelf: 'flex-start'
    },
    filterButtonText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500'
    },
    listContent: {
        paddingHorizontal: 16,
        paddingVertical: 8
    },
    exerciseItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    exerciseItemSelected: {
        backgroundColor: '#f0f0f0',
        opacity: 0.6
    },
    exerciseContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    infoButton: {
        marginRight: 12,
        padding: 4
    },
    exerciseInfo: {
        flex: 1
    },
    exerciseTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 6
    },
    metaRow: {
        flexDirection: 'row',
        gap: 12
    },
    exerciseCategory: {
        fontSize: 13,
        color: '#666',
        textTransform: 'capitalize'
    },
    exerciseLevel: {
        fontSize: 13,
        color: '#007AFF',
        textTransform: 'capitalize',
        fontWeight: '500'
    },
    selectedBadge: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12
    },
    selectedBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600'
    },
    loadingFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20
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
