import { useState } from "react";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import {
  AlertTriangle,
  BarChart2,
  BookOpen,
  BrainCircuit,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  DollarSign,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Shuffle,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import Navbar from "../components/Navbar";
import AIPlanetIcon from "../components/AIPlanetIcon";
import AIChatPanel from "../components/AIChatPanel";
import { downloadReport } from "../utils/report";
import { formatCurrency } from "../lib/planning";

const PRIORITY_COLORS = { High: "#e43135", Medium: "#f09020", Low: "#18a878" };
const CATEGORY_ICONS  = {
  "Cost Control": "CC",
  "Revenue":      "REV",
  "Cash Flow":    "CF",
  "Marketing":    "MKT",
  "Monitoring":   "MON",
  "Growth":       "GR",
  "Investment":   "INV",
};

function HealthScoreRing({ score }) {
  const radius = 54;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color  = score >= 70 ? "#18a878" : score >= 45 ? "#f09020" : "#e43135";
  const label  = score >= 70 ? "Great" : score >= 45 ? "Fair" : "At Risk";

  return (
    <div className="health-ring-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5ebf3" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.4s ease" }}
        />
        <text x="70" y="65" textAnchor="middle" fontSize="28" fontWeight="900" fill={color}>{score}</text>
        <text x="70" y="84" textAnchor="middle" fontSize="13" fontWeight="700" fill="#5a6a85">{label}</text>
      </svg>
      <p className="health-ring-label">Financial Health Score</p>
    </div>
  );
}

function RiskGauge({ riskLevel }) {
  const level = String(riskLevel || "medium").toLowerCase();
  const rotation = level === "low" ? -58 : level === "high" ? 58 : 0;
  const color    = level === "low" ? "#18a878" : level === "high" ? "#e43135" : "#f09020";
  const label    = level === "low" ? "Low Risk" : level === "high" ? "High Risk" : "Medium Risk";

  return (
    <div className="ai-gauge-wrap">
      <div className="ai-gauge">
        <svg width="200" height="110" viewBox="0 0 200 110">
          {/* arc segments */}
          <path d="M 20 100 A 80 80 0 0 1 60 27" fill="none" stroke="#e43135" strokeWidth="14" strokeLinecap="round" />
          <path d="M 64 24 A 80 80 0 0 1 136 24" fill="none" stroke="#f09020" strokeWidth="14" strokeLinecap="round" />
          <path d="M 140 27 A 80 80 0 0 1 180 100" fill="none" stroke="#18a878" strokeWidth="14" strokeLinecap="round" />
          {/* needle */}
          <g transform={`rotate(${rotation}, 100, 100)`} style={{ transition: "transform 0.8s ease" }}>
            <line x1="100" y1="100" x2="100" y2="32" stroke="#071b46" strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy="100" r="7" fill="#071b46" />
          </g>
        </svg>
      </div>
      <p className="ai-gauge-label" style={{ color }}>{label}</p>
    </div>
  );
}

const AI_TABS = [
  { id: "overview",       label: "Overview",        Icon: LayoutDashboard },
  { id: "analysis",       label: "Analysis",        Icon: BrainCircuit },
  { id: "recommendations",label: "Recommendations", Icon: Layers },
  { id: "playbook",       label: "Playbook",        Icon: BookOpen },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button type="button" className="copy-btn" onClick={handleCopy} title="Copy insight">
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

export default function Insights({
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
  onGoPricing,
  onGoAuth,
  onLogout,
  user,
}) {
  const [activeRec, setActiveRec]   = useState(null);
  const [activeTab, setActiveTab]   = useState("overview");
  const [allRecsOpen, setAllRecsOpen] = useState(false);

  const healthScore    = Number(aiData?.health_score ?? 0);
  const riskLevel      = aiData?.risk_level ?? "medium";
  const analysis       = aiData?.analysis ?? "Run a simulation to generate analysis.";
  const keyInsights    = Array.isArray(aiData?.key_insights)    ? aiData.key_insights    : [];
  const strengths      = Array.isArray(aiData?.strengths)       ? aiData.strengths       : [];
  const weaknesses     = Array.isArray(aiData?.weaknesses)      ? aiData.weaknesses      : [];
  const recommendations= Array.isArray(aiData?.recommendations) ? aiData.recommendations : [];
  const actionItems    = Array.isArray(aiData?.action_items)    ? aiData.action_items    : [];

  const monthlyProfit  = Number(results?.monthlyProfit ?? 0);
  const breakEven      = results?.breakEven;
  const profitMargin   = results?.profitMargin ?? "0.0";

  const lowCaseProfit  = Number(scenarioData?.low_case?.monthly_profit  ?? 0);
  const highCaseProfit = Number(scenarioData?.high_case?.monthly_profit ?? 0);
  const spread         = highCaseProfit - lowCaseProfit;
  const spreadHigh     = spread > Math.max(3000, Math.abs(monthlyProfit) * 0.9);

  const playbookItems = [
    {
      Icon: Lightbulb,
      title: "Opportunity Signal",
      tone: monthlyProfit > 0 ? "good" : "warn",
      text: monthlyProfit > 0
        ? `Current plan is profitable (${formatCurrency(monthlyProfit)}/mo). Reinvest and scale the strongest channels.`
        : "Current setup is not yet profitable. Re-price or reduce costs before scaling.",
    },
    {
      Icon: AlertTriangle,
      title: "Risk Signal",
      tone: spreadHigh ? "warn" : "neutral",
      text: spreadHigh
        ? `Scenario spread is high (${formatCurrency(spread)}). Keep an extra cash buffer to handle volatility.`
        : "Scenario spread is moderate. Variance risk is manageable with monthly tracking.",
    },
    {
      Icon: Target,
      title: "Execution Focus",
      tone: breakEven && breakEven > 12 ? "warn" : "good",
      text: breakEven && breakEven > 12
        ? `Break-even is ${breakEven} months. Prioritize conversion and pricing experiments now.`
        : `Break-even is ${breakEven ?? "N/A"} months. Keep growth disciplined and protect margin.`,
    },
  ];

  /* which recs to show: all or just first */
  const visibleRecs = allRecsOpen ? recommendations : recommendations.slice(0, 2);

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
        onGoPricing={onGoPricing}
        onGoAuth={onGoAuth}
        onLogout={onLogout}
        user={user}
      />

      <section className="ai-card" id="ai-report-area">

        {/* Header */}
        <div className="dashboard-header">
          <div className="ai-page-title">
            <div className="ai-brain-icon-wrap">
              <AIPlanetIcon size={32} />
            </div>
            <div>
              <h1>AI Insights</h1>
              <p>Personalized analysis based on your simulation results</p>
            </div>
          </div>
          <div className="ai-header-actions">
            <button className="outline-btn ai-print-btn" onClick={() => downloadReport("ai-report-area", "planora-ai-insights.pdf")}>
              <FaDownload style={{ marginRight: 8 }} /> Download PDF
            </button>
            <button className="outline-btn" onClick={() => setPage("dashboard")}>
              <FaArrowLeft style={{ marginRight: 8 }} /> Dashboard
            </button>
          </div>
        </div>

        {/* Interactive AI Chat Panel */}
        <AIChatPanel aiData={aiData} results={results} scenarioData={scenarioData} />

        {/* Tab Navigation */}
        <div className="ai-tab-nav" role="tablist">
          {AI_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              className={`ai-tab-btn ${activeTab === id ? "active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={16} strokeWidth={1.8} />
              {label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === "overview" && (
          <div className="ai-tab-panel">
            <div className="ai-overview-row">
              <HealthScoreRing score={healthScore} />

              <div className="ai-kpi-grid">
                <div className="ai-kpi-card">
                  <span className="ai-kpi-icon-wrap" style={{ background: "#e8f7f1" }}>
                    <DollarSign size={18} color="#18a878" strokeWidth={2} />
                  </span>
                  <div>
                    <small>Monthly Profit</small>
                    <strong className={monthlyProfit >= 0 ? "green-text" : "red-text"}>{formatCurrency(monthlyProfit)}</strong>
                  </div>
                </div>
                <div className="ai-kpi-card">
                  <span className="ai-kpi-icon-wrap" style={{ background: "#e8f0fb" }}>
                    <Calendar size={18} color="#2d86df" strokeWidth={2} />
                  </span>
                  <div>
                    <small>Break-even</small>
                    <strong>{breakEven ?? "N/A"} months</strong>
                  </div>
                </div>
                <div className="ai-kpi-card">
                  <span className="ai-kpi-icon-wrap" style={{ background: "#fff3e0" }}>
                    <BarChart2 size={18} color="#f09020" strokeWidth={2} />
                  </span>
                  <div>
                    <small>Profit Margin</small>
                    <strong className={Number(profitMargin) >= 0 ? "green-text" : "red-text"}>{profitMargin}%</strong>
                  </div>
                </div>
                <div className="ai-kpi-card">
                  <span className="ai-kpi-icon-wrap" style={{ background: spreadHigh ? "#fce8e5" : "#e8f7f1" }}>
                    <Shuffle size={18} color={spreadHigh ? "#e43135" : "#18a878"} strokeWidth={2} />
                  </span>
                  <div>
                    <small>Scenario Spread</small>
                    <strong className={spreadHigh ? "red-text" : "green-text"}>{formatCurrency(spread)}</strong>
                  </div>
                </div>
              </div>

              <RiskGauge riskLevel={riskLevel} />
            </div>

            {/* Quick summary */}
            <div className="ai-summary-banner">
              <AIPlanetIcon size={24} />
              <p>{analysis}</p>
            </div>

            {/* Quick wins inline */}
            {actionItems.length > 0 && (
              <div className="ai-actions-box">
                <h2><Zap size={18} style={{ verticalAlign: "middle", marginRight: 6 }} /> Quick Wins</h2>
                <p className="section-subtitle">Actionable steps you can start today</p>
                <ol className="ai-actions-list">
                  {actionItems.map((item, i) => (
                    <li key={`action-${i}`}>{item}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Analysis tab */}
        {activeTab === "analysis" && (
          <div className="ai-tab-panel">
            {/* Analysis block */}
            <div className="ai-analysis-card">
              <div className="ai-analysis-header">
                <div className="ai-brain-icon-wrap large">
                  <AIPlanetIcon size={34} />
                </div>
                <div>
                  <h2>AI Analysis</h2>
                  <p>{analysis}</p>
                </div>
              </div>

              {keyInsights.length > 0 && (
                <ul className="ai-insights-list">
                  {keyInsights.map((insight, i) => (
                    <li key={`insight-${i}`}>
                      <span className="insight-dot"></span>
                      <span className="insight-text">{insight}</span>
                      <CopyButton text={insight} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="ai-sw-row">
              <div className="ai-sw-card strengths">
                <h3><TrendingUp size={16} style={{ verticalAlign: "middle", marginRight: 6 }} /> Strengths</h3>
                <ul>
                  {strengths.map((s, i) => <li key={`s-${i}`}>{s}</li>)}
                </ul>
              </div>
              <div className="ai-sw-card weaknesses">
                <h3><TrendingDown size={16} style={{ verticalAlign: "middle", marginRight: 6 }} /> Weaknesses</h3>
                <ul>
                  {weaknesses.map((w, i) => <li key={`w-${i}`}>{w}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations tab */}
        {activeTab === "recommendations" && (
          <div className="ai-tab-panel">
            <div className="ai-section-block">
              <h2>Strategic Recommendations</h2>
              <p className="section-subtitle">Click a card to expand the full recommendation</p>
              <div className="ai-rec-grid">
                {visibleRecs.map((rec, index) => {
                  const isObj    = typeof rec === "object";
                  const title    = isObj ? rec.title    : `Recommendation ${index + 1}`;
                  const text     = isObj ? rec.text     : rec;
                  const priority = isObj ? rec.priority : "Medium";
                  const category = isObj ? rec.category : "";
                  const impact   = isObj ? rec.impact   : "";
                  const isOpen   = activeRec === index;
                  return (
                    <article
                      key={`rec-${index}`}
                      className={`ai-rec-card ${isOpen ? "open" : ""}`}
                      onClick={() => setActiveRec(isOpen ? null : index)}
                    >
                      <div className="ai-rec-top">
                        <span className="ai-rec-cat-icon">{CATEGORY_ICONS[category] ?? "AI"}</span>
                        <div className="ai-rec-meta">
                          <strong>{title}</strong>
                          <span className="ai-rec-category">{category}</span>
                        </div>
                        <div className="ai-rec-badges">
                          <span className="ai-priority-badge" style={{ background: PRIORITY_COLORS[priority] + "22", color: PRIORITY_COLORS[priority], borderColor: PRIORITY_COLORS[priority] + "55" }}>{priority}</span>
                        </div>
                        <span className="ai-rec-chevron">
                          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </span>
                      </div>
                      {isOpen && (
                        <div className="ai-rec-body">
                          <p>{text}</p>
                          {impact && <span className="ai-impact-tag">Impact: {impact}</span>}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
              {recommendations.length > 2 && (
                <button type="button" className="ai-show-more-btn" onClick={() => setAllRecsOpen(p => !p)}>
                  {allRecsOpen ? <><ChevronUp size={15} /> Show less</> : <><ChevronDown size={15} /> Show all {recommendations.length} recommendations</>}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Playbook tab */}
        {activeTab === "playbook" && (
          <div className="ai-tab-panel">
            <div className="ai-section-block">
              <h2>AI Playbook</h2>
              <p className="section-subtitle">Signal-based execution guide derived from your simulation data</p>
              <div className="playbook-grid">
                {playbookItems.map((item, index) => (
                  <article key={`playbook-${index}`} className={`playbook-card ${item.tone}`}>
                    <item.Icon size={22} strokeWidth={1.8} className="playbook-lucide-icon" />
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </article>
                ))}
              </div>
            </div>

            {actionItems.length > 0 && (
              <div className="ai-actions-box" style={{ marginTop: 24 }}>
                <h2><Zap size={18} style={{ verticalAlign: "middle", marginRight: 6 }} /> Quick Wins</h2>
                <p className="section-subtitle">Actionable steps you can start today</p>
                <ol className="ai-actions-list">
                  {actionItems.map((item, i) => (
                    <li key={`action-${i}`}>{item}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

      </section>
    </main>
  );
}

/* Helpers */
