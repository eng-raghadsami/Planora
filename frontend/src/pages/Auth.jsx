import { useState } from "react";
import { FaArrowRight, FaCheckCircle, FaLock, FaUserPlus } from "react-icons/fa";
import Logo from "../components/Logo";
import { loginUser, registerUser } from "../api";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
};

export default function Auth({ mode = "login", onAuthSuccess, onGoHome, onSwitchMode }) {
  const [authMode, setAuthMode] = useState(mode);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isRegister = authMode === "register";

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function switchMode(nextMode) {
    setAuthMode(nextMode);
    setForm(emptyForm);
    setError("");
    onSwitchMode?.(nextMode);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = isRegister
        ? await registerUser(form)
        : await loginUser({ email: form.email, password: form.password });
      onAuthSuccess(payload.user);
    } catch (err) {
      setError(err?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <header className="auth-header">
        <Logo onClick={onGoHome} />
        <button className="outline-auth-btn" onClick={onGoHome}>Back Home</button>
      </header>

      <section className="auth-shell">
        <div className="auth-panel">
          <div className="auth-copy">
            <p className="eyebrow">PLANORA ACCOUNT</p>
            <h1>{isRegister ? "Create your workspace" : "Welcome back"}</h1>
            <p>
              Sign in to keep your plans, scenarios, and pricing choices connected to your account.
            </p>

            <div className="auth-benefits">
              <span><FaCheckCircle /> Save every simulation</span>
              <span><FaCheckCircle /> Reopen dashboards anytime</span>
              <span><FaCheckCircle /> Keep AI insights connected</span>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-form-heading">
              <p>{isRegister ? "New account" : "Secure access"}</p>
              <h2>{isRegister ? "Start planning with Planora" : "Login to continue"}</h2>
            </div>

            <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
              <button
                type="button"
                className={!isRegister ? "active" : ""}
                onClick={() => switchMode("login")}
              >
                <FaLock /> Login
              </button>
              <button
                type="button"
                className={isRegister ? "active" : ""}
                onClick={() => switchMode("register")}
              >
                <FaUserPlus /> Register
              </button>
            </div>

            {isRegister ? (
              <label>
                Full name
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="Raghad Sami"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                />
              </label>
            ) : null}

            <label>
              Email address
              <input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={8}
                placeholder={isRegister ? "Create at least 8 characters" : "Enter your password"}
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                required
              />
            </label>

            {isRegister ? (
              <label>
                Confirm password
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  placeholder="Repeat your password"
                  value={form.password_confirmation}
                  onChange={(event) => updateField("password_confirmation", event.target.value)}
                  required
                />
              </label>
            ) : null}

            {error ? <p className="auth-error">{error}</p> : null}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
              {!loading ? <FaArrowRight /> : null}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
