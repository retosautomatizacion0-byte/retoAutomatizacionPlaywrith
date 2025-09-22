import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  // Aumentado el timeout global de la prueba a 2 minutos para evitar falsos negativos por esperas largas.
  timeout: 120 * 1000,
  expect: {
    timeout: 5000
  },
  retries: 0,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    // tiempo de navegación por defecto
    navigationTimeout: 60 * 1000,
    actionTimeout: 30 * 1000,
    baseURL: 'https://www.floristeriamundoflor.com'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        headless: true,
        viewport: null,
        launchOptions: {
          args: ['--start-maximized']   // arranca maximizado
        },
        video: 'retain-on-failure',
        trace: 'on-first-retry'
      }
    }
  ]
});
