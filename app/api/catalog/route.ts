import { NextResponse } from "next/server";

export const revalidate = 60;

const EASY_ORDERS_API = "https://api.easy-orders.net/api/v1/external-apps/products";
const EASY_ORDERS_KEY = process.env.NOVA_EASY_ORDERS_API_KEY || process.env.EASY_ORDERS_API_KEY;
const APPROVED_PRODUCT_IDS = new Set(
  (process.env.NOVA_EASY_ORDERS_PRODUCT_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
);

type EasyOrdersProduct = {
  id?: string | number;
  name?: string;
  price?: number | string;
  sale_price?: number | string;
  description?: string;
  slug?: string;
  thumb?: string;
  images?: string[];
  quantity?: number;
  track_stock?: boolean;
  hidden?: boolean;
  disable_orders_for_no_stock?: boolean;
  custom_currency?: string;
  position?: number;
};

function cleanText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toneFromProduct(product: EasyOrdersProduct) {
  const text = `${product.name || ""} ${product.description || ""}`.toLowerCase();
  if (/black|noir|night|أسود|اسود|ليلي/.test(text)) return "black" as const;
  if (/bronze|gold|golden|rose|نحاسي|ذهبي|برونز/.test(text)) return "bronze" as const;
  if (/steel|silver|grey|gray|فضي|رصاصي|ستيل|رمادي/.test(text)) return "steel" as const;
  return "ivory" as const;
}

function normalizeImage(value?: string) {
  if (!value || typeof value !== "string") return undefined;
  return value.startsWith("http") ? value : undefined;
}

function money(value: unknown, currency: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `${currency} ${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

function normalizeProduct(product: EasyOrdersProduct) {
  const images = Array.isArray(product.images)
    ? product.images.map(normalizeImage).filter(Boolean) as string[]
    : [];
  const hero = normalizeImage(product.thumb) || images[0];
  const detail = images[1] || images[0];

  const currency = product.custom_currency || "AED";
  const price = product.sale_price && Number(product.sale_price) > 0
    ? product.sale_price
    : product.price;

  const quantity = typeof product.quantity === "number" ? product.quantity : undefined;
  const available = product.track_stock
    ? quantity === undefined || quantity > 0
    : !product.disable_orders_for_no_stock;

  return {
    id: String(product.id ?? product.slug ?? product.name ?? Math.random()),
    name: product.name?.trim() || "NOVA",
    type: "NOVA",
    price: money(price, currency),
    tone: toneFromProduct(product),
    detail: cleanText(product.description),
    checkoutUrl: "",
    slug: product.slug,
    currency,
    quantity,
    available,
    media: hero || detail
      ? {
          hero,
          detail,
          dial: images[2],
          wrist: images[3],
        }
      : undefined,
  };
}

export async function GET() {
  if (!EASY_ORDERS_KEY) {
    return NextResponse.json(
      { ok: false, error: "NOVA_EASY_ORDERS_API_KEY is not configured.", products: [] },
      { status: 503 }
    );
  }

  const products: EasyOrdersProduct[] = [];
  const limit = 100;

  for (let page = 1; page <= 10; page += 1) {
    const url = new URL(EASY_ORDERS_API);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));
    url.searchParams.set(
      "fields",
      "id,name,price,sale_price,description,slug,thumb,images,quantity,track_stock,hidden,disable_orders_for_no_stock,custom_currency,position"
    );
    url.searchParams.set("join", "Variations.Props,Variants.VariationProps");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Api-Key": EASY_ORDERS_KEY,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const body = await response.text();
      return NextResponse.json(
        { ok: false, error: "Easy Orders catalog request failed.", status: response.status, details: body.slice(0, 500), products: [] },
        { status: 502 }
      );
    }

    const payload = await response.json();
    const batch = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.products)
          ? payload.products
          : [];

    products.push(...batch);

    if (batch.length < limit) break;
  }

  const approvedProducts = products.filter((product) => {
    if (product.hidden) return false;

    if (APPROVED_PRODUCT_IDS.size > 0) {
      return APPROVED_PRODUCT_IDS.has(String(product.id));
    }

    const identity = `${product.name || ""} ${product.slug || ""}`.toLowerCase();
    return identity.includes("nova");
  });

  const normalized = approvedProducts
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map(normalizeProduct);

  return NextResponse.json({
    ok: true,
    source: "easy-orders",
    syncedAt: new Date().toISOString(),
    count: normalized.length,
    sourceCount: products.length,
    approvalMode: APPROVED_PRODUCT_IDS.size > 0 ? "ids" : "nova-name-or-slug",
    warning: normalized.length === 0
      ? "No approved NOVA products were found in the Easy Orders catalog."
      : undefined,
    products: normalized,
  }, {
    headers: {
      "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
    },
  });
}
