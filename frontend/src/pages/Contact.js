import React, { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', message:'' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name:'', email:'', phone:'', message:'' });
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Reach us via any channel below.</p>
        </div>
      </div>

      <div className="contact-body container">
        <div className="contact-grid">
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <div className="info-item"><span>📞</span><div><strong>Phone</strong><p>+91 98765 43210</p></div></div>
            <div className="info-item"><span>📧</span><div><strong>Email</strong><p>info@atlasdelivery.com</p></div></div>
            <div className="info-item"><span>🟢</span><div><strong>WhatsApp</strong><p>+91 98765 43210</p></div></div>
            <div className="info-item"><span>📍</span><div><strong>Address</strong><p>Atlas Services, Patikaon Park, Hyderabad, Telangana</p></div></div>
            <div className="contact-map">
              <iframe
                title="map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.3!2d78.4867!3d17.3850!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTfCsDIzJzA2LjAiTiA3OMKwMjknMTIuMiJF!5e0!3m2!1sen!2sin!4v1"
                width="100%" height="220" style={{border:0,borderRadius:10}} allowFullScreen loading="lazy"
              />
            </div>
          </div>

          <div className="contact-form-card">
            <h2>Send a Message</h2>
            {sent ? (
              <div className="form-success">
                <p>✅ Thank you! We'll get back to you shortly.</p>
                <button className="btn-green" onClick={() => setSent(false)}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="cform">
                <div className="form-group">
                  <label>Name *</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your full name" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="your@email.com" />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={4} placeholder="How can we help you?" />
                </div>
                <button type="submit" className="btn-green">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
