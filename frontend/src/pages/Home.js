import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProductsBySector } from "../services/api";
import ProductCard from "../components/ProductCard";
import "./Home.css";

const SECTORS_GRID = [
  {
    key: "agri",
    label: "Agriculture",
    icon: "🌾",
    desc: "Seeds, tools & farm essentials",
    bg: "linear-gradient(135deg,#d4edda,#a8d5b5)",
    accent: "#1e7e34",
  },
  {
    key: "aqua",
    label: "Aquaculture",
    icon: "🐟",
    desc: "Fish farming & water systems",
    bg: "linear-gradient(135deg,#cce5ff,#99ccff)",
    accent: "#004085",
  },
  {
    key: "electrical",
    label: "Electrical",
    icon: "⚡",
    desc: "Cables, power & safety items",
    bg: "linear-gradient(135deg,#fff3cd,#ffd666)",
    accent: "#856404",
  },
  {
    key: "electronics",
    label: "Electronics",
    icon: "📱",
    desc: "Devices, parts & components",
    bg: "linear-gradient(135deg,#e8d5f5,#d0aff0)",
    accent: "#5a1a8a",
  },
  {
    key: "mechanical",
    label: "Mechanical",
    icon: "🔧",
    desc: "Machines, tools & spares",
    bg: "linear-gradient(135deg,#ffd8cc,#ffb3a0)",
    accent: "#7a2000",
  },
  {
    key: "civil",
    label: "Civil",
    icon: "🏗️",
    desc: "Construction materials",
    bg: "linear-gradient(135deg,#dce1e7,#b8c4ce)",
    accent: "#2d3f50",
  },
  {
    key: "chemical",
    label: "Chemical",
    icon: "🧪",
    desc: "Lab & industrial chemicals",
    bg: "linear-gradient(135deg,#ffd6e7,#ffaecf)",
    accent: "#6b0034",
  },
  {
    key: "food",
    label: "Food",
    icon: "🍜",
    desc: "Food processing supplies",
    bg: "linear-gradient(135deg,#ffe5c0,#ffcf85)",
    accent: "#7a3c00",
  },
  {
    key: "nanobio",
    label: "Nano/Bio",
    icon: "🔬",
    desc: "Research & bio products",
    bg: "linear-gradient(135deg,#d8dcf5,#b0b8ec)",
    accent: "#1a2472",
  },
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

        const combined = [
          ...(a?.data || []).slice(0, 1),
          ...(b?.data || []).slice(0, 1),
          ...(c?.data || []).slice(0, 1),
        ];

        setFeaturedProducts(combined);
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
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />

        <div className="hero-shape s1" />
        <div className="hero-shape s2" />
        <div className="hero-shape s3" />

        <div className="hero-truck-wrap">
          <svg
            viewBox="0 0 260 120"
            xmlns="http://www.w3.org/2000/svg"
            className="hero-truck-svg"
          >
            <rect x="0" y="18" width="170" height="78" rx="6" fill="#fff" opacity="0.95" />
            <rect x="0" y="18" width="170" height="14" rx="4" fill="#1a5abf" />
            <text
              x="10"
              y="29"
              fill="white"
              fontSize="9"
              fontWeight="bold"
              fontFamily="Arial"
            >
              ATLAS DELIVERY SERVICES
            </text>

            <line x1="85" y1="32" x2="85" y2="96" stroke="#e2e8f0" strokeWidth="1.5" />
            <line x1="0" y1="64" x2="170" y2="64" stroke="#e2e8f0" strokeWidth="1" />

            <rect x="170" y="32" width="72" height="64" rx="7" fill="#dbeafe" />
            <rect x="176" y="38" width="50" height="36" rx="4" fill="#93c5fd" />
            <rect x="178" y="40" width="22" height="18" rx="2" fill="#bfdbfe" opacity="0.7" />

            <rect x="238" y="24" width="9" height="24" rx="4" fill="#94a3b8" />
            <ellipse cx="242" cy="23" rx="6" ry="4" fill="#cbd5e1" opacity="0.5" />

            <circle cx="42" cy="104" r="16" fill="#1e293b" />
            <circle cx="42" cy="104" r="9" fill="#475569" />
            <circle cx="42" cy="104" r="4" fill="#94a3b8" />

            <circle cx="130" cy="104" r="16" fill="#1e293b" />
            <circle cx="130" cy="104" r="9" fill="#475569" />
            <circle cx="130" cy="104" r="4" fill="#94a3b8" />

            <circle cx="222" cy="104" r="16" fill="#1e293b" />
            <circle cx="222" cy="104" r="9" fill="#475569" />
            <circle cx="222" cy="104" r="4" fill="#94a3b8" />

            <text
              x="40"
              y="72"
              fill="#1a5abf"
              fontSize="18"
              fontWeight="900"
              fontFamily="Arial"
              opacity="0.15"
            >
              ATLAS
            </text>
          </svg>
        </div>

        <div className="hero-content container">
          <div className="hero-text">
            <div className="hero-badge">⚡ Fast & Reliable</div>

            <h1>
              Industrial &amp; Agricultural
              <br />
              <span className="hero-highlight">Delivery Services</span>
            </h1>

            <p>
              Your trusted logistics partner for 9 sectors — agriculture,
              aquaculture, electrical, electronics, mechanical, civil, chemical,
              food &amp; nanobio.
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
              <div className="hstat">
                <strong>36+</strong> Products
              </div>
              <div className="hstat">
                <strong>9</strong> Sectors
              </div>
              <div className="hstat">
                <strong>500+</strong> Clients
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ SECTOR GRID ══════════════════ */}
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
              style={{
                "--sector-bg": sector.bg,
                "--sector-accent": sector.accent,
              }}
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

              <div className="sector-footer">
                <span>View products</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ══════════════ FEATURED PRODUCTS ══════════════ */}
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

      {/* ══════════════ WHY ATLAS ══════════════════════ */}
      <section className="why-section">
        <div className="container">
          <div className="section-head">
            <h2>Why Choose Atlas?</h2>
            <p>We go beyond delivery</p>
          </div>

          <div className="why-grid">
            {[
              {
                icon: "🚚",
                title: "On-Time Delivery",
                desc: "Reliable logistics with real-time tracking across all major regions.",
              },
              {
                icon: "🏭",
                title: "Industrial Grade",
                desc: "Genuine, certified products sourced directly from top manufacturers.",
              },
              {
                icon: "💰",
                title: "Competitive Pricing",
                desc: "Best-in-market rates with bulk discounts for business customers.",
              },
              {
                icon: "🤝",
                title: "Dedicated Support",
                desc: "24/7 customer service and expert consultation for all sectors.",
              },
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

      {/* ══════════════ CTA BANNER ════════════════════ */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-inner">
            <div className="cta-text">
              <h2>Ready to place your order?</h2>
              <p>
                Get in touch with our team for bulk pricing and custom delivery
                arrangements.
              </p>
            </div>

            <div className="cta-actions">
              <button className="btn-green" onClick={() => navigate("/contact")}>
                Contact Us Today
              </button>

              <button className="btn-outline" onClick={() => navigate("/products")}>
                View Products
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}