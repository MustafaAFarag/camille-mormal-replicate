# The `position: fixed` Bug - Explained

## 🐛 The Problem

When trying to expand an image to fullscreen using `position: fixed`, the image was **not** positioning relative to the viewport. Instead, it was positioning relative to its parent container (`#image-track`).

### Why This Happened

**CSS Rule:** When a parent element has a `transform` property, it creates a new **containing block** for its descendants.

In our case:

```css
#image-track {
  display: flex;
  gap: 4vmin;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-5.5%, -50%); /* ⚠️ This is the culprit! */
  user-select: none;
}
```

The `transform: translate(-5.5%, -50%)` on the parent caused all `position: fixed` children to position relative to `#image-track`, **not** the viewport.

## 📖 The CSS Specification

According to the [CSS Transforms Specification](https://www.w3.org/TR/css-transforms-1/#transform-rendering):

> "For elements whose layout is governed by the CSS box model, any value other than `none` for the transform property results in the creation of a containing block for all descendants."

This means:

- Normally: `position: fixed` → positions relative to the **viewport**
- With transformed parent: `position: fixed` → positions relative to the **transformed parent**

## ✅ The Solution

We need to **move the image outside of the transformed parent** to make `position: fixed` work correctly.

### Implementation

```javascript
// 1. Clone the image
const clone = clickedImage.cloneNode(true);

// 2. Append directly to body (outside the transformed parent)
document.body.appendChild(clone);

// 3. Now position: fixed works relative to viewport!
gsap.set(clone, {
  position: "fixed",
  top: rect.top, // Actual viewport coordinates
  left: rect.left, // Actual viewport coordinates
  width: rect.width,
  height: rect.height,
  zIndex: 1000,
});

// 4. Animate to fullscreen
gsap.to(clone, {
  top: 0, // Top-left corner of VIEWPORT
  left: 0, // Top-left corner of VIEWPORT
  width: "100vw", // Full viewport width
  height: "100vh", // Full viewport height
  duration: 1.5,
  ease: "power2.inOut",
});

// 5. Hide the original image
gsap.set(clickedImage, {
  opacity: 0,
});
```

## 🎯 Key Takeaways

1. **Parent `transform` creates a containing block** - Any transform value (except `none`) changes how `position: fixed` behaves
2. **Solution: Move element outside transformed parent** - Append to `document.body` or another non-transformed ancestor
3. **Use cloning for flexibility** - Clone the element, animate it, and remove it when done
4. **`getBoundingClientRect()` gives viewport coordinates** - Always returns coordinates relative to the viewport, regardless of parent transforms

## 🔍 Other Properties That Create Containing Blocks

It's not just `transform`! These CSS properties also create a containing block for `position: fixed` descendants:

- `transform: <any value except none>`
- `perspective: <any value except none>`
- `filter: <any value except none>`
- `will-change: transform | perspective | filter`
- `contain: paint`
- `backdrop-filter: <any value except none>`

## 📚 References

- [MDN - Containing Block](https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block)
- [CSS Transforms Spec - Transform Rendering](https://www.w3.org/TR/css-transforms-1/#transform-rendering)
- [W3C - Absolutely Positioned Elements](https://www.w3.org/TR/CSS21/visuren.html#absolutely-positioned)

---

**TL;DR:** Parent has `transform`? Your `position: fixed` child won't position relative to viewport. Move it outside the transformed parent! 🚀
