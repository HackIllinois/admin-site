import { Provider } from "@/generated"
import { client } from "@/generated/client.gen"

export function setupClient() {
    client.interceptors.request.use((req) => {
        req.headers.set("Authorization", localStorage.getItem("token") || "")
        req.headers.set("Content-Type", "application/json")

        return req
    })

    client.interceptors.response.use(async (res) => {
        if (!res.ok) {
            const error = await res.clone().json()

            if (
                ["TokenInvalid", "TokenExpired", "NoToken"].includes(
                    error.error,
                )
            ) {
                authenticate()
            }
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
