import { Page } from '@playwright/test';

export class CarritoPage {
  readonly page: Page;
  readonly itemSelectors = ['.cart_item', '.woocommerce-cart-form__cart-item', '.cart-row', '.mini-cart .product'];
  readonly cartBtnSelector = 'a.dropdown-toggle.mini-cart';
  readonly cartMenuSelector = '#cart .dropdown-menu'; 
  readonly cartListItemsSelector = `${'#cart'} ul.cart_list.product_list_widget > li`;

  constructor(page: Page) {
    this.page = page;
  }


  async openMiniCart(): Promise<void> {
    const menu = this.page.locator(this.cartMenuSelector).first();
    try {
      if (await menu.isVisible()) return;
    } catch (e) {
      
    }

    const cartBtn = this.page.locator(this.cartBtnSelector);
    if (await cartBtn.count() === 0) {
      throw new Error('No se encontró botón del carrito (selector: ' + this.cartBtnSelector + ')');
    }

    await cartBtn.first().click();
    await menu.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {  });

    const itemsLocator = this.page.locator(this.cartListItemsSelector);
    const start = Date.now();
    while (Date.now() - start < 4000) {
      if ((await itemsLocator.count()) > 0) break;
      const txt = (await menu.innerText().catch(() => '')).trim();
      if (txt.length > 0) break;
      await this.page.waitForTimeout(200);
    }
  }

  async goto(): Promise<void> {
    await this.openMiniCart();
  }

  async getCartItemCount(): Promise<number> {
    await this.openMiniCart();
    const itemsLocator = this.page.locator(this.cartListItemsSelector);
    let cnt = await itemsLocator.count();
    if (cnt > 0) return cnt;

    const other = this.page.locator(`${this.cartMenuSelector} li.mini_cart_item`);
    cnt = await other.count();
    if (cnt > 0) return cnt;

    const spanInside = this.page.locator(`${this.cartBtnSelector} span.mini-cart-items`);
    if (await spanInside.count() > 0) {
      const txt = (await spanInside.first().innerText()).trim();
      const n = parseInt(txt.replace(/[^\d]/g, ''), 10);
      if (!Number.isNaN(n)) return n;
    }

    return 0;
  }

  async getCartItems(): Promise<{ name: string; price: string }[]> {
    await this.openMiniCart();
    const menu = this.page.locator(this.cartMenuSelector).first();

   
    const itemsLocator = this.page.locator(this.cartListItemsSelector);
    if (await itemsLocator.count() > 0) {
      const result: { name: string; price: string }[] = [];
      const n = await itemsLocator.count();
      for (let i = 0; i < n; i++) {
        const it = itemsLocator.nth(i);
        
        const name = (await it.locator('a, .product-name, .woocommerce-loop-product__title, h4, h3').first().innerText().catch(() => '')).trim();
        const price = (await it.locator('.amount, .price, .woocommerce-Price-amount, .product-amount').first().innerText().catch(() => '')).trim();

        
        let nm = name || '';
        let pr = price || '';
        if (!nm) {
          const t = (await it.innerText().catch(() => '')).trim();
          const m = t.match(/^(?:×\s*)?(.+?)\s+(?:Qty:|\bQty\b|\bx\b)\s*\d+/i);
          if (m) nm = m[1].trim();
        }
        if (!pr) {
          const t = (await it.innerText().catch(() => '')).trim();
          const m = t.match(/(\$\s*[0-9\.\,]+)/);
          if (m) pr = m[1].trim();
        }

        result.push({ name: nm, price: pr });
      }
      return result;
    }

    
    const rawText = (await menu.innerText().catch(() => '')).trim();
    if (rawText) {
      const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const result: { name: string; price: string }[] = [];
      for (const line of lines) {
        
        const m = line.match(/×?\s*(.+?)\s+(?:Qty:|\bQty\b|\bx\b)\s*\d+\s+(\$\s*[0-9\.\,]+)/i);
        if (m) {
          result.push({ name: m[1].trim(), price: m[2].trim() });
        }
      }
      return result;
    }

    return [];
  }

 
  async getSubtotalNumber(): Promise<number> {
    const candidates = [
      `${this.cartMenuSelector} p.total .amount`,
      `${this.cartMenuSelector} .woocommerce-Price-amount.amount`,
      '.order-total .amount',
      '.cart-subtotal .amount',
      '.woocommerce-Price-amount',
      '#cart-subtotal'
    ];
    for (const sel of candidates) {
      const loc = this.page.locator(sel);
      if (await loc.count() > 0) {
        const txt = (await loc.first().innerText()).trim();
        const num = parseFloat(
          txt.replace(/[^0-9,\.]/g, '') 
             .replace(/\./g, '')        
             .replace(',', '.')        
        );
        if (!isNaN(num)) return num;
      }
    }
  
 
    const items = await this.getCartItems();
    const total = items.reduce((s, it) => {
      const num = parseFloat(it.price.replace(/[^0-9,\.]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
      return s + num;
    }, 0);
    return total;
  }
  

 
  async removeItemAt(index = 0) {
    await this.openMiniCart();
    const menu = this.page.locator(this.cartMenuSelector).first();
    const removeSelectors = ['a.remove', '.remove', 'button.remove', '.product-remove a'];
    for (const sel of removeSelectors) {
      const elems = menu.locator(sel);
      if (await elems.count() > index) {
        const before = await this.getCartItemCount();
        await elems.nth(index).click();
        
        const start = Date.now();
        while (Date.now() - start < 5000) {
          const now = await this.getCartItemCount();
          if (now < before) break;
          await this.page.waitForTimeout(200);
        }
        return;
      }
    }
  
    const btn = menu.getByRole('button', { name: /eliminar|quitar|remove/i });
    if (await btn.count() > 0) {
      const before = await this.getCartItemCount();
      await btn.first().click();
      const start = Date.now();
      while (Date.now() - start < 5000) {
        const now = await this.getCartItemCount();
        if (now < before) break;
        await this.page.waitForTimeout(200);
      }
      return;
    }
    throw new Error('No se encontró control para eliminar items dentro del mini-cart');
  }


  async isEmpty(): Promise<boolean> {
    const cnt = await this.getCartItemCount();
    if (cnt === 0) {
      const menuText = (await this.page.locator(this.cartMenuSelector).first().innerText().catch(() => '')).toLowerCase();
      const texts = ['carrito vacío', 'no hay productos', 'empty', 'no items'];
      return texts.some(t => menuText.includes(t));
    }
    return false;
  }
}

