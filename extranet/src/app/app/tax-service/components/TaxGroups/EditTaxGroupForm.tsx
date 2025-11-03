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
        <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium text-gray-700 flex items-center">
                            Group Name <span className="text-red-500 ml-1">*</span>
                        </Label>
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
                            className="rounded border-gray-300 h-4 w-4"
                        />
                        <Label className="text-sm font-medium text-gray-700">Active Group</Label>
                    </div>
                </div>

                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Select Tax Rules ({form.selectedRules.length} selected)
                    </Label>
                    <div className="max-h-40 overflow-y-auto border rounded-lg bg-gray-50 p-2 sm:p-3 space-y-1 sm:space-y-2">
                        {availableRules.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-2">No tax rules available</p>
                        ) : (
                            availableRules.map((rule) => (
                                <label
                                    key={rule._id}
                                    className="flex items-start space-x-2 p-2 hover:bg-white rounded cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={form.selectedRules.includes(rule._id)}
                                        onChange={(e) => handleRuleSelect(rule._id, e.target.checked)}
                                        disabled={loading}
                                        className="rounded border-gray-300 mt-0.5 h-4 w-4 flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">{rule.name}</div>
                                        <div className="text-xs text-gray-500 line-clamp-1">
                                            {rule.type === "PERCENTAGE"
                                                ? `${rule.value}%`
                                                : `$${rule.value.toFixed(2)}`} • {rule.type}
                                        </div>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-6">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                    className="w-full sm:w-auto"
                >
                    Cancel
                </Button>
                <Button
                    onClick={onSave}
                    disabled={loading || !form.name.trim() || form.selectedRules.length === 0}
                    className="w-full sm:w-auto"
                >
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
};