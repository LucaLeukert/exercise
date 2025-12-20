import { useState } from 'react'
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import type { ExerciseFiltersType } from '@packages/backend/convex/schema'

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
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <Ionicons name="close" size={28} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Filters</Text>
                    <TouchableOpacity onPress={handleClear}>
                        <Text style={styles.clearText}>Clear</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    {/* Level */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Level</Text>
                        <View style={styles.chipContainer}>
                            {LEVELS.map((level) => (
                                <TouchableOpacity
                                    key={level}
                                    style={[
                                        styles.chip,
                                        localFilters.level === level && styles.chipActive
                                    ]}
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
                                    <Text
                                        style={[
                                            styles.chipText,
                                            localFilters.level === level && styles.chipTextActive
                                        ]}
                                    >
                                        {level}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Category */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Category</Text>
                        <View style={styles.chipContainer}>
                            {CATEGORIES.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.chip,
                                        localFilters.category === category && styles.chipActive
                                    ]}
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
                                    <Text
                                        style={[
                                            styles.chipText,
                                            localFilters.category === category &&
                                                styles.chipTextActive
                                        ]}
                                    >
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Primary Muscles */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Primary Muscles</Text>
                        <View style={styles.chipContainer}>
                            {MUSCLES.map((muscle) => (
                                <TouchableOpacity
                                    key={muscle}
                                    style={[
                                        styles.chip,
                                        localFilters.primaryMuscles?.includes(muscle) &&
                                            styles.chipActive
                                    ]}
                                    onPress={() => toggleMuscle(muscle, 'primary')}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            localFilters.primaryMuscles?.includes(muscle) &&
                                                styles.chipTextActive
                                        ]}
                                    >
                                        {muscle}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Secondary Muscles */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Secondary Muscles</Text>
                        <View style={styles.chipContainer}>
                            {MUSCLES.map((muscle) => (
                                <TouchableOpacity
                                    key={muscle}
                                    style={[
                                        styles.chip,
                                        localFilters.secondaryMuscles?.includes(muscle) &&
                                            styles.chipActive
                                    ]}
                                    onPress={() => toggleMuscle(muscle, 'secondary')}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            localFilters.secondaryMuscles?.includes(muscle) &&
                                                styles.chipTextActive
                                        ]}
                                    >
                                        {muscle}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Equipment */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Equipment</Text>
                        <View style={styles.chipContainer}>
                            {EQUIPMENT.map((equipment) => (
                                <TouchableOpacity
                                    key={equipment}
                                    style={[
                                        styles.chip,
                                        localFilters.equipment === equipment && styles.chipActive
                                    ]}
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
                                    <Text
                                        style={[
                                            styles.chipText,
                                            localFilters.equipment === equipment &&
                                                styles.chipTextActive
                                        ]}
                                    >
                                        {equipment}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Mechanic */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mechanic</Text>
                        <View style={styles.chipContainer}>
                            {MECHANICS.map((mechanic) => (
                                <TouchableOpacity
                                    key={mechanic}
                                    style={[
                                        styles.chip,
                                        localFilters.mechanic === mechanic && styles.chipActive
                                    ]}
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
                                    <Text
                                        style={[
                                            styles.chipText,
                                            localFilters.mechanic === mechanic &&
                                                styles.chipTextActive
                                        ]}
                                    >
                                        {mechanic}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                        <Text style={styles.applyButtonText}>
                            Apply {activeFilterCount > 0 && `(${activeFilterCount})`}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000'
    },
    clearText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '500'
    },
    content: {
        flex: 1
    },
    section: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 12
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
    chipActive: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF'
    },
    chipText: {
        fontSize: 14,
        color: '#333',
        textTransform: 'capitalize'
    },
    chipTextActive: {
        color: '#fff',
        fontWeight: '500'
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0'
    },
    applyButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center'
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    }
})
