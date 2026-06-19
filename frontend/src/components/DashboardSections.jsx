import HintLabel from "./HintLabel";
import { formatCurrency, formatRisk, getCashFlowReasons } from "../lib/planning";

export function Metric({ title, value, green }) {
  return (
    <article className="metric-card">
      <h3>{title}</h3>
      <strong className={green ? "green-text" : ""}>{value}</strong>
    </article>
  );
}

export function ScenarioComparisonCards({ scenarioData }) {
  if (!scenarioData) return <p>No scenario data available.</p>;

  const scenarios = [
    { key: "low_case", label: "Low Case", icon: "LOW", description: "Conservative estimate" },
    { key: "average_case", label: "Average Case", icon: "AVG", description: "Expected scenario" },
    { key: "high_case", label: "High Case", icon: "HIGH", description: "Optimistic scenario" },
  ];

  return (
    <div className="scenario-cards-grid">
      {scenarios.map(({ key, label, icon, description }) => {
        const data = scenarioData[key];
        return (
          <article key={key} className="scenario-card">
            <div className="scenario-header">
              <span className="scenario-icon">{icon}</span>
              <div>
                <h3>{label}</h3>
                <p>{description}</p>
              </div>
            </div>
            <div className="scenario-metrics">
              <div className="metric-item">
                <span className="metric-label">Initial Capital</span>
                <strong>{formatCurrency(data.initial_capital)}</strong>
              </div>
              <div className="metric-item">
                <span className="metric-label">Monthly Sales</span>
                <strong className="green-text">{formatCurrency(data.monthly_sales)}</strong>
              </div>
              <div className="metric-item">
                <span className="metric-label">Monthly Costs</span>
                <strong>{formatCurrency(data.monthly_costs)}</strong>
              </div>
              <div className="metric-item highlight">
                <span className="metric-label">Monthly Profit</span>
                <strong className={Number(data.monthly_profit) >= 0 ? "green-text" : "red-text"}>
                  {formatCurrency(data.monthly_profit)}
                </strong>
              </div>
              <div className="metric-item">
                <span className="metric-label">Break-even</span>
                <strong>{data.break_even_months ?? "N/A"} mo</strong>
              </div>
              <div className="metric-item">
                <span className="metric-label">Risk Level</span>
                <span className={`risk risk-badge ${String(data.risk_level || "").toLowerCase()}`}>
                  {formatRisk(data.risk_level)}
                </span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function LocationComparisonSelector({
  showLocationCompare,
  setShowLocationCompare,
  compareCandidates,
  compareCity,
  setSelectedCompareCity,
  locationComparison,
}) {
  return (
    <section className="location-section">
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
            <div className="location-selector" style={{ marginTop: 12 }}>
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
              <div style={{ marginTop: 20 }}>
                <LocationComparisonCards comparison={locationComparison} />
              </div>
            ) : null}
          </>
        ) : (
          <p style={{ marginTop: 10 }}>No alternative cities configured for this country yet.</p>
        )
      ) : null}
    </section>
  );
}

function LocationComparisonCards({ comparison }) {
  if (!comparison) return null;

  const { baseRow, compareRow, betterLocation } = comparison;

  return (
    <div className="location-comparison-container">
      <LocationCard city={baseRow.city} data={baseRow} isBetter={betterLocation === baseRow.city} />
      <div className="vs-divider">VS</div>
      <LocationCard city={compareRow.city} data={compareRow} isBetter={betterLocation === compareRow.city} />
    </div>
  );
}

function LocationCard({ city, data, isBetter }) {
  return (
    <article className={`location-card ${isBetter ? "better" : ""}`}>
      <div className="location-header">
        <h3>{city}</h3>
        {isBetter && <span className="better-badge">Better Option</span>}
      </div>
      <div className="location-metrics">
        <div className="metric-item">
          <span className="metric-label">Monthly Sales</span>
          <strong>{formatCurrency(data.monthlySales)}</strong>
        </div>
        <div className="metric-item">
          <span className="metric-label">Monthly Costs</span>
          <strong>{formatCurrency(data.monthlyCosts)}</strong>
        </div>
        <div className="metric-item highlight">
          <span className="metric-label">Monthly Profit</span>
          <strong className={data.monthlyProfit >= 0 ? "green-text" : "red-text"}>
            {formatCurrency(data.monthlyProfit)}
          </strong>
        </div>
        <div className="metric-item">
          <span className="metric-label">Risk Level</span>
          <span className={`risk risk-badge ${String(data.riskLevel || "").toLowerCase()}`}>
            {data.riskLevel}
          </span>
        </div>
      </div>
    </article>
  );
}

export function EnhancedCashFlowCards({ cashFlow, breakdown, selectedMonth, onSelectMonth }) {
  return (
    <div className="cashflow-cards-container">
      <div className="cashflow-cards-track">
        {cashFlow.map((item) => {
          const isPositive = Number(item.profit) >= 0;
          const isSelected = selectedMonth?.month === item.month;
          return (
            <button
              type="button"
              key={`month-card-${item.month}`}
              className={`cashflow-card ${isPositive ? "positive" : "negative"} ${isSelected ? "active" : ""}`}
              onClick={() => onSelectMonth(item)}
              onMouseEnter={() => onSelectMonth(item)}
            >
              <div className="card-header">
                <h4>Month {item.month}</h4>
                <span className={`profit-badge ${isPositive ? "positive" : "negative"}`}>
                  {isPositive ? "+" : ""}{formatCurrency(item.profit)}
                </span>
              </div>
              <div className="card-metrics">
                <div className="mini-metric">
                  <small>Revenue</small>
                  <span>{formatCurrency(item.revenue)}</span>
                </div>
                <div className="mini-metric">
                  <small>Cost</small>
                  <span>{formatCurrency(item.cost)}</span>
                </div>
                <div className="mini-metric">
                  <small>Balance</small>
                  <span className={Number(item.balance) >= 0 ? "green-text" : "red-text"}>
                    {formatCurrency(item.balance)}
                  </span>
                </div>
              </div>
              <small className="card-reason">{getCashFlowReasons(item.month, breakdown).join(" - ")}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
