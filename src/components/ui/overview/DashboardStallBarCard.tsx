"use client";

import { Badge } from "@/components/Badge";
import { TabNavigation, TabNavigationLink } from "@/components/TabNavigation";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip
} from "@/components/ui/chart";
import Link from "next/link";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";


export type KpiEntry = {
    title: string;
    percentage: number;
    current: number;
    allowed: number;
};

export type BarnStallCardProps = {
    title: string;
    change: string;
    value: string;
    valueDescription: string;
    ctaDescription: string;
    ctaText: string;
    ctaLink: string;
    data: KpiEntry[];
    barns: { title: string; href: string }[];
    selectedBarn: string | null;
    onBarnSelect: (barn: string) => void;
};

export function BarnStallCard({
    title,
    change,
    value,
    valueDescription,
    ctaDescription,
    ctaText,
    ctaLink,
    data,
    barns,
    selectedBarn,
    onBarnSelect,
}: BarnStallCardProps) {
    // Transform KPI data into radar chart format
    const radarChartData = data.map(item => ({
        category: item.title,
        value: item.percentage,
        current: item.current,
        allowed: item.allowed,
    }));

    const chartConfig = {
        value: {
            label: "Utilization",
            color: "hsl(var(--chart-1))",
        },
    } satisfies ChartConfig;

    return (
        <div className="flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2">
                    <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
                        {title}
                    </dt>
                    <Badge variant="neutral">{change}</Badge>
                </div>
                <dd className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl text-gray-900 dark:text-gray-50">
                        {value}
                    </span>
                    <span className="text-sm text-gray-500">{valueDescription}</span>
                </dd>

                {/* Barn Navigation Toggle */}
                <TabNavigation className="mt-4 gap-x-4">
                    {barns.map((barn) => (
                        <TabNavigationLink
                            key={barn.title}
                            asChild
                            active={selectedBarn === barn.title}
                        >
                            <Link
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onBarnSelect(barn.title);
                                }}
                            >
                                {barn.title}
                            </Link>
                        </TabNavigationLink>
                    ))}
                </TabNavigation>

                {/* Radar Chart */}
                <div className="mt-4 ">
                    <ChartContainer
                        config={chartConfig}
                        className="m-auto aspect-square max-h-[250px]"
                    >
                        <RadarChart data={radarChartData}>
                            <ChartTooltip
                                cursor={false}
                                content={<CustomTooltipContent />}
                            />
                            <PolarGrid
                                className="fill-[--color-value] opacity-20"
                                gridType="circle"
                            />
                            <PolarAngleAxis dataKey="category" />
                            <Radar
                                dataKey="value"
                                fill="var(--color-value)"
                                fillOpacity={0.5}
                            />
                        </RadarChart>
                    </ChartContainer>
                </div>
                {/* Call-to-Action */}
                <div>
                    <p className="mt-6 text-xs text-gray-500">
                        {ctaDescription}{" "}
                        <a href={ctaLink} className="text-indigo-600 dark:text-indigo-400">
                            {ctaText}
                        </a>
                    </p>
                </div>
            </div>


        </div>
    );
}

// Custom tooltip to show detailed information
function CustomTooltipContent({ active, payload }: any) {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;
    return (
        <div className="rounded-md border bg-background p-4 text-sm shadow-sm">
            <div className="font-medium">{data.category}</div>
            <div className="text-muted-foreground">
                {data.current} / {data.allowed} Pigs
            </div>
            <div className="font-medium mt-1">
                {parseInt(((data.current / data.allowed) * 100).toString(), 10)}% utilization
            </div>
        </div>
    );
}