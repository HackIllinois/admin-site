import styles from "./styles.module.scss"

export default function Unauthorized() {
    return (
        <div className={styles.container}>
            <h2>Unauthorized</h2>
            <p>You don&apos;t have permission to view this page</p>
        </div>
    )
}
