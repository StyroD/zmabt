import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import {useEffect, useState } from "react";
import { View } from "react-native";
import { ActivityIndicator } from 'react-native';
import {Colors} from "@/constants/color";

export default function RootLayout() {
  const [isLoading, setLoading] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
      setLoading(false)
  }, [])
  if (isLoading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
        </View>
    )

  }
  return <Stack screenOptions={{ headerShown: false }} />;
}