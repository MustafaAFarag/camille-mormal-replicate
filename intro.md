# 🎬 Loading Intro Animation Flow

Complete documentation of the loading intro sequence, from image preloading to the hero image expansion that transitions into the main carousel.

---

## 📋 Overview

The LoadingIntro component creates a cinematic opening sequence that:

1. Preloads all images
2. Displays loading progress (0-100%)
3. Animates a grid of images
4. Expands one "hero" image to fullscreen
5. Hands off the expanded image to ImageTrack component
6. Triggers the main app to become interactive

---

## 🎯 Component Responsibilities

### **LoadingIntro.jsx**

- Preloads images
- Displays progress percentage
- Creates grid animation
- Expands hero image
- Calls `onComplete` callback when done

### **App.jsx**

- Manages intro state (`introComplete`)
- Controls component visibility
- Handles transition to main carousel

---

## 📊 PHASE 1: Image Preloading

### **Step 1: Component Mounts**

```javascript
export default function LoadingIntro({ onComplete }) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
```

**Initial State:**

- `loadingProgress = 0`
- `imagesLoaded = false`
- Renders loading progress UI

---

### **Step 2: useEffect Triggers Image Loading**

```javascript
useEffect(() => {
  const loadImages = async () => {
    const totalImages = imageUrls.length; // 8 images
    let loadedCount = 0;

    const loadPromises = imageUrls.map((url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          const progress = Math.round((loadedCount / totalImages) * 100);
          setLoadingProgress(progress); // Updates UI: 0%, 12%, 25%...
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });
    });
```

**Process:**

1. Creates `Image()` objects for each URL
2. Loads images in parallel via `Promise.all()`
3. Updates `loadingProgress` state as each image loads
4. UI shows: "0%", "12%", "25%", "37%", "50%", "62%", "75%", "87%", "100%"

---

### **Step 3: All Images Loaded**

```javascript
    try {
      await Promise.all(loadPromises);
      setTimeout(() => {
        setImagesLoaded(true); // ← Triggers Phase 2
      }, 300);
    }
```

**Result:**

- `imagesLoaded = true`
- Loading percentage disappears
- Grid container renders
- Triggers `useGSAP` animation hook

---

## 🎨 PHASE 2: Grid Animation Setup

### **Step 4: Grid Rendering**

```javascript
{imagesLoaded && (
  <div ref={containerRef} className="intro-grid-container">
    {[0, 1, 2, 3, 4].map((gridIndex) => (
      <div key={gridIndex} className="intro-grid">
        {[0, 1, 2, 3].map((imgIndex) => {
          // Special case: Grid 2, Image 2 = Hero Image
          let imageUrl;
          if (gridIndex === 2 && imgIndex === 2) {
            imageUrl = "/images/home.jpg"; // ← HERO IMAGE
          } else {
            imageUrl = imageUrls[(gridIndex * 4 + imgIndex) % imageUrls.length];
          }
```

**Structure:**

- **5 grids** (columns) across the screen
- **4 images** per grid (stacked vertically)
- **Total: 20 images**
- **Hero Image:** Grid 2, Image 2 (middle column, 3rd image)

---

### **Step 5: useGSAP Hook Triggers**

```javascript
useGSAP(
  () => {
    if (!imagesLoaded || !containerRef.current) return;

    const masterTL = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete(); // ← Final callback to App
      },
    });

    const grids = containerRef.current.querySelectorAll(".intro-grid");
```

**Setup:**

- Creates master GSAP timeline
- Queries all 5 grids
- Sets up completion callback to App component

---

## 🚀 PHASE 3: Animation Execution

### **Step 6: Initial Positioning**

```javascript
grids.forEach((grid, gridIndex) => {
  const images = grid.querySelectorAll(".intro-grid-image");
  const isBottomToTop = gridIndex % 2 === 0; // Alternating direction

  images.forEach((img, imgIndex) => {
    if (isBottomToTop) {
      gsap.set(img, {
        top: `${imgIndex * 25}vh`,  // Stack: 0vh, 25vh, 50vh, 75vh
        y: "100vh",                  // Offscreen BELOW
      });
    } else {
      gsap.set(img, {
        bottom: `${imgIndex * 25}vh`, // Stack: 0vh, 25vh, 50vh, 75vh
        top: "auto",
        y: "-100vh",                   // Offscreen ABOVE
      });
    }
```

**Initial State:**

- **Even grids (0, 2, 4):** Images start BELOW viewport, slide UP
- **Odd grids (1, 3):** Images start ABOVE viewport, slide DOWN
- Each image is 25vh tall (4 images = 100vh)
- All images positioned offscreen initially

---

### **Step 7A: Standard Images Animation**

```javascript
// For non-hero images
masterTL.to(
  img,
  {
    y: isBottomToTop ? "-125vh" : "125vh", // Slide completely offscreen
    duration: 2.5,
    ease: "power2.in",
  },
  imgIndex * stagger // Stagger: 0s, 0.3s, 0.6s, 0.9s
);
```

**Animation:**

- Images slide across viewport
- Staggered timing (0.3s between each)
- Exit completely offscreen on opposite side
- Creates "passing through" effect

---

### **Step 7B: Hero Image Special Treatment**

```javascript
const isHeroImage = gridIndex === 2 && imgIndex === 2;

if (isHeroImage) {
  // Clone the hero image
  const clone = img.cloneNode(true);
  document.body.appendChild(clone);

  // Add ID so ImageTrack can find it later
  clone.id = "intro-hero-clone";
```

**Why Clone?**

- Original image animates with the grid
- Clone becomes the hero that expands
- Clone stays visible while grid disappears
- ImageTrack can reuse this clone for seamless transition

---

### **Step 8: Hero Image - Slide Up Animation**

```javascript
// Calculate position in grid
const gridRect = grid.getBoundingClientRect();
const imageHeight = 25; // 25vh
const imageTop =
  gridRect.top + (imgIndex * imageHeight * window.innerHeight) / 100;
const imageLeft = gridRect.left;
const imageWidth = gridRect.width;
const imageHeightPx = (window.innerHeight * imageHeight) / 100;

// Position clone at starting location (offscreen below)
gsap.set(clone, {
  position: "fixed",
  top: imageTop + window.innerHeight, // Offscreen below
  left: imageLeft,
  width: imageWidth,
  height: imageHeightPx,
  zIndex: 100000,
  objectFit: "cover",
});

// Hide original image
gsap.set(img, { opacity: 0 });

// Animate clone sliding up into view
masterTL.to(
  clone,
  {
    top: imageTop, // Slide to its position in grid
    duration: 2.0,
    ease: "power2.in",
  },
  imgIndex * stagger // 0.9s delay (3rd image)
);
```

**Animation Details:**

- **Start:** Below viewport at `imageTop + 100vh`
- **End:** At grid position `imageTop`
- **Duration:** 2 seconds
- **Stagger:** Starts at 0.9s (imgIndex 2 × 0.3s)
- **Effect:** Hero slides up with other images in its grid

---

### **Step 9: Hero Image - Expansion Animation**

```javascript
masterTL.to(
  clone,
  {
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    duration: 1.0,
    ease: "power2.inOut",
    onComplete: () => {
      console.log("✅ Expansion complete - keeping clone for ImageTrack");

      // CRITICAL: Force exact fullscreen dimensions
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

      // Remove intro container
      if (containerRef.current) {
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
        containerRef.current.remove();
      }
    },
  },
  imgIndex * stagger + 1.5 // Starts at 2.4s (0.9 + 1.5)
);
```

**Animation Details:**

- **Start:** At grid position (partial viewport)
- **End:** Fullscreen `100vw × 100vh` at `(0, 0)`
- **Duration:** 1 second
- **Delay:** Starts after slide-up completes (+1.5s)
- **Total time to expansion:** ~3.4s from animation start

**On Complete:**

1. Force-sets clone to exact fullscreen dimensions
2. Removes entire intro grid container from DOM
3. Leaves only the hero clone at fullscreen

---

### **Step 10: Fade Out Overlay**

```javascript
masterTL.to(
  overlayRef.current,
  {
    opacity: 0,
    duration: 0.01,
    ease: "power2.inOut",
    onComplete: () => {
      if (overlayRef.current) {
        overlayRef.current.style.display = "none";
      }
    },
  },
  "+=0.01" // Immediately after expansion
);
```

**Effect:**

- Loading overlay fades out instantly
- Background becomes transparent
- Only hero clone remains visible

---

## 🔄 PHASE 4: Transition to Main App

### **Step 11: Timeline Completes → onComplete Callback**

```javascript
const masterTL = gsap.timeline({
  onComplete: () => {
    if (onComplete) onComplete(); // ← Calls handleIntroComplete in App
  },
});
```

**Triggers:** `handleIntroComplete()` in App.jsx

---

### **Step 12: App.jsx Receives Completion**

```javascript
const handleIntroComplete = () => {
  setIsImageExpanded(true); // ← Hero is expanded
  setIntroComplete(true); // ← Intro is done
};
```

**State Changes:**

- `isImageExpanded = true`
- `introComplete = true`

---

### **Step 13: Component Visibility Updates**

#### **13A: LoadingIntro Unmounts**

```javascript
{
  !introComplete && <LoadingIntro onComplete={handleIntroComplete} />;
}
```

- Since `introComplete = true`
- LoadingIntro component unmounts
- **Hero clone remains in DOM** (attached to `body`)

---

#### **13B: CrossCursor Hidden**

```javascript
<CrossCursor isHidden={isImageExpanded || !introComplete} />
```

- `isImageExpanded = true` → `isHidden = true`
- Crosshair stays hidden during intro

---

#### **13C: ImageTrack Starts Expanded**

```javascript
<ImageTrack
  onImageChange={setCurrentImageIndex}
  onExpandChange={setIsImageExpanded}
  startExpanded={introComplete && isImageExpanded} // ← true && true = true
/>
```

- `startExpanded = true`
- ImageTrack knows to start in expanded state

---

#### **13D: Title Overlay Appears**

```javascript
{
  isImageExpanded && (
    <div className="image-title-overlay">
      <h1 className="image-title">The Regeneration Suite</h1>
    </div>
  );
}
```

- `isImageExpanded = true`
- Title text renders over hero image

---

### **Step 14: ImageTrack Reuses Hero Clone**

```javascript
// In ImageTrack.jsx useGSAP hook
if (
  startExpanded &&
  expandedImageIndex === 0 &&
  !hasCompletedIntroRef.current
) {
  // Look for existing intro clone
  let clone = document.getElementById("intro-hero-clone");

  if (clone) {
    console.log("✅ Found existing intro clone, reusing it");

    // Verify and force fullscreen
    gsap.set(clone, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      objectFit: "cover",
      objectPosition: "50% center",
      zIndex: 1000,
    });

    // Remove ID (taking ownership)
    clone.removeAttribute("id");
  }

  clonedImageRef.current = clone;

  // Add click handler for collapse
  const clickHandler = () => handleImageClick(0);
  clone.addEventListener("click", clickHandler);

  // Hide carousel images
  images.forEach((img, index) => {
    if (index !== 0) {
      gsap.set(img, { opacity: 0 });
    }
  });
}
```

**Process:**

1. Finds clone by ID `"intro-hero-clone"`
2. Verifies it's fullscreen
3. Takes ownership (removes ID)
4. Stores reference in `clonedImageRef`
5. Adds click handler for collapse
6. Hides other carousel images
7. **No animation needed** - already expanded!

---

### **Step 15: Body Class Cleanup**

```javascript
useEffect(() => {
  if (!introComplete) {
    document.body.classList.add("intro-active");
  } else {
    document.body.classList.remove("intro-active"); // ← Removes class
  }

  return () => {
    document.body.classList.remove("intro-active");
  };
}, [introComplete]);
```

**Effect:**

- Removes `"intro-active"` class from body
- Can be used for CSS overrides during intro

---

## 🎯 PHASE 5: User Interaction Enabled

### **Step 16: User Can Interact**

**At this point:**

- ✅ Hero image is fullscreen
- ✅ Title overlay is visible: "The Regeneration Suite"
- ✅ Crosshair is hidden
- ✅ ImageTrack has control of the hero clone
- ✅ Carousel images are hidden
- ✅ User can click to collapse

**User clicks hero image:**

- Triggers `handleImageClick(0)` in ImageTrack
- Follows collapse flow (see main animation docs)
- Hero shrinks back to carousel position
- Other images fade in
- Crosshair reappears
- Carousel becomes draggable

---

## 📊 Timeline Summary

```
0.0s  │ Images start loading
      │ Display: "0%", "12%", "25%"...
      │
~2.0s │ All images loaded → Display: "100%"
      │
2.3s  │ Grid renders, useGSAP triggered
      │ Images positioned offscreen
      │
2.3s  │ ┌─ Animation starts
      │ │  Standard images slide across viewport
      │ │  Hero clone created with ID "intro-hero-clone"
      │ │
3.2s  │ │  Hero clone starts sliding up (0.9s stagger)
      │ │
5.2s  │ │  Hero clone reaches grid position
      │ │
5.2s  │ └─ Hero expansion starts
      │    Clone grows to 100vw × 100vh
      │
6.2s  │ Expansion complete
      │ Grid container removed
      │ Overlay fades out
      │
6.2s  │ onComplete() callback
      │ App receives: handleIntroComplete()
      │ - setIsImageExpanded(true)
      │ - setIntroComplete(true)
      │
6.2s  │ Component updates:
      │ - LoadingIntro unmounts
      │ - Title overlay appears
      │ - ImageTrack finds and reuses clone
      │ - CrossCursor stays hidden
      │
6.2s+ │ USER CAN INTERACT
      └─ Click to collapse hero → Start using carousel
```

---

## 🔑 Key Technical Details

### **Hero Clone Lifecycle**

1. **Created by:** LoadingIntro (Step 7B)
2. **ID:** `"intro-hero-clone"`
3. **Attached to:** `document.body`
4. **Handed off to:** ImageTrack (Step 14)
5. **Managed by:** ImageTrack's `clonedImageRef`
6. **Removed by:** ImageTrack on collapse

### **Why This Approach?**

- **Seamless transition:** No visual break between intro and carousel
- **Performance:** Reuses existing DOM element instead of recreating
- **State continuity:** Image is already expanded when carousel takes over
- **Clean handoff:** ID system allows discovery without tight coupling

### **Critical Refs & State**

| Component        | Ref/State              | Purpose                       |
| ---------------- | ---------------------- | ----------------------------- |
| **LoadingIntro** | `loadingProgress`      | Progress percentage (0-100)   |
| **LoadingIntro** | `imagesLoaded`         | Triggers grid animation       |
| **LoadingIntro** | `containerRef`         | Grid container for GSAP       |
| **LoadingIntro** | `overlayRef`           | Background overlay to fade    |
| **App**          | `introComplete`        | Controls component visibility |
| **App**          | `isImageExpanded`      | Hero is expanded state        |
| **ImageTrack**   | `hasCompletedIntroRef` | One-time intro handling flag  |
| **ImageTrack**   | `clonedImageRef`       | Reference to hero clone       |

---

## 🎨 Animation Easing

| Animation      | Easing         | Reason                 |
| -------------- | -------------- | ---------------------- |
| Image slides   | `power2.in`    | Accelerate toward exit |
| Hero slide-up  | `power2.in`    | Match other images     |
| Hero expansion | `power2.inOut` | Smooth cinematic feel  |
| Overlay fade   | `power2.inOut` | Subtle transition      |

---

## 🐛 Common Issues & Solutions

### **Issue: Clone not found by ImageTrack**

**Solution:** LoadingIntro sets `clone.id = "intro-hero-clone"` before expansion completes

### **Issue: Clone dimensions not exact after animation**

**Solution:** Force-set dimensions in `onComplete` using `gsap.set()`

### **Issue: Visual gap between intro and carousel**

**Solution:** ImageTrack reuses clone (no recreation), keeps it visible throughout

### **Issue: Click doesn't work immediately after intro**

**Solution:** Click handler added in ImageTrack after finding clone

---

## 🚀 Performance Considerations

1. **Image Preloading:** All 8 images loaded before animation starts
2. **Parallel Loading:** `Promise.all()` loads images simultaneously
3. **DOM Cleanup:** Grid container removed after expansion
4. **Clone Reuse:** One clone element, no duplication
5. **RAF Updates:** Progress updates don't block rendering
6. **Staggered Animation:** 0.3s stagger prevents overwhelming GPU

---

## 📝 Component Props

### **LoadingIntro Props**

```javascript
<LoadingIntro
  onComplete={handleIntroComplete} // Called when animation finishes
/>
```

### **App → ImageTrack Props**

```javascript
<ImageTrack
  startExpanded={introComplete && isImageExpanded} // true after intro
  onExpandChange={setIsImageExpanded} // Expansion state callback
  onImageChange={setCurrentImageIndex} // Center image callback
/>
```

---

## ✨ User Experience Flow

```
User visits page
    ↓
Sees loading: "0%" → "100%"
    ↓
Grid of images appears
    ↓
Images slide across screen (2.5s)
    ↓
Hero image emerges from middle
    ↓
Hero expands to fullscreen (1s)
    ↓
Title appears: "The Regeneration Suite"
    ↓
User can click to collapse
    ↓
Hero shrinks to carousel
    ↓
Crosshair appears
    ↓
User can drag carousel and explore
```

---

**Total intro duration:** ~6.2 seconds from page load to interaction 🎬
