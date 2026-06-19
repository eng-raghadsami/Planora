import { useEffect, useState } from "react";
import { FaArrowRight, FaChartPie, FaArrowUp, FaDollarSign, FaCogs, FaUsers, FaClock, FaHandshake } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Feature from "../components/Feature";
import { getHomeContent } from "../api";
import { formatCurrency } from "../lib/planning";

const FEATURE_ICONS = {
  chart: <FaChartPie />,
  growth: <FaArrowUp />,
  cash: <FaDollarSign />,
  cogs: <FaCogs />,
};

export default function Home({
  setPage,
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
  onGoPricing,
}) {
  const [plannerMode, setPlannerMode] = useState("balance");
  const [reservePercent, setReservePercent] = useState(36);
  const [expenseControl, setExpenseControl] = useState(20);
  const [activeFlowStep, setActiveFlowStep] = useState(1);
  const [openFaq, setOpenFaq] = useState(1);
  const [spotlight, setSpotlight] = useState({ x: 40, y: 45 });
  const [content, setContent] = useState(null);
  const plannerPreview = content?.planner_preview;
  const plannerModes = plannerPreview?.modes ?? {};
  const activePlanner = plannerModes[plannerMode];
  const safeReserve = Math.max(10, Math.min(80, Number(reservePercent) || 10));
  const safeControl = Math.max(0, Math.min(45, Number(expenseControl) || 0));
  const balanceTarget = Math.round(Number(plannerPreview?.base_balance ?? 0) * (safeReserve / 100) * Number(activePlanner?.balance_factor ?? 1));
  const adjustedMonthlyBurn = Math.round(Number(plannerPreview?.base_burn ?? 0) * (1 - safeControl / 100) * Number(activePlanner?.burn_factor ?? 1));
  const runwayMonths = Math.max(1, Math.round(balanceTarget / Math.max(Number(plannerPreview?.minimum_burn ?? 1), adjustedMonthlyBurn || 1)));
  const flowSteps = content?.flow_steps ?? [];
  const activeStepContent = flowSteps.find((step) => step.id === activeFlowStep) || flowSteps[0];
  const faqs = content?.faqs ?? [];
  const features = content?.features ?? [];
  const useCases = content?.use_cases ?? [];

  useEffect(() => {
    let active = true;

    getHomeContent()
      .then((payload) => {
        if (active) {
          setContent(payload);
          setPlannerMode(Object.keys(payload.planner_preview?.modes ?? {})[0] ?? "balance");
          setActiveFlowStep(payload.flow_steps?.[0]?.id ?? 1);
          setOpenFaq(payload.faqs?.[0]?.id ?? 1);
        }
      })
      .catch((err) => console.error(err));

    return () => {
      active = false;
    };
  }, []);

  function handleHeroMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setSpotlight({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }

  return (
    <main className="page home-page">
      <Navbar
        onGoHome={onGoHome}
        onGoFeatures={onGoFeatures}
        onGoHowItWorks={onGoHowItWorks}
        onGoUseCases={onGoUseCases}
        onGoFaq={onGoFaq}
        onGoAbout={onGoAbout}
        onStartSimulation={onStartSimulation}
        onGoPricing={onGoPricing}
      />

      <section
        className="hero-section interactive-hero"
        onMouseMove={handleHeroMouseMove}
        style={{
          "--spot-x": `${spotlight.x}%`,
          "--spot-y": `${spotlight.y}%`,
        }}
      >
        <div className="hero-text">
          <p className="eyebrow">SMART BUSINESS PLANNING</p>
          <h1>Plan Smarter Before You Spend a Single Dollar</h1>
          <p>
            Build realistic scenarios, preview cash flow movement, and make confident launch decisions.
          </p>
          <button className="primary-btn large" onClick={onStartSimulation}>
            Start Now <FaArrowRight style={{ marginLeft: 10 }} />
          </button>

          <div className="home-live-strip">
            <span>Live Planning Preview</span>
            <span>Risk-aware scenarios</span>
            <span>AI-backed recommendations</span>
          </div>
        </div>

        <div className="hero-visual-stack">
          <div className="hero-balance-lab" aria-label="interactive save balance adjust panel">
            <div className="hero-lab-header">
              <strong>Save Balance Adjust</strong>
              <small>Interactive runway preview</small>
            </div>

            <div className="planner-mode-tabs">
              {Object.entries(plannerModes).map(([mode, config]) => (
                <button
                  key={mode}
                  type="button"
                  className={plannerMode === mode ? "active" : ""}
                  onClick={() => setPlannerMode(mode)}
                >
                  {config.label}
                </button>
              ))}
            </div>

            <div className="planner-sliders">
              <label htmlFor="reserve-range">
                Reserve target
                <span>{safeReserve}%</span>
              </label>
              <input
                id="reserve-range"
                type="range"
                min="10"
                max="80"
                value={safeReserve}
                onChange={(event) => setReservePercent(event.target.value)}
              />
              <label htmlFor="control-range">
                Expense control
                <span>{safeControl}%</span>
              </label>
              <input
                id="control-range"
                type="range"
                min="0"
                max="45"
                value={safeControl}
                onChange={(event) => setExpenseControl(event.target.value)}
              />
            </div>

            <div className="planner-kpis">
              <article>
                <small>Target Balance</small>
                <strong>{formatCurrency(balanceTarget)}</strong>
              </article>
              <article>
                <small>Monthly Burn</small>
                <strong>{formatCurrency(adjustedMonthlyBurn)}</strong>
              </article>
              <article>
                <small>Runway</small>
                <strong>{runwayMonths} mo</strong>
              </article>
            </div>

            <svg className="planner-graph" viewBox="0 0 176 110">
              <polyline points={activePlanner?.points ?? ""} />
              <circle cx="8" cy="98" r="4" />
              <circle cx="168" cy={plannerMode === "save" ? "46" : plannerMode === "balance" ? "58" : "72"} r="5" />
            </svg>

            <p className="planner-tip">
              {plannerMode === "save"
                ? "Save mode prioritizes cash protection and longer runway."
                : plannerMode === "balance"
                ? "Balance mode keeps steady growth with controlled burn."
                : "Adjust mode favors flexibility when market conditions shift."}
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <h2>Powerful Features</h2>
        <div className="features-grid">
          {features.map((feature) => (
            <Feature
              key={feature.title}
              icon={FEATURE_ICONS[feature.icon] ?? <FaCogs />}
              title={feature.title}
              text={feature.text}
            />
          ))}
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-grid">
          <div className="about-left">
            <h2>About Planora</h2>
            <p className="lead">We help founders and freelancers validate business ideas with fast, reliable financial simulations so you can launch confidently and reduce risk.</p>

            <ul className="about-list">
              <li>Realistic cash-flow simulations based on your inputs</li>
              <li>Clear break-even analysis and profit forecasts</li>
              <li>Actionable AI recommendations to improve margins</li>
            </ul>

            <div className="about-cta">
              <button className="outline-btn" onClick={() => setPage("pricing")}>
                View Pricing
              </button>
            </div>
          </div>

          <aside className="about-right">
            <div className="stat-card">
              <FaUsers className="stat-icon" />
              <div>
                <strong>10k+</strong>
                <p>Users helped</p>
              </div>
            </div>

            <div className="stat-card">
              <FaClock className="stat-icon" />
              <div>
                <strong>Instant</strong>
                <p>Simulations in seconds</p>
              </div>
            </div>

            <div className="stat-card">
              <FaHandshake className="stat-icon" />
              <div>
                <strong>Trusted</strong>
                <p>By small businesses</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="how-it-works" className="flow-section">
        <h2>How Planora Works</h2>
        <div className="flow-step-tabs">
          {flowSteps.map((step) => (
            <button
              key={`flow-step-${step.id}`}
              type="button"
              className={activeFlowStep === step.id ? "active" : ""}
              onClick={() => setActiveFlowStep(step.id)}
            >
              {step.id}. {step.title}
            </button>
          ))}
        </div>
        <div className="flow-panel">
          <h3>{activeStepContent?.title}</h3>
          <p>{activeStepContent?.text}</p>
        </div>
      </section>

      <section id="use-cases" className="use-cases-section">
        <h2>Built For Real Founders</h2>
        <div className="use-cases-grid">
          {useCases.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((item) => (
            <article key={`faq-${item.id}`} className={`faq-item ${openFaq === item.id ? "open" : ""}`}>
              <button type="button" onClick={() => setOpenFaq(item.id)}>
                <strong>{item.q}</strong>
                <span>{openFaq === item.id ? "-" : "+"}</span>
              </button>
              {openFaq === item.id ? <p>{item.a}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
