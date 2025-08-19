import React, { useEffect, useRef } from "react";
import "./DChart.css";

const defaultColors = [
  "#0066CC",
  "#63993D",
  "#5E40BE",
  "#CA6C0F",
  "#707070",
  "#ff6666",
  "#ff00bf",
  "#4000ff",
  "#00ff00",
  "#ffff00",
  "#00ffff",
  // "#CC99FF",
  // "#FFCC99",
  // "#FF5733",
  // "#33FF57",
  // "#3357FF",
  // "#F033FF",
  // "#FF33A8",
  // "#33FFF0",
  // "#8F33FF",
  // "#FF8F33",
  // "#4FC1E9",
  // "#A0D468",
  // "#ED5565",
  // "#AC92EC",
  // "#FFCE54",
  // "#5D9CEC",
  // "#2b92d8",
  // "#2ab96a",
  // "#e9c061",
  // "#d95d6b",
  // "#9173d8",
  // "#9966FF",
  // "#FF66B2",
  // "#FF6666",
  // "#66FF66",
  // "#66FFFF",
  // "#FF9966",
  // "#FF33FF",
  // "#00FFFF",
  // "#99CCFF",

  // "#336699",
  // "#99CCFF",
  // "#999933",
  // "#666699",
  // "#CC9933",
  // "#006666",
  // "#3399FF",
  // "#993300",
  // "#CCCC99",
  // "#666666",
  // "#FFFFFF",
  // "#FFFFFF",
  // "#FFFFFF",
];

const DChart = ({ data, label = "Total" }) => {
  const containerRef = useRef(null);
  const colorMapRef = useRef(new Map());

  useEffect(() => {
    if (!containerRef.current || !data) return;

    const container = containerRef.current;
    container.innerHTML = "";

    // Assign unique colors to each branch code
    data.wedges.forEach((wedge, index) => {
      if (!colorMapRef.current.has(wedge.id)) {
        // Get next available color that hasn't been used yet
        const usedColors = Array.from(colorMapRef.current.values());
        let availableColor = defaultColors.find(
          (color) => !usedColors.includes(color)
        );

        // If all colors are used, start recycling from beginning
        if (!availableColor) {
          console.warn("Not enough unique colors - recycling color palette");
          availableColor = defaultColors[index % defaultColors.length];
        }

        colorMapRef.current.set(wedge.id, availableColor);
      }
    });

    const outer = document.createElement("div");
    const inner = document.createElement("div");
    const labelEl = document.createElement("span");
    const valueEl = document.createElement("span");

    outer.className = "outer-circle";
    inner.className = "inner-circle";
    labelEl.className = "inner-circle-label";
    valueEl.className = "inner-circle-value";

    container.appendChild(outer);
    container.appendChild(inner);
    inner.appendChild(labelEl);
    inner.appendChild(valueEl);

    // labelEl.textContent = label;
    // valueEl.textContent = data.total.toLocaleString("en-IN");

    setTimeout(() => {
      let offset = 0;
      const w = container.offsetWidth;

      data.wedges.forEach((wedgeData) => {
        const wedgeColor = colorMapRef.current.get(wedgeData.id);

        const wedgeContainer = document.createElement("div");
        const wedge = document.createElement("div");
        const extension = document.createElement("div");
        const wedgeLabel = document.createElement("div");

        wedgeContainer.className = "wedge-container";
        wedge.className = "wedge";
        extension.className = "wedge-extension";
        wedgeLabel.className = "wedge-label";
        // wedgeLabel.textContent = wedgeData.id;

        wedgeContainer.appendChild(wedge);
        wedgeContainer.appendChild(extension);
        wedgeContainer.appendChild(wedgeLabel);

        const wedgeDegrees = (360 * wedgeData.value) / data.total;
        const labelDegrees = offset + wedgeDegrees / 2;

        wedgeContainer.style.transform = `rotate(${offset}deg)`;
        wedgeContainer.style.clip =
          wedgeDegrees > 180 ? "auto" : `rect(0, ${w}px, ${w}px, ${w / 2}px)`;

        wedge.style.transform = `rotate(${wedgeDegrees}deg)`;
        wedge.style.backgroundColor = adjustColor(wedgeColor, 5);
        wedge.style.clip = `rect(0, ${w / 2}px, ${w}px, 0)`;

        if (wedgeDegrees > 180) {
          extension.style.opacity = 1;
          extension.style.transform = "rotate(180deg)";
          extension.style.backgroundColor = adjustColor(wedgeColor, 5);
          extension.style.clip = `rect(0, ${w / 2}px, ${w}px, 0)`;
        } else {
          extension.style.opacity = 0;
        }

        wedgeLabel.style.transform = `rotate(${labelDegrees}deg)`;
        wedgeLabel.style.color = adjustColor(wedgeColor, -30);

        outer.appendChild(wedgeContainer);
        offset += wedgeDegrees;
      });
    }, 0);
  }, [data, label]);

  return (
    <div style={{ height: "200px" }}>
      <div
        className="donut-chart"
        ref={containerRef}
        style={{
          marginTop: "-180px",
          marginLeft: "300px",
          width: "60",
          height: "80",
        }}
      ></div>

      <div
        className="donut-legend"
        style={{
          marginLeft: "500px",
          marginTop: "-180px",
        }}
      >
        {data?.wedges
          ?.filter((wedge) => Number(wedge.value) != 0)
          .sort((a, b) => b.value - a.value) // Optional: sort highest to lowest
          .map((wedge) => {
            const color = colorMapRef.current.get(wedge.id);
            return (
              <div
                key={wedge.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    backgroundColor: color,
                    marginRight: "10px",
                    borderRadius: "2px",
                  }}
                ></div>
                <span style={{ fontSize: "14px" }}>
                  {wedge.id}: ₹{Number(wedge.value).toLocaleString("en-IN")}
                </span>
              </div>
            );
          })}

        <div
          style={{
            fontWeight: "bold",
            fontSize: "15px",
            marginBottom: "8px",
            marginLeft: "-120px",
          }}
        >
          Total: ₹
          {(() => {
            const total = data?.wedges?.reduce((sum, wedge) => {
              const val = Number(wedge.value);
              return sum + (isNaN(val) ? 0 : val);
            }, 0);

            return total > 0 ? total.toLocaleString("en-IN") : null;
          })()}
          L
        </div>
      </div>
    </div>
  );
};

function adjustColor(hex, percent) {
  let num = parseInt(hex.slice(1), 16);
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = ((num >> 8) & 0x00ff) + amt;
  let B = (num & 0x0000ff) + amt;

  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
}

export default DChart;
