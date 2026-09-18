# NOVA Watch

Interactive premium watch storefront for NOVA UAE.

## Stack
- Next.js
- React
- Framer Motion
- TypeScript
- CSS

## Commerce architecture
The frontend is the branded NOVA experience. Easy Orders remains the commerce / checkout layer.

Each product has a `checkoutUrl` field. Replace empty demo URLs with verified Easy Orders product/checkout URLs when ready.

## Design direction
Light editorial luxury: warm ivory, soft stone, charcoal and restrained bronze. Motion is intentional and supports product storytelling.

## Run
```bash
npm install
npm run dev
```

## Product Master Assets

The UI now uses a typed product catalog in `app/data/products.ts` and supports real local product media under `public/products/<product-id>/`.

The page automatically falls back to the existing CSS watch until real verified media is added. See `public/products/README.md` for the asset naming convention.



<!-- Build verification checkpoint -->
