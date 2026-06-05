const baseURL = process.env.GREENFRAME_FRONTEND_URL || 'http://localhost:5173';
const email = process.env.GREENFRAME_TEST_EMAIL || 'admin@optiacademic.com';
const password = process.env.GREENFRAME_TEST_PASSWORD || 'admin123';

const waitSafe = async (page, ms) => {
    await page.waitForTimeout(ms);
};

const gotoSafe = async (page, url) => {
    let lastError;

    for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
            await page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: 60000,
            });
            await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
            return;
        } catch (error) {
            lastError = error;
            await waitSafe(page, 1500);
        }
    }

    throw lastError;
};

const environmentalImpactScenario = async (page) => {
    await gotoSafe(page, baseURL);
    await waitSafe(page, 1500);

    const emailInput = page
        .locator('input[name="email"], input[type="email"], input[placeholder*="correo" i], input[placeholder*="email" i]')
        .first();

    const loginRequired = await emailInput.isVisible({ timeout: 8000 }).catch(() => false);

    if (loginRequired) {
        await page.addMilestone('Login screen loaded');

        const passwordInput = page
            .locator('input[name="password"], input[type="password"], input[placeholder*="contraseña" i], input[placeholder*="password" i]')
            .first();

        const submitButton = page
            .locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Ingresar"), button:has-text("Login")')
            .first();

        await emailInput.fill(email);
        await passwordInput.fill(password);

        await submitButton.click();

        await page.waitForLoadState('domcontentloaded', { timeout: 30000 }).catch(() => {});
        await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
        await waitSafe(page, 3000);

        await page.addMilestone('Admin authentication attempted');
    }

    await gotoSafe(page, `${baseURL}/admin/dashboard`);
    await waitSafe(page, 3000);

    await page.addMilestone('Admin dashboard loaded');

    await gotoSafe(page, `${baseURL}/admin/environmental-impact`);
    await waitSafe(page, 3000);

    const title = page.locator('h1:has-text("Impacto ambiental"), text=Impacto ambiental').first();

    await title.waitFor({
        state: 'visible',
        timeout: 30000,
    }).catch(() => {});

    await page.addMilestone('Environmental impact dashboard loaded');

    await waitSafe(page, 11000);
};

module.exports = environmentalImpactScenario;
