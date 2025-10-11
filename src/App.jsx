import { useState, useEffect, useRef } from "react";
import CrossCursor from "./components/CrossCursor";
import ImageIndicator from "./components/ImageIndactior";
import ImageTrack from "./components/ImageTrack";
import Navbar from "./components/Navbar";
import LoadingIntro from "./components/LoadingIntro";

function App() {
  const [currentImageIndex, setCurrentImageIndex] = useState(1);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const imageTrackRef = useRef(null);

  useEffect(() => {
    if (!introComplete) {
      document.body.classList.add("intro-active");
    } else {
      document.body.classList.remove("intro-active");
    }

    return () => {
      document.body.classList.remove("intro-active");
    };
  }, [introComplete]);

  const handleIntroComplete = () => {
    setIsImageExpanded(true);
    setIntroComplete(true);
  };

  return (
    <main>
      {!introComplete && <LoadingIntro onComplete={handleIntroComplete} />}

      <Navbar />
      <CrossCursor isHidden={isImageExpanded || !introComplete} />
      <ImageTrack
        onImageChange={setCurrentImageIndex}
        onExpandChange={setIsImageExpanded}
        startExpanded={introComplete && isImageExpanded}
      />
      <ImageIndicator currentImage={currentImageIndex} totalImages={8} />

      {isImageExpanded && (
        <div className="image-title-overlay">
          <h1 className="image-title">The Regeneration Suite</h1>
        </div>
      )}
    </main>
  );
}

export default App;
