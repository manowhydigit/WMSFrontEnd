import {
  ConsoleSqlOutlined,
  MoonOutlined,
  SunOutlined,
} from "@ant-design/icons";
import Axios from "axios";
import {
  Alert,
  Button,
  Card,
  Input,
  Space,
  Typography,
  notification,
} from "antd";

import { useSelector } from "react-redux";

import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import confetti from "canvas-confetti";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoonly from "../logoonly.png";
import Loader from "../utils/Loader";
import { encryptPassword } from "../utils/passEnc";
import Gallery from "./Gallery";
import CryptoJS from "crypto-js";
import "./LoginPage.css";
// import "./LoginPageNew12.css";
import UWLNL from "../UWLNL.jpg";
import UWLNL2 from "../UWLNL2.png";
import scmprocess from "../scmprocess.gif";
import loginpage1 from "../loginpage1.png";
import loginpage1New from "../loginpage1New.png";
import loginpage1New1 from "../loginpage1New1.jpg";
import expimp from "../expimp.jpg";
import login4 from "../login4.jpg";
import scm2 from "../scm2.jpg";
import scmvideo from "../scmvideo.mp4";
import logoonly1 from "../logoonly.png";
import ParticleOrbit from "./ParticleOrbit";
import styled, { createGlobalStyle } from "styled-components";
import LocationDateTime from "./LocationDateTime";

import { Formik } from "formik";
import * as Yup from "yup";

const { Text } = Typography;
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

// Theme styles
const themeStyles = {
  1: {
    background: "#181828",
    className: "",
  },
  2: {
    background:
      "url('https://www.toptal.com/designers/subtlepatterns/uploads/dark-honeycomb.png')",
    className: "mystyleSec",
  },
  3: {
    background:
      "url('https://www.toptal.com/designers/subtlepatterns/uploads/random_grey_variations.png')",
    className: "mystylethird",
  },
  4: {
    background: "#1D2C4F",
    className: "mystylefour",
  },
};

const LoginPageStyles = createGlobalStyle`
  
body {
  background-color: #181828;
}

.top-header:before {
  background-image: url(https://1.bp.blogspot.com/-gxsOcYWghHA/Xp_izTh4sFI/AAAAAAAAU8s/y637Fwg99qAuzW9na_NT_uApny8Vce95gCEwYBhgL/s1600/header-footer-gradient-bg.png);
}
.top-header:before {
  content: "";
  display: block;
  width: 100%;
  height: 4px;
  background-repeat: repeat-x;
  background-size: contain;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.5;
}

#mainCoantiner {
   background-color: #181828;
  height: 100%;
  width: 100%;
  padding-bottom: 50px;
}

.mystyleSec {
  background-image: url("https://www.toptal.com/designers/subtlepatterns/uploads/dark-honeycomb.png");
}

.mystylethird {
  background-image: url(https://www.toptal.com/designers/subtlepatterns/uploads/random_grey_variations.png);
}

.mystylefour {
          background-color: #1D2C4F;
        }
/*************header*******/

.main-header {
  top: 0;
  left: 0;
  z-index: 20;
  -webkit-transform: translate3d(0, 0, 0);
  height: 70px;
  width: 100%;
  bottom: inherit;
  text-align: center;
  background: rgba(28, 31, 47, 0.16);
  overflow: hidden;
  border: 1px solid #2e344d;
  -webkit-transition: all 0.3s ease-in-out 0s;
  -moz-transition: all 0.3s ease-in-out 0s;
  -ms-transition: all 0.3s ease-in-out 0s;
  -o-transition: all 0.3s ease-in-out 0s;
  transition: all 0.3s ease-in-out 0s;
  box-shadow: 10px 10px 36px rgb(0, 0, 0, 0.5),
    -13px -13px 23px rgba(255, 255, 255, 0.03);
  border-width: 1px 0px 0 1px;
}

.folio-btn {
  position: absolute;
  bottom: 0;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  right: 0;
  height: 70px;
  width: 70px;
}

.folio-btn-item {
  position: absolute;
  width: 40px;
  height: 40px;
  left: 15px;
  top: 15px;
}

.folio-btn-dot {
  float: left;
  width: 33.3%;
  height: 33.3%;
  position: relative;
}

.folio-btn-dot:before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4px;
  height: 4px;
  margin: -2px 0 0 -2px;
  border-radius: 50%;
  transition: all 300ms linear;
  transform: scale(1);
}

.folio-btn-dot:before {
  background: #00bcd4;
}

.folio-btn:hover .folio-btn-dot:first-child:before,
.folio-btn:hover .folio-btn-dot:nth-child(3):before,
.folio-btn:hover .folio-btn-dot:nth-child(4):before,
.folio-btn:hover .folio-btn-dot:nth-child(8):before {
  transform: scale(1.8);
  opacity: 0.5;
}

/***social***/
.header-social {
  position: absolute;
  z-index: 20;
  width: auto;
  bottom: 17px;
  right: 90px;
  padding: 0;
  min-width: 140px;
  box-shadow: 3px 9px 16px rgb(0, 0, 0, 0.4),
    -3px -3px 10px rgba(255, 255, 255, 0.06),
    inset 14px 14px 26px rgb(0, 0, 0, 0.3),
    inset -3px -3px 15px rgba(255, 255, 255, 0.05);
  border-width: 1px 0px 0px 1px;
  border-style: solid;
  border-color: #2e344d;
  
}

.header-social:before {
  background: #00bcd4;
}

.header-social:before {
  content: "";
  position: absolute;
  left: 50%;
  top: -3px;
  width: 36px;
  margin-left: -18px;
  height: 6px;
}

.header-social li {
  display: block;
  float: left;
  margin-top: 0;
}

.header-social li a {
  padding: 7px 7px;
  width: 36px;
  height: 36px;
  line-height: 36px;
  display: inline-block;
  font-size: 12px;
  border-style: solid;
  color: rgba(255, 255, 255, 0.41);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 300ms linear;

}

.header-social li a:hover {
  color: #00bcd4;
  cursor: pointer;
}

ul,
li {
  border: none;
  outline: 0;
  font-weight: inherit;
  font-style: inherit;
  font-size: 100%;
  font-family: inherit;
  vertical-align: baseline;
  text-decoration: none;
  margin: 0;
  padding: 0;
}

ol,
ul {
  list-style: none;
}

.main-header:before {
  content: "";
  position: absolute;
  left: 10px;
  width: 60px;
  height: 1px;
  bottom: 120px;
  background: rgba(255, 255, 255, 0.1);
}

/***end*****/

.card {
  border: none;
  border-radius: 30px;
  background-color: #14edaa;
  
}

.wow-bg {
  background-color: #141421;
  border: 1px solid #2e2e4c;
  box-shadow: 3px 9px 16px rgb(0, 0, 0, 0.4),
    -3px -3px 10px rgba(255, 255, 255, 0.06),
    inset 14px 14px 26px rgb(0, 0, 0, 0.3),
    inset -3px -3px 15px rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-top: 4px;
  height: 295px;
}
  .wow-bg.mystylefour {
  background-color: #1D2C4F;
}

.starsec {
  content: " ";
  position: absolute;
  width: 3px;
  height: 3px;
  background: transparent;
  box-shadow: 571px 173px #00bcd4, 1732px 143px #00bcd4, 1745px 454px #ff5722,
    234px 784px #00bcd4, 1793px 1123px #ff9800, 1076px 504px #03a9f4,
    633px 601px #ff5722, 350px 630px #ffeb3b, 1164px 782px #00bcd4,
    76px 690px #3f51b5, 1825px 701px #cddc39, 1646px 578px #ffeb3b,
    544px 293px #2196f3, 445px 1061px #673ab7, 928px 47px #00bcd4,
    168px 1410px #8bc34a, 777px 782px #9c27b0, 1235px 1941px #9c27b0,
    104px 1690px #8bc34a, 1167px 1338px #e91e63, 345px 1652px #009688,
    1682px 1196px #f44336, 1995px 494px #8bc34a, 428px 798px #ff5722,
    340px 1623px #f44336, 605px 349px #9c27b0, 1339px 1344px #673ab7,
    1102px 1745px #3f51b5, 1592px 1676px #2196f3, 419px 1024px #ff9800,
    630px 1033px #4caf50, 1995px 1644px #00bcd4, 1092px 712px #9c27b0,
    1355px 606px #f44336, 622px 1881px #cddc39, 1481px 621px #9e9e9e,
    19px 1348px #8bc34a, 864px 1780px #e91e63, 442px 1136px #2196f3,
    67px 712px #ff5722, 89px 1406px #f44336, 275px 321px #009688,
    592px 630px #e91e63, 1012px 1690px #9c27b0, 1749px 23px #673ab7,
    94px 1542px #ffeb3b, 1201px 1657px #3f51b5, 1505px 692px #2196f3,
    1799px 601px #03a9f4, 656px 811px #00bcd4, 701px 597px #00bcd4,
    1202px 46px #ff5722, 890px 569px #ff5722, 1613px 813px #2196f3,
    223px 252px #ff9800, 983px 1093px #f44336, 726px 1029px #ffc107,
    1764px 778px #cddc39, 622px 1643px #f44336, 174px 1559px #673ab7,
    212px 517px #00bcd4, 340px 505px #fff, 1700px 39px #fff,
    1768px 516px #f44336, 849px 391px #ff9800, 228px 1824px #fff,
    1119px 1680px #ffc107, 812px 1480px #3f51b5, 1438px 1585px #cddc39,
    137px 1397px #fff, 1080px 456px #673ab7, 1208px 1437px #03a9f4,
    857px 281px #f44336, 1254px 1306px #cddc39, 987px 990px #4caf50,
    1655px 911px #00bcd4, 1102px 1216px #ff5722, 1807px 1044px #fff,
    660px 435px #03a9f4, 299px 678px #4caf50, 1193px 115px #ff9800,
    918px 290px #cddc39, 1447px 1422px #ffeb3b, 91px 1273px #9c27b0,
    108px 223px #ffeb3b, 146px 754px #00bcd4, 461px 1446px #ff5722,
    1004px 391px #673ab7, 1529px 516px #f44336, 1206px 845px #cddc39,
    347px 583px #009688, 1102px 1332px #f44336, 709px 1756px #00bcd4,
    1972px 248px #fff, 1669px 1344px #ff5722, 1132px 406px #f44336,
    320px 1076px #cddc39, 126px 943px #ffeb3b, 263px 604px #ff5722,
    1546px 692px #f44336;
  animation: animStar 150s linear infinite;
}

.starthird {
  content: " ";
  position: absolute;
  width: 3px;
  height: 3px;
  background: transparent;
  box-shadow: 571px 173px #00bcd4, 1732px 143px #00bcd4, 1745px 454px #ff5722,
    234px 784px #00bcd4, 1793px 1123px #ff9800, 1076px 504px #03a9f4,
    633px 601px #ff5722, 350px 630px #ffeb3b, 1164px 782px #00bcd4,
    76px 690px #3f51b5, 1825px 701px #cddc39, 1646px 578px #ffeb3b,
    544px 293px #2196f3, 445px 1061px #673ab7, 928px 47px #00bcd4,
    168px 1410px #8bc34a, 777px 782px #9c27b0, 1235px 1941px #9c27b0,
    104px 1690px #8bc34a, 1167px 1338px #e91e63, 345px 1652px #009688,
    1682px 1196px #f44336, 1995px 494px #8bc34a, 428px 798px #ff5722,
    340px 1623px #f44336, 605px 349px #9c27b0, 1339px 1344px #673ab7,
    1102px 1745px #3f51b5, 1592px 1676px #2196f3, 419px 1024px #ff9800,
    630px 1033px #4caf50, 1995px 1644px #00bcd4, 1092px 712px #9c27b0,
    1355px 606px #f44336, 622px 1881px #cddc39, 1481px 621px #9e9e9e,
    19px 1348px #8bc34a, 864px 1780px #e91e63, 442px 1136px #2196f3,
    67px 712px #ff5722, 89px 1406px #f44336, 275px 321px #009688,
    592px 630px #e91e63, 1012px 1690px #9c27b0, 1749px 23px #673ab7,
    94px 1542px #ffeb3b, 1201px 1657px #3f51b5, 1505px 692px #2196f3,
    1799px 601px #03a9f4, 656px 811px #00bcd4, 701px 597px #00bcd4,
    1202px 46px #ff5722, 890px 569px #ff5722, 1613px 813px #2196f3,
    223px 252px #ff9800, 983px 1093px #f44336, 726px 1029px #ffc107,
    1764px 778px #cddc39, 622px 1643px #f44336, 174px 1559px #673ab7,
    212px 517px #00bcd4, 340px 505px #fff, 1700px 39px #fff,
    1768px 516px #f44336, 849px 391px #ff9800, 228px 1824px #fff,
    1119px 1680px #ffc107, 812px 1480px #3f51b5, 1438px 1585px #cddc39,
    137px 1397px #fff, 1080px 456px #673ab7, 1208px 1437px #03a9f4,
    857px 281px #f44336, 1254px 1306px #cddc39, 987px 990px #4caf50,
    1655px 911px #00bcd4, 1102px 1216px #ff5722, 1807px 1044px #fff,
    660px 435px #03a9f4, 299px 678px #4caf50, 1193px 115px #ff9800,
    918px 290px #cddc39, 1447px 1422px #ffeb3b, 91px 1273px #9c27b0,
    108px 223px #ffeb3b, 146px 754px #00bcd4, 461px 1446px #ff5722,
    1004px 391px #673ab7, 1529px 516px #f44336, 1206px 845px #cddc39,
    347px 583px #009688, 1102px 1332px #f44336, 709px 1756px #00bcd4,
    1972px 248px #fff, 1669px 1344px #ff5722, 1132px 406px #f44336,
    320px 1076px #cddc39, 126px 943px #ffeb3b, 263px 604px #ff5722,
    1546px 692px #f44336;
  animation: animStar 10s linear infinite;
}

.starfourth {
  content: " ";
  position: absolute;
  width: 2px;
  height: 2px;
  background: transparent;
  box-shadow: 571px 173px #00bcd4, 1732px 143px #00bcd4, 1745px 454px #ff5722,
    234px 784px #00bcd4, 1793px 1123px #ff9800, 1076px 504px #03a9f4,
    633px 601px #ff5722, 350px 630px #ffeb3b, 1164px 782px #00bcd4,
    76px 690px #3f51b5, 1825px 701px #cddc39, 1646px 578px #ffeb3b,
    544px 293px #2196f3, 445px 1061px #673ab7, 928px 47px #00bcd4,
    168px 1410px #8bc34a, 777px 782px #9c27b0, 1235px 1941px #9c27b0,
    104px 1690px #8bc34a, 1167px 1338px #e91e63, 345px 1652px #009688,
    1682px 1196px #f44336, 1995px 494px #8bc34a, 428px 798px #ff5722,
    340px 1623px #f44336, 605px 349px #9c27b0, 1339px 1344px #673ab7,
    1102px 1745px #3f51b5, 1592px 1676px #2196f3, 419px 1024px #ff9800,
    630px 1033px #4caf50, 1995px 1644px #00bcd4, 1092px 712px #9c27b0,
    1355px 606px #f44336, 622px 1881px #cddc39, 1481px 621px #9e9e9e,
    19px 1348px #8bc34a, 864px 1780px #e91e63, 442px 1136px #2196f3,
    67px 712px #ff5722, 89px 1406px #f44336, 275px 321px #009688,
    592px 630px #e91e63, 1012px 1690px #9c27b0, 1749px 23px #673ab7,
    94px 1542px #ffeb3b, 1201px 1657px #3f51b5, 1505px 692px #2196f3,
    1799px 601px #03a9f4, 656px 811px #00bcd4, 701px 597px #00bcd4,
    1202px 46px #ff5722, 890px 569px #ff5722, 1613px 813px #2196f3,
    223px 252px #ff9800, 983px 1093px #f44336, 726px 1029px #ffc107,
    1764px 778px #cddc39, 622px 1643px #f44336, 174px 1559px #673ab7,
    212px 517px #00bcd4, 340px 505px #fff, 1700px 39px #fff,
    1768px 516px #f44336, 849px 391px #ff9800, 228px 1824px #fff,
    1119px 1680px #ffc107, 812px 1480px #3f51b5, 1438px 1585px #cddc39,
    137px 1397px #fff, 1080px 456px #673ab7, 1208px 1437px #03a9f4,
    857px 281px #f44336, 1254px 1306px #cddc39, 987px 990px #4caf50,
    1655px 911px #00bcd4, 1102px 1216px #ff5722, 1807px 1044px #fff,
    660px 435px #03a9f4, 299px 678px #4caf50, 1193px 115px #ff9800,
    918px 290px #cddc39, 1447px 1422px #ffeb3b, 91px 1273px #9c27b0,
    108px 223px #ffeb3b, 146px 754px #00bcd4, 461px 1446px #ff5722,
    1004px 391px #673ab7, 1529px 516px #f44336, 1206px 845px #cddc39,
    347px 583px #009688, 1102px 1332px #f44336, 709px 1756px #00bcd4,
    1972px 248px #fff, 1669px 1344px #ff5722, 1132px 406px #f44336,
    320px 1076px #cddc39, 126px 943px #ffeb3b, 263px 604px #ff5722,
    1546px 692px #f44336;
  animation: animStar 50s linear infinite;
}

.starfifth {
  content: " ";
  position: absolute;
  width: 1px;
  height: 1px;
  background: transparent;
  box-shadow: 571px 173px #00bcd4, 1732px 143px #00bcd4, 1745px 454px #ff5722,
    234px 784px #00bcd4, 1793px 1123px #ff9800, 1076px 504px #03a9f4,
    633px 601px #ff5722, 350px 630px #ffeb3b, 1164px 782px #00bcd4,
    76px 690px #3f51b5, 1825px 701px #cddc39, 1646px 578px #ffeb3b,
    544px 293px #2196f3, 445px 1061px #673ab7, 928px 47px #00bcd4,
    168px 1410px #8bc34a, 777px 782px #9c27b0, 1235px 1941px #9c27b0,
    104px 1690px #8bc34a, 1167px 1338px #e91e63, 345px 1652px #009688,
    1682px 1196px #f44336, 1995px 494px #8bc34a, 428px 798px #ff5722,
    340px 1623px #f44336, 605px 349px #9c27b0, 1339px 1344px #673ab7,
    1102px 1745px #3f51b5, 1592px 1676px #2196f3, 419px 1024px #ff9800,
    630px 1033px #4caf50, 1995px 1644px #00bcd4, 1092px 712px #9c27b0,
    1355px 606px #f44336, 622px 1881px #cddc39, 1481px 621px #9e9e9e,
    19px 1348px #8bc34a, 864px 1780px #e91e63, 442px 1136px #2196f3,
    67px 712px #ff5722, 89px 1406px #f44336, 275px 321px #009688,
    592px 630px #e91e63, 1012px 1690px #9c27b0, 1749px 23px #673ab7,
    94px 1542px #ffeb3b, 1201px 1657px #3f51b5, 1505px 692px #2196f3,
    1799px 601px #03a9f4, 656px 811px #00bcd4, 701px 597px #00bcd4,
    1202px 46px #ff5722, 890px 569px #ff5722, 1613px 813px #2196f3,
    223px 252px #ff9800, 983px 1093px #f44336, 726px 1029px #ffc107,
    1764px 778px #cddc39, 622px 1643px #f44336, 174px 1559px #673ab7,
    212px 517px #00bcd4, 340px 505px #fff, 1700px 39px #fff,
    1768px 516px #f44336, 849px 391px #ff9800, 228px 1824px #fff,
    1119px 1680px #ffc107, 812px 1480px #3f51b5, 1438px 1585px #cddc39,
    137px 1397px #fff, 1080px 456px #673ab7, 1208px 1437px #03a9f4,
    857px 281px #f44336, 1254px 1306px #cddc39, 987px 990px #4caf50,
    1655px 911px #00bcd4, 1102px 1216px #ff5722, 1807px 1044px #fff,
    660px 435px #03a9f4, 299px 678px #4caf50, 1193px 115px #ff9800,
    918px 290px #cddc39, 1447px 1422px #ffeb3b, 91px 1273px #9c27b0,
    108px 223px #ffeb3b, 146px 754px #00bcd4, 461px 1446px #ff5722,
    1004px 391px #673ab7, 1529px 516px #f44336, 1206px 845px #cddc39,
    347px 583px #009688, 1102px 1332px #f44336, 709px 1756px #00bcd4,
    1972px 248px #fff, 1669px 1344px #ff5722, 1132px 406px #f44336,
    320px 1076px #cddc39, 126px 943px #ffeb3b, 263px 604px #ff5722,
    1546px 692px #f44336;
  animation: animStar 80s linear infinite;
}

@keyframes animStar {
  0% {
    transform: translateY(0px);
  }
  100% {
    transform: translateY(-2000px);
  }
}

.logn-btn {
  background: #1c1f2f;
  border-radius: 30px;
  overflow: hidden;
  border: 1px solid #2e344d;
  -webkit-transition: all 0.3s ease-in-out 0s;
  -moz-transition: all 0.3s ease-in-out 0s;
  -ms-transition: all 0.3s ease-in-out 0s;
  -o-transition: all 0.3s ease-in-out 0s;
  transition: all 0.3s ease-in-out 0s;
  /* box-shadow: 10px 10px 36px rgb(0,0,0,0.5), -13px -13px 23px rgba(255,255,255, 0.03), inset 14px 14px 70px rgb(0,0,0,0.2), inset -15px -15px 30px rgba(255,255,255, 0.04); */
  box-shadow: 0px 2px 26px rgb(0, 0, 0, 0.5),
    0px 7px 13px rgba(255, 255, 255, 0.03);
  margin-top: 30px;
}

.logn-btn:hover {
  background-color: #1c1f2f;
  border-radius: 50px;
  min-width: 140px;
  /* box-shadow: 10px 10px 36px rgb(0,0,0,0.5), -13px -13px 23px rgba(255,255,255, 0.03), inset 14px 14px 70px rgb(0,0,0,0.2), inset -15px -15px 30px rgba(255,255,255, 0.04); */
  box-shadow: 3px 9px 16px rgb(0, 0, 0, 0.4),
    -3px -3px 10px rgba(255, 255, 255, 0.06),
    inset 14px 14px 26px rgb(0, 0, 0, 0.3),
    inset -3px -3px 15px rgba(255, 255, 255, 0.05);
  border-width: 1px 0px 0px 1px;
  border-style: solid;
  border-color: #2e344d;
}

.textbox-dg {
  background: rgba(28, 31, 47, 0.16);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #2e344d;
  -webkit-transition: all 0.3s ease-in-out 0s;
  -moz-transition: all 0.3s ease-in-out 0s;
  -ms-transition: all 0.3s ease-in-out 0s;
  -o-transition: all 0.3s ease-in-out 0s;
  transition: all 0.3s ease-in-out 0s;
  /* box-shadow: 10px 10px 36px rgb(0,0,0,0.5), -13px -13px 23px rgba(255,255,255, 0.03), inset 14px 14px 70px rgb(0,0,0,0.2), inset -15px -15px 30px rgba(255,255,255, 0.04); */
  box-shadow: 10px 10px 36px rgb(0, 0, 0, 0.5),
    -13px -13px 23px rgba(255, 255, 255, 0.03);
  border-width: 1px 0px 0 1px;
  margin-top: 15px;
}

.form-control:focus {
  border: 1px solid #344d2e;
  color: #495057;
  outline: 0;
  background: rgb(17, 20, 31);
  border-radius: 4px;
  transition: all 0.3s ease-in-out 0s;
  /* box-shadow: 10px 10px 36px rgb(0,0,0,0.5), -13px -13px 23px rgba(255,255,255, 0.03), inset 14px 14px 70px rgb(0,0,0,0.2), inset -15px -15px 30px rgba(255,255,255, 0.04); */
  box-shadow: 10px 10px 36px rgb(0, 0, 0, 0.5),
    -13px -13px 23px rgba(255, 255, 255, 0.03);
}

.btn-link {
  color: #344d2e;
}

.btn-link:hover {
  color: #2b7a19;
  text-decoration: underline;
}

.btn-primary:not(:disabled):not(.disabled).active,
.btn-primary:not(:disabled):not(.disabled):active,
.show > .btn-primary.dropdown-toggle {
  color: #807f7f;
  background-color: transparent;
  border-color: #2b7a19;
}

.btn-primary.focus,
.btn-primary:focus {
  color: #fff;
  background-color: transparent;
  border-color: transparent;
  box-shadow: 0 0 0 0.2rem rgba(0, 255, 110, 0.25);
}

.mt-6,
.my-6 {
  margin-top: 2rem !important;
}

.socila-btn {
  height: 40px;
  border-radius: 10%;
  width: 40px;
  box-shadow: 3px 9px 16px rgb(0, 0, 0, 0.4),
    -3px -3px 10px rgba(255, 255, 255, 0.06),
    inset 14px 14px 26px rgb(0, 0, 0, 0.3),
    inset -3px -3px 15px rgba(255, 255, 255, 0.05);
  border-width: 1px 0px 0px 1px;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.2);
  margin-right: 10px;
}

.fb-color {
  color: #3b5998;
}

.incolor {
  color: #007bff;
}

.tweetcolor {
  color: #41a4f7;
}
.driblecolor {
  color: #e83e8c;
}

.colorboard {
  color: #00ffaaed;
}



`;

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const formikRef = useRef(null);
  const [checked, setChecked] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // const rainContainerRef = useRef(null);
  // const numberOfDrops = 150;

  // useEffect(() => {
  //   const rainContainer = rainContainerRef.current;

  //   const createSplash = (raindrop) => {
  //     const splash = document.createElement("div");
  //     splash.classList.add("splash");

  //     const dropX = raindrop.style.left;
  //     const dropY = window.innerHeight;

  //     splash.style.left = dropX;
  //     splash.style.top = `${dropY - 5}px`;

  //     rainContainer.appendChild(splash);

  //     setTimeout(() => {
  //       splash.remove();
  //     }, 300);
  //   };

  //   for (let i = 0; i < numberOfDrops; i++) {
  //     const raindrop = document.createElement("div");
  //     raindrop.classList.add("raindrop");

  //     raindrop.style.left = `${Math.random() * 100}vw`;

  //     const size = Math.random() * 0.5 + 0.5;
  //     raindrop.style.transform = `scale(${size})`;

  //     raindrop.style.animationDuration = `${Math.random() * 2 + 1}s`;
  //     raindrop.style.animationDelay = `-${Math.random() * 2}s`;

  //     rainContainer.appendChild(raindrop);

  //     raindrop.addEventListener("animationiteration", () => {
  //       createSplash(raindrop);
  //     });
  //   }

  //   // Cleanup function
  //   return () => {
  //     while (rainContainer.firstChild) {
  //       rainContainer.removeChild(rainContainer.firstChild);
  //     }
  //   };
  // }, []);

  const [backgroundStyle, setBackgroundStyle] = useState(
    localStorage.getItem("bgStyle") || "mystylethird"
  );

  useEffect(() => {
    localStorage.setItem("bgStyle", backgroundStyle);
  }, [backgroundStyle]);

  const handleBackgroundChange = (style) => {
    setBackgroundStyle(style);
  };

  // Get theme from localStorage or default to 1
  const [currentTheme, setCurrentTheme] = useState(
    parseInt(localStorage.getItem("userTheme")) || 1
  );

  // Set theme in localStorage when it changes
  useEffect(() => {
    localStorage.setItem("userTheme", currentTheme.toString());
    applyThemeStyles(currentTheme);
  }, [currentTheme]);

  // Apply theme styles
  const applyThemeStyles = (themeNumber) => {
    const theme = themeStyles[themeNumber];
    document.body.style.background = theme.background;
    document.body.className = theme.className;
  };

  // Initialize theme on component mount
  useEffect(() => {
    applyThemeStyles(currentTheme);
  }, []);

  // const [isMobile, setIsMobile] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const resetForm = () => {
    // Check if the formikRef is defined
    if (formikRef.current) {
      // Call the resetForm function using the ref
      formikRef.current.resetForm({
        values: {
          email: "",
          password: "",
        },
      });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
        localStorage.setItem("isMobileView", mobile.toString());
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const button = document.getElementById("celebrateBtn");
    if (button) {
      button.style.transform = "scale(0.95)";
      setTimeout(() => {
        button.style.transform = "scale(1)";
      }, 100);
    }
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     handleCelebrate();
  //   }, 20000);
  //   return () => clearInterval(interval);
  // });

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const loginAPICall = async (values) => {
    // Prepare the user registration data

    const userData = {
      password: encryptPassword(values.password),
      userName: values.username,
    };
    try {
      const response = await Axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status) {
        console.log("Test1", userData);
        // dispatch(setUser({ orgId: response.data.paramObjectsMap.userVO.orgId }));

        localStorage.setItem(
          "orgId",
          response.data.paramObjectsMap.userVO.orgId
        ); // Replace with the actual token
        localStorage.setItem(
          "userId",
          response.data.paramObjectsMap.userVO.usersId
        );
        localStorage.setItem(
          "userName",
          response.data.paramObjectsMap.userVO.userName
        );
        localStorage.setItem(
          "userType",
          response.data.paramObjectsMap.userVO.userType
        );
        localStorage.setItem(
          "token",
          response.data.paramObjectsMap.userVO.token
        );
        localStorage.setItem(
          "tokenId",
          response.data.paramObjectsMap.userVO.tokenId
        );
        localStorage.setItem("LoginMessage", true);
        //SET ROLES
        const userRoleVO = response.data.paramObjectsMap.userVO.roleVO;
        const roles = userRoleVO.map((row) => ({
          role: row.role,
        }));
        localStorage.setItem("ROLES", JSON.stringify(roles));

        // SET SCREENS
        const roleVO = response.data.paramObjectsMap.userVO.roleVO;
        let allScreensVO = [];
        roleVO.forEach((roleObj) => {
          roleObj.responsibilityVO.forEach((responsibility) => {
            if (responsibility.screensVO) {
              allScreensVO = allScreensVO.concat(responsibility.screensVO);
            }
          });
        });
        allScreensVO = [...new Set(allScreensVO)];
        localStorage.setItem("screens", JSON.stringify(allScreensVO));

        // dispatch(setUserRole(userRole));
        resetForm();
        // window.location.href = "/login";

        navigate("/InBound");
        if (checked) {
          localStorage.setItem(
            "rememberedCredentials",
            JSON.stringify({
              username: values.username,
              password: values.password,
            })
          );
        } else {
          // Clear stored credentials if "Remember Me" is unchecked
          localStorage.removeItem("rememberedCredentials");
        }
        navigate("/Trasactions");
        window.location.reload(true);
      } else {
        // Successful registration, perform actions like storing tokens and redirecting
        toast.error(response.data.paramObjectsMap.errorMessage, {
          autoClose: 2000,
          theme: "colored",
        });
        // setTimeout(() => {
        //   toast.success(response.data.paramObjectsMap.message, {
        //     autoClose: 2000,
        //     theme: 'colored'
        //   });
        // }, 2000);
      }
    } catch (error) {
      toast.error("Network Error", {
        autoClose: 2000,
        theme: "colored",
      });
    }
  };

  // const handleSubmit = async () => {
  //   if (!username) {
  //     setError("Username is required");
  //     return;
  //   }

  //   if (!password) {
  //     setError("Password is required");
  //     return;
  //   }
  //   setLoading(true);

  //   try {
  //     const response = await axios.post(`${API_URL}/api/auth/login`, {
  //       userName: username,
  //       password: encryptPassword(password),
  //     });

  //     if (response.data.status === true) {
  //       setSuccess(
  //         response.data.paramObjectsMap?.message || "Successfully logged in"
  //       );

  //       const userData = response.data.paramObjectsMap?.userVO;
  //       const screens =
  //         response.data.paramObjectsMap?.userVO.roleVO[0].responsibilityVO[0]
  //           .screensVO;

  //       localStorage.setItem("userData", JSON.stringify(userData));
  //       localStorage.setItem("screens", JSON.stringify(screens));
  //       localStorage.setItem("authToken", userData?.token);

  //       const token = response.data.paramObjectsMap?.userVO?.token;
  //       localStorage.setItem("authToken", token);

  //       const userName = response.data.paramObjectsMap?.userVO?.userName;
  //       localStorage.setItem("userName", userName);

  //       const userType = response.data.paramObjectsMap?.userVO?.userType;
  //       localStorage.setItem("userType", userType);

  //       const email = response.data.paramObjectsMap?.userVO?.email;
  //       localStorage.setItem("email", email);

  //       const nickName = response.data.paramObjectsMap?.userVO?.nickName;
  //       localStorage.setItem("nickName", nickName);

  //       localStorage.setItem(
  //         `${userData.userName}_theme`,
  //         currentTheme.toString()
  //       );

  //       const responseScreens = JSON.stringify(
  //         response.data.paramObjectsMap.userVO.roleVO[0].responsibilityVO[0]
  //           .screensVO
  //       );
  //       localStorage.setItem("responseScreens", responseScreens);
  //       setLoading(false);
  //       navigate("/Transactions");

  //       notification.success({
  //         message: "Success",
  //         description: "Successfully Logged In",
  //         duration: 5,
  //       });
  //     } else {
  //       const errorMsg = response?.data.paramObjectsMap.errorMessage;
  //       const message = response?.data.paramObjectsMap.message;

  //       notification.error({
  //         message: "Login attempt has failed",
  //         description: errorMsg,
  //         duration: 10,
  //       });
  //     }
  //   } catch (error) {
  //     const errorMessage =
  //       error.response?.data?.paramObjectsMap?.errorMessage ||
  //       error.response?.data?.message ||
  //       "An unexpected error occurred.";
  //     setError(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (window.location.pathname === "/login") {
      document.body.style.backgroundColor = "#fff";
      document.body.style.color = "#000";
    } else {
      if (theme === "dark") {
        document.body.style.backgroundColor = "#262626";
        document.body.style.color = "#fff";
      } else {
        document.body.style.backgroundColor = "#fff";
        document.body.style.color = "#000";
      }
    }
  }, [theme]);

  useEffect(() => {
    document.body.style.backgroundColor = "#fff";
    document.body.style.color = "#000";
    return () => {
      document.body.style.backgroundColor = "";
      document.body.style.color = "";
    };
  }, []);

  const cardStyle =
    theme === "dark"
      ? { backgroundColor: "#fff", borderColor: "#444", color: "#000" }
      : { backgroundColor: "#fff", borderColor: "#d9d9d9", color: "#000" };

  const inputStyle =
    theme === "dark"
      ? { backgroundColor: "#fff", color: "#000", borderColor: "#666" }
      : { backgroundColor: "#fff", color: "#000", borderColor: "#d9d9d9" };

  const handleSubmit = async () => {
    if (!username) {
      setError("Username is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        userName: username,
        password: encryptPassword(password),
      });

      if (response.data.status === true) {
        setSuccess(
          response.data.paramObjectsMap?.message || "Successfully logged in"
        );

        const userData = response.data.paramObjectsMap?.userVO;

        // Store user data
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("authToken", userData?.token);
        localStorage.setItem("userName", userData?.userName);
        localStorage.setItem("userType", userData?.userType);
        localStorage.setItem("email", userData?.email);
        localStorage.setItem("nickName", userData?.nickName);
        localStorage.setItem("orgId", userData.orgId);
        localStorage.setItem("usersId", userData.usersId);
        localStorage.setItem("employeeName", userData.employeeName);

        // Store roles and screens
        const userRoleVO = userData.roleVO;
        const roles = userRoleVO.map((row) => ({
          role: row.role,
        }));
        localStorage.setItem("ROLES", JSON.stringify(roles));

        // Store screens
        let allScreensVO = [];
        userRoleVO.forEach((roleObj) => {
          roleObj.responsibilityVO.forEach((responsibility) => {
            if (responsibility.screensVO) {
              allScreensVO = allScreensVO.concat(responsibility.screensVO);
            }
          });
        });
        allScreensVO = [...new Set(allScreensVO)];
        localStorage.setItem("screens", JSON.stringify(allScreensVO));

        // Remember credentials if checked
        if (checked) {
          localStorage.setItem(
            "rememberedCredentials",
            JSON.stringify({
              username: username,
              password: password,
            })
          );
        } else {
          localStorage.removeItem("rememberedCredentials");
        }

        // Show success notification
        notification.success({
          message: "Success",
          description: "Successfully Logged In",
          duration: 5,
        });

        // Navigate to transactions
        navigate("/InBound");
        // window.location.reload(); // Force refresh to ensure all data is loaded
      } else {
        const errorMsg = response?.data.paramObjectsMap.errorMessage;
        notification.error({
          message: "Login attempt has failed",
          description: errorMsg,
          duration: 10,
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.paramObjectsMap?.errorMessage ||
        error.response?.data?.message ||
        "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoginPageStyles />
      <div className={`full-page-background wow-bg ${backgroundStyle}`}>
        <header className="top-header"></header>
        {/* <div
          style={{
            background: "transparent",
            marginTop: "-5px",
          }}
        >
          <img src={UWLNL2} width="260px" height="90px" alt="Your Image" />
        </div> */}
        {/* <div className="rain-container" ref={rainContainerRef} /> */}
        <div
          style={{
            background: "transparent",
            marginTop: "100px",
            marginLeft: "550px",
          }}
        >
          <img src={UWLNL2} width="260px" height="90px" alt="Your Image" />
        </div>

        <div
          id={`mainCoantiner wow-bg ${backgroundStyle}`}
          style={{ height: "100vh" }}
        >
          <div className="dust-particles">
            <div className="starsec"></div>
            <div className="starthird"></div>
            <div className="starfourth"></div>
            <div className="starfifth"></div>
          </div>

          {/* <div className={`full-page-background wow-bg ${backgroundStyle}`}> */}
          <div>
            <div className="header-social">
              <ul>
                <li>
                  <a
                    onClick={() => setBackgroundStyle("")}
                    style={{ cursor: "pointer" }}
                  >
                    1
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => setBackgroundStyle("mystyleSec")}
                    style={{ cursor: "pointer" }}
                  >
                    2
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => setBackgroundStyle("mystylethird")}
                    style={{ cursor: "pointer" }}
                  >
                    3
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => setBackgroundStyle("mystylefour")}
                    style={{ cursor: "pointer" }}
                  >
                    4
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* <div class="wrapper">
<ul class="bg-bubbles">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
    </ul>
</div> */}
          <div
            className="card"
            style={{
              width: "300px",
              height: "300px",
              marginLeft: "530px",
              // marginTop: "80px",
              marginTop: "30px",
            }}
          >
            <div className={`card-body wow-bg ${backgroundStyle}`} id="formBg">
              <h3
                className="colorboard"
                style={{
                  fontSize: "20px",
                  marginLeft: "40px",
                  marginTop: "20px",
                }}
              >
                Welcome To UWL WMS
              </h3>

              <form>
                <div style={{ marginTop: "-20px" }}>
                  <Text
                    style={{
                      fontSize: 16,
                      marginBottom: "12px",
                      color: "white",
                      marginLeft: "20px",
                    }}
                  >
                    {/* Username */}
                    Login ID
                  </Text>
                  <br />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    style={{
                      color: "white",
                      padding: "4px",
                      fontSize: 16,
                      borderRadius: 8,
                      marginBottom: "15px",
                      background: "transparent",
                      width: "250px",
                      marginLeft: "20px",
                    }}
                  />
                </div>

                <div>
                  <Text
                    style={{
                      fontSize: 16,
                      marginBottom: "15px",
                      color: "white",
                      marginLeft: "20px",
                    }}
                  >
                    {/* 6-Digit Passcode */}
                    PassWord
                  </Text>
                  <Space
                    size="middle"
                    style={{ justifyContent: "center", marginLeft: "20px" }}
                  >
                    <Input.Password
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      visibilityToggle={{
                        visible: showPassword,
                        onVisibleChange: setShowPassword,
                      }}
                      style={{
                        color: "white",
                        padding: "4px",
                        fontSize: 16,
                        borderRadius: 8,
                        background: "transparent",
                        width: "250px",
                        marginLeft: "1px",
                      }}
                    />
                    ))
                  </Space>
                </div>
                <Button
                  type="primary"
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={!username || !password} // Disable when fields are empty
                  style={{
                    marginTop: "20px",
                    marginLeft: "20px",
                    width: "250px",
                    borderRadius: "8px",
                    height: "40px", // Added fixed height
                    fontSize: "16px", // Consistent font size
                    fontWeight: "bold", // Make text stand out
                    color: "white",
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()} // Handle Enter key
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </div>
          </div>
          <LocationDateTime />
        </div>

        <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
        }
        .full-page-background {
          
          height: 100vh;
          background-color: #181828;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transition: background-image 0.5s ease;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .full-page-background.mystyleSec {
          background-image: url("https://www.toptal.com/designers/subtlepatterns/uploads/dark-honeycomb.png");
        }

        .full-page-background.mystylethird {
          background-image: url("https://www.toptal.com/designers/subtlepatterns/uploads/random_grey_variations.png");
        }
          .full-page-background.mystylefour {
          background-color: #1D2C4F;
          
        }
      `}</style>
      </div>
    </>
  );
};

export default LoginPage;
