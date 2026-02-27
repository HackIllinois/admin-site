"use client"
import React, { useCallback, useEffect, useState } from "react"
import { NewsletterService, NewsletterSubscription } from "@/generated"
import { handleError } from "@/util/api-client"
import Loading from "@/components/Loading"
import NewsletterModal from "./NewsletterModal"
import styles from "./style.module.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSync } from "@fortawesome/free-solid-svg-icons"
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, IconButton } from '@mui/material';
import {
    DataGrid,
    GridActionsCellItem,
    GridColDef,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarFilterButton,
} from "@mui/x-data-grid"

type NewsletterRow = NewsletterSubscription & {
    id: string
    subscribersCount: number
}

function GridToolbar({ refresh }: { refresh: () => void }) {
    return (
        <GridToolbarContainer
            sx={{ fontFamily: "Montserrat, Segoe UI, Roboto, sans-serif" }}
        >
            <GridToolbarColumnsButton
                slotProps={{
                    button: {
                        color: "inherit",
                    },
                }}
            />
            <GridToolbarFilterButton
                slotProps={{
                    button: {
                        color: "inherit",
                    },
                }}
            />
            <IconButton
                size="small"
                sx={{ marginLeft: "0.5rem" }}
                onClick={refresh}
                aria-label="Refresh newsletters"
            >
                <FontAwesomeIcon icon={faSync} />
            </IconButton>
        </GridToolbarContainer>
    )
}

export default function Newsletters() {
    const [isLoading, setIsLoading] = useState(true)
    const [newsletters, setNewsletters] = useState<NewsletterRow[]>([])
    const [selectedNewsletter, setSelectedNewsletter] =
        useState<NewsletterSubscription | null>(null)

    const fetchNewsletters = useCallback(async () => {
        setIsLoading(true)
        try {
            const result = await NewsletterService.getNewsletter()
            const data = handleError(result)
            setNewsletters(
                data.map((newsletter) => ({
                    ...newsletter,
                    id: newsletter.newsletterId,
                    subscribersCount: newsletter.subscribers.length,
                })),
            )
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

    const columns: GridColDef<NewsletterRow>[] = [
        {
            field: "newsletterId",
            headerName: "Newsletter",
            minWidth: 320,
            flex: 1,
        },
        {
            field: "subscribersCount",
            headerName: "Subscribers",
            minWidth: 160,
            type: "number",
        },
        {
            field: "actions",
            type: "actions",
            headerName: "",
            width: 90,
            getActions: ({ row }) => [
                <GridActionsCellItem
                    key={`${row.id}-view`}
                    icon={<MoreVertIcon />}
                    label="View subscribers"
                    onClick={() => setSelectedNewsletter(row)}
                    color="inherit"
                />,
            ],
        },
    ]

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
                    <Box sx={{ width: "100%" }}>
                        <DataGrid
                            autoHeight
                            rows={newsletters}
                            columns={columns}
                            sx={{ fontFamily: "Montserrat" }}
                            slots={{
                                toolbar: () => (
                                    <GridToolbar refresh={fetchNewsletters} />
                                ),
                            }}
                        />
                    </Box>
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
