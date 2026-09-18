"use client";

import { useMemo, useState } from "react";

type SalesData = {
  ok: true;
  source: string;
  syncedAt: string;
  orderCount: number;
  grossSales: number;
  currency: string;
  units: number;
  averageOrderValue: number;
  byStatus: { status: string; count: number }[];
  byProduct: { id: string; name: string; units: number; revenue: number }[];
  daily: { date: string; revenue: number }[];
};

export default function SalesPage() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<SalesData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const topProducts = useMemo(() => (data?.byProduct || []).slice(0, 10), [data]);

  async function loadSales() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Could not load sales data.");
      }

      setData(payload);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Could not load sales data.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="sales-page">
      <header className="sales-header">
        <div>
          <div className="sales-brand">NOVA®</div>
          <p>SALES INTELLIGENCE</p>
        </div>
        <a href="/">BACK TO STORE</a>
      </header>

      <section className="sales-intro">
        <p className="eyebrow">PRIVATE DASHBOARD</p>
        <h1>Know what<br /><em>is selling.</em></h1>
        <p>Live order aggregation from the connected commerce source. No customer details are shown here.</p>

        <div className="sales-auth">
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Dashboard token"
            autoComplete="off"
          />
          <button type="button" onClick={loadSales} disabled={loading || !token}>
            {loading ? "SYNCING…" : "SYNC SALES"}
          </button>
        </div>

        {error ? <div className="sales-error">{error}</div> : null}
      </section>

      {data ? (
        <>
          <section className="sales-stats">
            <article><span>Revenue</span><strong>{data.grossSales.toLocaleString()} {data.currency}</strong></article>
            <article><span>Orders</span><strong>{data.orderCount.toLocaleString()}</strong></article>
            <article><span>Units</span><strong>{data.units.toLocaleString()}</strong></article>
            <article><span>Avg. order</span><strong>{data.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} {data.currency}</strong></article>
          </section>

          <section className="sales-panel">
            <div className="sales-panel-head">
              <div>
                <p className="eyebrow">PRODUCT PERFORMANCE</p>
                <h2>Top products</h2>
              </div>
              <small>Synced {new Date(data.syncedAt).toLocaleString()}</small>
            </div>

            {topProducts.length ? (
              <div className="sales-table">
                <div className="sales-row sales-row-head"><span>#</span><span>PRODUCT</span><span>UNITS</span><span>REVENUE</span></div>
                {topProducts.map((product, index) => (
                  <div className="sales-row" key={product.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{product.name}</span>
                    <span>{product.units.toLocaleString()}</span>
                    <span>{product.revenue.toLocaleString()} {data.currency}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sales-empty">No line-item product data was returned by the orders source.</div>
            )}
          </section>

          <section className="sales-bottom">
            <div className="sales-panel">
              <p className="eyebrow">ORDER STATUS</p>
              <h2>Status mix</h2>
              {data.byStatus.map((item) => (
                <div className="status-line" key={item.status}>
                  <span>{item.status}</span><strong>{item.count}</strong>
                </div>
              ))}
            </div>

            <div className="sales-panel">
              <p className="eyebrow">DAILY REVENUE</p>
              <h2>Recent movement</h2>
              <div className="daily-list">
                {data.daily.slice(-14).map((item) => (
                  <div className="daily-line" key={item.date}>
                    <span>{item.date}</span><strong>{item.revenue.toLocaleString()} {data.currency}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
