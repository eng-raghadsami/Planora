import { useState } from "react";
import "./App.css";

function Logo({ light = false }) {
  return (
    <div className="logo">
      <span className="logo-icon">⬡</span>
      <b className={light ? "light" : ""}>Planora</b>
    </div>
  );
}

function Sidebar({ page, setPage }) {
  return (
    <aside className="sidebar">
      <Logo light />

      <button onClick={() => setPage("dashboard")} className={page === "dashboard" ? "active" : ""}>
        ⌂ Dashboard
      </button>

      <button onClick={() => setPage("simulation")} className={page === "simulation" ? "active" : ""}>
        ☑ Scenarios
      </button>

      <button onClick={() => setPage("insights")} className={page === "insights" ? "active" : ""}>
        ▤ Reports
      </button>

      <button onClick={() => setPage("pricing")} className={page === "pricing" ? "active" : ""}>
        ⚙ Settings
      </button>

      <button className="logout">↪ Logout</button>
    </aside>
  );
}

function Home({ setPage }) {
  return (
    <main className="home">
      <nav className="topbar">
        <Logo light />

        <div>
          <span>Home</span>
          <span>Features</span>
          <span>About</span>
        </div>

        <button onClick={() => setPage("simulation")}>Start Simulation</button>
      </nav>

      <section className="hero">
        <div>
          <p className="tag">SMART BUSINESS PLANNING</p>
          <h1>Plan Your Business Before You Risk Your Money</h1>
          <p className="desc">
            Simulate, predict costs, profits, and analyse cash flow trends to ensure success.
          </p>
          <button onClick={() => setPage("simulation")} className="start">
            Start Now →
          </button>
        </div>

        <div className="illustration">
          <div className="circle"></div>
          <div className="float chart">↗</div>
          <div className="float money">$</div>
          <div className="plant"></div>

          <div className="laptop">
            <div className="screen">
              <div className="bars"></div>

              <svg viewBox="0 0 200 120">
                <polyline points="10,95 50,65 88,82 125,50 170,20" />
                <circle cx="10" cy="95" r="5" />
                <circle cx="50" cy="65" r="5" />
                <circle cx="88" cy="82" r="5" />
                <circle cx="125" cy="50" r="5" />
                <circle cx="170" cy="20" r="5" />
              </svg>

              <div className="pie"></div>
              <div className="screen-lines"></div>
            </div>
          </div>
        </div>
      </section>

      <h2 className="center-title">Powerful Features</h2>

      <section className="features">
        <div>
          <span>▣</span>
          <h3>Cost Breakdown</h3>
          <p>Understand and categorize expenses.</p>
        </div>

        <div>
          <span>↗</span>
          <h3>Profit Prediction</h3>
          <p>Forecast revenues and profits.</p>
        </div>

        <div>
          <span>♙</span>
          <h3>Cash Flow Simulation</h3>
          <p>Visualize your future cash flow.</p>
        </div>

        <div>
          <span>♧</span>
          <h3>AI Insights</h3>
          <p>Get actionable recommendations.</p>
        </div>
      </section>
    </main>
  );
}

function Simulation({ page, setPage }) {
  return (
    <div className="layout">
      <Sidebar page={page} setPage={setPage} />

      <section className="content">
        <h1>New Simulation</h1>
        <p className="sub">Enter your project details to run a simulation</p>

        <div className="steps">
          <b>1</b>
          <span>Quick Setup</span>
          <i></i>
          <b className="off">2</b>
          <i></i>
          <b className="off">3</b>
        </div>

        <Form title="1. Project Info">
          <label>
            Business Type:
            <select>
              <option>Retail Store</option>
              <option>Cafe</option>
              <option>Online Store</option>
            </select>
          </label>

          <div className="sizes">
            <p>Project Size:</p>
            <button>Small</button>
            <button>Medium</button>
            <button>Large</button>
          </div>
        </Form>

        <Form title="2. Financial Info">
          <label>
            Initial Investment ($):
            <input defaultValue="50000" />
          </label>

          <label>
            Expected Monthly Sales ($):
            <input defaultValue="7000" />
          </label>
        </Form>

        <Form title="3. More Details">
          <label>
            Number of Employees:
            <input defaultValue="8" />
          </label>

          <label>
            Monthly Fixed Costs ($):
            <input defaultValue="12000" />
          </label>
        </Form>

        <button className="run" onClick={() => setPage("dashboard")}>
          Run Simulation →
        </button>
      </section>
    </div>
  );
}

function Form({ title, children }) {
  return (
    <div className="form">
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}

function Dashboard() {
  return (
    <main className="dashboard">
      <header>
        <Logo />
        <button>⇩ Download Report</button>
      </header>

      <h1>Results Dashboard</h1>
      <p className="sub">Your simulation results at a glance</p>

      <section className="stats">
        <Card title="Total Cash" value="$5,000" />
        <Card title="Monthly Profit" value="$800" green />
        <Card title="Break Even Months" value="6" />
        <Card title="Profit Margin" value="19.2%" green />
      </section>

      <section className="charts-row">
        <div className="box">
          <h2>Cost Breakdown</h2>

          <div className="costs">
            <div className="donut"></div>

            <div className="legend">
              <p><b className="d blue"></b>Fixed Costs</p>
              <p><b className="d green"></b>Variable Costs</p>
              <p><b className="d yellow"></b>Marketing</p>
              <p><b className="d purple"></b>Other</p>
            </div>
          </div>
        </div>

        <div className="box">
          <h2>Cash Flow Timeline</h2>

          <div className="linechart">
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

      <p className="note">
        <b>Summary:</b> You will break even in 6 months, with an estimated monthly profit of $800.
      </p>

      <hr />

      <p className="note">
        <b>Recommendations:</b> Consider adjusting your marketing expenses to improve your profit margins.
      </p>
    </main>
  );
}

function Card({ title, value, green }) {
  return (
    <div className="stat">
      <h3>{title}</h3>
      <strong className={green ? "green-text" : ""}>{value}</strong>
    </div>
  );
}

function Scenarios({ page, setPage }) {
  return (
    <div className="layout">
      <Sidebar page={page} setPage={setPage} />

      <section className="content">
        <h1>Scenario Comparison</h1>
        <p className="sub">Compare different project sizes and outcomes</p>

        <table>
          <thead>
            <tr>
              <th></th>
              <th>Small</th>
              <th>Medium</th>
              <th>Large</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Initial Capital</td>
              <td>$30,000</td>
              <td>$50,000</td>
              <td>$80,000</td>
            </tr>

            <tr>
              <td>Monthly Sales</td>
              <td className="green-text">$5,000</td>
              <td className="green-text">$7,000</td>
              <td className="green-text">$12,000</td>
            </tr>

            <tr>
              <td>Monthly Costs</td>
              <td className="green-text">$4,000</td>
              <td className="green-text">$6,500</td>
              <td className="green-text">$10,000</td>
            </tr>

            <tr>
              <td>Break Even (Months)</td>
              <td>4 Months</td>
              <td>6 Months</td>
              <td>8 Months</td>
            </tr>

            <tr>
              <td>Monthly Profit</td>
              <td>$1,000</td>
              <td>$500</td>
              <td>$2,000</td>
            </tr>

            <tr>
              <td>Risk Level</td>
              <td><span className="risk low">Low</span></td>
              <td><span className="risk medium">Medium</span></td>
              <td><span className="risk high">High</span></td>
            </tr>
          </tbody>
        </table>

        <button className="use" onClick={() => setPage("dashboard")}>
          Use This Scenario →
        </button>
      </section>
    </div>
  );
}

function Insights() {
  return (
    <main className="ai">
      <Logo />

      <section>
        <h1>AI Insights</h1>

        <div className="analysis">
          <h2>AI Analysis</h2>
          <ul>
            <li>Revenue has been stable with a slight upward trend.</li>
            <li>Fixed costs are high, impacting overall profitability.</li>
            <li>Marketing expenses have increased but haven't shown significant return yet.</li>
            <li>Cash flow is positive, but maintaining it will require careful management.</li>
          </ul>
        </div>

        <div className="recs">
          <h2>Recommendations</h2>
          <p>✓ Consider reducing fixed costs by renegotiating leases or finding cheaper suppliers.</p>
          <p>✓ Optimize your marketing strategy to focus on high-ROI campaigns.</p>
          <p>✓ Monitor cash flow closely and ensure you have a buffer for unexpected expenses.</p>
        </div>

        <div className="riskbox">
          <div>
            <h2>Risk Level</h2>
            <h3>Medium Risk</h3>
          </div>

          <div className="gauge">
            <i></i>
          </div>
        </div>
      </section>
    </main>
  );
}

function Pricing() {
  return (
    <main className="pricing">
      <h1>Planora</h1>
      <h2>Pricing / Plans</h2>
      <p>Choose the best plan for your needs</p>

      <section className="plans">
        <Plan
          name="Free"
          price="$0"
          items={["Basic Simulations", "Limited Reports", "Email Support"]}
          btn="Get Started"
        />

        <Plan
          name="Pro"
          price="$9.99"
          items={["All Features Included", "Advanced Reports", "Scenario Comparisons", "Priority Support"]}
          btn="Start Pro Trial →"
          popular
        />

        <Plan
          name="Premium"
          price="$19.99"
          items={["All Pro Features", "Custom Analysis", "Dedicated Consultant", "VIP Support"]}
          btn="Go Premium"
        />
      </section>
    </main>
  );
}

function Plan({ name, price, items, btn, popular }) {
  return (
    <div className={popular ? "plan popular" : "plan"}>
      {popular && <em>Most Popular</em>}

      <h2>{name}</h2>
      <h3>
        {price}
        <span>/ month</span>
      </h3>

      {items.map((item) => (
        <p key={item}>✔ {item}</p>
      ))}

      <button>{btn}</button>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");

  if (page === "home") return <Home setPage={setPage} />;
  if (page === "dashboard") return <Dashboard setPage={setPage} />;
  if (page === "simulation") return <Simulation page={page} setPage={setPage} />;
  if (page === "scenarios") return <Scenarios page={page} setPage={setPage} />;
  if (page === "insights") return <Insights />;
  if (page === "pricing") return <Pricing />;

  return <Home setPage={setPage} />;
}