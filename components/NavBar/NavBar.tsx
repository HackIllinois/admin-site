import { faBars } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import logo from "@/src/assets/logo.svg"
import styles from "./NavBar.module.scss"

// Fix font awesome scaling issue by manually importing css
import { config } from "@fortawesome/fontawesome-svg-core"
import { routes } from "@/util/routes"
config.autoAddCss = false
import "../../node_modules/@fortawesome/fontawesome-svg-core/styles.css"

export default function NavBar() {
    const { pathname } = useLocation()
    const [menuOpen, setMenuOpen] = useState(false)
    return (
        <>
            <div className={styles.button} onClick={() => setMenuOpen(true)}>
                <FontAwesomeIcon icon={faBars} fixedWidth />
                <div className={styles.highlight} />
            </div>

            <div
                className={
                    styles.background + (menuOpen ? " " + styles.open : "")
                }
                onClick={() => setMenuOpen(false)}
            />

            <div
                className={
                    styles.container + (menuOpen ? " " + styles.open : "")
                }
            >
                <div className={styles.menu}>
                    <div className={styles.logo}>
                        <img src={logo} alt="HackIllinois Logo" />
                    </div>
                    {routes.map((route) => (
                        <Link
                            to={route.path}
                            className={
                                pathname === route.path
                                    ? styles.link + " " + styles.active
                                    : styles.link
                            }
                            onClick={() => setMenuOpen(false)}
                            key={route.name}
                        >
                            <FontAwesomeIcon
                                className={styles.icon}
                                icon={route.icon}
                            />
                            <span>&nbsp; {route.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}
