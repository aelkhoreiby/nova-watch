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
  const t = (en: string, ar: string) => language === "AR" ? ar : en;

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
          <a href="#collection">{t("COLLECTION","المجموعة")}</a>
          <a href="#story">{t("THE IDEA","الفكرة")}</a>
          <a href="#contact">{t("CONTACT","تواصل")}</a>
        </div>
        <div className="nav-actions">
          <a className="nav-shop" href={novaStoreUrl} onClick={() => trackNovaEvent("open_store", { placement: "nav" })}>{t("SHOP","تسوق")}</a>
          <button className="language-toggle" type="button" onClick={() => setLanguage(language === "EN" ? "AR" : "EN")} aria-label="Switch language">
            {language === "EN" ? "AR" : "EN"}
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{t("NOVA WATCHES · UAE","ساعات نوفا · الإمارات")}</p>
          <h1>TIME.<br /><em>{t("YOUR WAY.","بطريقتك.")}</em></h1>
          <p className="lede">
            {t("A modern watch collection built around your rhythm — clean, confident and made to move with you.","مجموعة ساعات عصرية مصممة حول إيقاعك — نظيفة، واثقة، ومواكبة لحركتك.")}
          </p>
          <div className="hero-actions">
            <a className="btn dark" href="#collection">{t("EXPLORE COLLECTION","استكشف المجموعة")}</a>
            <a className="text-link" href="#story">{t("DISCOVER NOVA ↓","اكتشف نوفا ↓")}</a>
            <a className="text-link" href={novaStoreUrl} onClick={() => trackNovaEvent("open_store", { placement: "hero" })}>{t("ORDER NOW ↗","اطلب الآن ↗")}</a>
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
          <div className="floating-label l1">01 / {t("SIGNATURE FORM","هوية التصميم")}</div>
          <div className="floating-label l2">{t("MADE FOR THE MOMENT","مصممة للحظة")}</div>
        </motion.div>
      </section>

      <section className="service-strip" aria-label="NOVA UAE service information">
        <div><strong>{novaService.delivery}</strong><span>{t("UAE DELIVERY","توصيل داخل الإمارات")}</span></div>
        <div><strong>{novaService.inspection}</strong><span>{t("INSPECTION AVAILABLE","معاينة قبل الدفع")}</span></div>
        <div><strong>{novaService.warranty}</strong><span>{t("WARRANTY","الضمان")}</span></div>
        <div><strong>{novaService.payment}</strong></div>
      </section>

      <section id="story" className="story">
        <div>
          <p className="eyebrow">{t("THE NOVA IDEA","فكرة نوفا")}</p>
          <h2>{t("Not just a watch.","ليست مجرد ساعة.")}<br /><em>{t("A point of view.","وجهة نظر.")}</em></h2>
        </div>
        <p className="storytext">
          {t("From the first glance to the final detail, NOVA is designed to feel considered. The interface, the object, the way it sits on your wrist — one visual language.","من النظرة الأولى حتى آخر تفصيلة، صُممت نوفا بعناية. الواجهة، القطعة، وطريقة ارتدائها على معصمك — لغة بصرية واحدة.")}
        </p>
      </section>

      <section id="collection" className="collection">
        <div className="section-head">
          <div>
            <p className="eyebrow">{t("THE COLLECTION","المجموعة")}</p>
            <h2>{t("Choose your ","اختر ")}<em>{t("expression.","تعبيرك.")}</em></h2>
          </div>
          <p>{t("Move through the collection. Hover the watch. Change the context.","تنقل بين المجموعة. حرّك مؤشر الفأرة فوق الساعة وغيّر السياق.")}</p>
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
              {t("BUY NOW","اشترِ الآن")}
            </button>
            <button className="quick-link" onClick={() => {
              setQuickView(true);
              trackNovaEvent("open_quick_view", { product: active.name });
            }}>{t("QUICK VIEW →","عرض سريع ←")}</button>

            <small>{t("Demo catalog pricing — replace with your verified NOVA catalog.","الأسعار الحالية تجريبية — استبدلها بكتالوج نوفا الفعلي المعتمد.")}</small>
          </motion.div>
        </motion.div>
      </section>

      <section className="lifestyle">
        <div className="life-copy">
          <p className="eyebrow">{t("WEAR IT YOUR WAY","ارتدها بطريقتك")}</p>
          <h2>{t("One collection.","مجموعة واحدة.")}<br /><em>{t("Four moods.","أربع حالات.")}</em></h2>
          <p>{t("Choose the moment and see NOVA shift with you.","اختر اللحظة وشاهد نوفا تتغير معك.")}</p>
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
        <p className="eyebrow">{t("WATCH IN MOTION","الساعة في الحركة")}</p>
        <div className="motion-word">
          <span>FORM</span><span>LIGHT</span><span>MOTION</span><span>TIME</span>
        </div>
      </section>

      <section className="support" id="support">
        <div>
          <p className="eyebrow">{t("UAE SUPPORT","دعم الإمارات")}</p>
          <h2>{t("Questions before","أسئلتك قبل")}<br /><em>{t("you order?","الطلب؟")}</em></h2>
          <p className="support-lede">{t("Delivery, payment, inspection and warranty information in one place.","معلومات التوصيل والدفع والمعاينة والضمان في مكان واحد.")}</p>
        </div>
        <div className="support-grid">
          <details open>
            <summary>{t("How fast is UAE delivery?","ما مدة التوصيل داخل الإمارات؟")}</summary>
            <p>{t("Typical UAE delivery is 24–48 hours.","مدة التوصيل المعتادة داخل الإمارات 24–48 ساعة.")}</p>
          </details>
          <details>
            <summary>{t("Can I inspect before payment?","هل يمكنني المعاينة قبل الدفع؟")}</summary>
            <p>{t("Yes. Inspection before payment is available on the current NOVA UAE store.","نعم. المعاينة قبل الدفع متاحة في متجر نوفا الإماراتي الحالي.")}</p>
          </details>
          <details>
            <summary>{t("Which payment methods are available?","ما طرق الدفع المتاحة؟")}</summary>
            <p>{t("Cash on delivery, Apple Pay and cards are currently listed.","المتاح حاليًا: الدفع عند الاستلام، Apple Pay والبطاقات.")}</p>
          </details>
          <details>
            <summary>{t("How can I contact NOVA?","كيف أتواصل مع نوفا؟")}</summary>
            <p><a href={`mailto:${novaSupport.email}`}>{novaSupport.email}</a><br />{novaSupport.address}</p>
          </details>
        </div>
      </section>

      <section className="cta">
        <p className="eyebrow">NOVA / {language === "AR" ? "الإمارات" : "UAE"}</p>
        <h2>{t("Find the time","اعثر على الوقت")}<br /><em>{t("that feels like you.","الذي يشبهك.")}</em></h2>
        <a className="btn light" href={novaStoreUrl} onClick={() => trackNovaEvent("open_store", { placement: "cta" })}>{t("SHOP NOVA","تسوق نوفا")}</a>
      </section>

      <footer id="contact">
        <div className="logo">NOVA<span>®</span></div>
        <p>TIME. YOUR WAY.</p>
        <div>
          <a href="#support">{t("SUPPORT","الدعم")}</a>
          <a href={`mailto:${novaSupport.email}`}>{t("EMAIL","البريد")}</a>
          <a href={novaStoreUrl}>{t("STORE","المتجر")}</a>
        </div>
      </footer>

      <a className="mobile-buy" href={novaStoreUrl} onClick={() => trackNovaEvent("open_store", { placement: "mobile" })}>{t("SHOP NOVA","تسوق نوفا")}</a>

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
