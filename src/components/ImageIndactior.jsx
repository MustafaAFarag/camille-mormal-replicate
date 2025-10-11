import "../styles/imageIndactior.css";

export default function ImageIndicator({ currentImage, totalImages }) {
  return (
    <div className="image-indicator">
      <span className="image-number">
        {currentImage} — {totalImages}
      </span>
    </div>
  );
}
