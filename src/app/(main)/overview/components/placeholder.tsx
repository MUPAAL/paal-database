// Overview.tsx
"use client";
import { Card } from "@/components/Card";
import FertilityProgressCard from "@/components/ui/overview/DashboardFertilityCard";
import HeatProgressCard from "@/components/ui/overview/DashboardHeatCard";
import { ProgressBarCard } from "@/components/ui/overview/DashboardProgressBarCard";
import { BarnStallCard } from "@/components/ui/overview/DashboardStallBarCard";

export default function PlaceHolder() {


    return (
        <>
            <section aria-labelledby="current-status">
                <h1
                    id="current-status"
                    className="scroll-mt-10 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
                >
                    Current Status
                </h1>
                <div className="mt-4 grid grid-cols-1 gap-14 sm:mt-8 sm:grid-cols-2 lg:mt-10 xl:grid-cols-3">
                    <Card placeholder="No Data" />
                    <ProgressBarCard
                        title="Health Metrics"
                        change="Healthy"
                        value="85%"
                        valueDescription="normal health indicators"
                        ctaDescription="2 pigs require attention."
                        ctaText="View details"
                        ctaLink="/details"
                        data={[]}
                    />

                    <BarnStallCard
                        title="Barn/Stall Metrics"
                        change="Farm 1"
                        value="121"
                        valueDescription="Total Pigs"
                        ctaDescription="View stall details."
                        ctaText="View details"
                        ctaLink="/barn-stall-details"
                        data={[]}
                        barns={[]}
                        selectedBarn={null}
                        onBarnSelect={() => { }}
                    />


                    <FertilityProgressCard
                        title="Fertility Metrics"
                        change=""
                        value="78%"
                        valueDescription="optimal breeding conditions"
                        ctaDescription="3 pigs ready for breeding."
                        ctaText="View details"
                        ctaLink="/fertility-details"
                        data={[]}
                    />
                    <HeatProgressCard
                        title="Heat Metrics"
                        change=""
                        value="89%"
                        valueDescription="optimal breeding conditions"
                        ctaDescription="3 pigs ready for breeding."
                        ctaText="View details"
                        ctaLink="/heat-status"
                        data={[]}
                    />
                </div>
            </section>
            <section aria-labelledby="monitoring-overview">
                <h1
                    id="monitoring-overview"
                    className="mt-16 scroll-mt-8 text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-50"
                >
                    Monitoring Overview
                </h1>
                <div className="sticky top-16 z-20 flex items-center justify-between border-b border-gray-200 bg-white pb-4 pt-4 sm:pt-6 lg:top-0 lg:mx-0 lg:px-0 lg:pt-8 dark:border-gray-800 dark:bg-gray-950">

                </div>
                <dl className="mt-10 grid grid-cols-1 gap-14 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                    No Data
                </dl>
            </section>
        </>
    );
}