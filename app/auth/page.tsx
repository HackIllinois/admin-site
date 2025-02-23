"use client"
import { getRoles } from "@/util/api-client"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"

function AuthComponent() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const to = localStorage.getItem("to") || window.location.origin
        localStorage.removeItem("to")
        localStorage.setItem("token", searchParams.get("token") || "")

        getRoles().then((roles) => {
            if (!roles.includes("STAFF")) {
                // If non-staff, remove token & rickroll
                localStorage.removeItem("token")
                window.location.href = "https://youtu.be/dQw4w9WgXcQ"
                return
            }

            // Otherwise, redirect back since we successfully authenticated
            window.location.replace(to)
        })
    })
    return <p>Authenticating...</p>
}

export default function Auth() {
    return (
        <Suspense>
            <AuthComponent />
        </Suspense>
    )
}
