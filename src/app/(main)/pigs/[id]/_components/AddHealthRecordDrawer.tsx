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
import { Textarea } from "@/components/Textarea"
import api from "@/lib/axios"
import { useEffect, useState } from "react"

interface AddHealthRecordDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pigId: number | undefined
  onSuccess: () => void
}

export function AddHealthRecordDrawer({ open, onOpenChange, pigId, onSuccess }: AddHealthRecordDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    status: "healthy",
    notes: "",
    temperature: "",
    respiratoryRate: "",
    weight: "",
  })

  // Reset form when drawer opens
  useEffect(() => {
    if (open) {
      setFormData({
        status: "healthy",
        notes: "",
        temperature: "",
        respiratoryRate: "",
        weight: "",
      })
    }
  }, [open])

  const handleSubmit = async () => {
    if (!pigId) return

    // Validate that notes field is filled
    if (!formData.notes.trim()) {
      alert("Please add notes about this health record.")
      return
    }

    setIsSubmitting(true)
    try {
      // Prepare data for the API
      const healthData = {
        // Ensure pigId is a number, not an ObjectId
        pigId: typeof pigId === 'number' ? pigId : parseInt(String(pigId).replace(/\D/g, ''), 10) || 0,
        status: formData.status,
        notes: formData.notes,
        metrics: {
          // Only include metrics that have values
          ...(formData.temperature ? { temperature: parseFloat(formData.temperature) } : {}),
          ...(formData.respiratoryRate ? { respiratoryRate: parseInt(formData.respiratoryRate) } : {}),
          ...(formData.weight ? { weight: parseFloat(formData.weight) } : {}),
        },
        timestamp: new Date().toISOString(),
      }

      // Call the API to add health record - use the numeric pigId in the URL
      const numericPigId = typeof pigId === 'number' ? pigId : parseInt(String(pigId).replace(/\D/g, ''), 10) || pigId
      await api.post(`/pigs/${numericPigId}/health-status`, healthData)

      // Close the drawer and refresh data
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("Error adding health record:", error)
      alert("Failed to add health record. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Health Record for Pig #{pigId}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Health Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="at risk">At Risk</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="no movement">No Movement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                placeholder="Enter temperature"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="respiratoryRate">Respiratory Rate (breaths/min)</Label>
              <Input
                id="respiratoryRate"
                type="number"
                value={formData.respiratoryRate}
                onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                placeholder="Enter respiratory rate"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="Enter weight"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter any observations or notes"
                rows={4}
              />
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add Health Record"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
