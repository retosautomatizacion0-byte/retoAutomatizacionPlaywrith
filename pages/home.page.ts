import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  constructor(page: Page) { this.page = page; }

  async goto() {
   
    await this.page.goto('/', { waitUntil: 'load' });
  }

 
  categoryLink(name: string): Locator {
    return this.page.getByRole('link', { name: new RegExp(name, 'i') }).first();
  }

  async openCategory(name: string) {
    const link = this.categoryLink(name);
    await expect(link).toBeVisible({ timeout: 10000 });
    
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'load', timeout: 30000 }).catch(()=>null),
      link.click()
    ]);
    
    const heading = this.page.locator('h1, h2, h3', { hasText: new RegExp(name, 'i') });
    await heading.waitFor({ state: 'visible', timeout: 20000 }).catch(()=>{  });
  }
}
