import React, { useEffect } from "react";

const OrbParticles = () => {
  const total = 300;
  const orbSize = 100;
  const particleSize = 2;
  const time = 14;
  const baseHue = 0;

  useEffect(() => {
    const style = document.createElement("style");
    let css = `
      body {
        background: black;
        margin: 0;
        height: 60%;
        overflow: hidden;
      }
      .wrap {
        position: relative;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        transform-style: preserve-3d;
        perspective: 1000px;
        animation: rotate ${time}s infinite linear;
      }
      @keyframes rotate {
        100% {
          transform: rotateY(360deg) rotateX(360deg);
        }
      }
      .c {
        position: absolute;
        width: ${particleSize}px;
        height: ${particleSize}px;
        border-radius: 50%;
        opacity: 0;
      }
    `;

    for (let i = 1; i <= total; i++) {
      const z = Math.floor(Math.random() * 360);
      const y = Math.floor(Math.random() * 360);
      const hue = ((40 / total) * i + baseHue).toFixed(2);

      css += `
        .c:nth-child(${i}) {
          animation: orbit${i} ${time}s infinite;
          animation-delay: ${i * 0.01}s;
          background-color: hsla(${hue}, 100%, 50%, 1);
        }
        @keyframes orbit${i} {
          20% {
            opacity: 1;
          }
          30% {
            transform: rotateZ(-${z}deg) rotateY(${y}deg) translateX(${orbSize}px) rotateZ(${z}deg);
          }
          80% {
            transform: rotateZ(-${z}deg) rotateY(${y}deg) translateX(${orbSize}px) rotateZ(${z}deg);
            opacity: 1;
          }
          100% {
            transform: rotateZ(-${z}deg) rotateY(${y}deg) translateX(${
        orbSize * 3
      }px) rotateZ(${z}deg);
          }
        }
      `;
    }

    style.innerHTML = css;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="wrap">
      {Array.from({ length: total }).map((_, idx) => (
        <div className="c" key={idx} />
      ))}
    </div>
  );
};

export default OrbParticles;
