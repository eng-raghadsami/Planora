import { useEffect, useState, useRef } from "react";
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
import {
  BrainCircuit,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart2,
  Shuffle,
  Lightbulb,
  Target,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Zap,
  Layers,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";
import logoPng from "./assets/logo.png";
import { simulate, getScenarios, getAI } from "./api";


const BUSINESS_DEFAULTS = {
  "Retail Store": { employees: 6, monthlyCosts: 3000, projectSize: "Small", seasonalityProfile: "summer_up_winter_down" },
  Cafe: { employees: 8, monthlyCosts: 2500, projectSize: "Medium", seasonalityProfile: "summer_down_winter_up" },
  "Online Business": { employees: 4, monthlyCosts: 1400, projectSize: "Small", seasonalityProfile: "flat" },
  "Freelance Service": { employees: 2, monthlyCosts: 900, projectSize: "Small", seasonalityProfile: "flat" },
};

const LOCATION_DEFAULT_PROFILE = {
  costFactor: 1,
  salesFactor: 1,
  volatilityAdjust: 0,
  rentRange: [700, 1300],
  avgSalary: 600,
};

const LOCATION_PROFILES = {
  Palestine: {
    Gaza: { costFactor: 0.88, salesFactor: 0.87, volatilityAdjust: 4, rentRange: [500, 850], avgSalary: 420 },
    Ramallah: { costFactor: 1.06, salesFactor: 1.11, volatilityAdjust: -1, rentRange: [950, 1600], avgSalary: 850 },
    Nablus: { costFactor: 0.95, salesFactor: 0.98, volatilityAdjust: 1, rentRange: [700, 1200], avgSalary: 620 },
    "Bethlehem": { costFactor: 0.98, salesFactor: 1.02, volatilityAdjust: 0, rentRange: [650, 1100], avgSalary: 580 },
    "Jenin": { costFactor: 0.92, salesFactor: 0.95, volatilityAdjust: 2, rentRange: [600, 1000], avgSalary: 500 },
    "Tulkarm": { costFactor: 0.93, salesFactor: 0.96, volatilityAdjust: 1, rentRange: [620, 1050], avgSalary: 510 },
    "Qalqiliya": { costFactor: 0.90, salesFactor: 0.93, volatilityAdjust: 2, rentRange: [550, 900], avgSalary: 480 },
    "Hebron": { costFactor: 0.89, salesFactor: 0.91, volatilityAdjust: 2, rentRange: [580, 950], avgSalary: 490 },
  },
  Jordan: {
    Amman: { costFactor: 1.1, salesFactor: 1.12, volatilityAdjust: -1, rentRange: [1100, 1900], avgSalary: 920 },
    Irbid: { costFactor: 0.93, salesFactor: 0.94, volatilityAdjust: 1, rentRange: [650, 1050], avgSalary: 560 },
    Zarqa: { costFactor: 0.91, salesFactor: 0.92, volatilityAdjust: 2, rentRange: [600, 950], avgSalary: 520 },
    "Salt": { costFactor: 0.88, salesFactor: 0.89, volatilityAdjust: 2, rentRange: [550, 850], avgSalary: 480 },
    Aqaba: { costFactor: 1.05, salesFactor: 1.08, volatilityAdjust: 0, rentRange: [950, 1500], avgSalary: 780 },
    Madaba: { costFactor: 0.87, salesFactor: 0.88, volatilityAdjust: 2, rentRange: [520, 800], avgSalary: 450 },
  },
  Egypt: {
    Cairo: { costFactor: 1.02, salesFactor: 1.03, volatilityAdjust: 0, rentRange: [900, 1700], avgSalary: 760 },
    Alexandria: { costFactor: 0.97, salesFactor: 0.99, volatilityAdjust: 1, rentRange: [780, 1350], avgSalary: 660 },
    Giza: { costFactor: 1.00, salesFactor: 1.01, volatilityAdjust: 0, rentRange: [850, 1600], avgSalary: 720 },
    Aswan: { costFactor: 0.85, salesFactor: 0.87, volatilityAdjust: 2, rentRange: [550, 950], avgSalary: 500 },
    Luxor: { costFactor: 0.88, salesFactor: 0.90, volatilityAdjust: 1, rentRange: [600, 1050], avgSalary: 540 },
    Mansoura: { costFactor: 0.92, salesFactor: 0.94, volatilityAdjust: 1, rentRange: [700, 1200], avgSalary: 600 },
    Tanta: { costFactor: 0.90, salesFactor: 0.92, volatilityAdjust: 1, rentRange: [680, 1150], avgSalary: 570 },
  },
  Lebanon: {
    Beirut: { costFactor: 1.15, salesFactor: 1.18, volatilityAdjust: -1, rentRange: [1300, 2200], avgSalary: 1100 },
    Tripoli: { costFactor: 0.95, salesFactor: 0.97, volatilityAdjust: 2, rentRange: [700, 1200], avgSalary: 620 },
    Sidon: { costFactor: 0.93, salesFactor: 0.95, volatilityAdjust: 1, rentRange: [680, 1100], avgSalary: 580 },
  },
  Syria: {
    Damascus: { costFactor: 0.85, salesFactor: 0.83, volatilityAdjust: 3, rentRange: [500, 900], avgSalary: 450 },
    Aleppo: { costFactor: 0.82, salesFactor: 0.80, volatilityAdjust: 4, rentRange: [450, 800], avgSalary: 400 },
  },
  "United Arab Emirates": {
    Dubai: { costFactor: 1.35, salesFactor: 1.40, volatilityAdjust: -1, rentRange: [1800, 3000], avgSalary: 1500 },
    "Abu Dhabi": { costFactor: 1.32, salesFactor: 1.38, volatilityAdjust: 0, rentRange: [1700, 2800], avgSalary: 1450 },
    Sharjah: { costFactor: 1.15, salesFactor: 1.18, volatilityAdjust: 0, rentRange: [1200, 1900], avgSalary: 1000 },
  },
  "Saudi Arabia": {
    Riyadh: { costFactor: 1.20, salesFactor: 1.22, volatilityAdjust: 0, rentRange: [1400, 2300], avgSalary: 1200 },
    Jeddah: { costFactor: 1.18, salesFactor: 1.20, volatilityAdjust: 0, rentRange: [1300, 2100], avgSalary: 1100 },
    Dammam: { costFactor: 1.16, salesFactor: 1.18, volatilityAdjust: 0, rentRange: [1200, 1950], avgSalary: 1050 },
  },
  "United Kingdom": {
    London: { costFactor: 1.50, salesFactor: 1.55, volatilityAdjust: -1, rentRange: [1800, 3500], avgSalary: 1800 },
    Manchester: { costFactor: 1.20, salesFactor: 1.22, volatilityAdjust: 0, rentRange: [1100, 1900], avgSalary: 1200 },
    Birmingham: { costFactor: 1.15, salesFactor: 1.17, volatilityAdjust: 0, rentRange: [1000, 1700], avgSalary: 1100 },
  },
  "United States": {
    "New York": { costFactor: 1.60, salesFactor: 1.65, volatilityAdjust: -1, rentRange: [2000, 3800], avgSalary: 2000 },
    "Los Angeles": { costFactor: 1.55, salesFactor: 1.60, volatilityAdjust: 0, rentRange: [1800, 3500], avgSalary: 1900 },
    "Chicago": { costFactor: 1.25, salesFactor: 1.28, volatilityAdjust: 0, rentRange: [1200, 2000], avgSalary: 1300 },
    "Texas": { costFactor: 1.10, salesFactor: 1.12, volatilityAdjust: 0, rentRange: [1000, 1700], avgSalary: 1150 },
  },
  Canada: {
    Toronto: { costFactor: 1.35, salesFactor: 1.38, volatilityAdjust: 0, rentRange: [1400, 2400], avgSalary: 1400 },
    Vancouver: { costFactor: 1.40, salesFactor: 1.42, volatilityAdjust: 0, rentRange: [1500, 2600], avgSalary: 1500 },
    Montreal: { costFactor: 1.20, salesFactor: 1.22, volatilityAdjust: 0, rentRange: [1100, 1900], avgSalary: 1200 },
  },
  Germany: {
    Berlin: { costFactor: 1.25, salesFactor: 1.28, volatilityAdjust: 0, rentRange: [1200, 2000], avgSalary: 1300 },
    Munich: { costFactor: 1.35, salesFactor: 1.38, volatilityAdjust: 0, rentRange: [1400, 2300], avgSalary: 1450 },
    Hamburg: { costFactor: 1.28, salesFactor: 1.30, volatilityAdjust: 0, rentRange: [1250, 2050], avgSalary: 1350 },
  },
};

const initialForm = {
  businessType: "Cafe",
  country: "Palestine",
  city: "Gaza",
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

function getCountryOptions() {
  return Object.keys(LOCATION_PROFILES);
}

function getCityOptions(country) {
  const countryProfile = LOCATION_PROFILES[country];
  if (!countryProfile) {
    return Object.keys(LOCATION_PROFILES.Palestine);
  }
  return Object.keys(countryProfile);
}

function getLocationProfile(country, city) {
  return LOCATION_PROFILES[country]?.[city] || LOCATION_DEFAULT_PROFILE;
}

function getLocationLabel(country, city) {
  return `${city}, ${country}`;
}

function riskLevelToScore(riskLevel) {
  if (String(riskLevel).toLowerCase() === "high") {
    return 3;
  }
  if (String(riskLevel).toLowerCase() === "medium") {
    return 2;
  }
  return 1;
}

function scoreToRiskLevel(score) {
  if (score >= 2.5) {
    return "High";
  }
  if (score >= 1.5) {
    return "Medium";
  }
  return "Low";
}

function buildLocationComparison(input) {
  const {
    country,
    baseCity,
    compareCity,
    monthlySales,
    monthlyCosts,
    baseRiskLevel,
  } = input;

  if (!compareCity) {
    return null;
  }

  const baseProfile = getLocationProfile(country, baseCity);
  const compareProfile = getLocationProfile(country, compareCity);
  const safeSales = Math.max(0, Number(monthlySales) || 0);
  const safeCosts = Math.max(0, Number(monthlyCosts) || 0);

  const baseRow = {
    city: baseCity,
    monthlySales: safeSales,
    monthlyCosts: safeCosts,
    monthlyProfit: safeSales - safeCosts,
    riskLevel: formatRisk(baseRiskLevel),
  };

  const salesFactor = compareProfile.salesFactor / Math.max(baseProfile.salesFactor, 0.01);
  const costsFactor = compareProfile.costFactor / Math.max(baseProfile.costFactor, 0.01);
  const compareSales = safeSales * salesFactor;
  const compareCosts = safeCosts * costsFactor;
  const compareRiskScore = Math.max(1, Math.min(3, riskLevelToScore(baseRiskLevel) + (compareProfile.volatilityAdjust - baseProfile.volatilityAdjust) / 3));

  const compareRow = {
    city: compareCity,
    monthlySales: compareSales,
    monthlyCosts: compareCosts,
    monthlyProfit: compareSales - compareCosts,
    riskLevel: scoreToRiskLevel(compareRiskScore),
  };

  const betterLocation = compareRow.monthlyProfit > baseRow.monthlyProfit ? compareRow.city : baseRow.city;

  return { baseRow, compareRow, betterLocation };
}

function projectSizeFromCapital(capital) {
  if (capital >= 120000) {
    return "large";
  }
  if (capital >= 55000) {
    return "medium";
  }
  return "small";
}

function mapGrowthExpectation(value) {
  if (value === "fast") {
    return 2.0;
  }
  if (value === "none") {
    return 0;
  }
  return 1.0;
}

function mapSeasonalitySettings(dependence, businessType) {
  if (dependence === "none") {
    return { profile: "flat", strength: 0 };
  }

  const fallbackProfile = BUSINESS_DEFAULTS[businessType]?.seasonalityProfile || "flat";
  const strength = dependence === "high" ? 22 : 12;

  return { profile: fallbackProfile, strength };
}

function mapMarketStability(value) {
  if (value === "stable") {
    return 6;
  }
  if (value === "unstable") {
    return 20;
  }
  return 12;
}

function mapSalesConfidenceAdjust(value) {
  if (value === "low") {
    return 4;
  }
  if (value === "high") {
    return -3;
  }
  return 0;
}

function mapMarketingPlan(value) {
  if (value === "none") {
    return { month: null, boost: 0 };
  }
  if (value === "strong") {
    return { month: 11, boost: 24 };
  }
  return { month: 11, boost: 14 };
}

function mapUnexpectedCosts(value) {
  if (value === "none") {
    return { month: null, amount: 0 };
  }
  if (value === "high") {
    return { month: 7, amount: 5500 };
  }
  return { month: 7, amount: 2500 };
}

function getValidationErrors(formData, submitted = false) {
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

function hasRequiredFields(formData) {
  return formData.initialInvestment !== "" && formData.monthlySales !== "" && formData.monthlyCosts !== "";
}

function buildSimulationPayload(formData) {
  const defaults = BUSINESS_DEFAULTS[formData.businessType] || BUSINESS_DEFAULTS.Cafe;
  const locationProfile = getLocationProfile(formData.country, formData.city);
  const projectSize = projectSizeFromCapital(Number(formData.initialInvestment));
  const employees = defaults.employees;
  const marketing = mapMarketingPlan(formData.marketingPlan);
  const unexpected = mapUnexpectedCosts(formData.unexpectedCosts);
  const seasonality = mapSeasonalitySettings(formData.seasonalityDependence, formData.businessType);

  const baseVolatility = mapMarketStability(formData.marketStability);

  return {
    capital: Number(formData.initialInvestment),
    size: projectSize,
    project_type: `${formData.businessType} (${getLocationLabel(formData.country, formData.city)})`,
    monthly_sales: Number(formData.monthlySales),
    monthly_costs: Number(formData.monthlyCosts),
    employees,
    seasonality_profile: seasonality.profile,
    seasonality_strength_percent: seasonality.strength,
    monthly_growth_percent: mapGrowthExpectation(formData.growthExpectation),
    cost_growth_percent: 0.6,
    volatility_percent: Math.max(0, Math.min(30, baseVolatility + mapSalesConfidenceAdjust(formData.salesConfidence) + locationProfile.volatilityAdjust)),
    shock_month: unexpected.month,
    shock_amount: unexpected.amount,
    campaign_month: marketing.month,
    campaign_boost_percent: marketing.boost,
  };
}

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

function seasonalityLabel(value) {
  if (value === "summer_down_winter_up") {
    return "Summer down / Winter up";
  }
  if (value === "summer_up_winter_down") {
    return "Summer up / Winter down";
  }
  return "Flat all year";
}

function buildCashFlowChart(cashFlow = [], zoomLevel = 1) {
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

  return { points, linePoints, areaPoints, viewWidth: Math.ceil(xEnd + 20) };
}

function getSeasonalityReason(month, profile) {
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

function getCashFlowReasons(month, breakdown = {}) {
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

function getCostItems(breakdown = {}) {
  return [
    { key: "rent", label: "Rent", value: Number(breakdown.rent ?? 0), color: "#2d86df", dotClass: "blue" },
    { key: "staff", label: "Staff Setup", value: Number(breakdown.staff ?? 0), color: "#18a878", dotClass: "green" },
    { key: "equipment", label: "Equipment", value: Number(breakdown.equipment ?? 0), color: "#ffd158", dotClass: "yellow" },
    { key: "marketing", label: "Marketing", value: Number(breakdown.marketing ?? 0), color: "#a365e8", dotClass: "purple" },
  ];
}

function buildDonutGradient(costItems) {
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

/* ─── Custom AI Neural-Orb Icon ──────────────────────────── */
function AIPlanetIcon({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="aip-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="45%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <radialGradient id="aip-shine" cx="36%" cy="28%" r="55%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.42)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      {/* Outer glow ring */}
      <circle cx="24" cy="24" r="23" fill="none" stroke="url(#aip-grad)" strokeWidth="1" strokeOpacity="0.35" />
      {/* Main orb */}
      <circle cx="24" cy="24" r="19" fill="url(#aip-grad)" />
      <circle cx="24" cy="24" r="19" fill="url(#aip-shine)" />
      {/* Hexagonal neural nodes */}
      <circle cx="24"   cy="9.5"  r="2.8" fill="white" opacity="0.93" />
      <circle cx="36"   cy="16.5" r="2.2" fill="white" opacity="0.78" />
      <circle cx="36"   cy="31.5" r="2.8" fill="white" opacity="0.93" />
      <circle cx="24"   cy="38.5" r="2.2" fill="white" opacity="0.78" />
      <circle cx="12"   cy="31.5" r="2.8" fill="white" opacity="0.93" />
      <circle cx="12"   cy="16.5" r="2.2" fill="white" opacity="0.78" />
      {/* Outer ring connections */}
      <line x1="24" y1="9.5"  x2="36" y2="16.5" stroke="white" strokeWidth="1.3" strokeOpacity="0.55" />
      <line x1="36" y1="16.5" x2="36" y2="31.5" stroke="white" strokeWidth="1.3" strokeOpacity="0.55" />
      <line x1="36" y1="31.5" x2="24" y2="38.5" stroke="white" strokeWidth="1.3" strokeOpacity="0.55" />
      <line x1="24" y1="38.5" x2="12" y2="31.5" stroke="white" strokeWidth="1.3" strokeOpacity="0.55" />
      <line x1="12" y1="31.5" x2="12" y2="16.5" stroke="white" strokeWidth="1.3" strokeOpacity="0.55" />
      <line x1="12" y1="16.5" x2="24" y2="9.5"  stroke="white" strokeWidth="1.3" strokeOpacity="0.55" />
      {/* Spokes to center (dashed) */}
      <line x1="24" y1="24" x2="24"   y2="9.5"  stroke="white" strokeWidth="0.9" strokeOpacity="0.28" strokeDasharray="2 2.5" />
      <line x1="24" y1="24" x2="36"   y2="16.5" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" strokeDasharray="2 2.5" />
      <line x1="24" y1="24" x2="36"   y2="31.5" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" strokeDasharray="2 2.5" />
      <line x1="24" y1="24" x2="24"   y2="38.5" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" strokeDasharray="2 2.5" />
      <line x1="24" y1="24" x2="12"   y2="31.5" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" strokeDasharray="2 2.5" />
      <line x1="24" y1="24" x2="12"   y2="16.5" stroke="white" strokeWidth="0.9" strokeOpacity="0.28" strokeDasharray="2 2.5" />
      {/* Center node */}
      <circle cx="24" cy="24" r="4.2" fill="white" opacity="0.96" />
      <circle cx="24" cy="24" r="2.2" fill="url(#aip-grad)" />
    </svg>
  );
}

/* ─── PDF Generation (html2canvas + jsPDF) ──────────────── */
async function downloadReport(elementId, filename = "planora-report.pdf") {
  const element = document.getElementById(elementId);
  if (!element) { window.print(); return; }

  // Reveal hidden AI tab panels for full capture
  const hiddenPanels = [...element.querySelectorAll(".ai-tab-panel")];
  const prevPanelDisplay = hiddenPanels.map((p) => p.style.display);
  hiddenPanels.forEach((p) => { p.style.display = "block"; });

  // Reveal rec bodies
  const recBodies = [...element.querySelectorAll(".ai-rec-body")];
  const prevRecDisplay = recBodies.map((r) => r.style.display);
  recBodies.forEach((r) => { r.style.display = "block"; });

  // Unwrap cashflow horizontal scroll
  const track = element.querySelector(".cashflow-cards-track");
  const prevTrack = track ? { overflow: track.style.overflowX, wrap: track.style.flexWrap } : null;
  if (track) { track.style.overflowX = "visible"; track.style.flexWrap = "wrap"; }

  // Hide interactive chrome
  const toHide = [
    ...element.querySelectorAll(".ai-chat-panel, .ai-tab-nav, .zoom-controls, .chart-toolbar button, .dashboard-actions, .ai-header-actions"),
  ];
  const prevHideDisplay = toHide.map((el) => el.style.display);
  toHide.forEach((el) => { el.style.display = "none"; });

  try {
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#f7f9fc",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();
    const ratio = pw / canvas.width;
    const sh = canvas.height * ratio;

    let pageY = 0;
    let remaining = sh;
    pdf.addImage(imgData, "JPEG", 0, pageY, pw, sh);
    remaining -= ph;
    while (remaining > 0) {
      pageY -= ph;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, pageY, pw, sh);
      remaining -= ph;
    }

    pdf.save(filename);
  } catch (err) {
    console.error("PDF generation failed, falling back to print:", err);
    window.print();
  } finally {
    hiddenPanels.forEach((p, i) => { p.style.display = prevPanelDisplay[i]; });
    recBodies.forEach((r, i) => { r.style.display = prevRecDisplay[i]; });
    if (track && prevTrack) { track.style.overflowX = prevTrack.overflow; track.style.flexWrap = prevTrack.wrap; }
    toHide.forEach((el, i) => { el.style.display = prevHideDisplay[i]; });
  }
}

function Logo({ onClick }) {
  return (
    <button type="button" className="logo logo-btn" onClick={onClick} aria-label="Go to home page">
      <div className="logo-img-wrap">
        <img src={logoPng} alt="Planora" className="logo-img" />
      </div>
      <span className="logo-text">Planora</span>
    </button>
  );
}

function Navbar({
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
}) {
  return (
    <header className="navbar">
      <Logo onClick={onGoHome} />

      <nav className="nav-links">
        <button onClick={onGoHome}>Home</button>
        <button onClick={onGoFeatures}>Features</button>
        <button onClick={onGoHowItWorks || onGoFeatures}>How It Works</button>
        <button onClick={onGoUseCases || onGoAbout}>Use Cases</button>
        <button onClick={onGoFaq || onGoAbout}>FAQ</button>
        <button onClick={onGoAbout}>About</button>
      </nav>

      <button className="primary-btn" onClick={onStartSimulation}>
        Start Simulation
      </button>
    </header>
  );
}

function Home({
  setPage,
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
}) {
  const [plannerMode, setPlannerMode] = useState("balance");
  const [reservePercent, setReservePercent] = useState(36);
  const [expenseControl, setExpenseControl] = useState(20);
  const [activeFlowStep, setActiveFlowStep] = useState(1);
  const [openFaq, setOpenFaq] = useState(1);
  const [spotlight, setSpotlight] = useState({ x: 40, y: 45 });
  const plannerModes = {
    save: { label: "Save", balanceFactor: 1.2, burnFactor: 0.9, points: "8,98 40,87 72,81 104,70 136,57 168,46" },
    balance: { label: "Balance", balanceFactor: 1.0, burnFactor: 1.0, points: "8,96 40,85 72,84 104,72 136,66 168,58" },
    adjust: { label: "Adjust", balanceFactor: 0.88, burnFactor: 1.08, points: "8,97 40,90 72,89 104,82 136,77 168,72" },
  };
  const activePlanner = plannerModes[plannerMode];
  const safeReserve = Math.max(10, Math.min(80, Number(reservePercent) || 10));
  const safeControl = Math.max(0, Math.min(45, Number(expenseControl) || 0));
  const balanceTarget = Math.round(70000 * (safeReserve / 100) * activePlanner.balanceFactor);
  const adjustedMonthlyBurn = Math.round(6200 * (1 - safeControl / 100) * activePlanner.burnFactor);
  const runwayMonths = Math.max(1, Math.round(balanceTarget / Math.max(1400, adjustedMonthlyBurn)));
  const flowSteps = [
    {
      id: 1,
      title: "Input Essentials",
      text: "Add your investment, expected sales, and monthly costs in less than a minute.",
    },
    {
      id: 2,
      title: "Stress-Test Scenarios",
      text: "Simulate seasonality, risk, and unexpected costs to avoid blind spots.",
    },
    {
      id: 3,
      title: "Decide With Confidence",
      text: "Use AI-backed recommendations and monthly visibility before spending money.",
    },
  ];
  const activeStepContent = flowSteps.find((step) => step.id === activeFlowStep) || flowSteps[0];
  const faqs = [
    {
      id: 1,
      q: "Can I use Planora if I only have rough numbers?",
      a: "Yes. The simulation is designed for quick estimates first, then refinement as your numbers become clearer.",
    },
    {
      id: 2,
      q: "Does Planora handle risky or seasonal businesses?",
      a: "Yes. You can model seasonality, volatility, marketing impact, and surprise costs to mimic real-world movement.",
    },
    {
      id: 3,
      q: "What if my business type is not listed exactly?",
      a: "Choose the closest type. Planora still lets you customize all important assumptions and stress scenarios.",
    },
  ];

  function handleHeroMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setSpotlight({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }

  return (
    <main className="page home-page">
      <Navbar
        onGoHome={onGoHome}
        onGoFeatures={onGoFeatures}
        onGoHowItWorks={onGoHowItWorks}
        onGoUseCases={onGoUseCases}
        onGoFaq={onGoFaq}
        onGoAbout={onGoAbout}
        onStartSimulation={onStartSimulation}
      />

      <section
        className="hero-section interactive-hero"
        onMouseMove={handleHeroMouseMove}
        style={{
          "--spot-x": `${spotlight.x}%`,
          "--spot-y": `${spotlight.y}%`,
        }}
      >
        <div className="hero-text">
          <p className="eyebrow">SMART BUSINESS PLANNING</p>
          <h1>Plan Smarter Before You Spend a Single Dollar</h1>
          <p>
            Build realistic scenarios, preview cash flow movement, and make confident launch decisions.
          </p>
          <button className="primary-btn large" onClick={onStartSimulation}>
            Start Now <FaArrowRight style={{ marginLeft: 10 }} />
          </button>

          <div className="home-live-strip">
            <span>Live Planning Preview</span>
            <span>Risk-aware scenarios</span>
            <span>AI-backed recommendations</span>
          </div>
        </div>

        <div className="hero-visual-stack">
          <div className="hero-balance-lab" aria-label="interactive save balance adjust panel">
            <div className="hero-lab-header">
              <strong>Save Balance Adjust</strong>
              <small>Interactive runway preview</small>
            </div>

            <div className="planner-mode-tabs">
              <button
                type="button"
                className={plannerMode === "save" ? "active" : ""}
                onClick={() => setPlannerMode("save")}
              >
                Save
              </button>
              <button
                type="button"
                className={plannerMode === "balance" ? "active" : ""}
                onClick={() => setPlannerMode("balance")}
              >
                Balance
              </button>
              <button
                type="button"
                className={plannerMode === "adjust" ? "active" : ""}
                onClick={() => setPlannerMode("adjust")}
              >
                Adjust
              </button>
            </div>

            <div className="planner-sliders">
              <label htmlFor="reserve-range">
                Reserve target
                <span>{safeReserve}%</span>
              </label>
              <input
                id="reserve-range"
                type="range"
                min="10"
                max="80"
                value={safeReserve}
                onChange={(event) => setReservePercent(event.target.value)}
              />
              <label htmlFor="control-range">
                Expense control
                <span>{safeControl}%</span>
              </label>
              <input
                id="control-range"
                type="range"
                min="0"
                max="45"
                value={safeControl}
                onChange={(event) => setExpenseControl(event.target.value)}
              />
            </div>

            <div className="planner-kpis">
              <article>
                <small>Target Balance</small>
                <strong>{formatCurrency(balanceTarget)}</strong>
              </article>
              <article>
                <small>Monthly Burn</small>
                <strong>{formatCurrency(adjustedMonthlyBurn)}</strong>
              </article>
              <article>
                <small>Runway</small>
                <strong>{runwayMonths} mo</strong>
              </article>
            </div>

            <svg className="planner-graph" viewBox="0 0 176 110">
              <polyline points={activePlanner.points} />
              <circle cx="8" cy="98" r="4" />
              <circle cx="168" cy={plannerMode === "save" ? "46" : plannerMode === "balance" ? "58" : "72"} r="5" />
            </svg>

            <p className="planner-tip">
              {plannerMode === "save"
                ? "Save mode prioritizes cash protection and longer runway."
                : plannerMode === "balance"
                ? "Balance mode keeps steady growth with controlled burn."
                : "Adjust mode favors flexibility when market conditions shift."}
            </p>
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

      <section id="how-it-works" className="flow-section">
        <h2>How Planora Works</h2>
        <div className="flow-step-tabs">
          {flowSteps.map((step) => (
            <button
              key={`flow-step-${step.id}`}
              type="button"
              className={activeFlowStep === step.id ? "active" : ""}
              onClick={() => setActiveFlowStep(step.id)}
            >
              {step.id}. {step.title}
            </button>
          ))}
        </div>
        <div className="flow-panel">
          <h3>{activeStepContent.title}</h3>
          <p>{activeStepContent.text}</p>
        </div>
      </section>

      <section id="use-cases" className="use-cases-section">
        <h2>Built For Real Founders</h2>
        <div className="use-cases-grid">
          <article>
            <h3>New Cafe Launch</h3>
            <p>Estimate break-even timing before signing a rental contract.</p>
          </article>
          <article>
            <h3>Retail Expansion</h3>
            <p>Compare best/worst case months before opening the second branch.</p>
          </article>
          <article>
            <h3>Freelancer Studio</h3>
            <p>Plan monthly runway and protect against unstable demand periods.</p>
          </article>
        </div>
      </section>

      <section id="faq" className="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((item) => (
            <article key={`faq-${item.id}`} className={`faq-item ${openFaq === item.id ? "open" : ""}`}>
              <button type="button" onClick={() => setOpenFaq(item.id)}>
                <strong>{item.q}</strong>
                <span>{openFaq === item.id ? "-" : "+"}</span>
              </button>
              {openFaq === item.id ? <p>{item.a}</p> : null}
            </article>
          ))}
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

function HintLabel({ text, hint }) {
  return (
    <span className="label-row">
      {text}
      <span className="help-icon" title={hint} aria-label={hint}>i</span>
    </span>
  );
}

function Simulation({
  setPage,
  formData,
  setFormData,
  calculateResults,
  loading,
  error,
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
}) {
  const [submitted, setSubmitted] = useState(false);
  const validationErrors = getValidationErrors(formData, submitted);
  const hasValidationErrors = !hasRequiredFields(formData) || Object.keys(getValidationErrors(formData, true)).length > 0;
  const visibleErrors = getValidationErrors(formData, submitted);
  const defaults = BUSINESS_DEFAULTS[formData.businessType] || BUSINESS_DEFAULTS.Cafe;
  const cityOptions = getCityOptions(formData.country);
  const locationProfile = getLocationProfile(formData.country, formData.city);
  const suggestedCosts = Math.round(defaults.monthlyCosts * locationProfile.costFactor);
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
                <option>Retail Store</option>
                <option>Cafe</option>
                <option>Online Business</option>
                <option>Freelance Service</option>
              </select>
            </label>

            <label>
              <HintLabel text="Country" hint="Choose where your project will run. Example: Palestine." />
              <select
                value={formData.country}
                onChange={(e) => {
                  const nextCountry = e.target.value;
                  const firstCity = getCityOptions(nextCountry)[0];
                  setFormData((prev) => ({
                    ...prev,
                    country: nextCountry,
                    city: firstCity,
                  }));
                }}
              >
                {getCountryOptions().map((country) => (
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
              <p><b>Smart Suggestion:</b> For {formData.businessType} in {formData.city}, typical fixed costs start around {formatCurrency(suggestedCosts)} and average team size is {defaults.employees}.</p>
              <p><b>Local signal:</b> Typical rent range in {formData.city} is {formatCurrency(locationProfile.rentRange[0])} to {formatCurrency(locationProfile.rentRange[1])}, and average salary is around {formatCurrency(locationProfile.avgSalary)}.</p>
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
                onChange={(e) => updateField("initialInvestment", Number(e.target.value))}
              />
              {visibleErrors.initialInvestment ? <small className="field-error">{visibleErrors.initialInvestment}</small> : null}
            </label>

            <label>
              <HintLabel text="Expected Monthly Sales ($)" hint="How much do you expect to sell per month?" />
              <input
                type="number"
                placeholder="e.g. 20000"
                value={formData.monthlySales}
                onChange={(e) => updateField("monthlySales", Number(e.target.value))}
              />
              {visibleErrors.monthlySales ? <small className="field-error">{visibleErrors.monthlySales}</small> : null}
            </label>

            <label>
              <HintLabel text="Monthly Costs ($)" hint="Rent, salaries, bills, and running expenses per month." />
              <input
                type="number"
                placeholder="e.g. 8000"
                value={formData.monthlyCosts}
                onChange={(e) => updateField("monthlyCosts", Number(e.target.value))}
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
                  <option value="none">No</option>
                  <option value="slow">Slow growth</option>
                  <option value="fast">Fast growth</option>
                </select>
              </label>

              <label>
                <HintLabel text="Does your business depend on seasons?" hint="Example: tourism and cafes may rise in one season and drop in another." />
                <select
                  value={formData.seasonalityDependence}
                  onChange={(e) => updateField("seasonalityDependence", e.target.value)}
                >
                  <option value="none">No</option>
                  <option value="low">A little</option>
                  <option value="high">A lot</option>
                </select>
              </label>

              <label>
                <HintLabel text="Is your market predictable or changing a lot?" hint="Example: predictable demand = stable, frequent swings = unstable." />
                <select
                  value={formData.marketStability}
                  onChange={(e) => updateField("marketStability", e.target.value)}
                >
                  <option value="stable">Stable</option>
                  <option value="moderate">Moderate</option>
                  <option value="unstable">Unstable</option>
                </select>
              </label>

              <label>
                <HintLabel text="How sure are you about your sales estimate?" hint="Example: if your estimate is still rough, choose Low confidence." />
                <select
                  value={formData.salesConfidence}
                  onChange={(e) => updateField("salesConfidence", e.target.value)}
                >
                  <option value="high">High confidence</option>
                  <option value="medium">Medium confidence</option>
                  <option value="low">Low confidence</option>
                </select>
              </label>

              <label>
                <HintLabel text="Marketing effort level" hint="Example: a strong launch campaign can create a short-term sales spike." />
                <select
                  value={formData.marketingPlan}
                  onChange={(e) => updateField("marketingPlan", e.target.value)}
                >
                  <option value="none">No marketing campaign</option>
                  <option value="regular">Regular campaign</option>
                  <option value="strong">Strong campaign</option>
                </select>
              </label>

              <label>
                <HintLabel text="Unexpected costs risk" hint="Example: maintenance, legal fees, or urgent fixes can appear suddenly." />
                <select
                  value={formData.unexpectedCosts}
                  onChange={(e) => updateField("unexpectedCosts", e.target.value)}
                >
                  <option value="none">No major surprises</option>
                  <option value="low">Some surprises</option>
                  <option value="high">High chance of surprises</option>
                </select>
              </label>
            </div>
          </section>
        ) : null}

        {submitted && hasValidationErrors ? <p className="error-text">Please fill in all required fields before running simulation.</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <button className="run-btn" type="button" onClick={runSimulation} disabled={loading || hasValidationErrors}>
          {loading ? "Running..." : "Run Simulation"} {!loading ? <FaArrowRight style={{ marginLeft: 10 }} /> : null}
        </button>
      </section>
    </main>
  );
}

function Dashboard({
  setPage,
  results,
  scenarioData,
  aiData,
  formData,
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [hoveredCostKey, setHoveredCostKey] = useState(null);
  const [showLocationCompare, setShowLocationCompare] = useState(false);
  const activeCountry = formData?.country || initialForm.country;
  const activeCity = formData?.city || initialForm.city;
  const compareCandidates = getCityOptions(activeCountry).filter((city) => city !== activeCity);
  const [selectedCompareCity, setSelectedCompareCity] = useState("");
  const compareCity = compareCandidates.includes(selectedCompareCity)
    ? selectedCompareCity
    : (compareCandidates[0] || "");

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

  const lowCase = scenarioData?.low_case;
  const averageCase = scenarioData?.average_case;
  const highCase = scenarioData?.high_case;
  const locationComparison = buildLocationComparison({
    country: activeCountry,
    baseCity: activeCity,
    compareCity,
    monthlySales: formData?.monthlySales,
    monthlyCosts: formData?.monthlyCosts,
    baseRiskLevel: results.raw?.risk_level || aiData?.risk_level || "medium",
  });

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

function Metric({ title, value, green }) {
  return (
    <article className="metric-card">
      <h3>{title}</h3>
      <strong className={green ? "green-text" : ""}>{value}</strong>
    </article>
  );
}

function ScenarioComparisonCards({ scenarioData }) {
  if (!scenarioData) return <p>No scenario data available.</p>;
  
  const scenarios = [
    { key: "low_case", label: "Low Case", icon: "📉", description: "Conservative estimate" },
    { key: "average_case", label: "Average Case", icon: "📊", description: "Expected scenario" },
    { key: "high_case", label: "High Case", icon: "📈", description: "Optimistic scenario" },
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

function LocationComparisonCards({ comparison }) {
  if (!comparison) return null;

  const { baseRow, compareRow, betterLocation } = comparison;
  
  const LocationCard = ({ city, data, isBetter }) => (
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

  return (
    <div className="location-comparison-container">
      <LocationCard city={baseRow.city} data={baseRow} isBetter={betterLocation === baseRow.city} />
      <div className="vs-divider">VS</div>
      <LocationCard city={compareRow.city} data={compareRow} isBetter={betterLocation === compareRow.city} />
    </div>
  );
}

function EnhancedCashFlowCards({ cashFlow, breakdown, selectedMonth, onSelectMonth }) {
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
              <small className="card-reason">{getCashFlowReasons(item.month, breakdown).join(" • ")}</small>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Interactive AI Chat Panel ──────────────────────────── */
function AIChatPanel({ aiData, results, scenarioData }) {
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
        return `Your Financial Health Score is ${healthScore}/100 — ${lbl}.${s ? ` Key strength: ${s}` : ""}`;
      },
    },
    {
      id: "scenario",
      label: "How uncertain is my outcome?",
      answer() {
        const low = Number(scenarioData?.low_case?.monthly_profit ?? 0);
        const high = Number(scenarioData?.high_case?.monthly_profit ?? 0);
        const spread = high - low;
        return `Your scenario spread is ${formatCurrency(spread)} (${formatCurrency(low)} to ${formatCurrency(high)}/mo). ${spread > 5000 ? "High variance — keep a solid cash buffer for volatility." : "Variance is manageable with consistent monthly tracking."}`;
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
                {typing && <span className="ai-cursor">▌</span>}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const PRIORITY_COLORS = { High: "#e43135", Medium: "#f09020", Low: "#18a878" };
const CATEGORY_ICONS  = {
  "Cost Control": "💡",
  "Revenue":      "📈",
  "Cash Flow":    "💵",
  "Marketing":    "📣",
  "Monitoring":   "📊",
  "Growth":       "🚀",
  "Investment":   "💼",
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

function Insights({
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
      />

      <section className="ai-card" id="ai-report-area">

        {/* ── Header ── */}
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

        {/* ── Interactive AI Chat Panel ── */}
        <AIChatPanel aiData={aiData} results={results} scenarioData={scenarioData} />

        {/* ── Tab Navigation ── */}
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

        {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
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

        {/* ═══════════════ ANALYSIS TAB ═══════════════ */}
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

        {/* ═══════════════ RECOMMENDATIONS TAB ═══════════════ */}
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
                        <span className="ai-rec-cat-icon">{CATEGORY_ICONS[category] ?? "📌"}</span>
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

        {/* ═══════════════ PLAYBOOK TAB ═══════════════ */}
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

/* ─── Helpers ─────────────────────────────────────────── */
function fmtCardNum(val) {
  const d = val.replace(/\D/g, "").slice(0, 16);
  return d.replace(/(.{4})/g, "$1 ").trim();
}
function fmtExpiry(val) {
  const d = val.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
}
function cardType(num) {
  const d = num.replace(/\s/g, "");
  if (d.startsWith("4")) return "visa";
  if (d.startsWith("5")) return "mastercard";
  if (d.startsWith("34") || d.startsWith("37")) return "amex";
  return "generic";
}

/* ─── PaymentModal ────────────────────────────────────── */
function PaymentModal({ plan, price, amount, features, onClose, onSuccess }) {
  const [step, setStep] = useState("form"); // form | processing | success
  const [cvvFocused, setCvvFocused] = useState(false);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (card.number.replace(/\s/g, "").length < 16) e.number = "Enter a valid 16-digit card number";
    if (!card.name.trim()) e.name = "Cardholder name is required";
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry = "Use MM/YY format";
    if (card.cvv.length < 3) e.cvv = "CVV must be 3–4 digits";
    return e;
  }

  function handlePay() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      setTimeout(() => { onSuccess(plan); onClose(); }, 2200);
    }, 2600);
  }

  const type = cardType(card.number);
  const dispNum  = card.number  || "•••• •••• •••• ••••";
  const dispName = card.name    || "YOUR NAME";
  const dispExp  = card.expiry  || "MM/YY";

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && step === "form" && onClose()}>
      <div className={`payment-modal${step !== "form" ? " modal-state-only" : ""}`}>

        {/* ── FORM STEP ─────────────────────────── */}
        {step === "form" && (
          <>
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">Planora</p>
                <h2 className="modal-title">Complete Your Purchase</h2>
              </div>
              <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
            </div>

            <div className="modal-body">
              {/* Order summary */}
              <aside className="order-summary">
                <div className={`order-plan-pill order-pill-${plan.toLowerCase()}`}>{plan}</div>
                <div className="order-price">{price}<span>/month</span></div>
                <div className="order-divider" />
                <ul className="order-features">
                  {features.map((f) => (
                    <li key={f}><span className="feat-check">✓</span>{f}</li>
                  ))}
                </ul>
                <div className="order-meta">
                  <span>🔄 Cancel anytime</span>
                  <span>💳 Secure checkout</span>
                </div>
              </aside>

              {/* Card form */}
              <div className="card-form-panel">
                {/* ── Credit card visual ── */}
                <div className={`cc-card cc-${type}${cvvFocused ? " cc-flipped" : ""}`}>
                  <div className="cc-front">
                    <div className="cc-chip-row">
                      <div className="cc-chip" />
                      <div className={`cc-network cc-net-${type}`}>
                        {type === "visa" && <span className="cc-net-visa">VISA</span>}
                        {type === "mastercard" && (
                          <span className="cc-net-mc">
                            <span className="mc-circle mc-left" />
                            <span className="mc-circle mc-right" />
                          </span>
                        )}
                        {type === "amex" && <span className="cc-net-amex">AMEX</span>}
                        {type === "generic" && <span className="cc-net-generic">•••</span>}
                      </div>
                    </div>
                    <div className="cc-number">{dispNum}</div>
                    <div className="cc-bottom">
                      <div>
                        <div className="cc-label">Card Holder</div>
                        <div className="cc-value">{dispName}</div>
                      </div>
                      <div>
                        <div className="cc-label">Expires</div>
                        <div className="cc-value">{dispExp}</div>
                      </div>
                    </div>
                  </div>
                  <div className="cc-back">
                    <div className="cc-stripe" />
                    <div className="cc-cvv-row">
                      <span className="cc-label">CVV</span>
                      <div className="cc-cvv-box">{card.cvv ? "•".repeat(card.cvv.length) : "•••"}</div>
                    </div>
                  </div>
                </div>

                {/* ── Fields ── */}
                <div className="pm-field">
                  <label>Card Number</label>
                  <input
                    type="text" inputMode="numeric"
                    placeholder="1234  5678  9012  3456"
                    value={card.number}
                    maxLength={19}
                    className={errors.number ? "pm-input pm-input-err" : "pm-input"}
                    onChange={(e) => {
                      setCard((c) => ({ ...c, number: fmtCardNum(e.target.value) }));
                      setErrors((er) => ({ ...er, number: undefined }));
                    }}
                  />
                  {errors.number && <span className="pm-err">{errors.number}</span>}
                </div>

                <div className="pm-field">
                  <label>Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={card.name}
                    className={errors.name ? "pm-input pm-input-err" : "pm-input"}
                    onChange={(e) => {
                      setCard((c) => ({ ...c, name: e.target.value.toUpperCase() }));
                      setErrors((er) => ({ ...er, name: undefined }));
                    }}
                  />
                  {errors.name && <span className="pm-err">{errors.name}</span>}
                </div>

                <div className="pm-row">
                  <div className="pm-field">
                    <label>Expiry</label>
                    <input
                      type="text" inputMode="numeric"
                      placeholder="MM/YY"
                      value={card.expiry}
                      maxLength={5}
                      className={errors.expiry ? "pm-input pm-input-err" : "pm-input"}
                      onChange={(e) => {
                        setCard((c) => ({ ...c, expiry: fmtExpiry(e.target.value) }));
                        setErrors((er) => ({ ...er, expiry: undefined }));
                      }}
                    />
                    {errors.expiry && <span className="pm-err">{errors.expiry}</span>}
                  </div>
                  <div className="pm-field">
                    <label>CVV</label>
                    <input
                      type="text" inputMode="numeric"
                      placeholder="•••"
                      value={card.cvv}
                      maxLength={4}
                      className={errors.cvv ? "pm-input pm-input-err" : "pm-input"}
                      onFocus={() => setCvvFocused(true)}
                      onBlur={() => setCvvFocused(false)}
                      onChange={(e) => {
                        setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }));
                        setErrors((er) => ({ ...er, cvv: undefined }));
                      }}
                    />
                    {errors.cvv && <span className="pm-err">{errors.cvv}</span>}
                  </div>
                </div>

                <button className="pay-btn" onClick={handlePay}>
                  <span className="pay-lock">🔒</span> Pay {price} / month
                </button>
                <p className="pm-secure-note">256-bit SSL encrypted · Demo mode — no real charge</p>
              </div>
            </div>
          </>
        )}

        {/* ── PROCESSING STEP ───────────────────── */}
        {step === "processing" && (
          <div className="modal-state-center">
            <div className="proc-ring" />
            <p className="state-title">Processing payment…</p>
            <p className="state-sub">Please wait, do not close this window</p>
          </div>
        )}

        {/* ── SUCCESS STEP ──────────────────────── */}
        {step === "success" && (
          <div className="modal-state-center">
            <div className="success-burst">
              <svg className="success-circle-svg" viewBox="0 0 80 80">
                <circle className="success-ring" cx="40" cy="40" r="36" />
                <path className="success-tick" d="M22 40 l12 12 l24-24" />
              </svg>
            </div>
            <p className="state-title">Payment Successful!</p>
            <p className="state-sub">Welcome to the <strong>{plan}</strong> plan 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Pricing page ────────────────────────────────────── */
function Pricing({
  setPage,
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
}) {
  const [activePlan, setActivePlan] = useState(
    () => localStorage.getItem("planora_plan") || "Free"
  );
  const [checkout, setCheckout] = useState(null); // { title, price, amount, features }
  const [toast, setToast] = useState(null);

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  }

  function handleSuccess(planName) {
    localStorage.setItem("planora_plan", planName);
    setActivePlan(planName);
    showToast("success", `🎉 Payment successful! You are now on the ${planName} plan.`);
  }

  return (
    <main className="page pricing-page">
      <Navbar
        onGoHome={onGoHome}
        onGoFeatures={onGoFeatures}
        onGoHowItWorks={onGoHowItWorks}
        onGoUseCases={onGoUseCases}
        onGoFaq={onGoFaq}
        onGoAbout={onGoAbout}
        onStartSimulation={onStartSimulation}
      />

      {toast && (
        <div className={`payment-toast payment-toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {checkout && (
        <PaymentModal
          plan={checkout.title}
          price={checkout.price}
          amount={checkout.amount}
          features={checkout.features}
          onClose={() => setCheckout(null)}
          onSuccess={handleSuccess}
        />
      )}

      <section className="pricing-card">
        <h1>Choose Your Plan</h1>
        <p>Upgrade to unlock more features and simulations</p>

        <div className="plans-grid">
          <Plan
            title="Free"
            price="$0"
            amount={0}
            items={["Basic Simulations", "Limited Reports", "Email Support"]}
            button="Current Plan"
            isActive={activePlan === "Free"}
          />
          <Plan
            title="Pro"
            price="$9.99"
            amount={9.99}
            items={["All Features Included", "Advanced Reports", "Scenario Comparisons", "Priority Support"]}
            button={<><span>Start Pro Trial</span> <FaArrowRight style={{ marginLeft: 8 }} /></>}
            popular
            isActive={activePlan === "Pro"}
            onCheckout={setCheckout}
          />
          <Plan
            title="Premium"
            price="$19.99"
            amount={19.99}
            items={["All Pro Features", "Custom Analysis", "Dedicated Consultant", "VIP Support"]}
            button="Go Premium"
            isActive={activePlan === "Premium"}
            onCheckout={setCheckout}
          />
        </div>

        <button className="outline-btn back-btn" onClick={() => setPage("simulation")}>
          <FaArrowLeft style={{ marginRight: 8 }} /> Back to Simulation
        </button>
      </section>
    </main>
  );
}

/* ─── Plan card ───────────────────────────────────────── */
function Plan({ title, price, amount, items, button, popular, isActive, onCheckout = () => {} }) {
  const isPaid = amount > 0;
  const cardClass = ["plan-card", popular ? "popular" : "", isActive ? "active-plan" : ""]
    .filter(Boolean).join(" ");

  return (
    <article className={cardClass}>
      {popular && !isActive && <span className="popular-badge">Most Popular</span>}
      {isActive && <span className="active-plan-badge">✓ Active Plan</span>}
      <h2>{title}</h2>
      <h3>{price}<span>/ month</span></h3>
      <div className="plan-line" />
      {items.map((item) => <p key={item}>- {item}</p>)}
      <button
        className={popular ? "primary-btn plan-btn" : "outline-plan-btn"}
        disabled={isActive}
        onClick={() => isPaid && !isActive && onCheckout({ title, price, amount, features: items })}
      >
        {isActive ? "✓ Active" : button}
      </button>
    </article>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [pendingScrollTarget, setPendingScrollTarget] = useState(null);
  const [formData, setFormData] = useState(initialForm);
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

      const payload = buildSimulationPayload(formData);

      const simulationData = await simulate(payload);
      const scenarios = await getScenarios(payload);
      const monthlyRevenueFull = Number(simulationData.monthly_revenue ?? 0);
      const monthlyProfitFull  = Number(simulationData.monthly_profit ?? 0);
      const profitMarginFull   = monthlyRevenueFull > 0
        ? parseFloat(((monthlyProfitFull / monthlyRevenueFull) * 100).toFixed(1))
        : 0;

      const ai = await getAI({
        monthly_profit:     monthlyProfitFull,
        break_even_months:  simulationData.break_even_months,
        monthly_sales:      monthlyRevenueFull,
        monthly_costs:      Number(simulationData.monthly_cost ?? 0),
        initial_investment: Number(simulationData.total_cost ?? 0),
        profit_margin:      profitMarginFull,
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

  if (page === "home") {
    return (
      <Home
        setPage={setPage}
        onGoHome={goHome}
        onGoFeatures={() => goToSection("features")}
        onGoHowItWorks={() => goToSection("how-it-works")}
        onGoUseCases={() => goToSection("use-cases")}
        onGoFaq={() => goToSection("faq")}
        onGoAbout={() => goToSection("about")}
        onStartSimulation={startSimulation}
      />
    );
  }
  if (page === "simulation") {
    return (
      <Simulation
        setPage={setPage}
        formData={formData}
        setFormData={setFormData}
        calculateResults={calculateResults}
        loading={loading}
        error={error}
        onGoHome={goHome}
        onGoFeatures={() => goToSection("features")}
        onGoHowItWorks={() => goToSection("how-it-works")}
        onGoUseCases={() => goToSection("use-cases")}
        onGoFaq={() => goToSection("faq")}
        onGoAbout={() => goToSection("about")}
        onStartSimulation={startSimulation}
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
        onGoHome={goHome}
        onGoFeatures={() => goToSection("features")}
        onGoHowItWorks={() => goToSection("how-it-works")}
        onGoUseCases={() => goToSection("use-cases")}
        onGoFaq={() => goToSection("faq")}
        onGoAbout={() => goToSection("about")}
        onStartSimulation={startSimulation}
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
        onGoHome={goHome}
        onGoFeatures={() => goToSection("features")}
        onGoHowItWorks={() => goToSection("how-it-works")}
        onGoUseCases={() => goToSection("use-cases")}
        onGoFaq={() => goToSection("faq")}
        onGoAbout={() => goToSection("about")}
        onStartSimulation={startSimulation}
      />
    );
  }
  if (page === "pricing") {
    return (
      <Pricing
        setPage={setPage}
        onGoHome={goHome}
        onGoFeatures={() => goToSection("features")}
        onGoHowItWorks={() => goToSection("how-it-works")}
        onGoUseCases={() => goToSection("use-cases")}
        onGoFaq={() => goToSection("faq")}
        onGoAbout={() => goToSection("about")}
        onStartSimulation={startSimulation}
      />
    );
  }

  return (
    <Home
      setPage={setPage}
      onGoHome={goHome}
      onGoFeatures={() => goToSection("features")}
      onGoHowItWorks={() => goToSection("how-it-works")}
      onGoUseCases={() => goToSection("use-cases")}
      onGoFaq={() => goToSection("faq")}
      onGoAbout={() => goToSection("about")}
      onStartSimulation={startSimulation}
    />
  );
}
