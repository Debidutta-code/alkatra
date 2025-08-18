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
                        <Label className="text-sm font-semibold text-slate-700">Tax Type</Label>
                        <span className="text-red-500 ml-1">*</span>
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
                            Country/Region <span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                            name="country"
                            value={form.country}
                            onChange={handleChange}
                            placeholder="e.g., Bahrain"
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
                        <Label className="text-sm font-semibold text-slate-700">Priority</Label>
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

                    <div className="md:col-span-2 space-y-2">
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

                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700">Valid From</Label>
                        <span className="text-red-500 ml-1">*</span>
                        <Input
                            name="validFrom"
                            type="date"
                            value={form.validFrom}
                            onChange={handleChange}
                            className="focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 border-slate-300"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end mt-8 pt-6 border-t border-slate-200">
                    {/* <label className="flex items-center space-x-3 cursor-pointer">
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
                                </label> */}
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
        </div>
    );
};