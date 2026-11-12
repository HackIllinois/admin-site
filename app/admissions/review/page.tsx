"use client"

import { Suspense } from "react"
import { ReviewPage } from "./ReviewPage"

export default function Page() {
    return (
        <Suspense fallback={null}>
            <ReviewPage />
        </Suspense>
    )
}
