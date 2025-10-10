import "../styles/cursor.css";

export default function CrossCursor() {
  return (
    <div className="crosshair">
      <div className="horizontal-line" />
      <div className="vertical-line" />
    </div>
  );
}
