import { useState } from "react";
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

const initialForm = {
  businessType: "Retail Store",
  projectSize: "Small",
  initialInvestment: 50000,
  monthlySales: 7000,
  monthlyCosts: 12000,
  employees: 8,
};

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

function buildCashFlowChart(cashFlow = []) {
  if (!Array.isArray(cashFlow) || cashFlow.length === 0) {
    return null;
  }

  const xStart = 40;
  const xEnd = 500;
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

  return { points, linePoints, areaPoints };
}

function Logo() {
  return (
    <div className="logo">
      <div className="logo-img-wrap">
        <img src={logoPng} alt="Planora" className="logo-img" />
      </div>
      <span className="logo-text">Planora</span>
    </div>
  );
}

function Navbar({ setPage }) {
  return (
    <header className="navbar">
      <Logo />

      <nav className="nav-links">
        <button onClick={() => setPage("home")}>Home</button>
        <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
          Features
        </button>
        <button onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>
          About
        </button>
      </nav>

      <button className="primary-btn" onClick={() => setPage("simulation")}>
        Start Simulation
      </button>
    </header>
  );
}

function Home({ setPage }) {
  return (
    <main className="page home-page">
      <Navbar setPage={setPage} />

      <section className="hero-section">
        <div className="hero-text">
          <p className="eyebrow">SMART BUSINESS PLANNING</p>
          <h1>Plan Your Business Before You Risk Your Money</h1>
          <p>
            Simulate, predict costs, profits, and analyse cash flow trends to ensure success.
          </p>
          <button className="primary-btn large" onClick={() => setPage("simulation")}>
            Start Now <FaArrowRight style={{ marginLeft: 10 }} />
          </button>
        </div>

        <div className="hero-illustration" aria-label="business dashboard illustration">
          <div className="hero-bg" />
          <div className="icon-card"><FaArrowUp /></div>
          <div className="dollar"><FaDollarSign /></div>
          <div className="plant" />

          <div className="laptop">
            <div className="screen">
              <div className="screen-line short" />
              <div className="screen-line long" />

              <svg className="mini-chart" viewBox="0 0 180 120">
                <polyline points="12,95 48,68 82,80 120,48 162,23" />
                <circle cx="12" cy="95" r="5" />
                <circle cx="48" cy="68" r="5" />
                <circle cx="82" cy="80" r="5" />
                <circle cx="120" cy="48" r="5" />
                <circle cx="162" cy="23" r="5" />
              </svg>

              <div className="mini-pie" />
              <div className="screen-bars" />
            </div>
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

function Simulation({ setPage, formData, setFormData, calculateResults, loading, error }) {
  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function runSimulation() {
    const success = await calculateResults();
    if (success) {
      setPage("dashboard");
    }
  }

  return (
    <main className="page simulation-page">
      <Navbar setPage={setPage} />

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
          <span className="step active">1</span>
          <strong>Quick Setup</strong>
          <i></i>
          <span className="step">2</span>
          <i></i>
          <span className="step">3</span>
        </div>

        <section className="form-section">
          <h2>1. Project Info</h2>
          <div className="form-grid">
            <label>
              Business Type:
              <select
                value={formData.businessType}
                onChange={(e) => updateField("businessType", e.target.value)}
              >
                <option>Retail Store</option>
                <option>Cafe</option>
                <option>Online Business</option>
                <option>Freelance Service</option>
              </select>
            </label>

            <div className="size-group">
              <p>Project Size:</p>
              {["Small", "Medium", "Large"].map((size) => (
                <button
                  type="button"
                  key={size}
                  className={formData.projectSize === size ? "size-btn selected" : "size-btn"}
                  onClick={() => updateField("projectSize", size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>2. Financial Info</h2>
          <div className="form-grid">
            <label>
              Initial Investment ($):
              <input
                type="number"
                value={formData.initialInvestment}
                onChange={(e) => updateField("initialInvestment", Number(e.target.value))}
              />
            </label>

            <label>
              Expected Monthly Sales ($):
              <input
                type="number"
                value={formData.monthlySales}
                onChange={(e) => updateField("monthlySales", Number(e.target.value))}
              />
            </label>
          </div>
        </section>

        <section className="form-section">
          <h2>3. More Details</h2>
          <div className="form-grid">
            <label>
              Number of Employees:
              <input
                type="number"
                value={formData.employees}
                onChange={(e) => updateField("employees", Number(e.target.value))}
              />
            </label>

            <label>
              Monthly Fixed Costs ($):
              <input
                type="number"
                value={formData.monthlyCosts}
                onChange={(e) => updateField("monthlyCosts", Number(e.target.value))}
              />
            </label>
          </div>
        </section>

        {error ? <p className="error-text">{error}</p> : null}

        <button className="run-btn" type="button" onClick={runSimulation} disabled={loading}>
          {loading ? "Running..." : "Run Simulation"} {!loading ? <FaArrowRight style={{ marginLeft: 10 }} /> : null}
        </button>
      </section>
    </main>
  );
}

function Dashboard({ setPage, results, scenarioData, aiData }) {
  if (!results) {
    return (
      <main className="page dashboard-page">
        <Navbar setPage={setPage} />
        <section className="dashboard-card">
          <h1>Results Dashboard</h1>
          <p>No simulation results yet. Please run a simulation first.</p>
        </section>
      </main>
    );
  }

  const breakdown = results.raw?.breakdown ?? {};
  const cashFlow = results.raw?.cash_flow ?? [];
  const chart = buildCashFlowChart(cashFlow);

  const lowCase = scenarioData?.low_case;
  const averageCase = scenarioData?.average_case;
  const highCase = scenarioData?.high_case;

  return (
    <main className="page dashboard-page">
      <Navbar setPage={setPage} />

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
              <div className="donut-chart"></div>
              <div className="legend">
                <p><span className="dot blue"></span>Rent: {formatCurrency(breakdown.rent)}</p>
                <p><span className="dot green"></span>Staff Setup: {formatCurrency(breakdown.staff)}</p>
                <p><span className="dot yellow"></span>Equipment: {formatCurrency(breakdown.equipment)}</p>
                <p><span className="dot purple"></span>Marketing: {formatCurrency(breakdown.marketing)}</p>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h2>Cash Flow Timeline</h2>
            <div className="line-chart">
              {chart ? (
                <svg viewBox="0 0 520 230">
                  <polygon points={chart.areaPoints} />
                  <polyline points={chart.linePoints} />
                  {chart.points.map((point, index) => (
                    <circle key={`cash-point-${index}`} cx={point.x} cy={point.y} r="7" />
                  ))}
                </svg>
              ) : (
                <p>No cash flow data available.</p>
              )}
            </div>
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

        <div className="summary-box">
          <p><b>Summary:</b> You will break even in {results.breakEven ?? "N/A"} months, with an estimated monthly profit of {formatCurrency(results.monthlyProfit)}.</p>
          <p><b>AI Analysis:</b> {aiData?.analysis || "AI analysis not available yet."}</p>
        </div>

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

function Insights({ setPage, results, aiData }) {
  return (
    <main className="page ai-page">
      <Navbar setPage={setPage} />

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
          {Array.isArray(aiData?.recommendations) && aiData.recommendations.length > 0 ? (
            aiData.recommendations.map((rec, index) => (
              <p key={`rec-${index}`}>- {rec}</p>
            ))
          ) : (
            <p>No recommendations available yet.</p>
          )}
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

function Pricing({ setPage }) {
  return (
    <main className="page pricing-page">
      <Navbar setPage={setPage} />

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
  const [formData, setFormData] = useState(initialForm);
  const [results, setResults] = useState(null);
  const [scenarioData, setScenarioData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function calculateResults() {
    setLoading(true);
    setError("");

    try {
      const payload = {
        capital: Number(formData.initialInvestment),
        size: String(formData.projectSize).toLowerCase(),
        project_type: formData.businessType,
        monthly_sales: Number(formData.monthlySales),
        monthly_costs: Number(formData.monthlyCosts),
        employees: Number(formData.employees),
      };

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

  if (page === "home") return <Home setPage={setPage} />;
  if (page === "simulation") {
    return (
      <Simulation
        setPage={setPage}
        formData={formData}
        setFormData={setFormData}
        calculateResults={calculateResults}
        loading={loading}
        error={error}
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
      />
    );
  }
  if (page === "insights") return <Insights setPage={setPage} results={results} aiData={aiData} />;
  if (page === "pricing") return <Pricing setPage={setPage} />;

  return <Home setPage={setPage} />;
}
