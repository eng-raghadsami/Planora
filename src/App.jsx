import { useEffect, useState } from "react";
import "./App.css";

import { simulate, getScenarios, getAI, getSimulationOptions, prepareSimulationInput } from "./api";
import Home from "./pages/Home";
import Simulation from "./pages/Simulation";
import Dashboard from "./pages/Dashboard";
import Insights from "./pages/Insights";
import Pricing from "./pages/Pricing";
import { emptyForm, getValidationErrors } from "./lib/planning";

export default function App() {
  const [page, setPage] = useState("home");
  const [pendingScrollTarget, setPendingScrollTarget] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [simulationOptions, setSimulationOptions] = useState(null);
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

  function goPricing() {
    setPendingScrollTarget(null);
    setPage("pricing");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const navigationProps = {
    onGoHome: goHome,
    onGoFeatures: () => goToSection("features"),
    onGoHowItWorks: () => goToSection("how-it-works"),
    onGoUseCases: () => goToSection("use-cases"),
    onGoFaq: () => goToSection("faq"),
    onGoAbout: () => goToSection("about"),
    onStartSimulation: startSimulation,
    onGoPricing: goPricing,
  };

  useEffect(() => {
    let active = true;

    getSimulationOptions()
      .then((options) => {
        if (!active) {
          return;
        }

        setSimulationOptions(options);
        setFormData((current) => ({
          ...options.default_form,
          ...current,
          businessType: current.businessType || options.default_form?.businessType || "",
          country: current.country || options.default_form?.country || "",
          city: current.city || options.default_form?.city || "",
        }));
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setError(err?.message || "Failed to load simulation options from backend.");
        }
      });

    return () => {
      active = false;
    };
  }, []);

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

      const prepared = await prepareSimulationInput(formData);
      const payload = prepared.payload;
      const simulationData = await simulate(payload);
      const scenarios = await getScenarios(payload);
      const monthlyRevenueFull = Number(simulationData.monthly_revenue ?? 0);
      const monthlyProfitFull = Number(simulationData.monthly_profit ?? 0);
      const profitMarginFull = monthlyRevenueFull > 0
        ? parseFloat(((monthlyProfitFull / monthlyRevenueFull) * 100).toFixed(1))
        : 0;

      const ai = await getAI({
        monthly_profit: monthlyProfitFull,
        break_even_months: simulationData.break_even_months,
        monthly_sales: monthlyRevenueFull,
        monthly_costs: Number(simulationData.monthly_cost ?? 0),
        initial_investment: Number(simulationData.total_cost ?? 0),
        profit_margin: profitMarginFull,
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

  if (page === "simulation") {
    return (
      <Simulation
        setPage={setPage}
        formData={formData}
        setFormData={setFormData}
        simulationOptions={simulationOptions}
        calculateResults={calculateResults}
        loading={loading}
        error={error}
        {...navigationProps}
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
        simulationOptions={simulationOptions}
        {...navigationProps}
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
        {...navigationProps}
      />
    );
  }

  if (page === "pricing") {
    return <Pricing setPage={setPage} {...navigationProps} />;
  }

  return <Home setPage={setPage} {...navigationProps} />;
}
