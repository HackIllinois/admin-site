import { AuthService, UserInfo } from "@/generated"
import { handleError } from "@/util/api-client"

export interface FixedUserList {
    admin: UserInfo[]
    staff: UserInfo[]
    attendee: UserInfo[]
    mentor: UserInfo[]
}

async function fetchUsersByRole(
    role: string,
    exclude: string[],
): Promise<UserInfo[]> {
    const excludeParam = exclude.join(",")
    const res = await fetch(
        `/api/auth/dev/users/role/${role}/?exclude=${encodeURIComponent(excludeParam)}`,
    )
    return res.json()
}

export async function loadFixedUserList(): Promise<FixedUserList> {
    const seen: string[] = []

    function track(users: UserInfo[]): UserInfo[] {
        const sliced = users.slice(0, 5)
        sliced.forEach((u) => seen.push(u.userId))
        return sliced
    }

    const admin = track(await fetchUsersByRole("ADMIN", seen))
    const staff = track(await fetchUsersByRole("STAFF", seen))
    const attendee = track(await fetchUsersByRole("ATTENDEE", seen))
    const mentor = track(await fetchUsersByRole("MENTOR", seen))

    return { admin, staff, attendee, mentor }
}
