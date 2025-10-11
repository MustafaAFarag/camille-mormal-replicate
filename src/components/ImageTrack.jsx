import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

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
  const clonedImageRef = useRef(null);
  const originalPositionRef = useRef(null);
  const cloneClickHandlerRef = useRef(null); // Store click handler for cleanup

  // Debug logging
  useEffect(() => {
    console.log("📊 Expanded State Changed:", expandedImageIndex);
  }, [expandedImageIndex]);

  useEffect(() => {
    if (startExpanded && expandedImageIndex === null) {
      setExpandedImageIndex(0);
    }
  }, [startExpanded]);

  useEffect(() => {
    const track = document.getElementById("image-track");
    const totalImages = 8;

    // Function to calculate which image intersects with the viewport center
    const calculateCenterImage = () => {
      const images = imagesRef.current;
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;

      // Find which image's bounding box contains the center point
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img) continue;

        const rect = img.getBoundingClientRect();

        // Check if viewport center is within this image's bounds
        if (
          rect.left <= viewportCenterX &&
          rect.right >= viewportCenterX &&
          rect.top <= viewportCenterY &&
          rect.bottom >= viewportCenterY
        ) {
          return i + 1; // Return 1-based index
        }
      }

      // If no exact intersection, find the closest image to center
      let closestIndex = 0;
      let minDistance = Infinity;

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img) continue;

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

      return closestIndex + 1; // Return 1-based index
    };

    const handleOnDown = (e) => (track.dataset.mouseDownAt = e.clientX);

    const handleOnUp = () => {
      track.dataset.mouseDownAt = "0";
      track.dataset.prevPercentage = track.dataset.percentage;
    };

    const handleOnMove = (e) => {
      if (track.dataset.mouseDownAt === "0") return;

      const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX,
        maxDelta = window.innerWidth / 2;

      const percentage = (mouseDelta / maxDelta) * -50,
        prevPercentage = parseFloat(track.dataset.prevPercentage) || 0, // Default to 0 if NaN
        nextPercentageUnconstrained = prevPercentage + percentage,
        nextPercentage = Math.max(
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

      for (const image of track.getElementsByClassName("image")) {
        image.animate(
          {
            objectPosition: `${50 + nextPercentage / 2}% center`,
          },
          { duration: 1200, fill: "forwards" }
        );
      }
    };

    /* -- Had to add extra lines for touch events -- */

    window.onmousedown = (e) => handleOnDown(e);

    window.ontouchstart = (e) => handleOnDown(e.touches[0]);

    window.onmouseup = (e) => handleOnUp(e);

    window.ontouchend = (e) => handleOnUp(e.touches[0]);

    window.onmousemove = (e) => handleOnMove(e);

    window.ontouchmove = (e) => handleOnMove(e.touches[0]);

    // Continuously update which image is at center using requestAnimationFrame
    let animationFrameId;
    const updateCenterImage = () => {
      const centerImage = calculateCenterImage();
      onImageChange(centerImage);
      animationFrameId = requestAnimationFrame(updateCenterImage);
    };

    // Start the continuous update loop
    updateCenterImage();

    // Cleanup on unmount
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [onImageChange]);

  // GSAP animation for image expansion
  useGSAP(
    () => {
      if (expandedImageIndex === null) return;

      const images = imagesRef.current;
      const clickedImage = images[expandedImageIndex];
      const track = trackRef.current;

      if (!clickedImage) return;

      // If starting expanded (from intro), just set up the expanded state without animation
      if (startExpanded && expandedImageIndex === 0) {
        console.log("=== Starting Expanded (Skip Animation) ===");

        // Look for existing intro clone instead of creating a new one
        let clone = document.getElementById("intro-hero-clone");

        if (clone) {
          console.log("✅ Found existing intro clone, reusing it");
          const rect = clone.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(clone);
          console.log("🔍 INTRO CLONE STATE WHEN FOUND:", {
            boundingRect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            },
            computedStyle: {
              top: computedStyle.top,
              left: computedStyle.left,
              width: computedStyle.width,
              height: computedStyle.height,
              position: computedStyle.position,
              objectFit: computedStyle.objectFit,
            },
          });

          // CRITICAL FIX: Ensure clone is at full viewport size
          // Sometimes GSAP animations don't complete perfectly
          gsap.set(clone, {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "cover",
            objectPosition: "50% center",
            zIndex: 1000,
            clearProps: "transform",
          });

          console.log("🔧 Clone verified and set to 100vw x 100vh");
          const verifiedRect = clone.getBoundingClientRect();
          console.log("Verified dimensions:", {
            width: verifiedRect.width,
            height: verifiedRect.height,
          });

          // Remove the ID since we're taking over
          clone.removeAttribute("id");
        } else {
          console.log("No intro clone found, creating new one");
          // Fallback: create clone at fullscreen
          clone = clickedImage.cloneNode(true);
          document.body.appendChild(clone);

          gsap.set(clone, {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            margin: 0,
            padding: 0,
            zIndex: 1000,
            transform: "none",
            objectFit: "cover",
            cursor: "pointer",
          });
        }

        clonedImageRef.current = clone;

        // Hide original and other images
        gsap.set(clickedImage, { opacity: 0 });
        images.forEach((img, index) => {
          if (index !== expandedImageIndex) {
            gsap.set(img, { opacity: 0 });
          }
        });

        // Add click handler to collapse
        const clickHandler = () => {
          console.log(
            "Clone clicked! Current expandedImageIndex:",
            expandedImageIndex
          );
          // Always pass 0 since this is the first image from intro
          handleImageClick(0);
        };
        cloneClickHandlerRef.current = clickHandler;
        clone.addEventListener("click", clickHandler);

        // Disable track interaction
        if (track) {
          track.style.pointerEvents = "none";
        }

        // Calculate and store the original carousel position for collapse
        // We need to get the position where the image WOULD be in the carousel
        const trackRect = track.getBoundingClientRect();
        const imageWidth = clickedImage.offsetWidth;
        const imageHeight = clickedImage.offsetHeight;

        // Calculate position based on track's current state
        const percentage = parseFloat(track.dataset.percentage) || 0;
        const imageLeft = trackRect.left + expandedImageIndex * imageWidth;

        originalPositionRef.current = {
          top: trackRect.top,
          left: imageLeft,
          width: imageWidth,
          height: imageHeight,
        };

        console.log(
          "Stored original position for collapse:",
          originalPositionRef.current
        );

        return;
      }

      // Get the current position and size of the clicked image
      const rect = clickedImage.getBoundingClientRect();

      console.log("=== Image Click Animation ===");
      console.log("Initial Position:", {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });

      // Calculate the center of the image
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      console.log("Image Center:", { x: centerX, y: centerY });

      // Calculate viewport center
      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;

      console.log("Viewport Center:", {
        x: viewportCenterX,
        y: viewportCenterY,
      });

      // Calculate final position:
      // When the image is 100vw x 100vh, its center should be at viewport center
      // So top-left corner should be at (0, 0) in screen coordinates
      // We need to move from current position to fill the screen
      const finalTop = 0;
      const finalLeft = 0;
      const finalWidth = window.innerWidth;
      const finalHeight = window.innerHeight;

      console.log("Target Position:", {
        top: finalTop,
        left: finalLeft,
        width: finalWidth,
        height: finalHeight,
      });

      // Create timeline for smooth coordinated animations
      const tl = gsap.timeline();

      // Set initial state for clicked image (where it currently is)
      // IMPORTANT: We need to move the image out of the track container
      // because the track has transform which creates a new containing block
      // This would make position:fixed relative to the track, not viewport

      // Clone the image and append to body
      const clone = clickedImage.cloneNode(true);
      document.body.appendChild(clone);
      clonedImageRef.current = clone;

      // Store original position for reverse animation
      originalPositionRef.current = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };

      console.log("💾 STORED ORIGINAL POSITION:", originalPositionRef.current);

      // Get the object-position from the original image
      const originalObjectPosition =
        window.getComputedStyle(clickedImage).objectPosition;
      console.log("📐 Original object-position:", originalObjectPosition);

      gsap.set(clone, {
        position: "fixed",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        margin: 0,
        padding: 0,
        zIndex: 1000, // Below navbar (10000) but above other content
        transform: "none",
        objectFit: "cover",
        objectPosition: originalObjectPosition, // Preserve the object-position
        cursor: "pointer",
      });

      // Hide the original image
      gsap.set(clickedImage, {
        opacity: 0,
      });

      console.log("After gsap.set - Computed Style:");
      const computedStyle = window.getComputedStyle(clone);
      console.log({
        position: computedStyle.position,
        top: computedStyle.top,
        left: computedStyle.left,
        transform: computedStyle.transform,
      });

      // Animate: Move to center AND expand to fullscreen simultaneously
      tl.to(clone, {
        top: finalTop,
        left: finalLeft,
        width: finalWidth,
        height: finalHeight,
        objectPosition: "50% center", // Reset to center when expanded
        duration: 0.8,
        ease: "easeIn",
        onUpdate: function () {
          const progress = this.progress();
          if (progress % 0.1 < 0.02) {
            console.log(`Animation Progress: ${(progress * 100).toFixed(1)}%`);
          }
        },
        onComplete: () => {
          console.log("Animation Complete - Final Position:", {
            top: finalTop,
            left: finalLeft,
            width: finalWidth,
            height: finalHeight,
          });

          // Store and add click handler
          const clickHandler = () => handleImageClick(expandedImageIndex);
          cloneClickHandlerRef.current = clickHandler;
          clone.addEventListener("click", clickHandler);
        },
      });

      // Fade out other images
      images.forEach((img, index) => {
        if (index !== expandedImageIndex) {
          tl.to(
            img,
            {
              opacity: 0,
              duration: 1.5,
              ease: "power2.inOut",
            },
            0 // Start at the same time as the main image
          );
        }
      });

      // Disable track interaction
      if (track) {
        track.style.pointerEvents = "none";
      }
    },
    { scope: trackRef, dependencies: [expandedImageIndex, startExpanded] }
  );

  // Handle image click
  const handleImageClick = (index) => {
    console.log("=".repeat(60));
    console.log(
      "🖱️ Image clicked:",
      index,
      "Current expanded:",
      expandedImageIndex
    );

    if (expandedImageIndex === index) {
      console.log("🔽 COLLAPSING IMAGE");

      // Collapse back to original - IMMEDIATELY notify parent
      if (onExpandChange) {
        onExpandChange(false);
      }

      const images = imagesRef.current;
      const track = trackRef.current;
      const clone = clonedImageRef.current;
      const originalPos = originalPositionRef.current;

      console.log(
        "Clone exists:",
        !!clone,
        "Original pos exists:",
        !!originalPos
      );

      if (clone) {
        const currentRect = clone.getBoundingClientRect();
        const currentStyle = window.getComputedStyle(clone);
        console.log("🔍 CLONE STATE BEFORE COLLAPSE:", {
          boundingRect: {
            top: currentRect.top,
            left: currentRect.left,
            width: currentRect.width,
            height: currentRect.height,
          },
          computedStyle: {
            top: currentStyle.top,
            left: currentStyle.left,
            width: currentStyle.width,
            height: currentStyle.height,
            objectPosition: currentStyle.objectPosition,
          },
        });
      }

      if (originalPos) {
        console.log("🎯 TARGET POSITION FOR COLLAPSE:", originalPos);
      }

      // IMPORTANT: Set state to null immediately to prevent re-clicks
      setExpandedImageIndex(null);

      if (clone) {
        // Remove event listener before removing clone
        if (cloneClickHandlerRef.current) {
          clone.removeEventListener("click", cloneClickHandlerRef.current);
          cloneClickHandlerRef.current = null;
        }

        if (originalPos) {
          console.log("Animating clone back to position:", originalPos);
          // Reverse animation: shrink back to original position
          gsap.to(clone, {
            top: originalPos.top,
            left: originalPos.left,
            width: originalPos.width,
            height: originalPos.height,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
              console.log("✅ Clone animation complete, removing clone");
              clone.remove();
              clonedImageRef.current = null;
              originalPositionRef.current = null;
            },
          });
        } else {
          console.log("⚠️ No original position, removing clone immediately");
          // No original position stored, just remove the clone
          clone.remove();
          clonedImageRef.current = null;
        }
      } else {
        console.log("⚠️ No clone found to remove");
      }

      // Restore all images - start fading in as clone shrinks
      console.log("🔄 Restoring all images to opacity: 1");

      // DEBUG: Log each image's state before restoring
      images.forEach((img, idx) => {
        if (img) {
          const rect = img.getBoundingClientRect();
          const style = window.getComputedStyle(img);
          console.log(`📷 Image ${idx} before restore:`, {
            opacity: style.opacity,
            objectPosition: style.objectPosition,
            position: { top: rect.top, left: rect.left },
            size: { width: rect.width, height: rect.height },
          });
        }
      });

      gsap.to(images, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.inOut",
      });

      // After fade completes, clean up
      gsap.delayedCall(0.8, () => {
        console.log("🧹 Cleaning up after collapse");

        // Clear any GSAP inline styles that might interfere
        images.forEach((img) => {
          if (img) {
            gsap.set(img, { clearProps: "all" });
          }
        });

        if (track) {
          track.style.pointerEvents = "auto";
          // Ensure dataset values are valid
          if (
            !track.dataset.percentage ||
            isNaN(parseFloat(track.dataset.percentage))
          ) {
            track.dataset.percentage = "0";
          }
          if (
            !track.dataset.prevPercentage ||
            isNaN(parseFloat(track.dataset.prevPercentage))
          ) {
            track.dataset.prevPercentage = "0";
          }
          track.dataset.mouseDownAt = "0";
        }

        console.log("✅ Collapse complete, track interactive again");
      });
    } else {
      console.log("=".repeat(60));
      console.log("🔼 EXPANDING IMAGE:", index);

      // DEBUG: Log the clicked image state
      const clickedImg = imagesRef.current[index];
      if (clickedImg) {
        const rect = clickedImg.getBoundingClientRect();
        const style = window.getComputedStyle(clickedImg);
        console.log("🔍 CLICKED IMAGE STATE:", {
          index: index,
          boundingRect: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
          computedStyle: {
            opacity: style.opacity,
            objectPosition: style.objectPosition,
          },
        });
      }

      // Expand image - IMMEDIATELY notify parent
      if (onExpandChange) {
        onExpandChange(true);
      }
      setExpandedImageIndex(index);
    }
  };

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
          onClick={() => handleImageClick(index)}
          style={{ cursor: "pointer" }}
        />
      ))}
    </div>
  );
}
