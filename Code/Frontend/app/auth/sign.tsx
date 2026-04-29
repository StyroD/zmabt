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
import { register } from "@/api/auth"
import { getUserById } from "@/api/endpoints/users"
import { logLogin, setCrashlyticsUser } from "@/utils/firebase"
import { saveUser } from "@/utils/secureUser"

const GOOGLE_AUTH_URL = 'https://blasphemy-wrongness-letdown.ngrok-free.dev/api/auth/google'

export default function Sign() {
    const Colors = useColors()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [logError, setLogError] = useState('')
    const [googleLoading, setGoogleLoading] = useState(false)
    const [username, setUsername] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')


    const handleGoogleSignUp = async () => {
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
                setLogError('Google sign up failed — missing credentials')
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
            setLogError('Google sign up failed. Try again.')
        } finally {
            setGoogleLoading(false)
        }
    }

    const handleSignUp = async () => {
        try {
            if (password !== confirmPassword) {
                setLogError("Passwords did not match.")
                return
            }
            if (password === "") {
                setLogError("Password cannot be empty.")
                return
            }
            const data = await register(username, email, password, 'worker', firstName, lastName)
            await SecureStore.setItemAsync('token', data.token)
            await SecureStore.setItemAsync('userId', data.user.id)
            await saveUser(data.user)
            router.push('/tabs/dashboard')
        } catch (e) {
            console.log(e)
            setLogError("Registration failed. Try again.")
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
    })

    return (
        <ScreenWrapper title="SignUp">
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.card}>
                <Text style={styles.title}>Sign Up</Text>
                <LogBox placeholder="Enter your first name" label="First name" value={firstName} onChangeText={setFirstName} />
                <LogBox placeholder="Enter your last name" label="Last name" value={lastName} onChangeText={setLastName} />
                <LogBox placeholder="Enter your username" label="Username" value={username} onChangeText={(text) => setUsername(text)} />
                <LogBox placeholder="Enter your email" label="Email" value={email} onChangeText={(text) => setEmail(text)} />
                <LogBox placeholder="Enter your password" label="Password" value={password} onChangeText={(text) => setPassword(text)} secureTextEntry={true} icon="eye-off" />
                <LogBox placeholder="Confirm your password" label="Confirm Password" value={confirmPassword} onChangeText={(text) => setConfirmPassword(text)} secureTextEntry={true} icon="eye-off" />
                <View style={{ flexDirection: 'row', gap: 16 }}>
                    <TouchableOpacity onPress={() => { router.push('/auth/login') }}>
                        <Text style={styles.link}>Already have an account?</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                    style={[styles.googleButton, googleLoading && { opacity: 0.6 }]}
                    onPress={handleGoogleSignUp}
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
