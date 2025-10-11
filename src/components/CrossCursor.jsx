import "../styles/cursor.css";

export default function CrossCursor({ isHidden }) {
  return (
    <div className={`crosshair ${isHidden ? "hidden" : ""}`}>
      <div className="horizontal-line" />
      <div className="vertical-line" />
    </div>
  );
}
