import { Page } from '@playwright/test';

export class ProductoPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getName(): Promise<string> {
    const loc = this.page.locator('h1, h2, .product_title, .entry-title');
    if (await loc.count() > 0) {
      return (await loc.first().innerText()).trim();
    }
    return (await this.page.title()).trim();
  }

  async getPrice(): Promise<string> {
    const candidates = [
      '.price',
      '.amount',
      '.product-price',
      '.price > span',
      'span.price'
    ];
    for (const sel of candidates) {
      const loc = this.page.locator(sel);
      if (await loc.count() > 0) {
        return (await loc.first().innerText()).trim();
      }
    }
    const text = (await this.page.textContent('body')) || '';
    const m = text.match(/\d+[\.,]?\d*/);
    return m ? m[0] : '0';
  }

  async addToCart() {
    
    const addBtn = this.page.getByRole('button', {
      name: /agregar al carrito|añadir al carrito|add to cart|add to basket/i
    });
    if (await addBtn.count() > 0) {
      await addBtn.first().click();
      return;
    }


    const selectOptions = this.page.getByRole('link', {
      name: /seleccionar opciones|ver opciones|select options/i
    });
    if (await selectOptions.count() > 0) {
      await selectOptions.first().click();
      await this.page.waitForLoadState('load');
      const finalBtn = this.page.locator(
        'button.single_add_to_cart_button, button[name="add-to-cart"]'
      );
      await finalBtn.first().click();
      return;
    }

    
    const fallback = this.page.locator(
      'button.add_to_cart, button.single_add_to_cart_button, button[name="add-to-cart"]'
    );
    if (await fallback.count() > 0) {
      await fallback.first().click();
      return;
    }

    throw new Error('No se encontró botón de agregar al carrito');
  }
}
