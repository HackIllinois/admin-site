"use client"
import { AuthService } from "@/generated"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function Auth() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const to = localStorage.getItem("to") || window.location.origin
        localStorage.removeItem("to")
        localStorage.setItem("token", searchParams.get("token") || "")

        AuthService.getAuthRoles().then((result) => {
            // If non-staff, rickroll
            if (result.error) {
                window.location.href = "https://youtu.be/dQw4w9WgXcQ"
                return
            }

            // Otherwise, redirect back since we successfully authenticated
            window.location.replace(to)
        })
    })
    return <p>Authenticating...</p>
}
