import { formatTimeJakarta, formatDateJakarta } from './date-tz';

/**
 * Format Date object or string to HH:mm:ss in Jakarta TZ
 */
export const formatTime = (time: any) => {
    if (!time) return '-';
    try {
        if (time instanceof Date || (typeof time === 'string' && time.includes('T'))) {
            return formatTimeJakarta(time);
        }
    } catch (e) {
        console.error('formatTime error:', e);
    }
    return time;
};

/**
 * Format Date object or string to dd/MM/yyyy in Jakarta TZ
 */
export const formatDate = (date: any) => {
    if (!date) return '-';
    try {
        if (date instanceof Date || (typeof date === 'string' && date.includes('T'))) {
            return formatDateJakarta(date);
        }
    } catch (e) {
        console.error('formatDate error:', e);
    }
    return date;
};
