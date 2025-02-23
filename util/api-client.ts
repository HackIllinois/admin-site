import { AuthService, Provider, Role } from "@/generated"
import { client } from "@/generated/client.gen"
import { RequestResult } from "@hey-api/client-fetch"
import { useEffect, useState } from "react"

// If the error provided is an authentication error, authenticate
function handleAuthErrors(error: unknown): boolean {
    if (
        error &&
        typeof error === "object" &&
        "error" in error &&
        typeof error.error === "string"
    ) {
        if (["TokenInvalid", "TokenExpired", "NoToken"].includes(error.error)) {
            authenticate()
            return true
        }
    }

    return false
}

export function setupClient() {
    client.interceptors.request.use((req) => {
        req.headers.set("Authorization", localStorage.getItem("token") || "")
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

export function isAuthenticated() {
    return localStorage.getItem("token")
}

export function authenticate(provider: Provider = "google") {
    // `to` is saved in localStorage so that it can be used in the Auth component later
    localStorage.setItem("to", window.location.href)

    const redirectURI = `${window.location.origin}/auth/`
    const authURL = `${client.getConfig().baseUrl}/auth/login/${provider}?redirect=${redirectURI}`
    window.location.replace(authURL)
}

export function handleError<TData, TError>(
    result: Awaited<RequestResult<TData, TError, false>>,
): TData {
    if (result.error) {
        const authError = handleAuthErrors(result.error)

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
