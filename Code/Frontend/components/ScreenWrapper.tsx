import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useColors } from '@/contexts/ThemeContext'
import { BackArrow } from '@/components/BackArrow'
import { router } from 'expo-router'

type Props = {
  title: string
  children: React.ReactNode
  backRoute?: string
  rightElement?: React.ReactNode
}

export function ScreenWrapper({ title, children, backRoute, rightElement }: Props) {
  const Colors = useColors()
  const insets = useSafeAreaInsets()
  const styles = StyleSheet.create({
    container: {
      backgroundColor: Colors.background,
      flex: 1,
      padding: 16,
      paddingTop: Math.max(insets.top, 16) + 8,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    placeholder: {
      width: 40,
    },
    title: {
      fontSize: 20,
      fontWeight: '500',
      color: Colors.textPrimary,
    },
    divider: {
      height: 1,
      backgroundColor: Colors.border,
      marginTop: 8,
    },
  })

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <View style={styles.header}>
        <BackArrow onBackButton={() => backRoute ? router.push(backRoute as any) : router.back()} />
        <Text style={styles.title}>{title}</Text>
        <View style={styles.placeholder}>
          {rightElement}
        </View>
      </View>
      <View style={styles.divider} />
      {children}
    </KeyboardAvoidingView>
  )
}
