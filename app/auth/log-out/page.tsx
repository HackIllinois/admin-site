"use client"

import { useEffect } from "react"

export default function LogOutComponent() {
    useEffect(() => {
        localStorage.removeItem("token")
        localStorage.removeItem("to")
        window.location.replace("/auth")
    })
    return <p>Logging out...</p>
}
