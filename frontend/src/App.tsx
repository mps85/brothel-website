import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "./api";
import { clearUser, getUser, getUsername } from "./auth";
import "./App.css";

interface RoleSection {
  role: string;
  links: Array<{ to: string; label: string }>;
}

const roleSections: RoleSection[] = [
  {
    role: "admin",
    links: [{ to: "/admin", label: "User Administration" }],
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const username = getUsername();
  const roles = getUser()?.roles ?? [];

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    void logout();
    clearUser();
    closeMenu();
    navigate("/");
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
          <h1 className="topbar-title">
            Welcome to the BROTHel{username ? `, ${username}` : ""}
          </h1>
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
              to={username ? "/campmates" : "/for-campmates"}
              onClick={closeMenu}
              className={
                location.pathname.startsWith("/for-campmates") ||
                location.pathname.startsWith("/campmates")
                  ? "active"
                  : ""
              }
            >
              For Campmates
            </Link>
          </li>
          {roleSections
            .filter((section) => roles.includes(section.role))
            .map((section) => (
              <li key={section.role} className="menu-role-section">
                <span className="menu-role-header">{section.role}</span>
                <ul className="menu-role-links">
                  {section.links.map((link) => (
                    <li key={link.to}>
                      <Link
                        to={link.to}
                        onClick={closeMenu}
                        className={location.pathname.startsWith(link.to) ? "active" : ""}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          {username && (
            <li>
              <button className="logout-btn" onClick={handleLogout}>
                Log Out
              </button>
            </li>
          )}
        </ul>
      </nav>

      <Outlet />
    </>
  );
}

export default App;
