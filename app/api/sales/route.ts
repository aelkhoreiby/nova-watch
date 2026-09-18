import { NextResponse } from "next/server";

export const revalidate = 60;

const DEFAULT_ORDERS_URL = "https://api.easy-orders.net/v1/orders";

type RawOrderItem = {
  product_id?: string | number;
  productId?: string | number;
  product?: { id?: string | number; name?: string };
  name?: string;
  product_name?: string;
  title?: string;
  price?: number | string;
  quantity?: number | string;
};

type RawOrder = {
  id?: string | number;
  created_at?: string;
  createdAt?: string;
  date?: string;
  status?: string;
  total?: number | string;
  total_cost?: number | string;
  totalCost?: number | string;
  currency?: string;
  cart_items?: RawOrderItem[];
  items?: RawOrderItem[];
  line_items?: RawOrderItem[];
  lineItems?: RawOrderItem[];
};

type SalesProduct = {
  id: string;
  name: string;
  units: number;
  revenue: number;
};

function number(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeItem(item: RawOrderItem): SalesProduct {
  const productId =
    item.product_id ??
    item.productId ??
    item.product?.id ??
    item.name ??
    item.product_name ??
    item.title ??
    "unknown";

  const name =
    item.product?.name ??
    item.product_name ??
    item.name ??
    item.title ??
    "Unknown product";

  const quantity = Math.max(0, number(item.quantity || 0));
  const price = number(item.price || 0);

  return {
    id: String(productId),
    name: String(name),
    units: quantity,
    revenue: quantity * price,
  };
}

function itemsFromOrder(order: RawOrder) {
  const items = order.cart_items ?? order.items ?? order.line_items ?? order.lineItems ?? [];
  return Array.isArray(items) ? items : [];
}

function orderTotal(order: RawOrder) {
  return number(order.total_cost ?? order.totalCost ?? order.total ?? 0);
}

function orderDate(order: RawOrder) {
  return order.created_at ?? order.createdAt ?? order.date ?? null;
}

async function fetchOrders() {
  const apiKey = process.env.NOVA_EASY_ORDERS_API_KEY || process.env.EASY_ORDERS_API_KEY;
  if (!apiKey) {
    throw new Error("NOVA_EASY_ORDERS_API_KEY is not configured.");
  }

  const ordersUrl = process.env.NOVA_EASY_ORDERS_ORDERS_URL || DEFAULT_ORDERS_URL;
  const authMode = process.env.NOVA_EASY_ORDERS_AUTH_MODE || "bearer";
  const orders: RawOrder[] = [];
  let cursor = "";

  for (let page = 1; page <= 20; page += 1) {
    const url = new URL(ordersUrl);
    url.searchParams.set("limit", "100");
    url.searchParams.set("page", String(page));
    if (cursor) url.searchParams.set("cursor", cursor);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authMode === "api-key") {
      headers["Api-Key"] = apiKey;
    } else {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    const response = await fetch(url, {
      headers,
      method: "GET",
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Orders API returned ${response.status}: ${details.slice(0, 240)}`);
    }

    const payload = await response.json();
    const batch = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.orders)
          ? payload.orders
          : [];

    orders.push(...batch);

    const nextCursor =
      payload.nextCursor ??
      payload.next_cursor ??
      payload.pagination?.nextCursor ??
      payload.pagination?.next_cursor ??
      "";

    if (typeof nextCursor === "string" && nextCursor && nextCursor !== cursor) {
      cursor = nextCursor;
      continue;
    }

    if (batch.length < 100) break;
    if (!nextCursor) break;
  }

  return orders;
}

function buildSales(orders: RawOrder[]) {
  const byProduct = new Map<string, SalesProduct>();
  const byStatus = new Map<string, number>();
  const byDay = new Map<string, number>();
  let grossSales = 0;
  let units = 0;
  let currency = "AED";

  for (const order of orders) {
    const total = orderTotal(order);
    const status = String(order.status || "unknown").toLowerCase();
    const date = orderDate(order);

    grossSales += total;
    byStatus.set(status, (byStatus.get(status) || 0) + 1);

    if (order.currency) currency = String(order.currency).toUpperCase();

    if (date) {
      const day = String(date).slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
        byDay.set(day, (byDay.get(day) || 0) + total);
      }
    }

    for (const rawItem of itemsFromOrder(order)) {
      const item = normalizeItem(rawItem);
      units += item.units;

      const existing = byProduct.get(item.id);
      if (existing) {
        existing.units += item.units;
        existing.revenue += item.revenue;
      } else {
        byProduct.set(item.id, { ...item });
      }
    }
  }

  return {
    ok: true,
    source: "easy-orders",
    syncedAt: new Date().toISOString(),
    orderCount: orders.length,
    grossSales,
    currency,
    units,
    averageOrderValue: orders.length ? grossSales / orders.length : 0,
    byStatus: Array.from(byStatus.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count),
    byProduct: Array.from(byProduct.values())
      .sort((a, b) => b.revenue - a.revenue),
    daily: Array.from(byDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({ date, revenue })),
  };
}

export async function GET(request: Request) {
  const dashboardToken = process.env.NOVA_SALES_DASHBOARD_TOKEN;
  const suppliedToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!dashboardToken || suppliedToken !== dashboardToken) {
    return NextResponse.json(
      { ok: false, error: "Sales dashboard is not authorized." },
      { status: 401 }
    );
  }

  try {
    const orders = await fetchOrders();
    return NextResponse.json(buildSales(orders), {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Sales sync failed.",
      },
      { status: 502 }
    );
  }
}
