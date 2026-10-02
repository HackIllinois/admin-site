"use client"

import type { TrendPoint } from "@/app/lib/statistics/statistic-metrics"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import styles from "./styles.module.scss"

const CHART_FONT = "Montserrat, Segoe UI, Roboto, sans-serif"
const TOOLTIP_STYLE = { fontFamily: CHART_FONT, fontSize: 12, borderRadius: 6 }
const TICK_STYLE = { fontSize: 11, fontFamily: CHART_FONT, fill: "#666" }
const MAX_LABEL_LENGTH = 24

export interface ChartSlice {
    name: string
    value: number
    color: string
}

function truncate(label: string): string {
    return label.length > MAX_LABEL_LENGTH
        ? label.slice(0, MAX_LABEL_LENGTH - 1) + "…"
        : label
}

interface DonutChartProps {
    slices: ChartSlice[]
    emptyLabel: string
}

/**
 * Donut chart for a single snapshot breakdown.
 */
export function DonutChart({ slices, emptyLabel }: DonutChartProps) {
    const data = slices.filter((slice) => slice.value > 0)
    const total = data.reduce((sum, slice) => sum + slice.value, 0)

    if (total === 0) {
        return <div className={styles.chartEmpty}>{emptyLabel}</div>
    }

    return (
        <ResponsiveContainer width="100%" height={220}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={2}
                >
                    {data.map((slice) => (
                        <Cell key={slice.name} fill={slice.color} />
                    ))}
                </Pie>
                <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={styles.donutTotal}
                >
                    {total}
                </text>
                <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => {
                        const count = Number(value)
                        return `${count} (${Math.round((count / total) * 100)}%)`
                    }}
                />
                <Legend
                    iconType="circle"
                    wrapperStyle={{ fontFamily: CHART_FONT, fontSize: 12 }}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}

interface FunnelChartProps {
    steps: ChartSlice[]
}

/**
 * Vertical bars showing drop-off from applied to accepted to RSVP.
 */
export function FunnelChart({ steps }: FunnelChartProps) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={steps} margin={{ top: 16, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis dataKey="name" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                <YAxis tick={TICK_STYLE} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                <Bar dataKey="value" name="People" radius={[6, 6, 0, 0]} label={{ position: "top", fontSize: 11, fill: "#444" }}>
                    {steps.map((step) => (
                        <Cell key={step.name} fill={step.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}

interface ActivityTrendChartProps {
    series: TrendPoint[]
}

/**
 * Cumulative check-ins and shop redemptions across the activity window.
 */
export function ActivityTrendChart({ series }: ActivityTrendChartProps) {
    if (series.length < 2) {
        return (
            <div className={styles.chartEmpty}>
                Not enough logs in this window to show a trend
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={series} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
                <defs>
                    <linearGradient id="checkInsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#5e997a" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#5e997a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="redeemedFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#505f85" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#505f85" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis
                    dataKey="label"
                    tick={TICK_STYLE}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    minTickGap={24}
                />
                <YAxis tick={TICK_STYLE} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend iconType="circle" wrapperStyle={{ fontFamily: CHART_FONT, fontSize: 12 }} />
                <Area
                    type="monotone"
                    dataKey="checkIns"
                    name="Event check-ins"
                    stroke="#5e997a"
                    strokeWidth={2}
                    fill="url(#checkInsFill)"
                />
                <Area
                    type="monotone"
                    dataKey="redeemed"
                    name="Shop redemptions"
                    stroke="#505f85"
                    strokeWidth={2}
                    fill="url(#redeemedFill)"
                />
            </AreaChart>
        </ResponsiveContainer>
    )
}

export interface BarChartRow {
    name: string
    value: number
}

interface TopItemsBarChartProps {
    rows: BarChartRow[]
    valueLabel: string
    color: string
    limit?: number
}

/**
 * Horizontal bar chart of the top rows by value.
 */
export function TopItemsBarChart({
    rows,
    valueLabel,
    color,
    limit = 10,
}: TopItemsBarChartProps) {
    const data = rows.slice(0, limit)

    if (data.length === 0) {
        return <div className={styles.chartEmpty}>Nothing to chart</div>
    }

    return (
        <ResponsiveContainer width="100%" height={40 + data.length * 30}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={TICK_STYLE}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    type="category"
                    dataKey="name"
                    width={180}
                    tick={TICK_STYLE}
                    tickFormatter={truncate}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                <Bar
                    dataKey="value"
                    name={valueLabel}
                    fill={color}
                    radius={[0, 6, 6, 0]}
                    label={{ position: "right", fontSize: 11, fill: "#444" }}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
