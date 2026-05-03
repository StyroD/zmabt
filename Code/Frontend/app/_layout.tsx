import { Stack, router } from 'expo-router'
import { useState, useEffect, useRef } from 'react'
import { View, ActivityIndicator, Text, StyleSheet, Platform, Animated } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NetworkProvider, useNetwork } from '@/contexts/NetworkContext'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { updatePushToken } from '@/api/endpoints/users'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { setCrashlyticsUser } from '@/utils/firebase'
import { initDb } from '@/utils/db'
import * as NavigationBar from 'expo-navigation-bar'
import { getConversations } from "@/api/endpoints/messages"
import { getSocket } from "@/api/socket"
import { unreadSignal } from '@/utils/unreadSignal'
import { activeChatSignal } from '@/utils/activeChatSignal'

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
    const { type, projectId, senderId, senderName } = data ?? {}
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
        case 'worker_assigned':
            return projectId
                ? `/tabs/projectDetail_worker?id=${projectId}`
                : '/tabs/projectsList'
        case 'message':
            return senderId
                ? `/chatDetail?userId=${senderId}&name=${encodeURIComponent(senderName ?? '')}`
                : '/tabs/chat'
        default:
            return '/tabs/dashboard'
    }
}

async function scheduleLocalNotification(title: string, body: string, data: Record<string, any>) {
    try {
        await Notifications.scheduleNotificationAsync({
            content: { title, body, data },
            trigger: null,
        })
    } catch { /* not supported in Expo Go */ }
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

    const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
    const tokenData = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
    ).catch(() => null)
    if (!tokenData) return
    await updatePushToken(userId, tokenData.data).catch(() => {})
}

function OfflineBanner() {
    const { isOnline, pendingCount } = useNetwork()
    const [phase, setPhase] = useState<'hidden' | 'offline' | 'back-online'>('hidden')
    const slideAnim = useRef(new Animated.Value(-60)).current
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const prevOnline = useRef<boolean | null>(null)

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current)

        if (prevOnline.current === null) {
            prevOnline.current = isOnline
            if (!isOnline) {
                setPhase('offline')
                Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start()
            }
            return
        }

        if (prevOnline.current === isOnline) return
        prevOnline.current = isOnline

        if (!isOnline) {
            setPhase('offline')
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start()
        } else {
            setPhase('back-online')
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start()
            timerRef.current = setTimeout(() => {
                Animated.timing(slideAnim, { toValue: -60, duration: 300, useNativeDriver: true }).start(() => {
                    setPhase('hidden')
                })
            }, 2000)
        }

        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [isOnline])

    if (phase === 'hidden') return null

    const isBackOnline = phase === 'back-online'
    return (
        <Animated.View style={[styles.banner, isBackOnline ? styles.bannerOnline : styles.bannerOffline, { transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.bannerText}>
                {isBackOnline
                    ? 'Back online'
                    : pendingCount > 0
                        ? `Offline — ${pendingCount} change${pendingCount > 1 ? 's' : ''} queued`
                        : 'No internet connection'}
            </Text>
        </Animated.View>
    )
}

function AppContent() {
    const [isLoading, setLoading] = useState(true)
    const [isLoggedIn, setLoggedIn] = useState<boolean | null>(null)

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

        return () => {
            mounted = false
            subscription.remove()
        }
    }, [])

    useEffect(() => {
        if (!isLoggedIn) return;

        Notifications.requestPermissionsAsync().catch(() => {})
        registerPushToken()

        let socketRef: any = null;
        let isMounted = true;
        let globalMessageHandler: ((msg: any) => void) | null = null;
        let globalNotificationHandler: ((payload: any) => void) | null = null;

        const setupGlobalSocket = async () => {
            try {
                const uid = await SecureStore.getItemAsync('userId');
                const socket = await getSocket();

                if (!isMounted) return;
                socketRef = socket;

                try {
                    const res = await getConversations();
                    const unreadCount = res.data.filter((conv: any) => conv.sender_id !== uid).length;
                    if (isMounted) unreadSignal.set(unreadCount);
                } catch (apiErr) {
                    console.error("Could not fetch initial unread count:", apiErr);
                }

                globalMessageHandler = (msg: any) => {
                    if (msg.sender_id !== uid && msg.sender_id !== activeChatSignal.get()) {
                        unreadSignal.set(unreadSignal.get() + 1);
                        scheduleLocalNotification(
                            msg.sender_name ?? 'New Message',
                            msg.content,
                            { type: 'message', senderId: msg.sender_id, senderName: msg.sender_name }
                        );
                    }
                };

                globalNotificationHandler = (payload: any) => {
                    scheduleLocalNotification(payload.title, payload.body, payload);
                };

                socket.on('new_message', globalMessageHandler);
                socket.on('notification', globalNotificationHandler);
            } catch (err) {
                console.error("Global socket error:", err);
            }
        };

        setupGlobalSocket();

        return () => {
            isMounted = false;
            if (socketRef) {
                if (globalMessageHandler) socketRef.off('new_message', globalMessageHandler);
                if (globalNotificationHandler) socketRef.off('notification', globalNotificationHandler);
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
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    bannerOffline: {
        backgroundColor: '#B91C1C',
    },
    bannerOnline: {
        backgroundColor: '#166534',
    },
    bannerText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '500',
    },
})