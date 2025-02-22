"use client"
import { AuthService } from "@/generated"
import { useRoles } from "@/util/api-client"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function Auth() {
    const searchParams = useSearchParams()
    const roles = useRoles()

    useEffect(() => {
        const to = localStorage.getItem("to") || window.location.origin
        localStorage.removeItem("to")
        localStorage.setItem("token", searchParams.get("token") || "")

        if (!roles.includes("STAFF")) {
            // If non-staff, rickroll
            window.location.href = "https://youtu.be/dQw4w9WgXcQ"
            return
        }

        // Otherwise, redirect back since we successfully authenticated
        window.location.replace(to)
    })
    return <p>Authenticating...</p>
}
