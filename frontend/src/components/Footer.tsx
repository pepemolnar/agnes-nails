import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Agnes Nails</h3>
          <p>Professional nail care and beautiful designs</p>
        </div>
        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Phone: (555) 123-4567</p>
          <p>Email: info@agnesnails.com</p>
          <p>Address: 123 Beauty Street, City, ST 12345</p>
        </div>
        <div className="footer-section">
          <h4>Hours</h4>
          <p>Monday - Friday: 9:00 AM - 7:00 PM</p>
          <p>Saturday: 10:00 AM - 6:00 PM</p>
          <p>Sunday: Closed</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Agnes Nails. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
