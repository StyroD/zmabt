import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Colors } from '../../constants/color'
import { router } from 'expo-router'
import { BackArrow } from '@/components/BackArrow'
import { ProjectBox } from '@/components/Projects/ProjectBox'
import Entypo from '@expo/vector-icons/Entypo';
import { useEffect, useState } from 'react'
import { getProjects } from '@/api/endpoints/projects'
import { ActivityIndicator } from 'react-native'
import { ScreenWrapper } from '@/components/ScreenWrapper'


export default function Projects() {

  const [currentProject, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    getProjects()
      .then(res => {
        setProject(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (!currentProject) {
    return (
      <View style={styles.center}>
        <Text style={{ color: Colors.textSecondary }}>No project found</Text>
      </View>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }


  return (
    <ScreenWrapper title='Project list' backRoute='/tabs/dashboard'>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.addButton} onPress={() => { }}>
            <Entypo name="plus" size={20} color={Colors.primary} />
            <Text style={styles.addText}>New project</Text>
          </TouchableOpacity>

          {currentProject.map((project: any) => (
            <ProjectBox
              key={project.id}
              title={project.title}
              status={project.status}
              deadline={formatDate(project.deadline)}
              onProjectDetail={() => router.push(`/tabs/projectDetail_manager?id=${project.id}`)}
            />
          ))}
        </ScrollView>


      </View>
    </ScreenWrapper>

  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
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
    marginTop: 5
  },
  addText: {
    fontSize: 13,
    color: Colors.primary,
  }
})