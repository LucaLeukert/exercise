import { useRef } from 'react'
import {
    ActivityIndicator,
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native'
import PagerView, { PagerViewOnPageScrollEventData } from 'react-native-pager-view'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useExerciseDatabase } from '@/utils/useExerciseDatabase'

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

const Pagination = ({
    scrollOffsetAnimatedValue,
    positionAnimatedValue,
    amountOfDots
}: {
    scrollOffsetAnimatedValue: Animated.Value
    positionAnimatedValue: Animated.Value
    amountOfDots: number
}) => {
    return (
        <View style={styles.pagination}>
            {Array(amountOfDots)
                .fill(0)
                .map((_, index) => {
                    const inputRange = [index - 1, index, index + 1]
                    const scale = Animated.add(
                        scrollOffsetAnimatedValue,
                        positionAnimatedValue
                    ).interpolate({
                        inputRange,
                        outputRange: [0.5, 1, 0.5],
                        extrapolate: 'clamp'
                    })

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.paginationDotContainer,
                                {
                                    transform: [{ scale }]
                                }
                            ]}
                        >
                            <View style={[styles.paginationDot, { backgroundColor: '#007AFF' }]} />
                        </Animated.View>
                    )
                })}
        </View>
    )
}

export default function ExerciseDetailPage() {
    const { id } = useLocalSearchParams<{ id: string }>()

    const { exercises: allExercises, isInitialized, isSyncing, error } = useExerciseDatabase()

    const scrollOffsetAnimatedValue = useRef(new Animated.Value(0)).current
    const positionAnimatedValue = useRef(new Animated.Value(0)).current

    const exercise = allExercises.find((ex) => ex.externalId === id)

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
    if (error || !exercise) {
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
            <Stack.Screen
                options={{
                    title: exercise.name,
                    headerShown: true
                }}
            />
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
                {/* Header Section */}
                <View style={styles.headerSection}>
                    <Text style={styles.title}>{exercise.name}</Text>
                    <View style={styles.metaRow}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{exercise.category}</Text>
                        </View>
                        <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>{exercise.level}</Text>
                        </View>
                    </View>
                </View>

                {/* Images Section */}
                {exercise.images && exercise.images.length > 0 && (
                    <View style={styles.imagesSection}>
                        <AnimatedPagerView
                            style={styles.pagerView}
                            initialPage={0}
                            onPageScroll={Animated.event<PagerViewOnPageScrollEventData>([
                                {
                                    nativeEvent: {
                                        offset: scrollOffsetAnimatedValue,
                                        position: positionAnimatedValue
                                    }
                                }
                            ])}
                        >
                            {exercise.images.map((image, index) => (
                                <View
                                    key={String(index)}
                                    style={styles.imageContainer}
                                    collapsable={false}
                                >
                                    <Image
                                        source={{
                                            uri: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/refs/heads/main/exercises/${image}`
                                        }}
                                        style={styles.exerciseImage}
                                        resizeMode="cover"
                                    />
                                </View>
                            ))}
                        </AnimatedPagerView>
                        <View style={styles.paginationOverlay}>
                            <Pagination
                                scrollOffsetAnimatedValue={scrollOffsetAnimatedValue}
                                positionAnimatedValue={positionAnimatedValue}
                                amountOfDots={exercise.images.length}
                            />
                        </View>
                    </View>
                )}

                {/* Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Equipment:</Text>
                        <Text style={styles.detailValue}>{exercise.equipment || 'None'}</Text>
                    </View>
                    {exercise.force && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Force:</Text>
                            <Text style={styles.detailValue}>{exercise.force}</Text>
                        </View>
                    )}
                    {exercise.mechanic && (
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Mechanic:</Text>
                            <Text style={styles.detailValue}>{exercise.mechanic}</Text>
                        </View>
                    )}
                </View>

                {/* Muscles Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Target Muscles</Text>
                    <View style={styles.muscleSection}>
                        <Text style={styles.muscleLabel}>Primary:</Text>
                        <View style={styles.muscleChips}>
                            {exercise.primaryMuscles.map((muscle, index) => (
                                <View key={index} style={styles.muscleChip}>
                                    <Text style={styles.muscleChipText}>{muscle}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                    {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                        <View style={styles.muscleSection}>
                            <Text style={styles.muscleLabel}>Secondary:</Text>
                            <View style={styles.muscleChips}>
                                {exercise.secondaryMuscles.map((muscle, index) => (
                                    <View
                                        key={index}
                                        style={[styles.muscleChip, styles.secondaryChip]}
                                    >
                                        <Text style={styles.muscleChipText}>{muscle}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Instructions Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Instructions</Text>
                    {exercise.instructions.map((instruction, index) => (
                        <View key={index} style={styles.instructionItem}>
                            <View style={styles.instructionNumber}>
                                <Text style={styles.instructionNumberText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.instructionText}>{instruction}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
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
    contentContainer: {
        paddingBottom: 32
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    headerSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#000',
        marginBottom: 12
    },
    metaRow: {
        flexDirection: 'row',
        gap: 8
    },
    categoryBadge: {
        backgroundColor: '#e3f2fd',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16
    },
    categoryText: {
        color: '#1976d2',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize'
    },
    levelBadge: {
        backgroundColor: '#f3e5f5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16
    },
    levelText: {
        color: '#7b1fa2',
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'capitalize'
    },
    imagesSection: {
        backgroundColor: '#fff',
        height: 300,
        position: 'relative'
    },
    pagerView: {
        flex: 1
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10
    },
    exerciseImage: {
        width: '100%',
        height: '100%'
    },
    paginationOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 20
    },
    section: {
        backgroundColor: '#fff',
        padding: 20,
        marginTop: 12
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        marginBottom: 16
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5'
    },
    detailLabel: {
        fontSize: 15,
        color: '#666',
        fontWeight: '500'
    },
    detailValue: {
        fontSize: 15,
        color: '#000',
        fontWeight: '600',
        textTransform: 'capitalize'
    },
    muscleSection: {
        marginBottom: 16
    },
    muscleLabel: {
        fontSize: 15,
        color: '#666',
        fontWeight: '600',
        marginBottom: 8
    },
    muscleChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    muscleChip: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16
    },
    secondaryChip: {
        backgroundColor: '#e0e0e0'
    },
    muscleChipText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'capitalize'
    },
    instructionItem: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12
    },
    instructionNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    instructionNumberText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700'
    },
    instructionText: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        lineHeight: 22
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4
    },
    paginationDotContainer: {
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center'
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
    },
    loadingText: {
        fontSize: 14,
        color: '#999'
    }
})
