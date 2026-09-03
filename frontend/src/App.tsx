import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./App.css";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className="topbar">
        <Link to="/" className="topbar-left" onClick={closeMenu}>
          <img
            className="logo"
            src="/images/camp_logo_02.png"
            alt="BROTHel camp logo"
          />
          <h1 className="topbar-title">Welcome to the BROTHel</h1>
        </Link>
        <button
          className={`menu-btn ${menuOpen ? "open" : ""}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <div
        className={`menu-overlay ${menuOpen ? "show" : ""}`}
        onClick={closeMenu}
      />

      <nav className={`menu ${menuOpen ? "open" : ""}`}>
        <ul>
          <li>
            <Link
              to="/"
              onClick={closeMenu}
              className={location.pathname === "/" ? "active" : ""}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/for-campmates"
              onClick={closeMenu}
              className={location.pathname.startsWith("/for-campmates") ? "active" : ""}
            >
              For Campmates
            </Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </>
  );
}

export default App;
