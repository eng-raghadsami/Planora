import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Navbar from "../components/Navbar";
import { getPricingPlans } from "../api";

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

/* Payment modal */
function PaymentModal({ plan, price, features, onClose, onSuccess }) {
  const [step, setStep] = useState("form"); // form | processing | success
  const [cvvFocused, setCvvFocused] = useState(false);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (card.number.replace(/\s/g, "").length < 16) e.number = "Enter a valid 16-digit card number";
    if (!card.name.trim()) e.name = "Cardholder name is required";
    if (!/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry = "Use MM/YY format";
    if (card.cvv.length < 3) e.cvv = "CVV must be 3-4 digits";
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
  const dispNum  = card.number  || "**** **** **** ****";
  const dispName = card.name    || "YOUR NAME";
  const dispExp  = card.expiry  || "MM/YY";

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && step === "form" && onClose()}>
      <div className={`payment-modal${step !== "form" ? " modal-state-only" : ""}`}>

        {/* Form step */}
        {step === "form" && (
          <>
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">Planora</p>
                <h2 className="modal-title">Complete Your Purchase</h2>
              </div>
              <button className="modal-close" onClick={onClose} aria-label="Close">x</button>
            </div>

            <div className="modal-body">
              {/* Order summary */}
              <aside className="order-summary">
                <div className={`order-plan-pill order-pill-${plan.toLowerCase()}`}>{plan}</div>
                <div className="order-price">{price}<span>/month</span></div>
                <div className="order-divider" />
                <ul className="order-features">
                  {features.map((f) => (
                    <li key={f}><span className="feat-check">OK</span>{f}</li>
                  ))}
                </ul>
                <div className="order-meta">
                  <span>Cancel anytime</span>
                  <span>Secure checkout</span>
                </div>
              </aside>

              {/* Card form */}
              <div className="card-form-panel">
                {/* Credit card visual */}
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
                        {type === "generic" && <span className="cc-net-generic">***</span>}
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
                      <div className="cc-cvv-box">{card.cvv ? "*".repeat(card.cvv.length) : "***"}</div>
                    </div>
                  </div>
                </div>

                {/* Fields */}
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
                    placeholder="***"
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
                  <span className="pay-lock">Lock</span> Pay {price} / month
                </button>
                <p className="pm-secure-note">256-bit SSL encrypted - Demo mode - no real charge</p>
              </div>
            </div>
          </>
        )}

        {/* Processing step */}
        {step === "processing" && (
          <div className="modal-state-center">
            <div className="proc-ring" />
            <p className="state-title">Processing payment...</p>
            <p className="state-sub">Please wait, do not close this window</p>
          </div>
        )}

        {/* Success step */}
        {step === "success" && (
          <div className="modal-state-center">
            <div className="success-burst">
              <svg className="success-circle-svg" viewBox="0 0 80 80">
                <circle className="success-ring" cx="40" cy="40" r="36" />
                <path className="success-tick" d="M22 40 l12 12 l24-24" />
              </svg>
            </div>
            <p className="state-title">Payment Successful!</p>
            <p className="state-sub">Welcome to the <strong>{plan}</strong> plan</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* Pricing page */
export default function Pricing({
  setPage,
  onGoHome,
  onGoFeatures,
  onGoHowItWorks,
  onGoUseCases,
  onGoFaq,
  onGoAbout,
  onStartSimulation,
  onGoPricing,
}) {
  const [activePlan, setActivePlan] = useState(
    () => localStorage.getItem("planora_plan") || "Free"
  );
  const [checkout, setCheckout] = useState(null); // { title, price, amount, features }
  const [toast, setToast] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    let active = true;

    getPricingPlans()
      .then((payload) => {
        if (active) {
          setPlans(payload);
        }
      })
      .catch((err) => console.error(err));

    return () => {
      active = false;
    };
  }, []);

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  }

  function handleSuccess(planName) {
    localStorage.setItem("planora_plan", planName);
    setActivePlan(planName);
    showToast("success", `Payment successful! You are now on the ${planName} plan.`);
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
        onGoPricing={onGoPricing}
      />

      {toast && (
        <div className={`payment-toast payment-toast-${toast.type}`}>
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>x</button>
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
          {plans.map((plan) => (
            <Plan
              key={plan.title}
              title={plan.title}
              price={plan.price}
              amount={plan.amount}
              items={plan.items}
              button={plan.button}
              popular={plan.popular}
              isActive={activePlan === plan.title}
              onCheckout={setCheckout}
            />
          ))}
        </div>

        <button className="outline-btn back-btn" onClick={() => setPage("simulation")}>
          <FaArrowLeft style={{ marginRight: 8 }} /> Back to Simulation
        </button>
      </section>
    </main>
  );
}

/* Plan card */
function Plan({ title, price, amount, items, button, popular, isActive, onCheckout = () => {} }) {
  const isPaid = amount > 0;
  const cardClass = ["plan-card", popular ? "popular" : "", isActive ? "active-plan" : ""]
    .filter(Boolean).join(" ");

  return (
    <article className={cardClass}>
      {popular && !isActive && <span className="popular-badge">Most Popular</span>}
      {isActive && <span className="active-plan-badge">Active Plan</span>}
      <h2>{title}</h2>
      <h3>{price}<span>/ month</span></h3>
      <div className="plan-line" />
      {items.map((item) => <p key={item}>- {item}</p>)}
      <button
        className={popular ? "primary-btn plan-btn" : "outline-plan-btn"}
        disabled={isActive}
        onClick={() => isPaid && !isActive && onCheckout({ title, price, amount, features: items })}
      >
        {isActive ? "Active" : <>{button}{popular ? <FaArrowRight style={{ marginLeft: 8 }} /> : null}</>}
      </button>
    </article>
  );
}
