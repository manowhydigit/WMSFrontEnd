import React from "react";
import styled, { keyframes } from "styled-components";

const total = 30;
const orbSize = "150px"; // Distance from center
const particleSize = "4px";
const time = "12s";
const baseHue = 220;

// Rotates entire sphere
const rotate = keyframes`
  100% {
    transform: rotateY(360deg) rotateX(360deg);
  }
`;

// Each particle's own orbital path
const Orbit = (i) => keyframes`
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  30%, 80% {
    transform: 
      rotateZ(${Math.random() * 360}deg)
      rotateY(${Math.random() * 360}deg)
      translateX(${orbSize})
      rotateZ(${Math.random() * 360}deg);
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const OrbitContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 400px;
  height: 400px;
`;

const OrbitWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  perspective: 1000px;
  pointer-events: none;
`;

const RotatingSphere = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: ${rotate} ${time} linear infinite;
`;

const Particle = styled.div`
  position: absolute;
  width: ${particleSize};
  height: ${particleSize};
  border-radius: 50%;
  background-color: ${({ index }) =>
    `hsla(${(360 / total) * index + baseHue}, 100%, 60%, 0.8)`};
  animation: ${({ index }) => Orbit(index)} ${time} linear infinite;
  animation-delay: ${({ index }) => index * 0.05}s;
  will-change: transform, opacity;
`;

const ParticleOrbit = ({ children }) => {
  const particles = Array.from({ length: total }, (_, index) => (
    <Particle key={index} index={index} />
  ));

  return (
    <OrbitContainer>
      <OrbitWrapper>
        <RotatingSphere>{particles}</RotatingSphere>
      </OrbitWrapper>
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </OrbitContainer>
  );
};

export default ParticleOrbit;
