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



## Production layer completed

The storefront now includes:
- Light editorial NOVA UAE visual system with motion and reduced-motion handling
- Data-driven collection and media architecture
- Easy Orders fallback store routing while product-specific checkout URLs are still unverified
- UAE service/support/FAQ section using the current public store information
- English / Arabic toggle with RTL document direction
- Optional Meta Pixel + event layer via NEXT_PUBLIC_META_PIXEL_ID
- Mobile sticky purchase CTA and conversion event hooks
- No fake cart counter / no simulated cart state

## Final production blockers

These are intentionally left data-driven rather than invented:
1. Add the real NOVA product Master Assets under public/products/<product-id>/.
2. Replace demo product names/prices/descriptions with the verified live catalog.
3. Add verified product-level Easy Orders checkout URLs to app/data/products.ts.
4. Add the Meta Pixel ID in the deployment environment from .env.example.
5. Connect the final NOVA domain and run mobile/browser QA.

The frontend is ready for those real assets and catalog inputs without changing the interaction architecture.
