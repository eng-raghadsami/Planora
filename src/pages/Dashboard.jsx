import { useEffect, useState } from "react";
import { FaArrowRight, FaDownload, FaStar } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { compareLocations } from "../api";
import { downloadReport } from "../utils/report";
import { EnhancedCashFlowCards, LocationComparisonSelector, Metric, ScenarioComparisonCards } from "../components/DashboardSections";
import {
  buildCashFlowChart,
  buildDonutGradient,
  formatCurrency,
  getCashFlowReasons,
  getCostItems,
  getLocationLabel,
  seasonalityLabel,
} from "../lib/planning";

export default function Dashboard({
  setPage,
  results,
  scenarioData,
  aiData,
  formData,
  simulationOptions,
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
  onGoPricing,
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [hoveredCostKey, setHoveredCostKey] = useState(null);
  const [showLocationCompare, setShowLocationCompare] = useState(false);
  const [locationComparison, setLocationComparison] = useState(null);
  const activeCountry = formData?.country || "";
  const activeCity = formData?.city || "";
  const cityOptions = Object.keys(simulationOptions?.locations?.[activeCountry] ?? {});
  const compareCandidates = cityOptions.filter((city) => city !== activeCity);
  const [selectedCompareCity, setSelectedCompareCity] = useState("");
  const compareCity = compareCandidates.includes(selectedCompareCity)
    ? selectedCompareCity
    : (compareCandidates[0] || "");

  useEffect(() => {
    if (!showLocationCompare || !compareCity || !activeCountry || !activeCity) {
      return;
    }

    let active = true;

    compareLocations({
      country: activeCountry,
      baseCity: activeCity,
      compareCity,
      monthlySales: formData?.monthlySales,
      monthlyCosts: formData?.monthlyCosts,
      baseRiskLevel: results?.raw?.risk_level || aiData?.risk_level || "medium",
    })
      .then((comparison) => {
        if (active) {
          setLocationComparison(comparison);
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setLocationComparison(null);
        }
      });

    return () => {
      active = false;
    };
  }, [showLocationCompare, compareCity, activeCountry, activeCity, formData?.monthlySales, formData?.monthlyCosts, results?.raw?.risk_level, aiData?.risk_level]);

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
          onGoPricing={onGoPricing}
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
        onGoPricing={onGoPricing}
      />

      <section className="dashboard-card" id="report-area">
        <div className="dashboard-header">
          <div>
            <h1>Results Dashboard</h1>
            <p>Your simulation results at a glance</p>
          </div>

          <div className="dashboard-actions">
            <button className="outline-btn" onClick={() => downloadReport("report-area", "planora-dashboard.pdf")}>
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

        <section className="scenario-section">
          <h2>Scenario Comparison</h2>
          <p className="section-subtitle">Explore three different business scenarios to understand your potential outcomes</p>
          <ScenarioComparisonCards scenarioData={scenarioData} />
        </section>

        <LocationComparisonSelector
          showLocationCompare={showLocationCompare}
          setShowLocationCompare={setShowLocationCompare}
          compareCandidates={compareCandidates}
          compareCity={compareCity}
          setSelectedCompareCity={setSelectedCompareCity}
          locationComparison={showLocationCompare ? locationComparison : null}
        />

        <div className="summary-box">
          <p><b>Summary:</b> You will break even in {results.breakEven ?? "N/A"} months, with an estimated monthly profit of {formatCurrency(results.monthlyProfit)}.</p>
          <p><b>Location:</b> {getLocationLabel(activeCountry, activeCity)}</p>
          <p><b>Seasonality:</b> {seasonalityLabel(breakdown.seasonality_profile)} ({breakdown.seasonality_strength_percent ?? 0}%)</p>
          <p><b>AI Analysis:</b> {aiData?.analysis || "AI analysis not available yet."}</p>
        </div>

        <section className="cashflow-section">
          <h2>Monthly Cash Flow</h2>
          <p className="section-subtitle">Hover or click cards to explore monthly performance details</p>
          <EnhancedCashFlowCards cashFlow={cashFlow} breakdown={breakdown} selectedMonth={activeMonth} onSelectMonth={setSelectedMonth} />
        </section>

        <button className="ai-btn" onClick={() => setPage("insights")}>
          Get AI Recommendations <FaArrowRight style={{ marginLeft: 10 }} />
        </button>
      </section>
    </main>
  );
}

