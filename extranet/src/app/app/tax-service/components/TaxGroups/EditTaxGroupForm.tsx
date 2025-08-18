import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import type { TaxRule } from "../../../../../types/taxTypes";

type Props = {
    form: {
        name: string;
        selectedRules: string[];
        isActive: boolean;
    };
    availableRules: TaxRule[];
    loading: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRuleSelect: (ruleId: string, isSelected: boolean) => void;
    onSave: () => void;
    onCancel: () => void;
};

export const EditTaxGroupForm = ({
    form,
    availableRules,
    loading,
    handleChange,
    handleRuleSelect,
    onSave,
    onCancel,
}: Props) => {
    return (
        <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium text-gray-700">Group Name</Label>
                        <span className="text-red-500 ml-1">*</span>
                        <Input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
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
                    <div className="max-h-40 overflow-y-auto border rounded-lg bg-gray-50 p-3 space-y-2">
                        {availableRules.map((rule) => (
                            <label key={rule._id} className="flex items-center space-x-2 p-2 hover:bg-white rounded cursor-pointer">
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
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button
                    onClick={onSave}
                    disabled={loading || !form.name.trim() || form.selectedRules.length === 0}
                >
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
};