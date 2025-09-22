Proyecto de Automatización con Playwright y TypeScript

Este proyecto fue desarrollado como parte de un reto técnico de automatización.
El objetivo es automatizar pruebas E2E (End-to-End) sobre la página Floristería Mundo Flor
 utilizando Playwright con TypeScript, aplicando buenas prácticas como el Patrón Page Object Model (POM).

Tecnologías utilizadas

Lenguaje: TypeScript

Framework de automatización: Playwright

Patrón de diseño: Page Object Model (POM)

Gestor de dependencias: npm

Ejecución de pruebas: Playwright Test Runner

Repositorio: GitHub
 Estructura del proyecto
├── fixtures/          # Datos de prueba
├── pages/             # Clases que representan las páginas (POM)
│   ├── home.page.ts
│   ├── categoria.page.ts
│   ├── producto.page.ts
│   └── carrito.page.ts
├── tests/e2e/         # Escenarios de prueba E2E
│   ├── amor.spec.ts
│   └── cumple.spec.ts
├── playwright.config.ts
├── package.json
├── tsconfig.json
└── README.md

 Escenarios implementados
 Flujo de Amor

Seleccionar dos productos de la categoría Amor

Agregarlos al carrito

Validar que los productos, precios y subtotal sean correctos

Validar la respuesta del servicio de red que confirma la adición al carrito

 Flujo de Cumpleaños

Seleccionar un producto de la categoría Cumpleaños

Agregarlo al carrito

Eliminar el producto

Validar que aparezca el mensaje:
"No tiene artículos en su carrito de compras"

Ejecución de las pruebas
1. Instalar dependencias npm install
2. npm init -y
3. npm i -D @playwright/test
4. npx playwright install --with-deps
5. Ejecutar pruebas con navegador visible
npm run test:headed
6. Generar y abrir el reporte HTML
npx playwright show-report

 Reintentos controlados

En algunos escenarios se implementó test.retry(2), únicamente en casos donde la aplicación bajo prueba tiene comportamientos intermitentes.

Esto evita falsos negativos y garantiza mayor estabilidad en los resultados.

En conclusión

El proyecto demuestra la aplicación de Playwright con TypeScript en pruebas E2E reales.

Se aplicó el Page Object Model para mantener el código ordenado y reutilizable.
