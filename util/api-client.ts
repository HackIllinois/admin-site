import { AuthService, Provider, Role } from "@/generated"
import { client } from "@/generated/client.gen"
import { RequestResult } from "@hey-api/client-fetch"
import { useEffect, useState } from "react"

// If the error provided is an authentication error, authenticate
async function handleAuthErrors(error: unknown): Promise<boolean> {
    if (
        error &&
        typeof error === "object" &&
        "error" in error &&
        typeof error.error === "string"
    ) {
        if (["TokenInvalid", "TokenExpired", "NoToken"].includes(error.error)) {
            await authenticate()
            return true
        }
    }

    return false
}

// Setups up the hey api client by adding interceptors to handle auth & errors
export function setupClient() {
    client.interceptors.request.use((req) => {
        req.headers.set("Content-Type", "application/json")

        return req
    })

    client.interceptors.response.use(async (res) => {
        if (!res.ok) {
            const error = await res.clone().json()

            handleAuthErrors(error)
        }
        return res
    })
}

// Redirects to authentication url
export async function authenticate(provider: Provider = "google") {
    const { data, error } = await AuthService.getAuthByProvider({
        path: { provider },
        query: { redirect: window.location.toString() },
    })

    if (error) {
        let message = `${error}`
        if (typeof error == "object" && "message" in error) {
            message = `${error.message}`
        }

        alert(message)
        return
    }

    window.location.replace(data.url)
}

// Handles errors with alert dialog, returns data if no error
export async function handleError<TData, TError>(
    result: Awaited<RequestResult<TData, TError, false>>,
): Promise<TData> {
    if (result.error) {
        const authError = await handleAuthErrors(result.error)

        let message = `${result.error}`
        if (typeof result.error == "object" && "message" in result.error) {
            message = `${result.error.message}`
        }

        // Don't pop up alerts for auth errors
        if (!authError) {
            alert(message)
        }
        throw new Error(message)
    }

    return result.data!
}

// Gets the roles of the currently authenticated user
// Should use useRoles over this - use getRoles only when token has just changed
export function getRoles() {
    return AuthService.getAuthRoles().then((result) => {
        if (result.error) {
            // Forbidden error is given for google accounts that aren't hack
            const forbiddenError =
                typeof result.error === "object" &&
                "error" in result.error &&
                "Forbidden"

            if (!forbiddenError) {
                // Otherwise, it's a legit error we need to handle
                handleError(result)
            }

            return []
        } else {
            return result.data!.roles
        }
    })
}

// Hook to fetch roles
export function useRoles() {
    const [roles, setRoles] = useState<Role[]>([])

    useEffect(() => {
        const fetchRoles = async () => {
            setRoles(await getRoles())
        }
        fetchRoles()
    }, [])

    return roles
}
