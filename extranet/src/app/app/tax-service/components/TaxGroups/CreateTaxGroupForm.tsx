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
    onCreate: () => void;
};

export const CreateTaxGroupForm = ({
    form,
    availableRules,
    loading,
    handleChange,
    handleRuleSelect,
    onCreate,
}: Props) => {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Create New Tax Group</h4>
            </div>

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
                            className="rounded border-gray-300 h-4 w-4"
                        />
                        <Label className="text-sm font-medium text-gray-700">Active Group</Label>
                    </div>
                </div>

                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Select Tax Rules ({form.selectedRules.length} selected)
                    </Label>
                    <div className="max-h-40 overflow-y-auto border rounded-lg bg-white p-2 sm:p-3 space-y-1 sm:space-y-2">
                        {availableRules.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-2">No tax rules available</p>
                        ) : (
                            availableRules.map((rule) => (
                                <label
                                    key={rule._id}
                                    className="flex items-start space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
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

            <div className="flex justify-end mt-6">
                <Button
                    onClick={onCreate}
                    disabled={loading || !form.name.trim() || form.selectedRules.length === 0}
                    className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2 bg-tripswift-blue hover:bg-tripswift-dark-blue text-white"
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Creating...
                        </div>
                    ) : (
                        "Create Group"
                    )}
                </Button>
            </div>
        </div>
    );
};