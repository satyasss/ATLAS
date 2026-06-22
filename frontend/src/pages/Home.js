import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProductsBySector } from "../services/api";
import ProductCard from "../components/ProductCard";
import "./Home.css";

const SECTORS_GRID = [
  { key: "agri", label: "Agriculture", icon: "🌾", desc: "Seeds, tools & farm essentials", accent: "#16a34a", tint: "#dcfce7" },
  { key: "aqua", label: "Aquaculture", icon: "🐟", desc: "Fish farming & water systems", accent: "#0ea5e9", tint: "#dff3ff" },
  { key: "electrical", label: "Electrical", icon: "⚡", desc: "Cables, power & safety items", accent: "#d97706", tint: "#fef3c7" },
  { key: "electronics", label: "Electronics", icon: "📱", desc: "Devices, parts & components", accent: "#7c3aed", tint: "#ede9fe" },
  { key: "mechanical", label: "Mechanical", icon: "⚙️", desc: "Machines, tools & spares", accent: "#ef4444", tint: "#fee2e2" },
  { key: "civil", label: "Civil", icon: "🏢", desc: "Construction materials", accent: "#2563eb", tint: "#dbeafe" },
  { key: "chemical", label: "Chemical", icon: "🧪", desc: "Industrial & specialty chemicals", accent: "#db2777", tint: "#fce7f3" },
  { key: "food", label: "Food", icon: "🥣", desc: "Food processing & packaging", accent: "#f59e0b", tint: "#fef3c7" },
  { key: "nanobio", label: "Nano/Bio", icon: "🔬", desc: "Nano materials & biotechnology", accent: "#8b5cf6", tint: "#ede9fe" },
];

const STATS = [
  { icon: "📦", value: "500+", label: "Products", detail: "Quality products for every industry" },
  { icon: "🏭", value: "9+", label: "Sectors", detail: "Serving diverse industries across India" },
  { icon: "👥", value: "500+", label: "Clients", detail: "Trusted by businesses across the country" },
  { icon: "★★★★★", value: "4.8/5", label: "Customer Rating", detail: "Based on 200+ reviews" },
];

const BENEFITS = [
  { icon: "🛡️", title: "Verified Suppliers", desc: "Only genuine & trusted suppliers" },
  { icon: "🔒", title: "Secure Transactions", desc: "100% safe & secure payments" },
  { icon: "🚚", title: "Fast Delivery", desc: "Timely delivery across India" },
  { icon: "🎧", title: "24/7 Support", desc: "Always here to help you" },
];

export default function Home() {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      getProductsBySector("agri"),
      getProductsBySector("electrical"),
      getProductsBySector("mechanical"),
    ])
      .then(([a, b, c]) => {
        if (!isMounted) return;
        setFeaturedProducts([
          ...(a?.data || []).slice(0, 1),
          ...(b?.data || []).slice(0, 1),
          ...(c?.data || []).slice(0, 1),
        ]);
      })
      .catch(() => {
        if (isMounted) setFeaturedProducts([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg-image" />
        <div className="hero-overlay" />

        <div className="hero-content container">
          <div className="hero-text">
            <div className="hero-badge">✓ Trusted by 500+ businesses</div>

            <h1>Industrial &amp; Agricultural Services</h1>

            <p className="hero-subtitle">
              Your All-in-One Industrial &amp; Agricultural Supply Platform
            </p>

            <p className="hero-copy">
              Your trusted logistics partner for 9 sectors: agriculture,
              aquaculture, electrical, electronics, mechanical, civil, chemical,
              food &amp; nanobio.
            </p>

            <div className="hero-btns">
              <button className="btn-green hero-cta" onClick={() => navigate("/products")}>
                <span>🛍️</span> Browse Products <span>→</span>
              </button>
              <button className="btn-outline hero-cta" onClick={() => navigate("/contact")}>
                <span>📞</span> Contact Us <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-panel container" aria-label="Atlas services highlights">
        {STATS.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <div className="stat-icon">{stat.icon}</div>
            <div>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
              <p>{stat.detail}</p>
            </div>
          </div>
        ))}
      </section>

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
              style={{ "--sector-accent": sector.accent, "--sector-tint": sector.tint }}
              onClick={() => navigate(`/products?sector=${sector.key}`)}
            >
              <div className="sector-card-icon">{sector.icon}</div>
              <div className="sector-info">
                <h3>{sector.label}</h3>
                <p>{sector.desc}</p>
              </div>
              <div className="sector-footer">
                <span>View products</span>
                <span aria-hidden="true">→</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="benefits-strip container">
        {BENEFITS.map((item) => (
          <div className="benefit-item" key={item.title}>
            <div className="benefit-icon">{item.icon}</div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {featuredProducts.length > 0 && (
        <section className="featured-section container">
          <div className="section-head">
            <span className="section-kicker">Popular Picks</span>
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

      <section className="help-banner">
        <div className="container help-inner">
          <div className="help-copy">
            <div className="help-icon">🎧</div>
            <div>
              <h2>Need help finding the right product?</h2>
              <p>Our experts are ready to assist you.</p>
            </div>
          </div>
          <button className="help-button" onClick={() => navigate("/contact")}>
            📞 Contact Us Now <span>→</span>
          </button>
        </div>
      </section>
    </div>
  );
}
