import { useMemo, useState } from 'react'
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { ExerciseFiltersModal } from '@/components/ExerciseFilters'
import { useRoutineStore } from '@/store/store'
import { Badge, Card, useTheme } from '@/ui'
import { applyLocalFilters, searchLocalExercises } from '@/utils/exerciseSearch'
import { useExerciseDatabase } from '@/utils/useExerciseDatabase'
import { Ionicons } from '@expo/vector-icons'
import { FlashList } from '@shopify/flash-list'
import { useDebounce } from 'use-debounce'

import type { ExerciseFiltersType } from '@packages/backend/convex/schema'

export default function SelectExercisePage() {
    const { theme } = useTheme()
    const { exercises: selectedExercises, addExercise } = useRoutineStore()
    const [filters, setFilters] = useState<ExerciseFiltersType>({})
    const [showFilters, setShowFilters] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const [debouncedSearchQuery] = useDebounce(searchQuery, 500)

    // Local exercise database
    const { exercises: allExercises, isInitialized, isSyncing, error } = useExerciseDatabase()

    // Apply filters and search locally
    const filteredAndSearchedExercises = useMemo(() => {
        // First apply structural filters
        let filtered = applyLocalFilters(allExercises, filters)

        // Then apply search if query exists
        if (debouncedSearchQuery.trim()) {
            filtered = searchLocalExercises(filtered, debouncedSearchQuery, 1000)
        }

        return filtered
    }, [allExercises, filters, debouncedSearchQuery])

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

    const handleApplyFilters = (newFilters: ExerciseFiltersType) => {
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
            <View
                style={[
                    styles.filterBar,
                    {
                        paddingHorizontal: theme.spacing[4],
                        paddingVertical: theme.spacing[3],
                        backgroundColor: theme.colors.surface,
                        borderBottomWidth: 1,
                        borderBottomColor: theme.colors.border
                    }
                ]}
            >
                <Pressable
                    style={[
                        styles.filterButton,
                        {
                            gap: theme.spacing[2],
                            paddingVertical: theme.spacing[2],
                            paddingHorizontal: theme.spacing[4],
                            backgroundColor: theme.colors.surfaceSecondary,
                            borderRadius: theme.borderRadius.full
                        }
                    ]}
                    onPress={() => setShowFilters(true)}
                >
                    <Ionicons name="filter" size={20} color={theme.colors.primary} />
                    <Text
                        style={[
                            styles.filterButtonText,
                            {
                                color: theme.colors.primary,
                                fontSize: theme.fontSizes.sm,
                                fontWeight: theme.fontWeights.medium
                            }
                        ]}
                    >
                        Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </Text>
                </Pressable>
            </View>

            <ExerciseFiltersModal
                visible={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                onApplyFilters={handleApplyFilters}
            />

            <View
                style={[
                    styles.searchContainer,
                    {
                        backgroundColor: theme.colors.surfaceSecondary,
                        borderRadius: theme.borderRadius.lg,
                        paddingHorizontal: theme.spacing[3],
                        gap: theme.spacing[2],
                        marginHorizontal: theme.spacing[4],
                        marginVertical: theme.spacing[3]
                    }
                ]}
            >
                <Ionicons
                    name="search"
                    size={18}
                    color={theme.colors.textTertiary}
                    style={{ marginRight: theme.spacing[1] }}
                />
                <TextInput
                    style={[
                        styles.searchInput,
                        {
                            color: theme.colors.text,
                            fontSize: theme.fontSizes.md
                        }
                    ]}
                    placeholder="Search exercises..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={theme.colors.textMuted}
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')} style={{ padding: theme.spacing[1] }}>
                        <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
                    </Pressable>
                )}
            </View>

            <FlashList
                data={filteredAndSearchedExercises}
                renderItem={({ item }) => {
                    const isSelected = selectedIds.has(item.externalId)
                    return (
                        <Pressable
                            onPress={() => handleSelectExercise(item.externalId)}
                            disabled={isSelected}
                        >
                            <Card
                                elevation="sm"
                                padding="md"
                                style={[
                                    styles.exerciseItem,
                                    {
                                        marginBottom: theme.spacing[3],
                                        opacity: isSelected ? 0.6 : 1,
                                        backgroundColor: isSelected
                                            ? theme.colors.surfaceSecondary
                                            : theme.colors.surface
                                    }
                                ]}
                            >
                                <View style={styles.exerciseContent}>
                                    <View style={styles.exerciseInfo}>
                                        <Text
                                            style={[
                                                styles.exerciseTitle,
                                                {
                                                    color: theme.colors.text,
                                                    fontSize: theme.fontSizes.md,
                                                    fontWeight: theme.fontWeights.semibold,
                                                    marginBottom: theme.spacing[1.5]
                                                }
                                            ]}
                                        >
                                            {item.name}
                                        </Text>
                                        <View style={[styles.metaRow, { gap: theme.spacing[3] }]}>
                                            <Text
                                                style={[
                                                    styles.exerciseCategory,
                                                    {
                                                        color: theme.colors.textSecondary,
                                                        fontSize: theme.fontSizes.sm
                                                    }
                                                ]}
                                            >
                                                {item.category}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.exerciseLevel,
                                                    {
                                                        color: theme.colors.primary,
                                                        fontSize: theme.fontSizes.sm,
                                                        fontWeight: theme.fontWeights.medium
                                                    }
                                                ]}
                                            >
                                                {item.level}
                                            </Text>
                                        </View>
                                    </View>
                                    {isSelected && (
                                        <Badge variant="success" size="sm">
                                            Added
                                        </Badge>
                                    )}
                                    <Pressable
                                        style={[
                                            styles.infoButton,
                                            { marginRight: theme.spacing[3], padding: theme.spacing[1] }
                                        ]}
                                        onPress={() => {
                                            router.push(`/exercise/${item.externalId}`)
                                        }}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
                                    </Pressable>
                                </View>
                            </Card>
                        </Pressable>
                    )
                }}
                keyExtractor={(item) => item.externalId}
                contentContainerStyle={[
                    styles.listContent,
                    {
                        paddingHorizontal: theme.spacing[4],
                        paddingVertical: theme.spacing[2]
                    }
                ]}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    searchContainer: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center'
    },
    container: {
        flex: 1
    },
    filterBar: {},
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start'
    },
    filterButtonText: {},
    listContent: {},
    exerciseItem: {},
    exerciseContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    infoButton: {},
    exerciseInfo: {
        flex: 1
    },
    exerciseTitle: {},
    metaRow: {
        flexDirection: 'row'
    },
    exerciseCategory: {
        textTransform: 'capitalize'
    },
    exerciseLevel: {
        textTransform: 'capitalize'
    },
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
    },
    searchInput: {
        flex: 1,
        padding: 0
    }
})
