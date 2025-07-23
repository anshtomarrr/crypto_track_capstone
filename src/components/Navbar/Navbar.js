import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const [hovered, setHovered] = useState(null);
  const { authenticated, login, logout, ready } = usePrivy();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/portfolio", label: "Portfolio" },
    { to: "/news", label: "News" },
    { to: "/about", label: "About Us" },
  ];

  const handleHamburger = () => setMenuOpen((open) => !open);
  const handleNavClick = () => setMenuOpen(false);

  return (
    <nav className="navbar" style={{ position: "relative" }}>
      <div className="nav-logo">
        <Link to="/">CoinXTrade</Link>
      </div>
      <button
        className="hamburger"
        onClick={handleHamburger}
        aria-label="Toggle navigation"
      >
        {menuOpen ? "✕" : "☰"}
      </button>
      <ul className={`nav-links${menuOpen ? " open" : ""}`}>
        {navLinks.map((link, idx) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={
                location.pathname === link.to
                  ? "active"
                  : hovered === idx
                  ? "hovered"
                  : ""
              }
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              onClick={handleNavClick}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="nav-auth">
        {ready &&
          (authenticated ? (
            <button className="nav-btn" onClick={logout}>
              Logout
            </button>
          ) : (
            <button className="nav-btn" onClick={login}>
              Login/Sign Up
            </button>
          ))}
      </div>
    </nav>
  );
}

export default Navbar;
