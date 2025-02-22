"use client"
import React from "react"

import animationData from "@/public/animations/car.json"
import styles from "./style.module.scss"
import dynamic from "next/dynamic"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

export default function Loading() {
    const options = { animationData, autoplay: true, loop: true }
    const style = { marginRight: "15%", width: "80%", height: "80%" }

    return (
        <div className={styles.loading}>
            <Lottie id="car" {...options} style={style} />
            <h1>Loading...</h1>
        </div>
    )
}
