import { useState } from "react";
import "./App.css";

const initialForm = {
  businessType: "Retail Store",
  projectSize: "Small",
  initialInvestment: 50000,
  monthlySales: 7000,
  monthlyCosts: 12000,
  employees: 8,
};

function Logo() {
  return (
    <div className="logo">
      <span className="logo-icon">⬡</span>
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
            Start Now →
          </button>
        </div>

        <div className="hero-illustration" aria-label="business dashboard illustration">
          <div className="hero-bg"></div>
          <div className="icon-card">↗</div>
          <div className="dollar">$</div>
          <div className="plant"></div>

          <div className="laptop">
            <div className="screen">
              <div className="screen-line short"></div>
              <div className="screen-line long"></div>

              <svg className="mini-chart" viewBox="0 0 180 120">
                <polyline points="12,95 48,68 82,80 120,48 162,23" />
                <circle cx="12" cy="95" r="5" />
                <circle cx="48" cy="68" r="5" />
                <circle cx="82" cy="80" r="5" />
                <circle cx="120" cy="48" r="5" />
                <circle cx="162" cy="23" r="5" />
              </svg>

              <div className="mini-pie"></div>
              <div className="screen-bars"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <h2>Powerful Features</h2>
        <div className="features-grid">
          <Feature icon="▣" title="Cost Breakdown" text="Understand and categorize expenses." />
          <Feature icon="↗" title="Profit Prediction" text="Forecast revenues and profits." />
          <Feature icon="♙" title="Cash Flow Simulation" text="Visualize your future cash flow." />
          <Feature icon="♧" title="AI Insights" text="Get actionable recommendations." />
        </div>
      </section>

      <section id="about" className="about-section">
        <h2>About Planora</h2>
        <p>
          Planora helps small business owners and freelancers test their project idea before
          spending real money. The platform estimates costs, profit, cash flow, break-even time,
          and gives useful recommendations.
        </p>
      </section>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <article className="feature-card">
      <span>{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function Simulation({ setPage, formData, setFormData, calculateResults }) {
  function updateField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function runSimulation() {
    calculateResults();
    setPage("dashboard");
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
            ⭐ Upgrade Plan
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

        <button className="run-btn" onClick={runSimulation}>
          Run Simulation →
        </button>
      </section>
    </main>
  );
}

function Dashboard({ setPage, formData, results }) {
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
              ⇩ Download Report PDF
            </button>
            <button className="upgrade-btn" onClick={() => setPage("pricing")}>
              ⭐ Upgrade Plan
            </button>
          </div>
        </div>

        <section className="stats-grid">
          <Metric title="Total Cash Flow" value={`$${results.totalCash.toLocaleString()}`} />
          <Metric title="Monthly Profit" value={`$${results.monthlyProfit.toLocaleString()}`} green />
          <Metric title="Break Even Months" value={results.breakEven} />
          <Metric title="Profit Margin" value={`${results.profitMargin}%`} green />
        </section>

        <section className="charts-grid">
          <div className="chart-card">
            <h2>Cost Breakdown</h2>
            <div className="cost-wrap">
              <div className="donut-chart"></div>
              <div className="legend">
                <p><span className="dot blue"></span>Fixed Costs</p>
                <p><span className="dot green"></span>Variable Costs</p>
                <p><span className="dot yellow"></span>Marketing</p>
                <p><span className="dot purple"></span>Other</p>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h2>Cash Flow Timeline</h2>
            <div className="line-chart">
              <svg viewBox="0 0 520 230">
                <polygon points="40,155 105,190 170,150 235,108 300,68 365,58 430,48 500,8 500,220 40,220" />
                <polyline points="40,155 105,190 170,150 235,108 300,68 365,58 430,48 500,8" />
                <circle cx="40" cy="155" r="7" />
                <circle cx="105" cy="190" r="7" />
                <circle cx="170" cy="150" r="7" />
                <circle cx="235" cy="108" r="7" />
                <circle cx="300" cy="68" r="7" />
                <circle cx="365" cy="58" r="7" />
                <circle cx="430" cy="48" r="7" />
                <circle cx="500" cy="8" r="7" />
              </svg>
            </div>
          </div>
        </section>

        <section className="scenario-table-section">
          <h2>Scenario Comparison</h2>
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
                <td>${Math.round(formData.initialInvestment * 0.7).toLocaleString()}</td>
                <td>${formData.initialInvestment.toLocaleString()}</td>
                <td>${Math.round(formData.initialInvestment * 1.4).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Monthly Sales</td>
                <td className="green-text">${Math.round(formData.monthlySales * 0.8).toLocaleString()}</td>
                <td className="green-text">${formData.monthlySales.toLocaleString()}</td>
                <td className="green-text">${Math.round(formData.monthlySales * 1.5).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Monthly Costs</td>
                <td>${Math.round(formData.monthlyCosts * 0.9).toLocaleString()}</td>
                <td>${formData.monthlyCosts.toLocaleString()}</td>
                <td>${Math.round(formData.monthlyCosts * 1.2).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Risk Level</td>
                <td><span className="risk low">Low</span></td>
                <td><span className="risk medium">Medium</span></td>
                <td><span className="risk high">High</span></td>
              </tr>
            </tbody>
          </table>
        </section>

        <div className="summary-box">
          <p><b>Summary:</b> You will break even in {results.breakEven} months, with an estimated monthly profit of ${results.monthlyProfit.toLocaleString()}.</p>
          <p><b>Recommendations:</b> Consider adjusting your marketing expenses and reducing fixed costs to improve profit margins.</p>
        </div>

        <button className="ai-btn" onClick={() => setPage("insights")}>
          Get AI Recommendations →
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

function Insights({ setPage, results }) {
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
            ← Back to Dashboard
          </button>
        </div>

        <div className="analysis-box">
          <h2>AI Analysis</h2>
          <ul>
            <li>Revenue shows a positive trend, but your fixed costs are still high.</li>
            <li>Your break-even point is {results.breakEven} months, which is acceptable for a small business.</li>
            <li>Cash flow looks positive, but maintaining a cash buffer is important.</li>
            <li>Marketing should focus on high-ROI campaigns instead of random spending.</li>
          </ul>
        </div>

        <div className="recommend-box">
          <h2>Recommendations</h2>
          <p>✓ Reduce fixed costs by renegotiating rent, suppliers, or subscriptions.</p>
          <p>✓ Track monthly expenses and compare actual results with your simulation.</p>
          <p>✓ Increase sales gradually before expanding project size.</p>
          <p>✓ Keep an emergency cash buffer for at least 2-3 months.</p>
        </div>

        <div className="risk-panel">
          <div>
            <h2>Risk Level</h2>
            <h3>Medium Risk</h3>
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
          <Plan title="Pro" price="$9.99" items={["All Features Included", "Advanced Reports", "Scenario Comparisons", "Priority Support"]} button="Start Pro Trial →" popular />
          <Plan title="Premium" price="$19.99" items={["All Pro Features", "Custom Analysis", "Dedicated Consultant", "VIP Support"]} button="Go Premium" />
        </div>

        <button className="outline-btn back-btn" onClick={() => setPage("simulation")}>
          ← Back to Simulation
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
      {items.map((item) => <p key={item}>✓ {item}</p>)}
      <button className={popular ? "primary-btn plan-btn" : "outline-plan-btn"}>{button}</button>
    </article>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [formData, setFormData] = useState(initialForm);
  const [results, setResults] = useState({
    monthlyProfit: 800,
    breakEven: 6,
    profitMargin: 19.2,
    totalCash: 5000,
  });

  function calculateResults() {
    const monthlyProfit = Math.max(formData.monthlySales - formData.monthlyCosts, 0);
    const breakEven = monthlyProfit > 0 ? Math.ceil(formData.initialInvestment / monthlyProfit) : "N/A";
    const profitMargin = formData.monthlySales > 0 ? ((monthlyProfit / formData.monthlySales) * 100).toFixed(1) : 0;
    const totalCash = monthlyProfit * 6 - formData.initialInvestment / 10;

    setResults({
      monthlyProfit,
      breakEven,
      profitMargin,
      totalCash: Math.max(Math.round(totalCash), 0),
    });
  }

  if (page === "home") return <Home setPage={setPage} />;
  if (page === "simulation") return <Simulation setPage={setPage} formData={formData} setFormData={setFormData} calculateResults={calculateResults} />;
  if (page === "dashboard") return <Dashboard setPage={setPage} formData={formData} results={results} />;
  if (page === "insights") return <Insights setPage={setPage} results={results} />;
  if (page === "pricing") return <Pricing setPage={setPage} />;

  return <Home setPage={setPage} />;
}
