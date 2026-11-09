import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import styles from "./NavBar.module.scss"

// Fix font awesome scaling issue by manually importing css
import { config } from "@fortawesome/fontawesome-svg-core"
import { groupRoutes, isRouteActive } from "@/util/nav-groups"
import { routes } from "@/util/routes"
config.autoAddCss = false
import "../../node_modules/@fortawesome/fontawesome-svg-core/styles.css"

const groups = groupRoutes(routes)

export default function NavBar({
    open,
    onClose,
}: {
    open: boolean
    onClose: () => void
}) {
    const path = usePathname() || ""

    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open, onClose])

    return (
        <>
            <div
                className={styles.background + (open ? " " + styles.open : "")}
                onClick={onClose}
            />
            <nav
                id="site-navigation"
                aria-label="Sections"
                className={styles.container + (open ? " " + styles.open : "")}
            >
                {groups.map((group) => (
                    <div className={styles.group} key={group.id}>
                        <span className={styles.groupLabel}>{group.label}</span>
                        {group.routes.map((route) => {
                            const active = isRouteActive(path, route.path)
                            return (
                                <Link
                                    href={route.path}
                                    className={
                                        active
                                            ? styles.link + " " + styles.active
                                            : styles.link
                                    }
                                    aria-current={active ? "page" : undefined}
                                    onClick={onClose}
                                    key={route.name}
                                    prefetch={false}
                                >
                                    <FontAwesomeIcon
                                        className={styles.icon}
                                        icon={route.icon}
                                        fixedWidth
                                    />
                                    <span>{route.name}</span>
                                </Link>
                            )
                        })}
                    </div>
                ))}
            </nav>
        </>
    )
}
