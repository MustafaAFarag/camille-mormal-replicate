# Final Script v1: Building Camille Mormal's Award-Winning Website

---

## Introduction (1-2 minutes)

Camille Mormal.
الwebsite اللي كسب أحسن website في 2022 من Awwwards.
من أحسن المواقع اللي بجد فيها إحساس غريب لما تتحرك والحاجات دي بتتحرك بطريقة سلسة وإدمان.
الcarousel smooth بطريقة مش ممكنة.

ما تيجي نحاول نبني الموقع دا في الـ15 دقيقة اللي جاية؟
نشوف هي أحسن مننا في إيه.

تعالى نشوف الموقع بيقول إيه:

- في loading progress بيعمل load للصور
- بعدها 5 grids، كل grid فيه 4 صور
- الصورة اللي في النص بتـexpand وتاخد الشاشة كلها
- carousel بسيط وnavbar وcursor في النص
- وبص بس كدا وانت تعمل drag... في حاجة بتحصل للصور، effect كأنه بيتحرك على حسب الmouse بتاعك
- ولما تدوس على الصورة بتعمل animation expand كدا، وتدوس تاني تطلع برة
- والله أكبر بسم الله ما شاء الله

ماشي خلاص، فهمنا الدنيا. تعالى بقى نبدأ.

نعمل project react بvite. Select React، JavaScript، no TypeScript، yes لـESLint. ونستنى يعمل install. بعدها نinstall GSAP اللي هنحتاجه بعدين.

```bash
npm create vite@latest camille-replicate
npm install
npm install gsap @gsap/react
```

---

## Part 1: The Carousel - Building The Core (4-5 minutes)

أول حاجة، نبدأ بالcarousel لأنه دا الأساس. احنا هنload إيه أصلاً لو معملناش الcarousel؟

### Step 1: Basic Styling

نبدأ بالbody في `index.css`. نعمل الheight والwidth full، ونغير اللون للغامق دا. ولو شفت في الموضوع مفيش scrollbars يعني overflow hidden، ومفيش gaps يعني margin 0.

الصور كانوا جنب بعض يعني كلهم في container اسمه `image-track`. Display flex وشوية gap. نعمل position absolute علشان نcenter الموضوع بـ50% و50% وtranslate. المرادي هتبقى translate(-5.5%, -50%) علشان تبقى مظبوطة في النص.

```css
body {
  height: 100vh;
  width: 100vw;
  background-color: #141414;
  margin: 0rem;
  overflow: hidden;
}

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

### Step 2: Mouse Tracking - The Magic Begins

قولنا إن كان في trick بيحصل في الcarousel، الصور كانت بتتحرك لما أحرك بالmouse. فأنا لازم أtrack الmouse movement من أول الimage-track للآخر.

تعالى نعمل event نسمع event لما الuser يدوس على الmouse بـwindow.onmousedown بيعمل track للـe.clientX اللي هو مكان الuser بدا يتحرك منه. ونربط الكلام دا بالcontainer image-track ونحتفظ بالرقم دا في dataset.

دي كانت أول خطوة. الخطوة اللي جاية لما يسيب الmouse يعني onMouseUp، نرجع الmouseDownAt لـ0 علشان الsafeguard، ونحفظ الpercentage الحالي في prevPercentage.

وطبعًا مننساش الtouch events للموبايل.

```jsx
useEffect(() => {
  const track = document.getElementById("image-track");

  const handleOnDown = (e) => {
    track.dataset.mouseDownAt = e.clientX;
  };

  const handleOnUp = () => {
    track.dataset.mouseDownAt = "0";
    track.dataset.prevPercentage = track.dataset.percentage;
  };

  window.onmousedown = (e) => handleOnDown(e);
  window.onmouseup = (e) => handleOnUp(e);
  window.ontouchstart = (e) => handleOnDown(e.touches[0]);
  window.ontouchend = (e) => handleOnUp(e.touches[0]);
}, []);
```

### Step 3: The Movement Logic

دلوقتي بقى، لما يبدأ يتحرك بالmouse يعني onMouseMove، علشان نعرف هو اتحرك قد إيه من البداية لحد ما اتحرك بالmouse.

إنه اتحرك قد إيه سهلة إنك تحسبها: minus الcurrent position من الstarting point. والmax distance هو نص الviewport يعني window.innerWidth / 2.

فلو أنا قسمت الrelative position بالmax distance هيكون decimal من 0 لـ1، وضربت في -50 هيكون معايا percentage. عاش عاش ماشي!

لو فاكر إن احنا عملنا translate للcontainer علشان نعمله center، الـ50% علشان الy-axis، والx-axis هو اللي بيتغير دلوقتي. هنجيب الcarousel يمين وشمال صح؟

يعني احنا كل اللي عايزينه إن نupdate الtranslate value. يعني track.style.transform = translate(nextPercentage - 5.5%, -50%).

طبعًا نعمل limits بالmin والmax علشان ميطلعش بره الcontainer، يعني بين 0 و-89.

ومتنساش نعمل safeguard: لما الmouseDownAt يكون 0، ميتحركش.

```jsx
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
    {
      transform: `translate(${nextPercentage - 5.5}%, -50%)`,
    },
    { duration: 1200, fill: "forwards" }
  );
};

window.onmousemove = (e) => handleOnMove(e);
window.ontouchmove = (e) => handleOnMove(e.touches[0]);
```

إيه دا إيه دا البتاع بيتحرك لوحده!

تعالى نجرب... يا الله لما تمسك الimage بيعمل drag... تبًا للjavascript! نحط draggable="false" في الHTML.

### Step 4: The Parallax Effect

والparallax effect بتاع الصور اللي كان بيتحرك لما تحرك الكلام دا؟

سهلة! هنعمل loop بسيط، وبدل الـ50% 50% object position، هنعمل الـ50% الأولانية دي بالpercentage الجديدة اللي هي next percentage و+100 علشان هي كانت من 0 لـ-100، دلوقتي هي من 100 لـ0. وبدل ما كنا بنعمل CSS تعالى نستعمل animations علشان الeffect يكون أحسن زي الموقع الأصلي.

بس نتأكد إننا بس بنحرك الصور الظاهرة (opacity أكبر من 0.1)، علشان لما نعمل expand لصورة مخلهاش تتحرك.

```jsx
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
```

والله أكبر بسم الله ما شاء الله، الcarousel خلص!

هنا الcomponent structure الكامل:

```jsx
export default function ImageTrack({
  onImageChange,
  onExpandChange,
  startExpanded,
}) {
  const trackRef = useRef(null);
  const imagesRef = useRef([]);

  const imageUrls = ["/images/home.jpg", "/images/home-1.jpg"];

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
        />
      ))}
    </div>
  );
}
```

---

## Part 2: Quick UI Elements - The Polish (2 minutes)

### CrossCursor - الcrosshair اللي في النص

تعالى نعمل الحاجات الفرعية زي الcrosshair اللي في النص والnavbar.

سهلة! نعمل container بيجمع الhorizontal والvertical line. وفي الCSS نظبط الدنيا كدا يكون في النص، horizontal وvertical line. نحطه fixed في النص بـtop: 50% وleft: 50% وtranslate. وpointer-events: none علشان ميمنعش الclick. نحط transition على الopacity علشان لما نخفيه يختفي بsmoothness.

```jsx
export default function CrossCursor({ isHidden }) {
  return (
    <div className={`crosshair ${isHidden ? "hidden" : ""}`}>
      <div className="horizontal-line" />
      <div className="vertical-line" />
    </div>
  );
}
```

```css
.crosshair {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 9999;
  transition: opacity 0.1s ease;
}

.crosshair.hidden {
  opacity: 0;
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

### Navbar - بسيطة جدًا

والnavbar بردو سهل، اتنين list items: Work وAbout، وبس كدا. نعملهم flex مع gap ونحطهم في النص بـjustify-content: center. Z-index عالي علشان يكون فوق كل حاجة.

```jsx
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

```css
.list {
  display: flex;
  color: white;
  list-style: none;
  gap: 2rem;
  justify-content: center;
  padding-top: 1.3rem;
  z-index: 10000;
  position: relative;
  user-select: none;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
```

### ImageIndicator - إحساس الاحترافية

آخر حاجة فرعية هي الimage indicator علشان إحساس الاحترافية. نحط currentImage — totalImages. والstyle: position fixed، bottom 2.3rem، left 50%، translateX(-50%) علشان يكون في النص.

```jsx
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

### Connecting Everything in App.jsx

دلوقتي لازم نعرف الcurrent image ونوصل الcomponents مع بعض. في الApp.jsx اللي هو parent للindicator والimagetrack، نعمل state للcurrentImageIndex ونباصي الprop دا في الImageTrack وفي الImageIndicator.

لما الصورة تتexpand، نخفي الcursor. فنعمل state كمان لـisImageExpanded ونباصيه للCrossCursor كـisHidden، وللImageTrack كـonExpandChange.

```jsx
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
    </main>
  );
}
```

### Tracking Center Image

في الImageTrack، نستلم الprop دا ونعمل function calculateCenterImage. الوظيفة دي بتحسب أنهي صورة حاليًا في نص الشاشة. أولًا بتجيب نص الشاشة (X وY)، وتشوف لو النقطة دي جوا حدود أي صورة، ترجع رقمها. ولو مفيش صورة في النص بالظبط، بتقيس المسافة بين مركز كل صورة ومركز الشاشة، وترجع أقرب واحدة ليه.

بعدها نlisten على updateCenterImage. الوظيفة دي بتشوف أنهي صورة دلوقتي في نص الشاشة باستخدام calculateCenterImage، وبتعمل call للـonImageChange اللي كانت الprop، وبتعمل update للcurrentImageIndex. وبنعمل pass للindex دا في الImageIndicator.

نستخدم requestAnimationFrame علشان نعمل update continuously كل frame.

```jsx
const calculateCenterImage = () => {
  const images = imagesRef.current;
  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const rect = img.getBoundingClientRect();

    if (
      rect.left <= viewportCenterX &&
      rect.right >= viewportCenterX &&
      rect.top <= viewportCenterY &&
      rect.bottom >= viewportCenterY
    ) {
      return i + 1;
    }
  }

  let closestIndex = 0;
  let minDistance = Infinity;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const rect = img.getBoundingClientRect();
    const imgCenterX = rect.left + rect.width / 2;
    const imgCenterY = rect.top + rect.height / 2;

    const distance = Math.sqrt(
      Math.pow(imgCenterX - viewportCenterX, 2) +
        Math.pow(imgCenterY - viewportCenterY, 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }

  return closestIndex + 1;
};

let animationFrameId;
const updateCenterImage = () => {
  const centerImage = calculateCenterImage();
  onImageChange(centerImage);
  animationFrameId = requestAnimationFrame(updateCenterImage);
};

updateCenterImage();
```

---

## Part 3: The Click Magic - GSAP Time (3-4 minutes)

هنا بقى break 10 ثواني نجيب حد يساعدنا في الحاجات التقيلة.

**GSAP** - أحسن library animation موجودة بقالها أكتر من 25 سنة! وكل التفاصيل هنا قريب إن شاء الله.

نعمل install للـGSAP وnregister الuseGSAP hook اللي هو هو بالظبط useEffect بس للanimations.

```bash
npm install gsap @gsap/react
```

```jsx
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);
```

### The Click Functionality

دلوقتي يا كينج، احنا وصلنا للحتة اللي بتخلي كل حاجة في الموقع تحس إنها عايشة. اللي هو لما تدوس على الصورة... تلاقيها بتنفجر كدا وتفرد على الشاشة كلها. زي الموقع الأصلي بالظبط.

أول حاجة نعمل state للـexpandedImageIndex علشان نعرف أنهي صورة متوسعة دلوقتي. ونعمل refs علشان نحتفظ بالclone بتاع الصورة والمكان الأصلي علشان نرجعها تاني.

نعمل function handleImageClick. لو الصورة اللي دوست عليها هي نفسها اللي متوسعة، يبقى collapse. لو لأ، يبقى expand. نcall الonExpandChange prop علشان نخبر الApp إن الصورة اتوسعت، ونset الexpandedImageIndex.

```jsx
const [expandedImageIndex, setExpandedImageIndex] = useState(null);
const clonedImageRef = useRef(null);
const originalPositionRef = useRef(null);
const savedObjectPositionsRef = useRef([]);

const handleImageClick = (index) => {
  if (expandedImageIndex === index) {
    // Collapse
  } else {
    // Expand
    if (onExpandChange) onExpandChange(true);
    setExpandedImageIndex(index);
  }
};
```

### GSAP Expansion Animation

ونبدأ الclick والclick out functionality. نستخدم useGSAP hook. لو الexpandedImageIndex null، معناها مفيش حاجة توسعت، فنرجع. لو لأ، نبدأ الanimation.

نجيب الصورة اللي اتدوس عليها ونجيب مكانها الحالي بـgetBoundingClientRect. نحسب المكان النهائي: top: 0، left: 0، width: 100vw، height: 100vh يعني fullscreen.

دلوقتي الحتة المهمة: ليه نعمل clone للصورة؟ علشان الtrack عنده transform، وdا بيخلي position: fixed يبقى relative للtrack مش للviewport. فنعمل clone ونحطه على body مباشرة.

نحفظ المكان الأصلي في originalPositionRef علشان نرجعها تاني. ونحفظ الobject-position بتاع كل الصور في savedObjectPositionsRef علشان لما نرجعها تبقى زي ما كانت بالظبط.

نستخدم gsap.set علشان نحط الclone في المكان الأصلي للصورة، ونخفي الصورة الأصلية. بعدها نعمل timeline ونanimate الclone لـfullscreen. في نفس الوقت نخفي باقي الصور بـopacity: 0.

ونقفل الinteraction مع الtrack بـpointerEvents: none. وفي الonComplete نحط click handler على الclone علشان لما ندوس عليه تاني يعمل collapse.

```jsx
useGSAP(
  () => {
    if (expandedImageIndex === null) return;

    const images = imagesRef.current;
    const clickedImage = images[expandedImageIndex];
    const track = trackRef.current;
    const rect = clickedImage.getBoundingClientRect();

    const clone = clickedImage.cloneNode(true);
    document.body.appendChild(clone);
    clonedImageRef.current = clone;

    originalPositionRef.current = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };

    savedObjectPositionsRef.current = images.map((img) => {
      const style = window.getComputedStyle(img);
      return style.objectPosition;
    });

    gsap.set(clone, {
      position: "fixed",
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      zIndex: 1000,
      objectFit: "cover",
      cursor: "pointer",
    });

    gsap.set(clickedImage, { opacity: 0 });

    const tl = gsap.timeline();

    tl.to(clone, {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      objectPosition: "50% center",
      duration: 0.8,
      ease: "easeIn",
      onComplete: () => {
        const clickHandler = () => handleImageClick(expandedImageIndex);
        cloneClickHandlerRef.current = clickHandler;
        clone.addEventListener("click", clickHandler);
      },
    });

    images.forEach((img, index) => {
      if (index !== expandedImageIndex) {
        tl.to(
          img,
          {
            opacity: 0,
            duration: 1.5,
            ease: "power2.inOut",
          },
          0
        );
      }
    });

    if (track) {
      track.style.pointerEvents = "none";
    }
  },
  { scope: trackRef, dependencies: [expandedImageIndex] }
);
```

في اللحظة دي، الcrosshair اللي في النص بيختفي (من خلال isHidden prop من App.jsx). والعنوان بيطلع فوق الشاشة بanimation smooth: "The Regeneration Suite". تحس إنك في gallery فني مش موقع.

```jsx
{
  isImageExpanded && (
    <div className="image-title-overlay">
      <h1 className="image-title">The Regeneration Suite</h1>
    </div>
  );
}
```

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
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
```

### The Collapse Animation

وبعدين، لما تخلص تتفرج... تدوس تاني. نفس الزرار، نفس الصورة، بس المرادي كل حاجة بترجع بالعكس.

الـoverlay يختفي، الcrosshair يرجع مكانه في النص، والصورة تعمل كدا shrink لطيف، وترجع لمكانها الأصلي بين باقي الصور. كأنها بتقول: "أنا خلصت دوري." وفي ثواني، كل الصور التانية ترجع تتنفس من تاني، والcarousel يرجع يشتغل، كأن مفيش حاجة حصلت.

في الhandleImageClick، لو الindex اللي دوست عليه هو نفس الexpandedImageIndex، يبقى collapse. نcall الonExpandChange بـfalse علشان نخبر الApp، ونset الexpandedImageIndex بـnull فورًا علشان منعملش re-clicks.

نجيب الclone والoriginal position. نremove الevent listener من الclone. نعمل reverse animation: نرجع الclone لمكانه الأصلي ونرجع الobject-position المحفوظ بتاعه. في الonComplete نremove الclone من الDOM.

في نفس الوقت، نرجع كل الصور بـopacity: 1، ونرجع الobject-position المحفوظ بتاعهم. بعد ما الanimation يخلص، ننضف الinline styles بـclearProps ونرجع الtrack interaction بـpointerEvents: auto.

```jsx
const handleImageClick = (index) => {
  if (expandedImageIndex === index) {
    if (onExpandChange) onExpandChange(false);

    const images = imagesRef.current;
    const track = trackRef.current;
    const clone = clonedImageRef.current;
    const originalPos = originalPositionRef.current;

    setExpandedImageIndex(null);

    if (clone) {
      if (cloneClickHandlerRef.current) {
        clone.removeEventListener("click", cloneClickHandlerRef.current);
        cloneClickHandlerRef.current = null;
      }

      if (originalPos) {
        const savedObjectPosition =
          savedObjectPositionsRef.current[index] || "50% center";

        gsap.to(clone, {
          top: originalPos.top,
          left: originalPos.left,
          width: originalPos.width,
          height: originalPos.height,
          objectPosition: savedObjectPosition,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            clone.remove();
            clonedImageRef.current = null;
          },
        });
      }
    }

    images.forEach((img, idx) => {
      if (img) {
        const savedPosition =
          savedObjectPositionsRef.current[idx] || "50% center";

        gsap.set(img, { objectPosition: savedPosition });
        gsap.to(img, {
          opacity: 1,
          duration: 0.8,
          ease: "power2.inOut",
        });
      }
    });

    gsap.delayedCall(0.8, () => {
      images.forEach((img) => {
        if (img) gsap.set(img, { clearProps: "opacity" });
      });

      if (track) {
        track.style.pointerEvents = "auto";
      }
    });
  } else {
    if (onExpandChange) onExpandChange(true);
    setExpandedImageIndex(index);
  }
};
```

كليك واحدة توسع الدنيا ✨  
كليك تانية، كل حاجة تهدى 💫

كل دا بيحصل في sequence صغير جدًا، بس الإحساس اللي بتاخده منه... priceless. هو دا الجمال اللي في التفاصيل.

---

## Part 4: The Loading Intro - The Opening Act (4-5 minutes)

أول ما الموقع يفتح... الكل واقف في انتظار اللحظة. الشاشة سودا، ومفيش غير رقم صغير بيزيد: "12%... 37%... 75%... 100%."

تحس كأنك بتتفرج على باب بيتفتح على عالم جديد.

### Step 1: Image Preloading

أول حاجة في الloading intro، نعمل preload للصور. Don't forget to mention to see the loading is waiting for the images! نعمل state للloadingProgress وللimagesLoaded.

في useEffect، نعمل function loadImages. نloop على كل الimageUrls ونعمل Promise لكل واحدة. نعمل Image object جديد، ولما يload نزود الloadedCount ونupdate الprogress. لما كل الpromises تخلص، نset الimagesLoaded بـtrue.

في الreturn، لو الصور لسه بتload، نعرض الloading progress. لو خلصت، نعرض الgrids.

```jsx
export default function LoadingIntro({ onComplete }) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const containerRef = useRef(null);

  const imageUrls = ["/images/home.jpg", "/images/home-1.jpg"];

  useEffect(() => {
    const loadImages = async () => {
      const totalImages = imageUrls.length;
      let loadedCount = 0;

      const loadPromises = imageUrls.map((url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            loadedCount++;
            setLoadingProgress(Math.round((loadedCount / totalImages) * 100));
            resolve();
          };
          img.onerror = reject;
          img.src = url;
        });
      });

      try {
        await Promise.all(loadPromises);
        setTimeout(() => {
          setImagesLoaded(true);
        }, 300);
      } catch (error) {
        console.error("Error loading images:", error);
        setImagesLoaded(true);
      }
    };

    loadImages();
  }, []);

  return (
    <div className="loading-intro-overlay">
      {!imagesLoaded && (
        <div className="loading-progress">
          <h2 className="loading-text">{loadingProgress}%</h2>
        </div>
      )}
    </div>
  );
}
```

### Step 2: The Grid Structure

وفجأة — البوابة تفتح. خمس أعمدة من الصور يظهروا قدامك، كل عمود بيتحرك في اتجاه عكس التاني، زي أوركسترا بصرية... كل صورة ليها توقيتها.

لما الصور تload، نعرض الgrid container. نعمل 5 grids (الأعمدة)، كل grid فيه 4 صور. الصورة اللي في النص من الgrid الوسطاني (gridIndex === 2 && imgIndex === 2) هي الhero image، دي اللي هتتوسع. باقي الصور نوزعهم من الimageUrls.

في الCSS، الcontainer display flex علشان الgrids يبقوا جنب بعض. كل grid عرضه 25vw وheight 100vh. الصور absolute positioning، كل واحدة height 25vh.

```jsx
{
  imagesLoaded && (
    <div ref={containerRef} className="intro-grid-container">
      {[0, 1, 2, 3, 4].map((gridIndex) => (
        <div key={gridIndex} className="intro-grid">
          {[0, 1, 2, 3].map((imgIndex) => {
            let imageUrl;
            if (gridIndex === 2 && imgIndex === 2) {
              imageUrl = "/images/home.jpg";
            } else {
              imageUrl =
                imageUrls[(gridIndex * 4 + imgIndex) % imageUrls.length];
            }

            return (
              <img
                key={imgIndex}
                src={imageUrl}
                alt=""
                className="intro-grid-image"
                draggable="false"
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
```

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
}

.intro-grid-container {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  overflow: visible;
}

.intro-grid {
  width: 25vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.intro-grid-image {
  position: absolute;
  width: 100%;
  height: 25vh;
  object-fit: cover;
  will-change: transform;
}
```

### Step 3: GSAP Grid Animation

دلوقتي نanimate الgrids. نستخدم useGSAP، ونعمل master timeline. لما يخلص، نcall الonComplete prop علشان نخبر الApp إن الintro خلصت.

نloop على كل grid. كل grid بيتحرك في اتجاه عكس اللي قبله: لو الgridIndex even، يتحرك من تحت لفوق. لو odd، من فوق لتحت. نعمل set للـy value: لو من تحت لفوق، y: "100vh" (تحت الشاشة). لو من فوق لتحت، y: "-100vh" (فوق الشاشة).

بعدها نanimate كل الصور لـy: 0، يعني مكانها الأصلي. Duration 1.5، ease power2.inOut. وكلهم يبدأوا في نفس الوقت بالـ0 في الtimeline.

بس الhero image (gridIndex === 2 && imgIndex === 2) هنعملها special treatment، هنشوفها بعدين.

```jsx
useGSAP(
  () => {
    if (!imagesLoaded || !containerRef.current) return;

    const masterTL = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    const grids = containerRef.current.querySelectorAll(".intro-grid");

    grids.forEach((grid, gridIndex) => {
      const images = grid.querySelectorAll(".intro-grid-image");
      const isBottomToTop = gridIndex % 2 === 0;

      images.forEach((img, imgIndex) => {
        const isHeroImage = gridIndex === 2 && imgIndex === 2;

        if (isBottomToTop) {
          gsap.set(img, {
            top: `${imgIndex * 25}vh`,
            y: "100vh",
          });
        } else {
          gsap.set(img, {
            bottom: `${imgIndex * 25}vh`,
            top: "auto",
            y: "-100vh",
          });
        }

        if (!isHeroImage) {
          masterTL.to(
            img,
            {
              y: 0,
              duration: 1.5,
              ease: "power2.inOut",
            },
            0
          );
        }
      });
    });
  },
  { scope: containerRef, dependencies: [imagesLoaded] }
);
```

### Step 4: Hero Image Expansion

الصورة اللي في النص؟ هي البطل. تبدأ تطلع من مكانها بهدوء، تتحرك لفوق، وبعدين... تكبر. تكبر لحد ما تبلع الشاشة كلها. كل الصور التانية تختفي، الواجهة تنضف، ويبقى قدامك بس مشهد واحد ضخم... الصورة الرئيسية.

للhero image، نعمل clone ونحطه على body. نحط ID عليه "intro-hero-clone" علشان الImageTrack يلاقيه ويستخدمه بعدين (seamless transition!).

نجيب مكان الصورة الأصلي بـgetBoundingClientRect. نset الclone إنه يبدأ من تحت الشاشة (top: imageTop + window.innerHeight). ونخفي الoriginal.

بعدها نanimate على مرحلتين:

1. أول animation: طلع لمكانها الأصلي (top: imageTop)، duration 1.5، مع باقي الصور (position 0 في الtimeline).
2. تاني animation: كبر للfullscreen (100vw × 100vh)، duration 1.2، بعد ما توصل مكانها بـ0.2 ثانية (+=0.2).

في الonComplete، نremove الcontainer بتاع الgrids كله علشان منضفش الDOM. وفي الonComplete بتاع الmaster timeline، نfade out الoverlay وندي الكنترول للImageTrack.

```jsx
if (isHeroImage) {
  const rect = img.getBoundingClientRect();
  const clone = img.cloneNode(true);
  document.body.appendChild(clone);
  clone.id = "intro-hero-clone";

  const imageTop = rect.top;
  const imageLeft = rect.left;
  const imageWidth = rect.width;
  const imageHeight = rect.height;

  gsap.set(clone, {
    position: "fixed",
    top: imageTop + window.innerHeight,
    left: imageLeft,
    width: imageWidth,
    height: imageHeight,
    zIndex: 100000,
    objectFit: "cover",
  });

  gsap.set(img, { opacity: 0 });

  masterTL
    .to(
      clone,
      {
        top: imageTop,
        duration: 1.5,
        ease: "power2.inOut",
      },
      0
    )
    .to(
      clone,
      {
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        objectPosition: "50% center",
        duration: 1.2,
        ease: "power2.inOut",
        onComplete: () => {
          if (containerRef.current) {
            containerRef.current.remove();
          }
        },
      },
      "+=0.2"
    );
}
```

### Step 5: Seamless Transition to Main Site

الانترو خلصت، الكاميرا سلمت البطل للموقع. ImageTrack يستلم المشهد بدون ما تحس إن في قفلة أو بداية جديدة.

في App.jsx، نعمل state للintroComplete. لما الintro يخلص، نcall handleIntroComplete، ودا بيset الisImageExpanded بـtrue والintroComplete بـtrue. نpass الstartExpanded prop للImageTrack، ودا بيكون true لو الintro خلصت والصورة expanded.

نخلي الCrossCursor مخفي لحد ما الintro يخلص ولحد ما الصورة تتقفل. ونعرض الLoadingIntro بس لو الintro لسه مخلصتش.

```jsx
function App() {
  const [currentImageIndex, setCurrentImageIndex] = useState(1);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

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
```

في ImageTrack، لو startExpanded true، معناها احنا جايين من الintro. ندور على الclone اللي الintro عمله (intro-hero-clone). لو لقيناه، نستخدمه مباشرة بدون animation جديدة. نتأكد إنه في fullscreen، ونحط عليه click handler، ونخفي كل الصور التانية. دا بيدينا seamless transition من الintro للموقع الأساسي!

نستخدم hasCompletedIntroRef علشان نعمل الكلام دا مرة واحدة بس (أول مرة بعد الintro)، مش كل مرة يعمل expand.

```jsx
const hasCompletedIntroRef = useRef(false);

useGSAP(
  () => {
    if (expandedImageIndex === null) return;

    if (
      startExpanded &&
      expandedImageIndex === 0 &&
      !hasCompletedIntroRef.current
    ) {
      hasCompletedIntroRef.current = true;

      let clone = document.getElementById("intro-hero-clone");

      if (clone) {
        gsap.set(clone, {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          objectFit: "cover",
          zIndex: 1000,
        });

        clone.removeAttribute("id");
        clonedImageRef.current = clone;

        const clickHandler = () => handleImageClick(0);
        cloneClickHandlerRef.current = clickHandler;
        clone.addEventListener("click", clickHandler);

        const images = imagesRef.current;
        gsap.set(images[0], { opacity: 0 });
        images.forEach((img, index) => {
          if (index !== 0) gsap.set(img, { opacity: 0 });
        });

        if (trackRef.current) {
          trackRef.current.style.pointerEvents = "none";
        }
      }

      return;
    }

    // باقي الكود العادي للexpansion...
  },
  { scope: trackRef, dependencies: [expandedImageIndex, startExpanded] }
);
```

كل دا حصل في ست ثواني. ست ثواني بس، لكنها بتحطك جوه العالم قبل ما الموقع حتى يبدأ يتكلم.

---

## Conclusion (1 minute)

والله يا جدعان، دا كان الموقع.

من carousel smooth بتتبع الmouse،  
لـanimations بتوسع وتطلع وترجع بالعكس،  
لـloading intro بيدخلك في الموضوع كأنك في سينما.

كل دا ببساطة:

- React للstructure
- GSAP للanimations
- وشوية رياضيات للcarousel

الكود كله موجود، جربوا تلعبوا فيه.  
غيروا الألوان، زودوا صور، اعملوا الموقع بتاعكم.

ولو عملتوا حاجة جامدة، ابعتوها!  
وإن شاء الله نتكلم عن GSAP بالتفصيل في فيديو قريب.

يلا بينا، عاش! 🚀
