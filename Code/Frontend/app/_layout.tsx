import { Stack, Redirect, router } from 'expo-router'
import { useState, useEffect, useRef } from 'react'
import { View, ActivityIndicator, Text, StyleSheet, Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NetworkProvider, useNetwork } from '@/contexts/NetworkContext'
import { darkColors } from '@/constants/themes'
import * as Notifications from 'expo-notifications'
import { updatePushToken } from '@/api/endpoints/users'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { setCrashlyticsUser } from '@/utils/firebase'

try {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    })
} catch { /* not supported in Expo Go */ }

function getRouteFromNotificationData(data: Record<string, any>): string {
    const { type, projectId } = data ?? {}
    switch (type) {
        case 'task_assigned':
            return projectId
                ? `/tabs/task-list?projectId=${projectId}&projectTitle=My Tasks`
                : '/tabs/projectsList'
        case 'task_done':
            return projectId
                ? `/tabs/task-list?projectId=${projectId}&projectTitle=Tasks`
                : '/tabs/projectsList'
        case 'certificate_submitted':
            return '/tabs/workers'
        case 'certificate_reviewed':
            return '/tabs/certificate-list'
        default:
            return '/tabs/dashboard'
    }
}

async function registerPushToken() {
    const userId = await SecureStore.getItemAsync('userId')
    if (!userId) return

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
        })
    }

    const { status: existing } = await Notifications.getPermissionsAsync()
    const { status } = existing === 'granted'
        ? { status: existing }
        : await Notifications.requestPermissionsAsync()

    if (status !== 'granted') return

    try {
        const tokenData = await Notifications.getExpoPushTokenAsync()
        await updatePushToken(userId, tokenData.data).catch(() => {})
    } catch {
        // getExpoPushTokenAsync requires an EAS projectId — skip in dev/Expo Go
    }
}

function OfflineBanner() {
    const { isOnline, pendingCount } = useNetwork()
    if (isOnline) return null
    return (
        <View style={styles.banner}>
            <Text style={styles.bannerText}>
                {pendingCount > 0
                    ? `Offline — ${pendingCount} change${pendingCount > 1 ? 's' : ''} queued`
                    : 'No internet connection'}
            </Text>
        </View>
    )
}

function AppContent() {
    const [isLoading, setLoading] = useState(true)
    const [isLoggedIn, setLoggedIn] = useState(false)
    const responseListener = useRef<Notifications.EventSubscription | null>(null)

    useEffect(() => {
        const checkToken = async () => {
            //const token = await SecureStore.getItemAsync('token')
            //setLoggedIn(!!token)
            setLoading(false)
        }
        checkToken()

        registerPushToken()

        // Identify user in Crashlytics for crash attribution
        SecureStore.getItemAsync('userId').then(userId => {
            if (!userId) return
            SecureStore.getItemAsync('user').then(raw => {
                const role = raw ? JSON.parse(raw).role : 'unknown'
                setCrashlyticsUser(userId, role).catch(() => {})
            })
        })

        // Tap on notification → navigate to relevant screen
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data as Record<string, any>
            const route = getRouteFromNotificationData(data)
            router.push(route as any)
        })

        return () => {
            responseListener.current?.remove()
        }
    }, [])

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={darkColors.primary} />
            </View>
        )
    }

    return (
        <>
            <OfflineBanner />
            {isLoggedIn ? (
                <Redirect href="/tabs/dashboard" />
            ) : (
                <Stack screenOptions={{ headerShown: false }} />
            )}
        </>
    )
}

export default function RootLayout() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <SafeAreaProvider>
                    <NetworkProvider>
                        <AppContent />
                    </NetworkProvider>
                </SafeAreaProvider>
            </ThemeProvider>
        </ErrorBoundary>
    )
}

const styles = StyleSheet.create({
    banner: {
        backgroundColor: '#B91C1C',
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    bannerText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
    },
})
