'use client';
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { RootState, useDispatch } from '../../redux/store';
import { getUser } from '../../redux/slices/authSlice';
import { useSelector } from 'react-redux';

const CheckAuthentication = ({ children, setLoading }: { 
  children: React.ReactNode; 
  setLoading: React.Dispatch<React.SetStateAction<boolean>> 
}) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    
    const { accessToken, isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const validateAuthentication = async () => {
            setLoading(true);
            
            try {
                // We're in the app layout, so all routes are protected
                if (!isAuthenticated || !accessToken) {
                    router.push('/login');
                    return;
                }
                
                // Validate token and user data
                await dispatch(getUser());
            } catch (error) {
                console.error('Authentication error:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };

        validateAuthentication();
    }, [pathname, isAuthenticated, accessToken, dispatch, router, setLoading]);

    return <>{children}</>;
};

export default CheckAuthentication;