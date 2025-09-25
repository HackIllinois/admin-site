"use client"
import { getRoles } from "@/util/api-client"
import { BASENAME } from "@/util/basename"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"

function AuthComponent() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const to = localStorage.getItem("to") || window.location.origin
        const checkedInEvent = localStorage.getItem('checkedInEvent');

        localStorage.setItem("token", searchParams.get("token") || "")

        getRoles().then((roles) => {
            if (!roles.includes("STAFF")) {
                // If non-staff, remove token & rickroll
                localStorage.removeItem("token")
                window.location.href = "https://youtu.be/dQw4w9WgXcQ"
                return
            }

            if (checkedInEvent) {
                window.location.replace(`${BASENAME}/events/${checkedInEvent}/checkin`);
                localStorage.removeItem("to")
                localStorage.removeItem('checkedInEvent');
            } else {
                // Otherwise, redirect back since we successfully authenticated
                window.location.replace(to)
                localStorage.removeItem("to")
            }
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
