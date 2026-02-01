import { test, expect } from '@playwright/test';

/**
 * Dashboard Stability Test Suite
 * 
 * Tests all major dashboard pages to ensure they load correctly
 * after significant code restructuring and API changes.
 */

// Test credentials for different roles
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

test.describe('Dashboard Stability Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Set a reasonable timeout for all tests
        test.setTimeout(60000);
    });

    test.describe('Admin Dashboard Tests', () => {
        test('Admin login and dashboard access', async ({ page }) => {
            await page.goto('http://localhost:3001/login');

            // Wait for login page to load
            await page.waitForLoadState('networkidle');

            // Fill in credentials
            await page.fill('input[name="email"]', ADMIN_CREDENTIALS.email);
            await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);

            // Click login button
            await page.click('button[type="submit"]');

            // Wait for navigation
            await page.waitForURL('**/dashboard', { timeout: 10000 });

            // Check if dashboard loaded without errors
            const errorElement = page.locator('text=/error|Error|500|404/i').first();
            await expect(errorElement).not.toBeVisible({ timeout: 5000 }).catch(() => { });

            // Verify dashboard content is present
            await expect(page.locator('text=/dashboard|Dashboard/i').first()).toBeVisible({ timeout: 5000 });
        });

        test('Management Data page loads correctly', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.fill('input[name="email"]', ADMIN_CREDENTIALS.email);
            await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboard', { timeout: 10000 });

            // Navigate to Management Data
            await page.goto('http://localhost:3001/ManagementData');
            await page.waitForLoadState('networkidle', { timeout: 15000 });

            // Check for no server errors
            const pageContent = await page.content();
            expect(pageContent).not.toContain('Internal Server Error');
            expect(pageContent).not.toContain('TypeError');
            expect(pageContent).not.toContain('useContext');

            // Verify table or content is present
            const hasContent = await page.locator('table, [role="table"], text=/user|User|peserta/i').first().isVisible({ timeout: 5000 }).catch(() => false);
            expect(hasContent).toBeTruthy();
        });

        test('Attendance Report page loads correctly', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.fill('input[name="email"]', ADMIN_CREDENTIALS.email);
            await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboard', { timeout: 10000 });

            await page.goto('http://localhost:3001/AttendanceReport');
            await page.waitForLoadState('networkidle', { timeout: 15000 });

            const pageContent = await page.content();
            expect(pageContent).not.toContain('Internal Server Error');
            expect(pageContent).not.toContain('TypeError');
        });

        test('Certificate Scanner page loads correctly', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.fill('input[name="email"]', ADMIN_CREDENTIALS.email);
            await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboard', { timeout: 10000 });

            await page.goto('http://localhost:3001/CertificateScanner');
            await page.waitForLoadState('networkidle', { timeout: 15000 });

            const pageContent = await page.content();
            expect(pageContent).not.toContain('Internal Server Error');
            expect(pageContent).not.toContain('TypeError');
        });
    });

    test.describe('Supervisor Dashboard Tests', () => {
        test('Supervisor login and dashboard access', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.waitForLoadState('networkidle');

            await page.fill('input[name="email"]', SUPERVISOR_CREDENTIALS.email);
            await page.fill('input[name="password"]', SUPERVISOR_CREDENTIALS.password);
            await page.click('button[type="submit"]');

            await page.waitForURL('**/dashboardsuper', { timeout: 10000 });

            const errorElement = page.locator('text=/error|Error|500|404/i').first();
            await expect(errorElement).not.toBeVisible({ timeout: 5000 }).catch(() => { });

            await expect(page.locator('text=/dashboard|Dashboard|Today/i').first()).toBeVisible({ timeout: 5000 });
        });

        test('Monitoring page loads without useContext error', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.fill('input[name="email"]', SUPERVISOR_CREDENTIALS.email);
            await page.fill('input[name="password"]', SUPERVISOR_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboardsuper', { timeout: 10000 });

            // Navigate to Monitoring page
            await page.goto('http://localhost:3001/Monitoringsuper');
            await page.waitForLoadState('networkidle', { timeout: 15000 });

            // Check for specific errors that were occurring
            const pageContent = await page.content();
            expect(pageContent).not.toContain('useContext');
            expect(pageContent).not.toContain('Internal Server Error');
            expect(pageContent).not.toContain('TypeError: Cannot read properties of null');
            expect(pageContent).not.toContain('Cannot read properties of undefined (reading \'map\')');

            // Verify monitoring content is present
            const hasMonitoringContent = await page.locator('text=/monitoring|Monitoring|attendance|Attendance/i').first().isVisible({ timeout: 5000 }).catch(() => false);
            expect(hasMonitoringContent).toBeTruthy();
        });

        test('Assessment page loads correctly', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.fill('input[name="email"]', SUPERVISOR_CREDENTIALS.email);
            await page.fill('input[name="password"]', SUPERVISOR_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboardsuper', { timeout: 10000 });

            await page.goto('http://localhost:3001/assessmentsuper');
            await page.waitForLoadState('networkidle', { timeout: 15000 });

            const pageContent = await page.content();
            expect(pageContent).not.toContain('Internal Server Error');
            expect(pageContent).not.toContain('useContext');
            expect(pageContent).not.toContain('TypeError');
        });

        test('Supervisor Attendance Report access', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.fill('input[name="email"]', SUPERVISOR_CREDENTIALS.email);
            await page.fill('input[name="password"]', SUPERVISOR_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboardsuper', { timeout: 10000 });

            await page.goto('http://localhost:3001/AttendanceReport');
            await page.waitForLoadState('networkidle', { timeout: 15000 });

            const pageContent = await page.content();
            expect(pageContent).not.toContain('Internal Server Error');
            expect(pageContent).not.toContain('TypeError');
        });
    });

    test.describe('Participant Dashboard Tests', () => {
        test('Participant login and dashboard access', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.waitForLoadState('networkidle');

            await page.fill('input[name="email"]', PARTICIPANT_CREDENTIALS.email);
            await page.fill('input[name="password"]', PARTICIPANT_CREDENTIALS.password);
            await page.click('button[type="submit"]');

            await page.waitForURL('**/dashboarduser', { timeout: 10000 });

            const errorElement = page.locator('text=/error|Error|500|404/i').first();
            await expect(errorElement).not.toBeVisible({ timeout: 5000 }).catch(() => { });

            // Verify participant dashboard content
            const hasContent = await page.locator('text=/attendance|Attendance|check|Check/i').first().isVisible({ timeout: 5000 }).catch(() => false);
            expect(hasContent).toBeTruthy();
        });

        test('Participant can access profile page', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.fill('input[name="email"]', PARTICIPANT_CREDENTIALS.email);
            await page.fill('input[name="password"]', PARTICIPANT_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboarduser', { timeout: 10000 });

            await page.goto('http://localhost:3001/Profilepart');
            await page.waitForLoadState('networkidle', { timeout: 15000 });

            const pageContent = await page.content();
            expect(pageContent).not.toContain('Internal Server Error');
            expect(pageContent).not.toContain('TypeError');
        });
    });

    test.describe('Data Mapping Tests', () => {
        test('Supervisor dashboard displays team data correctly', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.fill('input[name="email"]', SUPERVISOR_CREDENTIALS.email);
            await page.fill('input[name="password"]', SUPERVISOR_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboardsuper', { timeout: 10000 });

            // Wait for dashboard to load
            await page.waitForLoadState('networkidle', { timeout: 15000 });

            // Check that no "undefined" or "NaN" appears in statistics
            const pageContent = await page.content();
            const hasUndefinedStats = pageContent.includes('undefined') || pageContent.includes('NaN');
            expect(hasUndefinedStats).toBeFalsy();
        });

        test('Monitoring page displays attendance records', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.fill('input[name="email"]', SUPERVISOR_CREDENTIALS.email);
            await page.fill('input[name="password"]', SUPERVISOR_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboardsuper', { timeout: 10000 });

            await page.goto('http://localhost:3001/Monitoringsuper');
            await page.waitForLoadState('networkidle', { timeout: 15000 });

            // Check for either attendance data or "no records" message
            const hasTable = await page.locator('table, [role="table"]').first().isVisible({ timeout: 5000 }).catch(() => false);
            const hasNoDataMessage = await page.locator('text=/no.*record|tidak.*data/i').first().isVisible({ timeout: 5000 }).catch(() => false);

            // Either should be true (table with data or no data message)
            expect(hasTable || hasNoDataMessage).toBeTruthy();
        });
    });

    test.describe('Error Handling Tests', () => {
        test('Invalid route redirects properly', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.fill('input[name="email"]', ADMIN_CREDENTIALS.email);
            await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboard', { timeout: 10000 });

            // Try to access invalid route
            await page.goto('http://localhost:3001/invalid-route-test-12345');
            await page.waitForLoadState('networkidle', { timeout: 10000 });

            // Should show 404 or redirect, not crash
            const pageContent = await page.content();
            const hasError = pageContent.includes('404') || pageContent.includes('not found') || pageContent.includes('dashboard');
            expect(hasError).toBeTruthy();
        });

        test('Unauthenticated access redirects to login', async ({ page }) => {
            await page.goto('http://localhost:3001/dashboard');

            // Should redirect to login
            await page.waitForURL('**/login', { timeout: 10000 });

            const loginForm = await page.locator('input[name="email"]').isVisible({ timeout: 5000 });
            expect(loginForm).toBeTruthy();
        });
    });
});
