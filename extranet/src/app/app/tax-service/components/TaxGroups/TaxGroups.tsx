import axios from 'axios';
import { useState } from "react";
import { Button } from "../../../../../components/ui/button";
import { toast } from "react-hot-toast";
import { TaxDeleteModal } from "../TaxDeleteModal";
import type { TaxGroup, TaxRule } from "../../../../../types/taxTypes";
import { CreateTaxGroupForm } from "../TaxGroups/CreateTaxGroupForm";
import { EditTaxGroupForm } from "../TaxGroups/EditTaxGroupForm";

const TAX_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

type TaxGroupsProps = {
    propertyId: string;
    accessToken: string;
    initialGroups: TaxGroup[];
    availableRules: TaxRule[];
    onUpdate: (groups: TaxGroup[]) => void;
};

export const TaxGroups = ({
    propertyId,
    accessToken,
    initialGroups,
    availableRules = [],
    onUpdate
}: TaxGroupsProps) => {
    const [groups, setGroups] = useState<TaxGroup[]>(initialGroups);
    const [loading, setLoading] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    const [form, setForm] = useState({
        name: "",
        selectedRules: [] as string[],
        isActive: true,
    });

    const [editingGroup, setEditingGroup] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        name: "",
        selectedRules: [] as string[],
        isActive: true,
    });

    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        groupId: string | null;
        groupName: string;
        groupRuleCount: number;
    }>({
        isOpen: false,
        groupId: null,
        groupName: "",
        groupRuleCount: 0
    });

    const openDeleteModal = (groupId: string, groupName: string, ruleCount: number) => {
        setDeleteModal({ isOpen: true, groupId, groupName, groupRuleCount: ruleCount });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, groupId: null, groupName: "", groupRuleCount: 0 });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleRuleSelect = (ruleId: string, isSelected: boolean) => {
        setForm(prev => ({
            ...prev,
            selectedRules: isSelected
                ? [...prev.selectedRules, ruleId]
                : prev.selectedRules.filter(id => id !== ruleId)
        }));
    };

    const handleEditRuleSelect = (ruleId: string, isSelected: boolean) => {
        setEditForm(prev => ({
            ...prev,
            selectedRules: isSelected
                ? [...prev.selectedRules, ruleId]
                : prev.selectedRules.filter(id => id !== ruleId)
        }));
    };

    const handleCreate = async () => {
        if (!form.name.trim()) {
            toast.error("Group name is required");
            return;
        }
        if (form.selectedRules.length === 0) {
            toast.error("At least one tax rule must be selected");
            return;
        }

        const payload = {
            name: form.name.trim(),
            rules: form.selectedRules,
            isActive: form.isActive,
            hotelId: propertyId,
        };

        setLoading(true);
        try {
            const res = await axios.post(`${TAX_API_BASE}/tax-group`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.status >= 200 && res.status < 300) {
                await refetchGroups();
                toast.success("Tax group created successfully!");
                setForm({ name: "", selectedRules: [], isActive: true });
            }
        } catch (err: any) {
            console.error("Error creating tax group:", err);
            if (err.response) {
                toast.error(`Failed: ${err.response.data?.message || "Unknown error"}`);
            } else if (err.request) {
                toast.error("Network error: Could not connect to server");
            } else {
                toast.error("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const refetchGroups = async () => {
        try {
            const res = await fetch(`${TAX_API_BASE}/tax-group/hotel/${propertyId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.ok) {
                const data = await res.json();
                const groupsArray = Array.isArray(data.data) ? data.data : [data.data].filter(Boolean);
                setGroups(groupsArray);
                onUpdate(groupsArray);
            }
        } catch (error) {
            console.error("Error refetching groups:", error);
        }
    };

    const startEdit = (group: TaxGroup) => {
        setEditingGroup(group._id);
        const existingRuleIds = group.rules
            .map((rule: any) => typeof rule === 'string' ? rule : rule._id)
            .filter((id: string) => availableRules.some(r => r._id === id));

        setEditForm({
            name: group.name,
            selectedRules: existingRuleIds,
            isActive: group.isActive,
        });
    };

    const saveEdit = async () => {
        if (!editingGroup || !editForm.name.trim() || editForm.selectedRules.length === 0) {
            if (!editForm.name.trim()) toast.error("Group name is required");
            if (editForm.selectedRules.length === 0) toast.error("At least one rule must be selected");
            return;
        }

        const payload = {
            name: editForm.name.trim(),
            rules: editForm.selectedRules,
            isActive: editForm.isActive,
            hotelId: propertyId,
        };

        setLoading(true);
        try {
            const res = await axios.put(`${TAX_API_BASE}/tax-group/${editingGroup}`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.status >= 200 && res.status < 300) {
                await refetchGroups();
                toast.success("Tax group updated successfully!");
                cancelEdit();
            }
        } catch (err: any) {
            console.error("Error updating tax group:", err);
            if (err.response) {
                toast.error(`Failed: ${err.response.data?.message || "Unknown error"}`);
            } else if (err.request) {
                toast.error("Network error");
            } else {
                toast.error("Unexpected error");
            }
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setEditingGroup(null);
        setEditForm({ name: "", selectedRules: [], isActive: true });
    };

    const handleDelete = async () => {
        if (!deleteModal.groupId) return;

        setLoading(true);
        try {
            const res = await axios.delete(`${TAX_API_BASE}/tax-group/${deleteModal.groupId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.status >= 200 && res.status < 300) {
                await refetchGroups();
                toast.success("Tax group deleted successfully!");
                closeDeleteModal();
            }
        } catch (err: any) {
            console.error("Error deleting tax group:", err);
            if (err.response) {
                toast.error(`Failed: ${err.response.data?.message || "Unknown error"}`);
            } else {
                toast.error("Delete failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (groupId: string, currentStatus: boolean) => {
        const group = groups.find(g => g._id === groupId);
        if (!group) return;

        const payload = {
            name: group.name,
            rules: group.rules.map((r: any) => typeof r === 'string' ? r : r._id),
            isActive: !currentStatus,
            hotelId: propertyId,
        };

        setLoading(true);
        try {
            const res = await axios.put(`${TAX_API_BASE}/tax-group/${groupId}`, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.status >= 200 && res.status < 300) {
                await refetchGroups();
                toast.success(`Tax group ${!currentStatus ? 'activated' : 'deactivated'}!`);
            }
        } catch (err: any) {
            if (err.response) {
                toast.error(`Failed to toggle status: ${err.response.data?.message || "Error"}`);
            } else {
                toast.error("Network error");
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleGroupExpansion = (id: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Tax Groups Management</h3>
                <div className="text-sm text-gray-500">
                    {groups.length} group{groups.length !== 1 ? 's' : ''} total
                </div>
            </div>

            <CreateTaxGroupForm
                form={form}
                availableRules={availableRules}
                loading={loading}
                handleChange={handleChange}
                handleRuleSelect={handleRuleSelect}
                onCreate={handleCreate}
            />

            <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Existing Tax Groups</h4>

                {groups.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No tax groups</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new tax group.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {groups.map((group) => (
                            <div key={group._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                {editingGroup === group._id ? (
                                    <EditTaxGroupForm
                                        form={editForm}
                                        availableRules={availableRules}
                                        loading={loading}
                                        handleChange={handleEditChange}
                                        handleRuleSelect={handleEditRuleSelect}
                                        onSave={saveEdit}
                                        onCancel={cancelEdit}
                                    />
                                ) : (
                                    <div>
                                        <div className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3">
                                                        <h5 className="text-md font-medium text-gray-900">{group.name}</h5>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${group.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {group.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                                                        <span>{group.rules.length} tax rule{group.rules.length !== 1 ? 's' : ''}</span>
                                                        <button
                                                            onClick={() => toggleGroupExpansion(group._id)}
                                                            className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                                                        >
                                                            <span>View Details</span>
                                                            <svg className={`w-4 h-4 transform transition-transform ${expandedGroups.has(group._id) ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => startEdit(group)} disabled={loading} className="text-xs">Edit</Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleToggleActive(group._id, group.isActive)}
                                                        disabled={loading}
                                                        className={`text-xs ${group.isActive ? 'text-orange-600 border-orange-200 hover:border-orange-300' : 'text-green-600 border-green-200 hover:border-green-300'}`}
                                                    >
                                                        {group.isActive ? 'Deactivate' : 'Activate'}
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => openDeleteModal(group._id, group.name, group.rules.length)}
                                                        disabled={loading}
                                                        className="text-xs"
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {expandedGroups.has(group._id) && (
                                            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                                                <h6 className="text-sm font-medium text-gray-900 mb-3">Associated Tax Rules</h6>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {group.rules.map((rule: any) => {
                                                        const ruleId = typeof rule === 'string' ? rule : rule._id;
                                                        const ruleData = availableRules.find((r: TaxRule) => r._id === ruleId);
                                                        return (
                                                            <div key={ruleId} className="bg-white border border-gray-200 rounded-lg p-3">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {ruleData ? ruleData.name : <span className="text-red-600">⚠️ Rule Not Found</span>}
                                                                </div>
                                                                {ruleData && (
                                                                    <div className="text-xs text-gray-500 mt-1 space-y-1">
                                                                        <div>{ruleData.type === "PERCENTAGE" ? `${ruleData.value}%` : `$${ruleData.value.toFixed(2)}`} • {ruleData.type}</div>
                                                                        <div>{ruleData.region?.country}</div>
                                                                        <div>Applied on: <span className="font-medium">{ruleData.applicableOn.replace('_', ' ')}</span></div>
                                                                        {/* {ruleData.isInclusive && (
                                                                            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                                                                                Inclusive
                                                                            </div>
                                                                        )} */}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <TaxDeleteModal
                isOpen={deleteModal.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                itemName={deleteModal.groupName}
                itemType="group"
                groupRuleCount={deleteModal.groupRuleCount}
                isLoading={loading}
            />
        </div>
    );
};