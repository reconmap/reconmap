const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const screenshotDir = path.resolve(__dirname, '../../docs/pages/images/screenshots');

    async function login() {
        console.log('Logging in...');
        await page.goto('http://localhost:5500');
        // Redirect to Keycloak
        await page.waitForURL(/.*:8080\/realms\/reconmap\/protocol\/openid-connect\/auth.*/);
        await page.fill('#username', 'admin');
        await page.fill('#password', 'admin123');
        await page.click('#kc-login');
        await page.waitForURL('http://localhost:5500/');
        console.log('Login successful.');
    }

    async function takeScreenshot(name, urlSuffix) {
        console.log(`Taking screenshot of ${name} at ${urlSuffix}...`);
        await page.goto(`http://localhost:5500${urlSuffix}`);
        await page.waitForLoadState('networkidle');
        // Give it a bit more time for any animations or data loading
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(screenshotDir, `${name}.png`) });
    }

    try {
        await login();
        await takeScreenshot('dashboard-stats', '/');
        await takeScreenshot('vulnerabilities', '/vulnerabilities');
        await takeScreenshot('tasks', '/tasks');
        await takeScreenshot('projects', '/projects');
        await takeScreenshot('integrations', '/settings/integrations');
        await takeScreenshot('audit-log', '/settings/audit-log');
        await takeScreenshot('user-preferences', '/user/profile');
        await takeScreenshot('users-list', '/users');
        await takeScreenshot('vulnerabilities-categories', '/vulnerabilities/categories');
        await takeScreenshot('api-tokens', '/system/api-tokens');
    } catch (error) {
        console.error('Error during screenshot generation:', error);
    } finally {
        await browser.close();
    }
})();
