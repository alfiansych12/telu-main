import { test, expect } from '@playwright/test';

test('Deep Debug Participant Login', async ({ page }) => {
    await page.goto('http://localhost:3001/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const email = 'hanifan1234';
    const password = 'hanifan12345';

    console.log('Filling form...');
    await page.fill('input[name="username"]', email);
    await page.fill('input[name="password"]', password);

    await page.screenshot({ path: 'test-results/debug-1-filled.png' });

    console.log('Clicking Login button...');
    const loginButton = page.locator('button:has-text("Login"), button[type="submit"]').first();
    await loginButton.click();

    // Wait for any reaction
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/debug-2-clicked.png' });

    // Check for helper texts (errors)
    const helperTexts = page.locator('.MuiFormHelperText-root.Mui-error');
    const count = await helperTexts.count();
    console.log('Error helper texts found:', count);
    for (let i = 0; i < count; i++) {
        console.log(`Error ${i}:`, await helperTexts.nth(i).textContent());
    }

    // Check for snackbar
    const snackbar = page.locator('.notistack-Snackbar');
    if (await snackbar.isVisible().catch(() => false)) {
        console.log('Snackbar detected:', await snackbar.textContent());
    }

    console.log('Waiting for redirect...');
    await page.waitForTimeout(10000);
    console.log('Final URL:', page.url());

    await page.screenshot({ path: 'test-results/debug-3-final.png' });
});
