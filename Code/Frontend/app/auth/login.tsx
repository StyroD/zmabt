import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { useColors } from "@/contexts/ThemeContext"
import { LogBox } from "@/components/Auth/LogBox"
import { useState } from 'react'
import { router } from "expo-router"
import { ScreenWrapper } from '@/components/ScreenWrapper'
import * as SecureStore from 'expo-secure-store'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { AntDesign } from '@expo/vector-icons'
import { login } from "@/api/auth"
import { getUserById } from "@/api/endpoints/users"
import { logLogin, setCrashlyticsUser } from "@/utils/firebase"
import { saveUser } from "@/utils/secureUser"

const GOOGLE_AUTH_URL = "https://blasphemy-wrongness-letdown.ngrok-free.dev/api/auth/google"

export default function Login() {
    const Colors = useColors()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [logError, setLogError] = useState('')
    const [googleLoading, setGoogleLoading] = useState(false)

    const handleLogin = async () => {
        try {
            const data = await login(email, password)
            await SecureStore.setItemAsync('token', data.token) 
            await SecureStore.setItemAsync('userId', data.user.id)

            await saveUser(data.user)
            logLogin('email').catch(() => {})
            setCrashlyticsUser(data.user.id, data.user.role).catch(() => {})
            router.replace('/tabs/dashboard')
        } catch (e: any) {
            if (e.response) {
                if (e.response.status === 401) {
                    setLogError('Invalid email or password')
                } else {
                    setLogError('Something went wrong')
                }
            } else {
                setLogError('Something went wrong')
            }
        }
    }

    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        setLogError('')
        try {
            const redirectUri = 'frontend://auth'
            const result = await WebBrowser.openAuthSessionAsync(GOOGLE_AUTH_URL, redirectUri)

            if (result.type !== 'success') return

            const parsed = Linking.parse(result.url)
            const token = parsed.queryParams?.token as string | undefined
            const userId = parsed.queryParams?.userId as string | undefined

            if (!token || !userId) {
                setLogError('Google login failed — missing credentials')
                return
            }

            await SecureStore.setItemAsync('token', token)
            await SecureStore.setItemAsync('userId', userId)

            const userRes = await getUserById(userId)
            await saveUser(userRes.data)
            logLogin('google').catch(() => {})
            setCrashlyticsUser(userId, userRes.data.role).catch(() => {})
            router.push('/tabs/dashboard')
        } catch {
            setLogError('Google login failed. Try again.')
        } finally {
            setGoogleLoading(false)
        }
    }

    const styles = StyleSheet.create({
        card: {
            backgroundColor: Colors.surface,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 16,
            padding: 24,
            width: '100%',
            gap: 16,
        },
        title: {
            fontSize: 24,
            fontWeight: '600',
            color: Colors.textPrimary,
            marginBottom: 8,
        },
        button: {
            backgroundColor: Colors.primary,
            paddingVertical: 14,
            borderRadius: 8,
            alignItems: 'center',
            width: '100%',
        },
        buttonText: {
            color: Colors.surface,
            fontWeight: '600',
            fontSize: 16,
        },
        dividerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        dividerLine: {
            flex: 1,
            height: 1,
            backgroundColor: Colors.border,
        },
        dividerText: {
            fontSize: 13,
            color: Colors.textSecondary,
        },
        googleButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderWidth: 1,
            borderColor: Colors.border,
            borderRadius: 8,
            paddingVertical: 14,
            backgroundColor: Colors.surface,
        },
        googleButtonText: {
            color: Colors.textPrimary,
            fontWeight: '500',
            fontSize: 15,
        },
        link: {
            color: Colors.primary,
            textAlign: 'center',
            fontSize: 14,
        },
        error: {
            color: Colors.danger,
            fontSize: 14,
            textAlign: 'center',
        },
    })

    return (
        <ScreenWrapper title="Login">
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.card}>
                <Text style={styles.title}>Login</Text>
                <LogBox placeholder="Enter your email" label="Email" value={email} onChangeText={setEmail} />
                <LogBox placeholder="Enter your password" label="Password" value={password} onChangeText={setPassword} secureTextEntry={true} icon="eye-off" />
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <TouchableOpacity onPress={() => router.push('/auth/sign')}>
                        <Text style={styles.link}>Don't have an account?</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                    style={[styles.googleButton, googleLoading && { opacity: 0.6 }]}
                    onPress={handleGoogleLogin}
                    disabled={googleLoading}
                >
                    <AntDesign name="google" size={18} color="#DB4437" />
                    <Text style={styles.googleButtonText}>
                        {googleLoading ? 'Opening Google…' : 'Continue with Google'}
                    </Text>
                </TouchableOpacity>

                {logError ? <Text style={styles.error}>{logError}</Text> : null}
            </View>
            </ScrollView>
        </ScreenWrapper>
    )
}
