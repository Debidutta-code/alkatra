import { useEffect, useState } from 'react'
import axios from 'axios';

export const useFetchPropertyRatePlan = (propertyId: any) => {
    const [ratePlan, setRatePlan] = useState(null);
    const [ratePlanLoading, setRatePlanLoading] = useState(true);
    const [ratePlanError, setRatePlanError] = useState(null);

    useEffect(() => {
        const fetchRatePlan = async () => {
            setRatePlanLoading(true);
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/pms/property/price/${propertyId}`);
                setRatePlan(response.data.priceList);
            } catch (err: any) {
                setRatePlanError(err.message);
            } finally {
                setRatePlanLoading(false);
            }
        };

        fetchRatePlan();
    }, [propertyId]);

    return { ratePlan, ratePlanLoading, ratePlanError };
}