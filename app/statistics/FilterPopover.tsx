"use client"

import { faFilter } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    Badge,
    Button,
    Popover,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
} from "@mui/material"
import { useState } from "react"
import styles from "./styles.module.scss"

export type ChartLimit = 10 | 25 | "all"

export interface ListFilters {
    query: string
    minCount: number
    limit: ChartLimit
}

export const DEFAULT_FILTERS: ListFilters = {
    query: "",
    minCount: 0,
    limit: 10,
}

interface FilterPopoverProps {
    filters: ListFilters
    onChange: (filters: ListFilters) => void
    nameLabel: string
    countLabel: string
}

/**
 * Counts filters that differ from the defaults, for the button badge.
 */
function countActive(filters: ListFilters): number {
    return [
        filters.query.trim() !== "",
        filters.minCount > 0,
        filters.limit !== DEFAULT_FILTERS.limit,
    ].filter(Boolean).length
}

/**
 * "Filters" button that opens a popover with name, count, and display options.
 */
export default function FilterPopover({
    filters,
    onChange,
    nameLabel,
    countLabel,
}: FilterPopoverProps) {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null)
    const update = (patch: Partial<ListFilters>) =>
        onChange({ ...filters, ...patch })

    return (
        <>
            <Badge
                badgeContent={countActive(filters)}
                color="primary"
                overlap="rectangular"
            >
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FontAwesomeIcon icon={faFilter} />}
                    onClick={(event) => setAnchor(event.currentTarget)}
                    className={styles.filterButton}
                >
                    Filters
                </Button>
            </Badge>
            <Popover
                open={Boolean(anchor)}
                anchorEl={anchor}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                slotProps={{ paper: { className: styles.popover } }}
            >
                <div className={styles.popoverSection}>
                    <div className={styles.popoverLabel}>Show</div>
                    <ToggleButtonGroup
                        exclusive
                        size="small"
                        value={filters.limit}
                        onChange={(_, value: ChartLimit | null) =>
                            value !== null && update({ limit: value })
                        }
                    >
                        <ToggleButton value={10}>Top 10</ToggleButton>
                        <ToggleButton value={25}>Top 25</ToggleButton>
                        <ToggleButton value="all">All</ToggleButton>
                    </ToggleButtonGroup>
                </div>
                <div className={styles.popoverSection}>
                    <TextField
                        size="small"
                        fullWidth
                        label={nameLabel}
                        value={filters.query}
                        onChange={(event) =>
                            update({ query: event.target.value })
                        }
                    />
                </div>
                <div className={styles.popoverSection}>
                    <TextField
                        size="small"
                        fullWidth
                        type="number"
                        label={countLabel}
                        value={filters.minCount}
                        slotProps={{ htmlInput: { min: 0 } }}
                        onChange={(event) =>
                            update({
                                minCount: Math.max(
                                    0,
                                    Number(event.target.value) || 0,
                                ),
                            })
                        }
                    />
                </div>
                <div className={styles.popoverActions}>
                    <Button
                        size="small"
                        onClick={() => onChange(DEFAULT_FILTERS)}
                    >
                        Reset
                    </Button>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => setAnchor(null)}
                    >
                        Done
                    </Button>
                </div>
            </Popover>
        </>
    )
}
