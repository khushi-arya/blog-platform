import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const getErrorMessage = (error) =>
  error.response?.data?.message || "Unable to create your account. Please try again.";

export default function Register() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      await register(form);
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="register-title">
        <span className="eyebrow">Join the conversation</span>
        <h1 id="register-title">Create an account</h1>
        <p className="auth-intro">A good place to begin is with your name.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            autoComplete="name"
            id="name"
            maxLength={100}
            name="name"
            onChange={updateField}
            required
            type="text"
            value={form.name}
          />
          <label htmlFor="email">Email</label>
          <input
            autoComplete="email"
            id="email"
            maxLength={254}
            name="email"
            onChange={updateField}
            required
            type="email"
            value={form.email}
          />
          <label htmlFor="password">Password</label>
          <input
            autoComplete="new-password"
            id="password"
            minLength={8}
            name="password"
            onChange={updateField}
            pattern="(?=.*[\p{L}])(?=.*\d).{8,}"
            required
            title="Use at least 8 characters, including a letter and a number."
            type="password"
            value={form.password}
          />
          {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
          <button className="submit-button" disabled={submitting} type="submit">
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
      </section>
    </main>
  );
}