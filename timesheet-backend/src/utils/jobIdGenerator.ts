export function generateJobId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `JOB${timestamp}${random}`;
}

export function generateCombinedId(clientId: string, projectId: string, jobId: string): string {
  return `${clientId}-${projectId}-${jobId}`;
}
