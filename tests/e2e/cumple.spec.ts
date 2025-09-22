import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { CategoriaPage } from '../../pages/categoria.page';
import { ProductoPage } from '../../pages/producto.page';
import { CarritoPage } from '../../pages/carrito.page';
import { categories } from '../../fixtures/test-data';


/**
 * Nota sobre retries:
 * - Este test puede fallar intermitentemente por latencia en el backend o actualizaciones de DOM asíncronas.
 * - Aplicamos { retries: 2 } SOLO a este test para reducir falsos negativos por problemas transitorios.
 * - No ponemos retries globales para no enmascarar fallos reales en otras pruebas.
 * - Playwright está configurado en playwright.config.ts con trace: 'on-first-retry' para capturar trace en el primer reintento.
 */

test.describe('Cumpleaños flow', () => {
  test('E2E - Cumpleaños: agregar y luego eliminar del carrito', 
    { retries: 2 },
    async ({ page }, testInfo) => {
      const home = new HomePage(page);
      const categoria = new CategoriaPage(page);
      const producto = new ProductoPage(page);
      const carrito = new CarritoPage(page);

      await home.goto();
      await home.openCategory('Cumpleaños');

      const collection = await categoria.getProductCollection();
      expect(await collection.count()).toBeGreaterThanOrEqual(1);

      await categoria.openProductCard(collection.nth(0));
      const prodName = await producto.getName();
      await producto.addToCart();

      const counter = page.locator('.cart-count, .count, .shopping-cart-count');
      if (await counter.count() > 0) {
        await expect(counter.first()).not.toHaveText('0');
      } else {
        await page.goto('/');
        const items = await carrito.getCartItems();
        expect(items.length).toBeGreaterThanOrEqual(1);
      }

      const before = await page.screenshot();
      testInfo.attach('carrito-before-eliminar.png', { body: before, contentType: 'image/png' });

      await page.goto('/');
      await carrito.removeItemAt(0);

      const after = await page.screenshot();
      testInfo.attach('carrito-despues-eliminar.png', { body: after, contentType: 'image/png' });

      const empty = await carrito.isEmpty();
      if (!empty) {
        const subtotal = await carrito.getSubtotalNumber();
        expect(subtotal).toBeCloseTo(0, 2);
      } else {
        expect(empty).toBeTruthy();
      }

      
  const emptyMessage = await page.locator('#cart ul.cart_empty li').first().innerText();
  console.log("Mensaje mostrado al eliminar producto:", emptyMessage.trim());
  expect(emptyMessage.trim()).toBe("No tiene artículos en su carrito de compras");
    }
  );
});
