import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import AIPlanetIcon from "./AIPlanetIcon";
import { formatCurrency } from "../lib/planning";

export default function AIChatPanel({ aiData, results, scenarioData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeQ, setActiveQ] = useState(null);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(false);
  const timerRef = useRef(null);

  const monthlyProfit = Number(results?.monthlyProfit ?? 0);
  const riskLevel = aiData?.risk_level ?? "medium";
  const healthScore = Number(aiData?.health_score ?? 0);

  const QUESTIONS = [
    {
      id: "risk",
      label: "What's my biggest risk?",
      answer() {
        const w = aiData?.weaknesses?.[0] ?? "";
        return `Your risk level is ${riskLevel}. ${w ? `Main concern: ${w}` : "Monitor your cash flow closely every month."}`;
      },
    },
    {
      id: "profit",
      label: "How can I improve profitability?",
      answer() {
        const r = aiData?.recommendations?.[0];
        if (r && typeof r === "object") return `${r.title}: ${r.text}`;
        if (typeof r === "string") return r;
        return monthlyProfit > 0
          ? "You're already profitable! Scale your strongest revenue channel and reinvest surplus."
          : "Reduce fixed costs or increase pricing to reach break-even faster.";
      },
    },
    {
      id: "focus",
      label: "What should I focus on first?",
      answer() {
        const a = aiData?.action_items?.[0];
        return a ?? "Track actual monthly expenses vs. your estimates to identify cost-saving opportunities.";
      },
    },
    {
      id: "health",
      label: "Is my financial health good?",
      answer() {
        const lbl = healthScore >= 70 ? "Great" : healthScore >= 45 ? "Fair" : "At Risk";
        const s = aiData?.strengths?.[0] ?? "";
        return `Your Financial Health Score is ${healthScore}/100 - ${lbl}.${s ? ` Key strength: ${s}` : ""}`;
      },
    },
    {
      id: "scenario",
      label: "How uncertain is my outcome?",
      answer() {
        const low = Number(scenarioData?.low_case?.monthly_profit ?? 0);
        const high = Number(scenarioData?.high_case?.monthly_profit ?? 0);
        const spread = high - low;
        return `Your scenario spread is ${formatCurrency(spread)} (${formatCurrency(low)} to ${formatCurrency(high)}/mo). ${spread > 5000 ? "High variance - keep a solid cash buffer for volatility." : "Variance is manageable with consistent monthly tracking."}`;
      },
    },
  ];

  function handleQ(q) {
    if (timerRef.current) clearInterval(timerRef.current);
    if (activeQ === q.id) {
      setActiveQ(null);
      setDisplayed("");
      setTyping(false);
      return;
    }
    setActiveQ(q.id);
    const full = q.answer();
    setDisplayed("");
    setTyping(true);
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setDisplayed(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(timerRef.current);
        setTyping(false);
      }
    }, 12);
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return (
    <div className="ai-chat-panel">
      <button type="button" className="ai-chat-toggle" onClick={() => setIsOpen((p) => !p)}>
        <AIPlanetIcon size={20} />
        <span>Ask AI about your simulation</span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div className="ai-chat-body">
          <p className="ai-chat-hint">Select a question to get an AI-generated insight:</p>
          <div className="ai-chat-questions">
            {QUESTIONS.map((q) => (
              <button
                key={q.id}
                type="button"
                className={`ai-question-chip ${activeQ === q.id ? "active" : ""}`}
                onClick={() => handleQ(q)}
              >
                {q.label}
              </button>
            ))}
          </div>
          {activeQ && (
            <div className="ai-chat-answer">
              <div className="ai-answer-icon">
                <AIPlanetIcon size={24} />
              </div>
              <p className="ai-answer-text">
                {displayed}
                {typing && <span className="ai-cursor">|</span>}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
