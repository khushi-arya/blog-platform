import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <div className="site-nav-wrap">
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="site-nav__brand" to="/">MERN Blog</Link>
        <div className="site-nav__account">
          {loading ? (
            <span className="nav-muted">Loading account...</span>
          ) : user ? (
            <>
              <Link className="nav-action" to="/posts/new">Write</Link>
              <span className="nav-user">{user.name}</span>
              <button className="text-button" onClick={logout} type="button">Log out</button>
            </>
          ) : (
            <>
              <Link className="nav-action" to="/login">Log in</Link>
              <Link className="nav-action nav-action--solid" to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}