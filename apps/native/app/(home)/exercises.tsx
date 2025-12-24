import { useMemo, useState } from 'react'
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native'
import { BackButton } from '@/components/BackButton'
import { ExerciseCard } from '@/components/ExerciseCard'
import { ExerciseFiltersModal } from '@/components/ExerciseFilters'
import { Badge, useTheme } from '@/ui'
import { applyLocalFilters, searchLocalExercises } from '@/utils/exerciseSearch'
import { useExerciseDatabase } from '@/utils/useExerciseDatabase'
import {
    FlashListWithHeaders,
    Header,
    LargeHeader,
    ScalingView,
    ScrollHeaderProps,
    ScrollLargeHeaderProps
} from '@codeherence/react-native-header'
import { Ionicons } from '@expo/vector-icons'
import { ExerciseFiltersType } from '@packages/backend/convex/schema'
import { useDebounce } from 'use-debounce'

import { Theme } from '@/ui/theme/themes'

const HeaderComponent: React.FC<ScrollHeaderProps & { total: number; theme: Theme }> = ({
    showNavBar,
    total,
    theme
}) => (
    <Header
        showNavBar={showNavBar}
        headerCenter={
            <Text
                style={[
                    styles.title,
                    {
                        color: theme.colors.text,
                        fontSize: theme.fontSizes.xl,
                        fontWeight: theme.fontWeights.bold
                    }
                ]}
                numberOfLines={1}
            >
                All Exercises
            </Text>
        }
        headerRight={
            <Text
                style={[
                    styles.count,
                    {
                        color: theme.colors.textSecondary,
                        fontSize: theme.fontSizes.sm,
                        fontWeight: theme.fontWeights.medium
                    }
                ]}
            >
                {total ? `${total} total` : '0 exercises'}
            </Text>
        }
        headerRightFadesIn
        headerLeft={<BackButton />}
    />
)

const LargeHeaderComponent: React.FC<
    ScrollLargeHeaderProps & {
        total: number
        activeFilterCount: number
        setShowFilters: (show: boolean) => void
        searchQuery: string
        onSearchChange: (query: string) => void
        theme: Theme
    }
> = ({ scrollY, total, activeFilterCount, setShowFilters, searchQuery, onSearchChange, theme }) => {
    return (
        <LargeHeader>
            <ScalingView scrollY={scrollY}>
                <View style={styles.headerTop}>
                    <Text
                        style={[
                            styles.title,
                            {
                                color: theme.colors.text,
                                fontSize: theme.fontSizes.xl,
                                fontWeight: theme.fontWeights.bold
                            }
                        ]}
                    >
                        All Exercises
                    </Text>
                    <Text
                        style={[
                            styles.count,
                            {
                                color: theme.colors.textSecondary,
                                fontSize: theme.fontSizes.sm,
                                fontWeight: theme.fontWeights.medium
                            }
                        ]}
                    >
                        {total ? `${total} total` : '0 exercises'}
                    </Text>
                </View>
                <View style={[styles.searchRow, { gap: theme.spacing[3], marginTop: theme.spacing[3] }]}>
                    <View
                        style={[
                            styles.searchContainer,
                            {
                                backgroundColor: theme.colors.surfaceSecondary,
                                borderRadius: theme.borderRadius.lg,
                                paddingHorizontal: theme.spacing[3],
                                paddingVertical: theme.spacing[2.5],
                                gap: theme.spacing[2]
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
                            onChangeText={onSearchChange}
                            placeholderTextColor={theme.colors.textMuted}
                            autoCorrect={false}
                            autoCapitalize="none"
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <Pressable
                                onPress={() => onSearchChange('')}
                                style={{ padding: theme.spacing[1] }}
                            >
                                <Ionicons name="close-circle" size={18} color={theme.colors.textTertiary} />
                            </Pressable>
                        )}
                    </View>
                    <Pressable
                        style={[
                            styles.filterButton,
                            {
                                padding: theme.spacing[2.5],
                                borderRadius: theme.borderRadius.md,
                                backgroundColor: theme.colors.surfaceSecondary
                            }
                        ]}
                        onPress={() => setShowFilters(true)}
                    >
                        <Ionicons name="filter" size={20} color={theme.colors.primary} />
                        {activeFilterCount > 0 && (
                            <View
                                style={[
                                    styles.filterBadge,
                                    {
                                        backgroundColor: theme.colors.primary,
                                        borderRadius: 10
                                    }
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.filterBadgeText,
                                        {
                                            color: theme.colors.primaryForeground,
                                            fontSize: theme.fontSizes.xs,
                                            fontWeight: theme.fontWeights.semibold
                                        }
                                    ]}
                                >
                                    {activeFilterCount}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                </View>
            </ScalingView>
        </LargeHeader>
    )
}

export default function ExercisesPage() {
    const { theme } = useTheme()
    const [filters, setFilters] = useState<ExerciseFiltersType>({})
    const [showFilters, setShowFilters] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Debounce search query with use-debounce
    const [debouncedSearchQuery] = useDebounce(searchQuery, 500)

    // Use local exercise database with auto-sync
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

    // Show loading state during initial sync
    if (!isInitialized || (isSyncing && allExercises.length === 0)) {
        return (
            <View
                style={[
                    styles.container,
                    styles.centerContent,
                    { backgroundColor: theme.colors.background }
                ]}
            >
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text
                    style={[
                        styles.loadingText,
                        {
                            color: theme.colors.textTertiary,
                            fontSize: theme.fontSizes.sm
                        }
                    ]}
                >
                    {isSyncing ? 'Syncing exercise database...' : 'Loading exercises...'}
                </Text>
            </View>
        )
    }

    // Show error state
    if (error) {
        console.error('Exercise Database Error:', error)

        return (
            <View
                style={[
                    styles.container,
                    styles.centerContent,
                    { backgroundColor: theme.colors.background }
                ]}
            >
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
                    Please check your internet connection and try again.
                </Text>
            </View>
        )
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <ExerciseFiltersModal
                visible={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                onApplyFilters={handleApplyFilters}
            />

            <FlashListWithHeaders
                data={filteredAndSearchedExercises}
                renderItem={({ item }) => <ExerciseCard exercise={item} />}
                keyExtractor={(item) => item.externalId}
                contentContainerStyle={[
                    styles.listContent,
                    {
                        paddingHorizontal: theme.spacing[5],
                        paddingVertical: theme.spacing[4]
                    }
                ]}
                HeaderComponent={(props) => (
                    <HeaderComponent
                        showNavBar={props.showNavBar}
                        scrollY={props.scrollY}
                        total={allExercises.length}
                        theme={theme}
                    />
                )}
                LargeHeaderComponent={(props) => (
                    <LargeHeaderComponent
                        scrollY={props.scrollY}
                        showNavBar={props.showNavBar}
                        total={allExercises.length}
                        activeFilterCount={activeFilterCount}
                        setShowFilters={setShowFilters}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        theme={theme}
                    />
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerTop: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    filterButton: {
        position: 'relative'
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4
    },
    filterBadgeText: {},
    title: {},
    count: {},
    listContent: {},
    loadingText: {},
    searchInput: {
        flex: 1,
        padding: 0
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    errorText: {
        textAlign: 'center'
    },
    errorSubtext: {
        textAlign: 'center'
    }
})
