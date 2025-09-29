import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { CustomDropdown } from "../../../../../components/ui/custom-dropdown";

type EditFormState = {
    name: string;
    type: string;
    value: string;
    applicableOn: string;
    country: string;
    description: string;
    validFrom: string;
    isInclusive: boolean;
    priority: number;
};

type Props = {
    form: EditFormState;
    loading: boolean;
    updateLoading: boolean;
    handleChange: (e: any) => void;
    onSave: () => void;
    onCancel: () => void;
};

const taxTypeOptions = [
    { value: "PERCENTAGE", label: "Percentage (%)" },
    { value: "FIXED", label: "Fixed Amount" },
];

const applicableOnOptions = [
    { value: "ROOM_RATE", label: "Room Rate Only" },
    { value: "TOTAL_AMOUNT", label: "Total Amount" },
];

export const EditTaxRuleForm = ({
    form,
    loading,
    updateLoading,
    handleChange,
    onSave,
    onCancel,
}: Props) => {
    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4">
                <h3 className="text-lg font-semibold text-white">Edit Tax Rule</h3>
            </div>

            <div className="p-4">
                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center">
                            Name <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center">
                            Type <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <CustomDropdown
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            options={taxTypeOptions}
                            disabled={loading}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center">
                            Value {form.type === "PERCENTAGE" ? "(%)" : "(Amount)"}{" "}
                            <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            name="value"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.value}
                            onChange={handleChange}
                            className="focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center">
                            Applicable On <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <CustomDropdown
                            name="applicableOn"
                            value={form.applicableOn}
                            onChange={handleChange}
                            options={applicableOnOptions}
                            disabled={loading}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm font-semibold text-slate-700">Priority</Label>
                        <Input
                            name="priority"
                            type="number"
                            min="1"
                            value={form.priority}
                            onChange={handleChange}
                            className="focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center">
                            Valid From <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <input
                            name="validFrom"
                            type="date"
                            value={form.validFrom}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-md 
                   focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
                   disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50
                   cursor-pointer"
                            disabled={loading}
                            style={{ colorScheme: 'light' }}
                        />
                    </div>
                </div>

                {/* Description - full width */}
                <div className="space-y-2 mb-4">
                    <Label className="text-sm font-semibold text-slate-700">Description</Label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        disabled={loading}
                        rows={2}
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 resize-none"
                    />
                </div>

                {/* Action Buttons - responsive */}
                <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3 pt-4 border-t border-slate-200">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                        size="sm"
                        className="w-full sm:w-auto border-slate-300 hover:bg-slate-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onSave}
                        disabled={updateLoading || !form.name.trim() || !form.country.trim() || !form.value}
                        size="sm"
                        className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                    >
                        {updateLoading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
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
    );
};