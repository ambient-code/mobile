import { Stack } from 'expo-router'

export default function SessionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: '',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Sessions',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Session Details',
        }}
      />
    </Stack>
  )
}
