export function resumeMessage(status: number | undefined): string {
    if (status === 403) return "You don't have access to this resume"
    if (status === 404) return "No resume uploaded"
    return "Could not load the resume"
}
