"use client";

import { Button } from "@/components/Button";
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/Drawer";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { RadioCardGroup, RadioCardItem } from "@/components/RadioCardGroup";
import {
  Select,
  SelectContent,
  SelectItemExtended,
  SelectTrigger,
  SelectValue,
} from "@/components/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs";
import api from "@/lib/axios";
import React, { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { PigIdInput } from "./CheckPig";

// -------------------------
// Types
// -------------------------

type Farm = {
  _id: string;
  name: string;
  location?: string;
  barns: [];
};

type Barn = {
  _id: string;
  name: string;
  description?: string;
  farmId: string;
};

type Stall = {
  _id: string;
  name: string;
  barnId: {
    _id: string;
    name: string;
  };
  farmId: string;
  createdAt: string;
  updatedAt: string;
};

export type PigFormData = {
  pigId: string; // numeric from "PIG-XXX"
  tag: string;   // e.g. "PIG-001"
  farm: string;  // from currentLocation.farmId
  barn: string;  // from currentLocation.barnId
  stall: string; // from currentLocation.stallId
  breed: string;
  age: string;
};

export type ServerPigData = {
  // e.g. from /api/pigs/${pigId}
  pigId: number;
  tag: string;
  owner: string;      // e.g. "PIG-085"
  breed?: string;
  age?: number;       // might be costs or something else
  currentLocation: {
    farmId?: string;
    barnId?: string;
    stallId?: string;
  };
  [key: string]: any; // everything else
};

// -------------------------
// parse numeric pigId from "PIG-085" => "085"
// -------------------------
function getNumericId(owner: string | undefined): string {
  if (!owner) return "";
  return owner.replace(/^PIG-/i, "").trim();
}

// -------------------------
// A list of valid file types for the Feed tab
// -------------------------
const fileTypes = [
  "Posture Data",
  "BCS Data",
  "PigBreathRate",
  "Pig HealthStatus",
  "Pig Heat Status",
  "Pig Vulva Sweeling",
];

// -------------------------
// Shared FormField
// -------------------------
const FormField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="mb-4">
    <Label className="font-medium">{label}</Label>
    <div className="mt-2">{children}</div>
  </div>
);

// -------------------------
// "Details" tab
// -------------------------
interface DetailsFormProps {
  formData: PigFormData;
  onUpdateForm: (updates: Partial<PigFormData>) => void;
}

function DetailsForm({ formData, onUpdateForm }: DetailsFormProps) {
  return (
    <div className="space-y-6">
      <FormField label="">
        <PigIdInput
          value={formData.pigId}
          onChange={(value) => onUpdateForm({ pigId: value })}
          onError={() => {
            /* handle error if needed */
          }}
        />
      </FormField>

      <FormField label="Tag (PIG-xxx)">
        <div className="flex">
          <Input disabled value="PIG -" className="h-auto w-auto" />
          <Input
            value={formData.tag.replace(/^PIG-?/i, "")}
            onChange={(e) => {
              const numericPart = e.target.value.replace(/\D/g, "");
              onUpdateForm({ tag: `PIG-${numericPart}` });
            }}
            placeholder="123"
          />
        </div>
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
    </div>
  );
}

// -------------------------
// "Farms" tab form
// If a pig already has a farm/barn/stall, display them in read-only
// until "Change Location" is clicked
// -------------------------
interface FarmsFormProps {
  formData: PigFormData;
  onUpdateForm: (updates: Partial<PigFormData>) => void;
  farms: Farm[];
  barns: Barn[];
  stalls: Stall[];
}

function FarmsForm({
  formData,
  onUpdateForm,
  farms,
  barns,
  stalls,
}: FarmsFormProps) {
  const alreadyHasLocation = !!(formData.farm && formData.barn && formData.stall);
  const [isEditingLocation, setIsEditingLocation] = useState<boolean>(
    !alreadyHasLocation
  );

  // Filter barns by the chosen farm
  const availableBarns = barns.filter((b) => b.farmId === formData.farm);

  // Filter stalls by the chosen barn
  const availableStalls = stalls.filter(
    (st) => st.barnId && st.barnId._id === formData.barn
  );

  return (
    <div className="space-y-6">
      {!isEditingLocation && alreadyHasLocation ? (
        <>
          {/* Show read-only farm/barn/stall */}
          <FormField label="Farm (assigned)">
            <Input
              value={formData.farm || ""}
              disabled
              placeholder="No farm"
            />
          </FormField>
          <FormField label="Barn (assigned)">
            <Input
              value={formData.barn || ""}
              disabled
              placeholder="No barn"
            />
          </FormField>
          <FormField label="Stall (assigned)">
            <Input
              value={formData.stall || ""}
              disabled
              placeholder="No stall"
            />
          </FormField>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setIsEditingLocation(true)}>
              Change Location
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Let user pick new farm/barn/stall */}
          <FormField label="Select Farm">
            <RadioCardGroup
              value={formData.farm}
              className="grid grid-cols-2 gap-2 text-sm"
              onValueChange={(value) => {
                onUpdateForm({ farm: value, barn: "", stall: "" });
              }}
            >
              {farms.map((farm) => (
                <RadioCardItem
                  key={farm._id}
                  value={farm._id}
                  className="flex flex-col justify-start p-2.5 text-base duration-75 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 data-[state=checked]:border-transparent data-[state=checked]:bg-blue-500 data-[state=checked]:text-white sm:text-sm"
                >
                  {farm.name}
                </RadioCardItem>
              ))}
            </RadioCardGroup>
          </FormField>

          <FormField label="Select Barn">
            <Select
              value={formData.barn}
              onValueChange={(value: string) =>
                onUpdateForm({ barn: value, stall: "" })
              }
              disabled={!formData.farm}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    formData.farm ? "Select Barn" : "Select Farm first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableBarns.map((barn) => (
                  <SelectItemExtended
                    key={barn._id}
                    value={barn._id}
                    option={barn.name}
                    description={barn.description || ""}
                  />
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Select Stall">
            <Select
              value={formData.stall}
              onValueChange={(value: string) => onUpdateForm({ stall: value })}
              disabled={!formData.barn}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    formData.barn ? "Select Stall" : "Select Barn first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableStalls.map((stall) => (
                  <SelectItemExtended
                    key={stall._id}
                    value={stall._id}
                    option={stall.name}
                    description={`Stall in barn ${stall.barnId?.name || ""}`}
                  />
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <div className="flex justify-end">
            {alreadyHasLocation && (
              <Button variant="secondary" onClick={() => setIsEditingLocation(false)}>
                Cancel
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// -------------------------
// "Feed" tab form
// -------------------------
interface FeedFormProps {
  pigId: string; // numeric pigId
}

function FeedForm({ pigId }: FeedFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFileType, setSelectedFileType] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  const { getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      const csvFiles = acceptedFiles.filter(
        (file) => file.type === "text/csv" || file.name.endsWith(".csv")
      );
      setFiles(csvFiles);
      if (csvFiles.length !== acceptedFiles.length) {
        setUploadError("Only .csv files are allowed.");
      } else {
        setUploadError(null);
      }
    },
    accept: {
      "text/csv": [".csv"],
    },
  });

  const handleUpload = async () => {
    if (!selectedFileType) {
      setUploadError("Please select a file type.");
      return;
    }
    if (files.length === 0) {
      setUploadError("Please select a file to upload.");
      return;
    }
    if (selectedFileType !== "Posture Data") {
      setUploadError("Only 'Posture Data' files can be uploaded here.");
      return;
    }

    const formData = new FormData();
    formData.append("file", files[0]);

    try {
      const response = await api.post(`/upload/postureUpload/${pigId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        setUploadSuccess(true);
        setUploadError(null);
        setFiles([]);
      } else {
        setUploadError("Failed to upload file. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadError("An error occurred while uploading the file.");
    }
  };

  const filesList = files.map((file) => (
    <li
      key={file.name}
      className="relative rounded-lg border border-gray-300 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#090E1A]"
    >
      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <button
          type="button"
          className="rounded-md p-2 text-gray-400 transition-all hover:text-rose-500 dark:text-gray-600 hover:dark:text-rose-500"
          aria-label="Remove file"
          onClick={() =>
            setFiles((prev) => prev.filter((f) => f.name !== file.name))
          }
        >
          X
        </button>
      </div>
      <div className="flex items-center space-x-3 truncate">
        <span className="flex w-10 h-10 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
          <span className="text-sm">CSV</span>
        </span>
        <div className="truncate pr-20">
          <p className="truncate text-xs font-medium text-gray-900 dark:text-gray-50">
            {file.name}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
            {file.size} bytes
          </p>
        </div>
      </div>
    </li>
  ));

  return (
    <div className="space-y-6">
      <div>
        <Label className="font-medium" htmlFor="fileType">
          File Type
        </Label>
        <Select
          value={selectedFileType}
          onValueChange={(value: string) => {
            setSelectedFileType(value);
            setUploadError(null);
          }}
        >
          <SelectTrigger id="fileType" className="mt-2">
            <SelectValue placeholder="Select file type" />
          </SelectTrigger>
          <SelectContent>
            {fileTypes.map((type, index) => (
              <SelectItemExtended
                key={index}
                value={type}
                option={type}
              />
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="file-upload" className="font-medium">
          Upload File
        </Label>
        <div className="relative mt-2 flex h-36 items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <div>
            <span className="flex justify-center text-4xl">📄</span>
            <div className="mt-2 text-center">
              <label
                htmlFor="file-upload"
                className="cursor-pointer rounded-md text-sm text-gray-700 dark:text-gray-300"
              >
                Click to select or drag file here
                <input
                  {...getInputProps()}
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                />
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Supported types: CSV
              </p>
            </div>
          </div>
        </div>
        {filesList.length > 0 && (
          <ul role="list" className="mt-2 space-y-4">
            {filesList}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <Button
          onClick={handleUpload}
          disabled={files.length === 0 || selectedFileType !== "Posture Data"}
          className="w-full"
        >
          Upload File
        </Button>
        {uploadError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {uploadError}
          </p>
        )}
        {uploadSuccess && (
          <p className="mt-2 text-sm text-green-600 dark:text-green-400">
            File uploaded successfully!
          </p>
        )}
      </div>
    </div>
  );
}

// -------------------------
// Main Drawer
// -------------------------
interface PigEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: ServerPigData; // The pig data
}

export function PigEditDrawer({
  open,
  onOpenChange,
  initialData,
}: PigEditDrawerProps) {
  // 1) If your server uses "owner" for the pig tag, parse from that
  //    e.g. if initialData.owner === "PIG-001"
  const numericId = useMemo(() => getNumericId(initialData.owner), [initialData.owner]);

  // 2) Initialize form
  const [formData, setFormData] = useState<PigFormData>({
    pigId: numericId,
    tag: initialData.owner,
    farm: "",
    barn: "",
    stall: "",
    breed: initialData.breed ?? "",
    age: initialData.age !== undefined ? String(initialData.age) : "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("farms");

  // Data lists
  const [farms, setFarms] = useState<Farm[]>([]);
  const [barns, setBarns] = useState<Barn[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);

  // -------------------------
  // On mount, fetch the pig data by pigId for location
  // You said it returns currentLocation with farmId, barnId, stallId
  // -------------------------
  useEffect(() => {
    if (!formData.pigId) return;

    api
      .get(`/pigs/${formData.pigId}`)
      .then((res) => {
        // Suppose: res.data.currentLocation = { farmId, barnId, stallId }
        const location = res.data?.currentLocation;
        if (location) {
          setFormData((prev) => ({
            ...prev,
            farm: location.farmId || "",
            barn: location.barnId || "",
            stall: location.stallId || "",
          }));
        }
      })
      .catch((err) => console.error("Error fetching pig location:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.pigId]);

  // -------------------------
  // Fetch farms on mount
  // -------------------------
  useEffect(() => {
    api
      .get("/farms")
      .then((res) => setFarms(res.data))
      .catch((err) => console.error("Error fetching farms:", err));
  }, []);

  // -------------------------
  // Fetch barns whenever farm changes
  // -------------------------
  useEffect(() => {
    if (!formData.farm) {
      setBarns([]);
      return;
    }
    api
      .get(`/barns/farm/${formData.farm}`)
      .then((res) => setBarns(res.data))
      .catch((err) => console.error("Error fetching barns:", err));
  }, [formData.farm]);

  // -------------------------
  // Fetch stalls whenever barn changes
  // -------------------------
  useEffect(() => {
    if (!formData.barn) {
      setStalls([]);
      return;
    }
    api
      .get(`/stalls/barn/${formData.barn}`)
      .then((res) => setStalls(res.data))
      .catch((err) => console.error("Error fetching stalls:", err));
  }, [formData.barn]);

  // Helper
  const handleUpdateForm = (updates: Partial<PigFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // -------------------------
  // Submit changes
  // -------------------------
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Prepare data for your PUT or PATCH
      const preparedData = {
        pigId: Number(formData.pigId),
        tag: formData.tag,   // e.g. "PIG-001"
        breed: formData.breed,
        age: Number(formData.age),
        currentLocation: {
          farmId: formData.farm,
          barnId: formData.barn,
          stallId: formData.stall,
        },
      };
      await api.put(`/pigs/${formData.pigId}`, preparedData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating pig data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If farm, barn, or stall is missing, disable "Details" and "Feed"
  const isLocationComplete =
    !!formData.farm && !!formData.barn && !!formData.stall;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="overflow-x-hidden sm:max-w-lg">
        <DrawerHeader>
          <DrawerTitle>
            <p>Edit Pig Data</p>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-500">
              Edit Pig Data for Pig {formData.pigId || "No Tag"}
            </span>
          </DrawerTitle>
        </DrawerHeader>

        <DrawerBody className="-mx-6 space-y-6 overflow-y-scroll border-t border-gray-200 px-6 dark:border-gray-800">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="px-6">
              <TabsTrigger value="farms" className="px-4">
                Farm
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="px-4"
                disabled={!isLocationComplete}
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="feed"
                className="px-4"
                disabled={!isLocationComplete}
              >
                Feed
              </TabsTrigger>
            </TabsList>

            <TabsContent value="farms" className="px-6 py-4">
              <FarmsForm
                formData={formData}
                onUpdateForm={handleUpdateForm}
                farms={farms}
                barns={barns}
                stalls={stalls}
              />
            </TabsContent>

            <TabsContent value="details" className="px-6 py-4">
              <DetailsForm formData={formData} onUpdateForm={handleUpdateForm} />
            </TabsContent>

            <TabsContent value="feed" className="px-6 py-4">
              <FeedForm pigId={formData.pigId} />
            </TabsContent>
          </Tabs>
        </DrawerBody>

        <DrawerFooter className="-mx-6 -mb-2 gap-2 px-6">
          <DrawerClose asChild>
            <Button variant="secondary" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Changes"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
