"use client"

import Loading from "@/components/Loading"
import {
    JobPosting,
    JobPostingCreateRequest,
    JobPostingMongoId,
    JobService,
} from "@/generated"
import { handleError, useRoles } from "@/util/api-client"
import { faPlus, faSync } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useCallback, useEffect, useState } from "react"
import JobPostingModal from "./JobPostingModal"
import styles from "./style.module.scss"

export default function Jobs() {
    const [postings, setPostings] = useState<JobPosting[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [editingPosting, setEditingPosting] =
        useState<Partial<JobPosting> | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const roles = useRoles()
    const isAdmin = roles.includes("ADMIN")

    const fetchPostings = useCallback(async () => {
        setIsLoading(true)
        try {
            const result = await JobService.getJob()
            setPostings(handleError(result))
        } catch (error) {
            console.error("Failed to fetch job postings:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPostings()
    }, [fetchPostings])

    const savePosting = async (
        postingId: JobPostingMongoId | undefined,
        posting: JobPostingCreateRequest,
    ) => {
        setIsSaving(true)
        try {
            const result = postingId
                ? await JobService.putJobById({
                      path: { id: postingId },
                      body: posting,
                  })
                : await JobService.postJob({ body: posting })

            handleError(result)
            setEditingPosting(null)
            await fetchPostings()
        } catch (error) {
            console.error("Failed to save job posting:", error)
        } finally {
            setIsSaving(false)
        }
    }

    const deletePosting = async (postingId: JobPostingMongoId) => {
        if (!window.confirm("Delete this job posting?")) return

        setIsSaving(true)
        try {
            const result = await JobService.deleteJobById({
                path: { id: postingId },
            })
            handleError(result)
            setEditingPosting(null)
            await fetchPostings()
        } catch (error) {
            console.error("Failed to delete job posting:", error)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) return <Loading />

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Job Postings</h1>
                    <p>Manage opportunities shown on the info site.</p>
                </div>
                <div className={styles.headerActions}>
                    <button
                        className={styles.secondaryButton}
                        onClick={fetchPostings}
                        aria-label="Refresh job postings"
                    >
                        <FontAwesomeIcon icon={faSync} />
                        Refresh
                    </button>
                    {isAdmin && (
                        <button
                            className={styles.primaryButton}
                            onClick={() => setEditingPosting({})}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            Add posting
                        </button>
                    )}
                </div>
            </header>

            {!isAdmin && (
                <div className={styles.notice}>
                    Administrator access is required to create, edit, or delete
                    postings.
                </div>
            )}

            {postings.length === 0 ? (
                <div className={styles.empty}>No job postings found.</div>
            ) : (
                <div className={styles.list}>
                    {postings.map((posting) => (
                        <article className={styles.card} key={posting._id}>
                            <div className={styles.logoContainer}>
                                <img
                                    src={posting.logoUrl}
                                    alt={`${posting.companyName} logo`}
                                />
                            </div>
                            <div className={styles.details}>
                                <h2>{posting.jobTitle}</h2>
                                <div className={styles.companyName}>
                                    {posting.companyName}
                                </div>
                                <p>{posting.jobDescription}</p>
                                <a
                                    href={posting.applicationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View application
                                </a>
                            </div>
                            {isAdmin && (
                                <button
                                    className={styles.editButton}
                                    onClick={() => setEditingPosting(posting)}
                                >
                                    Edit
                                </button>
                            )}
                        </article>
                    ))}
                </div>
            )}

            {editingPosting && (
                <JobPostingModal
                    posting={editingPosting}
                    isSaving={isSaving}
                    onClose={() => setEditingPosting(null)}
                    onSave={savePosting}
                    onDelete={deletePosting}
                />
            )}
        </div>
    )
}
