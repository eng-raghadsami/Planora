import { useEffect, useState } from "react";
import "./App.css";

import {
  FaChartPie,
  FaArrowUp,
  FaDollarSign,
  FaCogs,
  FaStar,
  FaDownload,
  FaArrowRight,
  FaArrowLeft,
  FaUsers,
  FaClock,
  FaHandshake,
} from "react-icons/fa";
import logoPng from "./assets/logo.png";
import { simulate, getScenarios, getAI } from "./api";

const BUSINESS_DEFAULTS = {
  "Retail Store": { employees: 6, monthlyCosts: 3000, projectSize: "Small", seasonalityProfile: "summer_up_winter_down" },
  Cafe: { employees: 8, monthlyCosts: 2500, projectSize: "Medium", seasonalityProfile: "summer_down_winter_up" },
  "Online Business": { employees: 4, monthlyCosts: 1400, projectSize: "Small", seasonalityProfile: "flat" },
  "Freelance Service": { employees: 2, monthlyCosts: 900, projectSize: "Small", seasonalityProfile: "flat" },
};

const LOCATION_DEFAULT_PROFILE = {
  costFactor: 1,
  salesFactor: 1,
  volatilityAdjust: 0,
  rentRange: [700, 1300],
  avgSalary: 600,
};

const LOCATION_PROFILES = {
  Palestine: {
    Gaza: { costFactor: 0.88, salesFactor: 0.87, volatilityAdjust: 4, rentRange: [500, 850], avgSalary: 420 },
    Ramallah: { costFactor: 1.06, salesFactor: 1.11, volatilityAdjust: -1, rentRange: [950, 1600], avgSalary: 850 },
    Nablus: { costFactor: 0.95, salesFactor: 0.98, volatilityAdjust: 1, rentRange: [700, 1200], avgSalary: 620 },
  },
  Jordan: {
    Amman: { costFactor: 1.1, salesFactor: 1.12, volatilityAdjust: -1, rentRange: [1100, 1900], avgSalary: 920 },
    Irbid: { costFactor: 0.93, salesFactor: 0.94, volatilityAdjust: 1, rentRange: [650, 1050], avgSalary: 560 },
  },
  Egypt: {
    Cairo: { costFactor: 1.02, salesFactor: 1.03, volatilityAdjust: 0, rentRange: [900, 1700], avgSalary: 760 },
    Alexandria: { costFactor: 0.97, salesFactor: 0.99, volatilityAdjust: 1, rentRange: [780, 1350], avgSalary: 660 },
  },
};

const initialForm = {
  businessType: "Cafe",
  country: "Palestine",
  city: "Gaza",
  initialInvestment: 50000,
  monthlySales: 21000,
  monthlyCosts: 2500,
  advancedMode: false,
  growthExpectation: "slow",
  seasonalityDependence: "low",
  marketingPlan: "regular",
  unexpectedCosts: "low",
  marketStability: "moderate",
  salesConfidence: "medium",
};

function getCountryOptions() {
  return Object.keys(LOCATION_PROFILES);
}

function getCityOptions(country) {
  const countryProfile = LOCATION_PROFILES[country];
  if (!countryProfile) {
    return Object.keys(LOCATION_PROFILES.Palestine);
  }
  return Object.keys(countryProfile);
}

function getLocationProfile(country, city) {
  return LOCATION_PROFILES[country]?.[city] || LOCATION_DEFAULT_PROFILE;
}

function getLocationLabel(country, city) {
  return `${city}, ${country}`;
}

function riskLevelToScore(riskLevel) {
  if (String(riskLevel).toLowerCase() === "high") {
    return 3;
  }
  if (String(riskLevel).toLowerCase() === "medium") {
    return 2;
  }
  return 1;
}

function scoreToRiskLevel(score) {
  if (score >= 2.5) {
    return "High";
  }
  if (score >= 1.5) {
    return "Medium";
  }
  return "Low";
}

function buildLocationComparison(input) {
  const {
    country,
    baseCity,
    compareCity,
    monthlySales,
    monthlyCosts,
    baseRiskLevel,
  } = input;

  if (!compareCity) {
    return null;
  }

  const baseProfile = getLocationProfile(country, baseCity);
  const compareProfile = getLocationProfile(country, compareCity);
  const safeSales = Math.max(0, Number(monthlySales) || 0);
  const safeCosts = Math.max(0, Number(monthlyCosts) || 0);

  const baseRow = {
    city: baseCity,
    monthlySales: safeSales,
    monthlyCosts: safeCosts,
    monthlyProfit: safeSales - safeCosts,
    riskLevel: formatRisk(baseRiskLevel),
  };

  const salesFactor = compareProfile.salesFactor / Math.max(baseProfile.salesFactor, 0.01);
  const costsFactor = compareProfile.costFactor / Math.max(baseProfile.costFactor, 0.01);
  const compareSales = safeSales * salesFactor;
  const compareCosts = safeCosts * costsFactor;
  const compareRiskScore = Math.max(1, Math.min(3, riskLevelToScore(baseRiskLevel) + (compareProfile.volatilityAdjust - baseProfile.volatilityAdjust) / 3));

  const compareRow = {
    city: compareCity,
    monthlySales: compareSales,
    monthlyCosts: compareCosts,
    monthlyProfit: compareSales - compareCosts,
    riskLevel: scoreToRiskLevel(compareRiskScore),
  };

  const betterLocation = compareRow.monthlyProfit > baseRow.monthlyProfit ? compareRow.city : baseRow.city;

  return { baseRow, compareRow, betterLocation };
}

function projectSizeFromCapital(capital) {
  if (capital >= 120000) {
    return "large";
  }
  if (capital >= 55000) {
    return "medium";
  }
  return "small";
}

function mapGrowthExpectation(value) {
  if (value === "fast") {
    return 2.0;
  }
  if (value === "none") {
    return 0;
  }
  return 1.0;
}

function mapSeasonalitySettings(dependence, businessType) {
  if (dependence === "none") {
    return { profile: "flat", strength: 0 };
  }

  const fallbackProfile = BUSINESS_DEFAULTS[businessType]?.seasonalityProfile || "flat";
  const strength = dependence === "high" ? 22 : 12;

  return { profile: fallbackProfile, strength };
}

function mapMarketStability(value) {
  if (value === "stable") {
    return 6;
  }
  if (value === "unstable") {
    return 20;
  }
  return 12;
}

function mapSalesConfidenceAdjust(value) {
  if (value === "low") {
    return 4;
  }
  if (value === "high") {
    return -3;
  }
  return 0;
}

function mapMarketingPlan(value) {
  if (value === "none") {
    return { month: null, boost: 0 };
  }
  if (value === "strong") {
    return { month: 11, boost: 24 };
  }
  return { month: 11, boost: 14 };
}

function mapUnexpectedCosts(value) {
  if (value === "none") {
    return { month: null, amount: 0 };
  }
  if (value === "high") {
    return { month: 7, amount: 5500 };
  }
  return { month: 7, amount: 2500 };
}

function getValidationErrors(formData) {
  const errors = {};
  const investment = Number(formData.initialInvestment);
  const sales = Number(formData.monthlySales);
  const costs = Number(formData.monthlyCosts);

  if (!Number.isFinite(investment) || investment < 1000 || investment > 5000000) {
    errors.initialInvestment = "Initial investment should be between 1,000 and 5,000,000.";
  }
  if (!Number.isFinite(sales) || sales < 500 || sales > 2000000) {
    errors.monthlySales = "Expected monthly sales should be between 500 and 2,000,000.";
  }
  if (!Number.isFinite(costs) || costs < 100 || costs > 1500000) {
    errors.monthlyCosts = "Monthly costs should be between 100 and 1,500,000.";
  }
  if (Number.isFinite(sales) && Number.isFinite(costs) && costs > sales * 2.5) {
    errors.monthlyCosts = "Monthly costs look too high compared to monthly sales.";
  }

  return errors;
}

function buildSimulationPayload(formData) {
  const defaults = BUSINESS_DEFAULTS[formData.businessType] || BUSINESS_DEFAULTS.Cafe;
  const locationProfile = getLocationProfile(formData.country, formData.city);
  const projectSize = projectSizeFromCapital(Number(formData.initialInvestment));
  const employees = defaults.employees;
  const marketing = mapMarketingPlan(formData.marketingPlan);
  const unexpected = mapUnexpectedCosts(formData.unexpectedCosts);
  const seasonality = mapSeasonalitySettings(formData.seasonalityDependence, formData.businessType);

  const baseVolatility = mapMarketStability(formData.marketStability);

  return {
    capital: Number(formData.initialInvestment),
    size: projectSize,
    project_type: `${formData.businessType} (${getLocationLabel(formData.country, formData.city)})`,
    monthly_sales: Number(formData.monthlySales),
    monthly_costs: Number(formData.monthlyCosts),
    employees,
    seasonality_profile: seasonality.profile,
    seasonality_strength_percent: seasonality.strength,
    monthly_growth_percent: mapGrowthExpectation(formData.growthExpectation),
    cost_growth_percent: 0.6,
    volatility_percent: Math.max(0, Math.min(30, baseVolatility + mapSalesConfidenceAdjust(formData.salesConfidence) + locationProfile.volatilityAdjust)),
    shock_month: unexpected.month,
    shock_amount: unexpected.amount,
    campaign_month: marketing.month,
    campaign_boost_percent: marketing.boost,
  };
}

function formatCurrency(value) {
  const amount = Number(value ?? 0);
  return `$${amount.toLocaleString()}`;
}

function formatRisk(riskLevel) {
  if (!riskLevel) {
    return "N/A";
  }

  return String(riskLevel).charAt(0).toUpperCase() + String(riskLevel).slice(1);
}

function seasonalityLabel(value) {
  if (value === "summer_down_winter_up") {
    return "Summer down / Winter up";
  }
  if (value === "summer_up_winter_down") {
    return "Summer up / Winter down";
  }
  return "Flat all year";
}

function buildCashFlowChart(cashFlow = [], zoomLevel = 1) {
  if (!Array.isArray(cashFlow) || cashFlow.length === 0) {
    return null;
  }

  const safeZoom = Math.max(1, Math.min(3, Number(zoomLevel) || 1));
  const xStart = 40;
  const xEnd = 40 + 460 * safeZoom;
  const yTop = 20;
  const yBottom = 220;

  const balances = cashFlow.map((item) => Number(item.balance ?? 0));
  let minBalance = Math.min(...balances, 0);
  let maxBalance = Math.max(...balances, 0);

  if (maxBalance === minBalance) {
    maxBalance = minBalance + 1;
  }

  const points = cashFlow.map((item, index) => {
    const x =
      cashFlow.length === 1
        ? (xStart + xEnd) / 2
        : xStart + (index / (cashFlow.length - 1)) * (xEnd - xStart);

    const balance = Number(item.balance ?? 0);
    const ratio = (balance - minBalance) / (maxBalance - minBalance);
    const y = yBottom - ratio * (yBottom - yTop);

    return { x, y };
  });

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];
  const areaPoints = `${linePoints} ${last.x},${yBottom} ${first.x},${yBottom}`;

  return { points, linePoints, areaPoints, viewWidth: Math.ceil(xEnd + 20) };
}

function getSeasonalityReason(month, profile) {
  const monthOfYear = ((month - 1) % 12) + 1;
  const isSummer = [6, 7, 8].includes(monthOfYear);
  const isWinter = [12, 1, 2].includes(monthOfYear);

  if (profile === "summer_down_winter_up" && isSummer) {
    return "Summer season dip";
  }
  if (profile === "summer_down_winter_up" && isWinter) {
    return "Winter season boost";
  }
  if (profile === "summer_up_winter_down" && isSummer) {
    return "Summer season boost";
  }
  if (profile === "summer_up_winter_down" && isWinter) {
    return "Winter season dip";
  }

  return "";
}

function getCashFlowReasons(month, breakdown = {}) {
  const reasons = [];
  const seasonalityReason = getSeasonalityReason(month, breakdown.seasonality_profile);

  if (seasonalityReason) {
    reasons.push(seasonalityReason);
  }
  if (Number(breakdown.shock_month) === month && Number(breakdown.shock_amount) > 0) {
    reasons.push("Unexpected cost hit");
  }
  if (Number(breakdown.campaign_month) === month && Number(breakdown.campaign_boost_percent) > 0) {
    reasons.push("Marketing campaign effect");
  }

  if (reasons.length === 0) {
    reasons.push("Normal operations");
  }

  return reasons;
}

function getCostItems(breakdown = {}) {
  return [
    { key: "rent", label: "Rent", value: Number(breakdown.rent ?? 0), color: "#2d86df", dotClass: "blue" },
    { key: "staff", label: "Staff Setup", value: Number(breakdown.staff ?? 0), color: "#18a878", dotClass: "green" },
    { key: "equipment", label: "Equipment", value: Number(breakdown.equipment ?? 0), color: "#ffd158", dotClass: "yellow" },
    { key: "marketing", label: "Marketing", value: Number(breakdown.marketing ?? 0), color: "#a365e8", dotClass: "purple" },
  ];
}

function buildDonutGradient(costItems) {
  const total = costItems.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) {
    return "conic-gradient(#e7eef9 0 100%)";
  }

  let current = 0;
  const ranges = costItems.map((item) => {
    const start = current;
    const span = (item.value / total) * 100;
    current += span;
    return `${item.color} ${start}% ${current}%`;
  });

  return `conic-gradient(${ranges.join(",")})`;
}

function Logo({ onClick }) {
  return (
    <button type="button" className="logo logo-btn" onClick={onClick} aria-label="Go to home page">
      <div className="logo-img-wrap">
        <img src={logoPng} alt="Planora" className="logo-img" />
      </div>
      <span className="logo-text">Planora</span>
    </button>
  );
}

function Navbar({
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
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

      <button className="primary-btn" onClick={onStartSimulation}>
        Start Simulation
      </button>
    </header>
  );
}

function Home({
  setPage,
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
}) {
  const [plannerMode, setPlannerMode] = useState("balance");
  const [reservePercent, setReservePercent] = useState(36);
  const [expenseControl, setExpenseControl] = useState(20);
  const [activeFlowStep, setActiveFlowStep] = useState(1);
  const [openFaq, setOpenFaq] = useState(1);
  const [spotlight, setSpotlight] = useState({ x: 40, y: 45 });
  const plannerModes = {
    save: { label: "Save", balanceFactor: 1.2, burnFactor: 0.9, points: "8,98 40,87 72,81 104,70 136,57 168,46" },
    balance: { label: "Balance", balanceFactor: 1.0, burnFactor: 1.0, points: "8,96 40,85 72,84 104,72 136,66 168,58" },
    adjust: { label: "Adjust", balanceFactor: 0.88, burnFactor: 1.08, points: "8,97 40,90 72,89 104,82 136,77 168,72" },
  };
  const activePlanner = plannerModes[plannerMode];
  const safeReserve = Math.max(10, Math.min(80, Number(reservePercent) || 10));
  const safeControl = Math.max(0, Math.min(45, Number(expenseControl) || 0));
  const balanceTarget = Math.round(70000 * (safeReserve / 100) * activePlanner.balanceFactor);
  const adjustedMonthlyBurn = Math.round(6200 * (1 - safeControl / 100) * activePlanner.burnFactor);
  const runwayMonths = Math.max(1, Math.round(balanceTarget / Math.max(1400, adjustedMonthlyBurn)));
  const flowSteps = [
    {
      id: 1,
      title: "Input Essentials",
      text: "Add your investment, expected sales, and monthly costs in less than a minute.",
    },
    {
      id: 2,
      title: "Stress-Test Scenarios",
      text: "Simulate seasonality, risk, and unexpected costs to avoid blind spots.",
    },
    {
      id: 3,
      title: "Decide With Confidence",
      text: "Use AI-backed recommendations and monthly visibility before spending money.",
    },
  ];
  const activeStepContent = flowSteps.find((step) => step.id === activeFlowStep) || flowSteps[0];
  const faqs = [
    {
      id: 1,
      q: "Can I use Planora if I only have rough numbers?",
      a: "Yes. The simulation is designed for quick estimates first, then refinement as your numbers become clearer.",
    },
    {
      id: 2,
      q: "Does Planora handle risky or seasonal businesses?",
      a: "Yes. You can model seasonality, volatility, marketing impact, and surprise costs to mimic real-world movement.",
    },
    {
      id: 3,
      q: "What if my business type is not listed exactly?",
      a: "Choose the closest type. Planora still lets you customize all important assumptions and stress scenarios.",
    },
  ];

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
              <button
                type="button"
                className={plannerMode === "save" ? "active" : ""}
                onClick={() => setPlannerMode("save")}
              >
                Save
              </button>
              <button
                type="button"
                className={plannerMode === "balance" ? "active" : ""}
                onClick={() => setPlannerMode("balance")}
              >
                Balance
              </button>
              <button
                type="button"
                className={plannerMode === "adjust" ? "active" : ""}
                onClick={() => setPlannerMode("adjust")}
              >
                Adjust
              </button>
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
              <polyline points={activePlanner.points} />
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
          <Feature icon={<FaChartPie />} title="Cost Breakdown" text="Understand and categorize expenses." />
          <Feature icon={<FaArrowUp />} title="Profit Prediction" text="Forecast revenues and profits." />
          <Feature icon={<FaDollarSign />} title="Cash Flow Simulation" text="Visualize your future cash flow." />
          <Feature icon={<FaCogs />} title="AI Insights" text="Get actionable recommendations." />
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
          <h3>{activeStepContent.title}</h3>
          <p>{activeStepContent.text}</p>
        </div>
      </section>

      <section id="use-cases" className="use-cases-section">
        <h2>Built For Real Founders</h2>
        <div className="use-cases-grid">
          <article>
            <h3>New Cafe Launch</h3>
            <p>Estimate break-even timing before signing a rental contract.</p>
          </article>
          <article>
            <h3>Retail Expansion</h3>
            <p>Compare best/worst case months before opening the second branch.</p>
          </article>
          <article>
            <h3>Freelancer Studio</h3>
            <p>Plan monthly runway and protect against unstable demand periods.</p>
          </article>
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

function Feature({ icon, title, text }) {
  return (
    <article className="feature-card">
      <span className="feature-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function HintLabel({ text, hint }) {
  return (
    <span className="label-row">
      {text}
      <span className="help-icon" title={hint} aria-label={hint}>i</span>
    </span>
  );
}

function Simulation({
  setPage,
  formData,
  setFormData,
  calculateResults,
  loading,
  error,
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
}) {
  const validationErrors = getValidationErrors(formData);
  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const defaults = BUSINESS_DEFAULTS[formData.businessType] || BUSINESS_DEFAULTS.Cafe;
  const cityOptions = getCityOptions(formData.country);
  const locationProfile = getLocationProfile(formData.country, formData.city);
  const suggestedCosts = Math.round(defaults.monthlyCosts * locationProfile.costFactor);
  const basicComplete = !hasValidationErrors;
  const advancedComplete = formData.advancedMode
    ? Boolean(formData.growthExpectation && formData.seasonalityDependence && formData.marketStability)
    : true;
  const stepTwoActive = basicComplete;
  const stepThreeComplete = basicComplete && advancedComplete;

  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function applySmartSuggestions() {
    setFormData((prev) => ({
      ...prev,
      monthlyCosts: suggestedCosts,
    }));
  }

  async function runSimulation() {
    if (hasValidationErrors) {
      return;
    }
    const success = await calculateResults();
    if (success) {
      setPage("dashboard");
    }
  }

  return (
    <main className="page simulation-page">
      <Navbar
        onGoHome={onGoHome}
        onGoFeatures={onGoFeatures}
        onGoHowItWorks={onGoHowItWorks}
        onGoUseCases={onGoUseCases}
        onGoFaq={onGoFaq}
        onGoAbout={onGoAbout}
        onStartSimulation={onStartSimulation}
      />

      <section className="simulation-card">
        <div className="page-heading">
          <div>
            <h1>New Simulation</h1>
            <p>Enter your project details to run a simulation</p>
          </div>

          <button className="upgrade-btn" onClick={() => setPage("pricing")}>
            <FaStar style={{ marginRight: 8 }} /> Upgrade Plan
          </button>
        </div>

        <div className="steps">
          <span className={`step ${basicComplete ? "done" : "active"}`}>1</span>
          <strong>Basic Info</strong>
          <i></i>
          <span className={`step ${stepTwoActive ? "active" : ""}`}>2</span>
          <i></i>
          <span className={`step ${stepThreeComplete ? "done green" : ""}`}>3</span>
        </div>

        <section className="form-section">
          <h2>Basic Mode</h2>
          <div className="form-grid">
            <label>
              <HintLabel text="Business Type" hint="Choose the closest type to your project so we can suggest more realistic defaults." />
              <select
                value={formData.businessType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    businessType: e.target.value,
                  }))
                }
              >
                <option>Retail Store</option>
                <option>Cafe</option>
                <option>Online Business</option>
                <option>Freelance Service</option>
              </select>
            </label>

            <label>
              <HintLabel text="Country" hint="Choose where your project will run. Example: Palestine." />
              <select
                value={formData.country}
                onChange={(e) => {
                  const nextCountry = e.target.value;
                  const firstCity = getCityOptions(nextCountry)[0];
                  setFormData((prev) => ({
                    ...prev,
                    country: nextCountry,
                    city: firstCity,
                  }));
                }}
              >
                {getCountryOptions().map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <HintLabel text="City" hint="Pick your target city. Example: Gaza." />
              <select
                value={formData.city}
                onChange={(e) => updateField("city", e.target.value)}
              >
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <div className="smart-box">
              <p><b>Smart Suggestion:</b> For {formData.businessType} in {formData.city}, typical fixed costs start around {formatCurrency(suggestedCosts)} and average team size is {defaults.employees}.</p>
              <p><b>Local signal:</b> Typical rent range in {formData.city} is {formatCurrency(locationProfile.rentRange[0])} to {formatCurrency(locationProfile.rentRange[1])}, and average salary is around {formatCurrency(locationProfile.avgSalary)}.</p>
              <button type="button" className="outline-btn" onClick={applySmartSuggestions}>
                Use Suggested Costs
              </button>
            </div>
            <label>
              <HintLabel text="Initial Investment ($)" hint="How much money will you put in at the beginning? Rough estimate is enough." />
              <input
                type="number"
                placeholder="e.g. 50000"
                value={formData.initialInvestment}
                onChange={(e) => updateField("initialInvestment", Number(e.target.value))}
              />
              {validationErrors.initialInvestment ? <small className="field-error">{validationErrors.initialInvestment}</small> : null}
            </label>

            <label>
              <HintLabel text="Expected Monthly Sales ($)" hint="How much do you expect to sell per month?" />
              <input
                type="number"
                placeholder="e.g. 20000"
                value={formData.monthlySales}
                onChange={(e) => updateField("monthlySales", Number(e.target.value))}
              />
              {validationErrors.monthlySales ? <small className="field-error">{validationErrors.monthlySales}</small> : null}
            </label>

            <label>
              <HintLabel text="Monthly Costs ($)" hint="Rent, salaries, bills, and running expenses per month." />
              <input
                type="number"
                placeholder="e.g. 8000"
                value={formData.monthlyCosts}
                onChange={(e) => updateField("monthlyCosts", Number(e.target.value))}
              />
              {validationErrors.monthlyCosts ? <small className="field-error">{validationErrors.monthlyCosts}</small> : null}
            </label>
          </div>
        </section>

        <button
          type="button"
          className="advanced-toggle"
          onClick={() => updateField("advancedMode", !formData.advancedMode)}
        >
          {formData.advancedMode ? "Hide Advanced Settings" : "More Advanced Settings"}
        </button>

        {formData.advancedMode ? (
          <section className="form-section">
            <h2>Advanced Mode</h2>
            <div className="form-grid">
              <label>
                <HintLabel text="Do you expect your sales to grow over time?" hint="Example: choose Slow growth if you expect steady sales increase over the year." />
                <select
                  value={formData.growthExpectation}
                  onChange={(e) => updateField("growthExpectation", e.target.value)}
                >
                  <option value="none">No</option>
                  <option value="slow">Slow growth</option>
                  <option value="fast">Fast growth</option>
                </select>
              </label>

              <label>
                <HintLabel text="Does your business depend on seasons?" hint="Example: tourism and cafes may rise in one season and drop in another." />
                <select
                  value={formData.seasonalityDependence}
                  onChange={(e) => updateField("seasonalityDependence", e.target.value)}
                >
                  <option value="none">No</option>
                  <option value="low">A little</option>
                  <option value="high">A lot</option>
                </select>
              </label>

              <label>
                <HintLabel text="Is your market predictable or changing a lot?" hint="Example: predictable demand = stable, frequent swings = unstable." />
                <select
                  value={formData.marketStability}
                  onChange={(e) => updateField("marketStability", e.target.value)}
                >
                  <option value="stable">Stable</option>
                  <option value="moderate">Moderate</option>
                  <option value="unstable">Unstable</option>
                </select>
              </label>

              <label>
                <HintLabel text="How sure are you about your sales estimate?" hint="Example: if your estimate is still rough, choose Low confidence." />
                <select
                  value={formData.salesConfidence}
                  onChange={(e) => updateField("salesConfidence", e.target.value)}
                >
                  <option value="high">High confidence</option>
                  <option value="medium">Medium confidence</option>
                  <option value="low">Low confidence</option>
                </select>
              </label>

              <label>
                <HintLabel text="Marketing effort level" hint="Example: a strong launch campaign can create a short-term sales spike." />
                <select
                  value={formData.marketingPlan}
                  onChange={(e) => updateField("marketingPlan", e.target.value)}
                >
                  <option value="none">No marketing campaign</option>
                  <option value="regular">Regular campaign</option>
                  <option value="strong">Strong campaign</option>
                </select>
              </label>

              <label>
                <HintLabel text="Unexpected costs risk" hint="Example: maintenance, legal fees, or urgent fixes can appear suddenly." />
                <select
                  value={formData.unexpectedCosts}
                  onChange={(e) => updateField("unexpectedCosts", e.target.value)}
                >
                  <option value="none">No major surprises</option>
                  <option value="low">Some surprises</option>
                  <option value="high">High chance of surprises</option>
                </select>
              </label>
            </div>
          </section>
        ) : null}

        {hasValidationErrors ? <p className="error-text">Please fix highlighted fields before running simulation.</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <button className="run-btn" type="button" onClick={runSimulation} disabled={loading || hasValidationErrors}>
          {loading ? "Running..." : "Run Simulation"} {!loading ? <FaArrowRight style={{ marginLeft: 10 }} /> : null}
        </button>
      </section>
    </main>
  );
}

function Dashboard({
  setPage,
  results,
  scenarioData,
  aiData,
  formData,
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [hoveredCostKey, setHoveredCostKey] = useState(null);
  const [showLocationCompare, setShowLocationCompare] = useState(false);
  const activeCountry = formData?.country || initialForm.country;
  const activeCity = formData?.city || initialForm.city;
  const compareCandidates = getCityOptions(activeCountry).filter((city) => city !== activeCity);
  const [selectedCompareCity, setSelectedCompareCity] = useState("");
  const compareCity = compareCandidates.includes(selectedCompareCity)
    ? selectedCompareCity
    : (compareCandidates[0] || "");

  if (!results) {
    return (
      <main className="page dashboard-page">
        <Navbar
          onGoHome={onGoHome}
          onGoFeatures={onGoFeatures}
          onGoHowItWorks={onGoHowItWorks}
          onGoUseCases={onGoUseCases}
          onGoFaq={onGoFaq}
          onGoAbout={onGoAbout}
          onStartSimulation={onStartSimulation}
        />
        <section className="dashboard-card">
          <h1>Results Dashboard</h1>
          <p>No simulation results yet. Please run a simulation first.</p>
        </section>
      </main>
    );
  }

  const breakdown = results.raw?.breakdown ?? {};
  const cashFlow = results.raw?.cash_flow ?? [];
  const chart = buildCashFlowChart(cashFlow, zoomLevel);
  const activeMonth = selectedMonth || cashFlow[cashFlow.length - 1] || null;
  const costItems = getCostItems(breakdown);
  const totalCostValue = costItems.reduce((sum, item) => sum + item.value, 0);
  const activeCostItem = costItems.find((item) => item.key === hoveredCostKey) || null;
  const donutTitle = activeCostItem?.label || "Total";
  const donutValue = activeCostItem ? activeCostItem.value : totalCostValue;

  const lowCase = scenarioData?.low_case;
  const averageCase = scenarioData?.average_case;
  const highCase = scenarioData?.high_case;
  const locationComparison = buildLocationComparison({
    country: activeCountry,
    baseCity: activeCity,
    compareCity,
    monthlySales: formData?.monthlySales,
    monthlyCosts: formData?.monthlyCosts,
    baseRiskLevel: results.raw?.risk_level || aiData?.risk_level || "medium",
  });

  return (
    <main className="page dashboard-page">
      <Navbar
        onGoHome={onGoHome}
        onGoFeatures={onGoFeatures}
        onGoHowItWorks={onGoHowItWorks}
        onGoUseCases={onGoUseCases}
        onGoFaq={onGoFaq}
        onGoAbout={onGoAbout}
        onStartSimulation={onStartSimulation}
      />

      <section className="dashboard-card" id="report-area">
        <div className="dashboard-header">
          <div>
            <h1>Results Dashboard</h1>
            <p>Your simulation results at a glance</p>
          </div>

          <div className="dashboard-actions">
            <button className="outline-btn" onClick={() => window.print()}>
              <FaDownload style={{ marginRight: 8 }} /> Download Report PDF
            </button>
            <button className="upgrade-btn" onClick={() => setPage("pricing")}>
              <FaStar style={{ marginRight: 8 }} /> Upgrade Plan
            </button>
          </div>
        </div>

        <section className="stats-grid">
          <Metric title="Total Setup Cost" value={formatCurrency(results.totalCash)} />
          <Metric title="Monthly Profit" value={formatCurrency(results.monthlyProfit)} green={results.monthlyProfit > 0} />
          <Metric title="Break Even Months" value={results.breakEven ?? "N/A"} />
          <Metric title="Profit Margin" value={`${results.profitMargin}%`} green={Number(results.profitMargin) > 0} />
        </section>

        <section className="charts-grid">
          <div className="chart-card">
            <h2>Cost Breakdown</h2>
            <div className="cost-wrap">
              <div className="donut-chart" style={{ background: buildDonutGradient(costItems) }}>
                <div className="donut-center-info">
                  <small>{donutTitle}</small>
                  <strong>{formatCurrency(donutValue)}</strong>
                </div>
              </div>
              <div className="legend">
                {costItems.map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    className={`legend-item ${hoveredCostKey === item.key ? "active" : ""}`}
                    onMouseEnter={() => setHoveredCostKey(item.key)}
                    onFocus={() => setHoveredCostKey(item.key)}
                    onMouseLeave={() => setHoveredCostKey(null)}
                    onBlur={() => setHoveredCostKey(null)}
                  >
                    <span className={`dot ${item.dotClass}`}></span>
                    {item.label}: {formatCurrency(item.value)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h2>Cash Flow Timeline</h2>
            <div className="chart-toolbar">
              <p>Zoom and hover points to inspect month details</p>
              <div className="zoom-controls">
                <button type="button" onClick={() => setZoomLevel((prev) => Math.max(1, prev - 0.25))}>-</button>
                <span>{zoomLevel.toFixed(2)}x</span>
                <button type="button" onClick={() => setZoomLevel((prev) => Math.min(3, prev + 0.25))}>+</button>
              </div>
            </div>
            <div className="line-chart scrollable-chart">
              {chart ? (
                <svg viewBox={`0 0 ${chart.viewWidth} 230`}>
                  <polygon points={chart.areaPoints} />
                  <polyline points={chart.linePoints} />
                  {chart.points.map((point, index) => (
                    <circle
                      key={`cash-point-${index}`}
                      cx={point.x}
                      cy={point.y}
                      r="7"
                      className={selectedMonth?.month === cashFlow[index]?.month ? "cash-point-active" : ""}
                      onMouseEnter={() => setSelectedMonth(cashFlow[index])}
                      onClick={() => setSelectedMonth(cashFlow[index])}
                    />
                  ))}
                </svg>
              ) : (
                <p>No cash flow data available.</p>
              )}
            </div>
            {activeMonth ? (
              <div className="month-inspector">
                <h3>Month {activeMonth.month}</h3>
                <p>Revenue: {formatCurrency(activeMonth.revenue)}</p>
                <p>Cost: {formatCurrency(activeMonth.cost)}</p>
                <p>Profit: {formatCurrency(activeMonth.profit)}</p>
                <p>Balance: {formatCurrency(activeMonth.balance)}</p>
                <p>Reason: {getCashFlowReasons(activeMonth.month, breakdown).join(" + ")}</p>
              </div>
            ) : null}
          </div>
        </section>

        <section className="scenario-table-section">
          <h2>Scenario Comparison</h2>
          {scenarioData ? (
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Low Case</th>
                  <th>Average Case</th>
                  <th>High Case</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Initial Capital</td>
                  <td>{formatCurrency(lowCase?.initial_capital)}</td>
                  <td>{formatCurrency(averageCase?.initial_capital)}</td>
                  <td>{formatCurrency(highCase?.initial_capital)}</td>
                </tr>
                <tr>
                  <td>Monthly Sales</td>
                  <td className="green-text">{formatCurrency(lowCase?.monthly_sales)}</td>
                  <td className="green-text">{formatCurrency(averageCase?.monthly_sales)}</td>
                  <td className="green-text">{formatCurrency(highCase?.monthly_sales)}</td>
                </tr>
                <tr>
                  <td>Monthly Costs</td>
                  <td>{formatCurrency(lowCase?.monthly_costs)}</td>
                  <td>{formatCurrency(averageCase?.monthly_costs)}</td>
                  <td>{formatCurrency(highCase?.monthly_costs)}</td>
                </tr>
                <tr>
                  <td>Monthly Profit</td>
                  <td>{formatCurrency(lowCase?.monthly_profit)}</td>
                  <td>{formatCurrency(averageCase?.monthly_profit)}</td>
                  <td>{formatCurrency(highCase?.monthly_profit)}</td>
                </tr>
                <tr>
                  <td>Break-even (months)</td>
                  <td>{lowCase?.break_even_months ?? "N/A"}</td>
                  <td>{averageCase?.break_even_months ?? "N/A"}</td>
                  <td>{highCase?.break_even_months ?? "N/A"}</td>
                </tr>
                <tr>
                  <td>Risk Level</td>
                  <td><span className={`risk ${String(lowCase?.risk_level || "").toLowerCase()}`}>{formatRisk(lowCase?.risk_level)}</span></td>
                  <td><span className={`risk ${String(averageCase?.risk_level || "").toLowerCase()}`}>{formatRisk(averageCase?.risk_level)}</span></td>
                  <td><span className={`risk ${String(highCase?.risk_level || "").toLowerCase()}`}>{formatRisk(highCase?.risk_level)}</span></td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>No scenario data available.</p>
          )}
        </section>

        <section className="scenario-table-section">
          <h2>Location Comparison</h2>
          <button
            type="button"
            className="outline-btn"
            onClick={() => setShowLocationCompare((prev) => !prev)}
          >
            {showLocationCompare ? "Hide comparison" : "Compare with another location"}
          </button>
          {showLocationCompare ? (
            compareCandidates.length > 0 ? (
              <>
                <div style={{ marginTop: 12 }}>
                  <label>
                    <HintLabel text="Compare City" hint="We estimate impact on sales, costs, and risk using city profiles." />
                    <select value={compareCity} onChange={(e) => setSelectedCompareCity(e.target.value)}>
                      {compareCandidates.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {locationComparison ? (
                  <>
                    <table style={{ marginTop: 14 }}>
                      <thead>
                        <tr>
                          <th>City</th>
                          <th>Monthly Sales</th>
                          <th>Monthly Costs</th>
                          <th>Monthly Profit</th>
                          <th>Risk</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>{locationComparison.baseRow.city}</td>
                          <td>{formatCurrency(locationComparison.baseRow.monthlySales)}</td>
                          <td>{formatCurrency(locationComparison.baseRow.monthlyCosts)}</td>
                          <td>{formatCurrency(locationComparison.baseRow.monthlyProfit)}</td>
                          <td>{locationComparison.baseRow.riskLevel}</td>
                        </tr>
                        <tr>
                          <td>{locationComparison.compareRow.city}</td>
                          <td>{formatCurrency(locationComparison.compareRow.monthlySales)}</td>
                          <td>{formatCurrency(locationComparison.compareRow.monthlyCosts)}</td>
                          <td>{formatCurrency(locationComparison.compareRow.monthlyProfit)}</td>
                          <td>{locationComparison.compareRow.riskLevel}</td>
                        </tr>
                      </tbody>
                    </table>
                    <p style={{ marginTop: 10 }}>
                      <b>Better location:</b> {locationComparison.betterLocation}
                    </p>
                  </>
                ) : null}
              </>
            ) : (
              <p style={{ marginTop: 10 }}>No alternative cities configured for this country yet.</p>
            )
          ) : null}
        </section>

        <div className="summary-box">
          <p><b>Summary:</b> You will break even in {results.breakEven ?? "N/A"} months, with an estimated monthly profit of {formatCurrency(results.monthlyProfit)}.</p>
          <p><b>Location:</b> {getLocationLabel(activeCountry, activeCity)}</p>
          <p><b>Seasonality:</b> {seasonalityLabel(breakdown.seasonality_profile)} ({breakdown.seasonality_strength_percent ?? 0}%)</p>
          <p><b>AI Analysis:</b> {aiData?.analysis || "AI analysis not available yet."}</p>
        </div>

        <section className="scenario-table-section">
          <h2>Monthly Cash Flow Cards</h2>
          <div className="month-cards-track">
            {cashFlow.map((item) => (
              <button
                type="button"
                key={`month-card-${item.month}`}
                className={`month-card ${activeMonth?.month === item.month ? "active" : ""}`}
                onMouseEnter={() => setSelectedMonth(item)}
                onClick={() => setSelectedMonth(item)}
              >
                <h4>Month {item.month}</h4>
                <p>Revenue: {formatCurrency(item.revenue)}</p>
                <p>Cost: {formatCurrency(item.cost)}</p>
                <p className={Number(item.profit) >= 0 ? "green-text" : "red-text"}>Profit: {formatCurrency(item.profit)}</p>
                <p>Balance: {formatCurrency(item.balance)}</p>
                <small>{getCashFlowReasons(item.month, breakdown).join(" + ")}</small>
              </button>
            ))}
          </div>
        </section>

        <button className="ai-btn" onClick={() => setPage("insights")}>
          Get AI Recommendations <FaArrowRight style={{ marginLeft: 10 }} />
        </button>
      </section>
    </main>
  );
}

function Metric({ title, value, green }) {
  return (
    <article className="metric-card">
      <h3>{title}</h3>
      <strong className={green ? "green-text" : ""}>{value}</strong>
    </article>
  );
}

function buildAdvancedRecommendations(results, aiData) {
  const recs = Array.isArray(aiData?.recommendations) ? aiData.recommendations : [];
  const monthlyProfit = Number(results?.monthlyProfit ?? 0);
  const breakEven = results?.breakEven;

  return [
    {
      title: "Immediate Next Step",
      priority: "High",
      text: recs[0] || (monthlyProfit <= 0 ? "Cut non-essential monthly costs and protect cash runway immediately." : "Track weekly margin and lock what is already working."),
    },
    {
      title: "30-60 Day Focus",
      priority: "Medium",
      text: recs[1] || (breakEven && breakEven > 12 ? "Improve conversion and pricing to reduce break-even period." : "Scale the strongest channel gradually while watching cost growth."),
    },
    {
      title: "Risk Watch",
      priority: "Medium",
      text: recs[2] || "Prepare a contingency budget for seasonal dips and unexpected costs.",
    },
  ];
}

function buildAIPlaybook(results, scenarioData) {
  const monthlyProfit = Number(results?.monthlyProfit ?? 0);
  const breakEven = Number(results?.breakEven ?? 0);
  const lowCaseProfit = Number(scenarioData?.low_case?.monthly_profit ?? 0);
  const highCaseProfit = Number(scenarioData?.high_case?.monthly_profit ?? 0);
  const spread = highCaseProfit - lowCaseProfit;

  return [
    {
      title: "Opportunity Signal",
      tone: "good",
      text: monthlyProfit > 0
        ? `Current plan is profitable (${formatCurrency(monthlyProfit)}/month). Focus on repeatable channels.`
        : "Current setup is not profitable yet. Re-price or reduce operating costs before scaling.",
    },
    {
      title: "Risk Signal",
      tone: spread > Math.max(3000, Math.abs(monthlyProfit) * 0.9) ? "warn" : "neutral",
      text: spread > Math.max(3000, Math.abs(monthlyProfit) * 0.9)
        ? `Scenario spread is high (${formatCurrency(spread)}). Keep extra cash buffer for volatility.`
        : "Scenario spread is moderate. Variance risk is manageable with monthly tracking.",
    },
    {
      title: "Execution Focus",
      tone: breakEven > 12 ? "warn" : "good",
      text: breakEven > 12
        ? `Break-even is ${breakEven} months. Prioritize conversion and pricing experiments now.`
        : `Break-even is ${breakEven || "N/A"} months. Keep growth disciplined and protect margin.`,
    },
  ];
}

function Insights({
  setPage,
  results,
  aiData,
  scenarioData,
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
}) {
  const advancedRecommendations = buildAdvancedRecommendations(results, aiData);
  const aiPlaybook = buildAIPlaybook(results, scenarioData);

  return (
    <main className="page ai-page">
      <Navbar
        onGoHome={onGoHome}
        onGoFeatures={onGoFeatures}
        onGoHowItWorks={onGoHowItWorks}
        onGoUseCases={onGoUseCases}
        onGoFaq={onGoFaq}
        onGoAbout={onGoAbout}
        onStartSimulation={onStartSimulation}
      />

      <section className="ai-card">
        <div className="dashboard-header">
          <div>
            <h1>AI Insights</h1>
            <p>Personalized recommendations based on your simulation results</p>
          </div>
          <button className="outline-btn" onClick={() => setPage("dashboard")}>
            <FaArrowLeft style={{ marginRight: 8 }} /> Back to Dashboard
          </button>
        </div>

        <div className="analysis-box">
          <h2>AI Analysis</h2>
          <ul>
            <li>{aiData?.analysis || "Run a simulation to generate analysis."}</li>
            <li>Break-even estimate: {results?.breakEven ?? "N/A"} months.</li>
            <li>Monthly profit estimate: {formatCurrency(results?.monthlyProfit)}</li>
          </ul>
        </div>

        <div className="recommend-box">
          <h2>Strategic Recommendations</h2>
          <div className="recommend-grid">
            {advancedRecommendations.map((rec, index) => (
              <article key={`advanced-rec-${index}`} className="recommend-card">
                <div className="recommend-header">
                  <strong>{rec.title}</strong>
                  <span>{rec.priority}</span>
                </div>
                <p>{rec.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="ai-playbook-box">
          <h2>AI Playbook</h2>
          <div className="playbook-grid">
            {aiPlaybook.map((item, index) => (
              <article key={`playbook-${index}`} className={`playbook-card ${item.tone}`}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="risk-panel">
          <div>
            <h2>Risk Level</h2>
            <h3>{formatRisk(aiData?.risk_level)}</h3>
          </div>
          <div className="gauge"><i></i></div>
        </div>
      </section>
    </main>
  );
}

function Pricing({
  setPage,
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
}) {
  return (
    <main className="page pricing-page">
      <Navbar
        onGoHome={onGoHome}
        onGoFeatures={onGoFeatures}
        onGoHowItWorks={onGoHowItWorks}
        onGoUseCases={onGoUseCases}
        onGoFaq={onGoFaq}
        onGoAbout={onGoAbout}
        onStartSimulation={onStartSimulation}
      />

      <section className="pricing-card">
        <h1>Choose Your Plan</h1>
        <p>Upgrade to unlock more features and simulations</p>

        <div className="plans-grid">
          <Plan title="Free" price="$0" items={["Basic Simulations", "Limited Reports", "Email Support"]} button="Current Plan" />
          <Plan title="Pro" price="$9.99" items={["All Features Included", "Advanced Reports", "Scenario Comparisons", "Priority Support"]} button={<><span>Start Pro Trial</span> <FaArrowRight style={{ marginLeft: 8 }} /></>} popular />
          <Plan title="Premium" price="$19.99" items={["All Pro Features", "Custom Analysis", "Dedicated Consultant", "VIP Support"]} button="Go Premium" />
        </div>

        <button className="outline-btn back-btn" onClick={() => setPage("simulation")}> 
          <FaArrowLeft style={{ marginRight: 8 }} /> Back to Simulation
        </button>
      </section>
    </main>
  );
}

function Plan({ title, price, items, button, popular }) {
  return (
    <article className={popular ? "plan-card popular" : "plan-card"}>
      {popular && <span className="popular-badge">Most Popular</span>}
      <h2>{title}</h2>
      <h3>{price}<span>/ month</span></h3>
      <div className="plan-line"></div>
      {items.map((item) => <p key={item}>- {item}</p>)}
      <button className={popular ? "primary-btn plan-btn" : "outline-plan-btn"}>{button}</button>
    </article>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [pendingScrollTarget, setPendingScrollTarget] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [results, setResults] = useState(null);
  const [scenarioData, setScenarioData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function goHome() {
    setPendingScrollTarget(null);
    setPage("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goToSection(sectionId) {
    setPage("home");
    setPendingScrollTarget(sectionId);
  }

  function startSimulation() {
    setPendingScrollTarget(null);
    setPage("simulation");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    if (page !== "home" || !pendingScrollTarget) {
      return;
    }

    const timer = window.setTimeout(() => {
      document.getElementById(pendingScrollTarget)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setPendingScrollTarget(null);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [page, pendingScrollTarget]);

  async function calculateResults() {
    setLoading(true);
    setError("");

    try {
      const validationErrors = getValidationErrors(formData);
      if (Object.keys(validationErrors).length > 0) {
        setError("Please review your input values. Some fields are outside the valid range.");
        return false;
      }

      const payload = buildSimulationPayload(formData);

      const simulationData = await simulate(payload);
      const scenarios = await getScenarios(payload);
      const ai = await getAI({
        monthly_profit: Number(simulationData.monthly_profit ?? 0),
        break_even_months: simulationData.break_even_months,
      });

      const monthlyRevenue = Number(simulationData.monthly_revenue ?? 0);
      const monthlyProfit = Number(simulationData.monthly_profit ?? 0);
      const profitMargin = monthlyRevenue > 0 ? ((monthlyProfit / monthlyRevenue) * 100).toFixed(1) : "0.0";

      setResults({
        monthlyProfit,
        breakEven: simulationData.break_even_months,
        totalCash: Number(simulationData.total_cost ?? 0),
        profitMargin,
        raw: simulationData,
      });

      setScenarioData(scenarios);
      setAiData(ai);

      return true;
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to fetch real simulation results from backend.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  if (page === "home") {
    return (
      <Home
        setPage={setPage}
        onGoHome={goHome}
        onGoFeatures={() => goToSection("features")}
        onGoHowItWorks={() => goToSection("how-it-works")}
        onGoUseCases={() => goToSection("use-cases")}
        onGoFaq={() => goToSection("faq")}
        onGoAbout={() => goToSection("about")}
        onStartSimulation={startSimulation}
      />
    );
  }
  if (page === "simulation") {
    return (
      <Simulation
        setPage={setPage}
        formData={formData}
        setFormData={setFormData}
        calculateResults={calculateResults}
        loading={loading}
        error={error}
        onGoHome={goHome}
        onGoFeatures={() => goToSection("features")}
        onGoHowItWorks={() => goToSection("how-it-works")}
        onGoUseCases={() => goToSection("use-cases")}
        onGoFaq={() => goToSection("faq")}
        onGoAbout={() => goToSection("about")}
        onStartSimulation={startSimulation}
      />
    );
  }
  if (page === "dashboard") {
    return (
      <Dashboard
        setPage={setPage}
        results={results}
        scenarioData={scenarioData}
        aiData={aiData}
        formData={formData}
        onGoHome={goHome}
        onGoFeatures={() => goToSection("features")}
        onGoHowItWorks={() => goToSection("how-it-works")}
        onGoUseCases={() => goToSection("use-cases")}
        onGoFaq={() => goToSection("faq")}
        onGoAbout={() => goToSection("about")}
        onStartSimulation={startSimulation}
      />
    );
  }
  if (page === "insights") {
    return (
      <Insights
        setPage={setPage}
        results={results}
        aiData={aiData}
        scenarioData={scenarioData}
        onGoHome={goHome}
        onGoFeatures={() => goToSection("features")}
        onGoHowItWorks={() => goToSection("how-it-works")}
        onGoUseCases={() => goToSection("use-cases")}
        onGoFaq={() => goToSection("faq")}
        onGoAbout={() => goToSection("about")}
        onStartSimulation={startSimulation}
      />
    );
  }
  if (page === "pricing") {
    return (
      <Pricing
        setPage={setPage}
        onGoHome={goHome}
        onGoFeatures={() => goToSection("features")}
        onGoHowItWorks={() => goToSection("how-it-works")}
        onGoUseCases={() => goToSection("use-cases")}
        onGoFaq={() => goToSection("faq")}
        onGoAbout={() => goToSection("about")}
        onStartSimulation={startSimulation}
      />
    );
  }

  return (
    <Home
      setPage={setPage}
      onGoHome={goHome}
      onGoFeatures={() => goToSection("features")}
      onGoHowItWorks={() => goToSection("how-it-works")}
      onGoUseCases={() => goToSection("use-cases")}
      onGoFaq={() => goToSection("faq")}
      onGoAbout={() => goToSection("about")}
      onStartSimulation={startSimulation}
    />
  );
}
