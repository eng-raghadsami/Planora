export const emptyForm = {
  businessType: "",
  country: "",
  city: "",
  initialInvestment: "",
  monthlySales: "",
  monthlyCosts: "",
  advancedMode: false,
  growthExpectation: "slow",
  seasonalityDependence: "low",
  marketingPlan: "regular",
  unexpectedCosts: "low",
  marketStability: "moderate",
  salesConfidence: "medium",
};

export function getValidationErrors(formData, submitted = false) {
  const errors = {};
  const investment = Number(formData.initialInvestment);
  const sales = Number(formData.monthlySales);
  const costs = Number(formData.monthlyCosts);

  const hasInvestment = formData.initialInvestment !== "" && formData.initialInvestment !== null;
  const hasSales = formData.monthlySales !== "" && formData.monthlySales !== null;
  const hasCosts = formData.monthlyCosts !== "" && formData.monthlyCosts !== null;

  if (!hasInvestment || !Number.isFinite(investment) || investment < 1000 || investment > 5000000) {
    if (submitted || (hasInvestment && (!Number.isFinite(investment) || investment < 1000 || investment > 5000000))) {
      errors.initialInvestment = hasInvestment
        ? "Initial investment should be between 1,000 and 5,000,000."
        : "Initial investment is required.";
    }
  }

  if (!hasSales || !Number.isFinite(sales) || sales < 500 || sales > 2000000) {
    if (submitted || (hasSales && (!Number.isFinite(sales) || sales < 500 || sales > 2000000))) {
      errors.monthlySales = hasSales
        ? "Expected monthly sales should be between 500 and 2,000,000."
        : "Expected monthly sales is required.";
    }
  }

  if (!hasCosts || !Number.isFinite(costs) || costs < 100 || costs > 1500000) {
    if (submitted || (hasCosts && (!Number.isFinite(costs) || costs < 100 || costs > 1500000))) {
      errors.monthlyCosts = hasCosts
        ? "Monthly costs should be between 100 and 1,500,000."
        : "Monthly costs is required.";
    }
  }

  if (hasSales && hasCosts && Number.isFinite(sales) && Number.isFinite(costs) && costs > sales * 2.5) {
    errors.monthlyCosts = "Monthly costs look too high compared to monthly sales.";
  }

  return errors;
}

export function hasRequiredFields(formData) {
  return formData.initialInvestment !== "" && formData.monthlySales !== "" && formData.monthlyCosts !== "";
}

export function formatCurrency(value) {
  const amount = Number(value ?? 0);
  return `$${amount.toLocaleString()}`;
}

export function formatRisk(riskLevel) {
  if (!riskLevel) {
    return "N/A";
  }

  return String(riskLevel).charAt(0).toUpperCase() + String(riskLevel).slice(1);
}

export function getLocationLabel(country, city) {
  return city && country ? `${city}, ${country}` : "N/A";
}

export function seasonalityLabel(value) {
  if (value === "summer_down_winter_up") {
    return "Summer down / Winter up";
  }
  if (value === "summer_up_winter_down") {
    return "Summer up / Winter down";
  }
  return "Flat all year";
}

export function buildCashFlowChart(cashFlow = [], zoomLevel = 1) {
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
    const x = cashFlow.length === 1
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

export function getSeasonalityReason(month, profile) {
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

export function getCashFlowReasons(month, breakdown = {}) {
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

export function getCostItems(breakdown = {}) {
  return [
    { key: "rent", label: "Rent", value: Number(breakdown.rent ?? 0), color: "#2d86df", dotClass: "blue" },
    { key: "staff", label: "Staff Setup", value: Number(breakdown.staff ?? 0), color: "#18a878", dotClass: "green" },
    { key: "equipment", label: "Equipment", value: Number(breakdown.equipment ?? 0), color: "#ffd158", dotClass: "yellow" },
    { key: "marketing", label: "Marketing", value: Number(breakdown.marketing ?? 0), color: "#a365e8", dotClass: "purple" },
  ];
}

export function buildDonutGradient(costItems) {
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
