// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
    testDir: './tests',
    timeout: 30000,
    retries: 1,           // reintentar tests fallidos 1 vez
    use: {
        baseURL: 'https://www.saucedemo.com',
        headless: true,
        screenshot: 'on',   // 'on' | 'off' | 'only-on-failure'
        video: 'on',        // 'on' | 'off' | 'retain-on-failure'
        trace: 'on',        // 'on' | 'off' | 'retain-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['chromium'] },
        },
        {
            name: 'firefox',
            use: { ...devices['firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['webkit'] },
        },
    ],
});