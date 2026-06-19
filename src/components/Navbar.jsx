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

      <button className="primary-btn" onClick={onGoPricing || onStartSimulation}>
        View Pricing
      </button>
    </header>
  );
}
