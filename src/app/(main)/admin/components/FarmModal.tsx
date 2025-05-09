"use client";

import { Button } from "@/components/Button_S";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/Dialog";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { Textarea } from "@/components/Textarea";
import { Switch } from "@/components/Switch";
import { useState, useEffect } from "react";

type FarmType = {
  _id?: string;
  name: string;
  location: string;
  description: string;
  isActive: boolean;
};

type FarmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (farmData: FarmType) => void;
  farm?: FarmType | null;
  mode: "view" | "edit" | "create";
  title?: string;
};

export function FarmModal({
  isOpen,
  onClose,
  onSubmit,
  farm = null,
  mode = "create",
  title,
}: FarmModalProps) {
  const [formData, setFormData] = useState<FarmType>({
    name: "",
    location: "",
    description: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when farm changes
  useEffect(() => {
    if (farm) {
      setFormData({
        _id: farm._id,
        name: farm.name || "",
        location: farm.location || "",
        description: farm.description || "",
        isActive: farm.isActive !== false, // Default to true if undefined
      });
    } else {
      setFormData({
        name: "",
        location: "",
        description: "",
        isActive: true,
      });
    }
  }, [farm]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Farm name is required";
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "view") {
      onClose();
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    onSubmit(formData);
  };

  const getModalTitle = () => {
    if (title) return title;
    
    switch (mode) {
      case "create":
        return "Add New Farm";
      case "edit":
        return "Edit Farm";
      case "view":
        return "Farm Details";
      default:
        return "Farm";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Farm Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={mode === "view"}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={mode === "view"}
              className={errors.location ? "border-red-500" : ""}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={mode === "view"}
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isActive}
              onCheckedChange={handleSwitchChange}
              disabled={mode === "view"}
              id="isActive"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            
            {mode !== "view" && (
              <Button type="submit">
                {mode === "create" ? "Create Farm" : "Save Changes"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
