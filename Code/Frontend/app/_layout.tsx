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
import { initDb } from '@/utils/db'
import * as NavigationBar from 'expo-navigation-bar'
import { getConversations } from "@/api/endpoints/messages"
import { getSocket } from "@/api/socket"
import { unreadSignal } from '@/utils/unreadSignal'

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

    const tokenData = await Notifications.getExpoPushTokenAsync().catch(() => null)
    if (!tokenData) return
    await updatePushToken(userId, tokenData.data).catch(() => {})
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
    const [isLoggedIn, setLoggedIn] = useState<boolean | null>(null)

    const responseListener = useRef<Notifications.EventSubscription | null>(null)

    useEffect(() => {
        let mounted = true

        const checkToken = async () => {
            try {
                await initDb()
                if (Platform.OS === 'android') {
                    NavigationBar.setBackgroundColorAsync('#0F172A')
                    NavigationBar.setButtonStyleAsync('light')
                }
                const token = await SecureStore.getItemAsync('token')
                if (!mounted) return
                setLoggedIn(!!token)
            } catch (err) {
                console.error(err)
                if (!mounted) return
                setLoggedIn(false)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        checkToken()
        registerPushToken()

        SecureStore.getItemAsync('userId').then(userId => {
            if (!userId) return
            SecureStore.getItemAsync('user').then(raw => {
                const role = raw ? JSON.parse(raw).role : 'unknown'
                setCrashlyticsUser(userId, role).catch(() => {})
            })
        })

        const subscription =
            Notifications.addNotificationResponseReceivedListener(response => {
                const data = response.notification.request.content.data as Record<string, any>
                const route = getRouteFromNotificationData(data)
                router.push(route as any)
            })

        responseListener.current = subscription

        return () => {
            mounted = false
            subscription.remove()
        }
    }, [])

    useEffect(() => {
        if (!isLoggedIn) return;

        let socketRef: any = null;
        let isMounted = true;
        let globalMessageHandler: ((msg: any) => void) | null = null; // 1. Create a reference for the handler

        const setupGlobalSocket = async () => {
            try {
                const uid = await SecureStore.getItemAsync('userId');
                const socket = await getSocket();
                
                if (!isMounted) return;
                socketRef = socket;

                try {
                    const res = await getConversations();
                    const unreadCount = res.data.filter((conv: any) => conv.sender_id !== uid).length;
                    
                    if (isMounted) {
                        unreadSignal.set(unreadCount);
                    }
                } catch (apiErr) {
                    console.error("Could not fetch initial unread count:", apiErr);
                }

                // 2. Define the named function
                globalMessageHandler = (msg: any) => {
                    if (msg.sender_id !== uid) {
                        const currentCount = unreadSignal.get();
                        unreadSignal.set(currentCount + 1);
                    }
                };

                // 3. Attach it
                socket.on('new_message', globalMessageHandler);
            } catch (err) {
                console.error("Global socket error:", err);
            }
        };

        setupGlobalSocket();

        return () => {
            isMounted = false;
            // 4. Safely detach ONLY the global handler
            if (socketRef && globalMessageHandler) {
                socketRef.off('new_message', globalMessageHandler);
            }
        };
    }, [isLoggedIn]);

    if (isLoading || isLoggedIn === null) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    if (!isLoggedIn) {
        return <Stack screenOptions={{ headerShown: false }} />
    }

    return (
        <>
            <OfflineBanner />
            <Stack screenOptions={{ headerShown: false }} />
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