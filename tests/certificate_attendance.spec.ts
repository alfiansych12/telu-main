import { test, expect } from '@playwright/test';

test.describe('Dashboard Page Stability', () => {
    const baseURL = 'http://localhost:3001';

    test('Certificate Scanner page should not have server error crash', async ({ page }) => {
        // Navigate to the target page
        await page.goto(`${baseURL}/CertificateScanner`);

        // Log the current URL and page title for debugging
        console.log('Current URL (Scanner):', page.url());

        // We expect NO "TypeError" or "Server Error" on the page body
        const bodyContent = await page.innerText('body');

        // Check if we reached a page that isn't a Next.js error page
        expect(bodyContent).not.toContain('TypeError: Cannot read properties of null');
        expect(bodyContent).not.toContain('Server Error');

        // If we're at login, that means the app is running and AuthGuard caught us
        if (page.url().includes('/login')) {
            console.log('Redirected to login (Expected)');
        } else {
            console.log('Likely rendered the page content');
        }
    });

    test('Attendance Report page should not have server error crash', async ({ page }) => {
        await page.goto(`${baseURL}/AttendanceReport`);

        console.log('Current URL (Report):', page.url());
        const bodyContent = await page.innerText('body');

        expect(bodyContent).not.toContain('TypeError: Cannot read properties of null');
        expect(bodyContent).not.toContain('Server Error');

        if (page.url().includes('/login')) {
            console.log('Redirected to login (Expected)');
        }
    });
});
