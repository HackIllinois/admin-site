import type { ApplicantTag } from "@/generated"
import { tagLabel, tagStyle } from "@/util/applicant-tags"
import styles from "./style.module.scss"

export function TagPill({
    tag,
    dot = false,
}: {
    tag: ApplicantTag
    dot?: boolean
}) {
    const s = tagStyle(tag)
    return (
        <span
            className={styles.pill}
            style={{
                background: s.background,
                color: s.color,
                borderColor: s.border,
            }}
        >
            {dot ? <span className={styles.pillDot} /> : null}
            {tagLabel(tag)}
        </span>
    )
}
