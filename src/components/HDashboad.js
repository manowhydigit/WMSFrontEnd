import React, { useEffect, useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale, // Import RadialLinearScale
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import "./HDashboard.css";
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { PieChart, PieSeries } from "@amcharts/amcharts5/percent";
import { Pie, Line, Radar, radialLinear } from "react-chartjs-2";
// Register Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  RadialLinearScale, // Register RadialLinearScale here
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  BarElement
);

const HDashboard = () => {
  const chartHeight = 350;
  const chartWidth = 650;
  const chartOptions = { maintainAspectRatio: false, responsive: false };

  const chartDivRef = useRef(null); // Ref to hold the chart container
  useEffect(() => {
    // Initialize chart after component is mounted
    const root = am5.Root.new(chartDivRef.current);

    // Set themes
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    const chart = root.container.children.push(
      PieChart.new(root, {
        layout: root.verticalLayout,
      })
    );

    // First PieSeries
    const series0 = chart.series.push(
      PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        alignLabels: false,
        radius: am5.percent(100),
      })
    );

    series0.states.create("hidden", {
      startAngle: 180,
      endAngle: 180,
    });

    series0.slices.template.setAll({
      fillOpacity: 0.5,
      strokeOpacity: 0,
    });

    series0.slices.template.states.create("hover", { scale: 1 });
    series0.slices.template.states.create("active", { shiftRadius: 0 });

    series0.labels.template.setAll({
      textType: "circular",
      radius: 30,
    });

    // Set data for series0
    series0.data.setAll([
      {
        category: "First + Second",
        value: 60,
      },
      {
        category: "Unused",
        value: 30,
        settings: { forceHidden: true },
      },
    ]);

    // Second PieSeries
    const series1 = chart.series.push(
      PieSeries.new(root, {
        radius: am5.percent(95),
        valueField: "value",
        categoryField: "category",
        alignLabels: false,
      })
    );

    series1.states.create("hidden", {
      startAngle: 180,
      endAngle: 180,
    });

    series1.slices.template.setAll({
      strokeOpacity: 0,
    });

    series1.labels.template.setAll({
      textType: "circular",
    });

    series1.labels.template.adapters.add("radius", function (radius, target) {
      const dataItem = target.dataItem;
      const slice = dataItem.get("slice");
      return -(slice.get("radius") - slice.get("innerRadius")) / 2 - 10;
    });

    series1.slices.template.states.create("hover", { scale: 1 });
    series1.slices.template.states.create("active", { shiftRadius: 0 });

    // Set data for series1
    series1.data.setAll([
      {
        category: "First",
        value: 30,
      },
      {
        category: "Second",
        value: 30,
      },
      {
        category: "Remaining",
        value: 30,
        sliceSettings: { fill: am5.color(0xdedede) },
      },
    ]);

    // Clean up on unmount
    return () => {
      root.dispose();
    };
  }, []);

  // Chart data
  const data = {
    labels: ["2016", "2017", "2018", "2019", "2020"], // Year labels
    datasets: [
      {
        label: "Progress",
        data: [20, 40, 60, 80, 100], // Progress data for each year
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Bar color
        borderColor: "rgba(75, 192, 192, 1)", // Border color of bars
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 120,
        ticks: {
          stepSize: 20,
        },
      },
    },
  };

  const pieData = {
    labels: ["Red", "Blue", "Yellow"],
    datasets: [
      {
        data: [300, 50, 100],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const barData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "My First dataset",
        backgroundColor: "skyblue",
        borderColor: "skyblue",
        borderWidth: 1,
        hoverBackgroundColor: "skyblue",
        hoverBorderColor: "skyblue",
        data: [65, 59, 80, 81, 56, 55, 40],
      },
    ],
  };

  const lineData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "My First dataset",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(75,192,192,0.4)",
        borderColor: "rgba(75,192,192,1)",
        borderCapStyle: "butt",
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter",
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: [65, 59, 80, 81, 56, 55, 40],
      },
    ],
  };

  const radarData = {
    labels: [
      "Eating",
      "Drinking",
      "Sleeping",
      "Designing",
      "Coding",
      "Cycling",
      "Running",
    ],
    datasets: [
      {
        label: "My First dataset",
        backgroundColor: "rgba(179,181,198,0.2)",
        borderColor: "rgba(179,181,198,1)",
        pointBackgroundColor: "rgba(179,181,198,1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(179,181,198,1)",
        data: [65, 59, 90, 81, 56, 55, 40],
      },
      {
        label: "My Second dataset",
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        pointBackgroundColor: "rgba(255,99,132,1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(255,99,132,1)",
        data: [28, 48, 40, 19, 96, 27, 100],
      },
    ],
  };

  return (
    <>
      <br />
      <div className="row w-row">
        <div className="basic-column w-col w-col-3">
          <div className="tag-wrapper">
            <div
              className="number-card number-card-content1"
              style={{ boxShadow: "0 0 10px rgb(0,0,0.3)" }}
            >
              <h1 className="number-card-number">Revenue</h1>
              <div className="number-card-dollars">5,43,900</div>
              <div className="number-card-divider"></div>
              <div className="number-card-progress-wrapper">
                <div className="tagline number-card-currency">ETH</div>
                <div className="number-card-progress">-9.9%</div>
              </div>
            </div>
            <div className="divider"></div>
          </div>
        </div>
        <div className="basic-column w-col w-col-3">
          <div className="tag-wrapper">
            <div
              className="number-card number-card-content2"
              style={{ boxShadow: "0 0 10px rgb(0,0,0.3)" }}
            >
              <h1 className="number-card-number">Cost</h1>
              <div className="number-card-dollars">5,03,900</div>
              <div className="number-card-divider"></div>
              <div className="number-card-progress-wrapper">
                <div className="tagline number-card-currency">TNB</div>
                <div className="number-card-progress">+15.2%</div>
              </div>
            </div>
            <div className="divider"></div>
          </div>
        </div>
        <div className="basic-column w-col w-col-3">
          <div className="tag-wrapper">
            <div
              className="number-card number-card-content3"
              style={{ boxShadow: "0 0 10px rgb(0,0,0.3)" }}
            >
              <h1 className="number-card-number">AR</h1>
              <div className="number-card-dollars">$154,569</div>
              <div className="number-card-divider"></div>
              <div className="number-card-progress-wrapper">
                <div className="tagline number-card-currency">BTC</div>
                <div className="number-card-progress">+932.1%</div>
              </div>
            </div>
            <div className="divider"></div>
          </div>
        </div>
        <div className="basic-column w-col w-col-3">
          <div className="tag-wrapper">
            <div
              className="number-card number-card-content4"
              style={{ boxShadow: "0 0 10px rgb(0,0,0.3)" }}
            >
              <h1 className="number-card-number">AP</h1>
              <div className="number-card-dollars">$238.89</div>
              <div className="number-card-divider"></div>
              <div className="number-card-progress-wrapper">
                <div className="tagline number-card-currency">ENG</div>
                <div className="number-card-progress">+3.2%</div>
              </div>
            </div>
            <div className="divider"></div>
          </div>
        </div>
      </div>

      <div class="card11">
        <div class="imge">
          <div class="Usericon"></div>
          <p class="UserName"></p>
          <p class="Id"></p>
        </div>

        <div class="Description"></div>

        <div class="social-media">
          <a href="#">
            <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
            </svg>
          </a>
          <a href="#">
            <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
            </svg>
          </a>
          <a href="#">
            <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z"></path>
            </svg>
          </a>
          <a href="#">
            <svg viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z"></path>
            </svg>
          </a>
        </div>
      </div>

      <div
        class="card1"
        style={{
          marginTop: "-250px",
          marginLeft: "230px",
          marginBottom: "150px",
        }}
      >
        <div class="container11">
          <div class="cloud front">
            <span class="left-front"></span>
            <span class="right-front"></span>
          </div>
          <span class="sun sunshine"></span>
          <span class="sun"></span>
          <div class="cloud back">
            <span class="left-back"></span>
            <span class="right-back"></span>
          </div>
        </div>

        <div class="card-header">
          <span>
            Messadine, Susah
            <br />
            Tunisia
          </span>
          <span>March 13</span>
        </div>

        <span class="temp">23°</span>

        <div class="temp-scale">
          <span>Celcius</span>
        </div>
      </div>

      <div
        class="card111"
        style={{
          marginTop: "-370px",
          marginLeft: "620px",
          marginBottom: "150px",
        }}
      >
        <div class="card-img"></div>
        <div class="card-info">
          <p class="text-title">Product title </p>
          <p class="text-body">Product description and details</p>
        </div>
        <div class="card-footer">
          <span class="text-title">$499.49</span>
          <div class="card-button">
            <svg class="svg-icon" viewBox="0 0 20 20">
              <path d="M17.72,5.011H8.026c-0.271,0-0.49,0.219-0.49,0.489c0,0.271,0.219,0.489,0.49,0.489h8.962l-1.979,4.773H6.763L4.935,5.343C4.926,5.316,4.897,5.309,4.884,5.286c-0.011-0.024,0-0.051-0.017-0.074C4.833,5.166,4.025,4.081,2.33,3.908C2.068,3.883,1.822,4.075,1.795,4.344C1.767,4.612,1.962,4.853,2.231,4.88c1.143,0.118,1.703,0.738,1.808,0.866l1.91,5.661c0.066,0.199,0.252,0.333,0.463,0.333h8.924c0.116,0,0.22-0.053,0.308-0.128c0.027-0.023,0.042-0.048,0.063-0.076c0.026-0.034,0.063-0.058,0.08-0.099l2.384-5.75c0.062-0.151,0.046-0.323-0.045-0.458C18.036,5.092,17.883,5.011,17.72,5.011z"></path>
              <path d="M8.251,12.386c-1.023,0-1.856,0.834-1.856,1.856s0.833,1.853,1.856,1.853c1.021,0,1.853-0.83,1.853-1.853S9.273,12.386,8.251,12.386z M8.251,15.116c-0.484,0-0.877-0.393-0.877-0.874c0-0.484,0.394-0.878,0.877-0.878c0.482,0,0.875,0.394,0.875,0.878C9.126,14.724,8.733,15.116,8.251,15.116z"></path>
              <path d="M13.972,12.386c-1.022,0-1.855,0.834-1.855,1.856s0.833,1.853,1.855,1.853s1.854-0.83,1.854-1.853S14.994,12.386,13.972,12.386z M13.972,15.116c-0.484,0-0.878-0.393-0.878-0.874c0-0.484,0.394-0.878,0.878-0.878c0.482,0,0.875,0.394,0.875,0.878C14.847,14.724,14.454,15.116,13.972,15.116z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div
        class="cardContainer"
        style={{
          marginTop: "-400px",
          marginLeft: "840px",
        }}
      >
        <div class="card1234">
          <p class="city">PINK CITY</p>
          <p class="weather">PARTILY CLOUDY</p>
          <svg
            class="weather"
            version="1.1"
            id="Layer_1"
            x="0px"
            y="0px"
            width="50px"
            height="50px"
            viewBox="0 0 100 100"
          >
            <image
              id="image0"
              width="100"
              height="100"
              x="0"
              y="0"
              href="data:image/png;base64,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"
            ></image>
          </svg>
          <p class="temp">32°</p>
          <div class="minmaxContainer">
            <div class="min">
              <p class="minHeading">Min</p>
              <p class="minTemp">30°</p>
            </div>
            <div class="max">
              <p class="maxHeading">Max</p>
              <p class="maxTemp">32°</p>
            </div>
          </div>
        </div>
      </div>

      <div class="card456" style={{ marginTop: "120px" }}>
        <div class="card-content-wrapper">
          <div class="card-title">Free plan</div>
          <div class="card-price">
            <span>$</span>0<span>/month</span>
          </div>
          <div class="card-subtitle">Benefits:</div>
          <ul class="card-benefits"></ul>
        </div>
        <button class="card-btn">More info</button>
      </div>
      <div
        class="container000"
        style={{
          marginBottom: "150px",
          marginTop: "-200px",
          marginLeft: "180px",
        }}
      >
        <div class="card000">hover</div>
      </div>

      <div
        class="charts-wrapper"
        style={{
          marginBottom: "150px",
          marginTop: "-400px",
          marginLeft: "480px",
        }}
      >
        <section role="credit-card">
          <div class="top">
            <img src="https://ozcanzaferayan.github.io/financial-crm/img/mastercard.svg" />
            <img
              src="https://ozcanzaferayan.github.io/financial-crm/img/apple_pay.svg"
              class="apple_pay"
            />
          </div>
          <div class="ccNumber">
            <span>˙˙˙˙ ˙˙˙˙ ˙˙˙˙ 5610</span>
          </div>
          <div class="ccBottom">
            <div class="ccValidThru">
              <label>VALID THRU</label>
              <span>05/21</span>
            </div>
            <div class="ccCardHolder">
              <label>CARD HOLDER</label>
              <span>Robert</span>
            </div>
          </div>
        </section>
      </div>
      {/* Chart Section */}
      <div id="effect-example-2">
        <h4
          style={{
            textAlign: "left",
            marginBottom: "20px",
            fontWeight: "16px",
          }}
        >
          Customer Progress
        </h4>
        <div className="chart-container">
          <Bar data={data} options={options} />
        </div>

        <div
          id="chartdiv"
          ref={chartDivRef}
          style={{
            width: "70%",
            height: "300px",
            marginLeft: "620px",
            marginTop: "-320px",
            marginBottom: "40px",
          }}
        ></div>
      </div>

      <br />
      <br />
      <div>
        <section style={{ height: "70px", marginLeft: "-80px" }}>
          <Pie
            data={pieData}
            height={chartHeight}
            width={chartWidth}
            options={chartOptions}
          />
        </section>

        <section
          style={{ height: "70px", marginLeft: "560px", marginBottom: "160px" }}
        >
          <Bar
            data={barData}
            height={chartHeight}
            width={chartWidth}
            options={chartOptions}
          />
        </section>

        <section
          style={{ height: "70px", marginBottom: "260px", marginTop: "360px" }}
        >
          <Line
            data={lineData}
            height={chartHeight}
            width={chartWidth}
            options={chartOptions}
          />
        </section>

        <section
          style={{
            marginLeft: "560px",
            marginTop: "-360px",
            marginBottom: "60px",
          }}
        >
          <Radar
            data={radarData}
            height={chartHeight}
            width={chartWidth}
            options={chartOptions}
          />
        </section>
      </div>

      {/* <table>
        <caption>GSTR</caption>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Invoice</th>
            <th>Tax</th>
            <th>SGST</th>
            <th>CGST</th>
            <th>IGST</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ "--zi": " 0" }}>
            <td data-title="One">Cell 1</td>
            <td data-title="Two">Cell 2</td>
            <td data-title="Three">Cell 3</td>
            <td data-title="Two">Cell 4</td>
            <td data-title="Three">Cell 5</td>
            <td data-title="Three">Cell 6</td>
          </tr>
          <tr style={{ "--zi": " -1" }}>
            <td data-title="One">Cell 1</td>
            <td data-title="Two">Cell 2</td>
            <td data-title="Three">Cell 3</td>
            <td data-title="Two">Cell 4</td>
            <td data-title="Three">Cell 5</td>
            <td data-title="Three">Cell 6</td>
          </tr>
          <tr style={{ "--zi ": "-2" }}>
            <td data-title="One">Cell 1</td>
            <td data-title="Two">Cell 2</td>
            <td data-title="Three">Cell 3</td>
            <td data-title="Two">Cell 4</td>
            <td data-title="Three">Cell 5</td>
            <td data-title="Three">Cell 6</td>
          </tr>
          <tr style={{ "--zi": " -3" }}>
            <td data-title="One">Cell 1</td>
            <td data-title="Two">Cell 2</td>
            <td data-title="Three">Cell 3</td>
            <td data-title="Two">Cell 4</td>
            <td data-title="Three">Cell 5</td>
            <td data-title="Three">Cell 6</td>
          </tr>
          <tr style={{ "--zi": " -4" }}>
            <td data-title="One">Cell 1</td>
            <td data-title="Two">Cell 2</td>
            <td data-title="Three">Cell 3</td>
            <td data-title="Two">Cell 4</td>
            <td data-title="Three">Cell 5</td>
            <td data-title="Three">Cell 6</td>
          </tr>
          <tr style={{ "--zi": " -5" }}>
            <td data-title="One">Cell 1</td>
            <td data-title="Two">Cell 2</td>
            <td data-title="Three">Cell 3</td>
            <td data-title="Two">Cell 4</td>
            <td data-title="Three">Cell 5</td>
            <td data-title="Three">Cell 6</td>
          </tr>
          <tr style={{ "--zi": " -6" }}>
            <td data-title="One">Cell 1</td>
            <td data-title="Two">Cell 2</td>
            <td data-title="Three">Cell 3</td>
            <td data-title="Two">Cell 4</td>
            <td data-title="Three">Cell 5</td>
            <td data-title="Three">Cell 6</td>
          </tr>
          <tr style={{ "--zi": " -7" }}>
            <td data-title="One">Cell 1</td>
            <td data-title="Two">Cell 2</td>
            <td data-title="Three">Cell 3</td>
            <td data-title="Two">Cell 4</td>
            <td data-title="Three">Cell 5</td>
            <td data-title="Three">Cell 6</td>
          </tr>
          <tr style={{ "--zi": " -8" }}>
            <td data-title="One">Cell 1</td>
            <td data-title="Two">Cell 2</td>
            <td data-title="Three">Cell 3</td>
            <td data-title="Two">Cell 4</td>
            <td data-title="Three">Cell 5</td>
            <td data-title="Three">Cell 6</td>
          </tr>
          <tr style={{ "--zi": " -9" }}>
            <td data-title="One">Cell 1</td>
            <td data-title="Two">Cell 2</td>
            <td data-title="Three">Cell 3</td>
            <td data-title="Two">Cell 4</td>
            <td data-title="Three">Cell 5</td>
            <td data-title="Three">Cell 6</td>
          </tr>
        </tbody>
      </table> */}
    </>
  );
};

export default HDashboard;
