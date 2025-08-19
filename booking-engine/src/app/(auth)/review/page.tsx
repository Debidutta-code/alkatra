'use client';


import CustomerReviewForm from "@/components/reviewSystem/reviewPage";
import { useParams } from 'next/navigation';
import { CustomerReviewApi } from '@/api';
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CustomerReviewPage () {

    const searchParams = useSearchParams();

    const [ reservationId, setReservationId ] = useState<string | null>("");

    useEffect(() => {
        const reservationId = searchParams.get("reservationId");
        
        setReservationId(reservationId);
      }, []);


    return <CustomerReviewForm id={reservationId as string} />;
}