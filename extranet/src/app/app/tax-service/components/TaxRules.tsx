import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { toast } from "react-hot-toast";
import { TaxDeleteModal } from "./TaxDeleteModal";
import type { TaxRule } from "../../../../types/taxTypes";
import { CustomDropdown } from "../../../../components/ui/custom-dropdown";

const TAX_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

type InputEvent =
    | React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    | { target: { name: string; value: string; type?: string } };

// Define props interface
type TaxRulesProps = {
    propertyId: string;
    accessToken: string;
    initialRules: TaxRule[];
    onUpdate: (rules: TaxRule[]) => void;
};

export const TaxRules = ({ propertyId, accessToken, initialRules, onUpdate }: TaxRulesProps) => {
    const [rules, setRules] = useState<TaxRule[]>(initialRules);
    const [loading, setLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
    // Dropdown options
    const taxTypeOptions = [
        { value: "PERCENTAGE", label: "Percentage (%)" },
        // { value: "FIXED", label: "Fixed Amount" }
    ];

    const applicableOnOptions = [
        {
            value: "ROOM_RATE",
            label: "Room Rate Only",
            description: "Applies only to room charges"
        }
        // {
        //     value: "TOTAL_AMOUNT",
        //     label: "Total Amount",
        //     description: "Applies to the entire booking total"
        // },
    ];
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        ruleId: string | null;
        ruleName: string;
    }>({
        isOpen: false,
        ruleId: null,
        ruleName: ""
    });
    // Create form state
    const [form, setForm] = useState({
        name: "",
        type: "PERCENTAGE" as const,
        value: "",
        applicableOn: "ROOM_RATE" as const,
        country: "",
        description: "",
        validFrom: "",
        isInclusive: false,
        priority: 1,
    });

    // Edit form state
    const [editingRule, setEditingRule] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<{
        name: string;
        type: string;
        value: string;
        applicableOn: string;
        country: string;
        description: string;
        validFrom: string;
        isInclusive: boolean;
        priority: number;
    }>({
        name: "",
        type: "PERCENTAGE",
        value: "",
        applicableOn: "ROOM_RATE",
        country: "",
        description: "",
        validFrom: "",
        isInclusive: false,
        priority: 1,
    });

    const handleChange = (e: InputEvent) => {
        const target = 'target' in e ? e.target : e;
        const { name, value } = target;

        let checkedValue: boolean | undefined;
        if ('checked' in target) {
            checkedValue = (target as HTMLInputElement).checked;
        }

        setForm((prev) => ({
            ...prev,
            [name]: target.type === "checkbox" ? checkedValue : value,
        }));
    };

    const handleEditChange = (e: InputEvent) => {
        const target = 'target' in e ? e.target : e;
        const { name, value } = target;

        let checkedValue: boolean | undefined;
        if ('checked' in target) {
            checkedValue = (target as HTMLInputElement).checked;
        }

        setEditForm((prev) => ({
            ...prev,
            [name]: target.type === "checkbox" ? checkedValue : value,
        }));
    };

    const startEdit = (rule: TaxRule) => {
        setEditingRule(rule._id);
        setEditForm({
            name: rule.name,
            type: rule.type,
            value: rule.value.toString(),
            applicableOn: rule.applicableOn,
            country: rule.region?.country || "",
            description: rule.description || "",
            validFrom: rule.validFrom ? new Date(rule.validFrom).toISOString().slice(0, 10) : "",
            isInclusive: rule.isInclusive,
            priority: rule.priority || 1,
        });
    };
    const convertDateToUTC = (dateString: string): string => {
        if (!dateString) return "";
        const date = new Date(dateString + "T00:00:00.000Z");
        return date.toISOString();
    };
    const saveEdit = async () => {
        if (!editingRule) return;

        // Convert and validate 'value' as number
        const numValue = Number(editForm.value);
        if (isNaN(numValue) || numValue < 0) {
            toast.error("Valid numeric value is required");
            return;
        }

        // Convert and validate 'priority' as number
        const numPriority = Number(editForm.priority);
        if (isNaN(numPriority) || numPriority < 1) {
            toast.error("Priority must be a positive number");
            return;
        }

        // Required fields check
        if (!editForm.name.trim() || !editForm.country.trim()) {
            toast.error("Name and Country are required");
            return;
        }

        await handleUpdate(editingRule, {
            name: editForm.name.trim(),
            type: editForm.type as "PERCENTAGE" | "FIXED",
            value: numValue,
            applicableOn: editForm.applicableOn as "TOTAL_AMOUNT" | "ROOM_RATE",
            region: { country: editForm.country.trim() },
            description: editForm.description || undefined,
            validFrom: editForm.validFrom ? convertDateToUTC(editForm.validFrom) : undefined,
            isInclusive: editForm.isInclusive,
            priority: numPriority,
        });

        setEditingRule(null);
    };

    const cancelEdit = () => {
        setEditingRule(null);
        setEditForm({
            name: "",
            type: "PERCENTAGE",
            value: "",
            applicableOn: "ROOM_RATE",
            country: "",
            description: "",
            validFrom: "",
            isInclusive: false,
            priority: 1,
        });
    };

    const handleCreate = async () => {
        if (!form.name.trim() || !form.country.trim() || !form.value) {
            toast.error("Name, Country, and Value are required");
            return;
        }

        const numValue = Number(form.value);
        const numPriority = Number(form.priority);

        if (isNaN(numValue) || numValue < 0) {
            toast.error("Valid numeric value is required");
            return;
        }

        if (isNaN(numPriority) || numPriority < 1) {
            toast.error("Priority must be a positive number");
            return;
        }

        const payload = {
            name: form.name.trim(),
            type: form.type,
            value: numValue,
            applicableOn: form.applicableOn,
            region: { country: form.country.trim() },
            description: form.description || undefined,
            validFrom: form.validFrom ? convertDateToUTC(form.validFrom) : undefined,
            isInclusive: form.isInclusive,
            priority: numPriority,
            hotelId: propertyId,
        };

        setCreateLoading(true);
        try {
            const res = await fetch(`${TAX_API_BASE}/tax-rule`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                await refetchRules();
                toast.success("Tax rule created successfully!");
                resetForm();
                setShowCreateForm(false);
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(`Failed: ${errorData.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Error creating tax rule:", err);
            toast.error("Network error");
        } finally {
            setCreateLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: "",
            type: "PERCENTAGE",
            value: "",
            applicableOn: "ROOM_RATE",
            country: "",
            description: "",
            validFrom: "",
            isInclusive: false,
            priority: 1,
        });
    };

    const refetchRules = async () => {
        try {
            const res = await fetch(`${TAX_API_BASE}/tax-rule/hotel/${propertyId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                const rulesData = await res.json();
                const rulesArray = Array.isArray(rulesData.data) ? rulesData.data : [rulesData.data].filter(Boolean);
                setRules(rulesArray);
                onUpdate(rulesArray);
            }
        } catch (error) {
            console.error("Error refetching rules:", error);
        }
    };

    const handleUpdate = async (id: string, updates: Partial<Omit<TaxRule, "_id" | "hotelId">>) => {
        setUpdateLoading(true);
        try {
            const payload = {
                ...updates,
                hotelId: propertyId
            };

            const res = await fetch(`${TAX_API_BASE}/tax-rule/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                await refetchRules();
                toast.success("Tax rule updated successfully!");
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(`Failed to update tax rule: ${errorData.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Error updating tax rule:", err);
            toast.error("Network error: Could not connect to server");
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.ruleId) return;

        setDeleteLoading(true);
        try {
            const res = await fetch(`${TAX_API_BASE}/tax-rule/${deleteModal.ruleId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (res.ok) {
                await refetchRules();
                toast.success("Tax rule deleted successfully!");
                closeDeleteModal();
            } else {
                const errorData = await res.json().catch(() => ({}));
                toast.error(`Failed to delete tax rule: ${errorData.message || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Error deleting tax rule:", err);
            toast.error("Delete failed");
        } finally {
            setDeleteLoading(false);
        }
    };
    const openDeleteModal = (ruleId: string, ruleName: string) => {
        setDeleteModal({
            isOpen: true,
            ruleId,
            ruleName
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            ruleId: null,
            ruleName: ""
        });
    };

    // const handleDuplicate = async (rule: TaxRule) => {
    //     const payload = {
    //         name: `${rule.name}`,
    //         type: rule.type,
    //         value: rule.value,
    //         applicableOn: rule.applicableOn,
    //         region: rule.region,
    //         description: rule.description,
    //         validFrom: rule.validFrom,
    //         isInclusive: rule.isInclusive,
    //         priority: rule.priority,
    //         hotelId: propertyId,
    //     };

    //     setLoading(true);
    //     try {
    //         const res = await fetch(`${TAX_API_BASE}/tax-rule`, {
    //             method: "POST",
    //             headers: {
    //                 Authorization: `Bearer ${accessToken}`,
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify(payload),
    //         });

    //         if (res.ok) {
    //             await refetchRules();
    //             toast.success("Tax rule duplicated successfully!");
    //         } else {
    //             const errorData = await res.json().catch(() => ({}));
    //             toast.error(`Failed to duplicate tax rule: ${errorData.message || "Unknown error"}`);
    //         }
    //     } catch (err) {
    //         console.error("Error duplicating tax rule:", err);
    //         toast.error("Network error: Could not connect to server");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // Filter and search rules
    const filteredRules = rules.filter(rule => {
        const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rule.region?.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rule.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === "all" ||
            (filterStatus === "active" && rule.isInclusive) ||
            (filterStatus === "inactive" && !rule.isInclusive);

        return matchesSearch && matchesFilter;
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleDateString();
    };

    const formatValue = (type: string, value: number) => {
        if (type === "PERCENTAGE") {
            return `${value}%`;
        }
        return `$${value.toFixed(2)}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-tripswift-blue to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Tax Rules Management</h1>
                                <p className="text-slate-600 mt-1">Configure and manage tax rules for your property bookings</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <Button
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                className="bg-gradient-to-r from-tripswift-blue to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
                            >
                                {/* <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg> */}
                                {showCreateForm ? "Cancel" : "Create New Rule"}
                            </Button>
                        </div>
                    </div>
                </div>

                {showCreateForm && (
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Create New Tax Rule</h2>
                                    <p className="text-emerald-100">Add a new tax rule to apply to your property bookings</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700 flex items-center">
                                        Tax Rule Name
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="e.g., GST Tax"
                                        className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-slate-300"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700">Tax Type</Label>
                                    <CustomDropdown
                                        name="type"
                                        value={form.type}
                                        onChange={handleChange}
                                        options={taxTypeOptions}
                                        placeholder="Select tax type..."
                                        disabled={loading}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700 flex items-center">
                                        Value {form.type === "PERCENTAGE" ? "(%)" : "(Amount)"}
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        name="value"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={form.value}
                                        onChange={handleChange}
                                        placeholder={form.type === "PERCENTAGE" ? "8.0" : "100.00"}
                                        className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-slate-300"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700 flex items-center">
                                        Country/Region
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <Input
                                        name="country"
                                        value={form.country}
                                        onChange={handleChange}
                                        placeholder="e.g., Bahrain"
                                        className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-slate-300"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700 flex items-center">
                                        Applicable On
                                        <span className="text-red-500 ml-1">*</span>
                                    </Label>
                                    <CustomDropdown
                                        name="applicableOn"
                                        value={form.applicableOn}
                                        onChange={handleChange}
                                        options={applicableOnOptions}
                                        placeholder="Select where tax applies..."
                                        disabled={loading}
                                        className="w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700">Priority</Label>
                                    <Input
                                        name="priority"
                                        type="number"
                                        min="1"
                                        value={form.priority}
                                        onChange={handleChange}
                                        placeholder="1"
                                        className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-slate-300"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700">Description</Label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        placeholder="Optional description of this tax rule..."
                                        disabled={loading}
                                        rows={3}
                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-700">Valid From</Label>
                                    <Input
                                        name="validFrom"
                                        type="date"
                                        value={form.validFrom}
                                        onChange={handleChange}
                                        className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-slate-300"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                                <label className="flex items-center space-x-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isInclusive"
                                        checked={form.isInclusive}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="w-5 h-5 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                                    />
                                    <div>
                                        <span className="text-sm font-semibold text-slate-700">Tax Inclusive</span>
                                        <div className="text-xs text-slate-500">Tax included in displayed price</div>
                                    </div>
                                </label>

                                <div className="flex space-x-3">
                                    <Button
                                        variant="outline"
                                        onClick={resetForm}
                                        disabled={loading}
                                        className="border-slate-300 hover:bg-slate-50"
                                    >
                                        Reset Form
                                    </Button>
                                    <Button
                                        onClick={handleCreate}
                                        disabled={createLoading || !form.name.trim() || !form.country.trim() || !form.value}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 shadow-lg"
                                    >
                                        {createLoading ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating...
                                            </div>
                                        ) : (
                                            "Create Tax Rule"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900">
                            Tax Rules ({filteredRules.length})
                        </h2>
                    </div>

                    {filteredRules.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-slate-200/60">
                            <div className="w-16 h-16 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {searchTerm || filterStatus !== "all" ? "No matching rules found" : "No tax rules yet"}
                            </h3>
                            <p className="text-slate-600 mb-6">
                                {searchTerm || filterStatus !== "all"
                                    ? "Try adjusting your search or filter criteria to find what you're looking for."
                                    : "Get started by creating your first tax rule to manage property taxes effectively."
                                }
                            </p>
                            <Button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-gradient-to-r from-tripswift-blue to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg"
                            >
                                Create Your First Tax Rule
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {filteredRules.map((rule) => (
                                <div key={rule._id} className="bg-white border border-slate-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                    {editingRule === rule._id ? (
                                        // Enhanced Edit Mode
                                        <div>
                                            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6">
                                                <h3 className="text-lg font-semibold text-white flex items-center">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit Tax Rule
                                                </h3>
                                            </div>

                                            <div className="p-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-slate-700">Name</Label>
                                                        <Input
                                                            name="name"
                                                            value={editForm.name}
                                                            onChange={handleEditChange}
                                                            className="transition-all duration-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                            disabled={loading}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-slate-700">Type</Label>
                                                        <CustomDropdown
                                                            name="type"
                                                            value={editForm.type}
                                                            onChange={handleEditChange}
                                                            options={taxTypeOptions}
                                                            disabled={loading}
                                                            className="w-full"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-slate-700">
                                                            Value {editForm.type === "PERCENTAGE" ? "(%)" : "(Amount)"}
                                                        </Label>
                                                        <Input
                                                            name="value"
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={editForm.value}
                                                            onChange={handleEditChange}
                                                            className="transition-all duration-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                            disabled={loading}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-slate-700">Country</Label>
                                                        <Input
                                                            name="country"
                                                            value={editForm.country}
                                                            onChange={handleEditChange}
                                                            className="transition-all duration-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                            disabled={loading}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-slate-700">Applicable On</Label>
                                                        <CustomDropdown
                                                            name="applicableOn"
                                                            value={editForm.applicableOn}
                                                            onChange={handleEditChange}
                                                            options={applicableOnOptions}
                                                            disabled={loading}
                                                            className="w-full"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-slate-700">Priority</Label>
                                                        <Input
                                                            name="priority"
                                                            type="number"
                                                            min="1"
                                                            value={editForm.priority}
                                                            onChange={handleEditChange}
                                                            className="transition-all duration-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                            disabled={loading}
                                                        />
                                                    </div>

                                                    <div className="sm:col-span-2 space-y-2">
                                                        <Label className="text-sm font-semibold text-slate-700">Description</Label>
                                                        <textarea
                                                            name="description"
                                                            value={editForm.description}
                                                            onChange={handleEditChange}
                                                            disabled={loading}
                                                            rows={2}
                                                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 resize-none"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-semibold text-slate-700">Valid From</Label>
                                                        <Input
                                                            name="validFrom"
                                                            type="date"
                                                            value={editForm.validFrom}
                                                            onChange={handleEditChange}
                                                            className="transition-all duration-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name="isInclusive"
                                                            checked={editForm.isInclusive}
                                                            onChange={handleEditChange}
                                                            disabled={loading}
                                                            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                                                        />
                                                        <span className="text-sm font-semibold text-slate-700">Tax Inclusive</span>
                                                    </label>

                                                    <div className="flex space-x-3">
                                                        <Button
                                                            variant="outline"
                                                            onClick={cancelEdit}
                                                            disabled={loading}
                                                            size="sm"
                                                            className="border-slate-300 hover:bg-slate-50"
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            onClick={saveEdit}
                                                            disabled={updateLoading || !editForm.name.trim() || !editForm.country.trim() || !editForm.value}
                                                            size="sm"
                                                            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                                                        >
                                                            {updateLoading ? (
                                                                <div className="flex items-center">
                                                                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    Saving...
                                                                </div>
                                                            ) : (
                                                                "Save Changes"
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Enhanced View Mode
                                        <div>
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-3 h-3 rounded-full ${rule.isInclusive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                                                        <h3 className="text-lg font-bold text-slate-900">{rule.name}</h3>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${rule.isInclusive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {rule.isInclusive ? 'Inclusive' : 'Exclusive'}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div className="bg-slate-50 rounded-lg p-3">
                                                        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Tax Value</div>
                                                        <div className="text-xl font-bold text-slate-900">
                                                            {formatValue(rule.type, rule.value)}
                                                        </div>
                                                        <div className="text-xs text-slate-500">{rule.type.toLowerCase()}</div>
                                                    </div>
                                                    <div className="bg-slate-50 rounded-lg p-3">
                                                        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Priority</div>
                                                        <div className="text-xl font-bold text-slate-900">{rule.priority || 1}</div>
                                                        <div className="text-xs text-slate-500">execution order</div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="text-sm text-slate-600 font-medium">{rule.region?.country}</span>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="text-sm text-slate-600">
                                                            Applied on {rule.applicableOn.toLowerCase().replace('_', ' ')}
                                                        </span>
                                                    </div>

                                                    {rule.description && (
                                                        <div className="flex items-start space-x-2">
                                                            <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                                            </svg>
                                                            <p className="text-sm text-slate-600">{rule.description}</p>
                                                        </div>
                                                    )}

                                                    {rule.validFrom && (
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="text-sm text-slate-600">
                                                                Valid from {formatDate(rule.validFrom)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                                                <div className="flex justify-between items-center">
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => startEdit(rule)}
                                                            className="text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            Edit
                                                        </Button>

                                                        {/* <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDuplicate(rule)}
                                                            disabled={loading}
                                                            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                            Duplicate
                                                        </Button> */}
                                                    </div>

                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => openDeleteModal(rule._id, rule.name)}
                                                        disabled={loading}
                                                        className="bg-red-500 hover:bg-red-600"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </Button>

                                                    <TaxDeleteModal
                                                        isOpen={deleteModal.isOpen}
                                                        onClose={closeDeleteModal}
                                                        onConfirm={handleDelete}
                                                        itemName={deleteModal.ruleName}
                                                        itemType="rule"
                                                        isLoading={loading}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};