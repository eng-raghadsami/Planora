import Logo from "./Logo";

export default function Navbar({
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
  onGoPricing,
  onGoAuth,
  onLogout,
  user,
}) {
  return (
    <header className="navbar">
      <Logo onClick={onGoHome} />

      <nav className="nav-links">
        <button onClick={onGoHome}>Home</button>
        <button onClick={onGoFeatures}>Features</button>
        <button onClick={onGoHowItWorks || onGoFeatures}>How It Works</button>
        <button onClick={onGoUseCases || onGoAbout}>Use Cases</button>
        <button onClick={onGoFaq || onGoAbout}>FAQ</button>
        <button onClick={onGoAbout}>About</button>
      </nav>

      <div className="nav-actions">
        {user ? (
          <>
            <span className="nav-user">Hi, {user.name}</span>
            <button className="outline-nav-btn" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <button className="outline-nav-btn" onClick={() => onGoAuth?.("login")}>Login</button>
        )}

        <button className="primary-btn" onClick={onGoPricing || onStartSimulation}>
          View Pricing
        </button>
      </div>
    </header>
  );
}
