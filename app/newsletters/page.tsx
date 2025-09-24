"use client"
import React, { useCallback, useEffect, useState } from "react"
import { NewsletterService, NewsletterSubscription } from "@/generated"
import { handleError } from "@/util/api-client"
import Loading from "@/components/Loading"
import NewsletterCard from "./NewsletterCard"
import NewsletterModal from "./NewsletterModal"
import styles from "./style.module.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSync } from "@fortawesome/free-solid-svg-icons"

export default function Newsletters() {
    const [isLoading, setIsLoading] = useState(true)
    const [newsletters, setNewsletters] = useState<NewsletterSubscription[]>([])
    const [selectedNewsletter, setSelectedNewsletter] =
        useState<NewsletterSubscription | null>(null)

    const fetchNewsletters = useCallback(async () => {
        setIsLoading(true)
        try {
            const result = await NewsletterService.getNewsletter()
            const data = handleError(result)
            setNewsletters(data)
        } catch (error) {
            console.error("Failed to fetch newsletters:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchNewsletters()
    }, [fetchNewsletters])

    if (isLoading) {
        return <Loading />
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Newsletter Subscriptions</h1>
                <FontAwesomeIcon
                    className={styles.refresh}
                    icon={faSync}
                    onClick={fetchNewsletters}
                />
            </div>

            <div className={styles.grid}>
                {newsletters.length === 0 ? (
                    <div className={styles.empty}>No newsletters found</div>
                ) : (
                    newsletters.map((newsletter) => (
                        <NewsletterCard
                            key={newsletter.newsletterId}
                            newsletter={newsletter}
                            onClick={() => setSelectedNewsletter(newsletter)}
                        />
                    ))
                )}
            </div>

            {selectedNewsletter && (
                <NewsletterModal
                    newsletter={selectedNewsletter}
                    onClose={() => setSelectedNewsletter(null)}
                />
            )}
        </div>
    )
}
