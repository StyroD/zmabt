import { Stack, router } from 'expo-router'
import { useState, useEffect, useRef } from 'react'
import { View, ActivityIndicator, Text, StyleSheet, Platform, Animated, AppState } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NetworkProvider, useNetwork } from '@/contexts/NetworkContext'
import * as Notifications from 'expo-notifications'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { setCrashlyticsUser } from '@/utils/firebase'
import { initDb } from '@/utils/db'
import * as NavigationBar from 'expo-navigation-bar'
import { getConversations } from "@/api/endpoints/messages"
import { getSocket } from "@/api/socket"
import { unreadSignal } from '@/utils/unreadSignal'
import { activeChatSignal } from '@/utils/activeChatSignal'
import { toastSignal } from '@/utils/toastSignal'
import { InAppToast } from '@/components/InAppToast'

/* -------------------- NOTIFICATION CONFIG (FIXED) -------------------- */

// MUST run immediately (not inside login)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
})

/* -------------------- ROUTING -------------------- */

function getRouteFromNotificationData(data: Record<string, any>): string {
    const { type, projectId, senderId, senderName } = data ?? {}

    switch (type) {
        case 'task_assigned':
            return projectId
                ? `/tabs/task-list?projectId=${projectId}`
                : '/tabs/projectsList'

        case 'task_done':
            return projectId
                ? `/tabs/task-list?projectId=${projectId}`
                : '/tabs/projectsList'

        case 'certificate_submitted':
            return '/tabs/workers'

        case 'certificate_reviewed':
            return '/tabs/certificate-list'

        case 'worker_assigned':
            return projectId
                ? `/tabs/projectDetail_worker?id=${projectId}`
                : '/tabs/projectsList'

        case 'worker_removed':
            return '/tabs/projectsList'

        case 'message':
            return senderId
                ? `/chatDetail?userId=${senderId}&name=${encodeURIComponent(senderName ?? '')}`
                : '/tabs/chat'

        default:
            return '/tabs/dashboard'
    }
}

/* -------------------- LOCAL NOTIFICATION -------------------- */

async function scheduleLocalNotification(title: string, body: string, data: Record<string, any>) {
    if (AppState.currentState === 'active') {
        toastSignal.show({ title, body, data })
        return
    }

    try {
        await Notifications.scheduleNotificationAsync({
            content: { title, body, data },
            trigger: null,
        })
    } catch (e) {
        console.log("Notification error:", e)
    }
}

/* -------------------- ROOT APP -------------------- */

function AppContent() {
    const [isLoading, setLoading] = useState(true)
    const [isLoggedIn, setLoggedIn] = useState<boolean | null>(null)

    /* -------------------- INIT (FIXED ORDER) -------------------- */
    useEffect(() => {
        let mounted = true

        const init = async () => {
            try {
                await initDb()

                if (Platform.OS === 'android') {
                    NavigationBar.setBackgroundColorAsync('#0F172A')
                    NavigationBar.setButtonStyleAsync('light')
                }

                const token = await SecureStore.getItemAsync('token')
                if (!mounted) return
                setLoggedIn(!!token)

                const userId = await SecureStore.getItemAsync('userId')
                if (userId) {
                    const raw = await SecureStore.getItemAsync('user')
                    const role = raw ? JSON.parse(raw).role : 'unknown'
                    setCrashlyticsUser(userId, role).catch(() => {})
                }

            } catch (err) {
                console.error(err)
                setLoggedIn(false)
            } finally {
                setLoading(false)
            }
        }

        init()

        /* -------------------- NOTIFICATION PERMISSION (FIXED EARLY) -------------------- */
        Notifications.requestPermissionsAsync().catch(() => {})

        /* -------------------- ANDROID CHANNEL (FIXED CRITICAL BUG) -------------------- */
        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'Default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
            }).catch(() => {})
        }

        const subscription =
            Notifications.addNotificationResponseReceivedListener(response => {
                const data = response.notification.request.content.data as Record<string, any>
                const route = getRouteFromNotificationData(data)
                router.push(route as any)
            })

        return () => {
            mounted = false
            subscription.remove()
        }
    }, [])

    /* -------------------- SOCKET + NOTIFICATIONS -------------------- */
    useEffect(() => {
        if (!isLoggedIn) return

        let socketRef: any = null
        let isMounted = true

        const setupSocket = async () => {
            try {
                const uid = await SecureStore.getItemAsync('userId')
                const socket = await getSocket()

                if (!isMounted) return
                socketRef = socket

                const res = await getConversations()
                const unreadCount = res.data.filter((c: any) => c.sender_id !== uid).length
                unreadSignal.set(unreadCount)

                socket.on('new_message', (msg: any) => {
                    if (msg.sender_id !== uid && msg.sender_id !== activeChatSignal.get()) {
                        unreadSignal.set(unreadSignal.get() + 1)

                        scheduleLocalNotification(
                            msg.sender_name ?? 'New Message',
                            msg.content,
                            {
                                type: 'message',
                                senderId: msg.sender_id,
                                senderName: msg.sender_name
                            }
                        )
                    }
                })

                socket.on('notification', (payload: any) => {
                    scheduleLocalNotification(payload.title, payload.body, payload)
                })

            } catch (err) {
                console.error("Socket error:", err)
            }
        }

        setupSocket()

        return () => {
            isMounted = false
            if (socketRef) socketRef.disconnect?.()
        }
    }, [isLoggedIn])

    /* -------------------- LOADING -------------------- */
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
            <Stack screenOptions={{ headerShown: false }} />
            <InAppToast />
        </>
    )
}

/* -------------------- ROOT -------------------- */

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