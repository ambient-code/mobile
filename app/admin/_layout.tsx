import { Tabs } from 'expo-router'
import { AdminGuard } from '@/components/admin/guards/AdminGuard'

export default function AdminLayout() {
  return (
    <AdminGuard>
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: '#007AFF',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Overview',
            headerTitle: 'System Health',
          }}
        />
        <Tabs.Screen
          name="signals"
          options={{
            title: 'Signals',
            headerTitle: 'Golden Signals',
          }}
        />
        <Tabs.Screen
          name="users"
          options={{
            title: 'Users',
            headerTitle: 'Engagement',
          }}
        />
        <Tabs.Screen
          name="platforms"
          options={{
            title: 'Platforms',
            headerTitle: 'Platform Comparison',
          }}
        />
      </Tabs>
    </AdminGuard>
  )
}
