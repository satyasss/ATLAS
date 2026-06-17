import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProductsBySector } from "../services/api";
import ProductCard from "../components/ProductCard";
import BrandLogo from "../components/BrandLogo";
import "./Home.css";

const SECTORS_GRID = [
  { key:"agri",        label:"Agriculture",  icon:"🌾", desc:"Seeds, tools & farm essentials",     bg:"linear-gradient(135deg,#d4edda,#a8d5b5)", accent:"#1e7e34" },
  { key:"aqua",        label:"Aquaculture",  icon:"🐟", desc:"Fish farming & water systems",       bg:"linear-gradient(135deg,#cce5ff,#99ccff)", accent:"#004085" },
  { key:"electrical",  label:"Electrical",   icon:"⚡", desc:"Cables, power & safety items",       bg:"linear-gradient(135deg,#fff3cd,#ffd666)", accent:"#856404" },
  { key:"electronics", label:"Electronics",  icon:"📱", desc:"Devices, parts & components",        bg:"linear-gradient(135deg,#e8d5f5,#d0aff0)", accent:"#5a1a8a" },
  { key:"mechanical",  label:"Mechanical",   icon:"🔧", desc:"Machines, tools & spares",           bg:"linear-gradient(135deg,#ffd8cc,#ffb3a0)", accent:"#7a2000" },
  { key:"civil",       label:"Civil",        icon:"🏗️", desc:"Construction materials",             bg:"linear-gradient(135deg,#dce1e7,#b8c4ce)", accent:"#2d3f50" },
  { key:"chemical",    label:"Chemical",     icon:"🧪", desc:"Lab & industrial chemicals",         bg:"linear-gradient(135deg,#ffd6e7,#ffaecf)", accent:"#6b0034" },
  { key:"food",        label:"Food",         icon:"🍜", desc:"Food processing supplies",           bg:"linear-gradient(135deg,#ffe5c0,#ffcf85)", accent:"#7a3c00" },
  { key:"nanobio",     label:"Nano/Bio",     icon:"🔬", desc:"Research & bio products",            bg:"linear-gradient(135deg,#d8dcf5,#b0b8ec)", accent:"#1a2472" },
];

export default function Home() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getProductsBySector("agri"), getProductsBySector("electrical"), getProductsBySector("mechanical")])
      .then(([a, b, c]) => {
        if (!isMounted) return;
        setFeaturedProducts([
          ...(a?.data || []).slice(0, 1),
          ...(b?.data || []).slice(0, 1),
          ...(c?.data || []).slice(0, 1),
        ]);
      })
      .catch(() => { if (isMounted) setFeaturedProducts([]); });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="home">
      {/* ═══════════════════════════ HERO ═══════════════════════════ */}
      <section className="hero">
        {/* Background image layer */}
        <div className="hero-bg-image" />
        {/* Dark overlay for text readability */}
        <div className="hero-overlay" />

        <div className="hero-content container">
          <div className="hero-text">
            <div className="hero-logo-3d">
              <BrandLogo variant="hero" />
            </div>

            <div className="hero-badge">⚡ Premium verified marketplace</div>

            <h1>
              Industrial &amp; Agricultural
              <br />
              <span className="hero-highlight">Services</span>
            </h1>

            <p>
              A premium supply platform for 9 sectors with verified sellers,
              fast logistics, admin-approved documents and clean product discovery.
            </p>

            <div className="hero-btns">
              <button className="btn-green hero-cta" onClick={() => navigate("/products")}>
                Browse Products →
              </button>
              <button className="btn-outline" onClick={() => navigate("/contact")}>
                Contact Us
              </button>
            </div>

            <div className="hero-stats">
              <div className="hstat"><strong>36+</strong> Products</div>
              <div className="hstat"><strong>9</strong> Sectors</div>
              <div className="hstat"><strong>500+</strong> Clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ SECTOR GRID ══════════════════════ */}
      <section className="sectors-section container">
        <div className="section-head">
          <span className="section-kicker">Explore Categories</span>
          <h2>Browse by Sector</h2>
          <p>Choose your industry and find the right products faster</p>
        </div>

        <div className="sectors-grid">
          {SECTORS_GRID.map((sector) => (
            <button
              type="button"
              key={sector.key}
              className="sector-card"
              style={{ "--sector-bg": sector.bg, "--sector-accent": sector.accent }}
              onClick={() => navigate(`/products?sector=${sector.key}`)}
            >
              <div className="sector-glow" />
              <div className="sector-top">
                <div className="sector-card-icon">{sector.icon}</div>
                <span className="sector-arrow">→</span>
              </div>
              <div className="sector-info">
                <h3>{sector.label}</h3>
                <p>{sector.desc}</p>
              </div>
              <div className="sector-footer"><span>View products</span></div>
            </button>
          ))}
        </div>
      </section>

      {/* ══════════════════ FEATURED PRODUCTS ══════════════════ */}
      {featuredProducts.length > 0 && (
        <section className="featured-section container">
          <div className="section-head">
            <h2>Featured Products</h2>
            <p>Top picks from our catalogue</p>
          </div>
          <div className="product-grid-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} isAdmin={false} />
            ))}
          </div>
          <div className="featured-cta">
            <button className="btn-green" onClick={() => navigate("/products")}>
              View All Products →
            </button>
          </div>
        </section>
      )}

      {/* ══════════════════ WHY ATLAS ══════════════════════════ */}
      <section className="why-section">
        <div className="container">
          <div className="section-head">
            <h2>Why Choose Atlas Services?</h2>
            <p>We go beyond delivery</p>
          </div>
          <div className="why-grid">
            {[
              { icon:"🚚", title:"On-Time Delivery",    desc:"Reliable logistics with real-time tracking across all major regions." },
              { icon:"🏭", title:"Industrial Grade",    desc:"Genuine, certified products sourced directly from top manufacturers." },
              { icon:"💰", title:"Competitive Pricing", desc:"Best-in-market rates with bulk discounts for business customers." },
              { icon:"🤝", title:"Dedicated Support",   desc:"24/7 customer service and expert consultation for all sectors." },
            ].map((item) => (
              <div key={item.title} className="why-card">
                <div className="why-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA BANNER ════════════════════════ */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-inner">
            <div className="cta-text">
              <h2>Ready to place your order?</h2>
              <p>Get in touch with our team for bulk pricing and custom delivery arrangements.</p>
            </div>
            <div className="cta-actions">
              <button className="btn-green" onClick={() => navigate("/contact")}>Contact Us Today</button>
              <button className="btn-outline" onClick={() => navigate("/products")}>View Products</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
