import React, { useEffect, useRef } from "react";
import "./AnalogClock.css"; // Ensure styles are in this file

const AnalogClock = () => {
  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const secondRef = useRef(null);

  useEffect(() => {
    const getTransformProperty = () => {
      const style = document.createElement("div").style;
      if ("webkitTransform" in style) return "webkitTransform";
      if ("msTransform" in style) return "msTransform";
      return "transform";
    };

    const transform = getTransformProperty();

    const updateClock = () => {
      const now = new Date();
      const second = now.getSeconds() * 6;
      const minute = now.getMinutes() * 6 + second / 60;
      const hour = ((now.getHours() % 12) / 12) * 360 + minute / 12;

      if (hourRef.current)
        hourRef.current.style[transform] = `rotate(${hour}deg)`;
      if (minuteRef.current)
        minuteRef.current.style[transform] = `rotate(${minute}deg)`;
      if (secondRef.current)
        secondRef.current.style[transform] = `rotate(${second}deg)`;
    };

    const interval = setInterval(updateClock, 1000);
    updateClock(); // initial call

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="clock">
      <div className="hour" ref={hourRef}></div>
      <div className="minute" ref={minuteRef}></div>
      <div className="second" ref={secondRef}></div>
      <div className="center"></div>
    </div>
  );
};

export default AnalogClock;
