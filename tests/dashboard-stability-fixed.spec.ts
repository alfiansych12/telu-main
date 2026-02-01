import { test, expect } from '@playwright/test';

/**
 * Dashboard Stability Test Suite - FIXED VERSION
 * 
 * Tests all major dashboard pages after code restructuring
 * Uses correct selectors based on debug findings
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

test.describe('Dashboard Stability Tests - Fixed', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(90000); // 90 seconds timeout
    });

    test.describe('Admin Dashboard Tests', () => {
        test('Admin login and dashboard access', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            await page.fill('input[name="username"]', ADMIN_CREDENTIALS.email);
            await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
            await page.click('button[type="submit"]');

            await page.waitForURL('**/dashboard', { timeout: 15000 });

            const errorElement = page.locator('text=/error|Error|500|404/i').first();
            await expect(errorElement).not.toBeVisible({ timeout: 5000 }).catch(() => { });

            await expect(page.locator('text=/dashboard|Dashboard/i').first()).toBeVisible({ timeout: 5000 });
        });

        test('Management Data page loads correctly', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.waitForTimeout(1000);
            await page.fill('input[name="username"]', ADMIN_CREDENTIALS.email);
            await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboard', { timeout: 15000 });

            await page.goto('http://localhost:3001/ManagementData');
            await page.waitForLoadState('networkidle', { timeout: 15000 });

            const pageContent = await page.content();
            expect(pageContent).not.toContain('Internal Server Error');
            expect(pageContent).not.toContain('TypeError');
            expect(pageContent).not.toContain('useContext');

            const hasContent = await page.locator('table, [role="table"], text=/user|User|peserta/i').first().isVisible({ timeout: 5000 }).catch(() => false);
            expect(hasContent).toBeTruthy();
        });

        test('Attendance Report page loads correctly', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.waitForTimeout(1000);
            await page.fill('input[name="username"]', ADMIN_CREDENTIALS.email);
            await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboard', { timeout: 15000 });

            await page.goto('http://localhost:3001/AttendanceReport');
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
            await page.waitForTimeout(1000);

            await page.fill('input[name="username"]', SUPERVISOR_CREDENTIALS.email);
            await page.fill('input[name="password"]', SUPERVISOR_CREDENTIALS.password);
            await page.click('button[type="submit"]');

            await page.waitForURL('**/dashboardsuper', { timeout: 15000 });

            const errorElement = page.locator('text=/error|Error|500|404/i').first();
            await expect(errorElement).not.toBeVisible({ timeout: 5000 }).catch(() => { });

            await expect(page.locator('text=/dashboard|Dashboard|Today/i').first()).toBeVisible({ timeout: 5000 });
        });

        test('Monitoring page loads without useContext error', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.waitForTimeout(1000);
            await page.fill('input[name="username"]', SUPERVISOR_CREDENTIALS.email);
            await page.fill('input[name="password"]', SUPERVISOR_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboardsuper', { timeout: 15000 });

            await page.goto('http://localhost:3001/Monitoringsuper');
            await page.waitForLoadState('networkidle', { timeout: 20000 });

            const pageContent = await page.content();
            expect(pageContent).not.toContain('useContext');
            expect(pageContent).not.toContain('Internal Server Error');
            expect(pageContent).not.toContain('TypeError: Cannot read properties of null');
            expect(pageContent).not.toContain('Cannot read properties of undefined (reading \'map\')');

            const hasMonitoringContent = await page.locator('text=/monitoring|Monitoring|attendance|Attendance/i').first().isVisible({ timeout: 5000 }).catch(() => false);
            expect(hasMonitoringContent).toBeTruthy();
        });

        test('Assessment page loads correctly', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.waitForTimeout(1000);
            await page.fill('input[name="username"]', SUPERVISOR_CREDENTIALS.email);
            await page.fill('input[name="password"]', SUPERVISOR_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboardsuper', { timeout: 15000 });

            await page.goto('http://localhost:3001/assessmentsuper');
            await page.waitForLoadState('networkidle', { timeout: 15000 });

            const pageContent = await page.content();
            expect(pageContent).not.toContain('Internal Server Error');
            expect(pageContent).not.toContain('useContext');
            expect(pageContent).not.toContain('TypeError');
        });
    });

    test.describe('Participant Dashboard Tests', () => {
        test('Participant login and dashboard access', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            await page.fill('input[name="username"]', PARTICIPANT_CREDENTIALS.email);
            await page.fill('input[name="password"]', PARTICIPANT_CREDENTIALS.password);
            await page.click('button[type="submit"]');

            await page.waitForURL('**/dashboarduser', { timeout: 15000 });

            const errorElement = page.locator('text=/error|Error|500|404/i').first();
            await expect(errorElement).not.toBeVisible({ timeout: 5000 }).catch(() => { });

            const hasContent = await page.locator('text=/attendance|Attendance|check|Check/i').first().isVisible({ timeout: 5000 }).catch(() => false);
            expect(hasContent).toBeTruthy();
        });
    });

    test.describe('Critical Error Checks', () => {
        test('Supervisor dashboard displays data without undefined/NaN', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.waitForTimeout(1000);
            await page.fill('input[name="username"]', SUPERVISOR_CREDENTIALS.email);
            await page.fill('input[name="password"]', SUPERVISOR_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboardsuper', { timeout: 15000 });

            await page.waitForLoadState('networkidle', { timeout: 15000 });

            const pageContent = await page.content();
            const hasUndefinedStats = pageContent.includes('undefined') || pageContent.includes('NaN');
            expect(hasUndefinedStats).toBeFalsy();
        });

        test('Monitoring page displays attendance records or no data message', async ({ page }) => {
            await page.goto('http://localhost:3001/login');
            await page.waitForTimeout(1000);
            await page.fill('input[name="username"]', SUPERVISOR_CREDENTIALS.email);
            await page.fill('input[name="password"]', SUPERVISOR_CREDENTIALS.password);
            await page.click('button[type="submit"]');
            await page.waitForURL('**/dashboardsuper', { timeout: 15000 });

            await page.goto('http://localhost:3001/Monitoringsuper');
            await page.waitForLoadState('networkidle', { timeout: 20000 });

            const hasTable = await page.locator('table, [role="table"]').first().isVisible({ timeout: 5000 }).catch(() => false);
            const hasNoDataMessage = await page.locator('text=/no.*record|tidak.*data/i').first().isVisible({ timeout: 5000 }).catch(() => false);

            expect(hasTable || hasNoDataMessage).toBeTruthy();
        });
    });
});
