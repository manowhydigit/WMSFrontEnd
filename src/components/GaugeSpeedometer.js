import React, { useEffect, useRef } from "react";
import { Gauge } from "gaugeJS";
import "./GaugeSpeedometer.css";

const GaugeSpeedometer = ({ value, display }) => {
  const canvasRef = useRef(null);
  const gaugeRef = useRef(null); // 💡 Store the Gauge instance here

  useEffect(() => {
    const opts = {
      lines: 12,
      angle: 0.0,
      lineWidth: 0.44,
      pointer: {
        length: 0.5,
        strokeWidth: 0.035,
        color: "red",
      },
      limitMax: false,
      colorStart: "blue",
      colorStop: "#8FC0DA",
      strokeColor: "#E0E0E0",
      generateGradient: true,
    };

    const target = canvasRef.current;
    const gauge = new Gauge(target).setOptions(opts);
    gauge.maxValue = 2000;
    gauge.animationSpeed = 32;
    gauge.set(0); // initial value

    gaugeRef.current = gauge; // 💾 Save the gauge instance
  }, []);

  useEffect(() => {
    if (gaugeRef.current && value !== undefined) {
      gaugeRef.current.set(Number(value));
    }
  }, [value]);

  return (
    <div
      style={{
        marginTop: "-30px",
        textAlign: "center",
        marginLeft: "-450px",
      }}
    >
      <canvas id="foo" ref={canvasRef} width={100} height={100}></canvas>
      <div className="gauge-value-display">
        ₹{value} {display}{" "}
      </div>
    </div>
  );
};

export default GaugeSpeedometer;
