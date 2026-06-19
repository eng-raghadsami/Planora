export default function HintLabel({ text, hint }) {
  return (
    <span className="label-row">
      {text}
      <span className="help-icon" title={hint} aria-label={hint}>i</span>
    </span>
  );
}
