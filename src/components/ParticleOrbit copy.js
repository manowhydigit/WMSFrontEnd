import React from "react";
import styled, { keyframes } from "styled-components";

const total = 300;
const orbSize = "100px";
const particleSize = "2px";
const time = "14s";
const baseHue = 0;

const rotate = keyframes`
  100% {
    transform: rotateY(360deg) rotateX(360deg);
  }
`;

const Orbit = (i) => keyframes`
  20% {
    opacity: 1;
  }
  30% {
    transform: rotateZ(-${Math.random() * 360}deg) rotateY(${
  Math.random() * 360
}deg) translateX(${orbSize}) rotateZ(${Math.random() * 360}deg);
  }
  80% {
    transform: rotateZ(-${Math.random() * 360}deg) rotateY(${
  Math.random() * 360
}deg) translateX(${orbSize}) rotateZ(${Math.random() * 360}deg);
    opacity: 1;
  }
  100% {
    transform: rotateZ(-${Math.random() * 360}deg) rotateY(${
  Math.random() * 360
}deg) translateX(calc(${orbSize} * 3)) rotateZ(${Math.random() * 360}deg);
  }
`;

const WrapperBase = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  transform-style: preserve-3d;
  perspective: 1000px;
  animation: ${rotate} ${time} infinite linear;
`;

const WrapperTopRight = styled(WrapperBase)`
  top: 0;
  right: 0;
`;

const WrapperBottomLeft = styled(WrapperBase)`
  bottom: 0;
  left: 0;
`;

const Particle = styled.div`
  position: absolute;
  width: ${particleSize};
  height: ${particleSize};
  border-radius: 50%;
  opacity: 0;
  animation: ${({ index }) => Orbit(index)} ${time} infinite;
  animation-delay: ${({ index }) => index * 0.01}s;
  background-color: ${({ index }) =>
    `hsla(${(40 / total) * index + baseHue}, 100%, 50%, 1)`};
`;

const ParticleOrbit = () => {
  const particles = Array.from({ length: total }, (_, index) => (
    <Particle key={index} index={index} />
  ));

  return (
    <>
      <WrapperTopRight>{particles}</WrapperTopRight>
      <WrapperBottomLeft>{particles}</WrapperBottomLeft>
    </>
  );
};

export default ParticleOrbit;
