import { Stack, Redirect } from 'expo-router'
import { useState, useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { Colors } from '@/constants/color'

export default function RootLayout() {
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
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        )
    }

    if (isLoggedIn) {
        return <Redirect href="/tabs/dashboard" />
    }

    return <Stack screenOptions={{ headerShown: false }} />
}