"use client";

import { useState } from "react";
import { Wrench, Plus, Edit2, Trash2, Tag, Clock, X } from "lucide-react";
import { adminCreateService, adminUpdateService, adminDeleteService } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export default function ServiceManager({ initialServices }: { initialServices: any[] }) {
    const router = useRouter();
    const [services, setServices] = useState(initialServices);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        category: "Maintenance",
        price: 0,
        duration_hours: 1,
        summary: "",
        included: "", // store as string delimited by newline for editing
        image: "",
        emergency: false,
    });

    const openCreateModal = () => {
        setEditingService(null);
        setFormData({
            name: "",
            category: "Maintenance",
            price: 0,
            duration_hours: 1,
            summary: "",
            included: "",
            image: "",
            emergency: false,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (service: any) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            category: service.category || "Maintenance",
            price: service.price || 0,
            duration_hours: service.duration_hours || 1,
            summary: service.summary || "",
            included: Array.isArray(service.included) ? service.included.join("\n") : "",
            image: service.image || "",
            emergency: service.emergency || false,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;
        const res = await adminDeleteService(id);
        if (res.success) {
            setServices(services.filter(s => s.id !== id));
            router.refresh();
        } else {
            alert("Error deleting service: " + res.error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const dataToSave = {
            ...formData,
            price: Number(formData.price),
            duration_hours: Number(formData.duration_hours),
            included: formData.included.split("\n").map(i => i.trim()).filter(i => i), // Parse string to array
        };

        if (editingService) {
            const res = await adminUpdateService(editingService.id, dataToSave);
            if (res.success) {
                setServices(services.map(s => s.id === editingService.id ? { ...s, ...dataToSave } : s));
                router.refresh();
                closeModal();
            } else {
                alert("Error updating service: " + res.error);
            }
        } else {
            const res = await adminCreateService(dataToSave);
            if (res.success) {
                // To get the real generated ID, we just refresh the page data
                router.refresh();
                // Optimistic UI update
                setServices([...services, { ...dataToSave, id: Date.now().toString() }]);
                closeModal();
            } else {
                alert("Error creating service: " + res.error);
            }
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Services Catalog</h1>
                    <p className="text-muted-foreground mt-1">Manage the services offered on the customer booking portal.</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-primary hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus className="w-5 h-5" /> Add New Service
                </button>
            </div>

            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden min-h-[500px]">
                {services.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                        <Wrench className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-foreground">No Services Found</h3>
                        <p className="text-muted-foreground mt-2">Add your first service to start accepting bookings.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-muted/30 border-b border-border text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Service Name</th>
                                    <th className="px-6 py-4 font-semibold">Category</th>
                                    <th className="px-6 py-4 font-semibold">Price (LKR)</th>
                                    <th className="px-6 py-4 font-semibold">Duration</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {services.map((s: any) => (
                                    <tr key={s.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-foreground">{s.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1 text-muted-foreground capitalize">
                                                <Tag className="w-4 h-4" /> {s.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-primary">
                                            {s.price?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="w-4 h-4" /> {s.duration_hours}h
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex gap-2 justify-end">
                                                <button
                                                    onClick={() => openEditModal(s)}
                                                    className="p-2 bg-secondary text-foreground hover:bg-muted rounded-md transition-colors"
                                                    title="Edit Service"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s.id)}
                                                    className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors"
                                                    title="Delete Service"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-border">
                            <h2 className="text-2xl font-bold text-foreground">
                                {editingService ? "Edit Service" : "Add New Service"}
                            </h2>
                            <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition-colors p-1 bg-secondary rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="serviceForm" onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground">Service Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground">Category</label>
                                        <select
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
                                        >
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Performance">Performance</option>
                                            <option value="Engine">Engine</option>
                                            <option value="Emergency">Emergency</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground">Price (LKR)</label>
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-foreground">Duration (Hours)</label>
                                        <input
                                            required
                                            type="number"
                                            min="0.5"
                                            step="0.5"
                                            value={formData.duration_hours}
                                            onChange={(e) => setFormData({ ...formData, duration_hours: Number(e.target.value) })}
                                            className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-foreground">Short Summary</label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={formData.summary}
                                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                        className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none resize-none"
                                        placeholder="Brief 1-sentence description displayed on cards."
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-foreground">What's Included (1 item per line)</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.included}
                                        onChange={(e) => setFormData({ ...formData, included: e.target.value })}
                                        className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none resize-none"
                                        placeholder="Engine block inspection&#10;Oil and filter replacement&#10;Brake pad health check"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-foreground">Image URL</label>
                                    <input
                                        type="url"
                                        value={formData.image}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="emergency"
                                        checked={formData.emergency}
                                        onChange={(e) => setFormData({ ...formData, emergency: e.target.checked })}
                                        className="w-4 h-4 text-primary bg-input border-border focus:ring-primary"
                                    />
                                    <label htmlFor="emergency" className="text-sm font-semibold text-foreground">Flag as Emergency Service (Displays warning badge)</label>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-border bg-secondary flex justify-end gap-3 mt-auto">
                            <button
                                onClick={closeModal}
                                className="px-5 py-2.5 rounded-lg text-foreground bg-background border border-border hover:bg-muted font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="serviceForm"
                                disabled={isSubmitting}
                                className="px-5 py-2.5 rounded-lg text-white bg-primary hover:bg-red-700 font-bold disabled:opacity-50 transition-colors shadow-lg shadow-primary/20"
                            >
                                {isSubmitting ? "Saving..." : "Save Service"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

