import { useEffect } from "react";

export default function ImageTrack() {
  useEffect(() => {
    const track = document.getElementById("image-track");

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
        nextPercentageUnconstrained =
          parseFloat(track.dataset.prevPercentage) + percentage,
        nextPercentage = Math.max(
          Math.min(nextPercentageUnconstrained, 0),
          -90
        );

      track.dataset.percentage = nextPercentage;

      track.animate(
        {
          transform: `translate(${nextPercentage - 5}%, -50%)`,
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
  }, []);

  return (
    <div id="image-track" data-mouse-down-at="0" data-prev-percentage="0">
      <img className="image" src="/images/home.jpg" draggable="false" />
      <img className="image" src="/images/home-1.jpg" draggable="false" />
      <img className="image" src="/images/home.jpg" draggable="false" />
      <img className="image" src="/images/home-1.jpg" draggable="false" />
      <img className="image" src="/images/home.jpg" draggable="false" />
      <img className="image" src="/images/home-1.jpg" draggable="false" />
      <img className="image" src="/images/home.jpg" draggable="false" />
      <img className="image" src="/images/home-1.jpg" draggable="false" />
      <img className="image" src="/images/home.jpg" draggable="false" />
      <img className="image" src="/images/home-1.jpg" draggable="false" />
    </div>
  );
}
