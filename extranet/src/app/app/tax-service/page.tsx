"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ArrowLeft, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { TaxServiceTabs } from "./components/TaxServiceTabs";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";
import { Skeleton } from "../../../components/ui/skeleton";

const TAX_API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function TaxServicePage() {
    const searchParams = useSearchParams();
    const propertyId = searchParams.get("propertyId");
    const accessToken = useSelector((state: RootState) => state.auth.accessToken);
    const router = useRouter();

    const [taxRules, setTaxRules] = useState<any[]>([]);
    const [taxGroups, setTaxGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!propertyId) {
            router.push("/app");
            return;
        }
        if (!accessToken) {
            router.push("/login");
            return;
        }

        fetchTaxData();
    }, [propertyId, accessToken, router]);

    const fetchTaxData = async () => {
        setLoading(true);
        setError(null);
        try {
            const rulesRes = await fetch(`${TAX_API_BASE}/tax-rule/hotel/${propertyId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!rulesRes.ok) throw new Error("Failed to load tax rules");

            const rulesData = await rulesRes.json();
            const rulesArray = Array.isArray(rulesData.data) ? rulesData.data : [rulesData.data].filter(Boolean);
            setTaxRules(rulesArray);

            const groupsRes = await fetch(`${TAX_API_BASE}/tax-group/hotel/${propertyId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            if (!groupsRes.ok) throw new Error("Failed to load tax groups");

            const groupsData = await groupsRes.json();
            const groupsArray = Array.isArray(groupsData.data) ? groupsData.data : [groupsData.data].filter(Boolean);
            setTaxGroups(groupsArray);

            // toast.success("Tax configuration loaded.", { id: "tax-config-loaded" });
        } catch (err: any) {
            console.error("Tax fetch error:", err);
            const message = err.message || "Failed to connect to tax service";
            setError(message);
            toast.error(message.includes("rules") || message.includes("groups") ? message : "Network error");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => router.back();

    const handleRetry = () => {
        fetchTaxData();
    };

    if (!propertyId) {
        return (
            <main className="py-8 px-4 md:px-8 lg:px-16 xl:px-24 max-w-6xl mx-auto">
                <div className="flex items-center gap-2 text-red-600 mb-6">
                    <AlertCircle className="h-5 w-5" />
                    <p>Property ID is required. Redirecting...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="py-8 px-4 md:px-8 lg:px-16 xl:px-24 max-w-7xl mx-auto space-y-6">
            {/* Back Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Go back"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>

            {/* Header */}
            <Card className="border-none shadow-lg rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-tripswift-blue to-tripswift-dark-blue px-6 py-8 text-white">
                    <CardTitle className="text-xl md:text-2xl font-bold">Tax Configuration</CardTitle>
                    {/* <CardDescription className="text-blue-100 mt-2">
                        Manage tax rules and groups for property:{" "}
                        <span className="font-mono font-semibold bg-white/20 px-2 py-1 rounded">{propertyId}</span>
                    </CardDescription> */}
                </div>

                <CardContent className="p-6">
                    {/* Loading State */}
                    {loading && (
                        <div className="space-y-6">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <div className="mt-8 space-y-4">
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-12 w-full rounded-lg" />
                                <Skeleton className="h-12 w-full rounded-lg" />
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                            <h3 className="text-lg font-medium text-gray-700">Failed to Load Data</h3>
                            <p className="text-sm text-gray-500 max-w-md">{error}</p>
                            <Button
                                onClick={handleRetry}
                                variant="outline"
                                className="flex items-center gap-2 mt-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                                Retry
                            </Button>
                        </div>
                    )}

                    {/* Success State */}
                    {!loading && !error && (
                        <TaxServiceTabs
                            propertyId={propertyId}
                            accessToken={accessToken}
                            initialTaxRules={taxRules}
                            initialTaxGroups={taxGroups}
                            onTaxRuleUpdate={setTaxRules}
                            onTaxGroupUpdate={setTaxGroups}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Empty State Hint (Optional) */}
            {!loading && !error && taxRules.length === 0 && taxGroups.length === 0 && (
                <p className="text-center text-gray-500 text-sm mt-4">
                    No tax rules or groups found. Start by creating one.
                </p>
            )}
        </main>
    );
}