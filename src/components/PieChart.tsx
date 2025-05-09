"use client"

import React from "react"
import {
    Cell,
    Pie,
    PieChart as ReChartsPieChart,
    ResponsiveContainer,
    Sector,
    Tooltip,
} from "recharts"
import { AvailableChartColors } from "../lib/chartUtils"
import { cx } from "@/lib/utils"
interface FarmData {
    name: string
    value: number
    color?: string
}

interface PieChartProps {
    data: FarmData[]
    width?: number
    height?: number
    label?: string
    valueFormatter?: (value: number) => string
    showTooltip?: boolean
    onSectorClick?: (data: FarmData) => void
}

const renderActiveShape = (props: any) => {
    const {
        cx,
        cy,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        fill,
        payload,
        percent,
        value,
    } = props

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 10}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill} fontWeight={600}>
                {payload.name}
            </text>
            <text x={cx} y={cy} textAnchor="middle" fill="#333">
                {value}
            </text>
            <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#999">
                {`(${(percent * 100).toFixed(2)}%)`}
            </text>
        </g>
    )
}

const PieChart: React.FC<PieChartProps> = ({
    data,
    width = 400,
    height = 400,
    label = "Farm Distribution",
    valueFormatter = (value) => value.toString(),
    showTooltip = true,
    onSectorClick,
}) => {
    const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined)

    const handleSectorClick = (data: FarmData, index: number) => {
        setActiveIndex(index === activeIndex ? undefined : index)
        if (onSectorClick) {
            onSectorClick(data)
        }
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className={cx(
                    "rounded-md border text-sm shadow-md",
                    "border-gray-200 dark:border-gray-800",
                    "bg-white dark:bg-gray-950 p-3"
                )}>
                    <p className="font-medium">{payload[0].payload.name}</p>
                    <p className="text-gray-600 dark:text-gray-400">
                        Pigs: {valueFormatter(payload[0].value)}
                    </p>
                    <p className="text-gray-500 dark:text-gray-500">
                        {((payload[0].payload.percent || 0) * 100).toFixed(1)}%
                    </p>
                </div>
            )
        }
        return null
    }

    // Calculate total for percentage display
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const chartData = data.map(item => ({
        ...item,
        percent: item.value / total
    }))

    return (
        <div className="flex flex-col items-center">
            {label && <h3 className="text-lg font-medium mb-2">{label}</h3>}
            <div style={{ width, height }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ReChartsPieChart>
                        <Pie
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            onClick={(data, index) => handleSectorClick(data.payload, index)}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color || AvailableChartColors[index % AvailableChartColors.length]}
                                />
                            ))}
                        </Pie>
                        {showTooltip && <Tooltip content={<CustomTooltip />} />}
                    </ReChartsPieChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default PieChart