import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "../styles/loadingIntro.css";

gsap.registerPlugin(useGSAP);

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
    const loadImages = async () => {
      const totalImages = imageUrls.length;
      let loadedCount = 0;

      const loadPromises = imageUrls.map((url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            loadedCount++;
            const progress = Math.round((loadedCount / totalImages) * 100);
            setLoadingProgress(progress);
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

  useGSAP(
    () => {
      if (!imagesLoaded || !containerRef.current) return;

      const masterTL = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        },
      });

      const grids = containerRef.current.querySelectorAll(".intro-grid");
      const stagger = 0.3;

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

          if (isHeroImage) {
            console.log("=== HERO IMAGE DEBUG ===");
            const gridRect = grid.getBoundingClientRect();
            console.log("Grid rect:", gridRect);

            const imageHeight = 25;
            const imageTop =
              gridRect.top +
              (imgIndex * imageHeight * window.innerHeight) / 100;
            const imageLeft = gridRect.left;
            const imageWidth = gridRect.width;
            const imageHeightPx = (window.innerHeight * imageHeight) / 100;

            console.log("Calculated positions:", {
              imageTop,
              imageLeft,
              imageWidth,
              imageHeightPx,
              startingTop: imageTop + window.innerHeight,
            });

            const clone = img.cloneNode(true);
            document.body.appendChild(clone);

            // Add ID so ImageTrack can find and reuse this clone
            clone.id = "intro-hero-clone";

            console.log("Clone created and appended to body");

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

            console.log("Clone initial styles set");
            const cloneStyles = window.getComputedStyle(clone);
            console.log("Clone computed styles:", {
              position: cloneStyles.position,
              top: cloneStyles.top,
              left: cloneStyles.left,
              width: cloneStyles.width,
              height: cloneStyles.height,
              zIndex: cloneStyles.zIndex,
              opacity: cloneStyles.opacity,
            });

            masterTL.to(
              clone,
              {
                top: imageTop,
                duration: 2.0,
                ease: "power2.in",
                onStart: () => console.log("Slide up animation started"),
                onComplete: () =>
                  console.log("Slide up complete, clone at:", imageTop),
              },
              imgIndex * stagger
            );

            masterTL.to(
              clone,
              {
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                duration: 1.0,
                ease: "power2.inOut",
                onStart: () => console.log("Expansion animation started"),
                onComplete: () => {
                  console.log(
                    "Expansion complete - keeping clone for ImageTrack"
                  );
                  // Remove the intro container immediately after expansion
                  if (containerRef.current) {
                    // Force remove all child elements
                    while (containerRef.current.firstChild) {
                      containerRef.current.removeChild(
                        containerRef.current.firstChild
                      );
                    }
                    containerRef.current.remove();
                    console.log("Intro container removed");
                  }
                },
              },
              imgIndex * stagger + 1.5
            );
          } else {
            masterTL.to(
              img,
              {
                y: isBottomToTop ? "-125vh" : "125vh",
                duration: 2.5,
                ease: "power2.in",
              },
              imgIndex * stagger
            );
          }
        });
      });

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
            // Container already removed in expansion onComplete
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
          <h2 className="loading-text">Loading {loadingProgress}%</h2>
        </div>
      )}

      {imagesLoaded && (
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
      )}
    </div>
  );
}
