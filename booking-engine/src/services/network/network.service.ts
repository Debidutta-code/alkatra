'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

let offlineToastId: string | null = null; // keep track of the offline toast

const useNetworkStatus = () => {
    const { t } = useTranslation();
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const handleOffline = () => {
            setIsOnline(false);
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
            setIsOnline(true);
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
    return isOnline;
};

export default useNetworkStatus;
