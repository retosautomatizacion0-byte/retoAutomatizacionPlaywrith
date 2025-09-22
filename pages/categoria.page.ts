import { Page, Locator } from '@playwright/test';

export class CategoriaPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

 
  async getProductCollection(): Promise<Locator> {
    const loc = this.page.locator('li.product');
    if (await loc.count() > 0) return loc;

    const fallback = this.page.locator('.product-item, .product');
    if (await fallback.count() > 0) return fallback;

   
    return this.page.locator('article, .card');
  }

  async getProductNameFromCard(card: Locator): Promise<string> {
    const candidates = [
      'h2',
      'h3',
      '.product-title',
      '.woocommerce-loop-product__title',
      '.title'
    ];
    for (const sel of candidates) {
      const loc = card.locator(sel);
      if (await loc.count() > 0) {
        return (await loc.first().innerText()).trim();
      }
    }
    return (await card.innerText()).split('\n')[0].trim();
  }

  async getProductPriceFromCard(card: Locator): Promise<string> {
    const candidates = [
      '.price',
      '.amount',
      '.product-price',
      '.price > span',
      'span.price'
    ];
    for (const sel of candidates) {
      const loc = card.locator(sel);
      if (await loc.count() > 0) {
        return (await loc.first().innerText()).trim();
      }
    }
    const text = await card.innerText();
    const m = text.match(/\d+[\.,]?\d*/);
    return m ? m[0] : '0';
  }

  async openProductCard(card: Locator) {
    const link = card.locator('a.woocommerce-LoopProduct-link');
    if (await link.count() > 0) {
      await link.first().click();
    } else {
      await card.first().click(); // fallback
    }
    await this.page.waitForLoadState('load');
  }
}
