"use client";

import { Button } from "@/components/Button_S";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/Dialog";

type FarmType = {
  _id: string;
  name: string;
  location: string;
  description?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
};

type SimpleFarmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  farm?: FarmType | null;
  mode: "view" | "edit" | "create";
};

export function SimpleFarmModal({
  isOpen,
  onClose,
  farm = null,
  mode = "view",
}: SimpleFarmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "view" ? "View Farm" : mode === "edit" ? "Edit Farm" : "Create Farm"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <h3 className="font-bold">Farm Details</h3>

          {farm ? (
            <div className="mt-2 space-y-2">
              <p><span className="font-medium">Name:</span> {farm.name}</p>
              <p><span className="font-medium">Location:</span> {farm.location}</p>
              <p><span className="font-medium">Description:</span> {farm.description || "N/A"}</p>
              <p><span className="font-medium">Status:</span> {farm.isActive ? "Active" : "Inactive"}</p>
            </div>
          ) : (
            <p className="mt-2">No farm data available</p>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
