"use client"
import React, { useCallback, useEffect, useState } from "react"
import { NewsletterService, NewsletterSubscription } from "@/generated"
import { handleError } from "@/util/api-client"
import Loading from "@/components/Loading"
import NewsletterModal from "./NewsletterModal"
import styles from "./style.module.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSync } from "@fortawesome/free-solid-svg-icons"
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PeopleIcon from '@mui/icons-material/People';
import { Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';

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

            <div>
                {newsletters.length === 0 ? (
                    <div className={styles.empty}>No newsletters found</div>
                ) : (

                    <List sx={{ width: '100%', maxWidth: 1000, bgcolor: 'background.paper', display:"flex", flexDirection: 'column', gap: 1 }}>
                        {newsletters.map((newsletter) => (
                                <ListItem key={newsletter.newsletterId} 
                                sx={{border: 1, borderColor: 'divider', borderRadius: 1, fontFamily: 'Montserrat'}}
                                    secondaryAction={
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 3}}>
                                            <Box sx={{display: { xs: 'none', sm: 'flex' } ,  alignItems: "center" }}>
                                                {newsletter.subscribers.length} Subscribers &nbsp;
                                                <PeopleIcon />
                                            </Box>
                                            <IconButton edge="end" onClick={() => setSelectedNewsletter(newsletter)}>
                                                <MoreVertIcon />
                                            </IconButton>
                                        </Box>
                                    }
                                >
                                    <ListItemText primary={newsletter.newsletterId} slotProps={{
                                        primary: {
                                            fontFamily: "Montserrat"
                                        }
                                    }}/>
                                </ListItem>
                        ))}
                </List>

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
