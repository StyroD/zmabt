import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { Colors } from '../../constants/color'
import { ProfileBox } from '../../components/Dashboard/ProfileBox'
import { InfoBox } from '../../components/Dashboard/InfoBox'
import { getUsers } from '@/api/endpoints/users'
import { router } from 'expo-router'
import { BackArrow } from '@/components/BackArrow'

export default function Projects() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackArrow onBackButton={() => router.push('/tabs/dashboard')}/>
        <Text style={styles.title}>Projects</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.divider} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeholder: {
    width: 70, // same width as BackArrow box
  },
  title: {
    fontSize: 30,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 8,
  }
})