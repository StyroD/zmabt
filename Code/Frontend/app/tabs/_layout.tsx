import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useColors } from '@/contexts/ThemeContext'
import FontAwesome from '@expo/vector-icons/FontAwesome'

export default function TabsLayout() {
  const Colors = useColors()
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textSecondary,
      tabBarStyle: {
        backgroundColor: Colors.surface,
        borderTopColor: Colors.border,
        borderTopWidth: 1,
      },
      tabBarLabelStyle: {
        color: Colors.textPrimary,
      },
      headerShown: false,
    }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="projectsList" options={{ title: 'Projects', tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" size={size} color={color} /> }} />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }} />
      <Tabs.Screen name="projectDetail_manager" options={{ title: 'Project Detail Manager', href: null }} />
      <Tabs.Screen name="create-project" options={{ title: 'Create project', tabBarIcon: ({ color, size }) => <Ionicons name="create" size={size} color={color} /> }} />
      <Tabs.Screen name="task-list" options={{ title: 'Task list', tabBarIcon: ({ color }) => <FontAwesome name="tasks" size={24} color={color} /> }} />
      <Tabs.Screen name="create-task" options={{ title: 'Create task', tabBarIcon: ({ color }) => <FontAwesome name="tasks" size={24} color={color} /> }} />
      <Tabs.Screen name="certificate-list" options={{ title: 'Certificates', href: null }} />
      <Tabs.Screen name="certificate-view" options={{ title: 'Certificate', href: null }} />
      <Tabs.Screen name="workers" options={{ title: 'Workers', href: null }} />
      <Tabs.Screen name="projectDetail_worker" options={{ title: 'Project Detail', href: null }} />
    </Tabs>
  )
}
