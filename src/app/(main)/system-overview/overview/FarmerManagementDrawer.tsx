"use client"
import { Button } from "@/components/Button"
import {
    Drawer,
    DrawerBody,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/Drawer"
import { Input } from "@/components/Input"
import { Label } from "@/components/Label"
import api from "@/lib/axios"
import axios from "axios"
import React, { useEffect, useState } from "react"


import { RiDeleteBin4Fill } from '@remixicon/react'
import { ArrowUpWideNarrow, GitBranch, MapPinHouse } from "lucide-react"

// -------------------------
// Types for API data

type Farm = {
    _id: string
    name: string
    location?: string
    barns: Barn[] // Each farm now has an empty barns array.
}

type Barn = {
    _id: string
    name: string
    barns: {
        _id: string
        name: string
        description?: string
        farmId: string,
    }
    description?: string
    farmId: string
}

type Stall = {
    _id: string
    name: string
    barnId: string
    farmId: string
}

// -------------------------
// Pig Form Data type matching your Pig model
// Note: pigId and age are input as strings and converted on submission.
type PigFormData = {
    pigId: string       // user-defined pigId (unique, numeric)
    tag: string         // required tag field
    farm: string        // farm _id
    barn: string        // barn _id
    stall: string       // stall _id
    breed: string
    age: string         // will be converted to Number on submit
}

// -------------------------
// Form field component

const FormField = ({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) => (
    <div>
        <Label className="font-medium">{label}</Label>
        <div className="mt-2">{children}</div>
    </div>
)

// -------------------------
// First Page: Cascading selections for Farms, Barns, and Stalls

interface FirstPageProps {
    formData: PigFormData
    onUpdateForm: (updates: Partial<PigFormData>) => void
    farms: Farm[]
    barns: Barn[]
    stalls: Stall[]
}

const FirstPage = ({ formData, onUpdateForm, farms, barns, stalls }: FirstPageProps) => {
    const [selectedFarmId, setSelectedFarmId] = useState<string | null>(formData.farm);
    const [selectedBarnId, setSelectedBarnId] = useState<string | null>(formData.barn);

    const handleSelectFarm = (farmId: string) => {
        setSelectedFarmId(farmId);
        setSelectedBarnId(null);
        onUpdateForm({ farm: farmId, barn: "", stall: "" });
    };

    const handleSelectBarn = (barnId: string) => {
        setSelectedBarnId(barnId);
        onUpdateForm({ barn: barnId, stall: "" });
    };


    // 👇 Dynamically derive `barns` from `farms` to match your filtering code
    const barns1 = farms.flatMap(farm => farm.barns || []);

    const filteredBarns = barns.filter(barn => barn.farmId == formData.farm);
    const filteredStalls = stalls.filter(stall => stall.barnId === formData.barn);
    const selectedBarn = filteredBarns.find(barn => barn._id === formData.barn);


    console.log("selectedFarmId", barns1);
    console.log("selectedBarnId", barns);
    return (
        <>
            <DrawerHeader>
                <DrawerTitle>
                    <p>Add Farm Details</p>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-500">
                        Farm, Barn & Stall Information
                    </span>
                </DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="-mx-6 space-y-6 overflow-y-scroll border-t border-gray-200 px-6 dark:border-gray-800">
                <FormField label="Farms">
                    <ul role="list" className="mt-2 divide-y divide-gray-200 dark:divide-gray-800">
                        {farms.map(farm => {
                            const isSelected = farm._id === selectedFarmId;
                            return (
                                <li
                                    key={farm._id}
                                    onClick={() => handleSelectFarm(farm._id)}
                                    className={`flex cursor-pointer items-center justify-between space-x-4 py-2.5 text-sm transition ${isSelected ? "bg-blue-100 dark:bg-blue-900 rounded-md border-blue-500 pl-2" : "hover:bg-gray-100 rounded-md dark:hover:bg-gray-800"}`}
                                >
                                    <div className="flex items-center space-x-4 truncate">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 bg-white text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-500">
                                            <GitBranch className="size-5" />
                                        </span>
                                        <span className="truncate text-gray-700 dark:text-gray-300">{farm.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="inline-flex items-center whitespace-nowrap rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300">N/a Barns</span>
                                        <Button variant="ghost" className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:text-gray-500 hover:dark:text-gray-300">
                                            <RiDeleteBin4Fill className="size-5 shrink-0" />
                                            <span className="sr-only">Remove {farm.name}</span>
                                        </Button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                </FormField>

                <div className="mt-10 flex w-full items-center space-x-2 sm:mt-0">
                    <Button variant="ghost" className="text-base size-10 sm:text-md"> <ArrowUpWideNarrow /> </Button>
                    <Input id="farm" placeholder="Add farm..." type="farm" />

                </div>

                {selectedFarmId && (
                    <>
                        <FormField label="Barns">
                            <ul role="list" className="mt-2 divide-y divide-gray-200 dark:divide-gray-800">

                                {filteredBarns.map(barn => {
                                    const isSelected = barn._id === selectedBarnId;
                                    return (
                                        <li
                                            key={barn._id}
                                            onClick={() => handleSelectBarn(barn._id)}
                                            className={`flex cursor-pointer items-center justify-between space-x-4 py-2.5 text-sm transition ${isSelected ? "bg-blue-100 dark:bg-blue-900 border-blue-500 rounded-md pl-2" : "hover:bg-gray-100 rounded-md dark:hover:bg-gray-800"}`}
                                        >

                                            <div className="flex items-center space-x-4 truncate">
                                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 bg-white text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-500">
                                                    <MapPinHouse className="size-5" />
                                                </span>
                                                <span className="truncate text-gray-700 dark:text-gray-300">{barn.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="inline-flex items-center whitespace-nowrap rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300">N/a Stalls</span>
                                                <Button variant="ghost" className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:text-gray-500 hover:dark:text-gray-300">
                                                    <RiDeleteBin4Fill className="size-5 shrink-0" />
                                                    <span className="sr-only">Remove {selectedBarn?.name}</span>
                                                </Button>
                                            </div>
                                        </li>

                                    );
                                })}

                            </ul>

                        </FormField>

                        <div className="mt-10 flex w-full items-center space-x-2 sm:mt-0">
                            <Button variant="ghost" className="text-base size-10 sm:text-md"> <ArrowUpWideNarrow /> </Button>
                            <Input id="inviteEmail" placeholder="Add Barn..." type="barn" />
                        </div>
                    </>
                )}

                {selectedBarnId && (
                    <FormField label="Stalls">
                        <ul role="list" className="mt-2 divide-y divide-gray-200 dark:divide-gray-800">
                            <li
                                className={`flex items-center justify-between space-x-4 py-2.5 text-sm transition `}
                            >

                                <div className="flex items-center space-x-4 truncate">
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 bg-white text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-500">
                                        <MapPinHouse className="size-5" />
                                    </span>
                                    <span className="truncate text-gray-700 dark:text-gray-300">{selectedBarn?.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="inline-flex items-center whitespace-nowrap rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-300">N/a Stalls</span>
                                    <Button variant="ghost" className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 dark:text-gray-500 hover:dark:text-gray-300">
                                        <RiDeleteBin4Fill className="size-5 shrink-0" />
                                        <span className="sr-only">Remove { }</span>
                                    </Button>
                                </div>
                            </li>
                        </ul>

                        <div className="mt-10 flex w-full items-center space-x-2 sm:mt-0">
                            <Button variant="ghost" className="text-base size-10 sm:text-md"> <ArrowUpWideNarrow /> </Button>
                            <Input id="inviteEmail" placeholder="Add Stall..." type="barn" />
                        </div>

                    </FormField>


                )}


            </DrawerBody>
        </>
    );
};

// -------------------------
// Second Page: Additional Pig Data Editing
// Now includes fields for Pig ID, Tag, Breed and Age.
interface SecondPageProps {
    formData: PigFormData;
    onUpdateForm: (updates: Partial<PigFormData>) => void;
}

const SecondPage = ({ formData, onUpdateForm }: SecondPageProps) => {
    const handlePigIdChange = (value: string) => {
        // Update both pigId and tag in the form state.
        onUpdateForm({ pigId: value });
        onUpdateForm({ tag: value ? `PIG-${value}` : "" });
    };

    return (
        <>
            <DrawerHeader>
                <DrawerTitle>
                    <p>Edit Pig Details</p>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-500">
                        Pig ID, Tag, Breed & Age
                    </span>
                </DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="-mx-6 space-y-6 overflow-y-scroll border-t border-gray-200 px-6 dark:border-gray-800">
                <FormField label="Tag">
                    <Input
                        disabled
                        name="tagDisplay"
                        value={formData.pigId ? `PIG-${formData.pigId}` : ""}
                        placeholder="Enter pig id"
                    />
                    <input
                        type="hidden"
                        name="tag"
                        value={formData.pigId ? `PIG-${formData.pigId}` : ""}
                    />
                </FormField>
                <FormField label="Breed">
                    <Input
                        name="breed"
                        value={formData.breed}
                        onChange={(e) => onUpdateForm({ breed: e.target.value })}
                        placeholder="Enter breed"
                    />
                </FormField>
                <FormField label="Age (months)">
                    <Input
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => onUpdateForm({ age: e.target.value })}
                        placeholder="Enter age"
                        min="0"
                    />
                </FormField>
            </DrawerBody>
        </>
    );
};

// -------------------------
// Summary Page: Review Pig Data

const SummaryItem = ({
    label,
    value,
}: {
    label: string
    value: string | number | null | undefined
}) => (
    <div className="space-y-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm">{value ?? "Not provided"}</p>
    </div>
)

const SummaryPage = ({
    formData,
    farms,
    barns,
    stalls,
}: {
    formData: PigFormData
    farms: Farm[]
    barns: Barn[]
    stalls: Stall[]
}) => {
    const selectedFarm = farms.find((farm) => farm._id === formData.farm)
    const selectedBarn = barns.find((barn) => barn._id === formData.barn)
    const selectedStall = formData.barn ? stalls.find((stall) => stall._id === formData.stall) : undefined

    return (
        <>
            <DrawerHeader>
                <DrawerTitle>
                    <p>Review Pig Data</p>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-500">
                        Please review all details before submitting
                    </span>
                </DrawerTitle>
            </DrawerHeader>
            <DrawerBody className="-mx-6 space-y-4 overflow-y-scroll border-t border-gray-200 px-6 dark:border-gray-800">
                <div className="rounded-md border border-gray-200 dark:border-gray-800 p-4">
                    <h3 className="font-medium">Pig Information</h3>
                    <div className="mt-4 space-y-4">
                        <SummaryItem label="Pig ID" value={formData.pigId} />
                        <SummaryItem label="Tag" value={formData.tag} />
                        <SummaryItem label="Farm" value={selectedFarm?.name} />
                        <SummaryItem label="Barn" value={selectedBarn?.name} />
                        <SummaryItem label="Stall" value={selectedStall?.name} />
                        <SummaryItem label="Breed" value={formData.breed} />
                        <SummaryItem label="Age" value={formData.age} />
                    </div>
                </div>
            </DrawerBody>
        </>
    )
}

// -------------------------
// Main Drawer Component

interface PigDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function FarmerManagementDrawer({ open, onOpenChange }: PigDrawerProps) {
    // Form data state
    const [formData, setFormData] = useState<PigFormData>({
        pigId: "",
        tag: "",
        farm: "",
        barn: "",
        stall: "",
        breed: "",
        age: "",
    })
    const [currentPage, setCurrentPage] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // API data states for farms, barns, and stalls
    const [farms, setFarms] = useState<Farm[]>([])
    const [barns, setBarns] = useState<Barn[]>([])
    const [stalls, setStalls] = useState<Stall[]>([])
    // Fetch farms
    useEffect(() => {
        api.get('/farms')
            .then((res) => setFarms(res.data))

            .catch(console.error);
    }, []);

    // Fetch barns when farm is selected
    useEffect(() => {
        if (formData.farm) {
            api.get(`/barns/farm/${formData.farm}`)
                .then((res) => setBarns(res.data))
                .catch(console.error);
        } else {
            setBarns([]);
        }
    }, [formData.farm]);

    // Fetch all stalls
    useEffect(() => {
        api.get('/stalls')
            .then((res) => setStalls(res.data))
            .catch(console.error);
    }, []);

    const handleUpdateForm = (updates: Partial<PigFormData>) => {
        setFormData((prev) => ({ ...prev, ...updates }))
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            // Prepare data to match your Pig model.
            const preparedData = {
                pigId: Number(formData.pigId),
                tag: formData.tag,
                breed: formData.breed,
                age: Number(formData.age),
                currentLocation: {
                    farmId: formData.farm,
                    barnId: formData.barn,
                    stallId: formData.stall,
                },
            }
            await axios.post("/api/pigs", preparedData)
            console.log("Pig data submitted:", preparedData)
            onOpenChange(false)
        } catch (error) {
            console.error("Error submitting pig data:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderPage = () => {
        switch (currentPage) {
            case 1:
                return (
                    <FirstPage
                        formData={formData}
                        onUpdateForm={handleUpdateForm}
                        farms={farms}
                        barns={barns}
                        stalls={stalls}
                    />
                )
            case 2:
                return <SecondPage formData={formData} onUpdateForm={handleUpdateForm} />
            case 3:
                return <SummaryPage formData={formData} farms={farms} barns={barns} stalls={stalls} />
            default:
                return null
        }
    }

    const renderFooter = () => {
        if (currentPage === 1) {
            return (
                <>
                    <DrawerClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DrawerClose>
                    <Button
                        onClick={() => setCurrentPage(2)}
                        disabled={!formData.farm || !formData.barn || !formData.stall}
                    >
                        Continue
                    </Button>
                </>
            )
        }
        if (currentPage === 2) {
            return (
                <>
                    <Button variant="secondary" onClick={() => setCurrentPage(1)}>
                        Back
                    </Button>
                    <Button onClick={() => setCurrentPage(3)}>Review</Button>
                </>
            )
        }
        return (
            <>
                <Button variant="secondary" onClick={() => setCurrentPage(2)}>
                    Back
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Pig Data"}
                </Button>
            </>
        )
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="overflow-x-hidden sm:max-w-lg">
                {renderPage()}
                <DrawerFooter className="-mx-6 -mb-2 gap-2 px-6 sm:justify-between">
                    {renderFooter()}
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

