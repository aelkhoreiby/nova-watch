"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  featureCopy,
  lifestyles,
  products,
  type Lifestyle,
  type Product,
} from "./data/products";
import { novaService, novaStoreUrl, novaSupport } from "./data/site";
import { trackNovaEvent } from "./lib/analytics";

function Watch({ tone = "ivory", small = false }: { tone?: Product["tone"]; small?: boolean }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={`watch-wrap ${small ? "small" : ""} tone-${tone}`}
      whileHover={shouldReduceMotion ? undefined : { rotateY: -10, rotateX: 5, scale: 1.025 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
    >
      <div className="strap top" />
      <div className="case">
        <div className="bezel">
          <div className="dial">
            <span className="marker m12" />
            <span className="marker m3" />
            <span className="marker m6" />
            <span className="marker m9" />
            <span className="hand hour" />
            <span className="hand minute" />
            <span className="hand second" />
            <span className="brand-mark">NOVA</span>
          </div>
        </div>
      </div>
      <div className="strap bottom" />
    </motion.div>
  );
}

function ProductImage({
  src,
  alt,
  tone,
  small = false,
  eager = false,
}: {
  src?: string;
  alt: string;
  tone: Product["tone"];
  small?: boolean;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <Watch tone={tone} small={small} />;
  }

  return (
    <motion.img
      className={`product-media ${small ? "small" : ""}`}
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.025 }}
      transition={{ duration: 0.35 }}
    />
  );
}

export default function Home() {
  const [style, setStyle] = useState<Product["type"]>("CLASSIC");
  const [feature, setFeature] = useState<keyof typeof featureCopy>("CASE");
  const [life, setLife] = useState<Lifestyle>("OFFICE");
  const [quickView, setQuickView] = useState(false);
  const [mediaKey, setMediaKey] = useState<"hero" | "detail" | "dial" | "wrist">("hero");
  const [language, setLanguage] = useState<"EN" | "AR">("EN");
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    document.documentElement.lang = language === "AR" ? "ar" : "en";
    document.documentElement.dir = language === "AR" ? "rtl" : "ltr";
  }, [language]);

  useEffect(() => {
    trackNovaEvent("view_content", { page: "home" });
  }, []);

  const active = products.find((p) => p.type === style) ?? products[0];
  const activeMedia =
    active.media?.[mediaKey] ??
    active.media?.hero ??
    active.media?.detail;
  const activeLife = active.media?.lifestyle?.[life];
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, 130]);
  const heroRotate = useTransform(scrollYProgress, [0, 0.35], [0, -8]);

  return (
    <main>
      <nav className="nav">
        <div className="logo">NOVA<span>®</span></div>
        <div className="navlinks">
          <a href="#collection">COLLECTION</a>
          <a href="#story">THE IDEA</a>
          <a href="#contact">CONTACT</a>
        </div>
        <div className="nav-actions">
          <a className="nav-shop" href={novaStoreUrl} onClick={() => trackNovaEvent("open_store", { placement: "nav" })}>SHOP</a>
          <button className="language-toggle" type="button" onClick={() => setLanguage(language === "EN" ? "AR" : "EN")} aria-label="Switch language">
            {language === "EN" ? "AR" : "EN"}
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">NOVA WATCHES · UAE</p>
          <h1>TIME.<br /><em>YOUR WAY.</em></h1>
          <p className="lede">
            A modern watch collection built around your rhythm — clean, confident and made to move with you.
          </p>
          <div className="hero-actions">
            <a className="btn dark" href="#collection">EXPLORE COLLECTION</a>
            <a className="text-link" href="#story">DISCOVER NOVA ↓</a>
            <a className="text-link" href={novaStoreUrl} onClick={() => trackNovaEvent("open_store", { placement: "hero" })}>ORDER NOW ↗</a>
          </div>
        </div>

        <motion.div
          className="hero-watch"
          style={{
            y: shouldReduceMotion ? 0 : heroY,
            rotateZ: shouldReduceMotion ? 0 : heroRotate,
          }}
        >
          <div className="orb" />
          <ProductImage
            src={products[0].media?.hero}
            alt={products[0].name}
            tone={products[0].tone}
            eager
          />
          <div className="floating-label l1">01 / SIGNATURE FORM</div>
          <div className="floating-label l2">MADE FOR THE MOMENT</div>
        </motion.div>
      </section>

      <section className="service-strip" aria-label="NOVA UAE service information">
        <div><strong>{novaService.delivery}</strong><span>UAE DELIVERY</span></div>
        <div><strong>{novaService.inspection}</strong><span>INSPECTION AVAILABLE</span></div>
        <div><strong>{novaService.warranty}</strong><span>WARRANTY</span></div>
        <div><strong>{novaService.payment}</strong></div>
      </section>

      <section id="story" className="story">
        <div>
          <p className="eyebrow">THE NOVA IDEA</p>
          <h2>Not just a watch.<br /><em>A point of view.</em></h2>
        </div>
        <p className="storytext">
          From the first glance to the final detail, NOVA is designed to feel considered. The interface, the object, the way it sits on your wrist — one visual language.
        </p>
      </section>

      <section id="collection" className="collection">
        <div className="section-head">
          <div>
            <p className="eyebrow">THE COLLECTION</p>
            <h2>Choose your <em>expression.</em></h2>
          </div>
          <p>Move through the collection. Hover the watch. Change the context.</p>
        </div>

        <div className="selector-row">
          {products.map((p) => (
            <button
              key={p.type}
              className={style === p.type ? "selected" : ""}
              onClick={() => {
                setStyle(p.type);
                setMediaKey("hero");
                trackNovaEvent("select_product", { product: p.name, type: p.type });
              }}
            >
              {p.type}
            </button>
          ))}
        </div>

        <motion.div className="featured" layout>
          <div className="featured-visual">
            <ProductImage
              src={activeMedia}
              alt={active.name}
              tone={active.tone}
            />
            <div className="media-thumbs" aria-label="Product views">
              {(["hero", "detail", "dial", "wrist"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={mediaKey === key ? "selected" : ""}
                  onClick={() => setMediaKey(key)}
                  disabled={!active.media?.[key]}
                >
                  {key.toUpperCase()}
                </button>
              ))}
            </div>
            <button className={`hotspot h1 ${feature === "CASE" ? "active" : ""}`} onClick={() => setFeature("CASE")}>
              CASE<span>{featureCopy.CASE}</span>
            </button>
            <button className={`hotspot h2 ${feature === "DIAL" ? "active" : ""}`} onClick={() => setFeature("DIAL")}>
              DIAL<span>{featureCopy.DIAL}</span>
            </button>
            <button className={`hotspot h3 ${feature === "STRAP" ? "active" : ""}`} onClick={() => setFeature("STRAP")}>
              STRAP<span>{featureCopy.STRAP}</span>
            </button>
            <button className={`hotspot h4 ${feature === "FINISH" ? "active" : ""}`} onClick={() => setFeature("FINISH")}>
              FINISH<span>{featureCopy.FINISH}</span>
            </button>
          </div>

          <motion.div
            className="featured-copy"
            key={active.name}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="eyebrow">{active.type}</p>
            <h3>{active.name}</h3>
            <p>{active.detail}</p>
            <p className="feature-text">{featureCopy[feature]}</p>
            <div className="price">{active.price}</div>

            <button
              className="btn dark full"
              onClick={() => {
                trackNovaEvent("click_buy", { product: active.name, price: active.price });
                window.location.assign(active.checkoutUrl || novaStoreUrl);
              }}
            >
              BUY NOW
            </button>
            <button className="quick-link" onClick={() => {
              setQuickView(true);
              trackNovaEvent("open_quick_view", { product: active.name });
            }}>QUICK VIEW →</button>

            <small>Demo catalog pricing — replace with your verified NOVA catalog.</small>
          </motion.div>
        </motion.div>
      </section>

      <section className="lifestyle">
        <div className="life-copy">
          <p className="eyebrow">WEAR IT YOUR WAY</p>
          <h2>One collection.<br /><em>Four moods.</em></h2>
          <p>Choose the moment and see NOVA shift with you.</p>
        </div>

        <div className="life-stage">
          <motion.div
            className="life-card"
            key={`${active.name}-${life}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="life-index">0{lifestyles.indexOf(life) + 1}</div>
            <ProductImage
              src={activeLife}
              alt={`${active.name} — ${life}`}
              tone={
                life === "NIGHT"
                  ? "black"
                  : life === "TRAVEL"
                    ? "steel"
                    : life === "DATE"
                      ? "bronze"
                      : "ivory"
              }
            />
            <h3>{life}</h3>
          </motion.div>
        </div>

        <div className="life-tabs">
          {lifestyles.map((x) => (
            <button
              key={x}
              className={life === x ? "selected" : ""}
              onClick={() => {
                setLife(x);
                trackNovaEvent("select_lifestyle", { product: active.name, lifestyle: x });
              }}
            >
              {x}
            </button>
          ))}
        </div>
      </section>

      <section className="motion-band">
        <p className="eyebrow">WATCH IN MOTION</p>
        <div className="motion-word">
          <span>FORM</span><span>LIGHT</span><span>MOTION</span><span>TIME</span>
        </div>
      </section>

      <section className="support" id="support">
        <div>
          <p className="eyebrow">UAE SUPPORT</p>
          <h2>Questions before<br /><em>you order?</em></h2>
          <p className="support-lede">Delivery, payment, inspection and warranty information in one place.</p>
        </div>
        <div className="support-grid">
          <details open>
            <summary>How fast is UAE delivery?</summary>
            <p>Typical UAE delivery is 24–48 hours.</p>
          </details>
          <details>
            <summary>Can I inspect before payment?</summary>
            <p>Yes. Inspection before payment is available on the current NOVA UAE store.</p>
          </details>
          <details>
            <summary>Which payment methods are available?</summary>
            <p>Cash on delivery, Apple Pay and cards are currently listed.</p>
          </details>
          <details>
            <summary>How can I contact NOVA?</summary>
            <p><a href="mailto:${novaSupport.email}">{novaSupport.email}</a><br />{novaSupport.address}</p>
          </details>
        </div>
      </section>

      <section className="cta">
        <p className="eyebrow">NOVA / UAE</p>
        <h2>Find the time<br /><em>that feels like you.</em></h2>
        <a className="btn light" href={novaStoreUrl} onClick={() => trackNovaEvent("open_store", { placement: "cta" })}>SHOP NOVA</a>
      </section>

      <footer id="contact">
        <div className="logo">NOVA<span>®</span></div>
        <p>TIME. YOUR WAY.</p>
        <div>
          <a href="#support">SUPPORT</a>
          <a href="mailto:${novaSupport.email}">EMAIL</a>
          <a href={novaStoreUrl}>STORE</a>
        </div>
      </footer>

      <a className="mobile-buy" href={novaStoreUrl} onClick={() => trackNovaEvent("open_store", { placement: "mobile" })}>SHOP NOVA</a>

      {quickView && (
        <div className="modal" onClick={() => setQuickView(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setQuickView(false)}>×</button>
            <ProductImage
              src={active.media?.detail ?? active.media?.hero}
              alt={active.name}
              tone={active.tone}
              small
            />
            <p className="eyebrow">{active.type}</p>
            <h3>{active.name}</h3>
            <strong>{active.price}</strong>
            <p>{active.detail}</p>
            <button
              className="btn dark full"
              onClick={() => {
                trackNovaEvent("click_buy", { product: active.name, price: active.price, placement: "quick_view" });
                window.location.assign(active.checkoutUrl || novaStoreUrl);
              }}
            >
              BUY NOW
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
