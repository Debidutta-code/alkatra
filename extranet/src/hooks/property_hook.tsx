import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProperty, fetchAllRatePlanOfOwner, updateProperty } from "../app/app/property/propertyDetails/api";
import { useSelector } from "react-redux";
import { RootState } from "@src/redux/store";

export const useFetchProperties = (propertyId: string) => {
    const accessToken = useSelector((state: RootState) => state.auth.accessToken); // ✅ Get accessToken inside hook

    const { data: properties, isLoading: isPropertyLoading, error: propertyError, isError: isPropertyError } = useQuery({
        queryKey: ["properties", propertyId],
        queryFn: async () => {
            if (!accessToken) throw new Error("Access token not found");
            return await fetchProperty(accessToken, propertyId);
        },
        enabled: !!accessToken, // ✅ Ensures query runs only when accessToken is available
    });

    return { properties, isPropertyLoading, isPropertyError, propertyError };
};

export const useFetchAllRateplansOfManager = () => {
    const accessToken = useSelector((state: RootState) => state.auth.accessToken); // ✅ Get accessToken inside hook

    const { data: ratePlans, isLoading: isRateplanLoading, error: rateplanError, isError: isRateplanError } = useQuery({
        queryKey: ["rateplans"],
        queryFn: async () => {
            if (!accessToken) throw new Error("Access token not found");
            return await fetchAllRatePlanOfOwner(accessToken);
        },
        enabled: !!accessToken, // ✅ Prevents query from running if accessToken is missing
    });

    return { ratePlans, isRateplanLoading, rateplanError, isRateplanError };
};

export const useUpdatePropertyDetails = (propertyId: string, editedProperty: any) => {
    const queryClient = useQueryClient();
    const accessToken = useSelector((state: RootState) => state.auth.accessToken); // ✅ Get accessToken inside hook

    const mutation = useMutation({
        mutationFn: async () => {
            if (!accessToken) throw new Error("Access token not found");
            return await updateProperty(accessToken, propertyId, editedProperty);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["properties", propertyId] });
        },
        onError: (error) => {
            console.error("Error updating property data:", error);
        },
    });

    return mutation;
};
