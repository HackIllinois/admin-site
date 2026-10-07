"use client"

import { useMediaQuery } from "@mui/material"
import {
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
const LEGEND_STYLE = { fontFamily: CHART_FONT, fontSize: 12 }
const PHONE_QUERY = "(max-width: 767.9px)"
const Y_AXIS_CHAR_WIDTH_DESKTOP = 6.2
const Y_AXIS_CHAR_WIDTH_PHONE = 5.6
const Y_AXIS_PADDING = 10
const Y_AXIS_MIN_WIDTH = 72
const Y_AXIS_MAX_WIDTH_DESKTOP = 480
const Y_AXIS_MAX_WIDTH_PHONE = 200

export interface ChartSlice {
    name: string
    value: number
    color: string
}

/**
 * Estimates Y-axis width so category labels render without truncation.
 */
function measureYAxisWidth(names: string[], isPhone: boolean): number {
    const charWidth = isPhone
        ? Y_AXIS_CHAR_WIDTH_PHONE
        : Y_AXIS_CHAR_WIDTH_DESKTOP
    const maxWidth = isPhone
        ? Y_AXIS_MAX_WIDTH_PHONE
        : Y_AXIS_MAX_WIDTH_DESKTOP
    const longest = names.reduce(
        (max, name) => Math.max(max, name.length),
        0,
    )
    return Math.min(
        maxWidth,
        Math.max(Y_AXIS_MIN_WIDTH, Math.ceil(longest * charWidth) + Y_AXIS_PADDING),
    )
}

function measureValueLabelMargin(values: number[]): number {
    const widest = values.reduce((max, value) => {
        const digits = value.toLocaleString().length
        return Math.max(max, digits)
    }, 1)
    return Math.max(36, widest * 8 + 12)
}

interface DonutChartProps {
    slices: ChartSlice[]
    emptyLabel: string
    centerValue: string
    centerCaption: string
}

/**
 * Donut chart for a single snapshot breakdown, with a rate in the center.
 */
export function DonutChart({
    slices,
    emptyLabel,
    centerValue,
    centerCaption,
}: DonutChartProps) {
    const isPhone = useMediaQuery(PHONE_QUERY)
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
                    innerRadius={isPhone ? 48 : 56}
                    outerRadius={isPhone ? 70 : 80}
                    paddingAngle={2}
                >
                    {data.map((slice) => (
                        <Cell key={slice.name} fill={slice.color} />
                    ))}
                </Pie>
                <text
                    x="50%"
                    y="42%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={styles.donutValue}
                >
                    {centerValue}
                </text>
                <text
                    x="50%"
                    y="53%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={styles.donutCaption}
                >
                    {centerCaption}
                </text>
                <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value) => {
                        const count = Number(value)
                        return `${count.toLocaleString()} (${Math.round((count / total) * 100)}%)`
                    }}
                />
                <Legend iconType="circle" wrapperStyle={LEGEND_STYLE} />
            </PieChart>
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
    const isPhone = useMediaQuery(PHONE_QUERY)
    const data = rows.slice(0, limit)
    const yAxisWidth = measureYAxisWidth(
        data.map((row) => row.name),
        isPhone,
    )
    const rightMargin = measureValueLabelMargin(data.map((row) => row.value))

    if (data.length === 0) {
        return <div className={styles.chartEmpty}>Nothing to chart</div>
    }

    return (
        <ResponsiveContainer width="100%" height={40 + data.length * 30}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{
                    top: 4,
                    right: rightMargin,
                    left: 0,
                    bottom: 4,
                }}
            >
                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#eee"
                    horizontal={false}
                />
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
                    width={yAxisWidth}
                    tick={TICK_STYLE}
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
