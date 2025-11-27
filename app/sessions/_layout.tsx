import { Stack } from 'expo-router'

export default function SessionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: '',
        headerBackTitleVisible: false,
        headerTitle: '',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  )
}
