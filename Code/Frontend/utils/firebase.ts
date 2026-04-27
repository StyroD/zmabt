let analytics: any = null
let crashlytics: any = null

try {
  analytics = require('@react-native-firebase/analytics').default
} catch {}
try {
  crashlytics = require('@react-native-firebase/crashlytics').default
} catch {}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function logLogin(method: 'email' | 'google') {
  try { await analytics?.().logLogin({ method }) } catch {}
}

export async function logScreenView(screenName: string) {
  try { await analytics?.().logScreenView({ screen_name: screenName, screen_class: screenName }) } catch {}
}

export async function logTaskCreated(projectId: string) {
  try { await analytics?.().logEvent('task_created', { project_id: projectId }) } catch {}
}

export async function logTaskDone(taskId: string) {
  try { await analytics?.().logEvent('task_marked_done', { task_id: taskId }) } catch {}
}

export async function logTaskDeletedOffline(taskId: string) {
  try { await analytics?.().logEvent('task_deleted_offline', { task_id: taskId }) } catch {}
}

export async function logCertificateUploaded() {
  try { await analytics?.().logEvent('certificate_uploaded') } catch {}
}

export async function logProjectViewed(projectId: string) {
  try { await analytics?.().logEvent('project_viewed', { project_id: projectId }) } catch {}
}

// ─── Crashlytics ─────────────────────────────────────────────────────────────

export async function setCrashlyticsUser(userId: string, role: string) {
  try {
    await crashlytics?.().setUserId(userId)
    await crashlytics?.().setAttribute('role', role)
  } catch {}
}

export async function recordError(error: Error, context?: string) {
  try {
    if (context) await crashlytics?.().log(context)
    crashlytics?.().recordError(error)
  } catch {}
}

export async function log(message: string) {
  try { await crashlytics?.().log(message) } catch {}
}
