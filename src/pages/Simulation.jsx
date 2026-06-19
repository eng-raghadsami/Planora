import { useState } from "react";
import { FaArrowRight, FaStar } from "react-icons/fa";
import Navbar from "../components/Navbar";
import HintLabel from "../components/HintLabel";
import {
  getValidationErrors,
  hasRequiredFields,
  formatCurrency,
} from "../lib/planning";

export default function Simulation({
  setPage,
  formData,
  setFormData,
  calculateResults,
  simulationOptions,
  loading,
  error,
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
  onGoPricing,
}) {
  const [submitted, setSubmitted] = useState(false);
  const hasValidationErrors = !hasRequiredFields(formData) || Object.keys(getValidationErrors(formData, true)).length > 0;
  const visibleErrors = getValidationErrors(formData, submitted);
  const businessTypes = simulationOptions?.business_types ?? [];
  const fieldOptions = simulationOptions?.field_options ?? {};
  const locations = simulationOptions?.locations ?? {};
  const countryOptions = Object.keys(locations);
  const cityOptions = Object.keys(locations[formData.country] ?? {});
  const defaults = simulationOptions?.business_defaults?.[formData.businessType] ?? {};
  const locationProfile = locations[formData.country]?.[formData.city] ?? {};
  const suggestedCosts = Math.round(Number(defaults.monthly_costs ?? 0) * Number(locationProfile.cost_factor ?? 1));
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

  function renderOptions(options = []) {
    return options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ));
  }

  async function runSimulation() {
    setSubmitted(true);
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
        onGoPricing={onGoPricing}
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
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <HintLabel text="Country" hint="Choose where your project will run. Example: Palestine." />
              <select
                value={formData.country}
                onChange={(e) => {
                  const nextCountry = e.target.value;
                  const firstCity = Object.keys(locations[nextCountry] ?? {})[0] ?? "";
                  setFormData((prev) => ({
                    ...prev,
                    country: nextCountry,
                    city: firstCity,
                  }));
                }}
              >
                {countryOptions.map((country) => (
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
              <p><b>Smart Suggestion:</b> For {formData.businessType} in {formData.city}, typical fixed costs start around {formatCurrency(suggestedCosts)} and average team size is {defaults.employees ?? "N/A"}.</p>
              <p><b>Local signal:</b> Typical rent range in {formData.city} is {formatCurrency(locationProfile.rent_range?.[0])} to {formatCurrency(locationProfile.rent_range?.[1])}, and average salary is around {formatCurrency(locationProfile.avg_salary)}.</p>
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
                onChange={(e) => updateField("initialInvestment", e.target.value)}
              />
              {visibleErrors.initialInvestment ? <small className="field-error">{visibleErrors.initialInvestment}</small> : null}
            </label>

            <label>
              <HintLabel text="Expected Monthly Sales ($)" hint="How much do you expect to sell per month?" />
              <input
                type="number"
                placeholder="e.g. 20000"
                value={formData.monthlySales}
                onChange={(e) => updateField("monthlySales", e.target.value)}
              />
              {visibleErrors.monthlySales ? <small className="field-error">{visibleErrors.monthlySales}</small> : null}
            </label>

            <label>
              <HintLabel text="Monthly Costs ($)" hint="Rent, salaries, bills, and running expenses per month." />
              <input
                type="number"
                placeholder="e.g. 8000"
                value={formData.monthlyCosts}
                onChange={(e) => updateField("monthlyCosts", e.target.value)}
              />
              {visibleErrors.monthlyCosts ? <small className="field-error">{visibleErrors.monthlyCosts}</small> : null}
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
                  {renderOptions(fieldOptions.growth_expectations)}
                </select>
              </label>

              <label>
                <HintLabel text="Does your business depend on seasons?" hint="Example: tourism and cafes may rise in one season and drop in another." />
                <select
                  value={formData.seasonalityDependence}
                  onChange={(e) => updateField("seasonalityDependence", e.target.value)}
                >
                  {renderOptions(fieldOptions.seasonality_dependence)}
                </select>
              </label>

              <label>
                <HintLabel text="Is your market predictable or changing a lot?" hint="Example: predictable demand = stable, frequent swings = unstable." />
                <select
                  value={formData.marketStability}
                  onChange={(e) => updateField("marketStability", e.target.value)}
                >
                  {renderOptions(fieldOptions.market_stability)}
                </select>
              </label>

              <label>
                <HintLabel text="How sure are you about your sales estimate?" hint="Example: if your estimate is still rough, choose Low confidence." />
                <select
                  value={formData.salesConfidence}
                  onChange={(e) => updateField("salesConfidence", e.target.value)}
                >
                  {renderOptions(fieldOptions.sales_confidence)}
                </select>
              </label>

              <label>
                <HintLabel text="Marketing effort level" hint="Example: a strong launch campaign can create a short-term sales spike." />
                <select
                  value={formData.marketingPlan}
                  onChange={(e) => updateField("marketingPlan", e.target.value)}
                >
                  {renderOptions(fieldOptions.marketing_plan)}
                </select>
              </label>

              <label>
                <HintLabel text="Unexpected costs risk" hint="Example: maintenance, legal fees, or urgent fixes can appear suddenly." />
                <select
                  value={formData.unexpectedCosts}
                  onChange={(e) => updateField("unexpectedCosts", e.target.value)}
                >
                  {renderOptions(fieldOptions.unexpected_costs)}
                </select>
              </label>
            </div>
          </section>
        ) : null}

        {submitted && hasValidationErrors ? <p className="error-text">Please fill in all required fields before running simulation.</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <button className="run-btn" type="button" onClick={runSimulation} disabled={loading}>
          {loading ? "Running..." : "Run Simulation"} {!loading ? <FaArrowRight style={{ marginLeft: 10 }} /> : null}
        </button>
      </section>
    </main>
  );
}
