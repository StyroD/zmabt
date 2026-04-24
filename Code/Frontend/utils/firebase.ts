// Firebase Analytics + Crashlytics stubs
// @react-native-firebase requires a custom dev build — these are no-ops for Expo Go

export async function logLogin(_method: 'email' | 'google') {}
export async function logScreenView(_screenName: string) {}
export async function logTaskCreated(_projectId: string) {}
export async function logTaskDone(_taskId: string) {}
export async function logTaskDeletedOffline(_taskId: string) {}
export async function logCertificateUploaded() {}
export async function logProjectViewed(_projectId: string) {}
export async function setCrashlyticsUser(_userId: string, _role: string) {}
export async function recordError(_error: Error, _context?: string) {}
export async function log(_message: string) {}
