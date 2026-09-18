# NOVA Product Master Asset System

The storefront is ready to consume real NOVA product assets without changing the page structure.

## Folder structure

For each verified product, add:

`public/products/<product-id>/`

Recommended files:

- `hero.webp` — transparent or clean product hero
- `detail.webp` — detail / quick-view image
- `dial.webp` — dial close-up
- `wrist.webp` — wrist/lifestyle product shot
- `office.webp`
- `night.webp`
- `date.webp`
- `travel.webp`

## Rules

1. Use the real NOVA product as the visual source of truth.
2. Do not invent movement, materials, water resistance, crystal type, warranty language, or other technical specs.
3. Keep the same product identity across hero, detail, wrist, lifestyle and future ad/video assets.
4. Prefer WebP for web delivery; keep transparent hero renders on transparent backgrounds where possible.
5. After uploading assets, add the paths to `app/data/products.ts`.
6. Replace each empty `checkoutUrl` only with a verified Easy Orders product/checkout URL.

The UI has a safe fallback: until a real image path exists, it keeps the current CSS watch rather than breaking the page.
