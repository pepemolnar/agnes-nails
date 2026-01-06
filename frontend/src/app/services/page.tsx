'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './Services.css';

interface Service {
  id: number;
  name: string;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Services() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/services/active`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  };

  return (
    <div className="services">
      <section className="services-hero">
        <h1>Our Services</h1>
        <p>Professional nail care tailored to your needs</p>
      </section>

      <section className="services-list">
        <div className="services-container">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-header">
                <h3>{service.name}</h3>
              </div>
              <div className="service-body">
                <p className="service-duration">Időtartam: {service.durationMinutes} perc</p>
              </div>
              <Link href="/booking" className="service-book-btn">
                Foglalás
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="gallery">
        <h2>Our Work</h2>
        <p className="gallery-subtitle">Get inspired by our beautiful nail designs</p>
        <div className="gallery-grid">
          <div className="gallery-item">
            <div className="gallery-placeholder">French Tips</div>
          </div>
          <div className="gallery-item">
            <div className="gallery-placeholder">Ombre Design</div>
          </div>
          <div className="gallery-item">
            <div className="gallery-placeholder">Floral Art</div>
          </div>
          <div className="gallery-item">
            <div className="gallery-placeholder">Glitter Glam</div>
          </div>
          <div className="gallery-item">
            <div className="gallery-placeholder">Geometric</div>
          </div>
          <div className="gallery-item">
            <div className="gallery-placeholder">Marble Effect</div>
          </div>
        </div>
      </section>

      <section className="services-cta">
        <h2>Ready to Get Started?</h2>
        <p>Book your appointment and let us take care of your nails!</p>
        <Link href="/booking" className="cta-button">
          Book Appointment
        </Link>
      </section>
    </div>
  );
}
