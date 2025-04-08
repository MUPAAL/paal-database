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
    // Check if there are no barns or no data
    const hasNoBarns = !barns || barns.length === 0;
    const hasNoData = !data || data.length === 0;

    // If no data or no barns, display a placeholder
    if (hasNoData || hasNoBarns) {
        return (
            <div className="flex flex-col justify-between bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800">
                <div>
                    <div className="flex items-center gap-2">
                        <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
                            {title}
                        </dt>
                        <Badge variant="neutral">{change}</Badge>
                    </div>
                    <dd className="mt-2 flex items-baseline gap-2">
                        <span className="text-xl text-gray-900 dark:text-gray-50">
                            0
                        </span>
                        <span className="text-sm text-gray-500">{valueDescription}</span>
                    </dd>
                    <div className="flex h-40 items-center justify-center">
                        <div className="text-center">
                            <p className="text-gray-500 mb-2">No barn information available</p>
                            <p className="text-xs text-gray-400">Add barns and stalls to see metrics</p>
                        </div>
                    </div>
                    <p className="mt-4 text-xs text-gray-500">
                        {ctaDescription}{" "}
                        <a href={ctaLink} className="text-indigo-600 dark:text-indigo-400">
                            {ctaText}
                        </a>
                    </p>
                </div>
            </div>
        );
    }

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
                    {/* Conditional logic can be inserted here using a ternary operator or logical && */}
                    {barns.length > 4 ? (
                        <>
                            {barns.slice(0, 3).map((barn) => (
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
                            <span className="my-auto inset-y-4 font-mono">  ... </span>
                            <TabNavigationLink
                                key={barns[barns.length - 1].title}
                                asChild
                                active={selectedBarn === barns[barns.length - 1].title}
                            >


                                <Link
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onBarnSelect(barns[barns.length - 1].title);
                                    }}
                                >
                                    {barns[barns.length - 1].title}
                                </Link>
                            </TabNavigationLink>



                        </>

                    ) : (
                        <>
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
                        </>
                    )}



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
                                className="fill-purple-500 opacity-20"
                                gridType="circle"
                            />
                            <PolarAngleAxis dataKey="category" />
                            <Radar
                                dataKey="value"
                                fill="#4f46e5"
                                fillOpacity={0.5}
                                isAnimationActive={false}
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