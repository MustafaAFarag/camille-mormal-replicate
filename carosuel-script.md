# Carousel + Parallax — Script and Snippet

This is a focused, code-aligned walkthrough for the horizontal image carousel with a parallax feel. It mirrors the original English idea (10 HTML / 20 CSS / 30 JS vibes) but uses the exact logic and values from this project, and only covers the drag-to-pan slider + per-image parallax. No loading intro and no click-to-expand here.

## What we’re building

- A horizontally scrolling track of images that you can drag left/right.
- The track moves based on an “invisible slider” tied to your mouse drag distance.
- Each image shifts its object-position to create a subtle parallax effect.
- The slider remembers where you left off and clamps movement so you can’t overscroll.

## Key ideas (quick contract)

- Inputs: mouse down X, subsequent mouse move X
- State: track.dataset.mouseDownAt, track.dataset.prevPercentage, track.dataset.percentage
- Output: transform translate(X%, -50%) on the track, object-position on images
- Bounds: nextPercentage clamped to [-89, 0] to avoid empty space at the ends

---

## Minimal snippet (HTML/CSS/JS)

Note: Values match the current project — especially translate offset -5.5% for centering, clamp to -89..0, and parallax formula 50 + nextPercentage/2.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Carousel + Parallax</title>
    <style>
      /* Body: full-viewport, dark, no scrollbars */
      body {
        height: 100vh;
        width: 100vw;
        background-color: #141414;
        margin: 0;
        overflow: hidden;
      }

      /* Track: center-ish with a tiny X offset for visual balance */
      #image-track {
        display: flex;
        gap: 4vmin;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-5.5%, -50%);
        user-select: none;
      }

      /* Images: fixed aspect, cover, centered initially */
      #image-track > .image {
        width: 35vmin;
        height: 50vmin;
        object-fit: cover;
        object-position: 50% center;
      }
    </style>
  </head>
  <body>
    <div
      id="image-track"
      data-mouse-down-at="0"
      data-percentage="0"
      data-prev-percentage="0"
    >
      <!-- Eight images; replace src with your assets -->
      <img class="image" src="/images/home.jpg" draggable="false" />
      <img class="image" src="/images/home-1.jpg" draggable="false" />
      <img class="image" src="/images/home.jpg" draggable="false" />
      <img class="image" src="/images/home-1.jpg" draggable="false" />
      <img class="image" src="/images/home.jpg" draggable="false" />
      <img class="image" src="/images/home-1.jpg" draggable="false" />
      <img class="image" src="/images/home.jpg" draggable="false" />
      <img class="image" src="/images/home-1.jpg" draggable="false" />
    </div>

    <script>
      const track = document.getElementById("image-track");

      const handleOnDown = (e) => {
        track.dataset.mouseDownAt = e.clientX;
      };

      const handleOnUp = () => {
        track.dataset.mouseDownAt = "0";
        // Persist where we left off so subsequent drags continue smoothly
        track.dataset.prevPercentage = track.dataset.percentage;
      };

      const handleOnMove = (e) => {
        if (track.dataset.mouseDownAt === "0") return; // only drag while mouse is down

        const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX;
        const maxDelta = window.innerWidth / 2; // halfway across the viewport

        // Convert drag distance to a percentage controlling the slider
        const percentage = (mouseDelta / maxDelta) * -50;
        const prevPercentage = parseFloat(track.dataset.prevPercentage) || 0;
        const nextPercentageUnconstrained = prevPercentage + percentage;

        // Clamp so we can’t overscroll (matches project’s range)
        const nextPercentage = Math.max(
          Math.min(nextPercentageUnconstrained, 0),
          -89
        );

        track.dataset.percentage = nextPercentage;

        // Move the entire track (tiny -5.5% X offset keeps the layout visually centered)
        track.animate(
          { transform: `translate(${nextPercentage - 5.5}%, -50%)` },
          { duration: 1200, fill: "forwards" }
        );

        // Parallax: adjust each image’s object-position based on the same slider value
        const images = track.getElementsByClassName("image");
        for (const image of images) {
          image.animate(
            { objectPosition: `${50 + nextPercentage / 2}% center` },
            { duration: 1200, fill: "forwards" }
          );
        }
      };

      // Mouse events (intentionally omitting touch here to keep parity with the original brief)
      window.addEventListener("mousedown", handleOnDown);
      window.addEventListener("mouseup", handleOnUp);
      window.addEventListener("mousemove", handleOnMove);
    </script>
  </body>
</html>
```

---

## Walkthrough (script-style)

- Let’s keep it tight: minimal markup, a pinch of CSS, and just enough JavaScript to feel magic.
- The images live in a single container we’ll call the track. We center it with left: 50%, top: 50%, and translate to nudge it into place. There’s a small -5.5% X offset that balances the layout.
- The core trick is an invisible slider that follows your mouse:
  - On mousedown, record the X coordinate as our starting point in `track.dataset.mouseDownAt`.
  - On mousemove, measure how far we’ve dragged relative to that start.
  - Half the viewport width is our maximum “slider throw,” so we normalize drag distance by `window.innerWidth / 2` and scale to a percentage.
  - Add that to the previous percentage (persisted on mouseup) so new drags continue from where you left off.
  - Clamp the result to `[-89, 0]` so you can’t fling the track into empty space.
- We animate the track’s transform to glide left/right. The `fill: "forwards"` keeps the end state applied without snapping back.
- For the parallax feel, each image updates its `object-position`: `50 + nextPercentage / 2` percent. Same slider value, smaller range, extra smooth.
- Also set `draggable="false"` on images to prevent the default browser drag ghost from hijacking the interaction.

That’s it. Drag anywhere, the slider does the math, the track moves, and the images subtly counter-shift for that buttery feel.

---

## Notes vs. the original

- The original describes clamping to [-100, 0]. This implementation clamps to [-89, 0] to match the current image widths and spacing, avoiding blank gaps at the tail.
- The tiny `-5.5%` X offset in the transform centers the layout visually given the track width and gaps.
- Only mouse events are shown here to stay aligned with the original brief.

---

## السكريبت العربي السريع لزمايل الكلية

هوك سريع:
عايز تعمل سلايدر ناعم كـ “بارالاكس” من غير مكتبات تقيلة؟ شد بالماوس نص الشاشة وشوف السحر: التراك يتحرك، والصور تزحلق بنصف القيمة… كله بحساب بسيط.

نبدأ بالعتاد:

- جهّز 8 صور (لو مستلهم من موقع، ببساطة خد الصور من الـ Inspect/Network وحطها في `public/images`).
- عندنا كونتينر واحد اسمه `#image-track` هنرصف فيه الصور جنب بعض.

CSS أساسي ومهم:

- للجسم: `height: 100vh; width: 100vw; background: #141414; margin: 0; overflow: hidden;` عشان الشاشة تبقى مظبوطة ومفيش سكرول.
- للتراك: `display: flex; gap: 4vmin; position: absolute; left: 50%; top: 50%; transform: translate(-5.5%, -50%); user-select: none;`
  - خد بالك من `-5.5%` على محور X: دي تزبيطة بسيطة تخلي المنظر متوازن.
- للصورة: `width: 35vmin; height: 50vmin; object-fit: cover; object-position: 50% center;`

السلايدر الخفي (الجزء الممتع):

1. أول ما تعمل `mousedown` على أي حتة: نخزن مكان الضغط X في `track.dataset.mouseDownAt`.
2. وإنت بتسحب (`mousemove`):
   - نحسب الفرق: `mouseDelta = mouseDownAt - currentX`.
   - أقصى مسافة معتبرينها: نص عرض الشاشة `window.innerWidth / 2`.
   - نطلّع نسبة التحريك: `(mouseDelta / maxDelta) * -50`.
   - نضيفها على اللي وقفنا عنده قبل كده: `prevPercentage` (وده بيتحدث في `mouseup`).
   - نقفل الحركة: `nextPercentage` بين `-89` و`0` عشان ما تبقاش فيه فراغات على الأطراف.
3. نحرّك التراك بـ `transform: translate(${nextPercentage - 5.5}%, -50%)` ونعمل `animate` لمدة `1200ms` مع `fill: "forwards"` عشان الثبات.
4. البارالاكس: كل صورة تعمل `animate` على `object-position` إلى `${50 + nextPercentage / 2}% center` — نفس قيمة السلايدر بس على نص المدى.
5. مهم: حط `draggable="false"` على الصور عشان ما يتفعّلش سحب المتصفح الافتراضي.

ليه الإشارة بالسالب؟

- اتجاه السحب عكس اتجاه التحريك، فإشارة `-50` بتضبط إحساس السحب يمين/شمال.

ليه بنخزن `prevPercentage`؟

- عشان لو سبت الماوس وسحبت تاني، نكمل من نفس المكان بدل ما كل مرة نبدأ من الصفر.

أرقام لازم تلتزم بيها (علشان تكون نسخة طبق الأصل من الكود):

- الكلمب: من `-89` لـ `0`.
- الأوفست في الـ translate: `-5.5%` على X.
- مدّة الأنيميشن: `1200ms`.
- البارالاكس: `50 + nextPercentage / 2`.
- الأحداث: `mousedown` / `mousemove` / `mouseup` على `window` (مفيش تاتش هنا علشان نفضل مركزين).

خلاصة بجملة:
اسحب بالماوس → حول المسافة لنسبة → حرّك التراك → غيّر `object-position` بنص القيمة… كده أخدت إيفكت بارالاكس نضيف بنفس منطق الفيديو الأصلي.
