"use client"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/Select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRoot,
    TableRow,
} from "@/components/Table"
import api from "@/lib/axios"
import { cx } from "@/lib/utils"
import { Download } from "lucide-react"
import { Fragment, useEffect, useState } from "react"
import { FarmerManagementDrawer } from "./FarmerManagementDrawer"

const colorClasses = [
    "bg-blue-500 dark:bg-blue-500",
    "bg-purple-500 dark:bg-purple-500",
    "bg-emerald-500 dark:bg-emerald-500",
    "bg-cyan-500 dark:bg-cyan-500",
    "bg-rose-500 dark:bg-rose-500",
    "bg-indigo-500 dark:bg-indigo-500",
]

const getRandomColor = (initials: string) => {
    const seed = initials
        .split("")
        .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colorClasses[seed % colorClasses.length]
}

interface StaffMember {
    id: string
    name: string
    initials: string
}

interface Stall {
    company: string
    barn: string
    size: number
    probability: string
    duration: string
    totalPigs: number
    pigsToBreed: number
    unhealthyPigs: number
    assigned?: StaffMember[] // Marked as optional
    status: string
}

interface FarmData {
    region: string
    barns: Array<{
        name: string
        stalls: Stall[]
    }>
    project: Stall[]
}

export default function Overview() {
    const [farmData, setFarmData] = useState<FarmData[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedFarm, setSelectedFarm] = useState<string>("all")
    const [selectedBarn, setSelectedBarn] = useState<string>("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const fetchStallData = async () => {
            try {
                const response = await api.get('/systemmanagement')
                // Ensure assigned array exists for each stall
                const data = response.data.map((farm: FarmData) => ({
                    ...farm,
                    barns: farm.barns?.map(barn => ({
                        ...barn,
                        stalls: barn.stalls.map(stall => ({
                            ...stall,
                            assigned: stall.assigned || [] // Default to empty array if undefined
                        }))
                    })) || [],
                    project: farm.project?.map(stall => ({
                        ...stall,
                        assigned: stall.assigned || [] // Default to empty array if undefined
                    })) || []
                }))
                setFarmData(data)
            } catch (error) {
                console.error('Error fetching stall data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStallData()
    }, [])

    if (loading) return (<div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
    </div>)

    // Get unique barns for the dropdown
    const allBarns = farmData.flatMap(farm =>
        farm.barns?.map(barn => ({
            name: barn.name,
            farmName: farm.region
        })) || []
    )

    // Filter data based on selections
    const filteredFarms = farmData.filter(farm =>
        (selectedFarm === "all" || farm.region === selectedFarm) &&
        (searchTerm === "" ||
            farm.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
            farm.barns?.some(barn =>
                barn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                barn.stalls.some(stall =>
                    stall.toString().toLowerCase().includes(searchTerm.toLowerCase())
                )
            )
        )
    )

    // Further filter by barn if selected
    const filteredByBarn = selectedBarn === "all"
        ? filteredFarms
        : filteredFarms.map(farm => ({
            ...farm,
            barns: farm.barns?.filter(barn => barn.name === selectedBarn) || []
        })).filter(farm => farm.barns?.length > 0)

    return (

        <section aria-label="Overview Table">
            <FarmerManagementDrawer open={isOpen} onOpenChange={() => setIsOpen(false)} />
            <div className="flex flex-col justify-between gap-2 px-4 py-6 sm:flex-row sm:items-center sm:p-6">
                <Input
                    type="search"
                    placeholder="Search farms, barns, or stalls..."
                    className="sm:w-64 [&>input]:py-1.5"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex flex-col items-center gap-2 sm:flex-row">
                    <Select value={selectedFarm} onValueChange={setSelectedFarm}>
                        <SelectTrigger className="w-full py-1.5 sm:w-44">
                            <SelectValue placeholder="Filter by farm..." />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="all">All Farms</SelectItem>
                            {farmData.map((farm) => (
                                <SelectItem key={farm.region} value={farm.region}>
                                    {farm.region}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedBarn} onValueChange={setSelectedBarn}>
                        <SelectTrigger className="w-full py-1.5 sm:w-44">
                            <SelectValue placeholder="Filter by barn..." />
                        </SelectTrigger>
                        <SelectContent align="end">
                            <SelectItem value="all">All Barns</SelectItem>
                            {allBarns.map((barn, index) => (
                                <SelectItem key={`${barn.name}-${index}`} value={barn.name}>
                                    {barn.name} ({barn.farmName})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="secondary"
                        className="w-full gap-2 py-1.5 text-base sm:w-fit sm:text-sm"
                        onClick={() => setIsOpen(true)}
                    >
                        <Download
                            className="-ml-0.5 size-4 shrink-0 text-gray-400 dark:text-gray-600"
                            aria-hidden="true"
                        />
                        Export
                    </Button>
                </div>
            </div>

            <TableRoot className="border-t border-gray-200 dark:border-gray-800">
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell>Assignment</TableHeaderCell>
                            <TableHeaderCell>Stall</TableHeaderCell>
                            <TableHeaderCell>Total Pigs</TableHeaderCell>
                            <TableHeaderCell>To Breed</TableHeaderCell>
                            <TableHeaderCell>Unhealthy</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredByBarn.map((farm) => (
                            <Fragment key={farm.region}>
                                <TableRow>
                                    <TableHeaderCell
                                        scope="colgroup"
                                        colSpan={7}
                                        className="bg-gray-50 py-3 pl-4 sm:pl-6 dark:bg-gray-900"
                                    >
                                        {farm.region}

                                    </TableHeaderCell>
                                </TableRow>
                                {farm.barns?.map((barn) => (

                                    <Fragment key={`${farm.region}-${barn.name}`}>

                                        <TableRow>
                                            <TableHeaderCell
                                                scope="colgroup"
                                                colSpan={7}
                                                className="bg-gray-50 py-3 pl-4 sm:pl-6 dark:bg-gray-900"
                                            >
                                                {barn.name}

                                            </TableHeaderCell>
                                        </TableRow>
                                        {barn.stalls.map((stall, index) => (
                                            <TableRow key={index}>
                                                <TableCell></TableCell>
                                                <TableCell>Stall {index + 1}</TableCell>
                                                <TableCell>{stall.totalPigs}</TableCell>
                                                <TableCell>{stall.pigsToBreed}</TableCell>
                                                <TableCell>{stall.unhealthyPigs}</TableCell>

                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            stall.status === 'Off'
                                                                ? 'neutral'
                                                                : stall.status === 'Needs Attention'
                                                                    ? 'warning'
                                                                    : 'success'
                                                        }
                                                        className="rounded-full"
                                                    >
                                                        <span
                                                            className={cx(
                                                                "size-1.5 shrink-0 rounded-full",
                                                                {
                                                                    "bg-gray-500": stall.status === 'Off',
                                                                    "bg-yellow-500": stall.status === 'Needs Attention',
                                                                    "bg-green-500": stall.status === 'Active',
                                                                }
                                                            )}
                                                            aria-hidden="true"
                                                        />
                                                        {stall.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </Fragment>
                                ))}
                            </Fragment>
                        ))}
                    </TableBody>
                </Table>
            </TableRoot>


        </section>


    )
}