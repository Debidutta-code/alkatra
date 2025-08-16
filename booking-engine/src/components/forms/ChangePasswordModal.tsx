"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Lock, Eye, EyeOff, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from 'react-hot-toast';

interface ChangePasswordModalProps {
    onClose: () => void;
    onSave: (password: string) => Promise<void>;
    t: (key: string, options?: any) => string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
    onClose,
    onSave,
    t
}) => {
    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.password) {
            newErrors.password = t("Auth.Validation.passwordRequired", {
                defaultValue: "Password is required",
            });
        } else if (formData.password.length < 8) {
            newErrors.password = t("Auth.Validation.minLength", {
                defaultValue: "Must be at least {{count}} characters",
                count: 8,
            });
        } else {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                newErrors.password = t(
                    "Auth.Validation.passwordComplexity",
                    {
                        defaultValue:
                            "Password must contain at least 8 characters including one uppercase letter, one lowercase letter, one number and one special character.",
                    }
                );
            }
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = t("Auth.Validation.confirmPasswordRequired", {
                defaultValue: "Please confirm your password",
            });
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t("Auth.Validation.passwordsDoNotMatch", {
                defaultValue: "Passwords do not match",
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                await onSave(formData.password);
                toast.success(t("Auth.Register.passwordUpdatedSuccess", { defaultValue: "Password updated successfully" }));
                onClose();
            } catch (error: any) {
                toast.error(error?.message || t("Auth.Register.passwordUpdateFailed", { defaultValue: "Failed to update password" }));
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-md overflow-hidden border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-lg font-semibold text-[var(--color-secondary-black)] flex items-center">
                        <Lock className="h-5 w-5 mr-2 text-[var(--color-primary-blue)]" />
                        {t("Profile.changePassword", { defaultValue: "Change Password" })}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">
                            {t("Profile.newPasswordOptional", { defaultValue: "New Password" })}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] pr-10"
                                placeholder={t("Auth.Register.enterNewPassword", { defaultValue: "Enter new password" })}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-500" />
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-secondary-black)] mb-1">
                            {t("Profile.confirmNewPassword", { defaultValue: "Confirm New Password" })}
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] pr-10"
                                placeholder={t("Auth.Register.reEnterPassword", { defaultValue: "Re-enter new password" })}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <Eye className="h-4 w-4 text-gray-500" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            variant="default"
                            size="default"
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? t("Auth.Button.processing", { defaultValue: "Processing..." })
                                : t("Auth.Register.updatePasswordButton", { defaultValue: "Update Password" })
                            }
                        </Button>

                        <Button
                            variant="outline"
                            size="default"
                            type="button"
                            onClick={onClose}
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {t("BookingComponents.GuestInformationModal.cancel", { defaultValue: "Cancel" })}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;