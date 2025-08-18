// src/app/tax-service/components/TaxGroups.tsx
import axios from 'axios';
import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { toast } from "react-hot-toast";
import { TaxDeleteModal } from "./TaxDeleteModal";
import type { TaxGroup, TaxRule } from "../../../../types/taxTypes";

const TAX_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

// Define props type
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

  // Create form state
  const [form, setForm] = useState({
    name: "",
    selectedRules: [] as string[],
    isActive: true,
  });

  // Edit form state
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
    setDeleteModal({
      isOpen: true,
      groupId,
      groupName,
      groupRuleCount: ruleCount
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      groupId: null,
      groupName: "",
      groupRuleCount: 0
    });
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle rule selection for create form
  const handleRuleSelect = (ruleId: string, isSelected: boolean) => {
    setForm(prev => ({
      ...prev,
      selectedRules: isSelected
        ? [...prev.selectedRules, ruleId]
        : prev.selectedRules.filter((id: string) => id !== ruleId)
    }));
  };

  // Handle rule selection for edit form
  const handleEditRuleSelect = (ruleId: string, isSelected: boolean) => {
    setEditForm(prev => ({
      ...prev,
      selectedRules: isSelected
        ? [...prev.selectedRules, ruleId]
        : prev.selectedRules.filter((id: string) => id !== ruleId)
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
        const errorMessage = err.response.data?.message || "Unknown error";
        toast.error(`Failed to create tax group: ${errorMessage}`);
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
        const groupsData = await res.json();
        const groupsArray = Array.isArray(groupsData.data) ? groupsData.data : [groupsData.data].filter(Boolean);
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
      .filter((ruleId: string) => availableRules.some((availableRule: TaxRule) => availableRule._id === ruleId));

    setEditForm({
      name: group.name,
      selectedRules: existingRuleIds,
      isActive: group.isActive,
    });
  };

  const saveEdit = async () => {
    if (!editingGroup) return;

    if (!editForm.name.trim()) {
      toast.error("Group name is required");
      return;
    }

    if (editForm.selectedRules.length === 0) {
      toast.error("At least one tax rule must be selected");
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
        const errorMessage = err.response.data?.message || "Unknown error";
        toast.error(`Failed to update tax group: ${errorMessage}`);
      } else if (err.request) {
        toast.error("Network error: Could not connect to server");
      } else {
        toast.error("An unexpected error occurred");
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
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.status >= 200 && res.status < 300) {
        await refetchGroups();
        toast.success("Tax group deleted successfully!");
        closeDeleteModal();
      }
    } catch (err: any) {
      console.error("Error deleting tax group:", err);

      if (err.response) {
        const errorMessage = err.response.data?.message || "Unknown error";
        toast.error(`Failed to delete tax group: ${errorMessage}`);
      } else if (err.request) {
        toast.error("Network error: Could not connect to server");
      } else {
        toast.error("Delete failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (groupId: string, currentActiveStatus: boolean) => {
    setLoading(true);
    try {
      // Find the group to get its current data
      const group = groups.find(g => g._id === groupId);
      if (!group) {
        toast.error("Group not found");
        return;
      }

      const payload = {
        name: group.name,
        rules: group.rules.map((rule: any) => typeof rule === 'string' ? rule : rule._id),
        isActive: !currentActiveStatus,
        hotelId: propertyId,
      };

      const res = await axios.put(`${TAX_API_BASE}/tax-group/${groupId}`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status >= 200 && res.status < 300) {
        await refetchGroups();
        toast.success(`Tax group ${!currentActiveStatus ? 'activated' : 'deactivated'} successfully!`);
      }
    } catch (err: any) {
      console.error("Error toggling tax group status:", err);

      if (err.response) {
        const errorMessage = err.response.data?.message || "Unknown error";
        toast.error(`Failed to ${!currentActiveStatus ? 'activate' : 'deactivate'} tax group: ${errorMessage}`);
      } else if (err.request) {
        toast.error("Network error: Could not connect to server");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
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
      {/* Create Form */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-tripswift-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900">Create New Tax Group</h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Group Name</Label>
              <span className="text-red-500 ml-1">*</span>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Bahrain Standard Hotel Taxes"
                className="mt-1"
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                disabled={loading}
                className="rounded border-gray-300"
              />
              <Label className="text-sm font-medium text-gray-700">Active Group</Label>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Select Tax Rules ({form.selectedRules.length} selected)
            </Label>
            <div className="max-h-40 overflow-y-auto border rounded-lg bg-white p-3 space-y-2">
              {availableRules.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">No tax rules available</p>
              ) : (
                availableRules.map((rule) => (
                  <label key={rule._id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.selectedRules.includes(rule._id)}
                      onChange={(e) => handleRuleSelect(rule._id, e.target.checked)}
                      disabled={loading}
                      className="rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{rule.name}</div>
                      <div className="text-xs text-gray-500">
                        {rule.type === "PERCENTAGE" ? `${rule.value}%` : `$${rule.value.toFixed(2)}`} • {rule.region?.country} • {rule.type}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleCreate}
            disabled={loading || !form.name.trim() || form.selectedRules.length === 0}
            className="px-6 py-2 bg-tripswift-blue hover:bg-tripswift-dark-blue text-white"
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </div>
            ) : (
              "Create Group"
            )}
          </Button>
        </div>
      </div>

      {/* Groups List */}
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
                  // Edit Mode
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Group Name</Label>
                          <span className="text-red-500 ml-1">*</span>
                          <Input
                            name="name"
                            value={editForm.name}
                            onChange={handleEditChange}
                            className="mt-1"
                            disabled={loading}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={editForm.isActive}
                            onChange={handleEditChange}
                            disabled={loading}
                            className="rounded border-gray-300"
                          />
                          <Label className="text-sm font-medium text-gray-700">Active Group</Label>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                          Select Tax Rules ({editForm.selectedRules.length} selected)
                        </Label>
                        <div className="max-h-40 overflow-y-auto border rounded-lg bg-gray-50 p-3 space-y-2">
                          {availableRules.map((rule) => (
                            <label key={rule._id} className="flex items-center space-x-2 p-2 hover:bg-white rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editForm.selectedRules.includes(rule._id)}
                                onChange={(e) => handleEditRuleSelect(rule._id, e.target.checked)}
                                disabled={loading}
                                className="rounded border-gray-300"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{rule.name}</div>
                                <div className="text-xs text-gray-500">
                                  {rule.type === "PERCENTAGE" ? `${rule.value}%` : `$${rule.value.toFixed(2)}`} • {rule.region?.country} • {rule.type}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={saveEdit}
                        disabled={loading || !editForm.name.trim() || editForm.selectedRules.length === 0}
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h5 className="text-md font-medium text-gray-900">{group.name}</h5>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${group.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                              }`}>
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
                              <svg className={`w-4 h-4 transform transition-transform ${expandedGroups.has(group._id) ? 'rotate-180' : ''
                                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(group)}
                            disabled={loading}
                            className="text-xs"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(group._id, group.isActive)}
                            disabled={loading}
                            className={`text-xs ${group.isActive
                              ? 'text-orange-600 hover:text-orange-700 border-orange-200 hover:border-orange-300'
                              : 'text-green-600 hover:text-green-700 border-green-200 hover:border-green-300'
                              }`}
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

                    {/* Expandable Rules Details */}
                    {expandedGroups.has(group._id) && (
                      <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                        <h6 className="text-sm font-medium text-gray-900 mb-3">Associated Tax Rules</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {group.rules.map((rule: any) => {
                            const ruleId = typeof rule === 'string' ? rule : rule._id;
                            const ruleData = typeof rule === 'string'
                              ? availableRules.find((r: TaxRule) => r._id === rule)
                              : rule;

                            return (
                              <div key={ruleId} className="bg-white border border-gray-200 rounded-lg p-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {ruleData ? (
                                    <div className="text-sm font-medium text-gray-900">{ruleData.name}</div>
                                  ) : (
                                    <div className="text-sm text-red-600 font-medium">⚠️ Rule Not Found</div>
                                  )}
                                </div>
                                {ruleData && (
                                  <div className="text-xs text-gray-500 mt-1 space-y-1">
                                    <div>
                                      {ruleData.type === "PERCENTAGE"
                                        ? `${ruleData.value}%`
                                        : `$${ruleData.value.toFixed(2)}`
                                      } • {ruleData.type}
                                    </div>
                                    <div>{ruleData.region?.country}</div>
                                    <div>
                                      Applied on {" "}
                                      <span className="font-medium text-gray-500">
                                        {ruleData.applicableOn === "TOTAL_AMOUNT"
                                          ? "Total Amount"
                                          : ruleData.applicableOn === "ROOM_RATE"
                                            ? "Room Rate Only"
                                            : "Unknown"}
                                      </span>
                                    </div>

                                    {ruleData.isInclusive && (
                                      <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                                        </svg>
                                        Inclusive
                                      </div>
                                    )}
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
      {/* Add the TaxDeleteModal component */}
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