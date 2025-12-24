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
import { Badge, useTheme } from '@/ui'
import { Theme } from '@/ui/theme/themes'
import { useExerciseDatabase } from '@/utils/useExerciseDatabase'

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)

const Pagination = ({
    scrollOffsetAnimatedValue,
    positionAnimatedValue,
    amountOfDots,
    theme
}: {
    scrollOffsetAnimatedValue: Animated.Value
    positionAnimatedValue: Animated.Value
    amountOfDots: number
    theme: Theme
}) => {
    return (
        <View style={[styles.pagination, { gap: theme.spacing[2] }]}>
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
                            <View
                                style={[
                                    styles.paginationDot,
                                    { backgroundColor: theme.colors.primary }
                                ]}
                            />
                        </Animated.View>
                    )
                })}
        </View>
    )
}

export default function ExerciseDetailPage() {
    const { theme } = useTheme()
    const { id } = useLocalSearchParams<{ id: string }>()

    const { exercises: allExercises, isInitialized, isSyncing, error } = useExerciseDatabase()

    const scrollOffsetAnimatedValue = useRef(new Animated.Value(0)).current
    const positionAnimatedValue = useRef(new Animated.Value(0)).current

    const exercise = allExercises.find((ex) => ex.externalId === id)

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
    if (error || !exercise) {
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
                    {error || 'Exercise not found'}
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
        <View style={[styles.container, { backgroundColor: theme.colors.backgroundSecondary }]}>
            <Stack.Screen
                options={{
                    title: exercise.name,
                    headerShown: true
                }}
            />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.contentContainer,
                    { paddingBottom: theme.spacing[8] }
                ]}
            >
                {/* Header Section */}
                <View
                    style={[
                        styles.headerSection,
                        {
                            backgroundColor: theme.colors.surface,
                            padding: theme.spacing[5],
                            borderBottomWidth: 1,
                            borderBottomColor: theme.colors.border
                        }
                    ]}
                >
                    <Text
                        style={[
                            styles.title,
                            {
                                color: theme.colors.text,
                                fontSize: theme.fontSizes['4xl'],
                                fontWeight: theme.fontWeights.extrabold,
                                marginBottom: theme.spacing[3]
                            }
                        ]}
                    >
                        {exercise.name}
                    </Text>
                    <View style={[styles.metaRow, { gap: theme.spacing[2] }]}>
                        <Badge variant="secondary" size="md">
                            {exercise.category}
                        </Badge>
                        <Badge
                            variant={
                                exercise.level === 'beginner'
                                    ? 'success'
                                    : exercise.level === 'intermediate'
                                      ? 'warning'
                                      : 'primary'
                            }
                            size="md"
                        >
                            {exercise.level}
                        </Badge>
                    </View>
                </View>

                {/* Images Section */}
                {exercise.images && exercise.images.length > 0 && (
                    <View style={[styles.imagesSection, { backgroundColor: theme.colors.surface }]}>
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
                                    style={[styles.imageContainer, { padding: theme.spacing[2.5] }]}
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
                        <View
                            style={[styles.paginationOverlay, { paddingBottom: theme.spacing[5] }]}
                        >
                            <Pagination
                                scrollOffsetAnimatedValue={scrollOffsetAnimatedValue}
                                positionAnimatedValue={positionAnimatedValue}
                                amountOfDots={exercise.images.length}
                                theme={theme}
                            />
                        </View>
                    </View>
                )}

                {/* Details Section */}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor: theme.colors.surface,
                            padding: theme.spacing[5],
                            marginTop: theme.spacing[3]
                        }
                    ]}
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
                        Details
                    </Text>
                    <View
                        style={[
                            styles.detailRow,
                            {
                                paddingVertical: theme.spacing[2],
                                borderBottomColor: theme.colors.border
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.detailLabel,
                                {
                                    color: theme.colors.textSecondary,
                                    fontSize: theme.fontSizes.md,
                                    fontWeight: theme.fontWeights.medium
                                }
                            ]}
                        >
                            Equipment:
                        </Text>
                        <Text
                            style={[
                                styles.detailValue,
                                {
                                    color: theme.colors.text,
                                    fontSize: theme.fontSizes.md,
                                    fontWeight: theme.fontWeights.semibold
                                }
                            ]}
                        >
                            {exercise.equipment || 'None'}
                        </Text>
                    </View>
                    {exercise.force && (
                        <View
                            style={[
                                styles.detailRow,
                                {
                                    paddingVertical: theme.spacing[2],
                                    borderBottomColor: theme.colors.border
                                }
                            ]}
                        >
                            <Text
                                style={[
                                    styles.detailLabel,
                                    {
                                        color: theme.colors.textSecondary,
                                        fontSize: theme.fontSizes.md,
                                        fontWeight: theme.fontWeights.medium
                                    }
                                ]}
                            >
                                Force:
                            </Text>
                            <Text
                                style={[
                                    styles.detailValue,
                                    {
                                        color: theme.colors.text,
                                        fontSize: theme.fontSizes.md,
                                        fontWeight: theme.fontWeights.semibold
                                    }
                                ]}
                            >
                                {exercise.force}
                            </Text>
                        </View>
                    )}
                    {exercise.mechanic && (
                        <View
                            style={[
                                styles.detailRow,
                                {
                                    paddingVertical: theme.spacing[2],
                                    borderBottomColor: theme.colors.border
                                }
                            ]}
                        >
                            <Text
                                style={[
                                    styles.detailLabel,
                                    {
                                        color: theme.colors.textSecondary,
                                        fontSize: theme.fontSizes.md,
                                        fontWeight: theme.fontWeights.medium
                                    }
                                ]}
                            >
                                Mechanic:
                            </Text>
                            <Text
                                style={[
                                    styles.detailValue,
                                    {
                                        color: theme.colors.text,
                                        fontSize: theme.fontSizes.md,
                                        fontWeight: theme.fontWeights.semibold
                                    }
                                ]}
                            >
                                {exercise.mechanic}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Muscles Section */}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor: theme.colors.surface,
                            padding: theme.spacing[5],
                            marginTop: theme.spacing[3]
                        }
                    ]}
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
                        Target Muscles
                    </Text>
                    <View style={[styles.muscleSection, { marginBottom: theme.spacing[4] }]}>
                        <Text
                            style={[
                                styles.muscleLabel,
                                {
                                    color: theme.colors.textSecondary,
                                    fontSize: theme.fontSizes.md,
                                    fontWeight: theme.fontWeights.semibold,
                                    marginBottom: theme.spacing[2]
                                }
                            ]}
                        >
                            Primary:
                        </Text>
                        <View style={[styles.muscleChips, { gap: theme.spacing[2] }]}>
                            {exercise.primaryMuscles.map((muscle, index) => (
                                <Badge key={index} variant="primary" size="md">
                                    {muscle}
                                </Badge>
                            ))}
                        </View>
                    </View>
                    {exercise.secondaryMuscles && exercise.secondaryMuscles.length > 0 && (
                        <View style={styles.muscleSection}>
                            <Text
                                style={[
                                    styles.muscleLabel,
                                    {
                                        color: theme.colors.textSecondary,
                                        fontSize: theme.fontSizes.md,
                                        fontWeight: theme.fontWeights.semibold,
                                        marginBottom: theme.spacing[2]
                                    }
                                ]}
                            >
                                Secondary:
                            </Text>
                            <View style={[styles.muscleChips, { gap: theme.spacing[2] }]}>
                                {exercise.secondaryMuscles.map((muscle, index) => (
                                    <Badge key={index} variant="secondary" size="md">
                                        {muscle}
                                    </Badge>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Instructions Section */}
                <View
                    style={[
                        styles.section,
                        {
                            backgroundColor: theme.colors.surface,
                            padding: theme.spacing[5],
                            marginTop: theme.spacing[3]
                        }
                    ]}
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
                        Instructions
                    </Text>
                    {exercise.instructions.map((instruction, index) => (
                        <View
                            key={index}
                            style={[
                                styles.instructionItem,
                                { marginBottom: theme.spacing[4], gap: theme.spacing[3] }
                            ]}
                        >
                            <View
                                style={[
                                    styles.instructionNumber,
                                    {
                                        width: 28,
                                        height: 28,
                                        borderRadius: 14,
                                        backgroundColor: theme.colors.primary
                                    }
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.instructionNumberText,
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
                                    styles.instructionText,
                                    {
                                        color: theme.colors.text,
                                        fontSize: theme.fontSizes.md,
                                        lineHeight: theme.fontSizes.md * 1.47
                                    }
                                ]}
                            >
                                {instruction}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollView: {
        flex: 1
    },
    contentContainer: {},
    headerSection: {},
    title: {},
    metaRow: {
        flexDirection: 'row'
    },
    imagesSection: {
        height: 300,
        position: 'relative'
    },
    pagerView: {
        flex: 1
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    exerciseImage: {
        width: '100%',
        height: '100%'
    },
    paginationOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0
    },
    section: {},
    sectionTitle: {},
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1
    },
    detailLabel: {
        textTransform: 'capitalize'
    },
    detailValue: {
        textTransform: 'capitalize'
    },
    muscleSection: {},
    muscleLabel: {},
    muscleChips: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    instructionItem: {
        flexDirection: 'row'
    },
    instructionNumber: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    instructionNumberText: {},
    instructionText: {
        flex: 1
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
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
        textAlign: 'center'
    },
    errorSubtext: {
        textAlign: 'center'
    },
    loadingText: {}
})
