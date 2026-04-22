import analytics from '@react-native-firebase/analytics'
import crashlytics from '@react-native-firebase/crashlytics'

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function logLogin(method: 'email' | 'google') {
  await analytics().logLogin({ method })
}

export async function logScreenView(screenName: string) {
  await analytics().logScreenView({ screen_name: screenName, screen_class: screenName })
}

export async function logTaskCreated(projectId: string) {
  await analytics().logEvent('task_created', { project_id: projectId })
}

export async function logTaskDone(taskId: string) {
  await analytics().logEvent('task_marked_done', { task_id: taskId })
}

export async function logTaskDeletedOffline(taskId: string) {
  await analytics().logEvent('task_deleted_offline', { task_id: taskId })
}

export async function logCertificateUploaded() {
  await analytics().logEvent('certificate_uploaded')
}

export async function logProjectViewed(projectId: string) {
  await analytics().logEvent('project_viewed', { project_id: projectId })
}

// ─── Crashlytics ─────────────────────────────────────────────────────────────

export async function setCrashlyticsUser(userId: string, role: string) {
  await crashlytics().setUserId(userId)
  await crashlytics().setAttribute('role', role)
}

export async function recordError(error: Error, context?: string) {
  if (context) {
    await crashlytics().log(context)
  }
  crashlytics().recordError(error)
}

export async function log(message: string) {
  await crashlytics().log(message)
}
