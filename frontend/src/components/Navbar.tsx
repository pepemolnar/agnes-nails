import Link from 'next/link';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">
          Agnes Nails
        </Link>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link href="/" className="navbar-link">
              Home
            </Link>
          </li>
          <li className="navbar-item">
            <Link href="/services" className="navbar-link">
              Services
            </Link>
          </li>
          <li className="navbar-item">
            <Link href="/booking" className="navbar-link booking-btn">
              Book Appointment
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
