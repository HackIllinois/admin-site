import { NewsletterSubscription } from "@/generated"
import styles from "./NewsletterCard.module.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEnvelope, faUsers } from "@fortawesome/free-solid-svg-icons"

interface NewsletterCardProps {
    newsletter: NewsletterSubscription
    onClick: () => void
}

export default function NewsletterCard({
    newsletter,
    onClick,
}: NewsletterCardProps) {
    const subscriberCount = newsletter.subscribers.length

    return (
        <div className={styles.container}>
            <button className={styles.card} onClick={onClick}>
                <div className={styles.icon}>
                    <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div className={styles.content}>
                    <div className={styles.title}>
                        {newsletter.newsletterId}
                    </div>
                    <div className={styles.subtitle}>
                        <FontAwesomeIcon icon={faUsers} />
                        <span>
                            {subscriberCount} subscriber
                            {subscriberCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
            </button>
        </div>
    )
}
