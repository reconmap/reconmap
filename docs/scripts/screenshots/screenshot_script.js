const { chromium } = require('playwright');
const path = require('path');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    // Set viewport to a common desktop size
    await page.setViewportSize({ width: 1280, height: 800 });
    
    const screenshotDir = path.resolve(__dirname, '../../pages/images/screenshots');

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
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(screenshotDir, `${name}.png`), fullPage: false });
    }

    // Ids are UUIDs, so open the first item of a list instead of using a fixed id.
    async function firstItemUrl(listUrl, prefix) {
        await page.goto(`http://localhost:5500${listUrl}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        const hrefs = await page.locator(`a[href^="${prefix}/"]`).evaluateAll((links) => links.map((a) => a.getAttribute('href')));
        const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const href = hrefs.find((h) => uuid.test(h.slice(prefix.length + 1)));
        if (!href) throw new Error(`No item found on ${listUrl}`);
        return href;
    }

    try {
        await login();
        
        // General
        await takeScreenshot('dashboard', '/');
        
        // Projects
        await takeScreenshot('projects', '/projects');
        await takeScreenshot('project-details', await firstItemUrl('/projects', '/projects'));
        await takeScreenshot('project-create', '/projects/create');
        
        // Findings
        await takeScreenshot('findings', '/findings');
        await takeScreenshot('finding-details', await firstItemUrl('/findings', '/findings'));
        await takeScreenshot('finding-create', '/findings/create');
        await takeScreenshot('finding-categories', '/findings/categories');
        
        // Tasks
        await takeScreenshot('tasks', '/tasks');
        
        // Clients
        await takeScreenshot('clients', '/clients');
        
        // Commands
        await takeScreenshot('commands', '/commands');
        
        // Documents
        await takeScreenshot('documents', '/documents');
        
        // Tools
        await takeScreenshot('vault', '/tools/vault');
        await takeScreenshot('password-generator', '/tools/password-generator');
        
        // Settings / System
        await takeScreenshot('users', '/users');
        await takeScreenshot('user-preferences', '/users/1/edit');
        await takeScreenshot('audit-log', '/auditlog');
        await takeScreenshot('system-health', '/system/health');
        await takeScreenshot('system-usage', '/system/usage');
        await takeScreenshot('mail-settings', '/system/mail-settings');
        await takeScreenshot('ai-settings', '/system/ai-settings');
        await takeScreenshot('integrations', '/system/integrations');
        await takeScreenshot('api-tokens', '/integrations/api-tokens');
        await takeScreenshot('export-data', '/system/export-data');
        await takeScreenshot('import-data', '/system/import-data');

    } catch (error) {
        console.error('Error during screenshot generation:', error);
    } finally {
        await browser.close();
    }
})();
