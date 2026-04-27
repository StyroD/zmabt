import { Redirect } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'

export default function Index() {
  const [ready, setReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    const check = async () => {
      const token = await SecureStore.getItemAsync('token')
      setLoggedIn(!!token)
      setReady(true)
    }

    check()
  }, [])

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  return loggedIn
    ? <Redirect href="/tabs/dashboard" />
    : <Redirect href="/auth/login" />
}