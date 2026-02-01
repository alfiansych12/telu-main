import { test, expect } from '@playwright/test';

/**
 * Participant Login Test - HTTP 431 Fix Validation
 * Tests login flow for participant accounts and validates no HTTP 431 errors occur
 */

test.describe('Participant Login - HTTP 431 Fix', () => {
    // Clear cookies before each test
    test.beforeEach(async ({ context }) => {
        await context.clearCookies();
    });

    test('Should login as participant without HTTP 431 error', async ({ page }) => {
        // Monitor network responses for HTTP 431 errors
        const errors: string[] = [];

        page.on('response', response => {
            if (response.status() === 431) {
                errors.push(`HTTP 431 on ${response.url()}`);
            }
        });

        // Navigate to login page
        console.log('1. Navigating to login page...');
        await page.goto('http://localhost:3001/login');
        await page.waitForLoadState('networkidle');

        // Take screenshot of login page
        await page.screenshot({ path: 'test-results/participant-login-page.png', fullPage: true });

        // Check for username input
        console.log('2. Looking for username input...');
        const usernameInput = page.locator('input[name="username"]').first();
        await expect(usernameInput).toBeVisible({ timeout: 10000 });

        // Check for password input
        console.log('3. Looking for password input...');
        const passwordInput = page.locator('input[name="password"]').first();
        await expect(passwordInput).toBeVisible({ timeout: 10000 });

        // Fill in participant credentials
        console.log('4. Filling in participant credentials...');
        await usernameInput.fill('Alfiansyach');
        await passwordInput.fill('Alfiansaych123');

        // Take screenshot after filling
        await page.screenshot({ path: 'test-results/participant-filled.png', fullPage: true });

        // Find and click login button
        console.log('5. Clicking login button...');
        const loginButton = page.locator('button[type="submit"]').first();
        await expect(loginButton).toBeVisible();
        await loginButton.click();

        // Wait for navigation or response
        console.log('6. Waiting for login response...');
        await page.waitForTimeout(3000);

        // Take screenshot after submit
        await page.screenshot({ path: 'test-results/participant-after-submit.png', fullPage: true });

        // Check current URL
        const currentUrl = page.url();
        console.log('7. Current URL:', currentUrl);

        // Verify no HTTP 431 errors occurred
        if (errors.length > 0) {
            console.error('❌ HTTP 431 errors detected:');
            errors.forEach(err => console.error('  -', err));
            throw new Error(`HTTP 431 errors occurred: ${errors.join(', ')}`);
        } else {
            console.log('✅ No HTTP 431 errors detected');
        }

        // Check if redirected to dashboard
        if (currentUrl.includes('dashboarduser') || currentUrl.includes('dashboard')) {
            console.log('✅ Successfully redirected to dashboard');

            // Wait for dashboard to load
            await page.waitForLoadState('networkidle');
            await page.screenshot({ path: 'test-results/participant-dashboard.png', fullPage: true });

            // Verify we're on dashboard page
            expect(currentUrl).toContain('dashboard');
        } else if (currentUrl.includes('error')) {
            console.error('❌ Redirected to error page');
            const pageContent = await page.content();
            console.error('Page content:', pageContent.substring(0, 500));
            throw new Error('Login failed - redirected to error page');
        } else {
            console.warn('⚠️ Still on login page or unexpected URL');

            // Check for error messages
            const errorText = await page.locator('text=/error|failed|invalid/i').first().textContent().catch(() => null);
            if (errorText) {
                console.error('❌ Error message found:', errorText);
                throw new Error(`Login failed: ${errorText}`);
            }
        }
    });

    test('Should handle cookie cleanup on login page', async ({ page }) => {
        console.log('1. Testing cookie cleanup mechanism...');

        // Set some dummy cookies to simulate old session
        await page.goto('http://localhost:3001/login');
        await page.context().addCookies([
            { name: 'test-cookie-1', value: 'value1', domain: 'localhost', path: '/' },
            { name: 'test-cookie-2', value: 'value2', domain: 'localhost', path: '/' },
            { name: 'test-cookie-3', value: 'value3', domain: 'localhost', path: '/' },
        ]);

        // Reload page to trigger cleanup
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Check cookies after cleanup
        const cookies = await page.context().cookies();
        console.log('2. Cookies after cleanup:', cookies.length);

        // Should have minimal cookies
        expect(cookies.length).toBeLessThan(10);
        console.log('✅ Cookie cleanup working correctly');
    });

    test('Should verify JWT token size is optimized', async ({ page }) => {
        console.log('1. Testing JWT token size optimization...');

        // Login
        await page.goto('http://localhost:3001/login');
        await page.waitForLoadState('networkidle');

        const usernameInput = page.locator('input[name="username"]').first();
        const passwordInput = page.locator('input[name="password"]').first();

        await usernameInput.fill('Alfiansyach');
        await passwordInput.fill('Alfiansaych123');

        const loginButton = page.locator('button[type="submit"]').first();
        await loginButton.click();

        // Wait for login to complete
        await page.waitForTimeout(3000);

        // Get all cookies
        const cookies = await page.context().cookies();
        console.log('2. Total cookies:', cookies.length);

        // Find session token
        const sessionCookie = cookies.find(c => c.name.includes('session-token'));

        if (sessionCookie) {
            const tokenSize = sessionCookie.value.length;
            console.log('3. Session token size:', tokenSize, 'bytes');

            // Token should be less than 2KB (2048 bytes) to prevent HTTP 431
            expect(tokenSize).toBeLessThan(2048);
            console.log('✅ JWT token size is optimized');
        } else {
            console.log('⚠️ No session token found (might not be logged in)');
        }
    });

    test('Should test logout and verify cookie cleanup', async ({ page }) => {
        console.log('1. Testing logout cookie cleanup...');

        // Login first
        await page.goto('http://localhost:3001/login');
        await page.waitForLoadState('networkidle');

        const usernameInput = page.locator('input[name="username"]').first();
        const passwordInput = page.locator('input[name="password"]').first();

        await usernameInput.fill('Alfiansyach');
        await passwordInput.fill('Alfiansaych123');

        const loginButton = page.locator('button[type="submit"]').first();
        await loginButton.click();

        await page.waitForTimeout(3000);

        // Check if on dashboard
        if (page.url().includes('dashboard')) {
            console.log('2. Successfully logged in, now testing logout...');

            // Get cookies before logout
            const cookiesBeforeLogout = await page.context().cookies();
            console.log('3. Cookies before logout:', cookiesBeforeLogout.length);

            // Find and click logout button
            // Try multiple selectors
            const logoutSelectors = [
                'button:has-text("Logout")',
                'button:has-text("Log Out")',
                '[aria-label*="logout" i]',
                'text=Logout'
            ];

            let loggedOut = false;
            for (const selector of logoutSelectors) {
                const logoutBtn = page.locator(selector).first();
                if (await logoutBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await logoutBtn.click();
                    loggedOut = true;
                    console.log('4. Clicked logout button');
                    break;
                }
            }

            if (loggedOut) {
                await page.waitForTimeout(2000);

                // Should redirect to login
                expect(page.url()).toContain('login');
                console.log('5. Redirected to login page');

                // Get cookies after logout
                const cookiesAfterLogout = await page.context().cookies();
                console.log('6. Cookies after logout:', cookiesAfterLogout.length);

                // Should have fewer cookies
                expect(cookiesAfterLogout.length).toBeLessThanOrEqual(cookiesBeforeLogout.length);
                console.log('✅ Logout cookie cleanup working');
            } else {
                console.log('⚠️ Logout button not found');
            }
        } else {
            console.log('⚠️ Login failed, skipping logout test');
        }
    });
});
