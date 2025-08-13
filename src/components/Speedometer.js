import React, { useRef, useEffect, useState } from "react";

const Speedometer = () => {
  const canvasRef = useRef(null);
  const [currentSpeed, setCurrentSpeed] = useState(20);
  const [targetSpeed, setTargetSpeed] = useState(20);

  useEffect(() => {
    let animationFrameId;
    let timeoutId;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const degToRad = (angle) => (angle * Math.PI) / 180;

    const drawLine = (ctx, line) => {
      ctx.beginPath();
      ctx.globalAlpha = line.alpha;
      ctx.lineWidth = line.lineWidth;
      ctx.strokeStyle = line.fillStyle;
      ctx.moveTo(line.from.X, line.from.Y);
      ctx.lineTo(line.to.X, line.to.Y);
      ctx.stroke();
    };

    const createLine = (
      fromX,
      fromY,
      toX,
      toY,
      fillStyle,
      lineWidth,
      alpha
    ) => ({
      from: { X: fromX, Y: fromY },
      to: { X: toX, Y: toY },
      fillStyle,
      lineWidth,
      alpha,
    });

    const buildOptions = (speed) => {
      const centerX = 210,
        centerY = 210,
        radius = 150,
        outerRadius = 200;
      return {
        ctx,
        speed,
        center: { X: centerX, Y: centerY },
        levelRadius: radius - 10,
        gaugeOptions: {
          center: { X: centerX, Y: centerY },
          radius,
        },
        radius: outerRadius,
      };
    };

    const clearCanvas = () => {
      ctx.clearRect(0, 0, 800, 600);
    };

    const drawSpeedometer = () => {
      const options = buildOptions(currentSpeed);
      clearCanvas();

      // Background fill
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "rgb(0,0,0)";
      for (let i = 170; i < 180; i++) {
        ctx.beginPath();
        ctx.arc(options.center.X, options.center.Y, i, 0, Math.PI, true);
        ctx.fill();
      }

      // Ticks & Labels
      drawTicks(options);
      drawTextMarkers(options);

      // Arc Color
      drawSpeedometerColourArc(options);

      // Needle
      drawNeedle(options);
    };

    const convertSpeedToAngle = (speed) => {
      const iSpeed = speed / 10;
      return (iSpeed * 20 + 10) % 180;
    };

    const drawNeedle = (options) => {
      const angle = degToRad(convertSpeedToAngle(options.speed));
      const { center, gaugeOptions } = options;
      const innerX = gaugeOptions.radius - Math.cos(angle) * 20;
      const innerY = gaugeOptions.radius - Math.sin(angle) * 20;
      const fromX = center.X - gaugeOptions.radius + innerX;
      const fromY = center.Y - gaugeOptions.radius + innerY;
      const endX = gaugeOptions.radius - Math.cos(angle) * gaugeOptions.radius;
      const endY = gaugeOptions.radius - Math.sin(angle) * gaugeOptions.radius;
      const toX = center.X - gaugeOptions.radius + endX;
      const toY = center.Y - gaugeOptions.radius + endY;
      const line = createLine(
        fromX,
        fromY,
        toX,
        toY,
        "rgb(127, 127, 127)",
        5,
        0.6
      );
      drawLine(ctx, line);

      // Dial
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgb(127,127,127)";
      for (let i = 0; i < 30; i++) {
        ctx.beginPath();
        ctx.arc(center.X, center.Y, i, 0, Math.PI, true);
        ctx.fillStyle = "rgb(255,255,255)";
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.stroke();
      }
    };

    const drawSpeedometerColourArc = (options) => {
      drawSpeedometerPart(options, 1.0, "rgb(204,254,255)", 10);
      drawSpeedometerPart(options, 0.9, "rgb(2,254,255)", 200);
      drawSpeedometerPart(options, 0.9, "rgb(1,127,127)", 280);
    };

    const drawSpeedometerPart = (options, alpha, stroke, start) => {
      ctx.beginPath();
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 5;
      ctx.strokeStyle = stroke;
      ctx.arc(
        options.center.X,
        options.center.Y,
        options.levelRadius,
        Math.PI + (Math.PI / 360) * start,
        0 - (Math.PI / 360) * 10,
        false
      );
      ctx.stroke();
    };

    const drawTicks = (options) => {
      drawSmallTicks(options);
      drawLargeTicks(options);
    };

    const drawSmallTicks = (options) => {
      const tickRadius = options.levelRadius - 8;
      for (let deg = 10; deg < 180; deg += 20) {
        drawTickLine(options, deg, tickRadius, 3);
      }
    };

    const drawLargeTicks = (options) => {
      const tickRadius = options.levelRadius - 2;
      for (let deg = 20; deg < 180; deg += 20) {
        drawTickLine(options, deg, tickRadius, 3);
      }
    };

    const drawTickLine = (options, deg, tickRadius, lineWidth) => {
      const rad = degToRad(deg);
      const { center, gaugeOptions } = options;
      const onX = gaugeOptions.radius - Math.cos(rad) * tickRadius;
      const onY = gaugeOptions.radius - Math.sin(rad) * tickRadius;
      const innerX = gaugeOptions.radius - Math.cos(rad) * gaugeOptions.radius;
      const innerY = gaugeOptions.radius - Math.sin(rad) * gaugeOptions.radius;
      const fromX = center.X - gaugeOptions.radius + onX;
      const fromY = center.Y - gaugeOptions.radius + onY;
      const toX = center.X - gaugeOptions.radius + innerX;
      const toY = center.Y - gaugeOptions.radius + innerY;
      const line = createLine(
        fromX,
        fromY,
        toX,
        toY,
        "rgb(127,127,127)",
        lineWidth,
        0.6
      );
      drawLine(ctx, line);
    };

    const drawTextMarkers = (options) => {
      const { ctx, center, gaugeOptions } = options;
      ctx.font = "italic 10px sans-serif";
      ctx.textBaseline = "top";
      ctx.beginPath();

      let label = 0;
      for (let deg = 10; deg < 180; deg += 20) {
        const x =
          gaugeOptions.radius - Math.cos(degToRad(deg)) * gaugeOptions.radius;
        const y =
          gaugeOptions.radius - Math.sin(degToRad(deg)) * gaugeOptions.radius;
        const posX = center.X - gaugeOptions.radius - 12 + x;
        const posY = center.Y - gaugeOptions.radius - 12 + y;
        ctx.fillText(label.toString(), posX, posY);
        label += 10;
      }

      ctx.stroke();
    };

    const animate = () => {
      if (currentSpeed !== targetSpeed) {
        setCurrentSpeed((prev) => {
          if (targetSpeed > prev) {
            return targetSpeed - prev < 10 ? prev + 1 : prev + 5;
          } else {
            return prev - targetSpeed < 10 ? prev - 1 : prev - 5;
          }
        });
        timeoutId = setTimeout(animate, 5);
      }
    };

    drawSpeedometer();
    animationFrameId = requestAnimationFrame(drawSpeedometer);
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, [currentSpeed, targetSpeed]);

  const handleDraw = () => {
    const value = parseInt(document.getElementById("txtSpeed").value, 10);
    if (!isNaN(value)) {
      setTargetSpeed(Math.max(0, Math.min(80, value)));
    }
  };

  return (
    <div>
      <canvas ref={canvasRef} width="440" height="220">
        Canvas not supported.
      </canvas>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleDraw();
        }}
      >
        <input id="txtSpeed" type="text" defaultValue="20" maxLength="2" />
        <button type="button" onClick={handleDraw}>
          Draw
        </button>
      </form>
    </div>
  );
};

export default Speedometer;
