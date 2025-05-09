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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/Select"
import api from "@/lib/axios"
import { useEffect, useState } from "react"
import { PigData } from "../page"

interface EditPigDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pigData: PigData | null
  onSuccess: () => void
}

export function EditPigDrawer({ open, onOpenChange, pigData, onSuccess }: EditPigDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    breed: pigData?.breed || "",
    age: pigData?.age?.toString() || "",
    active: pigData?.active || true,
  })

  // Reset form data when pig data changes or drawer opens
  useEffect(() => {
    if (pigData && open) {
      setFormData({
        breed: pigData.breed || "",
        age: pigData.age?.toString() || "",
        active: pigData.active || true,
      })
    }
  }, [pigData, open])

  const handleSubmit = async () => {
    if (!pigData) return

    setIsSubmitting(true)
    try {
      // Prepare data for the API - only include fields that have been changed
      const updateData: Record<string, any> = {}

      // Only include fields that have values and have changed
      if (formData.breed && formData.breed !== pigData.breed) {
        updateData.breed = formData.breed
      }

      if (formData.age && parseInt(formData.age) !== pigData.age) {
        updateData.age = parseInt(formData.age)
      }

      if (formData.active !== pigData.active) {
        updateData.active = formData.active
      }

      // Only proceed if there are changes to submit
      if (Object.keys(updateData).length === 0) {
        alert("No changes were made.")
        onOpenChange(false)
        return
      }

      // Call the API to update the pig
      await api.put(`/pigs/${pigData.pigId}`, updateData)

      // Close the drawer and refresh data
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error updating pig:", error)
      alert("Failed to update pig. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit Pig #{pigData?.pigId}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="Enter breed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age (months)</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Enter age in months"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.active ? "active" : "inactive"}
                onValueChange={(value) => setFormData({ ...formData, active: value === "active" })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
