"use client";

import { SimpleButton } from "@/components/SimpleButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/Dialog";
import { Input } from "@/components/Input";
import { Label } from "@/components/Label";
import { Textarea } from "@/components/Textarea";
import { Switch } from "@/components/Switch";
import { Button } from "@/components/Button_S";
import api from "@/utils/api";
import { useEffect, useState } from "react";

type FarmType = {
  _id: string;
  name: string;
  location: string;
  description?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
};

type FarmDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  farm: FarmType | null;
  mode: "view" | "edit";
  onSuccess?: () => void;
};

export default function FarmDetailsModal({
  isOpen,
  onClose,
  farm,
  mode,
  onSuccess
}: FarmDetailsModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('FarmDetailsModal - farm prop changed:', farm);
    console.log('FarmDetailsModal - isOpen:', isOpen, 'mode:', mode);

    if (farm) {
      const newFormData = {
        name: farm.name,
        location: farm.location,
        description: farm.description || "",
        isActive: farm.isActive !== false
      };

      console.log('FarmDetailsModal - setting formData:', newFormData);
      setFormData(newFormData);
      setErrors({});
    } else {
      console.log('FarmDetailsModal - farm is null, using default formData');
    }
  }, [farm, isOpen, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "view") {
      onClose();
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Updating farm with data:", formData);
      
      if (farm?._id) {
        const response = await api.put(`/api/farms/${farm._id}`, formData);
        console.log("Farm updated successfully:", response.data);
      }
      
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error("Error updating farm:", error);
      
      // Handle validation errors from server
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          form: error.response?.data?.error || "Failed to update farm. Please try again."
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !farm) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "view" ? "Farm Details" : "Edit Farm"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {errors.form && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{errors.form}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Farm Name {mode === "edit" && "*"}</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={mode === "view"}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location {mode === "edit" && "*"}</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={mode === "view"}
              className={errors.location ? "border-red-500" : ""}
            />
            {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
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
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={handleSwitchChange}
              disabled={mode === "view"}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
            {mode === "edit" && (
              <Button
                type="submit"
                isLoading={isSubmitting}
                loadingText="Saving..."
              >
                Save Changes
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
