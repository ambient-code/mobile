import { Stack } from 'expo-router'

export default function DecisionsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Decision Queue',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Review Decision',
          presentation: 'card',
        }}
      />
    </Stack>
  )
}
