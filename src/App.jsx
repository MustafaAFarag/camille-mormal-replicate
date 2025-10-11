import { useState } from "react";
import CrossCursor from "./components/CrossCursor";
import ImageIndicator from "./components/ImageIndactior";
import ImageTrack from "./components/ImageTrack";
import Navbar from "./components/Navbar";

function App() {
  const [currentImageIndex, setCurrentImageIndex] = useState(1);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  return (
    <main>
      <Navbar />
      <CrossCursor isHidden={isImageExpanded} />
      <ImageTrack
        onImageChange={setCurrentImageIndex}
        onExpandChange={setIsImageExpanded}
      />
      <ImageIndicator currentImage={currentImageIndex} totalImages={8} />

      {/* Image title overlay */}
      {isImageExpanded && (
        <div className="image-title-overlay">
          <h1 className="image-title">The Regeneration Suite</h1>
        </div>
      )}
    </main>
  );
}

export default App;
