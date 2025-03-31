"use client";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Card, CardContent } from "@/components/ui/card";
import { PigIdInput } from "@/components/ui/data-table/CheckPig";
import api from "@/lib/axios";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

const slideVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
};

export default function PigOnboardingWalkthrough() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [farms, setFarms] = useState<any[]>([]);
    const [barns, setBarns] = useState<any[]>([]);
    const [stalls, setStalls] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        pigId: "",
        tag: "",
        farm: "",
        barn: "",
        stall: "",
        breed: "",
        age: "",
    });

    useEffect(() => {
        api.get("/farms").then((res) => setFarms(res.data));
    }, []);

    useEffect(() => {
        if (formData.farm) {
            api.get(`/barns/farm/${formData.farm}`).then((res) => setBarns(res.data));
        } else {
            setBarns([]);
        }
    }, [formData.farm]);

    useEffect(() => {
        if (formData.barn) {
            api.get(`/stalls/barn/${formData.barn}`).then((res) => setStalls(res.data));
        } else {
            setStalls([]);
        }
    }, [formData.barn]);

    const handleUpdateForm = (updates: Partial<typeof formData>) => {
        setFormData((prev) => ({ ...prev, ...updates }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
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
            };
            await api.post("/pigs", preparedData);
            alert("Pig successfully added!");
            setStep(1);
            setFormData({ pigId: "", tag: "", farm: "", barn: "", stall: "", breed: "", age: "" });
        } catch (err) {
            console.error("Error submitting pig:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const ProgressStep = ({ label, active }: { label: string; active: boolean }) => (
        <div className={`flex items-center gap-2 ${active ? "text-blue-600" : "text-gray-400"}`}>
            <CheckCircle2 className={`h-5 w-5 ${active ? "text-green-500" : "text-gray-300"}`} />
            <span>{label}</span>
        </div>
    );

    return (
        <div className="mx-auto max-w-2xl space-y-8 p-6 text-center">
            <h2 className="text-2xl font-semibold">Onboard Your First Pig</h2>
            <div className="flex justify-center gap-6">
                <ProgressStep label="Location" active={step >= 1} />
                <ProgressStep label="Details" active={step >= 2} />
                <ProgressStep label="Review" active={step === 3} />
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div key="step1" initial="initial" animate="animate" exit="exit" variants={slideVariants}>
                        <Card className="rounded-xl border border-blue-300 shadow-md">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="text-lg font-semibold">Select Pig Location</h3>
                                <select value={formData.farm} onChange={(e) => handleUpdateForm({ farm: e.target.value, barn: "", stall: "" })} className="w-full rounded-md border p-2">
                                    <option value="">Select Farm</option>
                                    {farms.map((f) => (<option key={f._id} value={f._id}>{f.name}</option>))}
                                </select>

                                <select value={formData.barn} onChange={(e) => handleUpdateForm({ barn: e.target.value, stall: "" })} disabled={!formData.farm} className="w-full rounded-md border p-2">
                                    <option value="">Select Barn</option>
                                    {barns.map((b) => (<option key={b._id} value={b._id}>{b.name}</option>))}
                                </select>

                                <select value={formData.stall} onChange={(e) => handleUpdateForm({ stall: e.target.value })} disabled={!formData.barn} className="w-full rounded-md border p-2">
                                    <option value="">Select Stall</option>
                                    {stalls.map((s) => (<option key={s._id} value={s._id}>{s.name}</option>))}
                                </select>

                                <div className="pt-2">
                                    <Button onClick={() => setStep(2)} disabled={!formData.farm || !formData.barn || !formData.stall}>Continue</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="step2" initial="initial" animate="animate" exit="exit" variants={slideVariants}>
                        <Card className="rounded-xl border border-purple-300 shadow-md">
                            <CardContent className="p-6 space-y-4">
                                <h3 className="text-lg font-semibold">Enter Pig Details</h3>

                                <PigIdInput
                                    value={formData.pigId || ""}
                                    onChange={(value) => handleUpdateForm({ pigId: value, tag: `PIG-${value}` })}
                                    onError={() => { }}
                                />

                                <Input disabled value={formData.tag} placeholder="Tag will auto-fill" />
                                <Input value={formData.breed} onChange={(e) => handleUpdateForm({ breed: e.target.value })} placeholder="Breed" />
                                <Input type="number" min="0" value={formData.age} onChange={(e) => handleUpdateForm({ age: e.target.value })} placeholder="Age in months" />

                                <div className="pt-2 flex justify-between">
                                    <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                                    <Button onClick={() => setStep(3)} disabled={!formData.pigId || !formData.breed || !formData.age}>Review</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="step3" initial="initial" animate="animate" exit="exit" variants={slideVariants}>
                        <Card className="rounded-xl border border-green-300 shadow-md">
                            <CardContent className="p-6 space-y-4 text-left">
                                <h3 className="text-lg font-semibold text-center">Review Pig Info</h3>
                                <p><strong>Pig ID:</strong> {formData.pigId}</p>
                                <p><strong>Tag:</strong> {formData.tag}</p>
                                <p><strong>Breed:</strong> {formData.breed}</p>
                                <p><strong>Age:</strong> {formData.age} months</p>
                                <p><strong>Farm:</strong> {farms.find(f => f._id === formData.farm)?.name}</p>
                                <p><strong>Barn:</strong> {barns.find(b => b._id === formData.barn)?.name}</p>
                                <p><strong>Stall:</strong> {stalls.find(s => s._id === formData.stall)?.name}</p>

                                <div className="pt-4 flex justify-between">
                                    <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                                        {isSubmitting ? "Submitting..." : "Submit Pig"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
