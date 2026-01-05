export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
    open: boolean;
    title?: string;
    message: string;
    variant: AlertVariant;
    onConfirm?: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
    confirmText?: string;
    cancelText?: string;
}
