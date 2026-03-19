import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Colors } from '../../constants/color'
import { router } from 'expo-router'
import { BackArrow } from '@/components/BackArrow'
import { Box } from '@/components/ProjectDetailManager/Box'

export default function ProjectDetail() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackArrow onBackButton={() => router.push('/tabs/projectsList')} />
        <Text style={styles.title}>Project Detail</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.divider} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.projectTitle}>Project title</Text>
        <View style={styles.infoScreen}>
          <Box width='small' text="test"></Box>
          <Box width='small' text="test"></Box>
        </View>
      </ScrollView>


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
    width: 40,
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
  },
  projectTitle: {
    padding: 10,
    fontSize: 25,
    color: Colors.textPrimary,
    fontWeight: '300'
  },
  infoScreen: {
    flexDirection: 'row',
    gap: 12
  }
})