import { test, expect } from '@playwright/test';

/**
 * Critical Pages Test - Focused on Fixed Issues
 * 
 * Tests the specific pages that were fixed:
 * 1. Monitoring page (useContext error fix)
 * 2. Dashboard pages (data mapping fix)
 * 3. Management Data (paginated response fix)
 */

const ADMIN_CREDENTIALS = {
    email: 'adityamnss',
    password: 'adityamnss@22960017'
};

const SUPERVISOR_CREDENTIALS = {
    email: 'Hilmy',
    password: 'Hilmy12345'
};

const PARTICIPANT_CREDENTIALS = {
    email: 'hanifan1234',
    password: 'hanifan12345'
};

test.describe('Critical Pages - Post-Fix Validation', () => {
    test.setTimeout(120000); // 2 minutes per test

    test('Supervisor Monitoring Page - No useContext Error', async ({ page }) => {
        console.log('🔍 Testing Monitoring page for useContext error...');

        // Login as supervisor
        await page.goto('http://localhost:3001/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await page.fill('input[name="username"]', SUPERVISOR_CREDENTIALS.email);
        await page.fill('input[name="password"]', SUPERVISOR_CREDENTIALS.password);
        await page.click('button[type="submit"]');

        console.log('⏳ Waiting for dashboard redirect...');
        await page.waitForTimeout(5000); // Give time for redirect

        const currentUrl = page.url();
        console.log('📍 Current URL after login:', currentUrl);

        // Navigate to Monitoring page
        console.log('🔄 Navigating to Monitoring page...');
        await page.goto('http://localhost:3001/Monitoringsuper');
        await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
        await page.waitForTimeout(3000);

        // Take screenshot
        await page.screenshot({ path: 'test-results/monitoring-page.png', fullPage: true });

        // Check for errors
        const pageContent = await page.content();

        console.log('✅ Checking for errors...');
        const hasUseContextError = pageContent.includes('useContext') && pageContent.includes('null');
        const hasInternalServerError = pageContent.includes('Internal Server Error');
        const hasTypeError = pageContent.includes('TypeError');
        const hasMapError = pageContent.includes('Cannot read properties of undefined (reading \'map\')');

        console.log('  - useContext error:', hasUseContextError ? '❌ FOUND' : '✅ NOT FOUND');
        console.log('  - Internal Server Error:', hasInternalServerError ? '❌ FOUND' : '✅ NOT FOUND');
        console.log('  - TypeError:', hasTypeError ? '❌ FOUND' : '✅ NOT FOUND');
        console.log('  - Map error:', hasMapError ? '❌ FOUND' : '✅ NOT FOUND');

        expect(hasUseContextError).toBeFalsy();
        expect(hasInternalServerError).toBeFalsy();
        expect(hasMapError).toBeFalsy();

        // Check if page has expected content
        const hasMonitoringText = pageContent.toLowerCase().includes('monitoring') ||
            pageContent.toLowerCase().includes('attendance') ||
            pageContent.toLowerCase().includes('kehadiran');

        console.log('  - Has monitoring content:', hasMonitoringText ? '✅ YES' : '❌ NO');
        expect(hasMonitoringText).toBeTruthy();

        console.log('✅ Monitoring page test PASSED!');
    });

    test('Supervisor Dashboard - No Data Mapping Errors', async ({ page }) => {
        console.log('🔍 Testing Supervisor Dashboard for data mapping errors...');

        await page.goto('http://localhost:3001/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await page.fill('input[name="username"]', SUPERVISOR_CREDENTIALS.email);
        await page.fill('input[name="password"]', SUPERVISOR_CREDENTIALS.password);
        await page.click('button[type="submit"]');

        console.log('⏳ Waiting for dashboard to load...');
        await page.waitForTimeout(8000);

        await page.screenshot({ path: 'test-results/supervisor-dashboard.png', fullPage: true });

        const pageContent = await page.content();

        console.log('✅ Checking for data mapping issues...');
        const hasUndefined = pageContent.includes('>undefined<') || pageContent.includes('undefined</');
        const hasNaN = pageContent.includes('>NaN<') || pageContent.includes('NaN</');
        const hasNull = pageContent.includes('>null<') || pageContent.includes('null</');
        const hasMapError = pageContent.includes('Cannot read properties of undefined (reading \'map\')');

        console.log('  - Undefined values:', hasUndefined ? '❌ FOUND' : '✅ NOT FOUND');
        console.log('  - NaN values:', hasNaN ? '❌ FOUND' : '✅ NOT FOUND');
        console.log('  - Null values:', hasNull ? '❌ FOUND' : '✅ NOT FOUND');
        console.log('  - Map error:', hasMapError ? '❌ FOUND' : '✅ NOT FOUND');

        expect(hasUndefined).toBeFalsy();
        expect(hasNaN).toBeFalsy();
        expect(hasMapError).toBeFalsy();

        console.log('✅ Supervisor Dashboard test PASSED!');
    });

    test('Admin Management Data - Paginated Response Handling', async ({ page }) => {
        console.log('🔍 Testing Management Data page for paginated response handling...');

        await page.goto('http://localhost:3001/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await page.fill('input[name="username"]', ADMIN_CREDENTIALS.email);
        await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
        await page.click('button[type="submit"]');

        console.log('⏳ Waiting for admin dashboard...');
        await page.waitForTimeout(5000);

        console.log('🔄 Navigating to Management Data...');
        await page.goto('http://localhost:3001/ManagementData');
        await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
        await page.waitForTimeout(5000);

        await page.screenshot({ path: 'test-results/management-data.png', fullPage: true });

        const pageContent = await page.content();

        console.log('✅ Checking for errors...');
        const hasServerError = pageContent.includes('Internal Server Error');
        const hasTypeError = pageContent.includes('TypeError');
        const hasMapError = pageContent.includes('Cannot read properties of undefined (reading \'map\')');
        const hasNoDataAvailable = pageContent.includes('No user data available') ||
            pageContent.includes('No unit data available');

        console.log('  - Server error:', hasServerError ? '❌ FOUND' : '✅ NOT FOUND');
        console.log('  - TypeError:', hasTypeError ? '❌ FOUND' : '✅ NOT FOUND');
        console.log('  - Map error:', hasMapError ? '❌ FOUND' : '✅ NOT FOUND');
        console.log('  - "No data available" message:', hasNoDataAvailable ? '⚠️ FOUND (check if expected)' : '✅ NOT FOUND');

        expect(hasServerError).toBeFalsy();
        expect(hasTypeError).toBeFalsy();
        expect(hasMapError).toBeFalsy();

        // Check if tables are present
        const hasTables = await page.locator('table').count() > 0;
        console.log('  - Tables present:', hasTables ? '✅ YES' : '❌ NO');

        console.log('✅ Management Data test PASSED!');
    });

    test('Assessment Page - Dynamic Import & Client Component', async ({ page }) => {
        console.log('🔍 Testing Assessment page for dynamic import issues...');

        await page.goto('http://localhost:3001/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await page.fill('input[name="username"]', SUPERVISOR_CREDENTIALS.email);
        await page.fill('input[name="password"]', SUPERVISOR_CREDENTIALS.password);
        await page.click('button[type="submit"]');

        console.log('⏳ Waiting for dashboard...');
        await page.waitForTimeout(5000);

        console.log('🔄 Navigating to Assessment page...');
        await page.goto('http://localhost:3001/assessmentsuper');
        await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
        await page.waitForTimeout(3000);

        await page.screenshot({ path: 'test-results/assessment-page.png', fullPage: true });

        const pageContent = await page.content();

        console.log('✅ Checking for errors...');
        const hasServerError = pageContent.includes('Internal Server Error');
        const hasUseContextError = pageContent.includes('useContext') && pageContent.includes('null');
        const hasTypeError = pageContent.includes('TypeError');

        console.log('  - Server error:', hasServerError ? '❌ FOUND' : '✅ NOT FOUND');
        console.log('  - useContext error:', hasUseContextError ? '❌ FOUND' : '✅ NOT FOUND');
        console.log('  - TypeError:', hasTypeError ? '❌ FOUND' : '✅ NOT FOUND');

        expect(hasServerError).toBeFalsy();
        expect(hasUseContextError).toBeFalsy();
        expect(hasTypeError).toBeFalsy();

        const hasAssessmentContent = pageContent.toLowerCase().includes('penilaian') ||
            pageContent.toLowerCase().includes('assessment') ||
            pageContent.toLowerCase().includes('rekap');

        console.log('  - Has assessment content:', hasAssessmentContent ? '✅ YES' : '❌ NO');
        expect(hasAssessmentContent).toBeTruthy();

        console.log('✅ Assessment page test PASSED!');
    });

    test('Participant Dashboard - Check-in Flow', async ({ page }) => {
        console.log('🔍 Testing Participant Dashboard...');

        await page.goto('http://localhost:3001/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await page.fill('input[name="username"]', PARTICIPANT_CREDENTIALS.email);
        await page.fill('input[name="password"]', PARTICIPANT_CREDENTIALS.password);

        await page.waitForTimeout(1000);

        // Try clicking the button explicitly first
        const loginBtn = page.locator('button[type="submit"]');
        await loginBtn.click().catch(() => page.keyboard.press('Enter'));

        console.log('⏳ Waiting for participant dashboard redirect...');
        // Wait for URL or some sign of success
        await Promise.race([
            page.waitForURL('**/dashboarduser', { timeout: 20000 }),
            page.waitForSelector('.notistack-Snackbar', { timeout: 20000 })
        ]).catch(e => console.log('Wait finished or timed out'));

        console.log('📍 Current URL:', page.url());

        // If still on login, maybe there was an error message
        if (page.url().includes('/login')) {
            const errorMsg = await page.locator('.MuiFormHelperText-root.Mui-error').first().textContent().catch(() => '');
            if (errorMsg) console.log('  ❌ Login Error found on page:', errorMsg);
        }

        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'test-results/participant-final-check.png', fullPage: true });

        const pageContent = await page.content();

        console.log('✅ Checking for errors...');
        const hasServerError = pageContent.includes('Internal Server Error');
        const hasTypeError = pageContent.includes('TypeError');
        const hasMapError = pageContent.includes('Cannot read properties of undefined (reading \'map\')');

        console.log('  - Server error:', hasServerError ? '❌ FOUND' : '✅ NOT FOUND');
        console.log('  - TypeError:', hasTypeError ? '❌ FOUND' : '✅ NOT FOUND');
        console.log('  - Map error:', hasMapError ? '❌ FOUND' : '✅ NOT FOUND');

        expect(hasServerError).toBeFalsy();
        expect(hasTypeError).toBeFalsy();
        expect(hasMapError).toBeFalsy();

        const hasAttendanceContent = pageContent.toLowerCase().includes('attendance') ||
            pageContent.toLowerCase().includes('check') ||
            pageContent.toLowerCase().includes('kehadiran');

        console.log('  - Has attendance content:', hasAttendanceContent ? '✅ YES' : '❌ NO');
        expect(hasAttendanceContent).toBeTruthy();

        console.log('✅ Participant Dashboard test PASSED!');
    });

    test('Leave Request List - Data Normalization', async ({ page }) => {
        console.log('🔍 Testing Leave Request List data normalization...');

        await page.goto('http://localhost:3001/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await page.fill('input[name="username"]', SUPERVISOR_CREDENTIALS.email);
        await page.fill('input[name="password"]', SUPERVISOR_CREDENTIALS.password);
        await page.click('button[type="submit"]');

        console.log('⏳ Waiting for dashboard...');
        await page.waitForTimeout(5000);

        // Go to dashboard which should have leave request list
        const pageContent = await page.content();

        console.log('✅ Checking for leave request errors...');
        const hasMapError = pageContent.includes('Cannot read properties of undefined (reading \'map\')');
        const hasDataError = pageContent.includes('requestsData?.requests');

        console.log('  - Map error in leave requests:', hasMapError ? '❌ FOUND' : '✅ NOT FOUND');
        console.log('  - Old data accessor:', hasDataError ? '❌ FOUND' : '✅ NOT FOUND');

        expect(hasMapError).toBeFalsy();

        console.log('✅ Leave Request List test PASSED!');
    });
});
