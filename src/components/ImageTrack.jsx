import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function ImageTrack({ onImageChange, onExpandChange }) {
  const [expandedImageIndex, setExpandedImageIndex] = useState(null);
  const trackRef = useRef(null);
  const imagesRef = useRef([]);
  const clonedImageRef = useRef(null);
  const originalPositionRef = useRef(null); // Store original position for reverse animation

  useEffect(() => {
    const track = document.getElementById("image-track");
    const totalImages = 8;

    // Function to calculate which image is in the center
    const calculateCenterImage = (percentage) => {
      // percentage ranges from 0 to -90
      // We want to detect when the LEFT edge of an image hits the center
      // Each image represents approximately 90/7 ≈ 12.86% of the total range
      // Adjust the threshold so it changes earlier
      const normalizedPercentage = Math.abs(percentage);
      // Use a factor to make it trigger earlier (when left edge hits center)
      // Divide by (totalImages - 1) to distribute across the range better
      const imageIndex = Math.min(
        Math.max(
          Math.ceil((normalizedPercentage / 90) * (totalImages - 1)) + 1,
          1
        ),
        totalImages
      );

      console.log("Current percentage:", percentage);
      console.log("Center Image Index:", imageIndex);
      return imageIndex;
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

      // Update the current image indicator
      const centerImage = calculateCenterImage(nextPercentage);
      onImageChange(centerImage);

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
  }, [onImageChange]);

  // GSAP animation for image expansion
  useGSAP(
    () => {
      if (expandedImageIndex === null) return;

      const images = imagesRef.current;
      const clickedImage = images[expandedImageIndex];
      const track = trackRef.current;

      if (!clickedImage) return;

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
        duration: 0.8,
        ease: "easeIn",
        onUpdate: function () {
          const progress = this.progress();
          if (progress % 0.1 < 0.02) {
            // Log every ~10%
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
        },
        onComplete: () => {
          // Add click handler to the clone to collapse
          clone.addEventListener("click", () =>
            handleImageClick(expandedImageIndex)
          );
          // Note: Parent already notified immediately on click
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
    { scope: trackRef, dependencies: [expandedImageIndex] }
  );

  // Handle image click
  const handleImageClick = (index) => {
    if (expandedImageIndex === index) {
      // Collapse back to original - IMMEDIATELY notify parent
      if (onExpandChange) {
        onExpandChange(false);
      }

      const images = imagesRef.current;
      const track = trackRef.current;
      const clone = clonedImageRef.current;
      const originalPos = originalPositionRef.current;

      if (clone && originalPos) {
        // Reverse animation: shrink back to original position
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
            originalPositionRef.current = null;
          },
        });
      }

      // Restore all images - start fading in as clone shrinks
      gsap.to(images, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
          setExpandedImageIndex(null);
          
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
        },
      });
    } else {
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
