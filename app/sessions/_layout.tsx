import { Stack } from 'expo-router'

export default function SessionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: '',
        headerTitle: '',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen
        name="[id]/review"
        options={{
          headerShown: true,
          headerTitle: 'Review Session',
          headerBackTitle: '',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackTitle: '',
        }}
      />
    </Stack>
  )
}
