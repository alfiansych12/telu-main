import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

// types
import { AlertProps } from 'types/alert';

export const endpoints = {
    key: 'alert'
};

const initialState: AlertProps = {
    open: false,
    title: '',
    message: '',
    variant: 'success',
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: false
};

export function useGetAlert() {
    const { data } = useSWR(endpoints.key, () => initialState, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    const memoizedValue = useMemo(() => ({ alert: data || initialState }), [data]);

    return memoizedValue;
}

export function openAlert(alert: Partial<AlertProps>) {
    mutate(
        endpoints.key,
        (currentAlert: any) => {
            return {
                ...initialState,
                ...currentAlert,
                ...alert,
                open: true
            };
        },
        false
    );
}

export function closeAlert() {
    mutate(
        endpoints.key,
        (currentAlert: any) => {
            return { ...currentAlert, open: false };
        },
        false
    );
}
