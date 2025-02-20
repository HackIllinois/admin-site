"use client"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

export default function Auth() {
    const searchParams = useSearchParams()

    useEffect(() => {
        const to = localStorage.getItem("to") || window.location.origin
        localStorage.removeItem("to")
        localStorage.setItem("token", searchParams.get("token") || "")
        window.location.replace(to)
    })
    return <p>Authenticating...</p>
}
