import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/home.page';
import { CategoriaPage } from '../../pages/categoria.page';
import { ProductoPage } from '../../pages/producto.page';
import { CarritoPage } from '../../pages/carrito.page';

test('E2E - Amor: seleccionar dos productos y validar carrito', async ({ page }) => {
  const home = new HomePage(page);
  const categoria = new CategoriaPage(page);
  const producto = new ProductoPage(page);
  const carrito = new CarritoPage(page);

  await home.goto();
  await home.openCategory('Amor');

  const collection = await categoria.getProductCollection();
  const total = await collection.count();
  console.log("cantidad de productos ", total);
  expect(total).toBeGreaterThanOrEqual(2);

  const selected: {name:string, price:string}[] = [];

  for (let i = 0; i < 2; i++) {
    const card = collection.nth(i);
    const name = await categoria.getProductNameFromCard(card);
    const price = await categoria.getProductPriceFromCard(card);
    console.log("nombre" + name + "precio" + price);

    const addCartResponsePromise = page.waitForResponse(resp => {
      try {
        return /cart|add_to_cart|addtocart|addCart|wp-json/i.test(resp.url()) && resp.request().method() === 'POST';
      } catch (e) { return false; }
    }, { timeout: 8000 }).catch(()=>null);

    await categoria.openProductCard(card);
    const prodName = await producto.getName().catch(()=>name);
    const prodPrice = await producto.getPrice().catch(()=>price);
    await producto.addToCart();

    const response = await addCartResponsePromise;
    if (response) {
      expect(response.status()).toBeGreaterThanOrEqual(200);
      expect(response.status()).toBeLessThan(300);
      try {
        const body = await response.json();
        expect(JSON.stringify(body)).toContain('id');
      } catch (e) { }
    }

    selected.push({ name: prodName, price: prodPrice });

    await home.goto();
    await home.openCategory('Amor');
  }


await carrito.goto();
const items = await carrito.getCartItems();
console.log("Items en carrito: ", items);

expect(items.length).toBe(2);

for (let i = 0; i < 2; i++) {
  expect(items[i].name.toLowerCase())
    .toContain(selected[i].name.toLowerCase().slice(0, Math.min(15, selected[i].name.length)));

  const itemPriceNum = parseFloat(items[i].price.replace(/[^0-9,\.]/g,'').replace(/\./g,'').replace(',','.')) || 0;
  const expectedPriceNum = parseFloat(selected[i].price.replace(/[^0-9,\.]/g,'').replace(/\./g,'').replace(',','.')) || 0;
  expect(itemPriceNum).toBeCloseTo(expectedPriceNum, 2);
}

  
const subtotalReal = await carrito.getSubtotalNumber();
const subtotalEsperado = selected.reduce((s, p) => {
  const num = parseFloat(
    p.price.replace(/[^0-9,\.]/g, '')
           .replace(/\./g, '')
           .replace(',', '.')
  ) || 0;
  return s + num;
}, 0);

console.log(`Subtotal esperado: ${subtotalEsperado}, Subtotal real: ${subtotalReal}`);
expect(subtotalReal).toBeCloseTo(subtotalEsperado, 2);
});
