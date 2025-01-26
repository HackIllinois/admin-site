import React from 'react'
import Chart from 'react-frappe-charts'

import './style.scss'
import COLORS from 'constants.scss'
import { formatCamelCase } from 'util/registrations'

const { primaryColor } = COLORS

const omittedColumns = new Set([
    'firstName',
    'lastName',
    'email',
    'resumeFilename',
    'createdAt',
    'updatedAt',
    'github',
    'id',
])

export default function Stats({ registrations }) {
    const statsColumns = Array.from(
        registrations.reduce((columns, registration) => {
            Object.keys(registration).forEach((key) => {
                if (!omittedColumns.has(key)) {
                    columns.add(key)
                }
            })
            return columns
        }, new Set()),
    )

    const charts = statsColumns.map((columnName) => {
        const data = new Map()
        const addValue = (value) => {
            if (data.has(value)) {
                data.set(value, data.get(value) + 1)
            } else {
                data.set(value, 1)
            }
        }

        registrations.forEach((registration) => {
            let value = registration[columnName]
            if (Array.isArray(value)) {
                value.forEach(addValue)
            } else {
                addValue(value)
            }
        })

        // sort the map so that keys are in order
        const sortedData = new Map(
            [...data.entries()].sort(([key1], [key2]) => {
                if (typeof key1 == 'boolean' && typeof key2 == 'boolean') {
                    return Number(key1) - Number(key2)
                } else if (typeof key1 == 'number' && typeof key2 == 'number') {
                    return key1 - key2
                } else {
                    return String(key1).localeCompare(key2)
                }
            }),
        )

        return { name: formatCamelCase(columnName), data: sortedData }
    })

    // Sort the charts such that charts with fewer categories come first (to avoid certain formatting problems)
    charts.sort((chart1, chart2) => chart1.data.size - chart2.data.size)

    const getChartBox = (chart) => (
        <div
            className="chart-wrapper box"
            key={chart.name}
            style={{ flex: chart.data.size }}
        >
            <div className="title">{chart.name}</div>
            <Chart
                type="bar"
                colors={[primaryColor]}
                height={250}
                data={{
                    labels: Array.from(chart.data.keys()),
                    datasets: [
                        {
                            name: 'Applicants',
                            values: Array.from(chart.data.values()),
                        },
                    ],
                }}
                tooltipOptions={{
                    formatTooltipY: (value) =>
                        `${value} (${((value / registrations.length) * 100).toFixed(2)}%)`,
                }}
            />
        </div>
    )

    const getCountsBox = (chart) => (
        <div
            className="counts box"
            key={chart.name}
            style={{ flex: chart.data.size + 2 }}
        >
            <div className="title">{chart.name}</div>
            {Array.from(chart.data.entries())
                .sort(([text1, count1], [text2, count2]) => count2 - count1) // sort by count, greatest to least
                .map(([text, count]) => (
                    <React.Fragment key={text}>
                        <div className="text">{text}</div>
                        <div className="count">{count}</div>
                        <div className="separator" />
                    </React.Fragment>
                ))}
        </div>
    )

    return (
        <div className="stats">
            {charts.map((chart) =>
                chart.data.size < 11 ? getChartBox(chart) : getCountsBox(chart),
            )}
        </div>
    )
}
