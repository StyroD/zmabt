import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Colors } from '../../constants/color'
import { router } from 'expo-router'
import { BackArrow } from '@/components/BackArrow'
import { ProjectBox } from '@/components/Projects/ProjectBox'
import Entypo from '@expo/vector-icons/Entypo';


export default function Projects() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackArrow onBackButton={() => router.push('/tabs/dashboard')} />
        <Text style={styles.title}>Projects</Text>
        <View style={styles.placeholder} />
      </View>
      <View style={styles.divider} />



      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.addButton} onPress={() => { }}>
          <Entypo name="plus" size={20} color={Colors.primary} />
          <Text style={styles.addText}>New project</Text>
        </TouchableOpacity>

        <ProjectBox onProjectDetail={() => router.push('/tabs/projectDetail')} />
        <ProjectBox onProjectDetail={() => router.push('/tabs/projectDetail')} />
        <ProjectBox onProjectDetail={() => router.push('/tabs/projectDetail')} />
        <ProjectBox onProjectDetail={() => router.push('/tabs/projectDetail')} />
        <ProjectBox onProjectDetail={() => router.push('/tabs/projectDetail')} />
        <ProjectBox onProjectDetail={() => router.push('/tabs/projectDetail')} />
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 3,
    marginTop: 20
  },
  addText: {
    fontSize: 13,
    color: Colors.primary,
  }
})