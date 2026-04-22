import { Stack, Redirect } from 'expo-router'
import { useState, useEffect } from 'react'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { NetworkProvider, useNetwork } from '@/contexts/NetworkContext'
import { darkColors } from '@/constants/themes'

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

    useEffect(() => {
        const checkToken = async () => {
            //const token = await SecureStore.getItemAsync('token')
            //setLoggedIn(!!token)
            setLoading(false)
        }
        checkToken()
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
        <ThemeProvider>
            <SafeAreaProvider>
                <NetworkProvider>
                    <AppContent />
                </NetworkProvider>
            </SafeAreaProvider>
        </ThemeProvider>
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
