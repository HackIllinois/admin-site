import styles from "./not-found.module.scss"

const NotFound = () => {
    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>404 Not Found</h2>
            <p>Try one of the links on the left.</p>
        </div>
    )
}

export default NotFound
