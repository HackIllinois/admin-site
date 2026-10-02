"use client"

import { faChevronDown } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Collapse } from "@mui/material"
import { ReactNode, useState } from "react"
import styles from "./styles.module.scss"

interface CollapsibleSectionProps {
    title: string
    children: ReactNode
    defaultOpen?: boolean
}

/**
 * Section with a clickable header that expands or collapses its content.
 */
export default function CollapsibleSection({
    title,
    children,
    defaultOpen = false,
}: CollapsibleSectionProps) {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <div className={styles.collapsible}>
            <button
                type="button"
                className={styles.collapsibleHeader}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
            >
                <span>{title}</span>
                <FontAwesomeIcon
                    icon={faChevronDown}
                    className={styles.chevron + (open ? " " + styles.open : "")}
                />
            </button>
            <Collapse in={open} unmountOnExit>
                {children}
            </Collapse>
        </div>
    )
}
