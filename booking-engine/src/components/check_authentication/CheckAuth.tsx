'use client';
import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDispatch } from '../../Redux/store';
import { getUser } from '../../Redux/slices/auth.slice';

const CheckAuthentication = ({ 
  children, 
  setLoading 
}: { 
  children: React.ReactNode; 
  setLoading: React.Dispatch<React.SetStateAction<boolean>> 
}) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const token = Cookies.get('accessToken');

    // Function to get the full URL with all query parameters
    const getFullRedirectUrl = () => {
        const currentParams = new URLSearchParams(searchParams.toString());
        const fullPath = currentParams.toString() 
            ? `${pathname}?${currentParams.toString()}`
            : pathname;
        return encodeURIComponent(fullPath);
    };

    useEffect(() => {
        const retrieveUser = async () => {
            try {
                if (!token) {
                    // Redirect to login with the full current path and query parameters
                    const redirectUrl = getFullRedirectUrl();
                    router.push(`/login?redirect=${redirectUrl}`);
                } else {
                    await dispatch(getUser());
                }
            } catch (error) {
                console.log('error while retrieving user', error);
                // If there's an error with the token, redirect to login
                const redirectUrl = getFullRedirectUrl();
                router.push(`/login?redirect=${redirectUrl}`);
            } finally {
                setLoading(false);
            }
        };
    
        retrieveUser();
    }, []);
    
    return <>{children}</>;
};

export default CheckAuthentication;