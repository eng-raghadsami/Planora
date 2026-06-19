import logoPng from "../assets/logo.png";

export default function Logo({ onClick }) {
  return (
    <button type="button" className="logo logo-btn" onClick={onClick} aria-label="Go to home page">
      <div className="logo-img-wrap">
        <img src={logoPng} alt="Planora" className="logo-img" />
      </div>
      <span className="logo-text">Planora</span>
    </button>
  );
}
