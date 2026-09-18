"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  fallbackProduct,
  type Lifestyle,
  type Product,
} from "./data/products";
import { novaCatalogApiUrl, novaService, novaStoreUrl, novaSupport } from "./data/site";
import { trackNovaEvent } from "./lib/analytics";

const lifestyles: Array<{
  key: Lifestyle;
  label: string;
  subtitle: string;
  imageKey: Lifestyle;
}> = [
  { key: "OFFICE", label: "OFFICE", subtitle: "Sharp from nine to five.", imageKey: "OFFICE" },
  { key: "NIGHT", label: "NIGHT", subtitle: "Made for the after hours.", imageKey: "NIGHT" },
  { key: "DATE", label: "DATE", subtitle: "A little more presence.", imageKey: "DATE" },
  { key: "TRAVEL", label: "TRAVEL", subtitle: "Built to move with you.", imageKey: "TRAVEL" },
];

function ProductImage({
  src,
  alt,
  fallback,
  className = "",
}: {
  src?: string;
  alt: string;
  fallback: Product;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`watch-fallback ${className}`} aria-label={alt}>
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
      className={`product-image ${className}`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

export default function Home() {
  const reducedMotion = useReducedMotion();
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [activeId, setActiveId] = useState("");
  const [language, setLanguage] = useState<"EN" | "AR">("EN");
  const [cart, setCart] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [catalogError, setCatalogError] = useState(false);
  const [installmentsEnabled, setInstallmentsEnabled] = useState(false);

  const t = (en: string, ar: string) => (language === "AR" ? ar : en);

  useEffect(() => {
    document.documentElement.lang = language === "AR" ? "ar" : "en";
    document.documentElement.dir = language === "AR" ? "rtl" : "ltr";
  }, [language]);

  useEffect(() => {
    fetch(novaCatalogApiUrl, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Catalog unavailable");
        return response.json();
      })
      .then((payload: { products?: Product[] }) => {
        const next = Array.isArray(payload.products) && payload.products.length
          ? payload.products
          : [];
        setCatalog(next);
        setActiveId(next[0]?.id ?? "");
        setCatalogError(false);
      })
      .catch(() => {
        setCatalog([]);
        setActiveId("");
        setCatalogError(true);
      });

    trackNovaEvent("view_content", { page: "home" });
  }, []);

  const products = catalog.length ? catalog : [fallbackProduct];
  const active = products.find((product) => product.id === activeId) ?? products[0];
  const featured = products.slice(0, 3);
  const heroImage = products[0]?.media?.hero ?? products[0]?.media?.detail;

  const cartCount = cart.length;
  const cartTotal = useMemo(
    () =>
      cart.reduce((total, product) => {
        const raw = product.price.replace(/[^0-9.]/g, "");
        return total + (Number(raw) || 0);
      }, 0),
    [cart],
  );

  function addToBag(product: Product) {
    setCart((items) => [...items, product]);
    setCartOpen(true);
    trackNovaEvent("select_product", { product: product.name, action: "add_to_bag" });
  }

  function buyNow(product: Product) {
    trackNovaEvent("click_buy", { product: product.name, price: product.price });
    window.location.assign(product.checkoutUrl || novaStoreUrl);
  }

  function toggleLanguage() {
    setLanguage((value) => (value === "EN" ? "AR" : "EN"));
  }

  return (
    <main className="nova-site">
      <div className="utility-bar">
        <div className="utility-items">
          <span>UAE DELIVERY 24–48H</span>
          <span>2 YEARS WARRANTY</span>
          <span>{installmentsEnabled ? "TABBY / TAMARA AVAILABLE" : "COD · APPLE PAY · CARDS"}</span>
        </div>
        <div className="utility-right">
          <button onClick={toggleLanguage} type="button">{language === "EN" ? "AR" : "EN"}</button>
          <button type="button" onClick={() => setCartOpen(true)}>BAG ({cartCount})</button>
        </div>
      </div>

      <nav className="nova-nav">
        <button className="nav-menu" type="button" onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}>
          MENU
        </button>
        <div className="nova-logo">NOVA<span>®</span></div>
        <div className="nav-links">
          <a href="#collection">{t("COLLECTION", "المجموعة")}</a>
          <a href="#story">{t("THE IDEA", "الفكرة")}</a>
          <a href="#support">{t("SUPPORT", "الدعم")}</a>
        </div>
        <button className="nav-bag" type="button" onClick={() => setCartOpen(true)}>
          BAG <span>{cartCount}</span>
        </button>
      </nav>

      <section className="hero-new">
        <div className="hero-overlay" />
        <div className="hero-copy-new">
          <p className="hero-kicker">PREMIUM MEN&apos;S WATCHES · UAE</p>
          <h1>TIME.<br /><em>YOUR WAY.</em></h1>
          <p>{t("Precision. Style. Freedom.", "دقة. أناقة. حرية.")}</p>
          <button className="primary-cta" type="button" onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}>
            {t("SHOP NOVA →", "تسوق نوفا ←")}
          </button>
        </div>

        <motion.div
          className="hero-product"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 26, scale: reducedMotion ? 1 : 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="hero-glow" />
          <ProductImage src={heroImage} alt={products[0]?.name || "NOVA watch"} fallback={products[0]} />
          <div className="hero-index">01 / 03</div>
        </motion.div>

        <div className="hero-trust">
          <div><strong>24–48H</strong><span>UAE DELIVERY</span></div>
          <div><strong>2 YEARS</strong><span>WARRANTY</span></div>
          <div><strong>COD</strong><span>PAY AT YOUR DOOR</span></div>
        </div>
      </section>

      <section id="collection" className="new-collection">
        <div className="section-intro">
          <div>
            <p className="section-kicker">FEATURED COLLECTION</p>
            <h2>OUR TOP <em>PICKS.</em></h2>
          </div>
          <p>{t("Real NOVA products, live from the connected catalog.", "منتجات نوفا الحقيقية، مباشرة من الكتالوج المتصل.")}</p>
        </div>

        {catalogError ? (
          <div className="catalog-notice">Live catalog temporarily unavailable. Showing the NOVA fallback experience.</div>
        ) : null}

        <div className="product-grid">
          {featured.map((product, index) => {
            const wrist = product.media?.wrist;
            const isActive = product.id === active.id;
            return (
              <motion.article
                key={product.id}
                className={`product-card ${isActive ? "active" : ""}`}
                whileHover={reducedMotion ? undefined : { y: -8 }}
                transition={{ duration: 0.28 }}
                onMouseEnter={() => setActiveId(product.id)}
              >
                <div className="product-art">
                  <div className="product-main-view">
                    <ProductImage
                      src={product.media?.hero ?? product.media?.detail}
                      alt={product.name}
                      fallback={product}
                    />
                  </div>
                  {wrist ? (
                    <div className="product-wrist-view">
                      <ProductImage src={wrist} alt={`${product.name} on wrist`} fallback={product} />
                    </div>
                  ) : null}
                  <div className="product-number">0{index + 1}</div>
                </div>

                <div className="product-info">
                  <p className="product-type">{product.type}</p>
                  <h3>{product.name}</h3>
                  <p className="product-detail">{product.detail || "Designed for the way you move."}</p>
                  <strong className="product-price">{product.price}</strong>
                  <div className="product-actions">
                    <button type="button" className="bag-btn" onClick={() => addToBag(product)}>
                      {t("ADD TO BAG", "أضف للحقيبة")}
                    </button>
                    <button type="button" className="buy-btn" onClick={() => buyNow(product)}>
                      {t("BUY NOW", "اشترِ الآن")}
                    </button>
                  </div>
                  <small>{product.available === false ? t("Currently unavailable.", "غير متاح حاليًا.") : t("Live catalog product.", "منتج من الكتالوج المباشر.")}</small>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section id="story" className="statement-section">
        <div className="statement-image">
          <ProductImage src={active.media?.wrist ?? active.media?.hero} alt={active.name} fallback={active} />
        </div>
        <div className="statement-copy">
          <p className="section-kicker">MORE THAN A WATCH</p>
          <h2>A<br /><em>STATEMENT.</em></h2>
          <p>{t("From office hours to weekend escapes, NOVA is designed to move with your world.", "من ساعات العمل إلى عطلات نهاية الأسبوع، صُممت نوفا لتتحرك مع عالمك.")}</p>
          <button type="button" className="outline-cta" onClick={() => document.getElementById("lifestyle")?.scrollIntoView({ behavior: "smooth" })}>
            {t("EXPLORE THE COLLECTION →", "استكشف المجموعة ←")}
          </button>
        </div>

        <div className="lifestyle-strip" id="lifestyle">
          {lifestyles.slice(0, 3).map((item) => (
            <button
              type="button"
              key={item.key}
              className="lifestyle-card"
              onClick={() => {
                const image = active.media?.lifestyle?.[item.imageKey];
                if (image) {
                  setActiveId(active.id);
                }
                trackNovaEvent("select_lifestyle", { product: active.name, lifestyle: item.key });
              }}
            >
              <ProductImage
                src={active.media?.lifestyle?.[item.imageKey] ?? active.media?.hero}
                alt={item.label}
                fallback={active}
              />
              <span>{item.label}</span>
              <small>{item.subtitle}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="confidence-section">
        <div className="confidence-heading">
          <p className="section-kicker">SHOP WITH CONFIDENCE</p>
          <h2>Everything you need.<br /><em>Nothing you don&apos;t.</em></h2>
        </div>
        <div className="confidence-grid">
          <div><strong>24–48H</strong><span>UAE DELIVERY</span></div>
          <div><strong>2 YEARS</strong><span>WARRANTY</span></div>
          <div><strong>14 DAYS</strong><span>EASY RETURNS</span></div>
          <div><strong>APPLE PAY</strong><span>SECURE CHECKOUT</span></div>
          <div><strong>CARDS</strong><span>VISA · MASTERCARD</span></div>
        </div>
      </section>

      <section id="support" className="support-new">
        <div>
          <p className="section-kicker">UAE SUPPORT</p>
          <h2>Ready when<br /><em>you are.</em></h2>
        </div>
        <div className="support-links">
          <a href={`mailto:${novaSupport.email}`}>{novaSupport.email}</a>
          <span>{novaSupport.address}</span>
          <button type="button" onClick={() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" })}>
            {t("BACK TO COLLECTION →", "العودة إلى المجموعة ←")}
          </button>
        </div>
      </section>

      <footer className="nova-footer">
        <div className="footer-logo">NOVA</div>
        <p>TIME. YOUR WAY.</p>
        <div className="footer-links">
          <a href="#collection">Collection</a>
          <a href="#story">About</a>
          <a href="#support">Contact</a>
        </div>
      </footer>

      <AnimatePresence>
        {cartOpen ? (
          <motion.div
            className="bag-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          >
            <motion.aside
              className="bag-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.28 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="bag-header">
                <div>
                  <p className="section-kicker">YOUR BAG</p>
                  <h3>{cartCount} ITEM{cartCount === 1 ? "" : "S"}</h3>
                </div>
                <button type="button" onClick={() => setCartOpen(false)}>×</button>
              </div>

              <div className="bag-items">
                {cart.length ? (
                  cart.map((product, index) => (
                    <div className="bag-item" key={`${product.id}-${index}`}>
                      <ProductImage src={product.media?.hero} alt={product.name} fallback={product} className="bag-thumb" />
                      <div>
                        <strong>{product.name}</strong>
                        <span>{product.price}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Your bag is empty. Add a NOVA watch to continue.</p>
                )}
              </div>

              <div className="bag-footer">
                <div>
                  <span>ESTIMATED TOTAL</span>
                  <strong>{cartTotal.toLocaleString()} AED</strong>
                </div>
                <button type="button" className="primary-cta wide" onClick={() => window.location.assign(novaStoreUrl)} disabled={!cart.length}>
                  CONTINUE TO NOVA STORE
                </button>
                <small>Checkout opens the official NOVA store to complete payment securely.</small>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
