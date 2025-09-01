'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

let offlineToastId: string | null = null; // keep track of the offline toast

const useNetworkStatus = () => {
    const { t } = useTranslation();
    useEffect(() => {
        const handleOffline = () => {
            if (!offlineToastId) {
                offlineToastId = toast.error(t('NetworkStatus.offline', {
                    defaultValue: 'You are offline. Please check your internet connection.',
                }), {
                    duration: Infinity, // 👈 keeps toast visible until dismissed
                    id: 'offline-toast', // ensure only one toast
                });
            }
        };

        const handleOnline = () => {
            if (offlineToastId) {
                toast.dismiss(offlineToastId); // remove the sticky offline toast
                offlineToastId = null;
            }
            toast.success(t('NetworkStatus.online', {
                defaultValue: 'You are back online!',
            }));
        };

        // If already offline on load, show sticky toast
        if (!navigator.onLine) {
            handleOffline();
        }

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);
};

export default useNetworkStatus;
