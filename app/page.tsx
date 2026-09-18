"use client";

import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const products = [
  { name: "NOVA ARC", type: "CLASSIC", price: "AED 299", tone: "ivory", detail: "Clean lines. Everyday precision.", checkoutUrl: "" },
  { name: "NOVA GRID", type: "URBAN", price: "AED 329", tone: "steel", detail: "Sharp geometry for city hours.", checkoutUrl: "" },
  { name: "NOVA NOIR", type: "NIGHT", price: "AED 349", tone: "black", detail: "A darker expression after sunset.", checkoutUrl: "" },
  { name: "NOVA SIGNATURE", type: "SIGNATURE", price: "AED 399", tone: "bronze", detail: "The statement piece.", checkoutUrl: "" }
];

const lifestyles = ["OFFICE", "NIGHT", "DATE", "TRAVEL"];
const featureCopy = { CASE: "The silhouette defines the presence.", DIAL: "The face keeps the essentials clear.", STRAP: "The finishing detail completes the look.", FINISH: "Every surface is part of the visual language." };

function Watch({ tone = "ivory", small = false }: { tone?: string; small?: boolean }) {
  return (
    <motion.div
      className={`watch-wrap ${small ? "small" : ""} tone-${tone}`}
      whileHover={{ rotateY: -10, rotateX: 5, scale: 1.025 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
    >
      <div className="strap top" />
      <div className="case">
        <div className="bezel"><div className="dial">
          <span className="marker m12" /><span className="marker m3" /><span className="marker m6" /><span className="marker m9" />
          <span className="hand hour" /><span className="hand minute" /><span className="hand second" />
          <span className="brand-mark">NOVA</span>
        </div></div>
      </div>
      <div className="strap bottom" />
    </motion.div>
  );
}

export default function Home() {
  const [style, setStyle] = useState("CLASSIC");
  const [feature, setFeature] = useState("CASE");
  const [life, setLife] = useState("OFFICE");
  const [quickView, setQuickView] = useState(false);
  const active = products.find(p => p.type === style) ?? products[0];
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, .35], [0, 130]);
  const heroRotate = useTransform(scrollYProgress, [0, .35], [0, -8]);

  return (
    <main>
      <nav className="nav">
        <div className="logo">NOVA<span>®</span></div>
        <div className="navlinks"><a href="#collection">COLLECTION</a><a href="#story">THE IDEA</a><a href="#contact">CONTACT</a></div>
        <button className="navbag">BAG <span>0</span></button>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">NOVA WATCHES · UAE</p>
          <h1>TIME.<br/><em>YOUR WAY.</em></h1>
          <p className="lede">A modern watch collection built around your rhythm — clean, confident and made to move with you.</p>
          <div className="hero-actions"><a className="btn dark" href="#collection">EXPLORE COLLECTION</a><a className="text-link" href="#story">DISCOVER NOVA ↓</a></div>
        </div>
        <motion.div className="hero-watch" style={{ y: heroY, rotateZ: heroRotate }}>
          <div className="orb" />
          <Watch tone="ivory" />
          <div className="floating-label l1">01 / SIGNATURE FORM</div>
          <div className="floating-label l2">MADE FOR THE MOMENT</div>
        </motion.div>
      </section>

      <section id="story" className="story">
        <div><p className="eyebrow">THE NOVA IDEA</p><h2>Not just a watch.<br/><em>A point of view.</em></h2></div>
        <p className="storytext">From the first glance to the final detail, NOVA is designed to feel considered. The interface, the object, the way it sits on your wrist — one visual language.</p>
      </section>

      <section id="collection" className="collection">
        <div className="section-head"><div><p className="eyebrow">THE COLLECTION</p><h2>Choose your <em>expression.</em></h2></div><p>Move through the collection. Hover the watch. Change the context.</p></div>
        <div className="selector-row">
          {products.map(p => <button key={p.type} className={style === p.type ? "selected" : ""} onClick={() => setStyle(p.type)}>{p.type}</button>)}
        </div>
        <motion.div className="featured" layout>
          <div className="featured-visual"><Watch tone={active.tone} /><button className={`hotspot h1 ${feature==="CASE"?"active":""}`} onClick={() => setFeature("CASE")}>CASE<span>{featureCopy.CASE}</span></button><button className={`hotspot h2 ${feature==="DIAL"?"active":""}`} onClick={() => setFeature("DIAL")}>DIAL<span>{featureCopy.DIAL}</span></button><button className={`hotspot h3 ${feature==="STRAP"?"active":""}`} onClick={() => setFeature("STRAP")}>STRAP<span>{featureCopy.STRAP}</span></button><button className={`hotspot h4 ${feature==="FINISH"?"active":""}`} onClick={() => setFeature("FINISH")}>FINISH<span>{featureCopy.FINISH}</span></button></div>
          <motion.div className="featured-copy" key={active.name} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <p className="eyebrow">{active.type}</p><h3>{active.name}</h3><p>{active.detail}</p><p className="feature-text">{featureCopy[feature as keyof typeof featureCopy]}</p><div className="price">{active.price}</div>
            <button className="btn dark full" onClick={() => active.checkoutUrl ? window.location.assign(active.checkoutUrl) : setQuickView(true)}>BUY NOW</button><button className="quick-link" onClick={() => setQuickView(true)}>QUICK VIEW →</button>
            <small>Demo catalog pricing — replace with your verified NOVA catalog.</small>
          </motion.div>
        </motion.div>
      </section>

      <section className="lifestyle">
        <div className="life-copy"><p className="eyebrow">WEAR IT YOUR WAY</p><h2>One collection.<br/><em>Four moods.</em></h2><p>Choose the moment and see NOVA shift with you.</p></div>
        <div className="life-stage"><motion.div className="life-card" key={life} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }}><div className="life-index">0{lifestyles.indexOf(life)+1}</div><Watch tone={life === "NIGHT" ? "black" : life === "TRAVEL" ? "steel" : life === "DATE" ? "bronze" : "ivory"} /><h3>{life}</h3></motion.div></div>
        <div className="life-tabs">{lifestyles.map(x => <button key={x} className={life === x ? "selected" : ""} onClick={() => setLife(x)}>{x}</button>)}</div>
      </section>

      <section className="motion-band"><p className="eyebrow">WATCH IN MOTION</p><div className="motion-word"><span>FORM</span><span>LIGHT</span><span>MOTION</span><span>TIME</span></div></section>

      <section className="cta">
        <p className="eyebrow">NOVA / UAE</p><h2>Find the time<br/><em>that feels like you.</em></h2><a className="btn light" href="#collection">SHOP NOVA</a>
      </section>

      <footer id="contact"><div className="logo">NOVA<span>®</span></div><p>TIME. YOUR WAY.</p><div><span>UAE DELIVERY</span><span>SUPPORT</span><span>INSTAGRAM</span></div></footer>
      <a className="mobile-buy" href="#collection">SHOP NOVA</a>
      {quickView && <div className="modal" onClick={() => setQuickView(false)}><div className="modal-card" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setQuickView(false)}>×</button><Watch tone={active.tone} small /><p className="eyebrow">{active.type}</p><h3>{active.name}</h3><strong>{active.price}</strong><p>{active.detail}</p><button className="btn dark full" onClick={() => setQuickView(false)}>CONTINUE</button></div></div>}
    </main>
  );
}