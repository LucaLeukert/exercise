import { Stack } from 'expo-router'

export default function RoutineLayout() {
    return (
        <Stack>
            <Stack.Screen
                name="create"
                options={{
                    title: 'Create Routine',
                    headerShown: true
                }}
            />
            <Stack.Screen
                name="select-exercise"
                options={{
                    presentation: 'modal',
                    title: 'Select Exercise',
                    headerShown: true
                }}
            />
        </Stack>
    )
}
