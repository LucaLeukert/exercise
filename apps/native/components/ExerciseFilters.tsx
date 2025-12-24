import { useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import type { ExerciseFiltersType } from '@packages/backend/convex/schema'

import { Badge, Button, useTheme } from '@/ui'

interface Props {
    visible: boolean
    onClose: () => void
    filters: ExerciseFiltersType
    onApplyFilters: (filters: ExerciseFiltersType) => void
}

const MUSCLES = [
    'abdominals',
    'abductors',
    'adductors',
    'biceps',
    'calves',
    'chest',
    'forearms',
    'glutes',
    'hamstrings',
    'lats',
    'lower back',
    'middle back',
    'neck',
    'quadriceps',
    'shoulders',
    'traps',
    'triceps'
] as const

const LEVELS = ['beginner', 'intermediate', 'expert'] as const

const CATEGORIES = [
    'powerlifting',
    'strength',
    'stretching',
    'cardio',
    'olympic weightlifting',
    'strongman',
    'plyometrics'
] as const

const EQUIPMENT = [
    'medicine ball',
    'dumbbell',
    'body only',
    'bands',
    'kettlebells',
    'foam roll',
    'cable',
    'machine',
    'barbell',
    'exercise ball',
    'e-z curl bar',
    'other'
] as const

const MECHANICS = ['isolation', 'compound'] as const

export function ExerciseFiltersModal({ visible, onClose, filters, onApplyFilters }: Props) {
    const { theme } = useTheme()
    const [localFilters, setLocalFilters] = useState<ExerciseFiltersType>(filters)

    const toggleMuscle = (muscle: (typeof MUSCLES)[number], type: 'primary' | 'secondary') => {
        const key = type === 'primary' ? 'primaryMuscles' : 'secondaryMuscles'
        const current = localFilters[key] ?? []
        const newMuscles = current.includes(muscle)
            ? current.filter((m) => m !== muscle)
            : [...current, muscle]

        setLocalFilters({
            ...localFilters,
            [key]: newMuscles.length > 0 ? newMuscles : undefined
        })
    }

    const handleApply = () => {
        onApplyFilters(localFilters)
        onClose()
    }

    const handleClear = () => {
        setLocalFilters({})
    }

    const activeFilterCount =
        (localFilters.primaryMuscles?.length ?? 0) +
        (localFilters.secondaryMuscles?.length ?? 0) +
        (localFilters.level ? 1 : 0) +
        (localFilters.category ? 1 : 0) +
        (localFilters.equipment ? 1 : 0) +
        (localFilters.mechanic ? 1 : 0)

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <View
                    style={[
                        styles.header,
                        {
                            borderBottomColor: theme.colors.border,
                            paddingHorizontal: theme.spacing[5],
                            paddingVertical: theme.spacing[4]
                        }
                    ]}
                >
                    <Pressable onPress={onClose}>
                        <Ionicons name="close" size={28} color={theme.colors.text} />
                    </Pressable>
                    <Text
                        style={[
                            styles.headerTitle,
                            {
                                color: theme.colors.text,
                                fontSize: theme.fontSizes.xl,
                                fontWeight: theme.fontWeights.semibold
                            }
                        ]}
                    >
                        Filters
                    </Text>
                    <Pressable onPress={handleClear}>
                        <Text
                            style={[
                                styles.clearText,
                                {
                                    color: theme.colors.primary,
                                    fontSize: theme.fontSizes.md,
                                    fontWeight: theme.fontWeights.medium
                                }
                            ]}
                        >
                            Clear
                        </Text>
                    </Pressable>
                </View>

                <ScrollView style={styles.content}>
                    {/* Level */}
                    <View
                        style={[
                            styles.section,
                            {
                                paddingHorizontal: theme.spacing[5],
                                paddingVertical: theme.spacing[5],
                                borderBottomColor: theme.colors.border
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: theme.colors.text,
                                    fontSize: theme.fontSizes.md,
                                    fontWeight: theme.fontWeights.semibold,
                                    marginBottom: theme.spacing[3]
                                }
                            ]}
                        >
                            Level
                        </Text>
                        <View style={[styles.chipContainer, { gap: theme.spacing[2] }]}>
                            {LEVELS.map((level) => (
                                <Pressable
                                    key={level}
                                    onPress={() =>
                                        setLocalFilters({
                                            ...localFilters,
                                            level:
                                                localFilters.level === level
                                                    ? undefined
                                                    : (level as any)
                                        })
                                    }
                                >
                                    <Badge
                                        variant={
                                            localFilters.level === level ? 'primary' : 'outline'
                                        }
                                        size="md"
                                    >
                                        {level}
                                    </Badge>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Category */}
                    <View
                        style={[
                            styles.section,
                            {
                                paddingHorizontal: theme.spacing[5],
                                paddingVertical: theme.spacing[5],
                                borderBottomColor: theme.colors.border
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: theme.colors.text,
                                    fontSize: theme.fontSizes.md,
                                    fontWeight: theme.fontWeights.semibold,
                                    marginBottom: theme.spacing[3]
                                }
                            ]}
                        >
                            Category
                        </Text>
                        <View style={[styles.chipContainer, { gap: theme.spacing[2] }]}>
                            {CATEGORIES.map((category) => (
                                <Pressable
                                    key={category}
                                    onPress={() =>
                                        setLocalFilters({
                                            ...localFilters,
                                            category:
                                                localFilters.category === category
                                                    ? undefined
                                                    : (category as any)
                                        })
                                    }
                                >
                                    <Badge
                                        variant={
                                            localFilters.category === category ? 'primary' : 'outline'
                                        }
                                        size="md"
                                    >
                                        {category}
                                    </Badge>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Primary Muscles */}
                    <View
                        style={[
                            styles.section,
                            {
                                paddingHorizontal: theme.spacing[5],
                                paddingVertical: theme.spacing[5],
                                borderBottomColor: theme.colors.border
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: theme.colors.text,
                                    fontSize: theme.fontSizes.md,
                                    fontWeight: theme.fontWeights.semibold,
                                    marginBottom: theme.spacing[3]
                                }
                            ]}
                        >
                            Primary Muscles
                        </Text>
                        <View style={[styles.chipContainer, { gap: theme.spacing[2] }]}>
                            {MUSCLES.map((muscle) => (
                                <Pressable
                                    key={muscle}
                                    onPress={() => toggleMuscle(muscle, 'primary')}
                                >
                                    <Badge
                                        variant={
                                            localFilters.primaryMuscles?.includes(muscle)
                                                ? 'primary'
                                                : 'outline'
                                        }
                                        size="md"
                                    >
                                        {muscle}
                                    </Badge>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Secondary Muscles */}
                    <View
                        style={[
                            styles.section,
                            {
                                paddingHorizontal: theme.spacing[5],
                                paddingVertical: theme.spacing[5],
                                borderBottomColor: theme.colors.border
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: theme.colors.text,
                                    fontSize: theme.fontSizes.md,
                                    fontWeight: theme.fontWeights.semibold,
                                    marginBottom: theme.spacing[3]
                                }
                            ]}
                        >
                            Secondary Muscles
                        </Text>
                        <View style={[styles.chipContainer, { gap: theme.spacing[2] }]}>
                            {MUSCLES.map((muscle) => (
                                <Pressable
                                    key={muscle}
                                    onPress={() => toggleMuscle(muscle, 'secondary')}
                                >
                                    <Badge
                                        variant={
                                            localFilters.secondaryMuscles?.includes(muscle)
                                                ? 'primary'
                                                : 'outline'
                                        }
                                        size="md"
                                    >
                                        {muscle}
                                    </Badge>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Equipment */}
                    <View
                        style={[
                            styles.section,
                            {
                                paddingHorizontal: theme.spacing[5],
                                paddingVertical: theme.spacing[5],
                                borderBottomColor: theme.colors.border
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: theme.colors.text,
                                    fontSize: theme.fontSizes.md,
                                    fontWeight: theme.fontWeights.semibold,
                                    marginBottom: theme.spacing[3]
                                }
                            ]}
                        >
                            Equipment
                        </Text>
                        <View style={[styles.chipContainer, { gap: theme.spacing[2] }]}>
                            {EQUIPMENT.map((equipment) => (
                                <Pressable
                                    key={equipment}
                                    onPress={() =>
                                        setLocalFilters({
                                            ...localFilters,
                                            equipment:
                                                localFilters.equipment === equipment
                                                    ? undefined
                                                    : (equipment as any)
                                        })
                                    }
                                >
                                    <Badge
                                        variant={
                                            localFilters.equipment === equipment
                                                ? 'primary'
                                                : 'outline'
                                        }
                                        size="md"
                                    >
                                        {equipment}
                                    </Badge>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Mechanic */}
                    <View
                        style={[
                            styles.section,
                            {
                                paddingHorizontal: theme.spacing[5],
                                paddingVertical: theme.spacing[5],
                                borderBottomColor: theme.colors.border
                            }
                        ]}
                    >
                        <Text
                            style={[
                                styles.sectionTitle,
                                {
                                    color: theme.colors.text,
                                    fontSize: theme.fontSizes.md,
                                    fontWeight: theme.fontWeights.semibold,
                                    marginBottom: theme.spacing[3]
                                }
                            ]}
                        >
                            Mechanic
                        </Text>
                        <View style={[styles.chipContainer, { gap: theme.spacing[2] }]}>
                            {MECHANICS.map((mechanic) => (
                                <Pressable
                                    key={mechanic}
                                    onPress={() =>
                                        setLocalFilters({
                                            ...localFilters,
                                            mechanic:
                                                localFilters.mechanic === mechanic
                                                    ? undefined
                                                    : (mechanic as any)
                                        })
                                    }
                                >
                                    <Badge
                                        variant={
                                            localFilters.mechanic === mechanic
                                                ? 'primary'
                                                : 'outline'
                                        }
                                        size="md"
                                    >
                                        {mechanic}
                                    </Badge>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <View
                    style={[
                        styles.footer,
                        {
                            padding: theme.spacing[5],
                            borderTopWidth: 1,
                            borderTopColor: theme.colors.border
                        }
                    ]}
                >
                    <Button
                        title={`Apply ${activeFilterCount > 0 ? `(${activeFilterCount})` : ''}`}
                        onPress={handleApply}
                        fullWidth
                    />
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1
    },
    headerTitle: {},
    clearText: {},
    content: {
        flex: 1
    },
    section: {
        borderBottomWidth: 1
    },
    sectionTitle: {},
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    footer: {}
})
