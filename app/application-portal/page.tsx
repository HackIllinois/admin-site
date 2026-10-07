"use client"

import { RegistrationApplicationSubmittedRequest } from "@/generated"
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    Divider,
    Rating,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from "@mui/material"
import { ArrowBack, ArrowForward } from "@mui/icons-material"
import { useMemo, useState } from "react"
import styles from "./styles.module.scss"

const mockApplication: RegistrationApplicationSubmittedRequest = {
    firstName: "Jordan",
    lastName: "Lee",
    preferredName: "Jordan",
    age: "21",
    email: "jordan.lee@example.com",
    phoneNumber: "(217) 555-0142",
    gender: "Non-binary",
    race: ["Asian"],
    country: "United States",
    state: "Illinois",
    school: "University of Illinois Urbana-Champaign",
    education: "Undergraduate",
    graduate: "2027",
    major: "Computer Science",
    underrepresented: "No",
    hackathonsParticipated: "2",
    application1:
        "I want to build tools that make technical education more accessible and meet other students who care about that goal.",
    application2:
        "I have worked on a campus navigation app and learned how important it is to test ideas with the people who use them.",
    application3:
        "I would contribute by helping my team stay organized, asking thoughtful questions, and sharing what I know.",
    applicationOptional:
        "I am especially interested in projects involving education, accessibility, and civic technology.",
    pro: false,
    attribution: ["Friend", "Social media"],
    eventInterest: ["Workshops", "Social events", "Mentorship"],
    requestTravelReimbursement: true,
    mlhNewsletter: false,
}

const mockApplications: RegistrationApplicationSubmittedRequest[] = [
    mockApplication,
    {
        ...mockApplication,
        firstName: "Maya",
        lastName: "Patel",
        preferredName: "Maya",
        email: "maya.patel@example.com",
        school: "Purdue University",
        major: "Electrical Engineering",
        graduate: "2026",
        application1:
            "I want to attend HackIllinois to collaborate with people from different backgrounds and turn an idea into something useful.",
        application2:
            "I built a low-cost air quality monitor with a student group and learned how to balance technical decisions with a limited budget.",
        application3:
            "I bring curiosity, clear communication, and a willingness to help wherever the team needs me.",
        applicationOptional: "",
    },
]

type RatingState = number | null

async function saveApplicationRating(
    _application: RegistrationApplicationSubmittedRequest,
    _rating: number,
) {
    // Replace this mock with Aditya's reviewer endpoint once its request shape is available.
    await Promise.resolve()
}

function Answer({ label, value }: { label: string; value: string }) {
    return (
        <Box className={styles.answer}>
            <Typography className={styles.label}>{label}</Typography>
            <Typography>{value || "Not provided"}</Typography>
        </Box>
    )
}

export default function ApplicationPortal() {
    const [applicationIndex, setApplicationIndex] = useState(0)
    const [ratings, setRatings] = useState<Record<number, number>>({})
    const [savedRatings, setSavedRatings] = useState<Record<number, number>>({})
    const [completedApplications, setCompletedApplications] = useState<
        Set<number>
    >(new Set())
    const [searchQuery, setSearchQuery] = useState("")
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const filteredApplications = useMemo(() => {
        const query = searchQuery.trim().toLowerCase()

        return mockApplications
            .map((application, index) => ({ application, index }))
            .filter(({ index }) => !completedApplications.has(index))
            .filter(({ application }) => {
                if (!query) return true

                return [
                    application.firstName,
                    application.lastName,
                    application.preferredName,
                    application.email,
                    application.school,
                    application.major,
                    application.application1,
                    application.application2,
                    application.application3,
                    application.applicationOptional,
                    ...application.eventInterest,
                    ...application.attribution,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase()
                    .includes(query)
            })
    }, [completedApplications, searchQuery])

    const selectedApplication = filteredApplications[applicationIndex]
    const application = selectedApplication?.application
    const applicationId = selectedApplication?.index
    const rating: RatingState =
        applicationId === undefined ? null : (ratings[applicationId] ?? null)
    const savedRating: RatingState =
        applicationId === undefined
            ? null
            : (savedRatings[applicationId] ?? null)

    const submitRating = async () => {
        if (!rating || !application || applicationId === undefined) return

        setSaving(true)
        try {
            await saveApplicationRating(application, rating)
            setSavedRatings((previous) => ({
                ...previous,
                [applicationId]: rating,
            }))
        } catch {
            setError("Could not save this rating. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const moveToApplication = (index: number) => {
        setApplicationIndex(index)
        setError(null)
    }

    const markApplicationDone = () => {
        if (applicationId === undefined) return

        setCompletedApplications((previous) => {
            const next = new Set(previous)
            next.add(applicationId)
            return next
        })
        setApplicationIndex((current) =>
            Math.min(current, Math.max(filteredApplications.length - 2, 0)),
        )
    }

    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        setApplicationIndex(0)
    }

    return (
        <Box className={styles.page}>
            <Box className={styles.header}>
                <Box>
                    <Typography variant="h4" component="h1">
                        Application Portal
                    </Typography>
                    <Typography color="text.secondary">
                        Review submitted applications and record your score.
                    </Typography>
                </Box>
                <Chip
                    label={`${filteredApplications.length} to review`}
                    color="success"
                    variant="outlined"
                />
            </Box>

            <Box className={styles.searchBar}>
                <TextField
                    label="Search applicants"
                    placeholder="Name, school, major, keywords, or response text"
                    value={searchQuery}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    fullWidth
                    size="small"
                />
            </Box>

            {!application ? (
                <Card className={styles.emptyState}>
                    <Typography variant="h5">
                        {searchQuery
                            ? "No applications match your search"
                            : "All applications are complete"}
                    </Typography>
                    <Typography color="text.secondary">
                        {searchQuery
                            ? "Try a different name, school, major, or keyword."
                            : "There are no applications left in your review pile."}
                    </Typography>
                </Card>
            ) : (
                <Box className={styles.layout}>
                    <Stack spacing={2}>
                        <Card className={styles.card}>
                            <Typography variant="h5">
                                {application.preferredName ||
                                    application.firstName}{" "}
                                {application.lastName}
                            </Typography>
                            <Typography color="text.secondary">
                                {application.school} · {application.major}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Box className={styles.details}>
                                <Answer
                                    label="Email"
                                    value={application.email}
                                />
                                <Answer
                                    label="Phone"
                                    value={application.phoneNumber}
                                />
                                <Answer
                                    label="Education"
                                    value={application.education}
                                />
                                <Answer
                                    label="Expected graduation"
                                    value={application.graduate}
                                />
                                <Answer
                                    label="Location"
                                    value={`${application.state}, ${application.country}`}
                                />
                                <Answer
                                    label="Hackathons attended"
                                    value={application.hackathonsParticipated}
                                />
                            </Box>
                        </Card>

                        <Card className={styles.card}>
                            <Typography variant="h5" gutterBottom>
                                Application responses
                            </Typography>
                            <Stack spacing={3}>
                                <Answer
                                    label="Why do you want to attend HackIllinois?"
                                    value={application.application1}
                                />
                                <Answer
                                    label="Tell us about a project you have worked on."
                                    value={application.application2}
                                />
                                <Answer
                                    label="What would you bring to a team?"
                                    value={application.application3}
                                />
                                <Answer
                                    label="Anything else?"
                                    value={
                                        application.applicationOptional || ""
                                    }
                                />
                            </Stack>
                        </Card>
                    </Stack>

                    <Card className={styles.reviewCard}>
                        <Typography className={styles.queueLabel}>
                            Application {applicationIndex + 1} of{" "}
                            {filteredApplications.length}
                        </Typography>
                        <Typography variant="h5">Reviewer score</Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                            Give this application an overall score from 1 to 5.
                        </Typography>
                        <Rating
                            name="application-rating"
                            value={rating}
                            onChange={(_, value) => {
                                if (applicationId === undefined) return

                                setRatings((previous) => {
                                    const next = { ...previous }
                                    if (value === null) {
                                        delete next[applicationId]
                                    } else {
                                        next[applicationId] = value
                                    }
                                    return next
                                })
                            }}
                            size="large"
                            sx={{ my: 3 }}
                        />
                        <Button
                            variant="contained"
                            onClick={submitRating}
                            disabled={!rating || saving}
                            fullWidth
                        >
                            {saving ? "Saving..." : "Save rating"}
                        </Button>
                        <Button
                            color="success"
                            variant="outlined"
                            onClick={markApplicationDone}
                            disabled={!savedRating || saving}
                            fullWidth
                            sx={{ mt: 1 }}
                        >
                            Mark as done
                        </Button>
                        {savedRating && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                Rating saved: {savedRating}/5
                            </Alert>
                        )}
                        <Box className={styles.navigation}>
                            <Button
                                startIcon={<ArrowBack />}
                                onClick={() =>
                                    moveToApplication(applicationIndex - 1)
                                }
                                disabled={applicationIndex === 0 || saving}
                            >
                                Previous
                            </Button>
                            <Button
                                endIcon={<ArrowForward />}
                                onClick={() =>
                                    moveToApplication(applicationIndex + 1)
                                }
                                disabled={
                                    applicationIndex ===
                                        filteredApplications.length - 1 ||
                                    saving
                                }
                            >
                                Next
                            </Button>
                        </Box>
                    </Card>
                </Box>
            )}

            <Snackbar
                open={error !== null}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    )
}
