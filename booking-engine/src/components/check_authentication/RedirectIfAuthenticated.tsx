'use client';
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../Redux/store';

const RedirectIfAuthenticated = ({ 
  children 
}: { 
  children: React.ReactNode;
}) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useSelector((state: RootState) => state.auth); // Changed from authReducer to auth
    const token = Cookies.get('accessToken');

    useEffect(() => {
        // Check if user is authenticated either by Redux state or token
        if (isAuthenticated || token) {
            // User is authenticated, redirect to home page
            router.push('/');
        } else {
            // User is not authenticated, allow access to login/register
            setLoading(false);
        }
    }, [isAuthenticated, token, router]);
    
    // Show nothing while checking authentication or redirecting
    if (loading) {
        return null; // Or a loading spinner if preferred
    }

    // Render children (login/register page) only if not authenticated
    return <>{children}</>;
};

export default RedirectIfAuthenticated;