import { useMemo, useState } from 'react'
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { BackButton } from '@/components/BackButton'
import { ExerciseCard } from '@/components/ExerciseCard'
import { ExerciseFiltersModal } from '@/components/ExerciseFilters'
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

const HeaderComponent: React.FC<ScrollHeaderProps & { total: number }> = ({
    showNavBar,
    total
}) => (
    <Header
        showNavBar={showNavBar}
        headerCenter={
            <Text style={styles.title} numberOfLines={1}>
                All Exercises
            </Text>
        }
        headerRight={
            <>
                <Text style={styles.count}>{total ? `${total} total` : '0 exercises'}</Text>
            </>
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
    }
> = ({ scrollY, total, activeFilterCount, setShowFilters, searchQuery, onSearchChange }) => {
    return (
        <LargeHeader>
            <ScalingView scrollY={scrollY}>
                <View style={styles.headerTop}>
                    <Text style={styles.title}>All Exercises</Text>
                    <Text style={styles.count}>{total ? `${total} total` : '0 exercises'}</Text>
                </View>
                <View style={styles.searchRow}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search exercises..."
                            value={searchQuery}
                            onChangeText={onSearchChange}
                            placeholderTextColor="#999"
                            autoCorrect={false}
                            autoCapitalize="none"
                            returnKeyType="search"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => onSearchChange('')}
                                style={styles.clearButton}
                            >
                                <Ionicons name="close-circle" size={18} color="#999" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setShowFilters(true)}
                    >
                        <Ionicons name="filter" size={20} color="#007AFF" />
                        {activeFilterCount > 0 && (
                            <View style={styles.filterBadge}>
                                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScalingView>
        </LargeHeader>
    )
}

export default function ExercisesPage() {
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
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>
                    {isSyncing ? 'Syncing exercise database...' : 'Loading exercises...'}
                </Text>
            </View>
        )
    }

    // Show error state
    if (error) {
        console.error('Exercise Database Error:', error)

        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.errorSubtext}>
                    Please check your internet connection and try again.
                </Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
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
                contentContainerStyle={styles.listContent}
                HeaderComponent={(props) => (
                    <HeaderComponent
                        showNavBar={props.showNavBar}
                        scrollY={props.scrollY}
                        total={allExercises.length}
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
                    />
                )}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9'
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
        alignItems: 'center',
        gap: 12,
        marginTop: 12
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 8
    },
    filterButton: {
        position: 'relative',
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#f0f0f0'
    },
    filterBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#007AFF',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4
    },
    filterBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600'
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000'
    },
    count: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500'
    },
    listContent: {
        paddingHorizontal: 20,
        paddingVertical: 16
    },
    loadingFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 8
    },
    loadingText: {
        fontSize: 14,
        color: '#999'
    },
    searchIcon: {
        marginRight: 4
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        padding: 0
    },
    clearButton: {
        padding: 4
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ff3b30',
        marginBottom: 8,
        textAlign: 'center'
    },
    errorSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center'
    }
})
