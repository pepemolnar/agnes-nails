import Link from 'next/link';
import './Home.css';

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Agnes Nails</h1>
          <p className="hero-subtitle">Experience the Art of Beautiful Nails</p>
          <p className="hero-description">
            Professional nail care, stunning designs, and relaxing atmosphere.
            Your nails deserve the best!
          </p>
          <Link href="/booking" className="cta-button">
            Book Your Appointment
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">💅</div>
            <h3>Expert Technicians</h3>
            <p>Our skilled nail artists have years of experience and are passionate about their craft.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>Premium Products</h3>
            <p>We use only the highest quality, safe, and long-lasting nail products.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎨</div>
            <h3>Custom Designs</h3>
            <p>From classic elegance to bold statements, we bring your nail vision to life.</p>
          </div>
        </div>
      </section>

      <section className="about">
        <div className="about-container">
          <h2>Why Choose Agnes Nails?</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                At Agnes Nails, we believe that beautiful nails are more than just a beauty
                treatment - they're a form of self-expression and self-care. Our salon offers
                a welcoming and relaxing environment where you can unwind while our expert
                technicians work their magic.
              </p>
              <p>
                With years of experience and a commitment to excellence, we provide personalized
                service tailored to your unique style and preferences. Whether you're looking for
                a classic manicure, trendy nail art, or luxurious spa treatment, we've got you covered.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Transform Your Nails?</h2>
        <p>Book your appointment today and experience the Agnes Nails difference!</p>
        <Link href="/booking" className="cta-button secondary">
          Foglalj most
        </Link>
      </section>
    </div>
  );
}
