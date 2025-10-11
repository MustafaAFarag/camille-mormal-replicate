import { useState } from "react";
import CrossCursor from "./components/CrossCursor";
import ImageIndicator from "./components/ImageIndactior";
import ImageTrack from "./components/ImageTrack";
import Navbar from "./components/Navbar";

function App() {
  const [currentImageIndex, setCurrentImageIndex] = useState(1);

  return (
    <main>
      <Navbar />
      <CrossCursor />
      <ImageTrack onImageChange={setCurrentImageIndex} />
      <ImageIndicator currentImage={currentImageIndex} totalImages={8} />
    </main>
  );
}

export default App;
