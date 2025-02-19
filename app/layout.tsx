import React from 'react'
import styles from "./layout.module.scss"

export default function Layout({children}: {children: React.ReactNode}) {
	return <html lang="en">
		<body className={styles.body}>
			{children}
		</body>
	</html>
}
