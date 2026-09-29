import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const getErrorMessage = (error) =>
  error.response?.data?.message || "Unable to log in. Please try again.";

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return <main className="auth-status" role="status">Restoring your session...</main>;
  }
  if (user) {
    return <Navigate to="/" replace />;
  }

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage("");
    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <span className="eyebrow">Welcome back</span>
        <h1 id="login-title">Log in</h1>
        <p className="auth-intro">Pick up where your reading left off.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            autoComplete="email"
            id="email"
            name="email"
            onChange={updateField}
            required
            type="email"
            value={form.email}
          />
          <label htmlFor="password">Password</label>
          <input
            autoComplete="current-password"
            id="password"
            name="password"
            onChange={updateField}
            required
            type="password"
            value={form.password}
          />
          {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
          <button className="submit-button" disabled={submitting} type="submit">
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>
        <p className="auth-switch">New to the blog? <Link to="/register">Create an account</Link></p>
      </section>
    </main>
  );
}