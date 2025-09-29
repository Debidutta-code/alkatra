import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import { CustomDropdown } from "../../../../../components/ui/custom-dropdown";

type FormState = {
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
    form: FormState;
    loading: boolean;
    createLoading: boolean;
    handleChange: (e: any) => void;
    handleCreate: () => void;
    resetForm: () => void;
};

const taxTypeOptions = [
    { value: "PERCENTAGE", label: "Percentage (%)" },
    { value: "FIXED", label: "Fixed Amount" },
];

const applicableOnOptions = [
    { value: "ROOM_RATE", label: "Room Rate Only" },
    { value: "TOTAL_AMOUNT", label: "Total Amount" },
];

export const CreateTaxRuleForm = ({
    form,
    loading,
    createLoading,
    handleChange,
    handleCreate,
    resetForm,
}: Props) => {
    return (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5">
                <div className="flex items-center">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Create New Tax Rule</h2>
                        <p className="text-emerald-100">Add a new tax rule to apply to your property bookings</p>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* Grid for form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center">
                            Tax Rule Name <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g., GST Tax"
                            className="focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-slate-300"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center">
                            Tax Type <span className="text-red-500 ml-1">*</span>
                        </Label>
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
                            className="focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-slate-300"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center">
                            Applicable On <span className="text-red-500 ml-1">*</span>
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
                        <Label className="text-sm font-semibold text-slate-700 flex items-center">Priority</Label>
                        <Input
                            name="priority"
                            type="number"
                            min="1"
                            value={form.priority}
                            onChange={handleChange}
                            placeholder="1"
                            className="focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-slate-300"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center">
                            Valid From <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <div className="relative">
                            <input
                                name="validFrom"
                                type="date"
                                value={form.validFrom}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                disabled={loading}
                                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                       disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50
                       cursor-pointer"
                                style={{
                                    colorScheme: 'light'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Description - full width on all screens */}
                <div className="space-y-2 mb-2">
                    <Label className="text-sm font-semibold text-slate-700">Description</Label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Optional description of this tax rule..."
                        disabled={loading}
                        rows={3}
                        className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                </div>

                {/* Action buttons - responsive alignment */}
                <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-3 pt-4 border-t border-slate-200">
                    <Button
                        variant="outline"
                        onClick={resetForm}
                        disabled={loading}
                        className="w-full sm:w-auto border-slate-300 hover:bg-slate-50"
                    >
                        Reset Form
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={createLoading || !form.name.trim() || !form.country.trim() || !form.value}
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 shadow-lg"
                    >
                        {createLoading ? (
                            <div className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
    );
};