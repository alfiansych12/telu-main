import { test, expect } from '@playwright/test';

/**
 * Simple Login Test
 * Debug test to identify login form issues
 */

test.describe('Login Form Debug', () => {
    test('Check login form elements', async ({ page }) => {
        await page.goto('http://localhost:3001/login');
        await page.waitForLoadState('networkidle');

        // Take screenshot
        await page.screenshot({ path: 'test-results/login-page.png', fullPage: true });

        // Log page content
        const content = await page.content();
        console.log('Page title:', await page.title());

        // Check for input fields
        const emailInput = page.locator('input[type="text"], input[type="email"], input[name="email"], input[name="username"]');
        const passwordInput = page.locator('input[type="password"], input[name="password"]');
        const submitButton = page.locator('button[type="submit"], button:has-text("login"), button:has-text("Login"), button:has-text("Sign in")');

        console.log('Email input count:', await emailInput.count());
        console.log('Password input count:', await passwordInput.count());
        console.log('Submit button count:', await submitButton.count());

        // Try to find any input
        const allInputs = page.locator('input');
        console.log('Total inputs:', await allInputs.count());

        for (let i = 0; i < await allInputs.count(); i++) {
            const input = allInputs.nth(i);
            const type = await input.getAttribute('type');
            const name = await input.getAttribute('name');
            const placeholder = await input.getAttribute('placeholder');
            console.log(`Input ${i}: type=${type}, name=${name}, placeholder=${placeholder}`);
        }

        // Try to find any button
        const allButtons = page.locator('button');
        console.log('Total buttons:', await allButtons.count());

        for (let i = 0; i < await allButtons.count(); i++) {
            const button = allButtons.nth(i);
            const text = await button.textContent();
            const type = await button.getAttribute('type');
            console.log(`Button ${i}: type=${type}, text=${text}`);
        }
    });

    test('Try admin login with actual selectors', async ({ page }) => {
        await page.goto('http://localhost:3001/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Take screenshot before
        await page.screenshot({ path: 'test-results/before-login.png', fullPage: true });

        // Try different selector strategies
        const emailSelectors = [
            'input[name="email"]',
            'input[type="email"]',
            'input[type="text"]',
            'input[placeholder*="email" i]',
            'input[placeholder*="username" i]',
            'input:first-of-type'
        ];

        let emailInput = null;
        for (const selector of emailSelectors) {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
                emailInput = element;
                console.log(`Found email input with selector: ${selector}`);
                break;
            }
        }

        const passwordSelectors = [
            'input[name="password"]',
            'input[type="password"]'
        ];

        let passwordInput = null;
        for (const selector of passwordSelectors) {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
                passwordInput = element;
                console.log(`Found password input with selector: ${selector}`);
                break;
            }
        }

        if (emailInput && passwordInput) {
            await emailInput.fill('adityamnss');
            await passwordInput.fill('adityamnss@22960017');

            // Take screenshot after filling
            await page.screenshot({ path: 'test-results/after-fill.png', fullPage: true });

            // Find submit button
            const submitSelectors = [
                'button[type="submit"]',
                'button:has-text("Login")',
                'button:has-text("Sign in")',
                'button:has-text("Masuk")',
                'form button'
            ];

            let submitButton = null;
            for (const selector of submitSelectors) {
                const element = page.locator(selector).first();
                if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
                    submitButton = element;
                    console.log(`Found submit button with selector: ${selector}`);
                    break;
                }
            }

            if (submitButton) {
                await submitButton.click();

                // Wait for navigation or error
                await page.waitForTimeout(5000);

                // Take screenshot after submit
                await page.screenshot({ path: 'test-results/after-submit.png', fullPage: true });

                const currentUrl = page.url();
                console.log('Current URL after submit:', currentUrl);

                // Check if redirected
                if (currentUrl.includes('dashboard')) {
                    console.log('✓ Login successful - redirected to dashboard');
                } else {
                    console.log('✗ Login failed - still on login page or error');
                    const pageContent = await page.content();
                    if (pageContent.includes('error') || pageContent.includes('Error')) {
                        console.log('Error message found on page');
                    }
                }
            } else {
                console.log('✗ Submit button not found');
            }
        } else {
            console.log('✗ Email or password input not found');
            console.log('Email input found:', !!emailInput);
            console.log('Password input found:', !!passwordInput);
        }
    });
});
