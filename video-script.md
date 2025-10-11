# Video Script — Code Walkthrough (EN + AR)

This script maps to your recorded flow. For each feature, it shows: what code to display (with file path), the key snippet (without console logs), and the logic explained in English and Arabic. Focus is on the carousel; other parts are concise.

Order: Image Track → Crosshair Cursor → Navbar → Image Indicator → Image Clickable (Expand) → Overlays/Cursor/Text → Reverse Animation → Loading Intro.

---

## 1) Image Track (Carousel + Parallax)

Show these files/snippets:

- File: `src/index.css` (container and image sizing)

```css
#image-track {
  display: flex;
  gap: 4vmin;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-5.5%, -50%);
  user-select: none;
}

#image-track > .image {
  width: 35vmin;
  height: 50vmin;
  object-fit: cover;
  object-position: 50% center;
}
```

- File: `src/components/ImageTrack.jsx` (drag-to-pan slider + parallax)

```jsx
import { useEffect, useRef, useState } from "react";

export default function ImageTrack({
  onImageChange,
  onExpandChange,
  startExpanded,
}) {
  const [expandedImageIndex, setExpandedImageIndex] = useState(
    startExpanded ? 0 : null
  );
  const trackRef = useRef(null);
  const imagesRef = useRef([]);

  useEffect(() => {
    const track = document.getElementById("image-track");

    const handleOnDown = (e) => (track.dataset.mouseDownAt = e.clientX);

    const handleOnUp = () => {
      track.dataset.mouseDownAt = "0";
      track.dataset.prevPercentage = track.dataset.percentage;
    };

    const handleOnMove = (e) => {
      if (track.dataset.mouseDownAt === "0") return;

      const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX;
      const maxDelta = window.innerWidth / 2;

      const percentage = (mouseDelta / maxDelta) * -50;
      const prevPercentage = parseFloat(track.dataset.prevPercentage) || 0;
      const nextPercentageUnconstrained = prevPercentage + percentage;
      const nextPercentage = Math.max(
        Math.min(nextPercentageUnconstrained, 0),
        -89
      );

      track.dataset.percentage = nextPercentage;

      track.animate(
        { transform: `translate(${nextPercentage - 5.5}%, -50%)` },
        { duration: 1200, fill: "forwards" }
      );

      const images = Array.from(track.getElementsByClassName("image"));
      images.forEach((image) => {
        const currentOpacity = window.getComputedStyle(image).opacity;
        if (parseFloat(currentOpacity) > 0.1) {
          image.animate(
            { objectPosition: `${50 + nextPercentage / 2}% center` },
            { duration: 1200, fill: "forwards" }
          );
        }
      });
    };

    // Mouse + touch
    window.onmousedown = (e) => handleOnDown(e);
    window.ontouchstart = (e) => handleOnDown(e.touches[0]);
    window.onmouseup = (e) => handleOnUp(e);
    window.ontouchend = (e) => handleOnUp(e.touches[0]);
    window.onmousemove = (e) => handleOnMove(e);
    window.ontouchmove = (e) => handleOnMove(e.touches[0]);

    // Center image indicator loop
    let rafId;
    const updateCenterImage = () => {
      const images = imagesRef.current;
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      let closest = 0,
        min = Infinity;
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img) continue;
        const r = img.getBoundingClientRect();
        const ix = r.left + r.width / 2;
        const iy = r.top + r.height / 2;
        const d = Math.hypot(ix - cx, iy - cy);
        if (d < min) {
          min = d;
          closest = i;
        }
      }
      onImageChange(closest + 1);
      rafId = requestAnimationFrame(updateCenterImage);
    };
    updateCenterImage();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [onImageChange]);

  const imageUrls = [
    "/images/home.jpg",
    "/images/home-1.jpg",
    "/images/home.jpg",
    "/images/home-1.jpg",
    "/images/home.jpg",
    "/images/home-1.jpg",
    "/images/home.jpg",
    "/images/home-1.jpg",
  ];

  return (
    <div
      id="image-track"
      ref={trackRef}
      data-mouse-down-at="0"
      data-percentage="0"
      data-prev-percentage="0"
    >
      {imageUrls.map((url, index) => (
        <img
          key={index}
          ref={(el) => (imagesRef.current[index] = el)}
          className="image"
          src={url}
          draggable="false"
          onClick={() => {
            /* handled below in the expand section */
          }}
          style={{ cursor: "pointer" }}
        />
      ))}
    </div>
  );
}
```

Explanation (EN):

- The track uses an “invisible slider” based on mouse drag distance. We store mouseDownAt, prevPercentage, percentage in data-attributes.
- On move, compute nextPercentage, clamp it to [-89, 0] to prevent overscroll, and animate the track’s translateX with a -5.5% offset for visual centering.
- For parallax, each image animates its object-position to 50 + nextPercentage/2 percent.
- A rAF loop calculates which image is closest to the viewport center and emits it via onImageChange.

الشرح (AR):

- التراك بيتحرك بسلايدر “خفّي” على حسب مسافة سحب الماوس. بنخزّن قيم بسيطة في data-attributes: مكان الضغط الأول، النسبة السابقة، والنسبة الحالية.
- أثناء الحركة بنحسب nextPercentage ونقفله بين -89 و0 عشان ما يطلعش فراغ. بنحرّك التراك بترانسليت مع أوفست -5.5% عشان التوسيط يبقى مظبوط.
- عشان إحساس البارالاكس: كل صورة بتغيّر object-position لـ 50 + نص قيمة السلايدر.
- بحلقة rAF بنشوف أي صورة أقرب لمركز الشاشة ونبعتها لـ onImageChange.

---

## 2) Crosshair Cursor

Show these files/snippets:

- File: `src/components/CrossCursor.jsx`

```jsx
import "../styles/cursor.css";

export default function CrossCursor({ isHidden }) {
  return (
    <div className={`crosshair ${isHidden ? "hidden" : ""}`}>
      <div className="horizontal-line" />
      <div className="vertical-line" />
    </div>
  );
}
```

- File: `src/styles/cursor.css`

```css
.crosshair {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 9999;
  opacity: 1;
  transition: opacity 0.1s ease;
}

.crosshair.hidden {
  opacity: 0;
  pointer-events: none;
}

.crosshair .horizontal-line {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: white;
  transform: translateY(-50%);
}
.crosshair .vertical-line {
  position: absolute;
  top: 0;
  left: 50%;
  width: 2px;
  height: 100%;
  background-color: white;
  transform: translateX(-50%);
}
```

Explanation (EN): Fixed, non-interactive crosshair always centered. Toggled by the `hidden` class when we want it to disappear.

الشرح (AR): كروس هير ثابت في النص ومش بيمنع الكليك. بنظهره/نخفيه بكلاس `hidden` حسب الحالة.

---

## 3) Navbar

Show these files/snippets:

- File: `src/components/Navbar.jsx`

```jsx
import "../styles/navbar.css";

export default function Navbar() {
  return (
    <div className="nav">
      <ul className="list">
        <li className="list-item">Work</li>
        <li className="list-item">About</li>
      </ul>
    </div>
  );
}
```

- File: `src/styles/navbar.css`

```css
.list {
  display: flex;
  color: white;
  list-style: none;
  gap: 2rem;
  justify-content: center;
  padding-top: 1.3rem;
  margin-right: 4rem;
  font-size: 1rem;
  z-index: 10000;
  position: relative;
  user-select: none;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
```

Explanation (EN): Minimal, centered list with a high z-index so it stays above expanded images.

الشرح (AR): ليست بسيطـة في النص وبـ z-index عالي عشان تفضل فوق الصورة وهي فول سكرين.

---

## 4) Image Indicator (x — y)

Show these files/snippets:

- File: `src/components/ImageIndactior.jsx`

```jsx
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
```

- File: `src/styles/imageIndactior.css`

```css
.image-indicator {
  position: fixed;
  bottom: 2.3rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
}
.image-number {
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
}
```

- Where it’s wired: `src/App.jsx` (how it gets `currentImage` from the track)

```jsx
<ImageTrack onImageChange={setCurrentImageIndex} onExpandChange={setIsImageExpanded} startExpanded={introComplete && isImageExpanded} />
<ImageIndicator currentImage={currentImageIndex} totalImages={8} />
```

Explanation (EN): The indicator subscribes to the carousel via `onImageChange`, which emits the image nearest to screen center.

الشرح (AR): العداد بياخد القيمة من الكاروسيل؛ كل ما صورة تقرّب من نص الشاشة بيحدّث الرقم.

---

## 5) Image Clickable Functionality (Expand to Fullscreen)

Show this simplified, log-free behavior:

- File: `src/components/ImageTrack.jsx` (expansion core — GSAP timeline via clone)

```jsx
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function ImageTrack({
  onImageChange,
  onExpandChange,
  startExpanded,
}) {
  // ...same refs/state as above
  const imagesRef = useRef([]);
  const clonedImageRef = useRef(null);
  const originalPositionRef = useRef(null);

  useGSAP(
    () => {
      // runs when expandedImageIndex changes
      if (expandedImageIndex === null) return;

      const images = imagesRef.current;
      const clickedImage = images[expandedImageIndex];
      const rect = clickedImage.getBoundingClientRect();

      // 1) Clone image and place it fixed at current screen position
      const clone = clickedImage.cloneNode(true);
      document.body.appendChild(clone);
      clonedImageRef.current = clone;
      originalPositionRef.current = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };

      gsap.set(clone, {
        position: "fixed",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        margin: 0,
        padding: 0,
        zIndex: 1000,
        objectFit: "cover",
        objectPosition: window.getComputedStyle(clickedImage).objectPosition,
        cursor: "pointer",
      });

      // Hide original and fade others
      gsap.set(clickedImage, { opacity: 0 });
      images.forEach((img, i) => {
        if (i !== expandedImageIndex)
          gsap.to(img, { opacity: 0, duration: 1.0 });
      });

      // 2) Expand to fullscreen
      gsap.to(clone, {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        objectPosition: "50% center",
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          // click clone to collapse
          clone.addEventListener("click", () =>
            handleImageClick(expandedImageIndex)
          );
        },
      });

      // Disable track interaction while expanded
      const track = document.getElementById("image-track");
      if (track) track.style.pointerEvents = "none";
    },
    { dependencies: [expandedImageIndex, startExpanded] }
  );

  const handleImageClick = (index) => {
    if (expandedImageIndex === index) {
      if (onExpandChange) onExpandChange(false);
      setExpandedImageIndex(null);
      // collapse handled below (section 7)
    } else {
      if (onExpandChange) onExpandChange(true);
      setExpandedImageIndex(index);
    }
  };
}
```

Explanation (EN): On click, we clone the image and take it out of the transformed track. We position the clone fixed at its on-screen rect, fade out others, then tween it to 100vw × 100vh. Track interactions are disabled until collapse.

الشرح (AR): أول ما بكليك، بننسخ الصورة ونطلعها من التراك (عشان الترانسفورم). نحط النسخة فوق مكانها الحقيقي، نطفي باقي الصور، وبعدين نكبّرها فول سكرين. وبنقفّل التفاعل مع التراك لحد ما نرجّعها.

---

## 6) Overlays, Cursor Hide, and Title Text

Show these snippets:

- File: `src/index.css` (overlay style)

```css
.image-title-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10001;
  pointer-events: none;
  animation: scaleIn 0.6s ease-out forwards;
  animation-delay: 0.2s;
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.8);
}
.image-title {
  color: white;
  font-size: 4rem;
  font-weight: 300;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  text-align: center;
  margin: 0;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
```

- File: `src/App.jsx` (conditional UI wiring)

```jsx
<CrossCursor isHidden={isImageExpanded || !introComplete} />
<ImageTrack onImageChange={setCurrentImageIndex} onExpandChange={setIsImageExpanded} startExpanded={introComplete && isImageExpanded} />
{isImageExpanded && (
  <div className="image-title-overlay">
    <h1 className="image-title">The Regeneration Suite</h1>
  </div>
)}
```

Explanation (EN): When an image is expanded, we hide the crosshair and show a centered title that scales in. When not expanded, the crosshair returns.

الشرح (AR): لما الصورة تكبُر، بنخفي الكروس هير وبنظهر عنوان في النص بحركة بسيطة. أول ما نقفل الصورة، الكروس هير يرجع.

---

## 7) Reverse Animation (Collapse on Click)

Show this snippet from `ImageTrack.jsx` that complements section 5:

```jsx
const handleImageClick = (index) => {
  if (expandedImageIndex === index) {
    if (onExpandChange) onExpandChange(false);
    const images = imagesRef.current;
    const clone = clonedImageRef.current;
    const originalPos = originalPositionRef.current;
    setExpandedImageIndex(null);

    if (clone && originalPos) {
      // 1) Shrink clone back to its stored rect
      gsap.to(clone, {
        top: originalPos.top,
        left: originalPos.left,
        width: originalPos.width,
        height: originalPos.height,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          clone.remove();
          clonedImageRef.current = null;
        },
      });
    }

    // 2) Fade carousel images back in
    images.forEach((img) => {
      if (img) gsap.to(img, { opacity: 1, duration: 0.8 });
    });

    // 3) Re-enable track interactions
    const track = document.getElementById("image-track");
    if (track) {
      track.style.pointerEvents = "auto";
      track.dataset.mouseDownAt = "0";
      track.dataset.percentage = track.dataset.percentage || "0";
      track.dataset.prevPercentage = track.dataset.prevPercentage || "0";
    }
  } else {
    if (onExpandChange) onExpandChange(true);
    setExpandedImageIndex(index);
  }
};
```

Explanation (EN): Clicking the fullscreen clone reverses the tween back to the stored rect, removes the clone, fades originals back, and restores pointer events and slider state.

الشرح (AR): لما تكليك على الصورة الكبيرة، بنصغّر النسخة لنفس مكانها القديم، نشيلها، نرجّع صور الكاروسيل تظهر تاني، ونفكّ التفاعل على السلايدر.

---

## 8) Loading Intro (Grids → Hero → Handoff)

Show these files/snippets:

- File: `src/styles/loadingIntro.css` (overlay and grids)

```css
.loading-intro-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #141414;
  z-index: 99999;
  overflow: visible;
  pointer-events: all;
  user-select: none;
}
.loading-progress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.loading-text {
  color: white;
  font-size: 2.5rem;
  font-weight: 300;
  letter-spacing: 0.1em;
  margin: 0;
}
.intro-grid-container {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: visible;
}
.intro-grid {
  flex-shrink: 0;
  width: 25vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: visible;
  position: relative;
}
.intro-grid-image {
  position: absolute;
  width: 100%;
  height: 25vh;
  object-fit: cover;
  object-position: center;
  will-change: transform;
}
body.intro-active {
  overflow: hidden;
  pointer-events: none;
}
```

- File: `src/components/LoadingIntro.jsx` (preload + GSAP + hero clone with id `intro-hero-clone`)

```jsx
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function LoadingIntro({ onComplete }) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const containerRef = useRef(null);
  const overlayRef = useRef(null);

  const imageUrls = [
    "/images/home.jpg",
    "/images/home-1.jpg",
    "/images/2.jpg",
    "/images/3.jpg",
    "/images/4.jpg",
    "/images/6.jpg",
    "/images/13.jpg",
    "/images/19.jpg",
  ];

  useEffect(() => {
    const load = async () => {
      const total = imageUrls.length;
      let done = 0;
      await Promise.all(
        imageUrls.map(
          (url) =>
            new Promise((res, rej) => {
              const img = new Image();
              img.onload = () => {
                done++;
                setLoadingProgress(Math.round((done / total) * 100));
                res();
              };
              img.onerror = rej;
              img.src = url;
            })
        )
      );
      setTimeout(() => setImagesLoaded(true), 300);
    };
    load();
  }, []);

  useGSAP(
    () => {
      if (!imagesLoaded || !containerRef.current) return;

      const tl = gsap.timeline({
        onComplete: () => onComplete && onComplete(),
      });
      const grids = containerRef.current.querySelectorAll(".intro-grid");
      const stagger = 0.3;

      grids.forEach((grid, gridIndex) => {
        const images = grid.querySelectorAll(".intro-grid-image");
        const bottomToTop = gridIndex % 2 === 0;
        images.forEach((img, imgIndex) => {
          const isHero = gridIndex === 2 && imgIndex === 2;
          if (bottomToTop)
            gsap.set(img, { top: `${imgIndex * 25}vh`, y: "100vh" });
          else
            gsap.set(img, {
              bottom: `${imgIndex * 25}vh`,
              top: "auto",
              y: "-100vh",
            });

          if (isHero) {
            const gridRect = grid.getBoundingClientRect();
            const imageHeight = 25;
            const imageTop =
              gridRect.top +
              (imgIndex * imageHeight * window.innerHeight) / 100;
            const imageLeft = gridRect.left;
            const imageWidth = gridRect.width;
            const imageHeightPx = (window.innerHeight * imageHeight) / 100;

            const clone = img.cloneNode(true);
            document.body.appendChild(clone);
            clone.id = "intro-hero-clone";

            gsap.set(clone, {
              position: "fixed",
              top: imageTop + window.innerHeight,
              left: imageLeft,
              width: imageWidth,
              height: imageHeightPx,
              zIndex: 100000,
              margin: 0,
              padding: 0,
              objectFit: "cover",
              opacity: 1,
              clearProps: "transform",
            });
            gsap.set(img, { opacity: 0 });

            tl.to(
              clone,
              { top: imageTop, duration: 2.0, ease: "power2.in" },
              imgIndex * stagger
            );
            tl.to(
              clone,
              {
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                duration: 1.0,
                ease: "power2.inOut",
                onComplete: () => {
                  gsap.set(clone, {
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    objectFit: "cover",
                    objectPosition: "50% center",
                    zIndex: 100000,
                    clearProps: "transform",
                  });
                  if (containerRef.current) containerRef.current.remove();
                },
              },
              imgIndex * stagger + 1.5
            );
          } else {
            tl.to(
              img,
              {
                y: bottomToTop ? "-125vh" : "125vh",
                duration: 2.5,
                ease: "power2.in",
              },
              imgIndex * stagger
            );
          }
        });
      });

      tl.to(
        overlayRef.current,
        {
          opacity: 0,
          duration: 0.01,
          ease: "power2.inOut",
          onComplete: () => {
            if (overlayRef.current) overlayRef.current.style.display = "none";
          },
        },
        "+=0.01"
      );
    },
    { scope: containerRef, dependencies: [imagesLoaded] }
  );

  return (
    <div ref={overlayRef} className="loading-intro-overlay">
      {!imagesLoaded && (
        <div className="loading-progress">
          <h2 className="loading-text">{loadingProgress}%</h2>
        </div>
      )}
      {imagesLoaded && (
        <div ref={containerRef} className="intro-grid-container">
          {[0, 1, 2, 3, 4].map((g) => (
            <div key={g} className="intro-grid">
              {[0, 1, 2, 3].map((i) => (
                <img
                  key={i}
                  src={
                    g === 2 && i === 2
                      ? "/images/home.jpg"
                      : imageUrls[(g * 4 + i) % imageUrls.length]
                  }
                  alt=""
                  className="intro-grid-image"
                  draggable="false"
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

Explanation (EN): We preload images and show a percent. Then five vertical grids slide their images off-screen, except the center “hero” which is cloned, slid into place, and expanded to fullscreen. We keep that clone (id `intro-hero-clone`) so the carousel can start in an expanded state and take over.

الشرح (AR): بنحمّل الصور ونظهر نسبة. بعدين 5 أعمدة بتتزحلق لفوق/لتحت، ما عدا صورة البطل في النص: بنعمل لها نسخة، نطلعها لنفس مكانها وبعدين نكبّرها فول سكرين. بنسيب النسخة دي (`intro-hero-clone`) عشان الكاروسيل يكمّل منها وهو مفتوح.

---

## Quick Recap (What to show on screen)

- Carousel CSS (`#image-track`, `.image`) then the drag handlers and parallax snippet in `ImageTrack.jsx`.
- Crosshair JSX + CSS.
- Navbar JSX + CSS.
- Image indicator JSX + CSS + the two props in `App.jsx`.
- Expansion logic: clone → fade others → tween to fullscreen.
- Overlay title + hide cursor when expanded.
- Reverse animation: tween clone back → remove clone → fade originals → re-enable track.
- Loading intro: preload → grids slide → hero clone expands → handoff to app.

This structure matches your recording order and keeps the emphasis on the carousel math and feel.
