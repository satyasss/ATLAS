import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProductsBySector } from "../services/api";
import ProductCard from "../components/ProductCard";
import "./Home.css";

const SECTORS_GRID = [
  { key: "agri", label: "Agritech", desc: "Seeds, tools & farm essentials", accent: "#38a548", tint: "#eaf8ed" },
  { key: "aqua", label: "Aquatech", desc: "Fish farming & water systems", accent: "#268fd8", tint: "#eaf6ff" },
  { key: "electrical", label: "Electrical", desc: "Cables, power & safety items", accent: "#f5ae15", tint: "#fff8df" },
  { key: "electronics", label: "Electronics", desc: "Devices, parts & components", accent: "#45a43c", tint: "#edf9eb" },
  { key: "mechanical", label: "Mechanical", desc: "Machines, tools & spares", accent: "#126cc4", tint: "#eaf3ff" },
  { key: "civil", label: "Civil", desc: "Construction materials", accent: "#078ca0", tint: "#e7f8fa" },
  { key: "chemical", label: "Chemical", desc: "Industrial & specialty chemicals", accent: "#07929a", tint: "#e7fafa" },
  { key: "food", label: "Food Products", desc: "Food processing & packaging", accent: "#ef7314", tint: "#fff1e7" },
];

function CategoryIcon({ type }) {
  const common = { viewBox: "0 0 96 96", role: "img", "aria-hidden": true };
  if (type === "agri") return <svg {...common}>
    <defs><linearGradient id="agriGreen" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6cc52d"/><stop offset="1" stopColor="#21933c"/></linearGradient></defs>
    <path d="M47 54C27 51 14 37 14 13c20 2 33 16 35 38ZM50 53c2-23 15-37 34-39 1 23-12 37-34 42Z" fill="url(#agriGreen)"/>
    <path d="M48 82C30 83 16 75 8 61c17-4 31 1 42 14 9-11 22-16 39-13-9 15-22 22-39 21Z" fill="url(#agriGreen)"/>
    <path d="M49 80V48M46 50C37 39 29 31 20 24m32 26c8-11 16-19 26-26M46 76c-10-7-19-10-30-11m37 11c9-7 18-10 29-11" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round"/>
  </svg>;
  if (type === "aqua") return <svg {...common}><path d="M32 10C25 22 18 31 18 40a14 14 0 0 0 28 0c0-9-7-18-14-30Zm28 11C50 37 45 45 45 55a17 17 0 0 0 34 0c0-10-8-21-19-34Z" fill="currentColor"/><path d="M11 73c11-7 20 7 31 0s20 7 31 0 16 0 16 0M11 86c11-7 20 7 31 0s20 7 31 0 16 0 16 0" fill="none" stroke="currentColor" strokeWidth="5"/></svg>;
  if (type === "electrical") return <svg {...common}><circle cx="48" cy="48" r="35" fill="none" stroke="currentColor" strokeWidth="5"/><path d="m54 8-29 47h21l-6 34 31-50H50Z" fill="currentColor"/></svg>;
  if (type === "electronics") return <svg {...common}><rect x="25" y="25" width="46" height="46" rx="3" fill="none" stroke="currentColor" strokeWidth="6"/><rect x="36" y="36" width="24" height="24" fill="currentColor"/><path d="M34 12v13m14-13v13m14-13v13M34 71v13m14-13v13m14-13v13M12 34h13M12 48h13M12 62h13m46-28h13M71 48h13M71 62h13" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/></svg>;
  if (type === "mechanical") return <svg {...common}>
    <defs><linearGradient id="mechanicalBlue" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#2687cf"/><stop offset="1" stopColor="#07559e"/></linearGradient></defs>
    <g fill="url(#mechanicalBlue)"><circle cx="48" cy="45" r="32"/><rect x="41" y="4" width="14" height="18" rx="3"/><rect x="41" y="68" width="14" height="18" rx="3"/><rect x="7" y="38" width="18" height="14" rx="3"/><rect x="71" y="38" width="18" height="14" rx="3"/><rect x="41" y="4" width="14" height="18" rx="3" transform="rotate(45 48 45)"/><rect x="41" y="68" width="14" height="18" rx="3" transform="rotate(45 48 45)"/><rect x="7" y="38" width="18" height="14" rx="3" transform="rotate(45 48 45)"/><rect x="71" y="38" width="18" height="14" rx="3" transform="rotate(45 48 45)"/></g>
    <circle cx="48" cy="45" r="22" fill="#fff"/>
    <path d="M37 23v20c0 7 3 12 7 15v25h8V58c5-3 8-8 8-15V23l-8 9h-7Z" fill="url(#mechanicalBlue)"/>
    <circle cx="48" cy="77" r="2.5" fill="#fff"/>
  </svg>;
  if (type === "civil") return <svg {...common}><path d="M11 78h74M20 78V41l18-14v51m0 0V18h19v60m0 0V35l20-13v56M15 78c8-19 58-19 68 0M27 47h5m-5 12h5m13-29h5m-5 13h5m-5 13h5m14-15h5m-5 13h5" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round"/></svg>;
  if (type === "chemical") return <svg {...common}><path d="M37 12h22M42 12v25L22 73a8 8 0 0 0 7 12h38a8 8 0 0 0 7-12L54 37V12M31 67h34" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round"/><circle cx="44" cy="59" r="3" fill="currentColor"/><circle cx="56" cy="73" r="4" fill="currentColor"/></svg>;
  return <svg {...common}><path d="M19 57h49c0 17-10 28-25 28S19 74 19 57Zm10 0V28h17v29M32 18h11v10M62 57V25m0 12 9-9m-9 22 11-9m-11 0-8-8m8 1 8-10" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round"/><path d="M27 40h21v17H27Z" fill="currentColor" opacity=".18"/></svg>;
}

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
  { icon: "🎧", title: "24/7 Support", desc: "We're here to help anytime" },
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
          ...(a?.data || []).slice(0, 2),
          ...(b?.data || []).slice(0, 2),
          ...(c?.data || []).slice(0, 2),
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
              <div className="sector-card-icon"><CategoryIcon type={sector.key} /></div>
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

          <div className="product-grid-6">
            {featuredProducts.map((product) => (
              <div key={product.id} onClick={() => navigate(`/products/${product.id}`)} style={{ cursor: 'pointer' }}>
                <ProductCard product={product} isAdmin={false} />
              </div>
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
