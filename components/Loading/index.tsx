import { Skeleton } from "@mui/material"
import styles from "./style.module.scss"

export default function Loading() {
    return (
        <div className={styles.loading}>
            <Skeleton 
                variant="rectangular" 
                width="100%" 
                height="10%" 
                sx={{borderRadius: '10px'}}
            />
            <Skeleton 
                variant="rectangular" 
                width="100%" 
                height="85%" 
                sx={{borderRadius: '10px'}}
            />
        </div>
    )
}
