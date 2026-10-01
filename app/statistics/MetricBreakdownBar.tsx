import { Box, Tooltip } from "@mui/material"
import type { FC } from "react"

export interface MetricSegment {
    label: string
    value: number
    color: string
}

export interface MetricBreakdownBarProps {
    segments: MetricSegment[]
}

const MIN_SEGMENT_PERCENT = 8

/**
 * Horizontal stacked bar for count breakdowns (decisions, RSVP, etc.).
 */
const MetricBreakdownBar: FC<MetricBreakdownBarProps> = ({ segments }) => {
    const total = segments.reduce((sum, segment) => sum + segment.value, 0)

    if (total === 0) {
        return (
            <Box
                sx={{
                    height: 20,
                    borderRadius: 1,
                    border: 1,
                    borderColor: "grey.300",
                    bgcolor: "grey.100",
                }}
            />
        )
    }

    return (
        <Box
            sx={{
                display: "flex",
                width: "100%",
                height: 20,
                borderRadius: 1,
                overflow: "hidden",
                border: 1,
                borderColor: "grey.300",
            }}
        >
            {segments.map((segment) => {
                const rawPercent = (segment.value / total) * 100
                const width =
                    segment.value === 0
                        ? 0
                        : Math.max(rawPercent, MIN_SEGMENT_PERCENT)

                return (
                    <Tooltip
                        key={segment.label}
                        title={`${segment.label}: ${segment.value}`}
                        arrow
                    >
                        <Box
                            sx={{
                                width: `${width}%`,
                                bgcolor: segment.color,
                                height: "100%",
                            }}
                        />
                    </Tooltip>
                )
            })}
        </Box>
    )
}

export default MetricBreakdownBar
