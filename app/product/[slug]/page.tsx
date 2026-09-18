"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { fallbackProduct, type Product } from "../../data/products";
import { novaCatalogApiUrl, novaStoreUrl } from "../../data/site";
import { trackNovaEvent } from "../../lib/analytics";

type Props = {
  params: Promise<{ slug: string }>;
};

function ProductImage({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={"product-detail-fallback " + className}>
        <div className="watch-fallback-face">
          <span className="watch-brand">NOVA</span>
          <span className="watch-hand hour" />
          <span className="watch-hand minute" />
          <span className="watch-dot" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={"product-detail-image " + className}
      onError={() => setFailed(true)}
    />
  );
}

export default function ProductPage({ params }: Props) {
  const { slug } = use(params);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | undefined>();

  useEffect(() => {
    fetch(novaCatalogApiUrl, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Catalog unavailable");
        return response.json();
      })
      .then((payload: { products?: Product[] }) => {
        setProducts(Array.isArray(payload.products) ? payload.products : []);
        setCatalogError(false);
      })
      .catch(() => {
        setProducts([]);
        setCatalogError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const product = useMemo(() => {
    const decoded = decodeURIComponent(slug);
    return products.find(
      (item) => item.slug === decoded || item.id === decoded,
    ) ?? (products.length === 0 && catalogError ? fallbackProduct : undefined);
  }, [catalogError, products, slug]);

  useEffect(() => {
    if (!product) return;
    const first = product.media?.hero ?? product.media?.detail;
    setSelectedImage(first);
    trackNovaEvent("view_content", { page: "product", product: product.name });
  }, [product]);

  function checkout() {
    if (!product) return;
    trackNovaEvent("click_buy", { product: product.name, price: product.price });
    window.location.assign(product.checkoutUrl || novaStoreUrl);
  }

  if (loading) {
    return (
      <main className="product-page-shell">
        <header className="product-page-header">
          <Link href="/" className="product-back">← NOVA</Link>
          <span>PRODUCT</span>
          <span />
        </header>
        <section className="product-loading">Loading product…</section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-page-shell">
        <header className="product-page-header">
          <Link href="/" className="product-back">← NOVA</Link>
          <span>PRODUCT</span>
          <span />
        </header>
        <section className="product-not-found">
          <p className="section-kicker">NOVA COLLECTION</p>
          <h1>PRODUCT NOT FOUND.</h1>
          <p>The catalog item is no longer available from the connected store.</p>
          <Link href="/" className="primary-cta product-back-cta">BACK TO COLLECTION →</Link>
        </section>
      </main>
    );
  }

  const gallery = [
    product.media?.hero,
    product.media?.detail,
    product.media?.dial,
    product.media?.wrist,
  ].filter(Boolean) as string[];

  return (
    <main className="product-page-shell">
      <header className="product-page-header">
        <Link href="/" className="product-back">← NOVA</Link>
        <span>PRODUCT DETAIL</span>
        <Link href="/#collection" className="product-back">COLLECTION →</Link>
      </header>

      <section className="product-detail-layout">
        <div className="product-gallery">
          <div className="product-detail-main">
            <ProductImage src={selectedImage} alt={product.name} />
          </div>
          {gallery.length > 1 ? (
            <div className="product-thumbs">
              {gallery.map((image, index) => (
                <button
                  type="button"
                  key={image}
                  className={selectedImage === image ? "product-thumb active" : "product-thumb"}
                  onClick={() => setSelectedImage(image)}
                  aria-label={"Show product image " + (index + 1)}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="product-detail-copy">
          <p className="section-kicker">NOVA / {product.type}</p>
          <h1>{product.name}</h1>
          <div className="product-detail-price">{product.price}</div>
          <p className="product-detail-description">
            {product.detail || "Designed for the way you move. Built to make an impression."}
          </p>

          <div className="product-detail-meta">
            <div><span>DELIVERY</span><strong>24–48H UAE</strong></div>
            <div><span>WARRANTY</span><strong>2 YEARS</strong></div>
            <div><span>PAYMENT</span><strong>COD · CARDS · APPLE PAY</strong></div>
            <div><span>RETURNS</span><strong>14 DAYS</strong></div>
          </div>

          <button
            type="button"
            className="primary-cta wide product-checkout"
            onClick={checkout}
            disabled={product.available === false}
          >
            {product.available === false ? "CURRENTLY UNAVAILABLE" : "BUY THIS WATCH →"}
          </button>

          <Link href="/" className="product-secondary-cta">
            ← BACK TO NOVA COLLECTION
          </Link>

          <p className="product-checkout-note">
            Checkout is completed through the official NOVA store after you confirm this product.
          </p>
        </div>
      </section>

      <section className="product-bottom-note">
        <p className="section-kicker">NOVA SERVICE</p>
        <h2>Built around the<br /><em>way you shop.</em></h2>
        <p>Clear product information first. Secure checkout second. No forced redirect from the collection page.</p>
      </section>
    </main>
  );
}
