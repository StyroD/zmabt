import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { recordError } from '@/utils/firebase'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    recordError(error, `componentStack: ${info.componentStack ?? ''}`)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  message: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 15,
  },
})
