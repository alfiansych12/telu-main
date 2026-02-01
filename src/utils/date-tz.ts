import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

export const TIMEZONE = 'Asia/Jakarta';

/**
 * Returns a Date object representing 'now' in Asia/Jakarta.
 * Even if the server is in UTC, this will help align logic.
 */
export const getJakartaNow = (): Date => {
    return toZonedTime(new Date(), TIMEZONE);
};

/**
 * Strips time and returns a Date at 00:00:00 in Jakarta timezone.
 */
export const getJakartaToday = (): Date => {
    const now = getJakartaNow();
    now.setHours(0, 0, 0, 0);
    return now;
};

/**
 * Formats a date string or object to a specific pattern in Jakarta timezone.
 */
export const formatInJakarta = (
    date: Date | string | number,
    pattern: string = 'yyyy-MM-dd HH:mm:ss'
): string => {
    try {
        const d = typeof date === 'string' ? new Date(date) : date;
        return formatInTimeZone(d, TIMEZONE, pattern);
    } catch (error) {
        console.error('Error formatting date in Jakarta TZ:', error);
        return '-';
    }
};

/**
 * Converts a standard Date object to a string "HH:mm:ss" in Jakarta.
 */
export const formatTimeJakarta = (date: Date | string): string => {
    return formatInJakarta(date, 'HH:mm:ss');
};

/**
 * Converts a standard Date object to "dd/MM/yyyy" in Jakarta.
 */
export const formatDateJakarta = (date: Date | string): string => {
    return formatInJakarta(date, 'dd/MM/yyyy');
};

/**
 * Useful for Prisma: ensures we are storing the correct date intent.
 */
export const toJakartaISO = (date: Date | string): string => {
    return formatInJakarta(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
};
