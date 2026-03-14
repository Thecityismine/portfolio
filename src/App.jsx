import { useState, useRef, useEffect } from "react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar } from "recharts";
import { firebaseConfigured } from "./firebase";

// ─── STATIC FALLBACK PRICES (used when CMC API key is not set) ───────────────
const STATIC_PRICES = {
  // Core coins
  BTC:108000, ETH:2098.18, ADA:0.2664, LTC:55.27, EOS:0.70,
  ZEC:28, BAT:0.1010, DOT:1.47, CRV:0.2384, ALGO:0.12,
  XLM:0.28, SOL:145, BCH:340, DGB:0.004047, IQ:0.001157,
  ETC:8.50, XRP:1.39, QTUM:0.9096,
  // Jorge extended — prices derived from screenshot value/qty
  TRX:0.2910, XMR:357.91, LINK:9.13,
  SUPER:0.8861, ICP:2.63, THETA:0.1798, FIL:0.8793, TFUEL:0.01307,
  BTG:64.88, USDT:1.00, TMT:0.01784, ENS:6.13, ZIL:0.004212,
  UTK:0.07327, VET:0.007270, AMPL:0.9936, NEO:2.651,
  SGB:0.001521, SHIB:0.000000596, ZRX:0.1074, MANA:0.09306,
  GALA:0.003490, DENT:0.001507, OMG:1.705, REEF:0.000655,
  XNO:0.5165, XTZ:0.3719, FET:0.1752, TRUMP:3.81, SAND:0.08596,
  ICX:0.03698, FLR:0.008883, LCC:0.003554, XRD:0.001846,
  STX:0.2569, GZIL:6.882, HERO:0.000495, GAS:1.560, HEX:0.000729,
  KCS:8.051, WAN:0.06822, TKY:0.000334, NCASH:0.0002727,
  TDROP:0.000550, SXP:0.05333, BAX:0.0000000211, AST:0.002786,
  ETHW:0.2999, NEX:0.1019, FTT:0.0002829, MELANIA:0.1249,
  FLM:0.01136, RDD:0.00004459, BIX:0.003650, KDA:0.02584,
  BLOK:0.00001877, USDC:1.00, PLR:0.000622,
};

// ─── MEMBERS — populated from Delta CSV exports ────────────────────────────
const STATIC_MEMBERS = [
  {
    id: "anseli", name: "Anseli Medina", avatar: "AM",
    btc: 0.12193865, eth: 0.87981231, ada: 0,
    usd: 15796.01, costBasis: 3353.51,
    unrealizedPL: 12442.50, realizedGains: 0, cash: 0,
    exchange: "Gemini",
    holdings: { ETH:0.87981231, LTC:2.966267, EOS:35.0, BTC:0.12193865, ZEC:3.92701303, BAT:713.85952738 },
  },
  {
    id: "emily", name: "Emily Medina", avatar: "EM",
    btc: 0.0073279, eth: 0.34488, ada: 0,
    usd: 1634.79, costBasis: 1100.08,
    unrealizedPL: 534.71, realizedGains: 0, cash: 0,
    exchange: "Coinbase",
    holdings: { BTC:0.0073279, ETH:0.34488, LTC:0.18433 },
  },
  {
    id: "itrust", name: "iTrust Capital", avatar: "IT",
    btc: 0.93640718, eth: 3.13902668, ada: 4132.3496,
    usd: 112399.15, costBasis: 111953.45,
    unrealizedPL: 445.70, realizedGains: 0, cash: 0,
    exchange: "iTrust",
    holdings: { BTC:0.93640718, ETH:3.13902668, ADA:4132.3496, DOT:122.6313, CRV:899.22043992, ALGO:2567.142, XLM:2107.22, SOL:3.1808992 },
  },
  {
    id: "marcos", name: "Marco Ricardo", avatar: "MR",
    btc: 0.00209111, eth: 0.1091685, ada: 533.549524,
    usd: 846.14, costBasis: 20.38,
    unrealizedPL: 825.76, realizedGains: 0, cash: 0,
    exchange: "Transfer",
    holdings: { EOS:5.0, ADA:533.549524, BTC:0.00209111, ETH:0.1091685, LTC:0.31831589, ETC:2.0, XRP:50.0 },
  },
  {
    id: "melanie", name: "Melanie Medina", avatar: "MM",
    btc: 0.01814054, eth: 0.344897, ada: 0,
    usd: 2816.69, costBasis: 2192.49,
    unrealizedPL: 624.20, realizedGains: 0, cash: 0,
    exchange: "Coinbase",
    holdings: { BTC:0.01814054, ETH:0.344897, LTC:0.18413, EOS:1.0, IQ:561.361, DGB:1324.60892804 },
  },
  {
    id: "michael", name: "Michael Alonzo", avatar: "MA",
    btc: 0.00064293, eth: 0, ada: 0,
    usd: 69.44, costBasis: 70.00,
    unrealizedPL: -0.56, realizedGains: 0, cash: 0,
    exchange: "iTrust",
    holdings: { BTC:0.00064293 },
  },
  {
    id: "daniel", name: "Daniel Sacrone", avatar: "DS",
    btc: 0.00057899, eth: 0, ada: 0,
    usd: 62.53, costBasis: 40.00,
    unrealizedPL: 22.53, realizedGains: 0, cash: 0,
    exchange: "Coinbase",
    holdings: { BTC:0.00057899 },
  },
  {
    id: "skylar", name: "Skylar Medina", avatar: "SK",
    btc: 0.02075958, eth: 0, ada: 0,
    usd: 2242.03, costBasis: 630.66,
    unrealizedPL: 1611.37, realizedGains: 0, cash: 0,
    exchange: "Kraken",
    holdings: { BTC:0.02075958 },
  },
  {
    id: "steven", name: "Steven Medina", avatar: "SM",
    btc: 0.04407096, eth: 0.068543, ada: 0,
    usd: 4940.83, costBasis: 5000.00,
    unrealizedPL: -59.17, realizedGains: 0, cash: 0,
    exchange: "Kraken",
    holdings: { BTC:0.04407096, ETH:0.068543, EOS:1.0, LTC:0.18783 },
  },
  {
    id: "jorge", name: "Jorge Medina", avatar: "JM",
    btc: 2.04478100, eth: 13.85, ada: 31917,
    usd: 276744.79, costBasis: 79969.08,
    unrealizedPL: 196775.71, realizedGains: 0, cash: 0,
    exchange: "Kraken",
    holdings: {
      BTC:2.04478100, ETH:13.85, ADA:31917, XRP:2981,
      LTC:65.91, TRX:4351, ETC:136.83, XMR:2.4974,
      LINK:79.94, SUPER:741.93, CRV:2683, ICP:219.74, THETA:3199,
      FIL:522.37, TFUEL:30094, BTG:5.65, DGB:86622, DOT:151.37,
      USDT:176.23, TMT:8309, ENS:21.79, ZIL:31090, QTUM:140.32,
      UTK:1713, VET:15564, BAT:1076, AMPL:109.08, NEO:40.24,
      SGB:65621, SHIB:15221515, ZRX:681.75, MANA:768.77, GALA:16213,
      DENT:32671, OMG:25.52, REEF:59973, XNO:74.78, XTZ:101.9,
      FET:213.14, TRUMP:8.8696, SAND:391.07, ICX:800.21, FLR:2661,
      LCC:6084, XRD:11377, STX:81.39, GZIL:2.613, HERO:34666,
      GAS:10.55, HEX:22517, KCS:1.8818, WAN:164.77, TKY:29843,
      NCASH:35523, IQ:4825, TDROP:9294, SXP:90, BAX:226367,
      AST:1454, ETHW:12.52, NEX:35.01, FTT:11.17, MELANIA:15,
      FLM:147, RDD:20634, BIX:232.97, KDA:20.51, BLOK:21841,
      USDC:0.1795, PLR:225,
    },
  },
];

// ─── TRANSACTIONS — 132 entries from all 8 CSV files ─────────────────────
const HARDCODED_TRANSACTIONS = [
  // ANSELI (21)
  {id:1,member:"anseli",coin:"ETH",type:"buy",qty:0.38270188,purchasePrice:1045.20,usdTotal:400.00,date:"2018-01-09",exchange:"Coinbase",fee:0},
  {id:2,member:"anseli",coin:"LTC",type:"buy",qty:0.18783,purchasePrice:0,usdTotal:0,date:"2018-09-13",exchange:"Transfer",fee:0},
  {id:3,member:"anseli",coin:"EOS",type:"buy",qty:1.0,purchasePrice:0,usdTotal:0,date:"2018-09-15",exchange:"Transfer",fee:0},
  {id:4,member:"anseli",coin:"BTC",type:"buy",qty:0.02314921,purchasePrice:8636.60,usdTotal:199.93,date:"2019-05-30",exchange:"Gemini",fee:0},
  {id:5,member:"anseli",coin:"BTC",type:"buy",qty:0.00588221,purchasePrice:8500.20,usdTotal:50.00,date:"2019-05-30",exchange:"Gemini",fee:0},
  {id:6,member:"anseli",coin:"BTC",type:"buy",qty:0.00613481,purchasePrice:8150.18,usdTotal:50.00,date:"2019-06-03",exchange:"Gemini",fee:0},
  {id:7,member:"anseli",coin:"BTC",type:"buy",qty:0.00584095,purchasePrice:8560.25,usdTotal:50.00,date:"2019-06-03",exchange:"Gemini",fee:0},
  {id:8,member:"anseli",coin:"BTC",type:"buy",qty:0.00629659,purchasePrice:7940.80,usdTotal:50.00,date:"2019-06-04",exchange:"Gemini",fee:0},
  {id:9,member:"anseli",coin:"BTC",type:"buy",qty:0.03814464,purchasePrice:7864.80,usdTotal:300.00,date:"2019-06-04",exchange:"Gemini",fee:0},
  {id:10,member:"anseli",coin:"ETH",type:"buy",qty:0.0660531,purchasePrice:184.81,usdTotal:12.21,date:"2020-03-12",exchange:"Coinbase",fee:0},
  {id:11,member:"anseli",coin:"LTC",type:"buy",qty:1.0310969,purchasePrice:46.39,usdTotal:47.83,date:"2020-03-12",exchange:"Gemini",fee:0},
  {id:12,member:"anseli",coin:"ZEC",type:"buy",qty:1.02680289,purchasePrice:38.82,usdTotal:39.86,date:"2020-03-12",exchange:"Gemini",fee:0},
  {id:13,member:"anseli",coin:"BTC",type:"buy",qty:0.00657845,purchasePrice:7574.07,usdTotal:49.83,date:"2020-03-12",exchange:"Gemini",fee:0},
  {id:14,member:"anseli",coin:"BTC",type:"buy",qty:0.00780467,purchasePrice:6384.08,usdTotal:49.83,date:"2020-03-12",exchange:"Gemini",fee:0},
  {id:15,member:"anseli",coin:"LTC",type:"buy",qty:0.7310095,purchasePrice:34.08,usdTotal:24.91,date:"2020-03-12",exchange:"Gemini",fee:0},
  {id:16,member:"anseli",coin:"LTC",type:"buy",qty:1.0163306,purchasePrice:39.22,usdTotal:39.86,date:"2020-03-28",exchange:"Gemini",fee:0},
  {id:17,member:"anseli",coin:"EOS",type:"buy",qty:34.0,purchasePrice:2.82,usdTotal:95.88,date:"2021-01-20",exchange:"Coinbase",fee:0},
  {id:18,member:"anseli",coin:"ZEC",type:"buy",qty:2.90021014,purchasePrice:103.08,usdTotal:298.95,date:"2021-01-20",exchange:"Gemini",fee:0},
  {id:19,member:"anseli",coin:"BAT",type:"buy",qty:713.85952738,purchasePrice:0.28,usdTotal:199.30,date:"2021-01-20",exchange:"Gemini",fee:0},
  {id:20,member:"anseli",coin:"ETH",type:"buy",qty:0.43105733,purchasePrice:1387.07,usdTotal:597.91,date:"2021-01-20",exchange:"Coinbase",fee:0},
  {id:21,member:"anseli",coin:"BTC",type:"buy",qty:0.02210712,purchasePrice:36061.23,usdTotal:797.21,date:"2021-01-20",exchange:"Gemini",fee:0},
  // EMILY (13)
  {id:22,member:"emily",coin:"BTC",type:"buy",qty:0.0015729,purchasePrice:0,usdTotal:0,date:"2018-08-31",exchange:"Transfer",fee:0},
  {id:23,member:"emily",coin:"ETH",type:"buy",qty:0.01706,purchasePrice:0,usdTotal:0,date:"2018-08-31",exchange:"Transfer",fee:0},
  {id:24,member:"emily",coin:"ETH",type:"buy",qty:0.05157,purchasePrice:0,usdTotal:0,date:"2018-09-08",exchange:"Transfer",fee:0},
  {id:25,member:"emily",coin:"LTC",type:"buy",qty:0.18433,purchasePrice:0,usdTotal:0,date:"2018-09-11",exchange:"Transfer",fee:0},
  {id:26,member:"emily",coin:"ETH",type:"buy",qty:0.02635,purchasePrice:3792.25,usdTotal:99.93,date:"2021-12-31",exchange:"iTrust",fee:0},
  {id:27,member:"emily",coin:"BTC",type:"buy",qty:0.00465,purchasePrice:42887.75,usdTotal:199.43,date:"2022-01-13",exchange:"Coinbase",fee:0},
  {id:28,member:"emily",coin:"ETH",type:"buy",qty:0.03125,purchasePrice:3200.00,usdTotal:100.00,date:"2022-01-14",exchange:"iTrust",fee:0},
  {id:29,member:"emily",coin:"ETH",type:"buy",qty:0.0943,purchasePrice:3180.00,usdTotal:299.87,date:"2022-01-17",exchange:"iTrust",fee:0},
  {id:30,member:"emily",coin:"ETH",type:"buy",qty:0.03415,purchasePrice:2924.28,usdTotal:99.86,date:"2022-01-21",exchange:"iTrust",fee:0},
  {id:31,member:"emily",coin:"ETH",type:"buy",qty:0.0409,purchasePrice:2442.72,usdTotal:99.91,date:"2022-01-22",exchange:"iTrust",fee:0},
  {id:32,member:"emily",coin:"ETH",type:"buy",qty:0.03225,purchasePrice:3114.60,usdTotal:100.45,date:"2022-02-07",exchange:"iTrust",fee:0},
  {id:33,member:"emily",coin:"ETH",type:"buy",qty:0.01705,purchasePrice:3072.37,usdTotal:52.38,date:"2022-02-16",exchange:"iTrust",fee:0},
  {id:34,member:"emily",coin:"BTC",type:"buy",qty:0.001105,purchasePrice:43665.27,usdTotal:48.25,date:"2022-02-16",exchange:"Coinbase",fee:0},
  // ITRUST (62)
  {id:35,member:"itrust",coin:"BTC",type:"buy",qty:0.26183415,purchasePrice:37808.67,usdTotal:9899.60,date:"2021-06-17",exchange:"iTrust",fee:99.00},
  {id:36,member:"itrust",coin:"BCH",type:"buy",qty:2.098,purchasePrice:589.66,usdTotal:1237.10,date:"2021-06-17",exchange:"iTrust",fee:12.37},
  {id:37,member:"itrust",coin:"ETH",type:"buy",qty:1.0588,purchasePrice:2337.17,usdTotal:2474.60,date:"2021-06-17",exchange:"iTrust",fee:24.75},
  {id:38,member:"itrust",coin:"BTC",type:"buy",qty:0.30397451,purchasePrice:32567.20,usdTotal:9899.60,date:"2021-06-21",exchange:"iTrust",fee:99.00},
  {id:39,member:"itrust",coin:"ADA",type:"buy",qty:1914.7832,purchasePrice:1.29,usdTotal:2474.60,date:"2021-06-21",exchange:"iTrust",fee:24.75},
  {id:40,member:"itrust",coin:"ETH",type:"buy",qty:1.2639,purchasePrice:1957.91,usdTotal:2474.60,date:"2021-06-21",exchange:"iTrust",fee:24.75},
  {id:41,member:"itrust",coin:"ETH",type:"buy",qty:1.0481,purchasePrice:1888.75,usdTotal:1979.60,date:"2021-06-21",exchange:"iTrust",fee:19.80},
  {id:42,member:"itrust",coin:"BTC",type:"buy",qty:0.1412616,purchasePrice:35038.54,usdTotal:4949.60,date:"2021-06-29",exchange:"iTrust",fee:49.99},
  {id:43,member:"itrust",coin:"BTC",type:"buy",qty:0.04553554,purchasePrice:32603.10,usdTotal:1484.60,date:"2021-07-13",exchange:"Coinbase",fee:14.85},
  {id:44,member:"itrust",coin:"ADA",type:"buy",qty:767.6509,purchasePrice:1.29,usdTotal:989.60,date:"2021-07-13",exchange:"Coinbase",fee:9.90},
  {id:45,member:"itrust",coin:"ADA",type:"buy",qty:743.8415,purchasePrice:1.06,usdTotal:791.60,date:"2021-07-20",exchange:"Coinbase",fee:7.91},
  {id:46,member:"itrust",coin:"BTC",type:"buy",qty:0.06667826,purchasePrice:29688.84,usdTotal:1979.60,date:"2021-07-20",exchange:"Coinbase",fee:19.79},
  {id:47,member:"itrust",coin:"DOT",type:"buy",qty:108.52,purchasePrice:18.24,usdTotal:1979.60,date:"2021-08-02",exchange:"iTrust",fee:19.79},
  {id:48,member:"itrust",coin:"ETH",type:"sell",qty:1.0,purchasePrice:3238.07,usdTotal:3238.07,date:"2021-08-11",exchange:"iTrust",fee:32.38},
  {id:49,member:"itrust",coin:"BTC",type:"sell",qty:0.065,purchasePrice:46272.82,usdTotal:3007.73,date:"2021-08-11",exchange:"Coinbase",fee:30.07},
  {id:50,member:"itrust",coin:"ADA",type:"sell",qty:1400.0,purchasePrice:2.91,usdTotal:4070.81,date:"2021-08-23",exchange:"Bittrex",fee:40.70},
  {id:51,member:"itrust",coin:"BTC",type:"sell",qty:0.12,purchasePrice:49452.65,usdTotal:5934.32,date:"2021-08-23",exchange:"Coinbase",fee:0},
  {id:52,member:"itrust",coin:"ADA",type:"buy",qty:1015.3083,purchasePrice:2.53,usdTotal:2573.60,date:"2021-08-26",exchange:"Coinbase",fee:25.73},
  {id:53,member:"itrust",coin:"ETH",type:"buy",qty:1.11024954,purchasePrice:3120.92,usdTotal:3465.00,date:"2021-08-26",exchange:"iTrust",fee:34.65},
  {id:54,member:"itrust",coin:"BTC",type:"buy",qty:0.10505086,purchasePrice:47116.23,usdTotal:4949.60,date:"2021-08-26",exchange:"Coinbase",fee:0},
  {id:55,member:"itrust",coin:"ETH",type:"buy",qty:0.72651165,purchasePrice:3406.69,usdTotal:2475.00,date:"2021-08-31",exchange:"iTrust",fee:24.75},
  {id:56,member:"itrust",coin:"ADA",type:"buy",qty:887.7801,purchasePrice:2.79,usdTotal:2474.60,date:"2021-08-31",exchange:"Coinbase",fee:24.74},
  {id:57,member:"itrust",coin:"BTC",type:"buy",qty:0.02110521,purchasePrice:46888.90,usdTotal:989.60,date:"2021-09-01",exchange:"Coinbase",fee:9.98},
  {id:58,member:"itrust",coin:"CRV",type:"buy",qty:442.83348995,purchasePrice:2.23,usdTotal:989.60,date:"2021-09-03",exchange:"iTrust",fee:9.89},
  {id:59,member:"itrust",coin:"ADA",type:"buy",qty:202.9856,purchasePrice:2.43,usdTotal:493.26,date:"2021-09-07",exchange:"Coinbase",fee:4.94},
  {id:60,member:"itrust",coin:"DOT",type:"buy",qty:14.1113,purchasePrice:28.03,usdTotal:395.60,date:"2021-09-09",exchange:"iTrust",fee:3.95},
  {id:61,member:"itrust",coin:"ALGO",type:"buy",qty:103.373863,purchasePrice:2.15,usdTotal:222.75,date:"2021-09-14",exchange:"Coinbase",fee:0},
  {id:62,member:"itrust",coin:"BTC",type:"sell",qty:0.0156,purchasePrice:65326.38,usdTotal:1019.09,date:"2021-11-08",exchange:"Coinbase",fee:103.85},
  {id:63,member:"itrust",coin:"ALGO",type:"buy",qty:501.01214574,purchasePrice:1.98,usdTotal:990.00,date:"2021-11-08",exchange:"Coinbase",fee:1.99},
  {id:64,member:"itrust",coin:"BTC",type:"sell",qty:0.049,purchasePrice:41687.41,usdTotal:2042.68,date:"2022-02-06",exchange:"Coinbase",fee:20.43},
  {id:65,member:"itrust",coin:"ETH",type:"sell",qty:1.0,purchasePrice:3016.28,usdTotal:3016.28,date:"2022-02-06",exchange:"iTrust",fee:30.16},
  {id:66,member:"itrust",coin:"BTC",type:"sell",qty:0.05,purchasePrice:44164.77,usdTotal:2208.24,date:"2022-02-07",exchange:"Coinbase",fee:22.08},
  {id:67,member:"itrust",coin:"ALGO",type:"buy",qty:497.967,purchasePrice:0.98,usdTotal:490.05,date:"2022-02-17",exchange:"Coinbase",fee:0.99},
  {id:68,member:"itrust",coin:"ETH",type:"buy",qty:1.0262,purchasePrice:2893.78,usdTotal:2969.60,date:"2022-02-18",exchange:"iTrust",fee:29.70},
  {id:69,member:"itrust",coin:"BTC",type:"buy",qty:0.07294891,purchasePrice:40707.94,usdTotal:2969.60,date:"2022-02-18",exchange:"Coinbase",fee:29.70},
  {id:70,member:"itrust",coin:"ETH",type:"buy",qty:0.1093,purchasePrice:2713.63,usdTotal:296.60,date:"2022-02-19",exchange:"iTrust",fee:2.97},
  {id:71,member:"itrust",coin:"BTC",type:"buy",qty:0.01,purchasePrice:38354.03,usdTotal:383.54,date:"2022-02-20",exchange:"Coinbase",fee:3.91},
  {id:72,member:"itrust",coin:"BTC",type:"sell",qty:0.07,purchasePrice:30550.71,usdTotal:2138.55,date:"2023-04-14",exchange:"iTrust",fee:21.39},
  {id:73,member:"itrust",coin:"ETH",type:"sell",qty:1.0,purchasePrice:2047.21,usdTotal:2047.21,date:"2023-04-14",exchange:"Gemini",fee:20.47},
  {id:74,member:"itrust",coin:"ALGO",type:"sell",qty:1102.35300874,purchasePrice:0.17,usdTotal:182.44,date:"2023-05-18",exchange:"Coinbase",fee:0},
  {id:75,member:"itrust",coin:"CRV",type:"buy",qty:238.68,purchasePrice:0.83,usdTotal:198.00,date:"2023-05-18",exchange:"Gemini",fee:0},
  {id:76,member:"itrust",coin:"ALGO",type:"buy",qty:1296.213,purchasePrice:0.11,usdTotal:142.56,date:"2023-06-11",exchange:"Coinbase",fee:0},
  {id:77,member:"itrust",coin:"BTC",type:"buy",qty:0.0078814,purchasePrice:25122.00,usdTotal:198.00,date:"2023-06-15",exchange:"iTrust",fee:2.00},
  {id:78,member:"itrust",coin:"BTC",type:"buy",qty:0.01894957,purchasePrice:26121.96,usdTotal:495.00,date:"2023-08-17",exchange:"Kraken",fee:5.00},
  {id:79,member:"itrust",coin:"BCH",type:"buy",qty:1.073423,purchasePrice:184.45,usdTotal:197.99,date:"2023-08-17",exchange:"iTrust",fee:2.00},
  {id:80,member:"itrust",coin:"BTC",type:"buy",qty:0.009504,purchasePrice:26041.66,usdTotal:247.50,date:"2023-08-18",exchange:"Kraken",fee:2.50},
  {id:81,member:"itrust",coin:"ALGO",type:"buy",qty:1270.929,purchasePrice:0.09,usdTotal:114.38,date:"2023-08-24",exchange:"Coinbase",fee:1.25},
  {id:82,member:"itrust",coin:"CRV",type:"buy",qty:217.70694997,purchasePrice:0.45,usdTotal:98.34,date:"2023-08-24",exchange:"Gemini",fee:1.00},
  {id:83,member:"itrust",coin:"BTC",type:"sell",qty:0.09,purchasePrice:56835.00,usdTotal:5115.15,date:"2024-03-02",exchange:"Kraken",fee:51.15},
  {id:84,member:"itrust",coin:"BTC",type:"buy",qty:0.05897242,purchasePrice:67525.07,usdTotal:3982.12,date:"2024-03-15",exchange:"Kraken",fee:40.22},
  {id:85,member:"itrust",coin:"ETH",type:"buy",qty:0.26970076,purchasePrice:3670.73,usdTotal:990.00,date:"2024-03-15",exchange:"Kraken",fee:10.00},
  {id:86,member:"itrust",coin:"XLM",type:"buy",qty:3707.22,purchasePrice:0.13,usdTotal:495.00,date:"2024-03-15",exchange:"iTrust",fee:5.00},
  {id:87,member:"itrust",coin:"SOL",type:"buy",qty:3.1808992,purchasePrice:171.18,usdTotal:544.50,date:"2024-03-15",exchange:"iTrust",fee:5.50},
  {id:88,member:"itrust",coin:"ETH",type:"buy",qty:0.83088066,purchasePrice:3289.00,usdTotal:2732.77,date:"2024-11-12",exchange:"Kraken",fee:27.60},
  {id:89,member:"itrust",coin:"BCH",type:"sell",qty:3.171423,purchasePrice:427.85,usdTotal:1356.89,date:"2025-05-10",exchange:"iTrust",fee:0},
  {id:90,member:"itrust",coin:"XLM",type:"sell",qty:1600.0,purchasePrice:0.31,usdTotal:502.40,date:"2025-05-10",exchange:"iTrust",fee:0},
  {id:91,member:"itrust",coin:"ETH",type:"buy",qty:0.69538407,purchasePrice:2598.54,usdTotal:1806.98,date:"2025-05-10",exchange:"Kraken",fee:18.25},
  {id:92,member:"itrust",coin:"BTC",type:"buy",qty:0.04825189,purchasePrice:105900.00,usdTotal:5109.88,date:"2025-06-07",exchange:"iTrust",fee:51.61},
  {id:93,member:"itrust",coin:"BTC",type:"buy",qty:0.04699187,purchasePrice:103425.00,usdTotal:4860.13,date:"2025-06-20",exchange:"iTrust",fee:49.09},
  {id:94,member:"itrust",coin:"BTC",type:"buy",qty:0.09276232,purchasePrice:108858.86,usdTotal:10098.00,date:"2025-08-29",exchange:"iTrust",fee:102.00},
  {id:95,member:"itrust",coin:"ETH",type:"sell",qty:2.0,purchasePrice:4419.32,usdTotal:8838.64,date:"2025-09-01",exchange:"Kraken",fee:88.38},
  {id:96,member:"itrust",coin:"BTC",type:"buy",qty:0.08430467,purchasePrice:117431.22,usdTotal:9900.00,date:"2025-10-10",exchange:"iTrust",fee:100.00},
  // MARCOS (8)
  {id:97,member:"marcos",coin:"EOS",type:"buy",qty:5.0,purchasePrice:0,usdTotal:0,date:"2019-08-28",exchange:"Transfer",fee:0},
  {id:98,member:"marcos",coin:"ADA",type:"buy",qty:500.0,purchasePrice:0,usdTotal:0,date:"2019-08-28",exchange:"Transfer",fee:0},
  {id:99,member:"marcos",coin:"BTC",type:"buy",qty:0.00209111,purchasePrice:9740.00,usdTotal:20.38,date:"2019-08-28",exchange:"Transfer",fee:0},
  {id:100,member:"marcos",coin:"ETH",type:"buy",qty:0.1091685,purchasePrice:0,usdTotal:0,date:"2019-08-28",exchange:"Transfer",fee:0},
  {id:101,member:"marcos",coin:"LTC",type:"buy",qty:0.31831589,purchasePrice:0,usdTotal:0,date:"2019-08-28",exchange:"Transfer",fee:0},
  {id:102,member:"marcos",coin:"ETC",type:"buy",qty:2.0,purchasePrice:0,usdTotal:0,date:"2019-08-28",exchange:"Transfer",fee:0},
  {id:103,member:"marcos",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0,usdTotal:0,date:"2019-08-28",exchange:"Transfer",fee:0},
  {id:104,member:"marcos",coin:"ADA",type:"buy",qty:33.549524,purchasePrice:0,usdTotal:0,date:"2021-02-09",exchange:"Staking",fee:0},
  // MELANIE (18)
  {id:105,member:"melanie",coin:"BTC",type:"buy",qty:0.0015748,purchasePrice:0,usdTotal:0,date:"2018-08-31",exchange:"Transfer",fee:0},
  {id:106,member:"melanie",coin:"ETH",type:"buy",qty:0.017077,purchasePrice:0,usdTotal:0,date:"2018-08-31",exchange:"Transfer",fee:0},
  {id:107,member:"melanie",coin:"ETH",type:"buy",qty:0.05157,purchasePrice:0,usdTotal:0,date:"2018-09-08",exchange:"Transfer",fee:0},
  {id:108,member:"melanie",coin:"LTC",type:"buy",qty:0.18413,purchasePrice:0,usdTotal:0,date:"2018-09-11",exchange:"Transfer",fee:0},
  {id:109,member:"melanie",coin:"EOS",type:"buy",qty:1.0,purchasePrice:0,usdTotal:0,date:"2018-09-28",exchange:"Transfer",fee:0},
  {id:110,member:"melanie",coin:"IQ",type:"buy",qty:561.361,purchasePrice:0,usdTotal:0,date:"2018-10-20",exchange:"BigONE",fee:0},
  {id:111,member:"melanie",coin:"BTC",type:"buy",qty:0.00333874,purchasePrice:58701.79,usdTotal:195.99,date:"2021-05-09",exchange:"Coinbase",fee:0},
  {id:112,member:"melanie",coin:"DGB",type:"buy",qty:1324.60892804,purchasePrice:0,usdTotal:0,date:"2021-05-09",exchange:"Bittrex",fee:0},
  {id:113,member:"melanie",coin:"ETH",type:"buy",qty:0.02635,purchasePrice:3792.25,usdTotal:99.93,date:"2021-12-31",exchange:"iTrust",fee:0},
  {id:114,member:"melanie",coin:"BTC",type:"buy",qty:0.00465,purchasePrice:42887.75,usdTotal:199.43,date:"2022-01-13",exchange:"Coinbase",fee:0},
  {id:115,member:"melanie",coin:"ETH",type:"buy",qty:0.03125,purchasePrice:3200.00,usdTotal:100.00,date:"2022-01-14",exchange:"iTrust",fee:0},
  {id:116,member:"melanie",coin:"ETH",type:"buy",qty:0.0943,purchasePrice:3180.00,usdTotal:299.87,date:"2022-01-17",exchange:"iTrust",fee:0},
  {id:117,member:"melanie",coin:"ETH",type:"buy",qty:0.03415,purchasePrice:2924.28,usdTotal:99.86,date:"2022-01-21",exchange:"iTrust",fee:0},
  {id:118,member:"melanie",coin:"ETH",type:"buy",qty:0.0409,purchasePrice:2442.72,usdTotal:99.91,date:"2022-01-22",exchange:"iTrust",fee:0},
  {id:119,member:"melanie",coin:"ETH",type:"buy",qty:0.03225,purchasePrice:3114.60,usdTotal:100.45,date:"2022-02-07",exchange:"iTrust",fee:0},
  {id:120,member:"melanie",coin:"ETH",type:"buy",qty:0.01705,purchasePrice:3072.37,usdTotal:52.38,date:"2022-02-16",exchange:"iTrust",fee:0},
  {id:121,member:"melanie",coin:"BTC",type:"buy",qty:0.001105,purchasePrice:43665.27,usdTotal:48.25,date:"2022-02-16",exchange:"Coinbase",fee:0},
  {id:122,member:"melanie",coin:"BTC",type:"buy",qty:0.007472,purchasePrice:119970.00,usdTotal:896.42,date:"2025-07-14",exchange:"Kraken",fee:1.43},
  // MICHAEL (1)
  {id:123,member:"michael",coin:"BTC",type:"buy",qty:0.00041941,purchasePrice:119214.50,usdTotal:50.00,date:"2025-07-22",exchange:"iTrust",fee:0.17},
  {id:1061,member:"michael",coin:"BTC",type:"buy",qty:0.00022352,purchasePrice:85046.00,usdTotal:20.00,date:"2025-11-22",exchange:"iTrust",fee:0},
  // SKYLAR (3)
  {id:124,member:"skylar",coin:"BTC",type:"buy",qty:0.00079663,purchasePrice:31195.15,usdTotal:24.85,date:"2023-07-14",exchange:"iTrust",fee:0},
  {id:125,member:"skylar",coin:"BTC",type:"buy",qty:0.01912868,purchasePrice:30366.00,usdTotal:580.81,date:"2023-07-14",exchange:"Transfer",fee:0},
  {id:126,member:"skylar",coin:"BTC",type:"buy",qty:0.00083427,purchasePrice:29294.93,usdTotal:24.44,date:"2023-07-29",exchange:"Kraken",fee:0.56},
  // STEVEN (6)
  {id:127,member:"steven",coin:"BTC",type:"buy",qty:0.0015748,purchasePrice:0,usdTotal:0,date:"2018-08-31",exchange:"Transfer",fee:0},
  {id:128,member:"steven",coin:"ETH",type:"buy",qty:0.016973,purchasePrice:0,usdTotal:0,date:"2018-08-31",exchange:"Transfer",fee:0},
  {id:129,member:"steven",coin:"EOS",type:"buy",qty:1.0,purchasePrice:0,usdTotal:0,date:"2018-08-31",exchange:"Transfer",fee:0},
  {id:130,member:"steven",coin:"ETH",type:"buy",qty:0.05157,purchasePrice:0,usdTotal:0,date:"2018-09-08",exchange:"Transfer",fee:0},
  {id:131,member:"steven",coin:"LTC",type:"buy",qty:0.18783,purchasePrice:0,usdTotal:0,date:"2018-09-13",exchange:"Transfer",fee:0},
  {id:132,member:"steven",coin:"BTC",type:"buy",qty:0.04249616,purchasePrice:117657.68,usdTotal:5000.00,date:"2025-07-18",exchange:"Kraken",fee:0},
  // JORGE (4)
  {id:133,member:"jorge",coin:"BTC",type:"buy",qty:1.981152,purchasePrice:16362.00,usdTotal:32401.51,date:"2021-01-01",exchange:"Kraken",fee:0},
  {id:134,member:"jorge",coin:"BTC",type:"buy",qty:0.000891,purchasePrice:115864.00,usdTotal:103.23,date:"2025-07-31",exchange:"Kraken",fee:0},
  {id:135,member:"jorge",coin:"BTC",type:"buy",qty:0.040902,purchasePrice:109169.00,usdTotal:4466.47,date:"2025-08-31",exchange:"Kraken",fee:0},
  {id:136,member:"jorge",coin:"BTC",type:"buy",qty:0.021836,purchasePrice:114490.00,usdTotal:2499.97,date:"2025-10-12",exchange:"Kraken",fee:0},
  // JORGE ALTS (923 transactions)
  {id:137,member:"jorge",coin:"LTC",type:"buy",qty:1.0,purchasePrice:268.79,usdTotal:268.79,date:"2017-12-25",exchange:"Coinbase",fee:0},
  {id:138,member:"jorge",coin:"ETH",type:"buy",qty:1.0,purchasePrice:1045.2,usdTotal:1045.2,date:"2018-01-10",exchange:"Coinbase",fee:0},
  {id:139,member:"jorge",coin:"LTC",type:"buy",qty:1.0,purchasePrice:166.83,usdTotal:166.83,date:"2018-01-18",exchange:"Coinbase",fee:0},
  {id:140,member:"jorge",coin:"ETH",type:"buy",qty:0.11662389,purchasePrice:917.57,usdTotal:107.01,date:"2018-02-15",exchange:"Coinbase",fee:0},
  {id:141,member:"jorge",coin:"LTC",type:"buy",qty:0.07948004,purchasePrice:232.89,usdTotal:18.51,date:"2018-02-17",exchange:"Coinbase",fee:0},
  {id:142,member:"jorge",coin:"ADA",type:"buy",qty:81.0,purchasePrice:0.2478,usdTotal:20.07,date:"2018-02-18",exchange:"Binance",fee:0},
  {id:143,member:"jorge",coin:"ADA",type:"buy",qty:82.0,purchasePrice:0.2496,usdTotal:20.47,date:"2018-02-19",exchange:"Binance",fee:0},
  {id:144,member:"jorge",coin:"ADA",type:"buy",qty:137.0,purchasePrice:0.2383,usdTotal:32.65,date:"2018-02-20",exchange:"Binance",fee:0},
  {id:145,member:"jorge",coin:"ADA",type:"buy",qty:83.0,purchasePrice:0.2167,usdTotal:17.99,date:"2018-02-25",exchange:"Binance",fee:0},
  {id:146,member:"jorge",coin:"ADA",type:"buy",qty:183.0,purchasePrice:0.2118,usdTotal:38.76,date:"2018-03-02",exchange:"Binance",fee:0},
  {id:147,member:"jorge",coin:"LTC",type:"buy",qty:0.23656379,purchasePrice:211.4,usdTotal:50.01,date:"2018-03-04",exchange:"Coinbase",fee:0},
  {id:148,member:"jorge",coin:"LTC",type:"buy",qty:0.15481271,purchasePrice:200.31,usdTotal:31.01,date:"2018-03-07",exchange:"Coinbase",fee:0},
  {id:149,member:"jorge",coin:"ADA",type:"buy",qty:112.0,purchasePrice:0.2041,usdTotal:22.86,date:"2018-03-08",exchange:"Binance",fee:0},
  {id:150,member:"jorge",coin:"LTC",type:"buy",qty:0.13000725,purchasePrice:188.53,usdTotal:24.51,date:"2018-03-08",exchange:"Coinbase",fee:0},
  {id:151,member:"jorge",coin:"ADA",type:"buy",qty:111.0,purchasePrice:0.1922,usdTotal:21.33,date:"2018-03-09",exchange:"Binance",fee:0},
  {id:152,member:"jorge",coin:"LTC",type:"buy",qty:0.12522368,purchasePrice:187.74,usdTotal:23.51,date:"2018-03-10",exchange:"Coinbase",fee:0},
  {id:153,member:"jorge",coin:"LTC",type:"buy",qty:0.13980659,purchasePrice:178.89,usdTotal:25.01,date:"2018-03-11",exchange:"Coinbase",fee:0},
  {id:154,member:"jorge",coin:"LTC",type:"buy",qty:0.10458779,purchasePrice:176.98,usdTotal:18.51,date:"2018-03-11",exchange:"Coinbase",fee:0},
  {id:155,member:"jorge",coin:"ADA",type:"buy",qty:164.0,purchasePrice:0.1794,usdTotal:29.42,date:"2018-03-15",exchange:"Binance",fee:0},
  {id:156,member:"jorge",coin:"LTC",type:"buy",qty:0.14139036,purchasePrice:166.28,usdTotal:23.51,date:"2018-03-16",exchange:"Coinbase",fee:0},
  {id:157,member:"jorge",coin:"LTC",type:"buy",qty:0.28854279,purchasePrice:166.39,usdTotal:48.01,date:"2018-03-16",exchange:"Coinbase",fee:0},
  {id:158,member:"jorge",coin:"ADA",type:"buy",qty:144.0,purchasePrice:0.1758,usdTotal:25.32,date:"2018-03-16",exchange:"Binance",fee:0},
  {id:159,member:"jorge",coin:"LTC",type:"buy",qty:0.1491237,purchasePrice:157.65,usdTotal:23.51,date:"2018-03-18",exchange:"Coinbase",fee:0},
  {id:160,member:"jorge",coin:"ADA",type:"buy",qty:212.0,purchasePrice:0.1597,usdTotal:33.85,date:"2018-03-18",exchange:"Binance",fee:0},
  {id:161,member:"jorge",coin:"EOS",type:"buy",qty:12.97,purchasePrice:6.4803,usdTotal:84.05,date:"2018-03-21",exchange:"Binance",fee:0},
  {id:162,member:"jorge",coin:"LTC",type:"buy",qty:0.19405513,purchasePrice:170.11,usdTotal:33.01,date:"2018-03-22",exchange:"Coinbase",fee:0},
  {id:163,member:"jorge",coin:"LTC",type:"buy",qty:0.29780652,purchasePrice:161.21,usdTotal:48.01,date:"2018-03-24",exchange:"Coinbase",fee:0},
  {id:164,member:"jorge",coin:"EOS",type:"buy",qty:6.93,purchasePrice:7.6017,usdTotal:52.68,date:"2018-03-25",exchange:"Binance",fee:0},
  {id:165,member:"jorge",coin:"EOS",type:"buy",qty:5.43,purchasePrice:7.6022,usdTotal:41.28,date:"2018-03-25",exchange:"Binance",fee:0},
  {id:166,member:"jorge",coin:"ADA",type:"buy",qty:183.0,purchasePrice:0.2112,usdTotal:38.65,date:"2018-03-25",exchange:"Binance",fee:0},
  {id:167,member:"jorge",coin:"ADA",type:"buy",qty:199.0,purchasePrice:0.2109,usdTotal:41.97,date:"2018-03-25",exchange:"Binance",fee:0},
  {id:168,member:"jorge",coin:"EOS",type:"buy",qty:8.72,purchasePrice:7.32,usdTotal:63.83,date:"2018-03-26",exchange:"Binance",fee:0},
  {id:169,member:"jorge",coin:"ADA",type:"buy",qty:150.0,purchasePrice:0.198,usdTotal:29.7,date:"2018-03-26",exchange:"Binance",fee:0},
  {id:170,member:"jorge",coin:"LTC",type:"buy",qty:0.33805919,purchasePrice:142.02,usdTotal:48.01,date:"2018-03-27",exchange:"Coinbase",fee:0},
  {id:171,member:"jorge",coin:"LTC",type:"buy",qty:0.27341065,purchasePrice:139.02,usdTotal:38.01,date:"2018-03-27",exchange:"Coinbase",fee:0},
  {id:172,member:"jorge",coin:"LTC",type:"buy",qty:0.40354067,purchasePrice:118.97,usdTotal:48.01,date:"2018-03-29",exchange:"Coinbase",fee:0},
  {id:173,member:"jorge",coin:"LTC",type:"buy",qty:0.66766039,purchasePrice:115.22,usdTotal:76.93,date:"2018-03-29",exchange:"Coinbase",fee:0},
  {id:174,member:"jorge",coin:"LTC",type:"buy",qty:0.21025557,purchasePrice:111.82,usdTotal:23.51,date:"2018-04-01",exchange:"Coinbase",fee:0},
  {id:175,member:"jorge",coin:"ETH",type:"buy",qty:0.1870998,purchasePrice:384.87,usdTotal:72.01,date:"2018-04-02",exchange:"Coinbase",fee:0},
  {id:176,member:"jorge",coin:"ETH",type:"buy",qty:0.13553062,purchasePrice:376.37,usdTotal:51.01,date:"2018-04-02",exchange:"Coinbase",fee:0},
  {id:177,member:"jorge",coin:"EOS",type:"buy",qty:5.11,purchasePrice:8.8532,usdTotal:45.24,date:"2018-04-02",exchange:"Binance",fee:0},
  {id:178,member:"jorge",coin:"EOS",type:"buy",qty:7.0,purchasePrice:8.6514,usdTotal:60.56,date:"2018-04-02",exchange:"Binance",fee:0},
  {id:179,member:"jorge",coin:"ETH",type:"buy",qty:0.24969595,purchasePrice:404.37,usdTotal:100.97,date:"2018-04-04",exchange:"Coinbase",fee:0},
  {id:180,member:"jorge",coin:"EOS",type:"buy",qty:4.53,purchasePrice:8.8322,usdTotal:40.01,date:"2018-04-04",exchange:"Binance",fee:0},
  {id:181,member:"jorge",coin:"ETH",type:"buy",qty:0.19010305,purchasePrice:378.79,usdTotal:72.01,date:"2018-04-05",exchange:"Coinbase",fee:0},
  {id:182,member:"jorge",coin:"LTC",type:"buy",qty:0.43419116,purchasePrice:119.79,usdTotal:52.01,date:"2018-04-05",exchange:"Coinbase",fee:0},
  {id:183,member:"jorge",coin:"EOS",type:"buy",qty:6.02,purchasePrice:8.8738,usdTotal:53.42,date:"2018-04-06",exchange:"Binance",fee:0},
  {id:184,member:"jorge",coin:"LTC",type:"buy",qty:1.0,purchasePrice:115.21,usdTotal:115.21,date:"2018-04-06",exchange:"Coinbase",fee:0},
  {id:185,member:"jorge",coin:"ADA",type:"buy",qty:104.0,purchasePrice:0.231,usdTotal:24.02,date:"2018-04-06",exchange:"Binance",fee:0},
  {id:186,member:"jorge",coin:"ETH",type:"buy",qty:0.2709352,purchasePrice:369.17,usdTotal:100.02,date:"2018-04-07",exchange:"Coinbase",fee:0},
  {id:187,member:"jorge",coin:"XRP",type:"buy",qty:100.0,purchasePrice:0.7581,usdTotal:75.81,date:"2018-04-07",exchange:"Binance",fee:0},
  {id:188,member:"jorge",coin:"ZEC",type:"buy",qty:1.0,purchasePrice:285.6,usdTotal:285.6,date:"2018-04-07",exchange:"Binance",fee:0},
  {id:189,member:"jorge",coin:"LTC",type:"buy",qty:0.21103776,purchasePrice:118.51,usdTotal:25.01,date:"2018-04-07",exchange:"Coinbase",fee:0},
  {id:190,member:"jorge",coin:"ADA",type:"buy",qty:272.0,purchasePrice:0.2301,usdTotal:62.59,date:"2018-04-07",exchange:"Binance",fee:0},
  {id:191,member:"jorge",coin:"XRP",type:"buy",qty:100.0,purchasePrice:0.7575,usdTotal:75.75,date:"2018-04-08",exchange:"Binance",fee:0},
  {id:192,member:"jorge",coin:"XRP",type:"buy",qty:33.0,purchasePrice:0.7548,usdTotal:24.91,date:"2018-04-08",exchange:"Binance",fee:0},
  {id:193,member:"jorge",coin:"XRP",type:"buy",qty:13.0,purchasePrice:0.7523,usdTotal:9.78,date:"2018-04-08",exchange:"Binance",fee:0},
  {id:194,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:9.21,usdTotal:92.1,date:"2018-04-08",exchange:"Binance",fee:0},
  {id:195,member:"jorge",coin:"ADA",type:"buy",qty:223.0,purchasePrice:0.2319,usdTotal:51.71,date:"2018-04-08",exchange:"Binance",fee:0},
  {id:196,member:"jorge",coin:"XRP",type:"buy",qty:197.0,purchasePrice:0.7464,usdTotal:147.04,date:"2018-04-09",exchange:"Binance",fee:0},
  {id:197,member:"jorge",coin:"EOS",type:"buy",qty:6.88,purchasePrice:8.9404,usdTotal:61.51,date:"2018-04-09",exchange:"Binance",fee:0},
  {id:198,member:"jorge",coin:"LTC",type:"buy",qty:0.39530659,purchasePrice:126.51,usdTotal:50.01,date:"2018-04-14",exchange:"Coinbase",fee:0},
  {id:199,member:"jorge",coin:"ADA",type:"buy",qty:471.528,purchasePrice:0.243,usdTotal:114.58,date:"2018-04-14",exchange:"Binance",fee:0},
  {id:200,member:"jorge",coin:"EOS",type:"buy",qty:12.82,purchasePrice:9.78,usdTotal:125.38,date:"2018-04-15",exchange:"Binance",fee:0},
  {id:201,member:"jorge",coin:"ADA",type:"buy",qty:224.0,purchasePrice:0.2532,usdTotal:56.72,date:"2018-04-16",exchange:"Binance",fee:0},
  {id:202,member:"jorge",coin:"LTC",type:"buy",qty:0.99502488,purchasePrice:132.4,usdTotal:131.74,date:"2018-04-16",exchange:"Coinbase",fee:0},
  {id:203,member:"jorge",coin:"EOS",type:"buy",qty:5.94,purchasePrice:9.4562,usdTotal:56.17,date:"2018-04-16",exchange:"Binance",fee:0},
  {id:204,member:"jorge",coin:"EOS",type:"buy",qty:8.88,purchasePrice:9.4505,usdTotal:83.92,date:"2018-04-16",exchange:"Binance",fee:0},
  {id:205,member:"jorge",coin:"LTC",type:"buy",qty:0.46149209,purchasePrice:134.37,usdTotal:62.01,date:"2018-04-17",exchange:"Coinbase",fee:0},
  {id:206,member:"jorge",coin:"ADA",type:"buy",qty:398.0,purchasePrice:0.294,usdTotal:117.01,date:"2018-04-19",exchange:"Binance",fee:0},
  {id:207,member:"jorge",coin:"ADA",type:"buy",qty:44.0,purchasePrice:0.2861,usdTotal:12.59,date:"2018-04-19",exchange:"Binance",fee:0},
  {id:208,member:"jorge",coin:"EOS",type:"buy",qty:4.01,purchasePrice:10.591,usdTotal:42.47,date:"2018-04-21",exchange:"Binance",fee:0},
  {id:209,member:"jorge",coin:"ETH",type:"buy",qty:0.12749682,purchasePrice:604.02,usdTotal:77.01,date:"2018-04-21",exchange:"Coinbase",fee:0},
  {id:210,member:"jorge",coin:"LTC",type:"buy",qty:0.40971211,purchasePrice:146.47,usdTotal:60.01,date:"2018-04-26",exchange:"Coinbase",fee:0},
  {id:211,member:"jorge",coin:"LTC",type:"buy",qty:2.0587,purchasePrice:145.74,usdTotal:300.03,date:"2018-04-28",exchange:"Coinbase",fee:0},
  {id:212,member:"jorge",coin:"ETH",type:"buy",qty:0.78685757,purchasePrice:648.95,usdTotal:510.63,date:"2018-04-28",exchange:"Coinbase",fee:0},
  {id:213,member:"jorge",coin:"ETH",type:"sell",qty:0.07416,purchasePrice:669.77,usdTotal:49.67,date:"2018-04-28",exchange:"DGA",fee:0},
  {id:214,member:"jorge",coin:"ETH",type:"sell",qty:0.1102,purchasePrice:683.12,usdTotal:75.28,date:"2018-04-28",exchange:"DGA",fee:0},
  {id:215,member:"jorge",coin:"ETH",type:"buy",qty:0.23204195,purchasePrice:692.07,usdTotal:160.59,date:"2018-04-28",exchange:"Unknown",fee:0},
  {id:216,member:"jorge",coin:"ADA",type:"buy",qty:290.0,purchasePrice:0.2898,usdTotal:84.04,date:"2018-04-28",exchange:"Binance",fee:0},
  {id:217,member:"jorge",coin:"ETH",type:"sell",qty:0.14007,purchasePrice:690.23,usdTotal:96.68,date:"2018-04-28",exchange:"DGA",fee:0},
  {id:218,member:"jorge",coin:"ETH",type:"sell",qty:0.069,purchasePrice:691.3,usdTotal:47.7,date:"2018-04-28",exchange:"DGA",fee:0},
  {id:219,member:"jorge",coin:"ETH",type:"sell",qty:0.0737536,purchasePrice:682.54,usdTotal:50.34,date:"2018-04-28",exchange:"DGA",fee:0},
  {id:220,member:"jorge",coin:"ETH",type:"sell",qty:0.07043269,purchasePrice:685.05,usdTotal:48.25,date:"2018-04-28",exchange:"DGA",fee:0},
  {id:221,member:"jorge",coin:"ETH",type:"buy",qty:0.28934872,purchasePrice:697.91,usdTotal:201.94,date:"2018-04-29",exchange:"Unknown",fee:0},
  {id:222,member:"jorge",coin:"ETH",type:"sell",qty:0.28954096,purchasePrice:693.82,usdTotal:200.89,date:"2018-04-29",exchange:"DGA",fee:0},
  {id:223,member:"jorge",coin:"EOS",type:"sell",qty:4.0,purchasePrice:16.86,usdTotal:67.44,date:"2018-04-29",exchange:"Binance",fee:0},
  {id:224,member:"jorge",coin:"ETH",type:"buy",qty:0.1124,purchasePrice:679.18,usdTotal:76.34,date:"2018-04-29",exchange:"DGA",fee:0},
  {id:225,member:"jorge",coin:"ETH",type:"buy",qty:0.15886969,purchasePrice:679.68,usdTotal:107.98,date:"2018-04-29",exchange:"DGA",fee:0},
  {id:226,member:"jorge",coin:"ADA",type:"buy",qty:262.0,purchasePrice:0.3123,usdTotal:81.81,date:"2018-04-30",exchange:"Binance",fee:0},
  {id:227,member:"jorge",coin:"ETH",type:"sell",qty:0.1363448,purchasePrice:687.23,usdTotal:93.7,date:"2018-04-30",exchange:"DGA",fee:0},
  {id:228,member:"jorge",coin:"ADA",type:"buy",qty:240.0,purchasePrice:0.3114,usdTotal:74.74,date:"2018-04-30",exchange:"Binance",fee:0},
  {id:229,member:"jorge",coin:"ETH",type:"sell",qty:0.12456,purchasePrice:692.68,usdTotal:86.28,date:"2018-04-30",exchange:"DGA",fee:0},
  {id:230,member:"jorge",coin:"ETH",type:"buy",qty:0.19755152,purchasePrice:778.83,usdTotal:153.86,date:"2018-05-04",exchange:"Unknown",fee:0},
  {id:231,member:"jorge",coin:"ETH",type:"sell",qty:0.19744652,purchasePrice:784.92,usdTotal:154.98,date:"2018-05-04",exchange:"DGA",fee:0},
  {id:232,member:"jorge",coin:"ETH",type:"sell",qty:0.01236,purchasePrice:792.07,usdTotal:9.79,date:"2018-05-04",exchange:"DGA",fee:0},
  {id:233,member:"jorge",coin:"ETH",type:"buy",qty:0.15210152,purchasePrice:790.26,usdTotal:120.2,date:"2018-05-04",exchange:"Unknown",fee:0},
  {id:234,member:"jorge",coin:"EOS",type:"buy",qty:2.0,purchasePrice:12.9,usdTotal:25.8,date:"2018-05-05",exchange:"Binance",fee:0},
  {id:235,member:"jorge",coin:"ETH",type:"sell",qty:0.043,purchasePrice:796.74,usdTotal:34.26,date:"2018-05-05",exchange:"DGA",fee:0},
  {id:236,member:"jorge",coin:"ETH",type:"sell",qty:0.10892,purchasePrice:790.03,usdTotal:86.05,date:"2018-05-05",exchange:"DGA",fee:0},
  {id:237,member:"jorge",coin:"ETH",type:"buy",qty:0.0728,purchasePrice:824.59,usdTotal:60.03,date:"2018-05-05",exchange:"Unknown",fee:0},
  {id:238,member:"jorge",coin:"EOS",type:"buy",qty:3.37,purchasePrice:12.9228,usdTotal:43.55,date:"2018-05-05",exchange:"Binance",fee:0},
  {id:239,member:"jorge",coin:"ETH",type:"sell",qty:0.0725898,purchasePrice:826.98,usdTotal:60.03,date:"2018-05-05",exchange:"DGA",fee:0},
  {id:240,member:"jorge",coin:"ETH",type:"buy",qty:0.1239,purchasePrice:807.43,usdTotal:100.04,date:"2018-05-05",exchange:"Unknown",fee:0},
  {id:241,member:"jorge",coin:"ETH",type:"buy",qty:0.1361411,purchasePrice:755.76,usdTotal:102.89,date:"2018-05-07",exchange:"Unknown",fee:0},
  {id:242,member:"jorge",coin:"ETH",type:"sell",qty:0.03808,purchasePrice:746.59,usdTotal:28.43,date:"2018-05-07",exchange:"DGA",fee:0},
  {id:243,member:"jorge",coin:"ETH",type:"sell",qty:0.0605,purchasePrice:729.75,usdTotal:44.15,date:"2018-05-07",exchange:"DGA",fee:0},
  {id:244,member:"jorge",coin:"ETH",type:"sell",qty:0.03632,purchasePrice:729.35,usdTotal:26.49,date:"2018-05-07",exchange:"DGA",fee:0},
  {id:245,member:"jorge",coin:"ETH",type:"buy",qty:0.12925578,purchasePrice:743.95,usdTotal:96.16,date:"2018-05-08",exchange:"Unknown",fee:0},
  {id:246,member:"jorge",coin:"XRP",type:"buy",qty:24.0,purchasePrice:0.6542,usdTotal:15.7,date:"2018-05-08",exchange:"Binance",fee:0},
  {id:247,member:"jorge",coin:"ETH",type:"sell",qty:0.02616,purchasePrice:737.0,usdTotal:19.28,date:"2018-05-08",exchange:"DGA",fee:0},
  {id:248,member:"jorge",coin:"ETH",type:"sell",qty:0.103837,purchasePrice:737.02,usdTotal:76.53,date:"2018-05-08",exchange:"DGA",fee:0},
  {id:249,member:"jorge",coin:"ETH",type:"buy",qty:0.20924272,purchasePrice:735.32,usdTotal:153.86,date:"2018-05-10",exchange:"Unknown",fee:0},
  {id:250,member:"jorge",coin:"ADA",type:"buy",qty:509.0,purchasePrice:0.2463,usdTotal:125.37,date:"2018-05-10",exchange:"Binance",fee:0},
  {id:251,member:"jorge",coin:"ETH",type:"sell",qty:0.2089445,purchasePrice:735.79,usdTotal:153.74,date:"2018-05-10",exchange:"DGA",fee:0},
  {id:252,member:"jorge",coin:"ETH",type:"buy",qty:0.15144858,purchasePrice:698.45,usdTotal:105.78,date:"2018-05-11",exchange:"Unknown",fee:0},
  {id:253,member:"jorge",coin:"ETH",type:"sell",qty:0.1515024,purchasePrice:683.49,usdTotal:103.55,date:"2018-05-12",exchange:"DGA",fee:0},
  {id:254,member:"jorge",coin:"ETH",type:"buy",qty:0.0765053,purchasePrice:679.82,usdTotal:52.01,date:"2018-05-12",exchange:"Unknown",fee:0},
  {id:255,member:"jorge",coin:"ADA",type:"buy",qty:199.0,purchasePrice:0.2292,usdTotal:45.61,date:"2018-05-12",exchange:"Binance",fee:0},
  {id:256,member:"jorge",coin:"ETH",type:"sell",qty:0.076018,purchasePrice:688.26,usdTotal:52.32,date:"2018-05-12",exchange:"DGA",fee:0},
  {id:257,member:"jorge",coin:"LTC",type:"buy",qty:0.2639,purchasePrice:144.07,usdTotal:38.02,date:"2018-05-14",exchange:"Coinbase",fee:0},
  {id:258,member:"jorge",coin:"ETH",type:"buy",qty:0.0337,purchasePrice:727.6,usdTotal:24.52,date:"2018-05-15",exchange:"Unknown",fee:0},
  {id:259,member:"jorge",coin:"EOS",type:"buy",qty:1.89,purchasePrice:10.7196,usdTotal:20.26,date:"2018-05-15",exchange:"Binance",fee:0},
  {id:260,member:"jorge",coin:"ETH",type:"sell",qty:0.03376296,purchasePrice:708.76,usdTotal:23.93,date:"2018-05-15",exchange:"DGA",fee:0},
  {id:261,member:"jorge",coin:"ETH",type:"buy",qty:0.09073615,purchasePrice:683.41,usdTotal:62.01,date:"2018-05-16",exchange:"Unknown",fee:0},
  {id:262,member:"jorge",coin:"ETH",type:"sell",qty:0.049,purchasePrice:680.61,usdTotal:33.35,date:"2018-05-16",exchange:"DGA",fee:0},
  {id:263,member:"jorge",coin:"EOS",type:"buy",qty:2.38,purchasePrice:10.4832,usdTotal:24.95,date:"2018-05-16",exchange:"Binance",fee:0},
  {id:264,member:"jorge",coin:"ETH",type:"sell",qty:0.04157622,purchasePrice:695.35,usdTotal:28.91,date:"2018-05-16",exchange:"DGA",fee:0},
  {id:265,member:"jorge",coin:"ETH",type:"buy",qty:0.07140999,purchasePrice:672.31,usdTotal:48.01,date:"2018-05-18",exchange:"DGA",fee:0},
  {id:266,member:"jorge",coin:"ETH",type:"buy",qty:0.03804124,purchasePrice:683.73,usdTotal:26.01,date:"2018-05-18",exchange:"Unknown",fee:0},
  {id:267,member:"jorge",coin:"ETH",type:"buy",qty:0.07330053,purchasePrice:695.9,usdTotal:51.01,date:"2018-05-21",exchange:"Unknown",fee:0},
  {id:268,member:"jorge",coin:"ETH",type:"buy",qty:0.09307813,purchasePrice:666.21,usdTotal:62.01,date:"2018-05-22",exchange:"Unknown",fee:0},
  {id:269,member:"jorge",coin:"ETH",type:"sell",qty:0.0472,purchasePrice:654.03,usdTotal:30.87,date:"2018-05-22",exchange:"DGA",fee:0},
  {id:270,member:"jorge",coin:"ETH",type:"sell",qty:0.050149,purchasePrice:644.28,usdTotal:32.31,date:"2018-05-22",exchange:"DGA",fee:0},
  {id:271,member:"jorge",coin:"ADA",type:"buy",qty:200.0,purchasePrice:0.2058,usdTotal:41.16,date:"2018-05-22",exchange:"Binance",fee:0},
  {id:272,member:"jorge",coin:"ETH",type:"sell",qty:0.0686,purchasePrice:646.06,usdTotal:44.32,date:"2018-05-22",exchange:"DGA",fee:0},
  {id:273,member:"jorge",coin:"LTC",type:"buy",qty:0.77094779,purchasePrice:127.23,usdTotal:98.09,date:"2018-05-23",exchange:"Coinbase",fee:0},
  {id:274,member:"jorge",coin:"ETH",type:"buy",qty:0.15862546,purchasePrice:600.16,usdTotal:95.2,date:"2018-05-24",exchange:"Unknown",fee:0},
  {id:275,member:"jorge",coin:"ETH",type:"sell",qty:0.0199914,purchasePrice:592.25,usdTotal:11.84,date:"2018-05-24",exchange:"DGA",fee:0},
  {id:276,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:11.07,usdTotal:55.35,date:"2018-05-24",exchange:"Binance",fee:0},
  {id:277,member:"jorge",coin:"ETH",type:"sell",qty:0.09225,purchasePrice:609.43,usdTotal:56.22,date:"2018-05-24",exchange:"DGA",fee:0},
  {id:278,member:"jorge",coin:"ETH",type:"sell",qty:0.0462,purchasePrice:606.28,usdTotal:28.01,date:"2018-05-24",exchange:"DGA",fee:0},
  {id:279,member:"jorge",coin:"ETH",type:"sell",qty:0.055828,purchasePrice:588.06,usdTotal:32.83,date:"2018-05-26",exchange:"DGA",fee:0},
  {id:280,member:"jorge",coin:"ETH",type:"buy",qty:0.1229988,purchasePrice:585.45,usdTotal:72.01,date:"2018-05-26",exchange:"Unknown",fee:0},
  {id:281,member:"jorge",coin:"ADA",type:"buy",qty:200.0,purchasePrice:0.201,usdTotal:40.2,date:"2018-05-26",exchange:"Binance",fee:0},
  {id:282,member:"jorge",coin:"ETH",type:"sell",qty:0.067,purchasePrice:586.57,usdTotal:39.3,date:"2018-05-26",exchange:"DGA",fee:0},
  {id:283,member:"jorge",coin:"ETH",type:"buy",qty:0.1816536,purchasePrice:582.32,usdTotal:105.78,date:"2018-05-27",exchange:"Unknown",fee:0},
  {id:284,member:"jorge",coin:"LTC",type:"buy",qty:0.25521963,purchasePrice:117.58,usdTotal:30.01,date:"2018-05-27",exchange:"Coinbase",fee:0},
  {id:285,member:"jorge",coin:"ETH",type:"sell",qty:0.0296205,purchasePrice:584.73,usdTotal:17.32,date:"2018-05-27",exchange:"DGA",fee:0},
  {id:286,member:"jorge",coin:"ETH",type:"sell",qty:0.01598,purchasePrice:571.34,usdTotal:9.13,date:"2018-05-27",exchange:"DGA",fee:0},
  {id:287,member:"jorge",coin:"ADA",type:"buy",qty:150.0,purchasePrice:0.198,usdTotal:29.7,date:"2018-05-27",exchange:"Binance",fee:0},
  {id:288,member:"jorge",coin:"ETH",type:"sell",qty:0.0495,purchasePrice:571.52,usdTotal:28.29,date:"2018-05-27",exchange:"DGA",fee:0},
  {id:289,member:"jorge",coin:"ETH",type:"sell",qty:0.04329159,purchasePrice:571.01,usdTotal:24.72,date:"2018-05-27",exchange:"DGA",fee:0},
  {id:290,member:"jorge",coin:"ETH",type:"sell",qty:0.04324,purchasePrice:571.92,usdTotal:24.73,date:"2018-05-28",exchange:"DGA",fee:0},
  {id:291,member:"jorge",coin:"ETH",type:"buy",qty:0.09279169,purchasePrice:528.17,usdTotal:49.01,date:"2018-05-28",exchange:"Unknown",fee:0},
  {id:292,member:"jorge",coin:"ADA",type:"buy",qty:100.0,purchasePrice:0.2052,usdTotal:20.52,date:"2018-05-28",exchange:"Binance",fee:0},
  {id:293,member:"jorge",coin:"ETH",type:"sell",qty:0.0342,purchasePrice:523.98,usdTotal:17.92,date:"2018-05-28",exchange:"DGA",fee:0},
  {id:294,member:"jorge",coin:"ADA",type:"buy",qty:52.0,purchasePrice:0.2046,usdTotal:10.64,date:"2018-05-28",exchange:"Binance",fee:0},
  {id:295,member:"jorge",coin:"ETH",type:"sell",qty:0.017732,purchasePrice:519.4,usdTotal:9.21,date:"2018-05-28",exchange:"DGA",fee:0},
  {id:296,member:"jorge",coin:"ETH",type:"sell",qty:0.040662,purchasePrice:520.88,usdTotal:21.18,date:"2018-05-29",exchange:"DGA",fee:0},
  {id:297,member:"jorge",coin:"ETH",type:"buy",qty:0.08907118,purchasePrice:583.92,usdTotal:52.01,date:"2018-05-30",exchange:"Unknown",fee:0},
  {id:298,member:"jorge",coin:"LTC",type:"buy",qty:0.24946279,purchasePrice:120.3,usdTotal:30.01,date:"2018-06-02",exchange:"Coinbase",fee:0},
  {id:299,member:"jorge",coin:"LTC",type:"buy",qty:0.8414377,purchasePrice:120.0,usdTotal:100.97,date:"2018-06-06",exchange:"Coinbase",fee:0},
  {id:300,member:"jorge",coin:"ETH",type:"buy",qty:0.08337862,purchasePrice:599.79,usdTotal:50.01,date:"2018-06-06",exchange:"Unknown",fee:0},
  {id:301,member:"jorge",coin:"ETH",type:"sell",qty:0.0154,purchasePrice:605.19,usdTotal:9.32,date:"2018-06-06",exchange:"DGA",fee:0},
  {id:302,member:"jorge",coin:"ETH",type:"sell",qty:0.067599,purchasePrice:607.85,usdTotal:41.09,date:"2018-06-07",exchange:"DGA",fee:0},
  {id:303,member:"jorge",coin:"ETH",type:"buy",qty:0.04329356,purchasePrice:577.68,usdTotal:25.01,date:"2018-06-10",exchange:"Unknown",fee:0},
  {id:304,member:"jorge",coin:"ETH",type:"sell",qty:0.04315586,purchasePrice:577.67,usdTotal:24.93,date:"2018-06-10",exchange:"DGA",fee:0},
  {id:305,member:"jorge",coin:"LTC",type:"buy",qty:0.90172078,purchasePrice:106.64,usdTotal:96.16,date:"2018-06-10",exchange:"Coinbase",fee:0},
  {id:306,member:"jorge",coin:"ETH",type:"sell",qty:0.1470116,purchasePrice:506.29,usdTotal:74.43,date:"2018-06-10",exchange:"DGA",fee:0},
  {id:307,member:"jorge",coin:"ADA",type:"buy",qty:101.0,purchasePrice:0.1986,usdTotal:20.06,date:"2018-06-10",exchange:"Binance",fee:0},
  {id:308,member:"jorge",coin:"ETH",type:"sell",qty:0.033431,purchasePrice:516.89,usdTotal:17.28,date:"2018-06-10",exchange:"DGA",fee:0},
  {id:309,member:"jorge",coin:"ETH",type:"buy",qty:0.35165093,purchasePrice:514.12,usdTotal:180.79,date:"2018-06-10",exchange:"Unknown",fee:0},
  {id:310,member:"jorge",coin:"ETH",type:"sell",qty:0.05695734,purchasePrice:516.0,usdTotal:29.39,date:"2018-06-10",exchange:"DGA",fee:0},
  {id:311,member:"jorge",coin:"ETH",type:"sell",qty:0.04,purchasePrice:519.5,usdTotal:20.78,date:"2018-06-10",exchange:"DGA",fee:0},
  {id:312,member:"jorge",coin:"ETH",type:"sell",qty:0.0103917,purchasePrice:521.57,usdTotal:5.42,date:"2018-06-11",exchange:"DGA",fee:0},
  {id:313,member:"jorge",coin:"ETH",type:"sell",qty:0.02836,purchasePrice:521.16,usdTotal:14.78,date:"2018-06-11",exchange:"DGA",fee:0},
  {id:314,member:"jorge",coin:"XRP",type:"buy",qty:31.0,purchasePrice:0.66,usdTotal:20.46,date:"2018-06-11",exchange:"Binance",fee:0},
  {id:315,member:"jorge",coin:"ETH",type:"sell",qty:0.0341,purchasePrice:530.21,usdTotal:18.08,date:"2018-06-11",exchange:"DGA",fee:0},
  {id:316,member:"jorge",coin:"ETH",type:"buy",qty:0.15616473,purchasePrice:492.62,usdTotal:76.93,date:"2018-06-12",exchange:"Unknown",fee:0},
  {id:317,member:"jorge",coin:"ETH",type:"sell",qty:0.04785,purchasePrice:485.68,usdTotal:23.24,date:"2018-06-12",exchange:"DGA",fee:0},
  {id:318,member:"jorge",coin:"XRP",type:"buy",qty:35.0,purchasePrice:0.6769,usdTotal:23.69,date:"2018-06-12",exchange:"Binance",fee:0},
  {id:319,member:"jorge",coin:"ETH",type:"sell",qty:0.03948,purchasePrice:493.16,usdTotal:19.47,date:"2018-06-12",exchange:"DGA",fee:0},
  {id:320,member:"jorge",coin:"ETH",type:"sell",qty:0.031,purchasePrice:495.16,usdTotal:15.35,date:"2018-06-13",exchange:"DGA",fee:0},
  {id:321,member:"jorge",coin:"ETH",type:"sell",qty:0.01809,purchasePrice:499.72,usdTotal:9.04,date:"2018-06-13",exchange:"DGA",fee:0},
  {id:322,member:"jorge",coin:"EOS",type:"buy",qty:10.22,purchasePrice:12.2104,usdTotal:124.79,date:"2018-06-13",exchange:"Binance",fee:0},
  {id:323,member:"jorge",coin:"ETH",type:"sell",qty:0.207977,purchasePrice:476.88,usdTotal:99.18,date:"2018-06-13",exchange:"DGA",fee:0},
  {id:324,member:"jorge",coin:"ETH",type:"sell",qty:0.020586,purchasePrice:475.08,usdTotal:9.78,date:"2018-06-13",exchange:"DGA",fee:0},
  {id:325,member:"jorge",coin:"LTC",type:"buy",qty:1.04727887,purchasePrice:95.5,usdTotal:100.02,date:"2018-06-15",exchange:"Coinbase",fee:0},
  {id:326,member:"jorge",coin:"ETH",type:"buy",qty:0.19594436,purchasePrice:490.75,usdTotal:96.16,date:"2018-06-16",exchange:"Unknown",fee:0},
  {id:327,member:"jorge",coin:"ETH",type:"sell",qty:0.1559961,purchasePrice:490.2,usdTotal:76.47,date:"2018-06-16",exchange:"DGA",fee:0},
  {id:328,member:"jorge",coin:"ETH",type:"buy",qty:0.19572473,purchasePrice:515.88,usdTotal:100.97,date:"2018-06-18",exchange:"Unknown",fee:0},
  {id:329,member:"jorge",coin:"XRP",type:"buy",qty:120.0,purchasePrice:0.6294,usdTotal:75.53,date:"2018-06-18",exchange:"Binance",fee:0},
  {id:330,member:"jorge",coin:"ETH",type:"sell",qty:0.12588,purchasePrice:523.99,usdTotal:65.96,date:"2018-06-18",exchange:"DGA",fee:0},
  {id:331,member:"jorge",coin:"ADA",type:"buy",qty:47.0,purchasePrice:0.1915,usdTotal:9.0,date:"2018-06-18",exchange:"Binance",fee:0},
  {id:332,member:"jorge",coin:"ETH",type:"sell",qty:0.014993,purchasePrice:522.91,usdTotal:7.84,date:"2018-06-18",exchange:"DGA",fee:0},
  {id:333,member:"jorge",coin:"XRP",type:"buy",qty:53.0,purchasePrice:0.63,usdTotal:33.39,date:"2018-06-18",exchange:"Binance",fee:0},
  {id:334,member:"jorge",coin:"ETH",type:"sell",qty:0.05565,purchasePrice:519.5,usdTotal:28.91,date:"2018-06-18",exchange:"DGA",fee:0},
  {id:335,member:"jorge",coin:"ETH",type:"sell",qty:0.03581705,purchasePrice:517.07,usdTotal:18.52,date:"2018-06-18",exchange:"DGA",fee:0},
  {id:336,member:"jorge",coin:"ETH",type:"buy",qty:0.12606659,purchasePrice:531.54,usdTotal:67.01,date:"2018-06-21",exchange:"Unknown",fee:0},
  {id:337,member:"jorge",coin:"ETH",type:"sell",qty:0.072316,purchasePrice:522.98,usdTotal:37.82,date:"2018-06-21",exchange:"DGA",fee:0},
  {id:338,member:"jorge",coin:"LTC",type:"buy",qty:1.03321421,purchasePrice:85.63,usdTotal:88.47,date:"2018-06-22",exchange:"Coinbase",fee:0},
  {id:339,member:"jorge",coin:"XRP",type:"buy",qty:51.0,purchasePrice:0.6245,usdTotal:31.85,date:"2018-06-22",exchange:"Binance",fee:0},
  {id:340,member:"jorge",coin:"ETH",type:"sell",qty:0.053091,purchasePrice:475.6,usdTotal:25.25,date:"2018-06-22",exchange:"DGA",fee:0},
  {id:341,member:"jorge",coin:"ETH",type:"buy",qty:0.32170977,purchasePrice:466.29,usdTotal:150.01,date:"2018-06-23",exchange:"DGA",fee:0},
  {id:342,member:"jorge",coin:"ETH",type:"sell",qty:0.09105453,purchasePrice:470.49,usdTotal:42.84,date:"2018-06-23",exchange:"DGA",fee:0},
  {id:343,member:"jorge",coin:"ETH",type:"sell",qty:0.057,purchasePrice:468.95,usdTotal:26.73,date:"2018-06-23",exchange:"DGA",fee:0},
  {id:344,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:10.986,usdTotal:54.93,date:"2018-06-23",exchange:"Binance",fee:0},
  {id:345,member:"jorge",coin:"ETH",type:"sell",qty:0.09155,purchasePrice:473.84,usdTotal:43.38,date:"2018-06-23",exchange:"DGA",fee:0},
  {id:346,member:"jorge",coin:"ETH",type:"sell",qty:0.05103017,purchasePrice:471.88,usdTotal:24.08,date:"2018-06-23",exchange:"DGA",fee:0},
  {id:347,member:"jorge",coin:"ETH",type:"sell",qty:0.030384,purchasePrice:472.62,usdTotal:14.36,date:"2018-06-23",exchange:"DGA",fee:0},
  {id:348,member:"jorge",coin:"ETH",type:"buy",qty:0.06537922,purchasePrice:474.31,usdTotal:31.01,date:"2018-06-24",exchange:"Unknown",fee:0},
  {id:349,member:"jorge",coin:"ETH",type:"sell",qty:0.06405,purchasePrice:466.35,usdTotal:29.87,date:"2018-06-24",exchange:"DGA",fee:0},
  {id:350,member:"jorge",coin:"EOS",type:"buy",qty:6.16,purchasePrice:10.5601,usdTotal:65.05,date:"2018-06-24",exchange:"Binance",fee:0},
  {id:351,member:"jorge",coin:"ETH",type:"sell",qty:0.108416,purchasePrice:465.98,usdTotal:50.52,date:"2018-06-24",exchange:"DGA",fee:0},
  {id:352,member:"jorge",coin:"ETH",type:"buy",qty:0.07230425,purchasePrice:442.71,usdTotal:32.01,date:"2018-06-24",exchange:"Unknown",fee:0},
  {id:353,member:"jorge",coin:"ETH",type:"sell",qty:0.0686,purchasePrice:455.98,usdTotal:31.28,date:"2018-06-24",exchange:"DGA",fee:0},
  {id:354,member:"jorge",coin:"ETH",type:"buy",qty:0.38058287,purchasePrice:447.24,usdTotal:170.21,date:"2018-06-26",exchange:"Unknown",fee:0},
  {id:355,member:"jorge",coin:"EOS",type:"buy",qty:4.81,purchasePrice:10.6383,usdTotal:51.17,date:"2018-06-26",exchange:"Binance",fee:0},
  {id:356,member:"jorge",coin:"ETH",type:"sell",qty:0.0852813,purchasePrice:433.86,usdTotal:37.0,date:"2018-06-26",exchange:"DGA",fee:0},
  {id:357,member:"jorge",coin:"ADA",type:"buy",qty:500.0,purchasePrice:0.1746,usdTotal:87.3,date:"2018-06-27",exchange:"Binance",fee:0},
  {id:358,member:"jorge",coin:"ETH",type:"sell",qty:0.1455,purchasePrice:432.16,usdTotal:62.88,date:"2018-06-27",exchange:"DGA",fee:0},
  {id:359,member:"jorge",coin:"EOS",type:"buy",qty:3.54,purchasePrice:10.4689,usdTotal:37.06,date:"2018-06-27",exchange:"Binance",fee:0},
  {id:360,member:"jorge",coin:"ETH",type:"sell",qty:0.061773,purchasePrice:432.07,usdTotal:26.69,date:"2018-06-27",exchange:"DGA",fee:0},
  {id:361,member:"jorge",coin:"ETH",type:"sell",qty:0.04563111,purchasePrice:435.23,usdTotal:19.86,date:"2018-06-27",exchange:"DGA",fee:0},
  {id:362,member:"jorge",coin:"ETH",type:"sell",qty:0.04584004,purchasePrice:436.08,usdTotal:19.99,date:"2018-06-27",exchange:"DGA",fee:0},
  {id:363,member:"jorge",coin:"ETH",type:"buy",qty:0.07791182,purchasePrice:423.68,usdTotal:33.01,date:"2018-06-29",exchange:"Unknown",fee:0},
  {id:364,member:"jorge",coin:"ADA",type:"buy",qty:89.0,purchasePrice:0.168,usdTotal:14.95,date:"2018-06-29",exchange:"Binance",fee:0},
  {id:365,member:"jorge",coin:"ETH",type:"sell",qty:0.02492,purchasePrice:420.95,usdTotal:10.49,date:"2018-06-29",exchange:"DGA",fee:0},
  {id:366,member:"jorge",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0.6348,usdTotal:31.74,date:"2018-06-29",exchange:"Binance",fee:0},
  {id:367,member:"jorge",coin:"ETH",type:"sell",qty:0.0529,purchasePrice:421.55,usdTotal:22.3,date:"2018-06-29",exchange:"DGA",fee:0},
  {id:368,member:"jorge",coin:"ADA",type:"buy",qty:225.0,purchasePrice:0.1792,usdTotal:40.31,date:"2018-07-08",exchange:"Binance",fee:0},
  {id:369,member:"jorge",coin:"ETH",type:"sell",qty:0.067185,purchasePrice:487.01,usdTotal:32.72,date:"2018-07-08",exchange:"DGA",fee:0},
  {id:370,member:"jorge",coin:"LTC",type:"buy",qty:1.0,purchasePrice:78.5,usdTotal:78.5,date:"2018-07-10",exchange:"Coinbase",fee:0},
  {id:371,member:"jorge",coin:"ETH",type:"buy",qty:0.11324547,purchasePrice:441.61,usdTotal:50.01,date:"2018-07-10",exchange:"Unknown",fee:0},
  {id:372,member:"jorge",coin:"ADA",type:"buy",qty:381.0,purchasePrice:0.1778,usdTotal:67.76,date:"2018-07-11",exchange:"Binance",fee:0},
  {id:373,member:"jorge",coin:"ETH",type:"sell",qty:0.1129284,purchasePrice:438.42,usdTotal:49.51,date:"2018-07-11",exchange:"DGA",fee:0},
  {id:374,member:"jorge",coin:"ETH",type:"buy",qty:0.12,purchasePrice:438.33,usdTotal:52.6,date:"2018-07-11",exchange:"Unknown",fee:0},
  {id:375,member:"jorge",coin:"ETH",type:"buy",qty:0.12,purchasePrice:438.5,usdTotal:52.62,date:"2018-07-11",exchange:"Unknown",fee:0},
  {id:376,member:"jorge",coin:"ADA",type:"buy",qty:309.0,purchasePrice:0.1776,usdTotal:54.89,date:"2018-07-11",exchange:"Binance",fee:0},
  {id:377,member:"jorge",coin:"ETH",type:"sell",qty:0.09147636,purchasePrice:437.82,usdTotal:40.05,date:"2018-07-11",exchange:"DGA",fee:0},
  {id:378,member:"jorge",coin:"ETH",type:"sell",qty:0.0457884,purchasePrice:437.88,usdTotal:20.05,date:"2018-07-11",exchange:"DGA",fee:0},
  {id:379,member:"jorge",coin:"ETH",type:"sell",qty:0.0755,purchasePrice:439.34,usdTotal:33.17,date:"2018-07-11",exchange:"DGA",fee:0},
  {id:380,member:"jorge",coin:"ADA",type:"buy",qty:92.0,purchasePrice:0.1782,usdTotal:16.39,date:"2018-07-11",exchange:"Binance",fee:0},
  {id:381,member:"jorge",coin:"ETH",type:"sell",qty:0.027324,purchasePrice:439.91,usdTotal:12.02,date:"2018-07-11",exchange:"DGA",fee:0},
  {id:382,member:"jorge",coin:"LTC",type:"buy",qty:1.0,purchasePrice:74.6,usdTotal:74.6,date:"2018-07-12",exchange:"Coinbase",fee:0},
  {id:383,member:"jorge",coin:"ETH",type:"buy",qty:0.08371302,purchasePrice:430.16,usdTotal:36.01,date:"2018-07-12",exchange:"Unknown",fee:0},
  {id:384,member:"jorge",coin:"ETH",type:"sell",qty:0.08165,purchasePrice:428.54,usdTotal:34.99,date:"2018-07-12",exchange:"DGA",fee:0},
  {id:385,member:"jorge",coin:"ETH",type:"buy",qty:0.06706351,purchasePrice:447.49,usdTotal:30.01,date:"2018-07-16",exchange:"Unknown",fee:0},
  {id:386,member:"jorge",coin:"ETH",type:"buy",qty:0.14892149,purchasePrice:449.97,usdTotal:67.01,date:"2018-07-21",exchange:"Unknown",fee:0},
  {id:387,member:"jorge",coin:"ETH",type:"sell",qty:0.060784,purchasePrice:454.72,usdTotal:27.64,date:"2018-07-21",exchange:"DGA",fee:0},
  {id:388,member:"jorge",coin:"ETH",type:"sell",qty:0.04464286,purchasePrice:465.92,usdTotal:20.8,date:"2018-07-23",exchange:"DGA",fee:0},
  {id:389,member:"jorge",coin:"ETH",type:"sell",qty:0.04469244,purchasePrice:463.61,usdTotal:20.72,date:"2018-07-23",exchange:"DGA",fee:0},
  {id:390,member:"jorge",coin:"LTC",type:"buy",qty:1.13744166,purchasePrice:84.54,usdTotal:96.16,date:"2018-07-27",exchange:"Coinbase",fee:0},
  {id:391,member:"jorge",coin:"ETH",type:"buy",qty:0.16202537,purchasePrice:474.8,usdTotal:76.93,date:"2018-07-27",exchange:"Unknown",fee:0},
  {id:392,member:"jorge",coin:"ADA",type:"buy",qty:251.0,purchasePrice:0.2145,usdTotal:53.84,date:"2018-07-27",exchange:"Binance",fee:0},
  {id:393,member:"jorge",coin:"ETH",type:"sell",qty:0.0897325,purchasePrice:471.07,usdTotal:42.27,date:"2018-07-27",exchange:"DGA",fee:0},
  {id:394,member:"jorge",coin:"ETH",type:"sell",qty:0.07224945,purchasePrice:471.56,usdTotal:34.07,date:"2018-07-27",exchange:"DGA",fee:0},
  {id:395,member:"jorge",coin:"ETH",type:"buy",qty:0.10764065,purchasePrice:464.6,usdTotal:50.01,date:"2018-07-28",exchange:"Unknown",fee:0},
  {id:396,member:"jorge",coin:"EOS",type:"buy",qty:6.1,purchasePrice:10.5787,usdTotal:64.53,date:"2018-07-29",exchange:"Binance",fee:0},
  {id:397,member:"jorge",coin:"ETH",type:"sell",qty:0.107543,purchasePrice:464.09,usdTotal:49.91,date:"2018-07-29",exchange:"DGA",fee:0},
  {id:398,member:"jorge",coin:"ETH",type:"buy",qty:0.09198895,purchasePrice:467.56,usdTotal:43.01,date:"2018-07-30",exchange:"Unknown",fee:0},
  {id:399,member:"jorge",coin:"ETH",type:"buy",qty:0.12646046,purchasePrice:450.81,usdTotal:57.01,date:"2018-07-30",exchange:"Unknown",fee:0},
  {id:400,member:"jorge",coin:"EOS",type:"buy",qty:6.66,purchasePrice:10.0495,usdTotal:66.93,date:"2018-07-30",exchange:"Binance",fee:0},
  {id:401,member:"jorge",coin:"ETH",type:"sell",qty:0.111555,purchasePrice:450.36,usdTotal:50.24,date:"2018-07-30",exchange:"DGA",fee:0},
  {id:402,member:"jorge",coin:"LTC",type:"buy",qty:0.53703124,purchasePrice:80.09,usdTotal:43.01,date:"2018-07-31",exchange:"Coinbase",fee:0},
  {id:403,member:"jorge",coin:"LTC",type:"buy",qty:0.55572029,purchasePrice:77.4,usdTotal:43.01,date:"2018-07-31",exchange:"Coinbase",fee:0},
  {id:404,member:"jorge",coin:"ETH",type:"buy",qty:0.1022434,purchasePrice:420.66,usdTotal:43.01,date:"2018-08-01",exchange:"Unknown",fee:0},
  {id:405,member:"jorge",coin:"ETH",type:"buy",qty:0.09042653,purchasePrice:420.34,usdTotal:38.01,date:"2018-08-01",exchange:"Unknown",fee:0},
  {id:406,member:"jorge",coin:"ADA",type:"buy",qty:70.0,purchasePrice:0.1977,usdTotal:13.84,date:"2018-08-02",exchange:"Binance",fee:0},
  {id:407,member:"jorge",coin:"ETH",type:"sell",qty:0.023065,purchasePrice:423.59,usdTotal:9.77,date:"2018-08-02",exchange:"DGA",fee:0},
  {id:408,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:10.138,usdTotal:50.69,date:"2018-08-02",exchange:"Binance",fee:0},
  {id:409,member:"jorge",coin:"ETH",type:"sell",qty:0.08448,purchasePrice:414.06,usdTotal:34.98,date:"2018-08-02",exchange:"DGA",fee:0},
  {id:410,member:"jorge",coin:"LTC",type:"buy",qty:0.62774171,purchasePrice:76.5,usdTotal:48.02,date:"2018-08-02",exchange:"Coinbase",fee:0},
  {id:411,member:"jorge",coin:"ETH",type:"buy",qty:0.07062414,purchasePrice:409.49,usdTotal:28.92,date:"2018-08-04",exchange:"Unknown",fee:0},
  {id:412,member:"jorge",coin:"ETH",type:"buy",qty:0.14150671,purchasePrice:408.67,usdTotal:57.83,date:"2018-08-04",exchange:"Unknown",fee:0},
  {id:413,member:"jorge",coin:"ETH",type:"sell",qty:0.061625,purchasePrice:406.0,usdTotal:25.02,date:"2018-08-04",exchange:"DGA",fee:0},
  {id:414,member:"jorge",coin:"ETH",type:"sell",qty:0.0167692,purchasePrice:403.72,usdTotal:6.77,date:"2018-08-05",exchange:"DGA",fee:0},
  {id:415,member:"jorge",coin:"LTC",type:"buy",qty:0.72645621,purchasePrice:68.14,usdTotal:49.5,date:"2018-08-07",exchange:"Coinbase",fee:0},
  {id:416,member:"jorge",coin:"ETH",type:"buy",qty:0.12767667,purchasePrice:377.44,usdTotal:48.19,date:"2018-08-07",exchange:"Unknown",fee:0},
  {id:417,member:"jorge",coin:"LTC",type:"buy",qty:0.58374995,purchasePrice:66.04,usdTotal:38.55,date:"2018-08-08",exchange:"Coinbase",fee:0},
  {id:418,member:"jorge",coin:"EOS",type:"buy",qty:8.15,purchasePrice:9.2994,usdTotal:75.79,date:"2018-08-08",exchange:"Binance",fee:0},
  {id:419,member:"jorge",coin:"ETH",type:"sell",qty:0.12631685,purchasePrice:354.03,usdTotal:44.72,date:"2018-08-08",exchange:"DGA",fee:0},
  {id:420,member:"jorge",coin:"LTC",type:"buy",qty:1.0,purchasePrice:56.87,usdTotal:56.87,date:"2018-08-11",exchange:"Coinbase",fee:0},
  {id:421,member:"jorge",coin:"ETH",type:"buy",qty:0.1431733,purchasePrice:321.36,usdTotal:46.01,date:"2018-08-13",exchange:"Unknown",fee:0},
  {id:422,member:"jorge",coin:"ETH",type:"buy",qty:0.06389068,purchasePrice:321.02,usdTotal:20.51,date:"2018-08-13",exchange:"Unknown",fee:0},
  {id:423,member:"jorge",coin:"ETH",type:"sell",qty:0.06382138,purchasePrice:319.17,usdTotal:20.37,date:"2018-08-13",exchange:"DGA",fee:0},
  {id:424,member:"jorge",coin:"ETH",type:"buy",qty:0.1339804,purchasePrice:321.02,usdTotal:43.01,date:"2018-08-13",exchange:"Unknown",fee:0},
  {id:425,member:"jorge",coin:"EOS",type:"buy",qty:11.0,purchasePrice:9.36,usdTotal:102.96,date:"2018-08-13",exchange:"Binance",fee:0},
  {id:426,member:"jorge",coin:"ETH",type:"sell",qty:0.1716,purchasePrice:319.64,usdTotal:54.85,date:"2018-08-13",exchange:"DGA",fee:0},
  {id:427,member:"jorge",coin:"ETH",type:"sell",qty:0.1055055,purchasePrice:319.32,usdTotal:33.69,date:"2018-08-13",exchange:"DGA",fee:0},
  {id:428,member:"jorge",coin:"ETH",type:"buy",qty:0.12785537,purchasePrice:297.29,usdTotal:38.01,date:"2018-08-16",exchange:"Unknown",fee:0},
  {id:429,member:"jorge",coin:"ADA",type:"buy",qty:386.0,purchasePrice:0.1982,usdTotal:76.5,date:"2018-08-16",exchange:"Binance",fee:0},
  {id:430,member:"jorge",coin:"ETH",type:"sell",qty:0.12750352,purchasePrice:295.13,usdTotal:37.63,date:"2018-08-16",exchange:"DGA",fee:0},
  {id:431,member:"jorge",coin:"ETH",type:"buy",qty:0.11132273,purchasePrice:296.53,usdTotal:33.01,date:"2018-08-19",exchange:"Unknown",fee:0},
  {id:432,member:"jorge",coin:"ETH",type:"sell",qty:0.0232593,purchasePrice:274.73,usdTotal:6.39,date:"2018-08-24",exchange:"DGA",fee:0},
  {id:433,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:10.59,usdTotal:52.95,date:"2018-08-24",exchange:"Binance",fee:0},
  {id:434,member:"jorge",coin:"ETH",type:"sell",qty:0.08825,purchasePrice:273.99,usdTotal:24.18,date:"2018-08-24",exchange:"DGA",fee:0},
  {id:435,member:"jorge",coin:"EOS",type:"buy",qty:1.31,purchasePrice:10.5954,usdTotal:13.88,date:"2018-08-24",exchange:"Binance",fee:0},
  {id:436,member:"jorge",coin:"ETH",type:"sell",qty:0.0231346,purchasePrice:274.05,usdTotal:6.34,date:"2018-08-24",exchange:"DGA",fee:0},
  {id:437,member:"jorge",coin:"ADA",type:"buy",qty:540.0,purchasePrice:0.2007,usdTotal:108.38,date:"2018-08-24",exchange:"Binance",fee:0},
  {id:438,member:"jorge",coin:"ETH",type:"sell",qty:0.18063,purchasePrice:279.58,usdTotal:50.5,date:"2018-08-24",exchange:"DGA",fee:0},
  {id:439,member:"jorge",coin:"LTC",type:"buy",qty:1.0,purchasePrice:58.12,usdTotal:58.12,date:"2018-08-24",exchange:"Coinbase",fee:0},
  {id:440,member:"jorge",coin:"ETH",type:"buy",qty:0.09315887,purchasePrice:279.2,usdTotal:26.01,date:"2018-08-27",exchange:"Unknown",fee:0},
  {id:441,member:"jorge",coin:"XRP",type:"buy",qty:78.0,purchasePrice:0.709,usdTotal:55.3,date:"2018-08-27",exchange:"Binance",fee:0},
  {id:442,member:"jorge",coin:"ETH",type:"sell",qty:0.09216558,purchasePrice:277.76,usdTotal:25.6,date:"2018-08-27",exchange:"DGA",fee:0},
  {id:443,member:"jorge",coin:"ETH",type:"buy",qty:0.19147251,purchasePrice:224.63,usdTotal:43.01,date:"2018-09-06",exchange:"Unknown",fee:0},
  {id:444,member:"jorge",coin:"ETH",type:"buy",qty:0.25045539,purchasePrice:195.68,usdTotal:49.01,date:"2018-09-08",exchange:"Unknown",fee:0},
  {id:445,member:"jorge",coin:"ETH",type:"buy",qty:0.20521106,purchasePrice:194.97,usdTotal:40.01,date:"2018-09-08",exchange:"Unknown",fee:0},
  {id:446,member:"jorge",coin:"LTC",type:"buy",qty:1.0,purchasePrice:54.7,usdTotal:54.7,date:"2018-09-11",exchange:"Coinbase",fee:0},
  {id:447,member:"jorge",coin:"LTC",type:"buy",qty:2.0,purchasePrice:48.68,usdTotal:97.36,date:"2018-09-12",exchange:"Coinbase",fee:0},
  {id:448,member:"jorge",coin:"ETH",type:"buy",qty:0.164,purchasePrice:182.2,usdTotal:29.88,date:"2018-09-12",exchange:"Unknown",fee:0},
  {id:449,member:"jorge",coin:"EOS",type:"buy",qty:3.0,purchasePrice:15.81,usdTotal:47.43,date:"2018-09-13",exchange:"Binance",fee:0},
  {id:450,member:"jorge",coin:"ETH",type:"sell",qty:0.07905,purchasePrice:189.12,usdTotal:14.95,date:"2018-09-13",exchange:"DGA",fee:0},
  {id:451,member:"jorge",coin:"ETH",type:"sell",qty:0.1265,purchasePrice:190.2,usdTotal:24.06,date:"2018-09-13",exchange:"DGA",fee:0},
  {id:452,member:"jorge",coin:"ADA",type:"buy",qty:561.0,purchasePrice:0.2018,usdTotal:113.23,date:"2018-09-13",exchange:"Binance",fee:0},
  {id:453,member:"jorge",coin:"ETH",type:"sell",qty:0.1887204,purchasePrice:202.31,usdTotal:38.18,date:"2018-09-13",exchange:"DGA",fee:0},
  {id:454,member:"jorge",coin:"LTC",type:"buy",qty:0.49742364,purchasePrice:56.31,usdTotal:28.01,date:"2018-09-16",exchange:"Coinbase",fee:0},
  {id:455,member:"jorge",coin:"ETH",type:"buy",qty:0.12,purchasePrice:218.67,usdTotal:26.24,date:"2018-09-17",exchange:"Unknown",fee:0},
  {id:456,member:"jorge",coin:"EOS",type:"buy",qty:4.99,purchasePrice:14.6513,usdTotal:73.11,date:"2018-09-17",exchange:"Binance",fee:0},
  {id:457,member:"jorge",coin:"ETH",type:"sell",qty:0.1218558,purchasePrice:223.46,usdTotal:27.23,date:"2018-09-17",exchange:"DGA",fee:0},
  {id:458,member:"jorge",coin:"ETH",type:"buy",qty:0.23345022,purchasePrice:222.79,usdTotal:52.01,date:"2018-09-20",exchange:"Unknown",fee:0},
  {id:459,member:"jorge",coin:"LTC",type:"buy",qty:0.42041256,purchasePrice:61.87,usdTotal:26.01,date:"2018-09-23",exchange:"Coinbase",fee:0},
  {id:460,member:"jorge",coin:"ETH",type:"buy",qty:0.13616823,purchasePrice:227.73,usdTotal:31.01,date:"2018-09-25",exchange:"Unknown",fee:0},
  {id:461,member:"jorge",coin:"ADA",type:"buy",qty:381.0,purchasePrice:0.2139,usdTotal:81.5,date:"2018-09-25",exchange:"Binance",fee:0},
  {id:462,member:"jorge",coin:"ETH",type:"sell",qty:0.1358265,purchasePrice:224.26,usdTotal:30.46,date:"2018-09-25",exchange:"DGA",fee:0},
  {id:463,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:11.06,usdTotal:22.12,date:"2018-09-26",exchange:"Coinbase Pro",fee:0},
  {id:464,member:"jorge",coin:"LTC",type:"buy",qty:0.32357538,purchasePrice:57.2,usdTotal:18.51,date:"2018-09-26",exchange:"Coinbase",fee:0},
  {id:465,member:"jorge",coin:"ETC",type:"buy",qty:1.0,purchasePrice:11.03,usdTotal:11.03,date:"2018-10-03",exchange:"Coinbase Pro",fee:0},
  {id:466,member:"jorge",coin:"ETH",type:"buy",qty:0.159987,purchasePrice:225.08,usdTotal:36.01,date:"2018-10-04",exchange:"Unknown",fee:0},
  {id:467,member:"jorge",coin:"ETH",type:"buy",qty:0.17065651,purchasePrice:222.73,usdTotal:38.01,date:"2018-10-04",exchange:"Unknown",fee:0},
  {id:468,member:"jorge",coin:"ETH",type:"sell",qty:0.161632,purchasePrice:223.53,usdTotal:36.13,date:"2018-10-04",exchange:"DGA",fee:0},
  {id:469,member:"jorge",coin:"ETC",type:"buy",qty:1.0,purchasePrice:11.04,usdTotal:11.04,date:"2018-10-05",exchange:"Coinbase Pro",fee:0},
  {id:470,member:"jorge",coin:"ETH",type:"buy",qty:0.09354892,purchasePrice:197.86,usdTotal:18.51,date:"2018-10-11",exchange:"Unknown",fee:0},
  {id:471,member:"jorge",coin:"ETH",type:"buy",qty:0.12661192,purchasePrice:197.53,usdTotal:25.01,date:"2018-10-14",exchange:"Unknown",fee:0},
  {id:472,member:"jorge",coin:"ADA",type:"buy",qty:125.0,purchasePrice:0.2175,usdTotal:27.19,date:"2018-10-14",exchange:"Binance",fee:0},
  {id:473,member:"jorge",coin:"ETH",type:"sell",qty:0.045325,purchasePrice:200.99,usdTotal:9.11,date:"2018-10-14",exchange:"DGA",fee:0},
  {id:474,member:"jorge",coin:"ETH",type:"sell",qty:0.0904124,purchasePrice:201.96,usdTotal:18.26,date:"2018-10-14",exchange:"DGA",fee:0},
  {id:475,member:"jorge",coin:"ETH",type:"buy",qty:0.16006496,purchasePrice:193.73,usdTotal:31.01,date:"2018-10-15",exchange:"Unknown",fee:0},
  {id:476,member:"jorge",coin:"EOS",type:"buy",qty:6.09,purchasePrice:15.7406,usdTotal:95.86,date:"2018-10-15",exchange:"Binance",fee:0},
  {id:477,member:"jorge",coin:"ETH",type:"sell",qty:0.15977115,purchasePrice:218.63,usdTotal:34.93,date:"2018-10-15",exchange:"DGA",fee:0},
  {id:478,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:9.59,usdTotal:19.18,date:"2018-10-16",exchange:"Coinbase Pro",fee:0},
  {id:479,member:"jorge",coin:"ETH",type:"buy",qty:0.21265103,purchasePrice:202.26,usdTotal:43.01,date:"2018-10-20",exchange:"Unknown",fee:0},
  {id:480,member:"jorge",coin:"EOS",type:"buy",qty:5.67,purchasePrice:15.8272,usdTotal:89.74,date:"2018-10-20",exchange:"Binance",fee:0},
  {id:481,member:"jorge",coin:"ETH",type:"sell",qty:0.1495746,purchasePrice:207.92,usdTotal:31.1,date:"2018-10-20",exchange:"DGA",fee:0},
  {id:482,member:"jorge",coin:"ETH",type:"buy",qty:0.11615788,purchasePrice:202.4,usdTotal:23.51,date:"2018-10-24",exchange:"Unknown",fee:0},
  {id:483,member:"jorge",coin:"ADA",type:"buy",qty:487.0,purchasePrice:0.2207,usdTotal:107.47,date:"2018-10-24",exchange:"Binance",fee:0},
  {id:484,member:"jorge",coin:"ETH",type:"sell",qty:0.1791186,purchasePrice:206.23,usdTotal:36.94,date:"2018-10-24",exchange:"DGA",fee:0},
  {id:485,member:"jorge",coin:"ETC",type:"buy",qty:1.0,purchasePrice:9.61,usdTotal:9.61,date:"2018-10-27",exchange:"Coinbase Pro",fee:0},
  {id:486,member:"jorge",coin:"ETH",type:"buy",qty:0.1572954,purchasePrice:203.5,usdTotal:32.01,date:"2018-10-29",exchange:"Unknown",fee:0},
  {id:487,member:"jorge",coin:"ETH",type:"sell",qty:0.07904,purchasePrice:205.09,usdTotal:16.21,date:"2018-10-29",exchange:"DGA",fee:0},
  {id:488,member:"jorge",coin:"EOS",type:"buy",qty:2.93,purchasePrice:15.8396,usdTotal:46.41,date:"2018-10-29",exchange:"Binance",fee:0},
  {id:489,member:"jorge",coin:"ETH",type:"sell",qty:0.077352,purchasePrice:203.23,usdTotal:15.72,date:"2018-10-29",exchange:"DGA",fee:0},
  {id:490,member:"jorge",coin:"ETC",type:"buy",qty:1.65378406,purchasePrice:8.97,usdTotal:14.83,date:"2018-10-29",exchange:"Coinbase Pro",fee:0},
  {id:491,member:"jorge",coin:"ETH",type:"buy",qty:0.21937369,purchasePrice:209.73,usdTotal:46.01,date:"2018-11-05",exchange:"Unknown",fee:0},
  {id:492,member:"jorge",coin:"EOS",type:"buy",qty:3.0,purchasePrice:15.7433,usdTotal:47.23,date:"2018-11-05",exchange:"Binance",fee:0},
  {id:493,member:"jorge",coin:"ETH",type:"sell",qty:0.07872,purchasePrice:209.86,usdTotal:16.52,date:"2018-11-05",exchange:"DGA",fee:0},
  {id:494,member:"jorge",coin:"ETH",type:"sell",qty:0.02024,purchasePrice:209.98,usdTotal:4.25,date:"2018-11-05",exchange:"DGA",fee:0},
  {id:495,member:"jorge",coin:"ETH",type:"sell",qty:0.12,purchasePrice:217.25,usdTotal:26.07,date:"2018-11-06",exchange:"DGA",fee:0},
  {id:496,member:"jorge",coin:"ETH",type:"buy",qty:0.10261775,purchasePrice:209.61,usdTotal:21.51,date:"2018-11-09",exchange:"Unknown",fee:0},
  {id:497,member:"jorge",coin:"ETH",type:"sell",qty:0.1025455,purchasePrice:211.52,usdTotal:21.69,date:"2018-11-09",exchange:"DGA",fee:0},
  {id:498,member:"jorge",coin:"LTC",type:"buy",qty:0.39618235,purchasePrice:49.25,usdTotal:19.51,date:"2018-11-13",exchange:"Coinbase",fee:0},
  {id:499,member:"jorge",coin:"LTC",type:"buy",qty:2.0,purchasePrice:42.15,usdTotal:84.3,date:"2018-11-14",exchange:"Coinbase",fee:0},
  {id:500,member:"jorge",coin:"ETC",type:"buy",qty:1.22838356,purchasePrice:7.3,usdTotal:8.97,date:"2018-11-14",exchange:"Coinbase Pro",fee:0},
  {id:501,member:"jorge",coin:"ETH",type:"buy",qty:0.13047891,purchasePrice:172.52,usdTotal:22.51,date:"2018-11-15",exchange:"Unknown",fee:0},
  {id:502,member:"jorge",coin:"ETH",type:"buy",qty:0.19452087,purchasePrice:174.84,usdTotal:34.01,date:"2018-11-18",exchange:"Unknown",fee:0},
  {id:503,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:7.13,usdTotal:14.26,date:"2018-11-19",exchange:"Coinbase Pro",fee:0},
  {id:504,member:"jorge",coin:"ETH",type:"sell",qty:0.07,purchasePrice:170.57,usdTotal:11.94,date:"2018-11-19",exchange:"DGA",fee:0},
  {id:505,member:"jorge",coin:"LTC",type:"buy",qty:1.0,purchasePrice:38.37,usdTotal:38.37,date:"2018-11-19",exchange:"Coinbase",fee:0},
  {id:506,member:"jorge",coin:"ETC",type:"buy",qty:1.5,purchasePrice:6.37,usdTotal:9.55,date:"2018-11-19",exchange:"Coinbase Pro",fee:0},
  {id:507,member:"jorge",coin:"ADA",type:"buy",qty:339.64080531,purchasePrice:0.2034,usdTotal:69.08,date:"2018-11-19",exchange:"Binance",fee:0},
  {id:508,member:"jorge",coin:"ETH",type:"sell",qty:0.11513823,purchasePrice:156.68,usdTotal:18.04,date:"2018-11-19",exchange:"DGA",fee:0},
  {id:509,member:"jorge",coin:"ETH",type:"buy",qty:0.21913138,purchasePrice:146.08,usdTotal:32.01,date:"2018-11-20",exchange:"Unknown",fee:0},
  {id:510,member:"jorge",coin:"ETH",type:"sell",qty:0.059,purchasePrice:152.2,usdTotal:8.98,date:"2018-11-20",exchange:"DGA",fee:0},
  {id:511,member:"jorge",coin:"ETH",type:"sell",qty:0.168,purchasePrice:135.77,usdTotal:22.81,date:"2018-11-20",exchange:"DGA",fee:0},
  {id:512,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:5.29,usdTotal:15.87,date:"2018-11-20",exchange:"Coinbase Pro",fee:0},
  {id:513,member:"jorge",coin:"ETH",type:"buy",qty:0.24986095,purchasePrice:104.1,usdTotal:26.01,date:"2018-11-27",exchange:"Unknown",fee:0},
  {id:514,member:"jorge",coin:"EOS",type:"buy",qty:9.1,purchasePrice:16.4703,usdTotal:149.88,date:"2018-11-27",exchange:"Binance",fee:0},
  {id:515,member:"jorge",coin:"ETH",type:"sell",qty:0.249795,purchasePrice:107.97,usdTotal:26.97,date:"2018-11-27",exchange:"DGA",fee:0},
  {id:516,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:4.88,usdTotal:9.76,date:"2018-11-30",exchange:"Coinbase Pro",fee:0},
  {id:517,member:"jorge",coin:"LTC",type:"buy",qty:1.0,purchasePrice:33.54,usdTotal:33.54,date:"2018-11-30",exchange:"Coinbase",fee:0},
  {id:518,member:"jorge",coin:"ETH",type:"buy",qty:0.22103166,purchasePrice:117.68,usdTotal:26.01,date:"2018-12-01",exchange:"Unknown",fee:0},
  {id:519,member:"jorge",coin:"EOS",type:"buy",qty:3.44,purchasePrice:14.9244,usdTotal:51.34,date:"2018-12-02",exchange:"Binance",fee:0},
  {id:520,member:"jorge",coin:"ETH",type:"sell",qty:0.08557344,purchasePrice:118.38,usdTotal:10.13,date:"2018-12-02",exchange:"DGA",fee:0},
  {id:521,member:"jorge",coin:"ETH",type:"buy",qty:0.2267065,purchasePrice:110.32,usdTotal:25.01,date:"2018-12-04",exchange:"Unknown",fee:0},
  {id:522,member:"jorge",coin:"EOS",type:"buy",qty:10.34,purchasePrice:13.1103,usdTotal:135.56,date:"2018-12-05",exchange:"Binance",fee:0},
  {id:523,member:"jorge",coin:"ETH",type:"sell",qty:0.225929,purchasePrice:109.19,usdTotal:24.67,date:"2018-12-05",exchange:"DGA",fee:0},
  {id:524,member:"jorge",coin:"LTC",type:"buy",qty:1.0,purchasePrice:26.11,usdTotal:26.11,date:"2018-12-07",exchange:"Coinbase",fee:0},
  {id:525,member:"jorge",coin:"ADA",type:"buy",qty:419.61540397,purchasePrice:0.1926,usdTotal:80.82,date:"2018-12-07",exchange:"Binance",fee:0},
  {id:526,member:"jorge",coin:"ETH",type:"sell",qty:0.13469654,purchasePrice:93.02,usdTotal:12.53,date:"2018-12-07",exchange:"DGA",fee:0},
  {id:527,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:3.81,usdTotal:7.62,date:"2018-12-10",exchange:"Coinbase Pro",fee:0},
  {id:528,member:"jorge",coin:"ETH",type:"buy",qty:0.22764038,purchasePrice:90.1,usdTotal:20.51,date:"2018-12-10",exchange:"Unknown",fee:0},
  {id:529,member:"jorge",coin:"ETH",type:"buy",qty:0.30389024,purchasePrice:82.3,usdTotal:25.01,date:"2018-12-15",exchange:"Unknown",fee:0},
  {id:530,member:"jorge",coin:"ETH",type:"sell",qty:0.10064,purchasePrice:86.05,usdTotal:8.66,date:"2018-12-16",exchange:"DGA",fee:0},
  {id:531,member:"jorge",coin:"ETH",type:"buy",qty:0.14231194,purchasePrice:94.93,usdTotal:13.51,date:"2018-12-18",exchange:"Unknown",fee:0},
  {id:532,member:"jorge",coin:"ETH",type:"sell",qty:0.12732836,purchasePrice:95.82,usdTotal:12.2,date:"2018-12-18",exchange:"DGA",fee:0},
  {id:533,member:"jorge",coin:"ETH",type:"buy",qty:0.11697517,purchasePrice:115.49,usdTotal:13.51,date:"2018-12-21",exchange:"Unknown",fee:0},
  {id:534,member:"jorge",coin:"ETH",type:"sell",qty:0.10276204,purchasePrice:114.93,usdTotal:11.81,date:"2018-12-21",exchange:"DGA",fee:0},
  {id:535,member:"jorge",coin:"ETH",type:"sell",qty:0.0061644,purchasePrice:115.18,usdTotal:0.71,date:"2018-12-21",exchange:"DGA",fee:0},
  {id:536,member:"jorge",coin:"ETH",type:"buy",qty:0.19975038,purchasePrice:112.69,usdTotal:22.51,date:"2018-12-21",exchange:"Unknown",fee:0},
  {id:537,member:"jorge",coin:"ETH",type:"sell",qty:0.18624,purchasePrice:111.84,usdTotal:20.83,date:"2018-12-21",exchange:"DGA",fee:0},
  {id:538,member:"jorge",coin:"ETH",type:"sell",qty:0.0126576,purchasePrice:107.45,usdTotal:1.36,date:"2018-12-22",exchange:"DGA",fee:0},
  {id:539,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:4.5,usdTotal:13.5,date:"2018-12-22",exchange:"Coinbase Pro",fee:0},
  {id:540,member:"jorge",coin:"ETH",type:"buy",qty:0.19047937,purchasePrice:107.68,usdTotal:20.51,date:"2018-12-22",exchange:"Unknown",fee:0},
  {id:541,member:"jorge",coin:"ADA",type:"buy",qty:557.0,purchasePrice:0.207,usdTotal:115.3,date:"2018-12-23",exchange:"Binance",fee:0},
  {id:542,member:"jorge",coin:"ETH",type:"sell",qty:0.192165,purchasePrice:128.85,usdTotal:24.76,date:"2018-12-23",exchange:"DGA",fee:0},
  {id:543,member:"jorge",coin:"EOS",type:"buy",qty:11.29,purchasePrice:11.9876,usdTotal:135.34,date:"2018-12-26",exchange:"Binance",fee:0},
  {id:544,member:"jorge",coin:"ETH",type:"sell",qty:0.2255742,purchasePrice:131.18,usdTotal:29.59,date:"2018-12-26",exchange:"DGA",fee:0},
  {id:545,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:12.24,usdTotal:122.4,date:"2018-12-26",exchange:"Binance",fee:0},
  {id:546,member:"jorge",coin:"ETH",type:"sell",qty:0.204,purchasePrice:131.18,usdTotal:26.76,date:"2018-12-26",exchange:"DGA",fee:0},
  {id:547,member:"jorge",coin:"LTC",type:"buy",qty:1.0,purchasePrice:27.95,usdTotal:27.95,date:"2018-12-27",exchange:"Coinbase",fee:0},
  {id:548,member:"jorge",coin:"ZEC",type:"buy",qty:1.0,purchasePrice:49.6,usdTotal:49.6,date:"2019-01-28",exchange:"Gemini",fee:0},
  {id:549,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:3.85,usdTotal:11.55,date:"2019-02-04",exchange:"Coinbase Pro",fee:0},
  {id:550,member:"jorge",coin:"LTC",type:"buy",qty:1.0,purchasePrice:44.89,usdTotal:44.89,date:"2019-02-10",exchange:"Coinbase",fee:0},
  {id:551,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:4.19,usdTotal:8.38,date:"2019-02-16",exchange:"Coinbase Pro",fee:0},
  {id:552,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:4.11,usdTotal:12.33,date:"2019-02-18",exchange:"Coinbase Pro",fee:0},
  {id:553,member:"jorge",coin:"LTC",type:"sell",qty:1.0,purchasePrice:51.04,usdTotal:51.04,date:"2019-02-20",exchange:"Coinbase",fee:0},
  {id:554,member:"jorge",coin:"ETH",type:"buy",qty:0.17904085,purchasePrice:125.73,usdTotal:22.51,date:"2019-03-04",exchange:"Unknown",fee:0},
  {id:555,member:"jorge",coin:"ETH",type:"buy",qty:0.2629015,purchasePrice:136.97,usdTotal:36.01,date:"2019-03-09",exchange:"Unknown",fee:0},
  {id:556,member:"jorge",coin:"ETH",type:"buy",qty:0.29487405,purchasePrice:135.69,usdTotal:40.01,date:"2019-03-10",exchange:"Unknown",fee:0},
  {id:557,member:"jorge",coin:"ADA",type:"buy",qty:81.0,purchasePrice:0.0662,usdTotal:5.36,date:"2019-03-10",exchange:"Binance",fee:0},
  {id:558,member:"jorge",coin:"ETH",type:"sell",qty:0.026811,purchasePrice:135.02,usdTotal:3.62,date:"2019-03-10",exchange:"DGA",fee:0},
  {id:559,member:"jorge",coin:"ADA",type:"buy",qty:95.0,purchasePrice:0.066,usdTotal:6.27,date:"2019-03-10",exchange:"Binance",fee:0},
  {id:560,member:"jorge",coin:"ETH",type:"sell",qty:0.03135475,purchasePrice:134.91,usdTotal:4.23,date:"2019-03-10",exchange:"DGA",fee:0},
  {id:561,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:5.364,usdTotal:53.64,date:"2019-03-11",exchange:"Binance",fee:0},
  {id:562,member:"jorge",coin:"ETH",type:"sell",qty:0.2682,purchasePrice:132.77,usdTotal:35.61,date:"2019-03-11",exchange:"DGA",fee:0},
  {id:563,member:"jorge",coin:"ETH",type:"sell",qty:0.03264,purchasePrice:132.05,usdTotal:4.31,date:"2019-03-11",exchange:"DGA",fee:0},
  {id:564,member:"jorge",coin:"ETH",type:"sell",qty:0.10304,purchasePrice:133.06,usdTotal:13.71,date:"2019-03-11",exchange:"DGA",fee:0},
  {id:565,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:4.35,usdTotal:8.7,date:"2019-03-11",exchange:"Coinbase Pro",fee:0},
  {id:566,member:"jorge",coin:"ETH",type:"buy",qty:0.16195978,purchasePrice:132.81,usdTotal:21.51,date:"2019-03-13",exchange:"Unknown",fee:0},
  {id:567,member:"jorge",coin:"ETH",type:"sell",qty:0.0925,purchasePrice:132.0,usdTotal:12.21,date:"2019-03-14",exchange:"DGA",fee:0},
  {id:568,member:"jorge",coin:"ETH",type:"buy",qty:0.14492231,purchasePrice:141.52,usdTotal:20.51,date:"2019-03-16",exchange:"Unknown",fee:0},
  {id:569,member:"jorge",coin:"ETH",type:"sell",qty:0.02334825,purchasePrice:141.34,usdTotal:3.3,date:"2019-03-16",exchange:"DGA",fee:0},
  {id:570,member:"jorge",coin:"ADA",type:"buy",qty:183.0,purchasePrice:0.0727,usdTotal:13.3,date:"2019-03-16",exchange:"Binance",fee:0},
  {id:571,member:"jorge",coin:"ETH",type:"sell",qty:0.0664839,purchasePrice:141.09,usdTotal:9.38,date:"2019-03-16",exchange:"DGA",fee:0},
  {id:572,member:"jorge",coin:"ETH",type:"sell",qty:0.01255404,purchasePrice:140.99,usdTotal:1.77,date:"2019-03-17",exchange:"DGA",fee:0},
  {id:573,member:"jorge",coin:"ETH",type:"sell",qty:0.038829,purchasePrice:138.04,usdTotal:5.36,date:"2019-03-19",exchange:"DGA",fee:0},
  {id:574,member:"jorge",coin:"ADA",type:"buy",qty:322.0,purchasePrice:0.0748,usdTotal:24.09,date:"2019-03-20",exchange:"Binance",fee:0},
  {id:575,member:"jorge",coin:"ETH",type:"sell",qty:0.120428,purchasePrice:137.51,usdTotal:16.56,date:"2019-03-20",exchange:"DGA",fee:0},
  {id:576,member:"jorge",coin:"ETH",type:"buy",qty:0.15021316,purchasePrice:136.54,usdTotal:20.51,date:"2019-03-25",exchange:"Unknown",fee:0},
  {id:577,member:"jorge",coin:"EOS",type:"buy",qty:5.61,purchasePrice:5.3565,usdTotal:30.05,date:"2019-03-25",exchange:"Binance",fee:0},
  {id:578,member:"jorge",coin:"ETH",type:"sell",qty:0.15024141,purchasePrice:136.58,usdTotal:20.52,date:"2019-03-25",exchange:"DGA",fee:0},
  {id:579,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:4.66,usdTotal:13.98,date:"2019-03-25",exchange:"Coinbase Pro",fee:0},
  {id:580,member:"jorge",coin:"ETH",type:"buy",qty:0.28289996,purchasePrice:134.36,usdTotal:38.01,date:"2019-03-26",exchange:"Unknown",fee:0},
  {id:581,member:"jorge",coin:"ADA",type:"buy",qty:510.0,purchasePrice:0.089,usdTotal:45.4,date:"2019-03-26",exchange:"Binance",fee:0},
  {id:582,member:"jorge",coin:"ETH",type:"sell",qty:0.2269806,purchasePrice:134.55,usdTotal:30.54,date:"2019-03-26",exchange:"DGA",fee:0},
  {id:583,member:"jorge",coin:"DGB",type:"buy",qty:605.60044615,purchasePrice:0.0182,usdTotal:11.02,date:"2019-03-26",exchange:"Bittrex",fee:0},
  {id:584,member:"jorge",coin:"ETH",type:"sell",qty:0.05510964,purchasePrice:132.64,usdTotal:7.31,date:"2019-03-26",exchange:"DGA",fee:0},
  {id:585,member:"jorge",coin:"ETH",type:"buy",qty:0.18800376,purchasePrice:137.6,usdTotal:25.87,date:"2019-03-27",exchange:"Coinbase",fee:0},
  {id:586,member:"jorge",coin:"EOS",type:"buy",qty:6.21,purchasePrice:6.0483,usdTotal:37.56,date:"2019-03-27",exchange:"Binance",fee:0},
  {id:587,member:"jorge",coin:"ETH",type:"sell",qty:0.1877904,purchasePrice:138.03,usdTotal:25.92,date:"2019-03-27",exchange:"DGA",fee:0},
  {id:588,member:"jorge",coin:"ETH",type:"buy",qty:0.21715291,purchasePrice:138.2,usdTotal:30.01,date:"2019-03-28",exchange:"Coinbase",fee:0},
  {id:589,member:"jorge",coin:"EOS",type:"buy",qty:4.67,purchasePrice:6.2334,usdTotal:29.11,date:"2019-03-28",exchange:"Binance",fee:0},
  {id:590,member:"jorge",coin:"ETH",type:"sell",qty:0.1455639,purchasePrice:138.08,usdTotal:20.1,date:"2019-03-28",exchange:"DGA",fee:0},
  {id:591,member:"jorge",coin:"ETH",type:"sell",qty:0.07129989,purchasePrice:138.01,usdTotal:9.84,date:"2019-03-28",exchange:"DGA",fee:0},
  {id:592,member:"jorge",coin:"ETH",type:"buy",qty:0.15846901,purchasePrice:142.05,usdTotal:22.51,date:"2019-03-30",exchange:"Coinbase",fee:0},
  {id:593,member:"jorge",coin:"ADA",type:"buy",qty:320.0,purchasePrice:0.099,usdTotal:31.68,date:"2019-03-30",exchange:"Binance",fee:0},
  {id:594,member:"jorge",coin:"ETH",type:"sell",qty:0.1584,purchasePrice:141.6,usdTotal:22.43,date:"2019-03-30",exchange:"DGA",fee:0},
  {id:595,member:"jorge",coin:"ETC",type:"sell",qty:36.0,purchasePrice:7.89,usdTotal:284.04,date:"2019-04-08",exchange:"Coinbase Pro",fee:0},
  {id:596,member:"jorge",coin:"LTC",type:"buy",qty:1.21673,purchasePrice:78.9,usdTotal:96.0,date:"2019-04-11",exchange:"Coinbase",fee:0},
  {id:597,member:"jorge",coin:"LTC",type:"buy",qty:1.5,purchasePrice:79.24,usdTotal:118.86,date:"2019-04-11",exchange:"Coinbase",fee:0},
  {id:598,member:"jorge",coin:"LTC",type:"buy",qty:0.32981,purchasePrice:75.8,usdTotal:25.0,date:"2019-04-15",exchange:"Coinbase",fee:0},
  {id:599,member:"jorge",coin:"ETH",type:"buy",qty:0.15916988,purchasePrice:175.98,usdTotal:28.01,date:"2019-04-20",exchange:"Unknown",fee:0},
  {id:600,member:"jorge",coin:"LTC",type:"buy",qty:0.25726932,purchasePrice:71.95,usdTotal:18.51,date:"2019-04-24",exchange:"Coinbase",fee:0},
  {id:601,member:"jorge",coin:"ETH",type:"buy",qty:0.32198697,purchasePrice:166.25,usdTotal:53.53,date:"2019-04-24",exchange:"Unknown",fee:0},
  {id:602,member:"jorge",coin:"ETH",type:"buy",qty:0.24480788,purchasePrice:164.25,usdTotal:40.21,date:"2019-04-25",exchange:"Unknown",fee:0},
  {id:603,member:"jorge",coin:"ETH",type:"buy",qty:0.164571,purchasePrice:151.61,usdTotal:24.95,date:"2019-04-25",exchange:"Unknown",fee:0},
  {id:604,member:"jorge",coin:"ETH",type:"buy",qty:0.14591021,purchasePrice:146.32,usdTotal:21.35,date:"2019-04-26",exchange:"DGA",fee:0},
  {id:605,member:"jorge",coin:"ETH",type:"buy",qty:0.5,purchasePrice:160.66,usdTotal:80.33,date:"2019-05-04",exchange:"Gemini",fee:0},
  {id:606,member:"jorge",coin:"LTC",type:"buy",qty:0.25228,purchasePrice:73.37,usdTotal:18.51,date:"2019-05-08",exchange:"Coinbase",fee:0},
  {id:607,member:"jorge",coin:"ETH",type:"buy",qty:0.437801,purchasePrice:169.78,usdTotal:74.33,date:"2019-05-09",exchange:"Gemini",fee:0},
  {id:608,member:"jorge",coin:"ETH",type:"buy",qty:1.0,purchasePrice:199.74,usdTotal:199.74,date:"2019-05-14",exchange:"Gemini",fee:0},
  {id:609,member:"jorge",coin:"XRP",type:"buy",qty:50.04,purchasePrice:0.37,usdTotal:18.51,date:"2019-05-14",exchange:"Coinbase",fee:0},
  {id:610,member:"jorge",coin:"XRP",type:"buy",qty:44.13,purchasePrice:0.42,usdTotal:18.51,date:"2019-05-16",exchange:"Coinbase",fee:0},
  {id:611,member:"jorge",coin:"LTC",type:"buy",qty:0.28869533,purchasePrice:97.02,usdTotal:28.01,date:"2019-05-16",exchange:"Coinbase",fee:0},
  {id:612,member:"jorge",coin:"ETC",type:"buy",qty:0.27548209,purchasePrice:7.3,usdTotal:2.01,date:"2019-05-17",exchange:"Coinbase Pro",fee:0},
  {id:613,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:7.28,usdTotal:21.84,date:"2019-05-17",exchange:"Coinbase Pro",fee:0},
  {id:614,member:"jorge",coin:"XRP",type:"buy",qty:35.14,purchasePrice:0.38,usdTotal:13.51,date:"2019-05-17",exchange:"Coinbase",fee:0},
  {id:615,member:"jorge",coin:"ZEC",type:"buy",qty:1.0,purchasePrice:74.8,usdTotal:74.8,date:"2019-05-20",exchange:"Gemini",fee:0},
  {id:616,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:7.49,usdTotal:14.98,date:"2019-05-21",exchange:"Coinbase Pro",fee:0},
  {id:617,member:"jorge",coin:"XRP",type:"buy",qty:23.29,purchasePrice:0.39,usdTotal:9.01,date:"2019-05-25",exchange:"Coinbase",fee:0},
  {id:618,member:"jorge",coin:"ETH",type:"buy",qty:0.08082681,purchasePrice:253.75,usdTotal:20.51,date:"2019-05-25",exchange:"Coinbase",fee:0},
  {id:619,member:"jorge",coin:"LTC",type:"buy",qty:0.4211,purchasePrice:114.01,usdTotal:48.01,date:"2019-05-28",exchange:"Gemini",fee:0},
  {id:620,member:"jorge",coin:"LTC",type:"buy",qty:0.30776,purchasePrice:105.6,usdTotal:32.5,date:"2019-05-31",exchange:"Gemini",fee:0},
  {id:621,member:"jorge",coin:"LTC",type:"buy",qty:0.29898382,purchasePrice:107.06,usdTotal:32.01,date:"2019-06-03",exchange:"Coinbase",fee:0},
  {id:622,member:"jorge",coin:"ETH",type:"buy",qty:0.07786054,purchasePrice:237.73,usdTotal:18.51,date:"2019-06-04",exchange:"Coinbase",fee:0},
  {id:623,member:"jorge",coin:"ETC",type:"buy",qty:4.0,purchasePrice:8.46,usdTotal:33.84,date:"2019-06-14",exchange:"Coinbase Pro",fee:0},
  {id:624,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:8.56,usdTotal:17.12,date:"2019-06-18",exchange:"Coinbase Pro",fee:0},
  {id:625,member:"jorge",coin:"XRP",type:"buy",qty:62.155769,purchasePrice:0.45,usdTotal:28.01,date:"2019-06-22",exchange:"Coinbase",fee:0},
  {id:626,member:"jorge",coin:"LTC",type:"buy",qty:0.28420404,purchasePrice:112.63,usdTotal:32.01,date:"2019-06-27",exchange:"Coinbase",fee:0},
  {id:627,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:7.97,usdTotal:23.91,date:"2019-06-28",exchange:"Coinbase Pro",fee:0},
  {id:628,member:"jorge",coin:"ETH",type:"buy",qty:0.077697,purchasePrice:321.89,usdTotal:25.01,date:"2019-06-29",exchange:"Coinbase",fee:0},
  {id:629,member:"jorge",coin:"XRP",type:"buy",qty:24.0,purchasePrice:0.34,usdTotal:8.12,date:"2019-07-13",exchange:"Coinbase",fee:0},
  {id:630,member:"jorge",coin:"LTC",type:"buy",qty:0.22601,purchasePrice:88.49,usdTotal:20.0,date:"2019-07-14",exchange:"Coinbase",fee:0},
  {id:631,member:"jorge",coin:"LTC",type:"buy",qty:0.22652,purchasePrice:87.85,usdTotal:19.9,date:"2019-07-15",exchange:"Coinbase",fee:0},
  {id:632,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:5.31,usdTotal:15.93,date:"2019-07-15",exchange:"Coinbase Pro",fee:0},
  {id:633,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:5.94,usdTotal:17.82,date:"2019-08-07",exchange:"Coinbase Pro",fee:0},
  {id:634,member:"jorge",coin:"LTC",type:"buy",qty:0.33504,purchasePrice:89.24,usdTotal:29.9,date:"2019-08-07",exchange:"Gemini",fee:0},
  {id:635,member:"jorge",coin:"LTC",type:"buy",qty:0.27797,purchasePrice:89.4,usdTotal:24.85,date:"2019-08-07",exchange:"Gemini",fee:0},
  {id:636,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:5.95,usdTotal:11.9,date:"2019-08-07",exchange:"Coinbase Pro",fee:0},
  {id:637,member:"jorge",coin:"LTC",type:"buy",qty:0.279232,purchasePrice:89.78,usdTotal:25.07,date:"2019-08-07",exchange:"Gemini",fee:0},
  {id:638,member:"jorge",coin:"LTC",type:"buy",qty:0.2800765,purchasePrice:88.94,usdTotal:24.91,date:"2019-08-08",exchange:"Gemini",fee:0},
  {id:639,member:"jorge",coin:"LTC",type:"buy",qty:0.2211318,purchasePrice:84.25,usdTotal:18.63,date:"2019-08-09",exchange:"Gemini",fee:0},
  {id:640,member:"jorge",coin:"LTC",type:"buy",qty:0.4726726,purchasePrice:84.33,usdTotal:39.86,date:"2019-08-13",exchange:"Gemini",fee:0},
  {id:641,member:"jorge",coin:"LTC",type:"buy",qty:0.26205,purchasePrice:76.32,usdTotal:20.0,date:"2019-08-15",exchange:"Gemini",fee:0},
  {id:642,member:"jorge",coin:"ETH",type:"buy",qty:0.106221,purchasePrice:187.25,usdTotal:19.89,date:"2019-08-15",exchange:"Gemini",fee:0},
  {id:643,member:"jorge",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0.26,usdTotal:13.24,date:"2019-08-16",exchange:"Coinbase",fee:0},
  {id:644,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:5.62,usdTotal:11.24,date:"2019-08-16",exchange:"Coinbase Pro",fee:0},
  {id:645,member:"jorge",coin:"ZEC",type:"buy",qty:0.41443635,purchasePrice:48.09,usdTotal:19.93,date:"2019-08-17",exchange:"Gemini",fee:0},
  {id:646,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:5.46,usdTotal:10.92,date:"2019-08-17",exchange:"Coinbase Pro",fee:0},
  {id:647,member:"jorge",coin:"ETH",type:"buy",qty:0.05089179,purchasePrice:195.91,usdTotal:9.97,date:"2019-08-20",exchange:"Gemini",fee:0},
  {id:648,member:"jorge",coin:"LTC",type:"buy",qty:0.31831589,purchasePrice:73.86,usdTotal:23.51,date:"2019-08-23",exchange:"Gemini",fee:0},
  {id:649,member:"jorge",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0.27,usdTotal:13.73,date:"2019-08-23",exchange:"Coinbase",fee:0},
  {id:650,member:"jorge",coin:"ETH",type:"buy",qty:0.05293557,purchasePrice:188.34,usdTotal:9.97,date:"2019-08-24",exchange:"Gemini",fee:0},
  {id:651,member:"jorge",coin:"LTC",type:"buy",qty:0.343057,purchasePrice:72.61,usdTotal:24.91,date:"2019-08-27",exchange:"Gemini",fee:0},
  {id:652,member:"jorge",coin:"ETH",type:"buy",qty:0.13325918,purchasePrice:187.0,usdTotal:24.92,date:"2019-08-27",exchange:"Gemini",fee:0},
  {id:653,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:7.26,usdTotal:14.52,date:"2019-08-28",exchange:"Coinbase Pro",fee:0},
  {id:654,member:"jorge",coin:"ETH",type:"buy",qty:0.08744712,purchasePrice:170.85,usdTotal:14.94,date:"2019-08-28",exchange:"Gemini",fee:0},
  {id:655,member:"jorge",coin:"ZEC",type:"buy",qty:0.556792,purchasePrice:44.88,usdTotal:24.99,date:"2019-08-29",exchange:"Gemini",fee:0},
  {id:656,member:"jorge",coin:"ZEC",type:"buy",qty:0.22393532,purchasePrice:44.52,usdTotal:9.97,date:"2019-08-31",exchange:"Gemini",fee:0},
  {id:657,member:"jorge",coin:"LTC",type:"buy",qty:0.2140719,purchasePrice:69.37,usdTotal:14.85,date:"2019-09-07",exchange:"Gemini",fee:0},
  {id:658,member:"jorge",coin:"ETH",type:"sell",qty:0.05572721,purchasePrice:174.78,usdTotal:9.74,date:"2019-09-07",exchange:"Gemini",fee:0},
  {id:659,member:"jorge",coin:"ZEC",type:"buy",qty:0.99606604,purchasePrice:44.67,usdTotal:44.49,date:"2019-09-13",exchange:"Gemini",fee:0},
  {id:660,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:6.23,usdTotal:12.46,date:"2019-09-13",exchange:"Coinbase",fee:0},
  {id:661,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:6.16,usdTotal:12.32,date:"2019-09-14",exchange:"Coinbase",fee:0},
  {id:662,member:"jorge",coin:"ETH",type:"buy",qty:0.23460594,purchasePrice:212.4,usdTotal:49.83,date:"2019-09-18",exchange:"Gemini",fee:0},
  {id:663,member:"jorge",coin:"ZEC",type:"buy",qty:0.68107649,purchasePrice:51.21,usdTotal:34.88,date:"2019-09-18",exchange:"Gemini",fee:0},
  {id:664,member:"jorge",coin:"ZEC",type:"buy",qty:0.769744,purchasePrice:49.38,usdTotal:38.01,date:"2019-09-19",exchange:"Gemini",fee:0},
  {id:665,member:"jorge",coin:"LTC",type:"buy",qty:3.0,purchasePrice:74.21,usdTotal:222.63,date:"2019-09-19",exchange:"Gemini",fee:0},
  {id:666,member:"jorge",coin:"ETC",type:"buy",qty:0.32894737,purchasePrice:6.11,usdTotal:2.01,date:"2019-09-19",exchange:"Coinbase",fee:0},
  {id:667,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:6.11,usdTotal:18.33,date:"2019-09-19",exchange:"Coinbase",fee:0},
  {id:668,member:"jorge",coin:"ETH",type:"buy",qty:0.13857769,purchasePrice:215.76,usdTotal:29.9,date:"2019-09-21",exchange:"Gemini",fee:0},
  {id:669,member:"jorge",coin:"ZEC",type:"buy",qty:0.52337826,purchasePrice:47.59,usdTotal:24.91,date:"2019-09-21",exchange:"Gemini",fee:0},
  {id:670,member:"jorge",coin:"ETC",type:"buy",qty:0.3350645,purchasePrice:6.0,usdTotal:2.01,date:"2019-09-23",exchange:"Coinbase",fee:0},
  {id:671,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:5.84,usdTotal:17.52,date:"2019-09-24",exchange:"Coinbase",fee:0},
  {id:672,member:"jorge",coin:"ETH",type:"buy",qty:0.12970015,purchasePrice:192.06,usdTotal:24.91,date:"2019-09-24",exchange:"Gemini",fee:0},
  {id:673,member:"jorge",coin:"ETH",type:"buy",qty:0.10584865,purchasePrice:188.29,usdTotal:19.93,date:"2019-09-24",exchange:"Gemini",fee:0},
  {id:674,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:5.53,usdTotal:11.06,date:"2019-09-24",exchange:"Coinbase",fee:0},
  {id:675,member:"jorge",coin:"ETH",type:"buy",qty:0.08860511,purchasePrice:168.73,usdTotal:14.95,date:"2019-09-24",exchange:"Gemini",fee:0},
  {id:676,member:"jorge",coin:"LTC",type:"buy",qty:0.2217927,purchasePrice:60.87,usdTotal:13.5,date:"2019-09-24",exchange:"Gemini",fee:0},
  {id:677,member:"jorge",coin:"LTC",type:"buy",qty:0.9563526,purchasePrice:57.32,usdTotal:54.82,date:"2019-09-24",exchange:"Gemini",fee:0},
  {id:678,member:"jorge",coin:"ETH",type:"buy",qty:0.15182403,purchasePrice:164.07,usdTotal:24.91,date:"2019-09-24",exchange:"Gemini",fee:0},
  {id:679,member:"jorge",coin:"ZEC",type:"buy",qty:0.50635782,purchasePrice:39.36,usdTotal:19.93,date:"2019-09-24",exchange:"Gemini",fee:0},
  {id:680,member:"jorge",coin:"XRP",type:"buy",qty:119.258223,purchasePrice:0.23,usdTotal:28.01,date:"2019-09-24",exchange:"Coinbase",fee:0},
  {id:681,member:"jorge",coin:"ETC",type:"buy",qty:3.43966933,purchasePrice:4.8,usdTotal:16.51,date:"2019-09-24",exchange:"Coinbase",fee:0},
  {id:682,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:4.7,usdTotal:9.4,date:"2019-09-28",exchange:"Coinbase",fee:0},
  {id:683,member:"jorge",coin:"LTC",type:"buy",qty:0.4503949,purchasePrice:55.8,usdTotal:25.13,date:"2019-10-06",exchange:"Gemini",fee:0},
  {id:684,member:"jorge",coin:"LTC",type:"buy",qty:0.7112863,purchasePrice:56.04,usdTotal:39.86,date:"2019-10-12",exchange:"Gemini",fee:0},
  {id:685,member:"jorge",coin:"ETC",type:"buy",qty:5.0,purchasePrice:4.74,usdTotal:23.7,date:"2019-10-12",exchange:"Coinbase",fee:0},
  {id:686,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:4.58,usdTotal:9.16,date:"2019-10-15",exchange:"Coinbase",fee:0},
  {id:687,member:"jorge",coin:"ETC",type:"buy",qty:0.22788551,purchasePrice:4.43,usdTotal:1.01,date:"2019-10-16",exchange:"Coinbase",fee:0},
  {id:688,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:4.58,usdTotal:9.16,date:"2019-10-16",exchange:"Coinbase",fee:0},
  {id:689,member:"jorge",coin:"XRP",type:"buy",qty:120.0,purchasePrice:0.29,usdTotal:35.23,date:"2019-10-21",exchange:"Coinbase",fee:0},
  {id:690,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:4.25,usdTotal:12.75,date:"2019-10-23",exchange:"Coinbase",fee:0},
  {id:691,member:"jorge",coin:"LTC",type:"buy",qty:1.0194789,purchasePrice:49.03,usdTotal:49.99,date:"2019-10-24",exchange:"Gemini",fee:0},
  {id:692,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:4.88,usdTotal:14.64,date:"2019-11-01",exchange:"Coinbase",fee:0},
  {id:693,member:"jorge",coin:"XRP",type:"buy",qty:25.0,purchasePrice:0.29,usdTotal:7.26,date:"2019-11-01",exchange:"Coinbase",fee:0},
  {id:694,member:"jorge",coin:"LTC",type:"buy",qty:0.6843002,purchasePrice:58.25,usdTotal:39.86,date:"2019-11-02",exchange:"Gemini",fee:0},
  {id:695,member:"jorge",coin:"LTC",type:"buy",qty:0.8232808,purchasePrice:63.45,usdTotal:52.24,date:"2019-11-05",exchange:"Gemini",fee:0},
  {id:696,member:"jorge",coin:"LTC",type:"buy",qty:0.5027335,purchasePrice:63.43,usdTotal:31.89,date:"2019-11-05",exchange:"Gemini",fee:0},
  {id:697,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:4.9,usdTotal:14.7,date:"2019-11-13",exchange:"Coinbase",fee:0},
  {id:698,member:"jorge",coin:"ZEC",type:"buy",qty:0.5449889,purchasePrice:36.57,usdTotal:19.93,date:"2019-11-13",exchange:"Gemini",fee:0},
  {id:699,member:"jorge",coin:"ETC",type:"buy",qty:4.0,purchasePrice:4.6,usdTotal:18.4,date:"2019-11-16",exchange:"Coinbase",fee:0},
  {id:700,member:"jorge",coin:"ETC",type:"buy",qty:4.0,purchasePrice:4.38,usdTotal:17.52,date:"2019-11-19",exchange:"Coinbase",fee:0},
  {id:701,member:"jorge",coin:"LTC",type:"buy",qty:0.3249496,purchasePrice:46.01,usdTotal:14.95,date:"2019-11-22",exchange:"Gemini",fee:0},
  {id:702,member:"jorge",coin:"ETC",type:"buy",qty:5.0,purchasePrice:3.67,usdTotal:18.35,date:"2019-11-22",exchange:"Coinbase",fee:0},
  {id:703,member:"jorge",coin:"ZEC",type:"buy",qty:0.99579734,purchasePrice:27.88,usdTotal:27.76,date:"2019-11-24",exchange:"Gemini",fee:0},
  {id:704,member:"jorge",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0.23,usdTotal:11.25,date:"2019-11-24",exchange:"Coinbase",fee:0},
  {id:705,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:3.84,usdTotal:11.52,date:"2019-11-27",exchange:"Coinbase",fee:0},
  {id:706,member:"jorge",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0.23,usdTotal:11.46,date:"2019-11-28",exchange:"Coinbase",fee:0},
  {id:707,member:"jorge",coin:"XRP",type:"buy",qty:60.0,purchasePrice:0.22,usdTotal:13.0,date:"2019-12-15",exchange:"Coinbase",fee:0},
  {id:708,member:"jorge",coin:"ETC",type:"buy",qty:5.0,purchasePrice:3.68,usdTotal:18.4,date:"2019-12-16",exchange:"Coinbase",fee:0},
  {id:709,member:"jorge",coin:"ETC",type:"buy",qty:5.0,purchasePrice:3.46,usdTotal:17.3,date:"2019-12-17",exchange:"Coinbase",fee:0},
  {id:710,member:"jorge",coin:"ZEC",type:"buy",qty:1.08223368,purchasePrice:27.9,usdTotal:30.19,date:"2019-12-17",exchange:"Gemini",fee:0},
  {id:711,member:"jorge",coin:"XRP",type:"buy",qty:100.26,purchasePrice:0.18,usdTotal:18.51,date:"2019-12-17",exchange:"Coinbase",fee:0},
  {id:712,member:"jorge",coin:"ETH",type:"buy",qty:0.37269511,purchasePrice:133.7,usdTotal:49.83,date:"2019-12-23",exchange:"Gemini",fee:0},
  {id:713,member:"jorge",coin:"XRP",type:"buy",qty:60.0,purchasePrice:0.19,usdTotal:11.45,date:"2019-12-23",exchange:"Coinbase",fee:0},
  {id:714,member:"jorge",coin:"XRP",type:"buy",qty:98.97,purchasePrice:0.19,usdTotal:18.51,date:"2020-01-03",exchange:"Coinbase",fee:0},
  {id:715,member:"jorge",coin:"ETC",type:"sell",qty:10.0,purchasePrice:9.2,usdTotal:92.0,date:"2020-01-17",exchange:"Coinbase",fee:0},
  {id:716,member:"jorge",coin:"ETH",type:"buy",qty:0.17924493,purchasePrice:222.38,usdTotal:39.86,date:"2020-02-11",exchange:"Gemini",fee:0},
  {id:717,member:"jorge",coin:"ETH",type:"buy",qty:0.09926211,purchasePrice:250.95,usdTotal:24.91,date:"2020-02-17",exchange:"Gemini",fee:0},
  {id:718,member:"jorge",coin:"ETH",type:"buy",qty:0.18826271,purchasePrice:264.68,usdTotal:49.83,date:"2020-02-21",exchange:"Gemini",fee:0},
  {id:719,member:"jorge",coin:"XRP",type:"buy",qty:85.940613,purchasePrice:0.27,usdTotal:23.51,date:"2020-02-21",exchange:"Coinbase",fee:0},
  {id:720,member:"jorge",coin:"XRP",type:"buy",qty:66.998583,purchasePrice:0.28,usdTotal:18.51,date:"2020-02-24",exchange:"Coinbase",fee:0},
  {id:721,member:"jorge",coin:"ETC",type:"buy",qty:2.39754106,purchasePrice:7.72,usdTotal:18.51,date:"2020-02-27",exchange:"Coinbase",fee:0},
  {id:722,member:"jorge",coin:"ETH",type:"buy",qty:0.11533172,purchasePrice:215.99,usdTotal:24.91,date:"2020-03-01",exchange:"Gemini",fee:0},
  {id:723,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:8.08,usdTotal:24.24,date:"2020-03-07",exchange:"Coinbase",fee:0},
  {id:724,member:"jorge",coin:"LTC",type:"buy",qty:0.3167553,purchasePrice:62.92,usdTotal:19.93,date:"2020-03-07",exchange:"Gemini",fee:0},
  {id:725,member:"jorge",coin:"LTC",type:"buy",qty:0.4361485,purchasePrice:57.11,usdTotal:24.91,date:"2020-03-08",exchange:"Gemini",fee:0},
  {id:726,member:"jorge",coin:"ZEC",type:"buy",qty:0.53552891,purchasePrice:46.51,usdTotal:24.91,date:"2020-03-08",exchange:"Gemini",fee:0},
  {id:727,member:"jorge",coin:"ETC",type:"buy",qty:5.0,purchasePrice:6.37,usdTotal:31.85,date:"2020-03-11",exchange:"Coinbase",fee:0},
  {id:728,member:"jorge",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0.21,usdTotal:10.3,date:"2020-03-11",exchange:"Coinbase",fee:0},
  {id:729,member:"jorge",coin:"LTC",type:"buy",qty:1.0310969,purchasePrice:46.39,usdTotal:47.83,date:"2020-03-12",exchange:"Gemini",fee:0},
  {id:730,member:"jorge",coin:"ZEC",type:"buy",qty:1.02680289,purchasePrice:38.82,usdTotal:39.86,date:"2020-03-12",exchange:"Gemini",fee:0},
  {id:731,member:"jorge",coin:"ETH",type:"buy",qty:0.0660531,purchasePrice:184.85,usdTotal:12.21,date:"2020-03-12",exchange:"Gemini",fee:0},
  {id:732,member:"jorge",coin:"LTC",type:"buy",qty:0.7310095,purchasePrice:34.08,usdTotal:24.91,date:"2020-03-12",exchange:"Gemini",fee:0},
  {id:733,member:"jorge",coin:"ETC",type:"buy",qty:4.46953561,purchasePrice:4.14,usdTotal:18.5,date:"2020-03-12",exchange:"Coinbase",fee:0},
  {id:734,member:"jorge",coin:"ZEC",type:"buy",qty:1.1131727,purchasePrice:22.38,usdTotal:24.91,date:"2020-03-16",exchange:"Gemini",fee:0},
  {id:735,member:"jorge",coin:"LTC",type:"buy",qty:1.0163306,purchasePrice:39.22,usdTotal:39.86,date:"2020-03-28",exchange:"Gemini",fee:0},
  {id:736,member:"jorge",coin:"ETH",type:"buy",qty:0.0757113,purchasePrice:131.68,usdTotal:9.97,date:"2020-03-28",exchange:"Gemini",fee:0},
  {id:737,member:"jorge",coin:"LTC",type:"buy",qty:0.6376453,purchasePrice:39.07,usdTotal:24.91,date:"2020-04-16",exchange:"Gemini",fee:0},
  {id:738,member:"jorge",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0.19,usdTotal:9.51,date:"2020-04-17",exchange:"Coinbase",fee:0},
  {id:739,member:"jorge",coin:"ETH",type:"buy",qty:0.30361888,purchasePrice:170.67,usdTotal:51.82,date:"2020-04-17",exchange:"Gemini",fee:0},
  {id:740,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:5.5,usdTotal:16.5,date:"2020-04-20",exchange:"Coinbase",fee:0},
  {id:741,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:5.26,usdTotal:10.52,date:"2020-04-20",exchange:"Coinbase",fee:0},
  {id:742,member:"jorge",coin:"LTC",type:"buy",qty:1.0511732,purchasePrice:47.4,usdTotal:49.83,date:"2020-05-02",exchange:"Gemini",fee:0},
  {id:743,member:"jorge",coin:"ETH",type:"buy",qty:0.19178989,purchasePrice:213.05,usdTotal:40.86,date:"2020-05-08",exchange:"Gemini",fee:0},
  {id:744,member:"jorge",coin:"ETC",type:"buy",qty:5.0,purchasePrice:7.23,usdTotal:36.15,date:"2020-05-08",exchange:"Coinbase",fee:0},
  {id:745,member:"jorge",coin:"BAT",type:"buy",qty:50.0,purchasePrice:0.22,usdTotal:11.13,date:"2020-05-08",exchange:"Coinbase",fee:0},
  {id:746,member:"jorge",coin:"ETC",type:"buy",qty:7.0,purchasePrice:6.33,usdTotal:44.31,date:"2020-05-10",exchange:"Coinbase",fee:0},
  {id:747,member:"jorge",coin:"LTC",type:"buy",qty:0.7897765,purchasePrice:42.9,usdTotal:33.88,date:"2020-05-10",exchange:"Gemini",fee:0},
  {id:748,member:"jorge",coin:"ETH",type:"buy",qty:0.1493648,purchasePrice:200.18,usdTotal:29.9,date:"2020-05-14",exchange:"Gemini",fee:0},
  {id:749,member:"jorge",coin:"LTC",type:"buy",qty:0.5748224,purchasePrice:43.34,usdTotal:24.91,date:"2020-05-14",exchange:"Gemini",fee:0},
  {id:750,member:"jorge",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0.2,usdTotal:10.01,date:"2020-05-16",exchange:"Coinbase",fee:0},
  {id:751,member:"jorge",coin:"BAT",type:"buy",qty:50.0,purchasePrice:0.21,usdTotal:10.26,date:"2020-05-19",exchange:"Coinbase",fee:0},
  {id:752,member:"jorge",coin:"ZEC",type:"buy",qty:1.01070508,purchasePrice:46.34,usdTotal:46.84,date:"2020-05-24",exchange:"Gemini",fee:0},
  {id:753,member:"jorge",coin:"ETH",type:"buy",qty:0.12561078,purchasePrice:238.04,usdTotal:29.9,date:"2020-06-03",exchange:"Gemini",fee:0},
  {id:754,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:7.01,usdTotal:21.03,date:"2020-06-03",exchange:"Coinbase",fee:0},
  {id:755,member:"jorge",coin:"ETC",type:"buy",qty:3.0,purchasePrice:6.87,usdTotal:20.61,date:"2020-06-05",exchange:"Coinbase",fee:0},
  {id:756,member:"jorge",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0.2,usdTotal:10.21,date:"2020-06-10",exchange:"Coinbase",fee:0},
  {id:757,member:"jorge",coin:"ETH",type:"buy",qty:0.10229031,purchasePrice:243.52,usdTotal:24.91,date:"2020-06-11",exchange:"Gemini",fee:0},
  {id:758,member:"jorge",coin:"ETH",type:"buy",qty:0.10656061,purchasePrice:233.76,usdTotal:24.91,date:"2020-06-12",exchange:"Gemini",fee:0},
  {id:759,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:2.58,usdTotal:12.9,date:"2020-06-23",exchange:"Coinbase",fee:0},
  {id:760,member:"jorge",coin:"XRP",type:"buy",qty:75.0,purchasePrice:0.18,usdTotal:13.76,date:"2020-06-27",exchange:"Coinbase",fee:0},
  {id:761,member:"jorge",coin:"ETC",type:"buy",qty:4.0,purchasePrice:5.52,usdTotal:22.08,date:"2020-06-27",exchange:"Coinbase",fee:0},
  {id:762,member:"jorge",coin:"EOS",type:"buy",qty:7.0,purchasePrice:2.3,usdTotal:16.1,date:"2020-06-27",exchange:"Coinbase",fee:0},
  {id:763,member:"jorge",coin:"EOS",type:"buy",qty:7.0,purchasePrice:2.4,usdTotal:16.8,date:"2020-07-01",exchange:"Coinbase",fee:0},
  {id:764,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:5.68,usdTotal:11.36,date:"2020-07-03",exchange:"Coinbase",fee:0},
  {id:765,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:2.47,usdTotal:12.35,date:"2020-07-05",exchange:"Coinbase",fee:0},
  {id:766,member:"jorge",coin:"EOS",type:"buy",qty:4.0,purchasePrice:2.66,usdTotal:10.64,date:"2020-07-09",exchange:"Coinbase",fee:0},
  {id:767,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:2.48,usdTotal:12.4,date:"2020-07-16",exchange:"Coinbase",fee:0},
  {id:768,member:"jorge",coin:"EOS",type:"buy",qty:4.0,purchasePrice:2.68,usdTotal:10.72,date:"2020-07-23",exchange:"Coinbase",fee:0},
  {id:769,member:"jorge",coin:"LTC",type:"buy",qty:1.1097017,purchasePrice:44.9,usdTotal:49.83,date:"2020-07-24",exchange:"Gemini",fee:0},
  {id:770,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:2.66,usdTotal:13.3,date:"2020-07-25",exchange:"Coinbase",fee:0},
  {id:771,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:2.92,usdTotal:14.6,date:"2020-07-28",exchange:"Coinbase",fee:0},
  {id:772,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:2.99,usdTotal:14.95,date:"2020-08-02",exchange:"Coinbase",fee:0},
  {id:773,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:3.08,usdTotal:30.8,date:"2020-08-06",exchange:"Coinbase",fee:0},
  {id:774,member:"jorge",coin:"ETH",type:"buy",qty:0.1626283,purchasePrice:368.45,usdTotal:59.92,date:"2020-08-07",exchange:"Gemini",fee:0},
  {id:775,member:"jorge",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0.29,usdTotal:14.53,date:"2020-08-07",exchange:"Coinbase",fee:0},
  {id:776,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:3.01,usdTotal:30.1,date:"2020-08-09",exchange:"Coinbase",fee:0},
  {id:777,member:"jorge",coin:"ETH",type:"buy",qty:0.51005863,purchasePrice:392.15,usdTotal:200.02,date:"2020-08-09",exchange:"Gemini",fee:0},
  {id:778,member:"jorge",coin:"ETH",type:"buy",qty:0.06579549,purchasePrice:378.6,usdTotal:24.91,date:"2020-08-12",exchange:"Gemini",fee:0},
  {id:779,member:"jorge",coin:"LTC",type:"buy",qty:0.4604103,purchasePrice:54.1,usdTotal:24.91,date:"2020-08-12",exchange:"Gemini",fee:0},
  {id:780,member:"jorge",coin:"ZEC",type:"buy",qty:0.31401755,purchasePrice:79.33,usdTotal:24.91,date:"2020-08-12",exchange:"Gemini",fee:0},
  {id:781,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:3.3,usdTotal:33.0,date:"2020-08-14",exchange:"Coinbase",fee:0},
  {id:782,member:"jorge",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0.3,usdTotal:15.1,date:"2020-08-16",exchange:"Coinbase",fee:0},
  {id:783,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:3.82,usdTotal:38.2,date:"2020-08-18",exchange:"Coinbase",fee:0},
  {id:784,member:"jorge",coin:"ETH",type:"buy",qty:0.06069927,purchasePrice:410.38,usdTotal:24.91,date:"2020-08-19",exchange:"Gemini",fee:0},
  {id:785,member:"jorge",coin:"ETH",type:"buy",qty:0.06044961,purchasePrice:411.58,usdTotal:24.88,date:"2020-08-19",exchange:"Gemini",fee:0},
  {id:786,member:"jorge",coin:"XRP",type:"buy",qty:30.0,purchasePrice:0.29,usdTotal:8.73,date:"2020-08-21",exchange:"Coinbase",fee:0},
  {id:787,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:3.43,usdTotal:17.15,date:"2020-08-21",exchange:"Coinbase",fee:0},
  {id:788,member:"jorge",coin:"ETH",type:"buy",qty:0.0730097,purchasePrice:408.85,usdTotal:29.85,date:"2020-08-21",exchange:"Gemini",fee:0},
  {id:789,member:"jorge",coin:"ETH",type:"buy",qty:0.09877494,purchasePrice:384.31,usdTotal:37.96,date:"2020-08-22",exchange:"Gemini",fee:0},
  {id:790,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:3.35,usdTotal:16.75,date:"2020-08-22",exchange:"Coinbase",fee:0},
  {id:791,member:"jorge",coin:"ETH",type:"buy",qty:0.25237741,purchasePrice:394.85,usdTotal:99.65,date:"2020-08-25",exchange:"Gemini",fee:0},
  {id:792,member:"jorge",coin:"EOS",type:"buy",qty:15.2283,purchasePrice:3.15,usdTotal:47.97,date:"2020-08-25",exchange:"Coinbase",fee:0},
  {id:793,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:6.66,usdTotal:13.32,date:"2020-08-25",exchange:"Coinbase",fee:0},
  {id:794,member:"jorge",coin:"ETH",type:"buy",qty:0.1256509,purchasePrice:396.57,usdTotal:49.83,date:"2020-08-28",exchange:"Gemini",fee:0},
  {id:795,member:"jorge",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0.29,usdTotal:14.29,date:"2020-08-31",exchange:"Coinbase",fee:0},
  {id:796,member:"jorge",coin:"EOS",type:"buy",qty:6.0645,purchasePrice:3.05,usdTotal:18.5,date:"2020-09-02",exchange:"Coinbase",fee:0},
  {id:797,member:"jorge",coin:"ETH",type:"buy",qty:0.06649976,purchasePrice:374.59,usdTotal:24.91,date:"2020-09-03",exchange:"Gemini",fee:0},
  {id:798,member:"jorge",coin:"LTC",type:"buy",qty:0.5315298,purchasePrice:46.86,usdTotal:24.91,date:"2020-09-03",exchange:"Gemini",fee:0},
  {id:799,member:"jorge",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0.25,usdTotal:12.4,date:"2020-09-03",exchange:"Coinbase",fee:0},
  {id:800,member:"jorge",coin:"EOS",type:"buy",qty:5.1055,purchasePrice:2.65,usdTotal:13.53,date:"2020-09-03",exchange:"Coinbase",fee:0},
  {id:801,member:"jorge",coin:"ETH",type:"buy",qty:0.06869798,purchasePrice:342.22,usdTotal:23.51,date:"2020-09-05",exchange:"Gemini",fee:0},
  {id:802,member:"jorge",coin:"ZEC",type:"buy",qty:0.42783453,purchasePrice:58.22,usdTotal:24.91,date:"2020-09-06",exchange:"Gemini",fee:0},
  {id:803,member:"jorge",coin:"LTC",type:"buy",qty:0.5210793,purchasePrice:47.8,usdTotal:24.91,date:"2020-09-06",exchange:"Gemini",fee:0},
  {id:804,member:"jorge",coin:"ETH",type:"buy",qty:0.07134864,purchasePrice:349.13,usdTotal:24.91,date:"2020-09-06",exchange:"Gemini",fee:0},
  {id:805,member:"jorge",coin:"EOS",type:"buy",qty:16.5299,purchasePrice:2.9,usdTotal:47.94,date:"2020-09-06",exchange:"Coinbase",fee:0},
  {id:806,member:"jorge",coin:"ETC",type:"buy",qty:4.0,purchasePrice:5.92,usdTotal:23.68,date:"2020-09-06",exchange:"Coinbase",fee:0},
  {id:807,member:"jorge",coin:"ETC",type:"buy",qty:2.0,purchasePrice:5.66,usdTotal:11.32,date:"2020-09-08",exchange:"Coinbase",fee:0},
  {id:808,member:"jorge",coin:"ETH",type:"buy",qty:0.14896884,purchasePrice:334.5,usdTotal:49.83,date:"2020-09-08",exchange:"Gemini",fee:0},
  {id:809,member:"jorge",coin:"LTC",type:"buy",qty:0.5208614,purchasePrice:47.82,usdTotal:24.91,date:"2020-09-10",exchange:"Gemini",fee:0},
  {id:810,member:"jorge",coin:"EOS",type:"buy",qty:6.6371,purchasePrice:2.79,usdTotal:18.52,date:"2020-09-12",exchange:"Coinbase",fee:0},
  {id:811,member:"jorge",coin:"LTC",type:"buy",qty:0.624642,purchasePrice:47.87,usdTotal:29.9,date:"2020-09-13",exchange:"Gemini",fee:0},
  {id:812,member:"jorge",coin:"EOS",type:"buy",qty:7.4184,purchasePrice:2.76,usdTotal:20.47,date:"2020-09-15",exchange:"Coinbase",fee:0},
  {id:813,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:2.73,usdTotal:27.3,date:"2020-09-19",exchange:"Coinbase",fee:0},
  {id:814,member:"jorge",coin:"ETH",type:"buy",qty:0.07282316,purchasePrice:342.06,usdTotal:24.91,date:"2020-09-21",exchange:"Gemini",fee:0},
  {id:815,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:2.59,usdTotal:25.9,date:"2020-09-21",exchange:"Coinbase",fee:0},
  {id:816,member:"jorge",coin:"LTC",type:"buy",qty:0.5793675,purchasePrice:43.0,usdTotal:24.91,date:"2020-09-21",exchange:"Gemini",fee:0},
  {id:817,member:"jorge",coin:"ETH",type:"buy",qty:0.07340465,purchasePrice:339.35,usdTotal:24.91,date:"2020-09-21",exchange:"Gemini",fee:0},
  {id:818,member:"jorge",coin:"ETH",type:"buy",qty:0.15612461,purchasePrice:319.17,usdTotal:49.83,date:"2020-09-23",exchange:"Gemini",fee:0},
  {id:819,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:2.46,usdTotal:24.6,date:"2020-09-23",exchange:"Coinbase",fee:0},
  {id:820,member:"jorge",coin:"CRV",type:"buy",qty:24.20599026,purchasePrice:0,usdTotal:0,date:"2020-09-25",exchange:"Binance",fee:0},
  {id:821,member:"jorge",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0.25,usdTotal:12.26,date:"2020-09-27",exchange:"Coinbase",fee:0},
  {id:822,member:"jorge",coin:"CRV",type:"buy",qty:19.96218363,purchasePrice:0,usdTotal:0,date:"2020-09-29",exchange:"Binance",fee:0},
  {id:823,member:"jorge",coin:"XRP",type:"buy",qty:30.0,purchasePrice:0.25,usdTotal:7.42,date:"2020-10-04",exchange:"Coinbase",fee:0},
  {id:824,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:2.54,usdTotal:12.7,date:"2020-10-04",exchange:"Coinbase",fee:0},
  {id:825,member:"jorge",coin:"ETH",type:"buy",qty:0.07346309,purchasePrice:339.08,usdTotal:24.91,date:"2020-10-06",exchange:"Gemini",fee:0},
  {id:826,member:"jorge",coin:"ZEC",type:"buy",qty:0.40840664,purchasePrice:60.99,usdTotal:24.91,date:"2020-10-06",exchange:"Gemini",fee:0},
  {id:827,member:"jorge",coin:"EOS",type:"buy",qty:4.0,purchasePrice:2.66,usdTotal:10.64,date:"2020-10-08",exchange:"Coinbase",fee:0},
  {id:828,member:"jorge",coin:"CRV",type:"buy",qty:26.97164038,purchasePrice:0,usdTotal:0,date:"2020-10-09",exchange:"Binance",fee:0},
  {id:829,member:"jorge",coin:"BAT",type:"buy",qty:61.7437434,purchasePrice:0.22,usdTotal:13.51,date:"2020-10-11",exchange:"Coinbase",fee:0},
  {id:830,member:"jorge",coin:"EOS",type:"buy",qty:4.0,purchasePrice:2.67,usdTotal:10.68,date:"2020-10-12",exchange:"Coinbase",fee:0},
  {id:831,member:"jorge",coin:"XRP",type:"buy",qty:50.0,purchasePrice:0.24,usdTotal:12.11,date:"2020-10-16",exchange:"Coinbase",fee:0},
  {id:832,member:"jorge",coin:"EOS",type:"buy",qty:7.2597,purchasePrice:2.55,usdTotal:18.51,date:"2020-10-18",exchange:"Coinbase",fee:0},
  {id:833,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:2.54,usdTotal:25.4,date:"2020-10-20",exchange:"Coinbase",fee:0},
  {id:834,member:"jorge",coin:"CRV",type:"buy",qty:103.86705789,purchasePrice:0,usdTotal:0,date:"2020-10-23",exchange:"Binance",fee:0},
  {id:835,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:2.66,usdTotal:26.6,date:"2020-10-25",exchange:"Coinbase",fee:0},
  {id:836,member:"jorge",coin:"EOS",type:"buy",qty:7.0,purchasePrice:2.69,usdTotal:18.83,date:"2020-10-28",exchange:"Coinbase",fee:0},
  {id:837,member:"jorge",coin:"EOS",type:"buy",qty:7.2597,purchasePrice:2.55,usdTotal:18.51,date:"2020-10-31",exchange:"Coinbase",fee:0},
  {id:838,member:"jorge",coin:"EOS",type:"buy",qty:7.8108,purchasePrice:2.37,usdTotal:18.51,date:"2020-11-04",exchange:"Coinbase",fee:0},
  {id:839,member:"jorge",coin:"ETH",type:"buy",qty:0.07233683,purchasePrice:413.34,usdTotal:29.9,date:"2020-11-05",exchange:"Gemini",fee:0},
  {id:840,member:"jorge",coin:"EOS",type:"buy",qty:9.0146,purchasePrice:2.61,usdTotal:23.53,date:"2020-11-07",exchange:"Coinbase",fee:0},
  {id:841,member:"jorge",coin:"EOS",type:"buy",qty:8.0,purchasePrice:2.53,usdTotal:20.24,date:"2020-11-11",exchange:"Coinbase",fee:0},
  {id:842,member:"jorge",coin:"EOS",type:"buy",qty:5.127,purchasePrice:2.64,usdTotal:13.54,date:"2020-11-17",exchange:"Coinbase",fee:0},
  {id:843,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:3.16,usdTotal:31.6,date:"2020-11-22",exchange:"Coinbase",fee:0},
  {id:844,member:"jorge",coin:"CRV",type:"buy",qty:30.99650914,purchasePrice:0,usdTotal:0,date:"2020-11-22",exchange:"Binance",fee:0},
  {id:845,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:3.04,usdTotal:15.2,date:"2020-11-23",exchange:"Coinbase",fee:0},
  {id:846,member:"jorge",coin:"ETH",type:"buy",qty:0.05864481,purchasePrice:509.85,usdTotal:29.9,date:"2020-11-26",exchange:"Gemini",fee:0},
  {id:847,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:2.94,usdTotal:14.7,date:"2020-11-26",exchange:"Coinbase",fee:0},
  {id:848,member:"jorge",coin:"ETH",type:"buy",qty:0.05064195,purchasePrice:491.88,usdTotal:24.91,date:"2020-11-26",exchange:"Gemini",fee:0},
  {id:849,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:2.85,usdTotal:14.25,date:"2020-11-27",exchange:"Coinbase",fee:0},
  {id:850,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:3.04,usdTotal:30.4,date:"2020-12-02",exchange:"Coinbase",fee:0},
  {id:851,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:3.09,usdTotal:30.9,date:"2020-12-03",exchange:"Coinbase",fee:0},
  {id:852,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:2.88,usdTotal:28.8,date:"2020-12-05",exchange:"Coinbase",fee:0},
  {id:853,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:2.81,usdTotal:28.1,date:"2020-12-09",exchange:"Coinbase",fee:0},
  {id:854,member:"jorge",coin:"CRV",type:"buy",qty:49.21858118,purchasePrice:0,usdTotal:0,date:"2020-12-09",exchange:"Binance",fee:0},
  {id:855,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:2.69,usdTotal:26.9,date:"2020-12-11",exchange:"Coinbase",fee:0},
  {id:856,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:2.79,usdTotal:13.95,date:"2020-12-13",exchange:"Coinbase",fee:0},
  {id:857,member:"jorge",coin:"EOS",type:"buy",qty:20.0,purchasePrice:0,usdTotal:0,date:"2020-12-24",exchange:"Binance",fee:0},
  {id:858,member:"jorge",coin:"EOS",type:"buy",qty:7.1277,purchasePrice:2.6,usdTotal:18.53,date:"2020-12-26",exchange:"Coinbase",fee:0},
  {id:859,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:2.74,usdTotal:13.7,date:"2020-12-27",exchange:"Coinbase",fee:0},
  {id:860,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:2.61,usdTotal:13.05,date:"2020-12-31",exchange:"Coinbase",fee:0},
  {id:861,member:"jorge",coin:"EOS",type:"buy",qty:7.0,purchasePrice:2.57,usdTotal:17.99,date:"2020-12-31",exchange:"Coinbase",fee:0},
  {id:862,member:"jorge",coin:"EOS",type:"buy",qty:7.0,purchasePrice:2.86,usdTotal:20.02,date:"2021-01-05",exchange:"Coinbase",fee:0},
  {id:863,member:"jorge",coin:"LTC",type:"buy",qty:1.11971,purchasePrice:177.99,usdTotal:199.3,date:"2021-01-08",exchange:"Coinbase",fee:0},
  {id:864,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:3.76,usdTotal:37.6,date:"2021-01-10",exchange:"Coinbase",fee:0},
  {id:865,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:3.06,usdTotal:15.3,date:"2021-01-11",exchange:"Coinbase",fee:0},
  {id:866,member:"jorge",coin:"ETH",type:"buy",qty:0.0536284,purchasePrice:929.17,usdTotal:49.83,date:"2021-01-11",exchange:"Gemini",fee:0},
  {id:867,member:"jorge",coin:"LTC",type:"buy",qty:0.4258235,purchasePrice:117.02,usdTotal:49.83,date:"2021-01-11",exchange:"Coinbase",fee:0},
  {id:868,member:"jorge",coin:"CRV",type:"buy",qty:73.41330537,purchasePrice:0,usdTotal:0,date:"2021-01-14",exchange:"Binance",fee:0},
  {id:869,member:"jorge",coin:"BAT",type:"buy",qty:50.0,purchasePrice:0.24,usdTotal:12.22,date:"2021-01-14",exchange:"Coinbase",fee:0},
  {id:870,member:"jorge",coin:"BAT",type:"buy",qty:150.49368024,purchasePrice:0.24,usdTotal:36.87,date:"2021-01-14",exchange:"Coinbase",fee:0},
  {id:871,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:2.75,usdTotal:13.75,date:"2021-01-14",exchange:"Coinbase",fee:0},
  {id:872,member:"jorge",coin:"ETH",type:"buy",qty:0.04303435,purchasePrice:1157.91,usdTotal:49.83,date:"2021-01-15",exchange:"Gemini",fee:0},
  {id:873,member:"jorge",coin:"EOS",type:"buy",qty:34.0,purchasePrice:2.82,usdTotal:95.88,date:"2021-01-20",exchange:"Coinbase",fee:0},
  {id:874,member:"jorge",coin:"ZEC",type:"buy",qty:2.90021014,purchasePrice:103.08,usdTotal:298.95,date:"2021-01-20",exchange:"Gemini",fee:0},
  {id:875,member:"jorge",coin:"BAT",type:"buy",qty:713.85952738,purchasePrice:0.28,usdTotal:199.3,date:"2021-01-20",exchange:"Gemini",fee:0},
  {id:876,member:"jorge",coin:"ETH",type:"buy",qty:0.43105733,purchasePrice:1387.08,usdTotal:597.91,date:"2021-01-20",exchange:"Gemini",fee:0},
  {id:877,member:"jorge",coin:"BCH",type:"buy",qty:1.0194805,purchasePrice:498.51,usdTotal:508.22,date:"2021-01-20",exchange:"Gemini",fee:0},
  {id:878,member:"jorge",coin:"ZEC",type:"buy",qty:1.0357678,purchasePrice:96.21,usdTotal:99.65,date:"2021-01-21",exchange:"Gemini",fee:0},
  {id:879,member:"jorge",coin:"ZEC",type:"buy",qty:0.55584125,purchasePrice:89.65,usdTotal:49.83,date:"2021-01-21",exchange:"Gemini",fee:0},
  {id:880,member:"jorge",coin:"EOS",type:"buy",qty:13.7637,purchasePrice:2.76,usdTotal:37.99,date:"2021-01-24",exchange:"Coinbase",fee:0},
  {id:881,member:"jorge",coin:"EOS",type:"buy",qty:7.0,purchasePrice:2.77,usdTotal:19.39,date:"2021-01-25",exchange:"Coinbase",fee:0},
  {id:882,member:"jorge",coin:"ETH",type:"buy",qty:0.02106836,purchasePrice:1419.19,usdTotal:29.9,date:"2021-01-29",exchange:"Gemini",fee:0},
  {id:883,member:"jorge",coin:"EOS",type:"buy",qty:6.6132,purchasePrice:2.8,usdTotal:18.52,date:"2021-01-29",exchange:"Coinbase",fee:0},
  {id:884,member:"jorge",coin:"EOS",type:"buy",qty:6.6062,purchasePrice:2.8,usdTotal:18.5,date:"2021-01-29",exchange:"Coinbase",fee:0},
  {id:885,member:"jorge",coin:"ETH",type:"buy",qty:0.13969372,purchasePrice:1426.69,usdTotal:199.3,date:"2021-02-02",exchange:"DGA",fee:0},
  {id:886,member:"jorge",coin:"EOS",type:"buy",qty:20.4056,purchasePrice:4.71,usdTotal:96.11,date:"2021-02-16",exchange:"Coinbase",fee:0},
  {id:887,member:"jorge",coin:"ETH",type:"buy",qty:0.155835,purchasePrice:1912.98,usdTotal:298.11,date:"2021-02-18",exchange:"DGA",fee:0},
  {id:888,member:"jorge",coin:"ETH",type:"sell",qty:0.1505982,purchasePrice:1928.31,usdTotal:290.4,date:"2021-02-19",exchange:"DGA",fee:0},
  {id:889,member:"jorge",coin:"EOS",type:"buy",qty:7.0,purchasePrice:4.9,usdTotal:34.3,date:"2021-02-20",exchange:"Coinbase",fee:0},
  {id:890,member:"jorge",coin:"ETH",type:"buy",qty:0.1060676,purchasePrice:1409.29,usdTotal:149.48,date:"2021-02-23",exchange:"Gemini",fee:0},
  {id:891,member:"jorge",coin:"EOS",type:"buy",qty:20.0,purchasePrice:3.49,usdTotal:69.8,date:"2021-02-23",exchange:"Coinbase",fee:0},
  {id:892,member:"jorge",coin:"ADA",type:"buy",qty:54.6,purchasePrice:0.91,usdTotal:49.92,date:"2021-02-23",exchange:"Bittrex",fee:0},
  {id:893,member:"jorge",coin:"ETH",type:"buy",qty:0.051586,purchasePrice:1491.3,usdTotal:76.93,date:"2021-02-26",exchange:"Gemini",fee:0},
  {id:894,member:"jorge",coin:"ETH",type:"buy",qty:0.03367027,purchasePrice:1479.94,usdTotal:49.83,date:"2021-02-26",exchange:"Gemini",fee:0},
  {id:895,member:"jorge",coin:"ADA",type:"buy",qty:44.8,purchasePrice:1.11,usdTotal:49.95,date:"2021-02-26",exchange:"Bittrex",fee:0},
  {id:896,member:"jorge",coin:"ETH",type:"sell",qty:0.04709999,purchasePrice:1482.17,usdTotal:69.81,date:"2021-02-26",exchange:"DGA",fee:0},
  {id:897,member:"jorge",coin:"EOS",type:"buy",qty:5.0879,purchasePrice:3.64,usdTotal:18.52,date:"2021-02-27",exchange:"Coinbase",fee:0},
  {id:898,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:3.93,usdTotal:19.65,date:"2021-03-04",exchange:"Coinbase",fee:0},
  {id:899,member:"jorge",coin:"ETH",type:"buy",qty:0.012922,purchasePrice:1664.6,usdTotal:21.51,date:"2021-03-07",exchange:"Coinbase",fee:0},
  {id:900,member:"jorge",coin:"ETH",type:"sell",qty:0.00989999,purchasePrice:1660.61,usdTotal:16.44,date:"2021-03-07",exchange:"DGA",fee:0},
  {id:901,member:"jorge",coin:"ETH",type:"buy",qty:0.02642105,purchasePrice:1886.0,usdTotal:49.83,date:"2021-03-13",exchange:"Gemini",fee:0},
  {id:902,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:3.82,usdTotal:19.1,date:"2021-03-15",exchange:"Coinbase",fee:0},
  {id:903,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:3.95,usdTotal:39.5,date:"2021-03-17",exchange:"Coinbase",fee:0},
  {id:904,member:"jorge",coin:"ETH",type:"buy",qty:0.02993853,purchasePrice:1837.43,usdTotal:55.01,date:"2021-03-18",exchange:"Gemini",fee:0},
  {id:905,member:"jorge",coin:"ETH",type:"sell",qty:0.0263,purchasePrice:1825.1,usdTotal:48.0,date:"2021-03-18",exchange:"DGA",fee:0},
  {id:906,member:"jorge",coin:"ADA",type:"buy",qty:40.0,purchasePrice:1.21,usdTotal:48.4,date:"2021-03-21",exchange:"Coinbase Pro",fee:0},
  {id:907,member:"jorge",coin:"ADA",type:"buy",qty:43.34,purchasePrice:1.18,usdTotal:51.1,date:"2021-03-22",exchange:"Coinbase Pro",fee:0},
  {id:908,member:"jorge",coin:"ETH",type:"buy",qty:0.11952313,purchasePrice:1667.46,usdTotal:199.3,date:"2021-03-24",exchange:"Gemini",fee:0},
  {id:909,member:"jorge",coin:"EOS",type:"buy",qty:12.8868,purchasePrice:3.73,usdTotal:48.07,date:"2021-03-25",exchange:"Coinbase",fee:0},
  {id:910,member:"jorge",coin:"ETH",type:"buy",qty:0.184729,purchasePrice:2082.24,usdTotal:384.65,date:"2021-04-05",exchange:"Gemini",fee:0},
  {id:911,member:"jorge",coin:"ETH",type:"sell",qty:0.18179884,purchasePrice:2040.0,usdTotal:370.87,date:"2021-04-05",exchange:"DGA",fee:0},
  {id:912,member:"jorge",coin:"ETH",type:"buy",qty:0.043575,purchasePrice:2206.77,usdTotal:96.16,date:"2021-04-23",exchange:"Coinbase",fee:0},
  {id:913,member:"jorge",coin:"EOS",type:"buy",qty:10.8464,purchasePrice:5.26,usdTotal:57.05,date:"2021-04-25",exchange:"Coinbase",fee:0},
  {id:914,member:"jorge",coin:"IQ",type:"buy",qty:3629.985,purchasePrice:0,usdTotal:0,date:"2021-04-25",exchange:"Newdex",fee:0},
  {id:915,member:"jorge",coin:"EOS",type:"sell",qty:12.79297464,purchasePrice:5.21,usdTotal:66.68,date:"2021-04-25",exchange:"DGA",fee:0},
  {id:916,member:"jorge",coin:"ETH",type:"sell",qty:0.03935,purchasePrice:2520.97,usdTotal:99.2,date:"2021-04-27",exchange:"DGA",fee:0},
  {id:917,member:"jorge",coin:"ETH",type:"sell",qty:0.0446,purchasePrice:2489.69,usdTotal:111.04,date:"2021-04-27",exchange:"DGA",fee:0},
  {id:918,member:"jorge",coin:"ETH",type:"sell",qty:0.03869962,purchasePrice:3500.55,usdTotal:135.47,date:"2021-05-06",exchange:"DGA",fee:0},
  {id:919,member:"jorge",coin:"ETH",type:"buy",qty:0.01424265,purchasePrice:3515.5,usdTotal:50.07,date:"2021-05-16",exchange:"Gemini",fee:0},
  {id:920,member:"jorge",coin:"ETH",type:"buy",qty:0.03989895,purchasePrice:2497.56,usdTotal:99.65,date:"2021-05-20",exchange:"Gemini",fee:0},
  {id:921,member:"jorge",coin:"ETH",type:"buy",qty:0.05147598,purchasePrice:1935.85,usdTotal:99.65,date:"2021-05-23",exchange:"Gemini",fee:0},
  {id:922,member:"jorge",coin:"ETH",type:"buy",qty:0.053782,purchasePrice:1913.09,usdTotal:102.89,date:"2021-05-23",exchange:"Gemini",fee:0},
  {id:923,member:"jorge",coin:"ETH",type:"sell",qty:0.02399999,purchasePrice:2084.17,usdTotal:50.02,date:"2021-05-23",exchange:"DGA",fee:0},
  {id:924,member:"jorge",coin:"DGB",type:"buy",qty:897.75874529,purchasePrice:0.06,usdTotal:49.83,date:"2021-06-17",exchange:"Bittrex",fee:0},
  {id:925,member:"jorge",coin:"DGB",type:"buy",qty:1368.83544955,purchasePrice:0.04,usdTotal:49.83,date:"2021-06-22",exchange:"Bittrex",fee:0},
  {id:926,member:"jorge",coin:"ETH",type:"sell",qty:0.02399995,purchasePrice:1886.25,usdTotal:45.27,date:"2021-06-22",exchange:"DGA",fee:0},
  {id:927,member:"jorge",coin:"DGB",type:"buy",qty:1319.3012455,purchasePrice:0.05,usdTotal:59.79,date:"2021-07-03",exchange:"Bittrex",fee:0},
  {id:928,member:"jorge",coin:"DGB",type:"buy",qty:1345.72884169,purchasePrice:0.04,usdTotal:59.79,date:"2021-07-06",exchange:"Bittrex",fee:0},
  {id:929,member:"jorge",coin:"EOS",type:"buy",qty:7.0,purchasePrice:3.88,usdTotal:27.16,date:"2021-07-06",exchange:"Coinbase",fee:0.5405},
  {id:930,member:"jorge",coin:"DGB",type:"buy",qty:2331.02270759,purchasePrice:0.04,usdTotal:87.69,date:"2021-07-14",exchange:"Bittrex",fee:0},
  {id:931,member:"jorge",coin:"ETH",type:"buy",qty:0.10311091,purchasePrice:1958.47,usdTotal:201.94,date:"2021-07-16",exchange:"Coinbase",fee:16.2763},
  {id:932,member:"jorge",coin:"ETH",type:"sell",qty:0.02612,purchasePrice:1885.15,usdTotal:49.24,date:"2021-07-17",exchange:"DGA",fee:0},
  {id:933,member:"jorge",coin:"ETH",type:"sell",qty:0.0618,purchasePrice:1894.66,usdTotal:117.09,date:"2021-07-19",exchange:"DGA",fee:0},
  {id:934,member:"jorge",coin:"ETH",type:"sell",qty:0.014292,purchasePrice:1863.98,usdTotal:26.64,date:"2021-07-19",exchange:"DGA",fee:0},
  {id:935,member:"jorge",coin:"DGB",type:"buy",qty:2955.29978807,purchasePrice:0.03,usdTotal:99.65,date:"2021-07-20",exchange:"Bittrex",fee:0},
  {id:936,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:3.28,usdTotal:32.8,date:"2021-07-20",exchange:"Coinbase",fee:1.99},
  {id:937,member:"jorge",coin:"ETH",type:"buy",qty:0.01574,purchasePrice:3050.19,usdTotal:48.01,date:"2021-08-07",exchange:"Coinbase",fee:0.9554},
  {id:938,member:"jorge",coin:"ETH",type:"buy",qty:0.063494,purchasePrice:3084.7,usdTotal:195.86,date:"2021-08-13",exchange:"DGA",fee:0},
  {id:939,member:"jorge",coin:"ADA",type:"sell",qty:6000.0,purchasePrice:2.92,usdTotal:17518.4,date:"2021-08-23",exchange:"Bittrex",fee:0},
  {id:940,member:"jorge",coin:"ETH",type:"buy",qty:0.02925179,purchasePrice:3406.63,usdTotal:99.65,date:"2021-08-31",exchange:"DGA",fee:0},
  {id:941,member:"jorge",coin:"DGB",type:"buy",qty:1626.89707443,purchasePrice:0.07,usdTotal:112.11,date:"2021-09-03",exchange:"Bittrex",fee:0},
  {id:942,member:"jorge",coin:"DGB",type:"buy",qty:559.76371779,purchasePrice:0.07,usdTotal:37.37,date:"2021-09-03",exchange:"Bittrex",fee:0},
  {id:943,member:"jorge",coin:"ADA",type:"buy",qty:96.974217,purchasePrice:2.08,usdTotal:201.71,date:"2021-09-21",exchange:"Bittrex",fee:8.0},
  {id:944,member:"jorge",coin:"DGB",type:"buy",qty:2150.90051235,purchasePrice:0.05,usdTotal:99.65,date:"2021-09-21",exchange:"Bittrex",fee:0},
  {id:945,member:"jorge",coin:"ETH",type:"buy",qty:0.05147832,purchasePrice:2894.81,usdTotal:149.02,date:"2021-09-21",exchange:"Gemini",fee:0},
  {id:946,member:"jorge",coin:"DGB",type:"buy",qty:2215.02848955,purchasePrice:0.04,usdTotal:98.57,date:"2021-09-21",exchange:"Bittrex",fee:0},
  {id:947,member:"jorge",coin:"EOS",type:"buy",qty:5.0,purchasePrice:4.01,usdTotal:20.05,date:"2021-09-24",exchange:"Coinbase",fee:0.2987},
  {id:948,member:"jorge",coin:"EOS",type:"buy",qty:10.0,purchasePrice:3.76,usdTotal:37.6,date:"2021-09-28",exchange:"Coinbase",fee:0.7482},
  {id:949,member:"jorge",coin:"DGB",type:"buy",qty:2364.76556068,purchasePrice:0.04,usdTotal:99.65,date:"2021-09-28",exchange:"Bittrex",fee:0},
  {id:950,member:"jorge",coin:"DGB",type:"buy",qty:2365.35514077,purchasePrice:0.04,usdTotal:99.65,date:"2021-09-29",exchange:"Bittrex",fee:0},
  {id:951,member:"jorge",coin:"ETH",type:"buy",qty:0.016725,purchasePrice:2984.16,usdTotal:49.91,date:"2021-10-01",exchange:"Gemini",fee:0},
  {id:952,member:"jorge",coin:"ETH",type:"buy",qty:0.02790128,purchasePrice:3446.44,usdTotal:96.16,date:"2021-10-02",exchange:"Gemini",fee:3.6925},
  {id:953,member:"jorge",coin:"ETH",type:"sell",qty:0.035722,purchasePrice:0,usdTotal:0,date:"2021-10-02",exchange:"KuCoin",fee:0},
  {id:954,member:"jorge",coin:"DGB",type:"buy",qty:2034.09263009,purchasePrice:0.05,usdTotal:99.65,date:"2021-10-25",exchange:"Bittrex",fee:0},
  {id:955,member:"jorge",coin:"ETH",type:"buy",qty:0.012591,purchasePrice:3975.06,usdTotal:50.05,date:"2021-10-27",exchange:"Gemini",fee:0},
  {id:956,member:"jorge",coin:"ETH",type:"buy",qty:0.012629,purchasePrice:3940.14,usdTotal:49.76,date:"2021-10-28",exchange:"Gemini",fee:0},
  {id:957,member:"jorge",coin:"ETH",type:"buy",qty:0.0116,purchasePrice:4299.14,usdTotal:49.87,date:"2021-10-31",exchange:"Gemini",fee:0},
  {id:958,member:"jorge",coin:"ETH",type:"buy",qty:0.026369,purchasePrice:4376.35,usdTotal:115.4,date:"2021-11-16",exchange:"Coinbase",fee:5.3084},
  {id:959,member:"jorge",coin:"ETH",type:"sell",qty:0.024466,purchasePrice:4364.42,usdTotal:106.78,date:"2021-11-16",exchange:"DGA",fee:0},
  {id:960,member:"jorge",coin:"DGB",type:"buy",qty:1997.81918058,purchasePrice:0.05,usdTotal:99.65,date:"2021-11-19",exchange:"Bittrex",fee:0},
  {id:961,member:"jorge",coin:"ETH",type:"buy",qty:0.105779,purchasePrice:4545.51,usdTotal:480.82,date:"2021-11-26",exchange:"Coinbase",fee:92.2212},
  {id:962,member:"jorge",coin:"ETH",type:"sell",qty:0.05202013,purchasePrice:4499.22,usdTotal:234.05,date:"2021-11-26",exchange:"DGA",fee:0},
  {id:963,member:"jorge",coin:"ETH",type:"sell",qty:0.05212018,purchasePrice:4489.62,usdTotal:234.0,date:"2021-11-26",exchange:"DGA",fee:0},
  {id:964,member:"jorge",coin:"ETH",type:"buy",qty:0.09419834,purchasePrice:0.11,usdTotal:0.01,date:"2021-11-26",exchange:"Coinbase",fee:0.0014},
  {id:965,member:"jorge",coin:"ETH",type:"sell",qty:0.092196,purchasePrice:4157.88,usdTotal:383.34,date:"2021-11-27",exchange:"DGA",fee:0},
  {id:966,member:"jorge",coin:"ETH",type:"buy",qty:0.03132158,purchasePrice:4605.13,usdTotal:144.24,date:"2021-11-30",exchange:"DGA",fee:5.76},
  {id:967,member:"jorge",coin:"DOT",type:"buy",qty:2.779,purchasePrice:35.8,usdTotal:99.49,date:"2021-12-03",exchange:"Coinbase Pro",fee:0},
  {id:968,member:"jorge",coin:"DOT",type:"buy",qty:1.829,purchasePrice:32.63,usdTotal:59.68,date:"2021-12-04",exchange:"Coinbase Pro",fee:0.1778},
  {id:969,member:"jorge",coin:"ETH",type:"buy",qty:0.0233714,purchasePrice:4114.43,usdTotal:96.16,date:"2021-12-04",exchange:"DGA",fee:3.6925},
  {id:970,member:"jorge",coin:"ETH",type:"sell",qty:0.02748795,purchasePrice:3940.27,usdTotal:108.31,date:"2021-12-04",exchange:"DGA",fee:0},
  {id:971,member:"jorge",coin:"ETH",type:"buy",qty:0.02539514,purchasePrice:3918.07,usdTotal:99.5,date:"2021-12-04",exchange:"DGA",fee:0.4975},
  {id:972,member:"jorge",coin:"DGB",type:"buy",qty:1997.28528983,purchasePrice:0.04,usdTotal:74.74,date:"2021-12-06",exchange:"Bittrex",fee:0},
  {id:973,member:"jorge",coin:"ETH",type:"buy",qty:0.026702,purchasePrice:3731.93,usdTotal:99.65,date:"2021-12-31",exchange:"DGA",fee:0},
  {id:974,member:"jorge",coin:"DOT",type:"buy",qty:1.966,purchasePrice:25.32,usdTotal:49.78,date:"2022-01-07",exchange:"Coinbase Pro",fee:0.1244},
  {id:975,member:"jorge",coin:"DGB",type:"buy",qty:1802.66318247,purchasePrice:0.03,usdTotal:49.83,date:"2022-01-11",exchange:"Bittrex",fee:0},
  {id:976,member:"jorge",coin:"ETH",type:"buy",qty:0.031052,purchasePrice:3209.13,usdTotal:99.65,date:"2022-01-14",exchange:"DGA",fee:0},
  {id:977,member:"jorge",coin:"DGB",type:"buy",qty:3725.74354663,purchasePrice:0.02,usdTotal:74.74,date:"2022-01-22",exchange:"Bittrex",fee:0},
  {id:978,member:"jorge",coin:"ETH",type:"buy",qty:0.12793111,purchasePrice:2405.36,usdTotal:307.72,date:"2022-01-23",exchange:"DGA",fee:37.7881},
  {id:979,member:"jorge",coin:"ETH",type:"sell",qty:0.0344,purchasePrice:2425.0,usdTotal:83.42,date:"2022-01-23",exchange:"DGA",fee:0},
  {id:980,member:"jorge",coin:"DGB",type:"buy",qty:916.75456051,purchasePrice:0.02,usdTotal:19.93,date:"2022-01-28",exchange:"Bittrex",fee:0},
  {id:981,member:"jorge",coin:"ETH",type:"buy",qty:0.040384,purchasePrice:2467.56,usdTotal:99.65,date:"2022-01-28",exchange:"Gemini",fee:0},
  {id:982,member:"jorge",coin:"DOT",type:"buy",qty:2.779,purchasePrice:17.9,usdTotal:49.74,date:"2022-01-28",exchange:"Coinbase Pro",fee:0.1244},
  {id:983,member:"jorge",coin:"ETH",type:"sell",qty:0.03939767,purchasePrice:2716.4,usdTotal:107.02,date:"2022-02-03",exchange:"DGA",fee:0},
  {id:984,member:"jorge",coin:"ETH",type:"buy",qty:0.017388,purchasePrice:2860.02,usdTotal:49.73,date:"2022-02-18",exchange:"DGA",fee:0.13},
  {id:985,member:"jorge",coin:"EOS",type:"buy",qty:46.0,purchasePrice:2.16,usdTotal:99.36,date:"2022-02-26",exchange:"Coinbase Pro",fee:0},
  {id:986,member:"jorge",coin:"ZEC",type:"buy",qty:1.00063,purchasePrice:99.6,usdTotal:99.66,date:"2022-02-28",exchange:"Gemini",fee:0.4983},
  {id:987,member:"jorge",coin:"DGB",type:"buy",qty:2555.15950583,purchasePrice:0.02,usdTotal:49.83,date:"2022-03-04",exchange:"Bittrex",fee:0},
  {id:988,member:"jorge",coin:"ETH",type:"buy",qty:0.050216,purchasePrice:2982.91,usdTotal:149.79,date:"2022-04-11",exchange:"Gemini",fee:0.3916},
  {id:989,member:"jorge",coin:"DGB",type:"buy",qty:2006.66976937,purchasePrice:0.02,usdTotal:49.83,date:"2022-04-16",exchange:"Bittrex",fee:0},
  {id:990,member:"jorge",coin:"DGB",type:"buy",qty:2664.47114244,purchasePrice:0.02,usdTotal:59.76,date:"2022-04-28",exchange:"Bittrex",fee:0},
  {id:991,member:"jorge",coin:"DOT",type:"buy",qty:3.346,purchasePrice:14.85,usdTotal:49.69,date:"2022-05-04",exchange:"Coinbase Pro",fee:0.1242},
  {id:992,member:"jorge",coin:"ETH",type:"buy",qty:0.054092,purchasePrice:2761.96,usdTotal:149.4,date:"2022-05-05",exchange:"DGA",fee:0},
  {id:993,member:"jorge",coin:"ADA",type:"buy",qty:92.86586767,purchasePrice:0.54,usdTotal:49.85,date:"2022-05-12",exchange:"Bittrex",fee:0},
  {id:994,member:"jorge",coin:"DOT",type:"buy",qty:6.744,purchasePrice:7.37,usdTotal:49.7,date:"2022-05-12",exchange:"Coinbase Pro",fee:0.2},
  {id:995,member:"jorge",coin:"DGB",type:"buy",qty:2224.35760552,purchasePrice:0.01,usdTotal:24.91,date:"2022-05-29",exchange:"Bittrex",fee:0},
  {id:996,member:"jorge",coin:"ETH",type:"sell",qty:1.01,purchasePrice:1875.81,usdTotal:1894.57,date:"2022-08-11",exchange:"Gemini",fee:0},
  {id:997,member:"jorge",coin:"ETH",type:"sell",qty:0.372519,purchasePrice:1995.76,usdTotal:743.46,date:"2022-08-13",exchange:"Gemini",fee:0},
  {id:998,member:"jorge",coin:"CRV",type:"buy",qty:110.302228,purchasePrice:0.91,usdTotal:100.0,date:"2022-10-08",exchange:"Gemini",fee:0},
  {id:999,member:"jorge",coin:"ADA",type:"buy",qty:298.78,purchasePrice:0.33,usdTotal:99.4,date:"2022-10-21",exchange:"Coinbase",fee:0},
  {id:1000,member:"jorge",coin:"DOT",type:"buy",qty:14.803,purchasePrice:6.71,usdTotal:99.4,date:"2022-10-29",exchange:"Coinbase Pro",fee:0},
  {id:1001,member:"jorge",coin:"CRV",type:"buy",qty:324.675324,purchasePrice:0.46,usdTotal:150.0,date:"2022-11-22",exchange:"Gemini",fee:0},
  {id:1002,member:"jorge",coin:"DOT",type:"buy",qty:33.289044,purchasePrice:4.5,usdTotal:149.8,date:"2022-12-23",exchange:"Coinbase Pro",fee:0},
  {id:1003,member:"jorge",coin:"ADA",type:"buy",qty:401.19097425,purchasePrice:0.25,usdTotal:99.65,date:"2022-12-28",exchange:"Coinbase",fee:0},
  {id:1004,member:"jorge",coin:"XRP",type:"buy",qty:543.496,purchasePrice:0.39,usdTotal:210.48,date:"2023-02-17",exchange:"Coinbase",fee:0},
  {id:1005,member:"jorge",coin:"CRV",type:"buy",qty:219.057788,purchasePrice:1.0,usdTotal:219.12,date:"2023-02-24",exchange:"Gemini",fee:0},
  {id:1006,member:"jorge",coin:"XRP",type:"buy",qty:393.3035,purchasePrice:0.37,usdTotal:147.32,date:"2023-02-24",exchange:"Coinbase",fee:0},
  {id:1007,member:"jorge",coin:"XLM",type:"buy",qty:2448.0,purchasePrice:0.08,usdTotal:198.78,date:"2023-03-08",exchange:"DGA",fee:0},
  {id:1008,member:"jorge",coin:"XLM",type:"buy",qty:1899.0,purchasePrice:0.08,usdTotal:149.07,date:"2023-03-09",exchange:"DGA",fee:0},
  {id:1009,member:"jorge",coin:"XLM",type:"buy",qty:1326.0,purchasePrice:0.07,usdTotal:99.45,date:"2023-03-10",exchange:"DGA",fee:0},
  {id:1010,member:"jorge",coin:"DGB",type:"buy",qty:16319.2,purchasePrice:0.01,usdTotal:153.4,date:"2023-04-03",exchange:"Bittrex",fee:0},
  {id:1011,member:"jorge",coin:"CRV",type:"buy",qty:131.274566,purchasePrice:0.83,usdTotal:109.56,date:"2023-05-09",exchange:"Gemini",fee:0},
  {id:1012,member:"jorge",coin:"DOT",type:"buy",qty:21.595368,purchasePrice:5.3,usdTotal:114.54,date:"2023-06-03",exchange:"Coinbase Pro",fee:0},
  {id:1013,member:"jorge",coin:"ETH",type:"buy",qty:0.078545,purchasePrice:1902.09,usdTotal:149.4,date:"2023-06-04",exchange:"Gemini",fee:0},
  {id:1014,member:"jorge",coin:"ADA",type:"buy",qty:198.89,purchasePrice:0.3,usdTotal:59.75,date:"2023-06-09",exchange:"Coinbase",fee:0},
  {id:1015,member:"jorge",coin:"DOT",type:"buy",qty:22.344303,purchasePrice:4.46,usdTotal:99.6,date:"2023-06-10",exchange:"Coinbase Pro",fee:0},
  {id:1016,member:"jorge",coin:"ZEC",type:"buy",qty:2.0,purchasePrice:24.24,usdTotal:48.48,date:"2023-06-14",exchange:"Gemini",fee:0},
  {id:1017,member:"jorge",coin:"CRV",type:"buy",qty:79.625574,purchasePrice:0.63,usdTotal:49.8,date:"2023-06-18",exchange:"Gemini",fee:0},
  {id:1018,member:"jorge",coin:"ETH",type:"sell",qty:0.078543,purchasePrice:1991.01,usdTotal:156.38,date:"2023-07-14",exchange:"Gemini",fee:0},
  {id:1019,member:"jorge",coin:"CRV",type:"buy",qty:178.25304069,purchasePrice:0.56,usdTotal:100.0,date:"2023-07-31",exchange:"Gemini",fee:0.26},
  {id:1020,member:"jorge",coin:"ETH",type:"buy",qty:0.3096417,purchasePrice:1614.77,usdTotal:500.0,date:"2023-08-17",exchange:"Kraken",fee:1.3},
  {id:1021,member:"jorge",coin:"CRV",type:"buy",qty:106.83760684,purchasePrice:0.47,usdTotal:50.0,date:"2023-08-23",exchange:"Gemini",fee:0.13},
  {id:1022,member:"jorge",coin:"ETH",type:"buy",qty:0.01469507,purchasePrice:1701.25,usdTotal:25.0,date:"2023-08-31",exchange:"Kraken",fee:0.04},
  {id:1023,member:"jorge",coin:"CRV",type:"buy",qty:112.15299272,purchasePrice:0.45,usdTotal:50.0,date:"2023-09-19",exchange:"Gemini",fee:0.13},
  {id:1024,member:"jorge",coin:"CRV",type:"buy",qty:171.82,purchasePrice:0.58,usdTotal:100.0,date:"2023-11-17",exchange:"Gemini",fee:0},
  {id:1025,member:"jorge",coin:"ZEC",type:"buy",qty:1.75,purchasePrice:28.6,usdTotal:50.05,date:"2023-11-19",exchange:"Kraken",fee:0.13},
  {id:1026,member:"jorge",coin:"CRV",type:"buy",qty:212.76595745,purchasePrice:0.52,usdTotal:110.0,date:"2024-01-07",exchange:"Gemini",fee:0.286},
  {id:1027,member:"jorge",coin:"CRV",type:"buy",qty:207.54716981,purchasePrice:0.53,usdTotal:110.0,date:"2024-01-20",exchange:"Gemini",fee:0.286},
  {id:1028,member:"jorge",coin:"CRV",type:"buy",qty:110.646903,purchasePrice:0.45,usdTotal:50.01,date:"2024-01-26",exchange:"Gemini",fee:0.13},
  {id:1029,member:"jorge",coin:"ZEC",type:"buy",qty:2.35849057,purchasePrice:21.2,usdTotal:50.0,date:"2024-04-15",exchange:"Kraken",fee:0.2},
  {id:1030,member:"jorge",coin:"CRV",type:"buy",qty:116.35514019,purchasePrice:0.43,usdTotal:49.8,date:"2024-04-15",exchange:"Gemini",fee:0.1992},
  {id:1031,member:"jorge",coin:"CRV",type:"buy",qty:210.52931579,purchasePrice:0.47,usdTotal:100.0,date:"2024-04-24",exchange:"Gemini",fee:0.4},
  {id:1032,member:"jorge",coin:"ZEC",type:"buy",qty:3.0,purchasePrice:27.09,usdTotal:81.27,date:"2024-05-25",exchange:"Kraken",fee:0},
  {id:1033,member:"jorge",coin:"CRV",type:"buy",qty:487.84,purchasePrice:0.3,usdTotal:148.79,date:"2024-06-13",exchange:"Gemini",fee:0},
  {id:1034,member:"jorge",coin:"CRV",type:"buy",qty:370.17,purchasePrice:0.27,usdTotal:99.21,date:"2024-07-07",exchange:"Gemini",fee:0.7937},
  {id:1035,member:"jorge",coin:"ETH",type:"buy",qty:0.03129822,purchasePrice:3195.07,usdTotal:100.0,date:"2024-08-01",exchange:"Kraken",fee:0.4},
  {id:1036,member:"jorge",coin:"ETH",type:"buy",qty:0.03955991,purchasePrice:2527.81,usdTotal:100.0,date:"2024-08-05",exchange:"Kraken",fee:0.4},
  {id:1037,member:"jorge",coin:"ETH",type:"buy",qty:0.04098342,purchasePrice:2440.01,usdTotal:100.0,date:"2024-08-27",exchange:"Kraken",fee:0.4},
  {id:1038,member:"jorge",coin:"ETH",type:"buy",qty:0.04128461,purchasePrice:2422.21,usdTotal:100.0,date:"2024-09-14",exchange:"Kraken",fee:0.4},
  {id:1039,member:"jorge",coin:"CRV",type:"buy",qty:343.25241433,purchasePrice:0.29,usdTotal:99.2,date:"2024-11-15",exchange:"Gemini",fee:0.3968},
  {id:1040,member:"jorge",coin:"ETH",type:"buy",qty:0.02780063,purchasePrice:3597.04,usdTotal:100.0,date:"2024-11-28",exchange:"Kraken",fee:0.4},
  {id:1041,member:"jorge",coin:"XLM",type:"sell",qty:1890.0,purchasePrice:0.55,usdTotal:1041.39,date:"2024-12-01",exchange:"DGA",fee:4.21},
  {id:1042,member:"jorge",coin:"XRP",type:"sell",qty:372.0,purchasePrice:2.7,usdTotal:1003.02,date:"2024-12-03",exchange:"Coinbase",fee:0},
  {id:1043,member:"jorge",coin:"ADA",type:"sell",qty:804.0,purchasePrice:1.27,usdTotal:1020.28,date:"2024-12-03",exchange:"Coinbase",fee:0},
  {id:1044,member:"jorge",coin:"ETH",type:"buy",qty:0.02570232,purchasePrice:3890.7,usdTotal:100.0,date:"2024-12-14",exchange:"Kraken",fee:0},
  {id:1045,member:"jorge",coin:"ETH",type:"buy",qty:0.03000732,purchasePrice:3332.52,usdTotal:100.0,date:"2025-01-02",exchange:"Kraken",fee:0.4},
  {id:1046,member:"jorge",coin:"ETH",type:"buy",qty:0.02940934,purchasePrice:3400.28,usdTotal:100.0,date:"2025-01-16",exchange:"Kraken",fee:0.4},
  {id:1047,member:"jorge",coin:"ETH",type:"buy",qty:0.03024227,purchasePrice:3306.63,usdTotal:100.0,date:"2025-01-31",exchange:"Kraken",fee:0.4},
  {id:1048,member:"jorge",coin:"ETH",type:"buy",qty:0.0372706,purchasePrice:2683.08,usdTotal:100.0,date:"2025-02-15",exchange:"Kraken",fee:0.4},
  {id:1049,member:"jorge",coin:"ETH",type:"buy",qty:0.04582825,purchasePrice:2182.06,usdTotal:100.0,date:"2025-03-01",exchange:"Kraken",fee:0.4},
  {id:1050,member:"jorge",coin:"ETH",type:"buy",qty:0.0488218,purchasePrice:2051.54,usdTotal:100.16,date:"2025-03-09",exchange:"Kraken",fee:0},
  {id:1051,member:"jorge",coin:"ETH",type:"buy",qty:0.05168012,purchasePrice:1934.98,usdTotal:100.0,date:"2025-03-15",exchange:"Kraken",fee:0},
  {id:1052,member:"jorge",coin:"BCH",type:"sell",qty:1.0194805,purchasePrice:501.94,usdTotal:511.72,date:"2025-07-18",exchange:"DGA",fee:0},
  {id:1053,member:"jorge",coin:"XLM",type:"sell",qty:3783.0,purchasePrice:0.49,usdTotal:1871.07,date:"2025-07-18",exchange:"DGA",fee:0},
  {id:1054,member:"jorge",coin:"CRV",type:"sell",qty:1198.09,purchasePrice:1.02,usdTotal:1222.05,date:"2025-07-18",exchange:"Gemini",fee:0},
  {id:1055,member:"jorge",coin:"XRP",type:"sell",qty:278.551532,purchasePrice:3.58,usdTotal:997.21,date:"2025-07-18",exchange:"Coinbase",fee:0},
  {id:1056,member:"jorge",coin:"ETH",type:"sell",qty:0.48005542,purchasePrice:3604.21,usdTotal:1730.22,date:"2025-07-18",exchange:"Kraken",fee:0},
  {id:1057,member:"jorge",coin:"ADA",type:"sell",qty:1698.15998704,purchasePrice:0.88,usdTotal:1500.0,date:"2025-07-21",exchange:"Coinbase",fee:0},
  {id:1058,member:"jorge",coin:"ZEC",type:"sell",qty:19.73395486,purchasePrice:128.0,usdTotal:2525.95,date:"2025-10-01",exchange:"Kraken",fee:0},
  {id:1059,member:"jorge",coin:"ZEC",type:"sell",qty:9.9982594,purchasePrice:251.71,usdTotal:2516.66,date:"2025-10-12",exchange:"Kraken",fee:0},
  {id:1060,member:"daniel",coin:"BTC",type:"buy",qty:0.00057899,purchasePrice:67703.59,usdTotal:40.00,date:"2026-03-01",exchange:"Coinbase",fee:0.80},
];

function generateChartData(baseVal, range = "ALL") {
  const pointsMap = { "7D": 7, "1M": 30, "3M": 90, "YTD": 100, "1Y": 52, "ALL": 120, "1W": 7 };
  const points = pointsMap[range] || 30;
  const startMult = range === "7D" || range === "1W" ? 0.95 : range === "1M" ? 0.88 : range === "3M" ? 0.80 : range === "YTD" ? 0.75 : 0.55;
  const data = [];
  let val = baseVal * startMult;
  const now = Date.now();
  const msBack = { "7D": 7, "1W": 7, "1M": 30, "3M": 90, "YTD": 100, "1Y": 365, "ALL": 365 * 5 }[range] || 365;
  for (let i = 0; i < points; i++) {
    val = val + (Math.random() - 0.38) * baseVal * 0.025;
    val = Math.max(val, baseVal * 0.3);
    const ts = new Date(now - ((points - i) / points) * msBack * 86400000);
    const label = ts.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    data.push({ t: i, v: Math.round(val * 100) / 100, label });
  }
  data[data.length - 1].v = baseVal;
  return data;
}

function generateBenchmarkData(baseVal, range, seed = 1.0) {
  const pointsMap = { "7D": 7, "1M": 30, "3M": 90, "YTD": 100, "1Y": 52, "ALL": 120, "1W": 7 };
  const points = pointsMap[range] || 30;
  const startMult = range === "7D" || range === "1W" ? 0.96 : range === "1M" ? 0.90 : range === "3M" ? 0.83 : 0.60;
  const data = [];
  let val = baseVal * startMult * seed;
  for (let i = 0; i < points; i++) {
    val = val + (Math.random() - 0.40) * baseVal * 0.02 * seed;
    val = Math.max(val, baseVal * 0.2);
    data.push({ t: i, bv: Math.round(val * 100) / 100 });
  }
  return data;
}

function mergeChartWithBenchmark(main, bench) {
  return main.map((d, i) => ({ ...d, bv: bench[i]?.bv ?? null }));
}

// Convert Firestore snapshots → chart format { t, v, label }
// getValue(snap) extracts the numeric value from a snapshot doc
function snapshotsToChart(snapshots, range, getValue) {
  if (!snapshots || snapshots.length === 0) return null;
  const msBack = { "7D": 7, "1W": 7, "1M": 30, "3M": 90, "YTD": 365, "1Y": 365, "ALL": 365 * 10 }[range] ?? 365 * 10;
  const cutoff = Date.now() - msBack * 86400000;
  const filtered = snapshots
    .filter(s => new Date(s.date).getTime() >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (filtered.length < 2) return null;
  return filtered.map((s, i) => {
    const d = new Date(s.date + "T12:00:00");
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { t: i, v: Math.round(getValue(s) * 100) / 100, label };
  });
}

const diversityData = [
  { name: "BTC", value: 68, color: "#f7931a" },
  { name: "ETH", value: 8, color: "#627eea" },
  { name: "ADA", value: 4, color: "#4da6ff" },
  { name: "Other", value: 20, color: "#00e676" },
];

const exchangeData = [
  { name: "Coinbase", value: 45, color: "#0052ff" },
  { name: "iTrust", value: 30, color: "#f7931a" },
  { name: "Kraken", value: 12, color: "#5741d9" },
  { name: "Gemini", value: 8, color: "#00dcfa" },
  { name: "Binance", value: 5, color: "#f0b90b" },
];

const perfData = [
  { q: "Q2'25", portfolio: 12, btc: 18, spy: 4 },
  { q: "Q3'25", portfolio: -8, btc: -14, spy: 2 },
  { q: "Q4'25", portfolio: 22, btc: 28, spy: 6 },
  { q: "Q1'26", portfolio: -5, btc: -9, spy: 1 },
];

const fmt = (n) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(0)}`;
const fmtFull = (n) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const BC = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const RJ = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const TOOLTIP_STYLE = { background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: "#fff" };

// ─── FIFO TAX ENGINE ─────────────────────────────────────────────────────────
// Historical ETH monthly prices for ETH-quoted trade conversion
const ETH_HIST = {
  "2017-12":400,"2018-01":900,"2018-02":800,"2018-03":550,"2018-04":500,
  "2018-05":660,"2018-06":550,"2018-07":470,"2018-08":330,"2018-09":220,
  "2018-10":210,"2018-11":180,"2018-12":100,"2019-01":120,"2019-02":150,
  "2019-03":140,"2019-04":175,"2019-05":245,"2019-06":310,"2019-07":220,
  "2019-08":190,"2019-09":185,"2019-10":175,"2019-11":185,"2019-12":130,
  "2020-01":165,"2020-02":260,"2020-03":140,"2020-04":175,"2020-05":205,
  "2020-06":240,"2020-07":315,"2020-08":395,"2020-09":360,"2020-10":380,
  "2020-11":465,"2020-12":600,"2021-01":1300,"2021-02":1700,"2021-03":1800,
  "2021-04":2300,"2021-05":2900,"2021-06":2500,"2021-07":2100,"2021-08":3100,
  "2021-09":3400,"2021-10":3800,"2021-11":4600,"2021-12":3800,
  "2022-01":3200,"2022-02":2900,"2022-03":2900,"2022-04":3100,"2022-05":2400,
  "2022-06":1800,"2022-07":1600,"2022-08":1900,"2022-09":1400,"2022-10":1300,
  "2022-11":1200,"2022-12":1200,"2023-01":1600,"2023-02":1650,"2023-03":1750,
  "2023-04":1900,"2023-05":1850,"2023-06":1900,"2023-07":1850,"2023-08":1700,
  "2023-09":1600,"2023-10":1700,"2023-11":2000,"2023-12":2200,
  "2024-01":2400,"2024-02":2900,"2024-03":3500,"2024-04":3200,"2024-05":3000,
  "2024-06":3400,"2024-07":3200,"2024-08":2600,"2024-09":2400,"2024-10":2500,
  "2024-11":3100,"2024-12":3800,"2025-01":3300,"2025-02":2700,"2025-03":2000,
  "2025-04":1800,"2025-05":2500,"2025-06":2500,"2025-07":3600,"2025-08":2800,
  "2025-09":2400,"2025-10":2600,"2025-11":3000,"2025-12":3200,
};

function ethToUsd(ethAmt, dateStr) {
  const ym = dateStr.slice(0,7); // "YYYY-MM"
  return ethAmt * (ETH_HIST[ym] || 2000);
}

function normalizeCostUsd(tx) {
  // Returns cost in USD for a buy transaction
  if (tx.usdTotal && tx.usdTotal > 0) return tx.usdTotal;
  // If quoted in ETH (usdTotal=0, purchasePrice in ETH units)
  if (tx.purchasePrice > 0 && tx.purchasePrice < 20) {
    // Likely ETH price per coin — convert
    return tx.qty * tx.purchasePrice * (ETH_HIST[tx.date.slice(0,7)] || 2000);
  }
  return tx.qty * tx.purchasePrice;
}

function runFifo(transactions, member, taxYear, currentPrices) {
  const sells = transactions
    .filter(t => t.member === member && t.type === "sell" && t.date.startsWith(taxYear))
    .sort((a,b) => a.date.localeCompare(b.date));

  if (sells.length === 0) return [];

  // Build buy lots per coin (chronological, all years up to taxYear)
  const lots = {};
  transactions
    .filter(t => t.member === member && t.type === "buy" && t.date.slice(0,4) <= taxYear)
    .sort((a,b) => a.date.localeCompare(b.date))
    .forEach(t => {
      if (!lots[t.coin]) lots[t.coin] = [];
      lots[t.coin].push({
        qty: t.qty,
        remaining: t.qty,
        costPerUnit: normalizeCostUsd(t) / t.qty,
        date: t.date,
        exchange: t.exchange,
        estimated: !t.usdTotal || t.usdTotal === 0,
      });
    });

  const disposals = [];

  sells.forEach(sell => {
    const coin = sell.coin;
    const salePrice = sell.purchasePrice > 0
      ? sell.purchasePrice
      : (currentPrices[coin] || 0);
    const proceeds = sell.qty * salePrice;
    let qtyNeeded = sell.qty;
    const coinLots = lots[coin] || [];
    let anyEstimated = false;
    let missingBasis = false;

    while (qtyNeeded > 0.000001 && coinLots.length > 0) {
      const lot = coinLots[0];
      if (lot.remaining <= 0) { coinLots.shift(); continue; }
      if (lot.estimated) anyEstimated = true;

      const qtyFromLot = Math.min(qtyNeeded, lot.remaining);
      const lotCost = qtyFromLot * lot.costPerUnit;
      const lotProceeds = (qtyFromLot / sell.qty) * proceeds;
      const gain = lotProceeds - lotCost;

      const acquiredDate = new Date(lot.date);
      const soldDate = new Date(sell.date);
      const holdDays = Math.round((soldDate - acquiredDate) / 86400000);
      const term = holdDays > 365 ? "long" : "short";

      disposals.push({
        coin,
        qty: parseFloat(qtyFromLot.toFixed(8)),
        acquiredDate: lot.date,
        soldDate: sell.date,
        holdDays,
        term,
        proceeds: parseFloat(lotProceeds.toFixed(2)),
        basis: parseFloat(lotCost.toFixed(2)),
        gain: parseFloat(gain.toFixed(2)),
        exchange: sell.exchange,
        lotExchange: lot.exchange,
        estimated: anyEstimated,
        missingBasis: false,
      });

      lot.remaining -= qtyFromLot;
      qtyNeeded -= qtyFromLot;
      if (lot.remaining < 0.000001) coinLots.shift();
    }

    // If still qty needed — no lots found
    if (qtyNeeded > 0.001) {
      disposals.push({
        coin, qty: parseFloat(qtyNeeded.toFixed(8)),
        acquiredDate: "UNKNOWN", soldDate: sell.date,
        holdDays: 0, term: "short",
        proceeds: parseFloat((qtyNeeded / sell.qty * proceeds).toFixed(2)),
        basis: 0, gain: parseFloat((qtyNeeded / sell.qty * proceeds).toFixed(2)),
        exchange: sell.exchange, lotExchange: "?",
        estimated: false, missingBasis: true,
      });
    }
  });

  return disposals;
}

// ─── TAX PAGE COMPONENT ───────────────────────────────────────────────────────
function TaxPage({ fmtFull, TRANSACTIONS, MEMBERS, COIN_PRICES, anthropicKey: globalApiKey }) {
  const [taxYear, setTaxYear] = useState("2026");
  const [member, setMember] = useState("jorge");
  const [tab, setTab] = useState("summary");
  const [filt, setFilt] = useState("all");
  const [exp, setExp] = useState(null);
  const [apiKey, setApiKey] = useState(globalApiKey || "");
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [computed, setComputed] = useState(null);
  const [computing, setComputing] = useState(false);

  const YEARS = ["2024","2025","2026"];
  const CC = {BTC:"#f7931a",ETH:"#627eea",XRP:"#00aae4",ADA:"#0033ad",CRV:"#e64980",
    ZEC:"#f4b728",XLM:"#7b63f2",ENS:"#5284ff",PAXG:"#d4a017",XMR:"#ff6600",
    LTC:"#999",EOS:"#443f54",ETC:"#669073",DOT:"#e6007a",DGB:"#0066cc",
    BAT:"#ff5000",IQ:"#ab26e2"};

  // Static 2025 fallback from CoinTracking export
  const STATIC_2025 = [
    {coin:"CRV",qty:341.88,acquiredDate:"2024-11-15",soldDate:"2025-07-17",holdDays:244,term:"short",proceeds:349,basis:99,gain:250,exchange:"Kraken",lotExchange:"Kraken",estimated:false,missingBasis:false},
    {coin:"ETH",qty:0.47933,acquiredDate:"VARIOUS",soldDate:"2025-07-17",holdDays:200,term:"short",proceeds:1721,basis:1304,gain:417,exchange:"Kraken",lotExchange:"Kraken",estimated:false,missingBasis:false},
    {coin:"BTC",qty:0.09179,acquiredDate:"VARIOUS",soldDate:"2025-07-18",holdDays:180,term:"short",proceeds:10761,basis:10876,gain:-115,exchange:"Kraken",lotExchange:"Kraken",estimated:false,missingBasis:false},
    {coin:"BTC",qty:0.03824,acquiredDate:"VARIOUS",soldDate:"2025-07-18",holdDays:100,term:"short",proceeds:4485,basis:4517,gain:-32,exchange:"Kraken",lotExchange:"Kraken",estimated:false,missingBasis:false},
    {coin:"ENS",qty:14.775,acquiredDate:"2025-08-09",soldDate:"2025-08-09",holdDays:0,term:"short",proceeds:498,basis:0,gain:498,exchange:"Kraken",lotExchange:"Kraken",estimated:false,missingBasis:true},
    {coin:"ETH",qty:0.00073,acquiredDate:"VARIOUS",soldDate:"2025-08-31",holdDays:50,term:"short",proceeds:3,basis:2,gain:1,exchange:"Kraken",lotExchange:"Kraken",estimated:false,missingBasis:false},
    {coin:"ZEC",qty:3.011,acquiredDate:"2025-10-12",soldDate:"2025-10-12",holdDays:0,term:"short",proceeds:754,basis:0,gain:754,exchange:"Kraken",lotExchange:"Kraken",estimated:false,missingBasis:true},
    {coin:"PAXG",qty:0.17585,acquiredDate:"VARIOUS",soldDate:"2025-05-10",holdDays:400,term:"long",proceeds:572,basis:325,gain:247,exchange:"Kraken",lotExchange:"Kraken",estimated:false,missingBasis:false},
    {coin:"XMR",qty:1.5,acquiredDate:"2021-01-10",soldDate:"2025-05-10",holdDays:1581,term:"long",proceeds:477,basis:258,gain:219,exchange:"Kraken",lotExchange:"Kraken",estimated:false,missingBasis:false},
    {coin:"XLM",qty:3782,acquiredDate:"VARIOUS",soldDate:"2025-07-17",holdDays:800,term:"long",proceeds:1862,basis:295,gain:1567,exchange:"Kraken",lotExchange:"Kraken",estimated:true,missingBasis:false},
    {coin:"CRV",qty:856.22,acquiredDate:"VARIOUS",soldDate:"2025-07-17",holdDays:500,term:"long",proceeds:874,basis:420,gain:454,exchange:"Kraken",lotExchange:"Kraken",estimated:false,missingBasis:false},
    {coin:"XRP",qty:278.55,acquiredDate:"VARIOUS",soldDate:"2025-07-17",holdDays:600,term:"long",proceeds:993,basis:98,gain:895,exchange:"Kraken",lotExchange:"Kraken",estimated:true,missingBasis:false},
    {coin:"ETH",qty:0.00073,acquiredDate:"2019-09-24",soldDate:"2025-07-17",holdDays:2124,term:"long",proceeds:3,basis:0,gain:3,exchange:"Kraken",lotExchange:"Kraken",estimated:false,missingBasis:false},
    {coin:"ADA",qty:1698.16,acquiredDate:"VARIOUS",soldDate:"2025-07-21",holdDays:700,term:"long",proceeds:1495,basis:286,gain:1209,exchange:"Kraken",lotExchange:"Kraken",estimated:true,missingBasis:false},
    {coin:"ADA",qty:801.84,acquiredDate:"VARIOUS",soldDate:"2025-07-21",holdDays:500,term:"long",proceeds:704,basis:74,gain:630,exchange:"Kraken",lotExchange:"Kraken",estimated:true,missingBasis:false},
    {coin:"ENS",qty:6.5,acquiredDate:"VARIOUS",soldDate:"2025-08-09",holdDays:400,term:"long",proceeds:219,basis:246,gain:-27,exchange:"Kraken",lotExchange:"Kraken",estimated:false,missingBasis:false},
    {coin:"ETH",qty:0.999,acquiredDate:"VARIOUS",soldDate:"2025-08-31",holdDays:600,term:"long",proceeds:4439,basis:343,gain:4096,exchange:"Kraken",lotExchange:"Kraken",estimated:false,missingBasis:false},
    {coin:"ZEC",qty:19.734,acquiredDate:"VARIOUS",soldDate:"2025-10-01",holdDays:500,term:"long",proceeds:2520,basis:698,gain:1822,exchange:"Kraken",lotExchange:"Kraken",estimated:false,missingBasis:false},
    {coin:"ZEC",qty:6.987,acquiredDate:"VARIOUS",soldDate:"2025-10-12",holdDays:600,term:"long",proceeds:1749,basis:507,gain:1242,exchange:"Kraken",lotExchange:"Kraken",estimated:false,missingBasis:false},
    {coin:"BTC",qty:0.000015,acquiredDate:"2023-08-17",soldDate:"2025-10-13",holdDays:787,term:"long",proceeds:2,basis:0,gain:2,exchange:"Kraken Earn",lotExchange:"Kraken Earn",estimated:false,missingBasis:false},
  ];

  function computeReport() {
    setComputing(true);
    setAiSummary("");
    setAiError("");
    setExp(null);
    setTimeout(() => {
      let disposals;
      if (taxYear === "2025" && member === "jorge") {
        disposals = STATIC_2025; // Use verified CoinTracking data for 2025 Jorge
      } else {
        disposals = runFifo(TRANSACTIONS, member, taxYear, COIN_PRICES);
      }
      setComputed(disposals);
      setComputing(false);
      setTab("summary");
    }, 100);
  }

  const disposals = computed || (taxYear === "2025" && member === "jorge" ? STATIC_2025 : null);
  const rows = disposals ? (filt === "all" ? disposals : disposals.filter(d => d.term === filt)) : [];

  const stGain = disposals ? disposals.filter(d=>d.term==="short").reduce((a,d)=>a+d.gain,0) : 0;
  const ltGain = disposals ? disposals.filter(d=>d.term==="long").reduce((a,d)=>a+d.gain,0) : 0;
  const stProc = disposals ? disposals.filter(d=>d.term==="short").reduce((a,d)=>a+d.proceeds,0) : 0;
  const ltProc = disposals ? disposals.filter(d=>d.term==="long").reduce((a,d)=>a+d.proceeds,0) : 0;
  const stBasis = disposals ? disposals.filter(d=>d.term==="short").reduce((a,d)=>a+d.basis,0) : 0;
  const ltBasis = disposals ? disposals.filter(d=>d.term==="long").reduce((a,d)=>a+d.basis,0) : 0;
  const totalGain = stGain + ltGain;
  const flagged = disposals ? disposals.filter(d=>d.missingBasis||d.estimated).length : 0;
  const memberName = MEMBERS.find(m=>m.id===member)?.name || member;

  async function generateAiSummary() {
    if (!apiKey.trim()) { setAiError("Enter your Anthropic API key in Settings first."); return; }
    if (!disposals || disposals.length === 0) { setAiError("Generate the report first."); return; }
    setAiLoading(true);
    setAiSummary("");
    setAiError("");

    const summaryData = {
      member: memberName,
      taxYear,
      totalDisposals: disposals.length,
      stGain: Math.round(stGain),
      ltGain: Math.round(ltGain),
      totalGain: Math.round(totalGain),
      totalProceeds: Math.round(stProc + ltProc),
      totalBasis: Math.round(stBasis + ltBasis),
      flaggedItems: flagged,
      topGains: disposals.filter(d=>d.gain>0).sort((a,b)=>b.gain-a.gain).slice(0,5).map(d=>({coin:d.coin,gain:Math.round(d.gain),term:d.term})),
      topLosses: disposals.filter(d=>d.gain<0).sort((a,b)=>a.gain-b.gain).slice(0,3).map(d=>({coin:d.coin,loss:Math.round(d.gain),term:d.term})),
      coinsTraded: [...new Set(disposals.map(d=>d.coin))],
    };

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are a crypto tax assistant helping a family track their cryptocurrency tax obligations in the United States. Provide clear, practical, plain-English summaries. Always remind the user this is for planning only and they should consult a tax professional. Be concise and specific to the numbers provided.",
          messages: [{
            role: "user",
            content: `Generate a tax summary for ${summaryData.member}'s ${summaryData.taxYear} cryptocurrency activity.\n\nData:\n${JSON.stringify(summaryData, null, 2)}\n\nProvide:\n1. A 2-3 sentence plain-English overview of the tax situation\n2. Key observations (e.g. predominantly long-term gains, specific coins driving gains/losses)\n3. Any flags or concerns (missing basis, estimated prices)\n4. One specific tax planning note for next year\n\nKeep it under 250 words. Format with clear sections.`
          }]
        })
      });
      const data = await res.json();
      if (data.error) { setAiError(data.error.message); }
      else { setAiSummary(data.content[0].text); }
    } catch(e) {
      setAiError("API error: " + e.message);
    }
    setAiLoading(false);
  }

  const tabBtn = (id, lbl) => (
    <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"8px 4px",fontSize:12,fontWeight:600,borderRadius:9,background:tab===id?"#00e676":"#111",color:tab===id?"#000":"#555",border:tab===id?"none":"1px solid #1e1e1e",cursor:"pointer"}}>{lbl}</button>
  );

  return (
    <div className="fade-in">
      {/* ── HEADER / CONTROLS ── */}
      <div style={{padding:"18px 18px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <div><div className="lbl">Tax Reporting</div><div style={{fontSize:22,fontWeight:700,color:"#fff",letterSpacing:"-0.02em"}}>FIFO Engine</div></div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5}}>
            <span style={{fontSize:10,fontWeight:700,color:"#f7931a",background:"#f7931a18",border:"1px solid #f7931a33",borderRadius:6,padding:"3px 9px"}}>BETA</span>
            <span style={{fontSize:10,color:"#555"}}>FIFO · US · USD</span>
          </div>
        </div>

        {/* Year + Member selectors */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
          <div>
            <div style={{fontSize:10,color:"#555",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5}}>Tax Year</div>
            <div style={{display:"flex",gap:5}}>
              {YEARS.map(y=>(
                <button key={y} onClick={()=>setTaxYear(y)} style={{flex:1,padding:"7px 4px",fontSize:12,fontWeight:700,borderRadius:8,background:taxYear===y?"#fff":"#141414",color:taxYear===y?"#000":"#555",border:taxYear===y?"none":"1px solid #222",cursor:"pointer"}}>{y}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:10,color:"#555",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5}}>Portfolio</div>
            <select value={member} onChange={e=>setMember(e.target.value)}
              style={{width:"100%",background:"#141414",border:"1px solid #222",borderRadius:8,color:"#ccc",fontSize:12,fontWeight:600,padding:"7px 10px",cursor:"pointer",appearance:"none"}}>
              {MEMBERS.map(m=>(<option key={m.id} value={m.id}>{m.name}</option>))}
            </select>
          </div>
        </div>

        {/* Generate button */}
        <button onClick={computeReport} disabled={computing}
          style={{width:"100%",background:computing?"#1a1a1a":"#00e676",border:"none",borderRadius:10,padding:"12px",fontSize:14,fontWeight:700,color:computing?"#555":"#000",cursor:computing?"not-allowed":"pointer",marginBottom:14,transition:"all 0.2s"}}>
          {computing ? "⚙ Computing FIFO..." : disposals ? `↺ Regenerate ${taxYear} Report` : `⚡ Generate ${taxYear} Tax Report`}
        </button>

        {disposals && (
          <>
            {/* Hero card */}
            <div style={{background:totalGain>=0?"linear-gradient(135deg,#0f1f0f,#0d1a0d)":"linear-gradient(135deg,#1f0f0f,#1a0d0d)",border:totalGain>=0?"1px solid #1a3a1a":"1px solid #3a1a1a",borderRadius:14,padding:"16px 18px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                <div>
                  <div className="lbl" style={{marginBottom:4}}>Net Capital Gain · {taxYear}</div>
                  <div style={{fontSize:32,fontWeight:700,color:totalGain>=0?"#00e676":"#ff4444",letterSpacing:"-0.02em"}}>{totalGain>=0?"+":""}{fmtFull(totalGain)}</div>
                </div>
                {flagged>0 && (
                  <span style={{fontSize:10,fontWeight:700,color:"#f7931a",background:"#f7931a18",border:"1px solid #f7931a44",borderRadius:6,padding:"4px 8px",marginTop:2}}>⚠ {flagged} flagged</span>
                )}
              </div>
              <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
                <div><div style={{fontSize:10,color:"#555",marginBottom:2}}>Proceeds</div><div style={{fontSize:13,fontWeight:600,color:"#aaa"}}>{fmtFull(stProc+ltProc)}</div></div>
                <div><div style={{fontSize:10,color:"#555",marginBottom:2}}>Cost Basis</div><div style={{fontSize:13,fontWeight:600,color:"#aaa"}}>{fmtFull(stBasis+ltBasis)}</div></div>
                <div><div style={{fontSize:10,color:"#555",marginBottom:2}}>Events</div><div style={{fontSize:13,fontWeight:600,color:"#aaa"}}>{disposals.length}</div></div>
                <div><div style={{fontSize:10,color:"#555",marginBottom:2}}>Member</div><div style={{fontSize:13,fontWeight:600,color:"#aaa"}}>{memberName}</div></div>
              </div>
            </div>

            {/* Tab nav */}
            <div style={{display:"flex",gap:6,marginBottom:16}}>
              {tabBtn("summary","Summary")}
              {tabBtn("ledger","Sales Ledger")}
              {tabBtn("ai","AI Analysis")}
              {tabBtn("settings","Settings")}
            </div>
          </>
        )}

        {!disposals && !computing && (
          <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:14,padding:"28px 18px",textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:28,marginBottom:10}}>📊</div>
            <div style={{fontSize:14,fontWeight:600,color:"#555",marginBottom:6}}>No report generated yet</div>
            <div style={{fontSize:12,color:"#333"}}>Select a year and portfolio above, then tap Generate.</div>
          </div>
        )}
      </div>

      {/* ── SUMMARY TAB ── */}
      {disposals && tab==="summary" && (<div style={{padding:"0 18px"}}>
        {/* ST / LT cards */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:14,padding:14}}>
            <div style={{fontSize:10,color:"#555",fontWeight:600,textTransform:"uppercase",marginBottom:6}}>Short-Term</div>
            <div style={{fontSize:22,fontWeight:700,color:stGain>=0?"#ffb347":"#ff4444",marginBottom:4}}>{stGain>=0?"+":""}{fmtFull(stGain)}</div>
            <div style={{fontSize:10,color:"#555"}}>Proceeds {fmtFull(stProc)}</div>
            <div style={{fontSize:10,color:"#444",fontStyle:"italic",marginTop:3}}>10-37% rate</div>
          </div>
          <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:14,padding:14}}>
            <div style={{fontSize:10,color:"#555",fontWeight:600,textTransform:"uppercase",marginBottom:6}}>Long-Term</div>
            <div style={{fontSize:22,fontWeight:700,color:ltGain>=0?"#00e676":"#ff4444",marginBottom:4}}>{ltGain>=0?"+":""}{fmtFull(ltGain)}</div>
            <div style={{fontSize:10,color:"#555"}}>Proceeds {fmtFull(ltProc)}</div>
            <div style={{fontSize:10,color:"#444",fontStyle:"italic",marginTop:3}}>0-20% rate</div>
          </div>
        </div>

        {/* Schedule D bar */}
        {totalGain !== 0 && (<div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:14,padding:"14px 16px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
            <span style={{fontSize:12,fontWeight:600,color:"#888"}}>Schedule D Breakdown</span>
            <span style={{fontSize:11,color:"#555"}}>Form 8949</span>
          </div>
          <div style={{height:10,borderRadius:6,background:"#1a1a1a",overflow:"hidden",marginBottom:10,display:"flex"}}>
            {totalGain!==0 && <><div style={{width:(Math.abs(stGain)/Math.abs(totalGain)*100).toFixed(1)+"%",background:stGain>=0?"#ffb347":"#ff6666"}}/><div style={{flex:1,background:ltGain>=0?"#00e676":"#ff4444"}}/></>}
          </div>
          <div style={{display:"flex",gap:16}}>
            <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:"#ffb347"}}/><span style={{fontSize:11,color:"#666"}}>ST {(Math.abs(stGain)/Math.abs(totalGain)*100).toFixed(0)+"%"}</span></div>
            <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:"#00e676"}}/><span style={{fontSize:11,color:"#666"}}>LT {(Math.abs(ltGain)/Math.abs(totalGain)*100).toFixed(0)+"%"}</span></div>
          </div>
        </div>)}

        {/* IRS form lines */}
        <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:14,overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid #161616"}}><span style={{fontSize:10,fontWeight:700,color:"#444",letterSpacing:"0.08em",textTransform:"uppercase"}}>IRS Forms Summary</span></div>
          {[
            ["Form 8949 Part I","Short-term disposals",stGain,"#ffb347",false],
            ["Form 8949 Part II","Long-term disposals",ltGain,"#00e676",false],
            ["Schedule D Line 7","Net short-term",stGain,"#ffb347",false],
            ["Schedule D Line 15","Net long-term",ltGain,"#00e676",false],
            ["Schedule D Line 16","Total capital gain",totalGain,"#00e676",true],
          ].map(([f,d,v,c,b],i,a)=>(
            <div key={f} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderBottom:i<a.length-1?"1px solid #0e0e0e":"none",background:b?"#0d1a0d":"transparent"}}>
              <div><div style={{fontSize:12,fontWeight:b?700:500,color:b?"#ccc":"#888"}}>{f}</div><div style={{fontSize:10,color:"#444",marginTop:1}}>{d}</div></div>
              <span style={{fontSize:b?15:13,fontWeight:b?700:600,color:v>=0?c:"#ff4444"}}>{v>=0?"+":""}{fmtFull(v)}</span>
            </div>
          ))}
        </div>

        {/* Gains by coin */}
        <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:14,overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid #161616"}}><span style={{fontSize:10,fontWeight:700,color:"#444",letterSpacing:"0.08em",textTransform:"uppercase"}}>Gains by Asset</span></div>
          {Object.entries(disposals.reduce((a,d)=>{if(!a[d.coin])a[d.coin]={p:0,g:0};a[d.coin].p+=d.proceeds;a[d.coin].g+=d.gain;return a;},{})).sort((a,b)=>b[1].g-a[1].g).map(([coin,data],i,arr)=>(
            <div key={coin} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",borderBottom:i<arr.length-1?"1px solid #0e0e0e":"none"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:(CC[coin]||"#333")+"22",border:"1px solid "+(CC[coin]||"#333")+"55",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:10,fontWeight:700,color:CC[coin]||"#888"}}>{coin.slice(0,3)}</span></div>
                <div><div style={{fontSize:13,fontWeight:600,color:"#ccc"}}>{coin}</div><div style={{fontSize:10,color:"#555"}}>Proceeds {fmtFull(data.p)}</div></div>
              </div>
              <span style={{fontSize:13,fontWeight:700,color:data.g>=0?"#00e676":"#ff4444"}}>{(data.g>=0?"+":"")+fmtFull(data.g)}</span>
            </div>
          ))}
        </div>

        {/* Flagged items */}
        {flagged > 0 && (
          <div style={{background:"#1a1100",border:"1px solid #f7931a33",borderRadius:14,padding:"14px 16px",marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:"#f7931a",marginBottom:8}}>⚠ {flagged} items need attention</div>
            {disposals.filter(d=>d.missingBasis||d.estimated).slice(0,5).map((d,i)=>(
              <div key={i} style={{fontSize:11,color:"#888",marginBottom:4,paddingLeft:4}}>
                • {d.coin} sold {d.soldDate} — {d.missingBasis?"missing cost basis":"estimated ETH price used for basis"}
              </div>
            ))}
            <div style={{fontSize:11,color:"#555",marginTop:8}}>Use the AI Analysis tab to get a detailed explanation of these flags.</div>
          </div>
        )}

        <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:12,padding:"12px 14px",marginBottom:20}}><span style={{fontSize:11,color:"#444",lineHeight:1.5}}>For planning only. Not legal or accounting advice. Review with a tax professional.</span></div>
      </div>)}

      {/* ── SALES LEDGER TAB ── */}
      {disposals && tab==="ledger" && (<div style={{padding:"0 18px"}}>
        <div style={{display:"flex",gap:6,marginBottom:14}}>
          {[["all","All"],["short","Short-Term"],["long","Long-Term"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setFilt(id)} style={{padding:"5px 12px",fontSize:11,fontWeight:600,borderRadius:20,background:filt===id?"#fff":"#141414",color:filt===id?"#000":"#555",border:filt===id?"none":"1px solid #222",cursor:"pointer"}}>{lbl}</button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 70px 70px 64px",gap:4,padding:"6px 8px",marginBottom:4}}>
          {["Asset","Proceeds","Cost","Gain"].map(h=>(<div key={h} style={{fontSize:9,fontWeight:700,color:"#333",textTransform:"uppercase",textAlign:h!=="Asset"?"right":"left"}}>{h}</div>))}
        </div>
        {rows.map((d,idx)=>{
          const open=exp===idx;
          return (<div key={idx}>
            <div onClick={()=>setExp(open?null:idx)} style={{background:d.missingBasis?"#1a1000":"#111",border:"1px solid "+(d.missingBasis?"#f7931a33":"#1a1a1a"),borderRadius:open?"12px 12px 0 0":12,padding:"10px 12px",marginBottom:open?0:8,cursor:"pointer",display:"grid",gridTemplateColumns:"1fr 70px 70px 64px",gap:4,alignItems:"center"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <span style={{fontSize:12,fontWeight:700,color:CC[d.coin]||"#ccc"}}>{d.coin}</span>
                  <span style={{fontSize:9,fontWeight:600,color:d.term==="short"?"#ffb347":"#00e676",background:d.term==="short"?"#ffb34718":"#00e67618",border:"1px solid "+(d.term==="short"?"#ffb34744":"#00e67644"),borderRadius:4,padding:"1px 5px"}}>{d.term==="short"?"ST":"LT"}</span>
                  {(d.missingBasis||d.estimated) && <span style={{fontSize:9,color:"#f7931a"}}>⚠</span>}
                </div>
                <div style={{fontSize:10,color:"#444"}}>Sold {d.soldDate}</div>
              </div>
              <div style={{textAlign:"right",fontSize:12,fontWeight:600,color:"#888"}}>{fmtFull(d.proceeds)}</div>
              <div style={{textAlign:"right",fontSize:12,fontWeight:600,color:"#555"}}>{fmtFull(d.basis)}</div>
              <div style={{textAlign:"right",fontSize:13,fontWeight:700,color:d.gain>=0?"#00e676":"#ff4444"}}>{(d.gain>=0?"+":"")+fmtFull(d.gain)}</div>
            </div>
            {open && (<div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderTop:"none",borderRadius:"0 0 12px 12px",padding:"12px 14px",marginBottom:8}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[["Qty",d.qty+" "+d.coin],["Acquired",d.acquiredDate],["Sold",d.soldDate],["Hold",d.holdDays+"d"],["Exchange (sell)",d.exchange],["Exchange (buy)",d.lotExchange],["Method","FIFO"],["Term",d.term==="short"?"Short-Term":"Long-Term"]].map(([k,v])=>(
                  <div key={k}><div style={{fontSize:9,color:"#444",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2}}>{k}</div><div style={{fontSize:12,fontWeight:600,color:"#999"}}>{v}</div></div>
                ))}
              </div>
              {d.estimated && <div style={{marginTop:10,fontSize:11,color:"#f7931a",background:"#f7931a0d",borderRadius:8,padding:"8px 10px"}}>⚠ Cost basis uses estimated historical ETH price — verify with exchange records.</div>}
              {d.missingBasis && <div style={{marginTop:10,fontSize:11,color:"#ff4444",background:"#ff44440d",borderRadius:8,padding:"8px 10px"}}>⚠ No matching buy lot found. Basis set to $0 — review your import history.</div>}
              <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #161616",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:11,color:"#555"}}>Realized Gain / Loss</span>
                <span style={{fontSize:15,fontWeight:700,color:d.gain>=0?"#00e676":"#ff4444"}}>{(d.gain>=0?"+":"")+fmtFull(d.gain)}</span>
              </div>
            </div>)}
          </div>);
        })}
        {rows.length === 0 && <div style={{textAlign:"center",padding:"30px 0",color:"#444",fontSize:13}}>No {filt==="all"?"":filt+"-term "}disposals found for {taxYear}.</div>}
        {rows.length > 0 && (<div style={{background:"#0f1f0f",border:"1px solid #1a3a1a",borderRadius:12,padding:"12px 14px",marginTop:4,marginBottom:20,display:"grid",gridTemplateColumns:"1fr 70px 70px 64px",gap:4}}>
          <span style={{fontSize:11,fontWeight:700,color:"#666"}}>TOTALS ({rows.length})</span>
          <span style={{textAlign:"right",fontSize:12,fontWeight:700,color:"#888"}}>{fmtFull(rows.reduce((a,d)=>a+d.proceeds,0))}</span>
          <span style={{textAlign:"right",fontSize:12,fontWeight:700,color:"#555"}}>{fmtFull(rows.reduce((a,d)=>a+d.basis,0))}</span>
          <span style={{textAlign:"right",fontSize:14,fontWeight:700,color:rows.reduce((a,d)=>a+d.gain,0)>=0?"#00e676":"#ff4444"}}>{rows.reduce((a,d)=>a+d.gain,0)>=0?"+":""}{fmtFull(rows.reduce((a,d)=>a+d.gain,0))}</span>
        </div>)}
      </div>)}

      {/* ── AI ANALYSIS TAB ── */}
      {disposals && tab==="ai" && (<div style={{padding:"0 18px 20px"}}>
        <div style={{background:"#0d0d14",border:"1px solid #2a2a4a",borderRadius:14,padding:"14px 16px",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:"#7b6ef6",marginBottom:8}}>✦ Claude AI Tax Analyst</div>
          <div style={{fontSize:11,color:"#555",lineHeight:1.6,marginBottom:10}}>Claude will analyze your {taxYear} disposal data and generate a plain-English tax summary, identify flags, and suggest planning actions.</div>
          {!apiKey && <div style={{fontSize:11,color:"#f7931a",marginBottom:8}}>Set your API key in the Settings tab first.</div>}
          <button onClick={generateAiSummary} disabled={aiLoading||!disposals}
            style={{width:"100%",background:aiLoading?"#1a1a2a":"#7b6ef6",border:"none",borderRadius:10,padding:"11px",fontSize:13,fontWeight:700,color:"#fff",cursor:aiLoading?"not-allowed":"pointer"}}>
            {aiLoading?"✦ Analyzing...":"✦ Generate AI Summary"}
          </button>
        </div>

        {aiError && <div style={{background:"#1a0a0a",border:"1px solid #ff444433",borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:12,color:"#ff6666"}}>{aiError}</div>}

        {aiSummary && (
          <div style={{background:"#0d0d14",border:"1px solid #2a2a4a",borderRadius:14,padding:"16px",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:"#7b6ef6",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10}}>✦ AI Tax Summary · {taxYear}</div>
            <div style={{fontSize:12,color:"#aaa",lineHeight:1.75,whiteSpace:"pre-wrap"}}>{aiSummary}</div>
          </div>
        )}

        {!aiSummary && !aiLoading && !aiError && (
          <div style={{textAlign:"center",padding:"30px 18px",color:"#333",fontSize:13}}>
            <div style={{fontSize:24,marginBottom:10}}>✦</div>
            Tap "Generate AI Summary" to get a plain-English breakdown of your {taxYear} tax situation.
          </div>
        )}

        <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:12,padding:"12px 14px"}}><span style={{fontSize:11,color:"#444",lineHeight:1.5}}>AI output is for informational purposes only. Not tax advice. Review with a qualified professional.</span></div>
      </div>)}

      {/* ── SETTINGS TAB ── */}
      {tab==="settings" && (<div style={{padding:"0 18px 20px"}}>
        {/* API Key */}
        <div style={{background:"#0d0d14",border:"1px solid #2a2a4a",borderRadius:14,padding:"14px 16px",marginBottom:14}}>
          <div style={{fontSize:10,fontWeight:700,color:"#7b6ef6",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Anthropic API Key</div>
          <input
            type="password"
            value={apiKey}
            onChange={e=>setApiKey(e.target.value)}
            placeholder="sk-ant-api..."
            style={{width:"100%",background:"#111",border:"1px solid #2a2a4a",borderRadius:8,color:"#ccc",fontSize:12,padding:"10px 12px",boxSizing:"border-box",outline:"none",fontFamily:"monospace"}}
          />
          <div style={{fontSize:10,color:"#444",marginTop:6}}>Used only for AI analysis. Never stored or transmitted elsewhere.</div>
          {apiKey && <div style={{fontSize:11,color:"#00e676",marginTop:6}}>✓ Key set — {apiKey.slice(0,12)}...</div>}
        </div>

        {/* Engine settings */}
        <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:14,overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid #161616"}}><div style={{fontSize:10,fontWeight:700,color:"#444",letterSpacing:"0.08em",textTransform:"uppercase"}}>FIFO Engine Settings</div></div>
          {[["Method","FIFO (First In, First Out)"],["Long-Term Threshold","365 days"],["Base Currency","USD"],["ETH-quoted trades","Historical monthly avg prices"],["Missing basis","Flagged, not silently $0 guessed"],["Jurisdiction","United States"]].map(([k,v],i,a)=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"11px 16px",borderBottom:i<a.length-1?"1px solid #0e0e0e":"none"}}><span style={{fontSize:12,color:"#666"}}>{k}</span><span style={{fontSize:12,fontWeight:600,color:"#aaa",maxWidth:"55%",textAlign:"right"}}>{v}</span></div>
          ))}
        </div>

        {/* Excluded types */}
        <div style={{background:"#111",border:"1px solid #1e1e1e",borderRadius:14,overflow:"hidden",marginBottom:14}}>
          <div style={{padding:"12px 16px",borderBottom:"1px solid #161616"}}><div style={{fontSize:10,fontWeight:700,color:"#444",letterSpacing:"0.08em",textTransform:"uppercase"}}>Non-Taxable (Excluded)</div></div>
          {["Deposits","Withdrawals","Wallet-to-wallet transfers","Gifts received (tracked separately)","Staking deposits / withdrawals"].map((t,i,a)=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:i<a.length-1?"1px solid #0e0e0e":"none"}}>
              <div style={{width:16,height:16,borderRadius:4,background:"#1a1a1a",border:"1px solid #2a2a2a",display:"flex",alignItems:"center",justifyContent:"center"}}><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></div>
              <span style={{fontSize:12,color:"#666"}}>{t}</span>
            </div>
          ))}
        </div>

        <div style={{background:"#0d0d0d",border:"1px solid #1a1a1a",borderRadius:12,padding:"12px 14px"}}><span style={{fontSize:11,color:"#444",lineHeight:1.5}}>For planning only. Not legal or accounting advice. Review with a qualified tax professional.</span></div>
      </div>)}
    </div>
  );
}



// ─── FIRESTORE REST API (bypasses SDK WebSocket — plain HTTPS) ───────────────
const _FS_PROJECT = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const _FS_APIKEY  = import.meta.env.VITE_FIREBASE_API_KEY;
const FS_BASE = _FS_PROJECT && _FS_APIKEY
  ? `https://firestore.googleapis.com/v1/projects/${_FS_PROJECT}/databases/(default)/documents`
  : null;

function _fsVal(v) {
  if (!v) return null;
  if ("stringValue"   in v) return v.stringValue;
  if ("doubleValue"   in v) return v.doubleValue;
  if ("integerValue"  in v) return Number(v.integerValue);
  if ("booleanValue"  in v) return v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("mapValue"      in v) return Object.fromEntries(
    Object.entries(v.mapValue.fields || {}).map(([k, w]) => [k, _fsVal(w)]));
  return null;
}
function _fsFromDoc(d) {
  const id = d.name.split("/").pop();
  return { id, ...Object.fromEntries(Object.entries(d.fields || {}).map(([k, v]) => [k, _fsVal(v)])) };
}
function _fsFields(obj) {
  const toV = v => {
    if (v === null || v === undefined) return { nullValue: null };
    if (typeof v === "string")  return { stringValue: v };
    if (typeof v === "number")  return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
    if (typeof v === "boolean") return { booleanValue: v };
    if (typeof v === "object")  return { mapValue: { fields: _fsFields(v) } };
    return { stringValue: String(v) };
  };
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, toV(v)]));
}
async function fsGetAll(col) {
  if (!FS_BASE) throw new Error("Firebase not configured");
  const r = await fetch(`${FS_BASE}/${col}?key=${_FS_APIKEY}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const j = await r.json();
  return (j.documents || []).map(_fsFromDoc);
}
async function fsAdd(col, data) {
  if (!FS_BASE) throw new Error("Firebase not configured");
  const r = await fetch(`${FS_BASE}/${col}?key=${_FS_APIKEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: _fsFields(data) }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message || `HTTP ${r.status}`); }
  return _fsFromDoc(await r.json());
}
async function fsUpdate(col, id, data) {
  if (!FS_BASE) throw new Error("Firebase not configured");
  const mask = Object.keys(data).map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join("&");
  const r = await fetch(`${FS_BASE}/${col}/${id}?${mask}&key=${_FS_APIKEY}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: _fsFields(data) }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message || `HTTP ${r.status}`); }
}
async function fsSet(col, id, data) {
  if (!FS_BASE) throw new Error("Firebase not configured");
  const r = await fetch(`${FS_BASE}/${col}/${id}?key=${_FS_APIKEY}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: _fsFields(data) }),
  });
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error?.message || `HTTP ${r.status}`); }
}
async function fsDel(col, id) {
  if (!FS_BASE) throw new Error("Firebase not configured");
  const r = await fetch(`${FS_BASE}/${col}/${id}?key=${_FS_APIKEY}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
}
// ─────────────────────────────────────────────────────────────────────────────

export default function CryptoApp() {
  const [page, setPage] = useState("home");
  const [anthropicKey, setAnthropicKey] = useState(() => localStorage.getItem("anthropic_key") || "");
  const [cmcKey, setCmcKey] = useState(() => localStorage.getItem("cmc_key") || "");
  const [cmcSyncStatus, setCmcSyncStatus] = useState(""); // "" | "saving" | "saved" | "error"
  const [livePrices, setLivePrices] = useState({});
  const [liveChanges, setLiveChanges] = useState({}); // { BTC: -2.3, ETH: 1.1, ... } percent_change_24h
  const [priceStatus, setPriceStatus] = useState("static"); // "static" | "loading" | "live" | "error"

  // Firestore REST API helpers — bypasses SDK WebSocket, uses plain HTTPS
  // On load: pull CMC key from Firestore (REST), fall back to localStorage
  useEffect(() => {
    if (!FS_BASE) return;
    fsGetAll("settings").then(docs => {
      const app = docs.find(d => d.id === "app");
      const key = app?.cmcKey ?? null;
      if (key && key !== localStorage.getItem("cmc_key")) {
        setCmcKey(key);
        localStorage.setItem("cmc_key", key);
      } else if (!key) {
        const local = localStorage.getItem("cmc_key");
        if (local) fsUpdate("settings", "app", { cmcKey: local }).catch(console.warn);
      }
    }).catch(console.warn);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!cmcKey) { setLivePrices({}); setLiveChanges({}); setPriceStatus("static"); return; }
    let cancelled = false;
    const fetchPrices = async () => {
      setPriceStatus("loading");
      try {
        const res = await fetch("/api/prices", { headers: { "x-cmc-key": cmcKey } });
        if (cancelled) return;
        if (!res.ok) { setPriceStatus("error"); return; }
        const data = await res.json();
        if (data.error) { setPriceStatus("error"); return; }
        setLivePrices(data.prices || data);   // backward-compat if old format
        setLiveChanges(data.changes || {});
        setPriceStatus("live");
      } catch { if (!cancelled) setPriceStatus("error"); }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 5 * 60 * 1000); // refresh every 5 min
    return () => { cancelled = true; clearInterval(interval); };
  }, [cmcKey]);

  // Merge static fallback with live prices — live values win
  const COIN_PRICES = { ...STATIC_PRICES, ...livePrices };
  const BTC_PRICE = COIN_PRICES.BTC || 108000;
  const ETH_PRICE = COIN_PRICES.ETH || 2400;
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(null);   // coin detail page
  const [coinPage, setCoinPage] = useState("detail");        // "detail" | "transactions"
  const [txOptionsOpen, setTxOptionsOpen] = useState(null);  // tx.id for 3-dot menu
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSort, setMenuSort] = useState("btc"); // "btc" | "value" | "name" | "performance"
  const [btcGoal, setBtcGoal] = useState(5.0);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("5.0");
  const [addTxOpen, setAddTxOpen] = useState(false);
  const [txFilter, setTxFilter] = useState("all");
  const [chartRange, setChartRange] = useState("ALL");
  const [homeChart, setHomeChart] = useState("growth");
  const [expandedTxId, setExpandedTxId] = useState(null);
  const [homeChartRange, setHomeChartRange] = useState("ALL");
  const [memberChartRange, setMemberChartRange] = useState("ALL");
  const [coinChartRange, setCoinChartRange] = useState("ALL");
  const [memberBenchmark, setMemberBenchmark] = useState("portfolio"); // "portfolio" | "btc" | "spy"
  const sliderRef = useRef(null);
  const firestoreStatusText = !FS_BASE
    ? "Missing Vercel Firebase env vars"
    : firestoreReady
      ? "Connected (REST)"
      : "Connecting...";
  const firestoreDisabledMessage = !FS_BASE
    ? "Firebase not configured. Check Vercel VITE_FIREBASE_* env vars."
    : "Firebase is unavailable right now.";

  // Firestore-persisted transactions (new entries added via the form)
  const [firestoreTxs, setFirestoreTxs] = useState([]);
  const [firestoreReady, setFirestoreReady] = useState(false);

  function refreshTransactions() {
    if (!FS_BASE) return;
    fsGetAll("transactions")
      .then(docs => {
        docs.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
        setFirestoreTxs(docs);
        setFirestoreReady(true);
      })
      .catch(err => { console.error("Failed to load transactions:", err); setFirestoreReady(true); });
  }

  useEffect(() => {
    if (!FS_BASE) { setFirestoreReady(true); return; }
    refreshTransactions();
    // Refresh when tab regains focus (another device may have added transactions)
    const onFocus = () => refreshTransactions();
    window.addEventListener("focus", onFocus);
    // Also poll every 60 seconds
    const poll = setInterval(refreshTransactions, 60000);
    return () => { window.removeEventListener("focus", onFocus); clearInterval(poll); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Portfolio snapshots — one document per day keyed by date string
  const [snapshots, setSnapshots] = useState([]);
  useEffect(() => {
    if (!FS_BASE) return;
    fsGetAll("snapshots")
      .then(docs => {
        docs.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
        setSnapshots(docs);
      })
      .catch(err => console.error("Failed to load snapshots:", err));
  }, []);

  const snappedTodayRef = useRef(false);

  // Form state for Add Transaction modal
  const today = new Date().toISOString().split("T")[0];
  const [txModalMode, setTxModalMode] = useState("trade"); // "trade" | "transfer"
  const [txForm, setTxForm] = useState({
    member: "", coin: "BTC", type: "buy", qty: "", price: "", date: today, exchange: "Coinbase", notes: "",
  });
  const [txFormError, setTxFormError] = useState("");
  const [txSubmitting, setTxSubmitting] = useState(false);

  // Transfer form state
  const [transferForm, setTransferForm] = useState({ fromMember: "", toMember: "", coin: "BTC", qty: "", date: today });
  const [transferError, setTransferError] = useState("");
  const [transferSubmitting, setTransferSubmitting] = useState(false);

  async function submitTransfer() {
    if (!transferForm.fromMember) return setTransferError("Select sender.");
    if (!transferForm.toMember) return setTransferError("Select recipient.");
    if (transferForm.fromMember === transferForm.toMember) return setTransferError("Sender and recipient must be different.");
    if (!transferForm.qty || parseFloat(transferForm.qty) <= 0) return setTransferError("Enter a valid quantity.");
    if (!transferForm.date) return setTransferError("Select a date.");
    if (!FS_BASE) return setTransferError(firestoreDisabledMessage);
    setTransferSubmitting(true);
    const qty = parseFloat(transferForm.qty);
    const price = COIN_PRICES[transferForm.coin] || 0;
    const usdTotal = parseFloat((qty * price).toFixed(2));
    const transferId = `xfr_${Date.now()}`;
    const fromName = MEMBERS.find(m => m.id === transferForm.fromMember)?.name || transferForm.fromMember;
    const toName   = MEMBERS.find(m => m.id === transferForm.toMember)?.name   || transferForm.toMember;
    try {
      const tx1 = await fsAdd("transactions", {
        member: transferForm.fromMember, coin: transferForm.coin, type: "sell",
        qty, purchasePrice: price, usdTotal, date: transferForm.date,
        exchange: "Transfer", fee: 0, notes: `Transfer → ${toName}`, transferId, createdAt: new Date().toISOString(),
      });
      const tx2 = await fsAdd("transactions", {
        member: transferForm.toMember, coin: transferForm.coin, type: "buy",
        qty, purchasePrice: price, usdTotal, date: transferForm.date,
        exchange: "Transfer", fee: 0, notes: `Transfer ← ${fromName}`, transferId, createdAt: new Date().toISOString(),
      });
      setFirestoreTxs(prev => [...prev, tx1, tx2].sort((a, b) => (a.date || "").localeCompare(b.date || "")));
      setTransferError("");
      setTransferForm({ fromMember: transferForm.fromMember, toMember: transferForm.toMember, coin: transferForm.coin, qty: "", date: today });
      setAddTxOpen(false);
    } catch (err) {
      setTransferError("Failed to save: " + err.message);
    }
    setTransferSubmitting(false);
  }

  function setTxField(field, value) {
    setTxForm(f => {
      const updated = { ...f, [field]: value };
      if (field === "coin") updated.price = (COIN_PRICES[value] || "").toString();
      return updated;
    });
  }

  async function submitTx() {
    if (!txForm.member) return setTxFormError("Select a portfolio.");
    if (!txForm.qty || parseFloat(txForm.qty) <= 0) return setTxFormError("Enter a valid quantity.");
    if (!txForm.date) return setTxFormError("Select a date.");
    if (!FS_BASE) return setTxFormError("Firebase not configured. Check Vercel env vars.");
    setTxSubmitting(true);
    const qty = parseFloat(txForm.qty);
    const price = parseFloat(txForm.price) || 0;
    try {
      const newTx = await fsAdd("transactions", {
        member: txForm.member,
        coin: txForm.coin,
        type: txForm.type,
        qty,
        purchasePrice: price,
        usdTotal: parseFloat((qty * price).toFixed(2)),
        date: txForm.date,
        exchange: txForm.exchange,
        fee: 0,
        notes: txForm.notes,
        createdAt: new Date().toISOString(),
      });
      setFirestoreTxs(prev => [...prev, newTx].sort((a, b) => (a.date || "").localeCompare(b.date || "")));
      setTxFormError("");
      setTxForm({ member: txForm.member, coin: txForm.coin, type: txForm.type, qty: "", price: (COIN_PRICES[txForm.coin] || "").toString(), date: today, exchange: txForm.exchange, notes: "" });
      setAddTxOpen(false);
    } catch (err) {
      setTxFormError("Failed to save: " + err.message);
    }
    setTxSubmitting(false);
  }

  // ── EDIT TRANSACTION ────────────────────────────────────────────────────────
  const [editingTx, setEditingTx] = useState(null); // null = closed, or the tx object
  const [editForm, setEditForm] = useState({});
  const [editFormError, setEditFormError] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  function openEdit(tx) {
    setEditForm({
      member: tx.member,
      coin: tx.coin,
      type: tx.type,
      qty: tx.qty.toString(),
      price: tx.purchasePrice.toString(),
      date: tx.date,
      exchange: tx.exchange || "Other",
      notes: tx.notes || "",
    });
    setEditFormError("");
    setEditingTx(tx);
    setTxOptionsOpen(null);
  }

  function setEditField(field, value) {
    setEditForm(f => ({ ...f, [field]: value }));
  }

  async function submitEdit() {
    if (!editForm.qty || parseFloat(editForm.qty) <= 0) return setEditFormError("Enter a valid quantity.");
    if (!editForm.date) return setEditFormError("Select a date.");
    if (!FS_BASE) return setEditFormError("Firebase not configured. Check Vercel env vars.");
    setEditSubmitting(true);
    const qty = parseFloat(editForm.qty);
    const price = parseFloat(editForm.price) || 0;
    const updates = {
      member: editForm.member, coin: editForm.coin, type: editForm.type,
      qty, purchasePrice: price, usdTotal: parseFloat((qty * price).toFixed(2)),
      date: editForm.date, exchange: editForm.exchange, notes: editForm.notes,
    };
    try {
      await fsUpdate("transactions", editingTx.id, updates);
      setFirestoreTxs(prev => prev.map(t => t.id === editingTx.id ? { ...t, ...updates } : t));
      setEditingTx(null);
    } catch (err) {
      setEditFormError("Failed to save: " + err.message);
    }
    setEditSubmitting(false);
  }

  // Combined transaction list: hardcoded history + Firestore-persisted new entries
  const TRANSACTIONS = [...HARDCODED_TRANSACTIONS, ...firestoreTxs];

  // Recompute each member's holdings and portfolio values,
  // applying Firestore transactions on top of the static historical baseline
  const MEMBERS = STATIC_MEMBERS.map(m => {
    const memberNewTxs = firestoreTxs.filter(t => t.member === m.id);
    const holdings = { ...m.holdings };
    let extraCost = 0;
    memberNewTxs.forEach(tx => {
      if (tx.type === "buy") {
        holdings[tx.coin] = (holdings[tx.coin] || 0) + tx.qty;
        extraCost += tx.usdTotal;
      } else if (tx.type === "sell") {
        holdings[tx.coin] = Math.max(0, (holdings[tx.coin] || 0) - tx.qty);
      }
    });
    const newCostBasis = m.costBasis + extraCost;
    const liveUsd = Object.entries(holdings).reduce(
      (sum, [coin, qty]) => sum + qty * (COIN_PRICES[coin] || 0), 0
    );
    return { ...m, holdings, usd: liveUsd, costBasis: newCostBasis, unrealizedPL: liveUsd - newCostBasis };
  });

  const totalUSD = MEMBERS.reduce((s, m) => s + m.usd, 0);
  const totalBTC = MEMBERS.reduce((s, m) => s + m.btc, 0);
  const totalCostBasis = MEMBERS.reduce((s, m) => s + m.costBasis, 0);
  const totalUnrealized = MEMBERS.reduce((s, m) => s + m.unrealizedPL, 0);

  // Write one snapshot per day when prices are live and Firestore is ready
  useEffect(() => {
    if (!FS_BASE || !firestoreReady || totalUSD <= 0 || snappedTodayRef.current) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const lastSnap = localStorage.getItem("last_snapshot_date");
    if (lastSnap === todayStr) { snappedTodayRef.current = true; return; }
    snappedTodayRef.current = true;
    const memberValues = {};
    MEMBERS.forEach(m => { memberValues[m.id] = Math.round(m.usd * 100) / 100; });
    fsSet("snapshots", todayStr, {
      date: todayStr,
      totalUSD: Math.round(totalUSD * 100) / 100,
      members: memberValues,
      timestamp: new Date().toISOString(),
    }).then(() => {
      localStorage.setItem("last_snapshot_date", todayStr);
      setSnapshots(prev => { const without = prev.filter(s => s.date !== todayStr); return [...without, { date: todayStr, totalUSD: Math.round(totalUSD * 100) / 100, members: memberValues }].sort((a, b) => a.date.localeCompare(b.date)); });
    }).catch(err => {
      snappedTodayRef.current = false;
      console.error("Snapshot write error:", err);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestoreReady, totalUSD]);

  // ── EXPORT / IMPORT CSV ────────────────────────────────────────────────────
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [importPreview, setImportPreview] = useState([]); // parsed rows ready to save
  const [importSaving, setImportSaving] = useState(false);
  const [importDone, setImportDone] = useState(0);

  function exportCSV(txList, filename) {
    const header = "date,member,coin,type,qty,purchasePrice,usdTotal,exchange,fee,notes";
    const escape = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const rows = txList.map(tx => [
      tx.date || "", tx.member || "", tx.coin || "", tx.type || "",
      tx.qty ?? "", tx.purchasePrice ?? "", tx.usdTotal ?? "",
      tx.exchange || "", tx.fee ?? 0, escape(tx.notes || ""),
    ].join(","));
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename || `transactions_${today}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }

  function parseImportCSV(raw) {
    setImportError("");
    setImportPreview([]);
    const lines = raw.trim().split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return setImportError("File must have a header row and at least one data row.");
    const header = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/"/g, ""));
    const reqCols = ["date", "member", "coin", "type", "qty"];
    const missing = reqCols.filter(c => !header.includes(c));
    if (missing.length) return setImportError(`Missing required columns: ${missing.join(", ")}`);
    const col = name => header.indexOf(name);
    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      // Simple CSV split (handles quoted fields with commas)
      const cells = [];
      let cur = "", inQ = false;
      for (const ch of lines[i] + ",") {
        if (ch === '"') { inQ = !inQ; }
        else if (ch === "," && !inQ) { cells.push(cur.trim()); cur = ""; }
        else cur += ch;
      }
      const get = name => (cells[col(name)] || "").replace(/^"|"$/g, "").trim();
      const qty = parseFloat(get("qty"));
      const price = parseFloat(get("purchaseprice") || get("price") || "0") || 0;
      if (!get("date") || !get("member") || !get("coin") || !["buy","sell"].includes(get("type").toLowerCase()) || isNaN(qty) || qty <= 0) continue;
      parsed.push({
        date: get("date"), member: get("member"), coin: get("coin").toUpperCase(),
        type: get("type").toLowerCase(), qty,
        purchasePrice: price,
        usdTotal: parseFloat(get("usdtotal") || (qty * price).toFixed(2)) || qty * price,
        exchange: get("exchange") || "Import",
        fee: parseFloat(get("fee") || "0") || 0,
        notes: get("notes") || "Imported from CSV",
      });
    }
    if (!parsed.length) return setImportError("No valid rows found. Check that member IDs and types (buy/sell) are correct.");
    setImportPreview(parsed);
  }

  async function saveImport() {
    if (!FS_BASE) return setImportError("Firebase not configured. Check Vercel env vars.");
    if (!importPreview.length) return;
    setImportSaving(true);
    setImportDone(0);
    let saved = 0;
    const newTxs = [];
    for (const row of importPreview) {
      try {
        const newTx = await fsAdd("transactions", { ...row, createdAt: new Date().toISOString() });
        newTxs.push(newTx);
        saved++;
        setImportDone(saved);
      } catch { /* skip row on error */ }
    }
    if (newTxs.length) setFirestoreTxs(prev => [...prev, ...newTxs].sort((a, b) => (a.date || "").localeCompare(b.date || "")));
    setImportSaving(false);
    setImportPreview([]);
    setImportText("");
    setImportOpen(false);
  }

  // Computed chart data from real snapshots (falls back to synthetic when < 2 real points)
  const familyChartData =
    snapshotsToChart(snapshots, homeChartRange, s => s.totalUSD) ||
    generateChartData(totalUSD || 341000, homeChartRange);

  const member = selectedMember ? MEMBERS.find(m => m.id === selectedMember) : null;
  const memberChart = member
    ? (snapshotsToChart(snapshots, memberChartRange, s => s.members?.[member.id] ?? 0) ||
       generateChartData(member.usd))
    : [];
  const memberTxs = TRANSACTIONS.filter(t => t.member === member?.id);
  const filteredTxs = (txFilter === "all" ? TRANSACTIONS : TRANSACTIONS.filter(t => t.member === txFilter))
    .slice().sort((a, b) => new Date(b.date) - new Date(a.date));

  const renderTxRow = (tx, idx, arr) => {
    const m = MEMBERS.find(mb => mb.id === tx.member);
    const currentPrice = COIN_PRICES[tx.coin] || 0;
    const currentVal = currentPrice * tx.qty;
    const costVal = tx.usdTotal > 0 ? tx.usdTotal : 0;
    const plPct = costVal > 0 ? ((currentVal - costVal) / costVal * 100).toFixed(1) : null;
    const plDollar = costVal > 0 ? currentVal - costVal : null;
    const isUp = plPct !== null && parseFloat(plPct) >= 0;
    const isLast = idx === arr.length - 1;
    const isExpanded = expandedTxId === tx.id;
    const isGift = tx.usdTotal === 0 && tx.type === "buy";
    const isTransfer = tx.exchange === "Transfer";
    const txIcon = isGift ? "🎁" : isTransfer ? "↔" : tx.type === "buy" ? "⬆" : "⬇";
    const txLabel = isGift ? "Gift" : isTransfer ? "Transfer" : tx.type === "buy" ? "Buy" : "Sell";
    const typeColor = isGift ? "#b39ddb" : isTransfer ? "#888" : tx.type === "buy" ? "#00e676" : "#ff4444";
    const typeBg = isGift ? "#2a1a4a" : isTransfer ? "#1a1a1a" : tx.type === "buy" ? "#0a1e0a" : "#1e0a0a";
    const typeBorder = isGift ? "#7c4dff55" : isTransfer ? "#33333355" : tx.type === "buy" ? "#1a3a1a" : "#3a1a1a";
    return (
      <div key={tx.id}>
        <div
          onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
          style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 14px", borderBottom: (!isExpanded && isLast) ? "none" : "1px solid #1a1a1a", cursor: "pointer", background: isExpanded ? "#161616" : "transparent", transition: "background 0.15s" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: typeBg, border: `1.5px solid ${typeBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isGift ? 15 : 14, color: typeColor, flexShrink: 0 }}>
            {txIcon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{tx.coin} <span style={{ color: "#666", fontWeight: 400, fontSize: 13 }}>· {tx.qty}</span></span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{tx.usdTotal > 0 ? fmtFull(tx.usdTotal) : "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#666" }}>{m?.name} · {tx.exchange} · {tx.date}</span>
              {plPct !== null
                ? <span style={{ fontSize: 12, fontWeight: 600, color: isUp ? "#00e676" : "#ff4444" }}>{isUp ? "+" : ""}{plPct}%</span>
                : <span style={{ fontSize: 12, color: "#444" }}>—</span>}
            </div>
          </div>
          <span style={{ fontSize: 10, color: "#444", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", marginLeft: 2, flexShrink: 0 }}>▼</span>
        </div>
        {isExpanded && (
          <div style={{ background: "#131313", borderBottom: isLast ? "none" : "1px solid #1a1a1a", padding: "14px 16px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ border: `1.5px solid ${typeColor}`, color: typeColor, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
                {txIcon} {txLabel}
              </span>
              <span style={{ fontSize: 12, color: "#666" }}>{tx.date} · {tx.exchange}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 8px" }}>
              {[
                { label: `Price (${tx.coin}/USD)`, value: tx.purchasePrice > 0 ? `$${tx.purchasePrice.toLocaleString(undefined, {maximumFractionDigits: 2})}` : "—" },
                { label: "Amount", value: tx.qty },
                { label: "Cost Incl. Fee", value: tx.usdTotal > 0 ? fmtFull(tx.usdTotal) : "—" },
                { label: "Current Value", value: currentVal > 0 ? fmtFull(currentVal) : "—" },
                ...(tx.fee > 0 ? [{ label: "Fee", value: `$${tx.fee}` }] : []),
                ...(plDollar !== null ? [{ label: "P&L", value: `${plDollar >= 0 ? "+" : ""}${fmtFull(plDollar)}`, color: plDollar >= 0 ? "#00e676" : "#ff4444" }] : []),
                ...(plPct !== null ? [{ label: "Return", value: `${isUp ? "+" : ""}${plPct}%`, color: isUp ? "#00e676" : "#ff4444" }] : []),
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: item.color || "#fff" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-shell" style={{ fontFamily: RJ, background: "#080808", color: "#ffffff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 2px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #222; }

        /* === BASE FONT: Inter throughout === */
        body, div, span, button, input, select, textarea { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }

        /* === COLOUR TOKENS === */
        .up  { color: #00e676; }
        .down { color: #ff4444; }

        /* === TYPOGRAPHY SCALE (matching reference) ===
           - hero-num  : 42px 700  – total portfolio value
           - val-lg    : 22px 700  – large secondary values (P&L dollar)
           - val-md    : 18px 600  – holdings USD value, member card value
           - val-sm    : 15px 600  – tx amounts, sub-values
           - label     : 13px 400  – grey caption above/below a value ("Total Worth", qty)
           - label-sm  : 11px 500  – section headers, tags
           - body      : 15px 400  – general text
        */
        .hero-num  { font-size: 42px; font-weight: 700; letter-spacing: -0.02em; line-height: 1; color: #fff; }
        .val-lg    { font-size: 22px; font-weight: 700; letter-spacing: -0.01em; line-height: 1; }
        .val-md    { font-size: 18px; font-weight: 600; letter-spacing: -0.01em; color: #fff; }
        .val-sm    { font-size: 15px; font-weight: 600; color: #fff; }
        .lbl       { font-size: 13px; font-weight: 400; color: #888; letter-spacing: 0; }
        .lbl-sm    { font-size: 11px; font-weight: 500; color: #777; letter-spacing: 0.04em; text-transform: uppercase; }
        .bignum    { font-size: 42px; font-weight: 700; letter-spacing: -0.02em; line-height: 1; color: #fff; }
        .muted     { font-size: 13px; font-weight: 400; color: #888; }
        .section-title { font-size: 13px; font-weight: 600; color: #666; letter-spacing: 0.02em; }

        /* === COMPONENTS === */
        .card { background: #111; border: 1px solid #222; border-radius: 12px; padding: 14px; }
        .pill { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 20px; padding: 5px 14px; font-size: 13px; font-weight: 500; cursor: pointer; color: #777; }
        .pill.active { background: #00e676; color: #000; border-color: #00e676; font-weight: 600; }
        .btn-primary { background: #00e676; color: #000; border: none; border-radius: 10px; padding: 13px 22px; font-size: 15px; font-weight: 700; cursor: pointer; }
        .btn-ghost { background: transparent; color: #666; border: 1px solid #2a2a2a; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 500; cursor: pointer; }

        /* ticker bar */
        .ticker-item  { display: flex; align-items: center; gap: 6px; background: #141414; border: 1px solid #222; border-radius: 20px; padding: 5px 12px; white-space: nowrap; flex-shrink: 0; }
        .ticker-coin  { font-size: 13px; font-weight: 700; letter-spacing: 0; }
        .ticker-price { font-size: 13px; font-weight: 500; color: #fff; }
        .ticker-pct   { font-size: 13px; font-weight: 600; }

        /* top bar */
        .topbar-title { font-size: 17px; font-weight: 600; color: #fff; letter-spacing: 0; }
        .nav-label    { font-size: 10px; font-weight: 500; color: #777; letter-spacing: 0.02em; }

        /* member cards */
        .member-card-name { font-size: 14px; font-weight: 600; color: #fff; letter-spacing: 0; }

        /* chart */
        .chart-bg { background: transparent; border-radius: 0; padding: 0; }

        /* tag (BUY / SELL badge) */
        .tag { background: #0a1e0a; color: #00e676; border-radius: 6px; padding: 3px 9px; font-size: 12px; font-weight: 600; }

        /* Kill recharts blue focus border on SVG elements */
        .recharts-wrapper, .recharts-surface, svg { outline: none !important; }
        .recharts-wrapper { border: none !important; box-shadow: none !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        /* scrollbars hidden */
        .member-scroll::-webkit-scrollbar, .nobar::-webkit-scrollbar { display: none; }

        /* forms */
        input, select, textarea { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 15px; font-weight: 400; width: 100%; outline: none; }
        input:focus, select:focus { border-color: #00e676; }
        select option { background: #1a1a1a; }

        /* overlays */
        .overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.88); z-index: 100; backdrop-filter: blur(8px); }
        .modal { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; background: #111; border-radius: 20px 20px 0 0; border-top: 1px solid #222; z-index: 101; padding: 24px; max-height: 88vh; overflow-y: auto; animation: slideUp 0.26s ease; }
        .options-sheet { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; background: #2a2a2a; border-radius: 20px 20px 0 0; z-index: 101; padding: 0 0 36px; animation: slideUp 0.26s ease; }
        .options-sheet-handle { width: 38px; height: 4px; background: #555; border-radius: 2px; margin: 10px auto 0; }
        .options-sheet-title { font-size: 12px; font-weight: 700; color: #888; letter-spacing: 0.1em; text-transform: uppercase; padding: 18px 24px 10px; }
        .options-sheet-row { display: flex; align-items: center; gap: 18px; padding: 18px 24px; cursor: pointer; border: none; background: none; width: 100%; text-align: left; }
        .options-sheet-row:active { background: rgba(255,255,255,0.04); }
        @keyframes slideUp { from { transform: translateX(-50%) translateY(100%); } to { transform: translateX(-50%) translateY(0); } }

        /* ── RESPONSIVE SHELL ─────────────────────────────────── */
        .app-shell { display: flex; min-height: 100vh; }

        /* Sidebar: always in DOM; hidden off-screen on mobile */
        .sidebar {
          position: fixed; top: 0; left: 0; width: 260px; height: 100%;
          background: #0d0d0d; border-right: 1px solid #1e1e1e;
          z-index: 200; overflow-y: auto;
          transform: translateX(-100%); transition: transform 0.22s ease;
          flex-shrink: 0;
        }
        .sidebar.sidebar-open { transform: translateX(0); }

        /* Content column: full-width on mobile */
        .content-col { flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 100vh; }

        /* ── TABLET (768px+) ──────────────────────────────────── */
        @media (min-width: 768px) {
          .modal { max-width: 560px; }
          .options-sheet { max-width: 560px; }
        }

        /* ── DESKTOP (1100px+) ───────────────────────────────── */
        @media (min-width: 1100px) {
          .app-shell { overflow: hidden; height: 100vh; }
          .sidebar {
            position: relative !important;
            transform: translateX(0) !important;
            transition: none !important;
            height: 100vh;
            flex-shrink: 0;
          }
          .mobile-overlay { display: none !important; }
          .hamburger-btn { display: none !important; }
          .bottom-nav-bar { left: 260px !important; }
          .content-col { height: 100vh; overflow-y: auto; padding-bottom: 80px; }
          .modal { max-width: 560px; }
          .options-sheet { max-width: 560px; }
          .page-pad { padding-bottom: 24px !important; }
          .desktop-2col { display: grid !important; grid-template-columns: 1fr 1fr; gap: 16px; }
          .desktop-3col { display: grid !important; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        }
      `}</style>

      {/* SIDEBAR — always in DOM; CSS hides/shows via transform */}
      <div className={menuOpen ? "sidebar sidebar-open" : "sidebar"} style={{ display: "flex", flexDirection: "column", gap: 0, padding: 0, overflowY: "auto" }}>

            {/* ── HEADER ── */}
            <div style={{ padding: "20px 20px 16px", background: "#0d0d0d", borderBottom: "1px solid #1a1a1a", position: "relative" }}>
              <button onClick={() => setMenuOpen(false)} style={{ position: "absolute", top: 18, right: 16, background: "none", border: "none", cursor: "pointer", color: "#444", fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #0a2a0a, #0d1f0d)", border: "1.5px solid #1a3a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>₿</div>
                <div>
                  <div style={{ fontSize: 11, color: "#555", marginBottom: 1 }}>Family Portfolio</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Medina Family</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { label: "Total Value", value: fmt(totalUSD), color: "#fff" },
                  { label: "Total BTC", value: `${totalBTC.toFixed(4)}`, color: "#f7931a" },
                  { label: "BTC Price", value: `$${(BTC_PRICE/1000).toFixed(1)}K`, color: "#00e676" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#141414", borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ fontSize: 10, color: "#555", marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── QUICK ACTIONS ── */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #141414" }}>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { label: "Add Tx", icon: "＋", action: () => { setMenuOpen(false); setAddTxOpen(true); } },
                  { label: "Transfer", icon: "⇄", action: () => setMenuOpen(false) },
                  { label: "Rebalance", icon: "⚖", action: () => setMenuOpen(false) },
                ].map(q => (
                  <button key={q.label} onClick={q.action} style={{ flex: 1, background: "#141414", border: "1px solid #222", borderRadius: 10, padding: "9px 6px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 16, color: "#00e676" }}>{q.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#777" }}>{q.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ── MENU SECTIONS ── */}
            <div style={{ padding: "14px 20px 0" }}>
              {[
                {
                  section: "Portfolio",
                  items: [
                    { label: "New Portfolio", sub: "Add a family member", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/></svg>, action: () => { setPage("portfolios"); setMenuOpen(false); } },
                    { label: "Manage Assets", sub: "Coins & holdings", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><ellipse cx="12" cy="17" rx="8" ry="3"/><path d="M4 17v3c0 1.66 3.58 3 8 3s8-1.34 8-3v-3"/></svg>, action: () => { setPage("portfolios"); setMenuOpen(false); } },
                    { label: "Set Goals", sub: "BTC targets per member", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>, action: () => { setPage("home"); setMenuOpen(false); } },
                  ]
                },
                {
                  section: "Data",
                  items: [
                    { label: "Import Transactions", sub: "CSV or Delta export", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>, action: () => { setImportOpen(true); setMenuOpen(false); } },
                    { label: "Export Data", sub: "Download as CSV", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>, action: () => { exportCSV(TRANSACTIONS, `transactions_all_${today}.csv`); setMenuOpen(false); } },
                  ]
                },
                {
                  section: "Connections",
                  items: [
                    { label: "CoinMarketCap API", sub: "Live price feed", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11A2.99 2.99 0 0 0 18 7.92a3 3 0 1 0-3-3c0 .24.04.47.09.7L8.04 9.73A3 3 0 0 0 6 9a3 3 0 0 0 0 6c.78 0 1.49-.31 2.04-.78l7.05 4.12c-.05.21-.09.43-.09.66a3 3 0 1 0 3-3z"/></svg>, badge: cmcKey ? "Connected" : "Not connected", badgeColor: cmcKey ? "#00e676" : "#f7931a", action: () => { setPage("app-settings"); setMenuOpen(false); } },
                    { label: "Exchange Sync", sub: "Coinbase · Kraken · Gemini", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>, badge: "Manual", badgeColor: "#555", action: () => { setPage("app-settings"); setMenuOpen(false); } },
                  ]
                },
                {
                  section: "Tax",
                  items: [
                    { label: "Tax Reporting", sub: "2025 · FIFO · CoinTracking", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, badge: "BETA", badgeColor: "#f7931a", action: () => { setPage("tax"); setMenuOpen(false); } },
                  ]
                },
                {
                  section: "App",
                  items: [
                    { label: "Settings", sub: "API keys & preferences", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>, action: () => { setPage("app-settings"); setMenuOpen(false); } },
                    { label: "About", sub: "Version & project info", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>, action: () => { setPage("about"); setMenuOpen(false); } },
                  ]
                },
              ].map(({ section, items }) => (
                <div key={section} style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#383838", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8, paddingLeft: 2 }}>{section}</div>
                  <div style={{ background: "#111", border: "1px solid #1a1a1a", borderRadius: 12, overflow: "hidden" }}>
                    {items.map((item, idx) => (
                      <div key={item.label}
                        onClick={item.action || undefined}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderBottom: idx < items.length - 1 ? "1px solid #161616" : "none", cursor: "pointer", transition: "background 0.12s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#161616"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: "#0d0d0d", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{item.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#ccc", marginBottom: 1 }}>{item.label}</div>
                          {item.sub && <div style={{ fontSize: 11, color: "#555" }}>{item.sub}</div>}
                        </div>
                        {item.badge && <span style={{ fontSize: 10, fontWeight: 600, color: item.badgeColor, background: item.badgeColor + "18", border: `1px solid ${item.badgeColor}44`, borderRadius: 5, padding: "2px 7px", flexShrink: 0 }}>{item.badge}</span>}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── PORTFOLIOS LIST ── */}
            <div style={{ padding: "0 20px 24px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, paddingTop: 4, borderTop: "1px solid #141414" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#666", paddingTop: 12 }}>Portfolios ({MEMBERS.length})</div>
                <select value={menuSort} onChange={e => setMenuSort(e.target.value)}
                  style={{ marginTop: 12, background: "#141414", border: "1px solid #222", borderRadius: 7, color: "#666", fontSize: 11, padding: "3px 6px", cursor: "pointer" }}>
                  <option value="btc">By BTC</option>
                  <option value="value">By Value</option>
                  <option value="name">By Name</option>
                  <option value="performance">By Return</option>
                </select>
              </div>
              {[...MEMBERS]
                .sort((a, b) => {
                  if (menuSort === "value") return b.usd - a.usd;
                  if (menuSort === "name") return a.name.localeCompare(b.name);
                  if (menuSort === "performance") {
                    const pa = a.costBasis > 0 ? (a.usd - a.costBasis) / a.costBasis : -1;
                    const pb = b.costBasis > 0 ? (b.usd - b.costBasis) / b.costBasis : -1;
                    return pb - pa;
                  }
                  return b.btc - a.btc;
                })
                .map((m, idx, arr) => {
                  const isActive = selectedMember === m.id && page === "portfolio";
                  const isLast = idx === arr.length - 1;
                  const retPct = m.costBasis > 0 ? ((m.usd - m.costBasis) / m.costBasis * 100) : null;
                  return (
                    <div key={m.id}
                      onClick={() => { setSelectedMember(m.id); setPage("portfolio"); setMenuOpen(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", borderRadius: 10, marginBottom: isLast ? 0 : 4, cursor: "pointer", background: isActive ? "#0a1e0a" : "transparent", border: isActive ? "1px solid #1a3a1a" : "1px solid transparent", transition: "background 0.15s" }}>
                      {/* Active accent */}
                      {isActive && <div style={{ position: "absolute", left: 20, width: 3, height: 36, background: "#00e676", borderRadius: 2 }} />}
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: isActive ? "#0d2a0d" : "#141414", border: `1px solid ${isActive ? "#1a4a1a" : "#222"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: isActive ? "#00e676" : "#888", fontWeight: 700, flexShrink: 0 }}>{m.avatar}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? "#fff" : "#bbb", marginBottom: 2 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: "#f7931a" }}>{m.btc < 0.001 ? m.btc.toFixed(5) : m.btc.toFixed(4)} BTC</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? "#fff" : "#888" }}>{fmt(m.usd)}</div>
                        {retPct !== null && <div style={{ fontSize: 11, color: retPct >= 0 ? "#00e676" : "#ff4444" }}>{retPct >= 0 ? "+" : ""}{retPct.toFixed(1)}%</div>}
                      </div>
                    </div>
                  );
                })}
              {/* Total BTC footer */}
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #141414", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#555" }}>Total BTC</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#f7931a" }}>{totalBTC.toFixed(5)} BTC</span>
              </div>
            </div>

          </div>

      {menuOpen && <div className="mobile-overlay overlay" onClick={() => setMenuOpen(false)} />}

      <div className="content-col">

      {/* ADD TX MODAL */}
      {addTxOpen && (() => {
        const qty = parseFloat(txForm.qty) || 0;
        const price = parseFloat(txForm.price) || 0;
        const totalCost = qty * price;
        const currentPrice = COIN_PRICES[txForm.coin] || 0;
        const currentVal = qty * currentPrice;
        const unrealized = txForm.type === "buy" ? currentVal - totalCost : 0;
        const allCoins = Object.keys(STATIC_PRICES).sort();
        return (
          <>
            <div className="overlay" onClick={() => { setAddTxOpen(false); setTxFormError(""); }} />
            <div className="modal">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontWeight: 700, fontSize: 18 }}>Add Transaction</span>
                <button style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 20 }} onClick={() => { setAddTxOpen(false); setTxFormError(""); setTransferError(""); }}>✕</button>
              </div>

              {/* Mode tabs */}
              <div style={{ display: "flex", gap: 6, marginBottom: 18, background: "#111", borderRadius: 10, padding: 4 }}>
                {[["trade", "⬆⬇ Buy / Sell"], ["transfer", "↔ Transfer"]].map(([mode, label]) => (
                  <button key={mode} onClick={() => { setTxModalMode(mode); setTxFormError(""); setTransferError(""); }}
                    style={{ flex: 1, padding: "8px", borderRadius: 8, border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
                      background: txModalMode === mode ? "#1e1e1e" : "transparent",
                      color: txModalMode === mode ? "#fff" : "#555" }}>
                    {label}
                  </button>
                ))}
              </div>

              {txModalMode === "transfer" ? (
                /* ── TRANSFER FORM ── */
                <div style={{ display: "grid", gap: 13 }}>
                  <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#6fa" }}>
                    Moves coins between family members. Creates a sell for the sender and a buy for the recipient at current market price.
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div className="lbl" style={{ marginBottom: 6 }}>From</div>
                      <select value={transferForm.fromMember} onChange={e => setTransferForm(f => ({ ...f, fromMember: e.target.value }))}>
                        <option value="">Select sender</option>
                        {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="lbl" style={{ marginBottom: 6 }}>To</div>
                      <select value={transferForm.toMember} onChange={e => setTransferForm(f => ({ ...f, toMember: e.target.value }))}>
                        <option value="">Select recipient</option>
                        {MEMBERS.filter(m => m.id !== transferForm.fromMember).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div className="lbl" style={{ marginBottom: 6 }}>Coin</div>
                      <select value={transferForm.coin} onChange={e => setTransferForm(f => ({ ...f, coin: e.target.value }))}>
                        {Object.keys(STATIC_PRICES).sort().map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <div className="lbl" style={{ marginBottom: 6 }}>Quantity</div>
                      <input type="number" min="0" step="any" placeholder="0.00000000"
                        value={transferForm.qty} onChange={e => setTransferForm(f => ({ ...f, qty: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <div className="lbl" style={{ marginBottom: 6 }}>Date</div>
                    <input type="date" value={transferForm.date} onChange={e => setTransferForm(f => ({ ...f, date: e.target.value }))} />
                  </div>

                  {/* Preview */}
                  {parseFloat(transferForm.qty) > 0 && (
                    <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div><div style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>Amount</div><div style={{ fontSize: 13, fontWeight: 700, color: "#ccc" }}>{parseFloat(transferForm.qty)} {transferForm.coin}</div></div>
                        <div><div style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>Est. Value</div><div style={{ fontSize: 13, fontWeight: 700, color: "#ccc" }}>{fmtFull(parseFloat(transferForm.qty) * (COIN_PRICES[transferForm.coin] || 0))}</div></div>
                      </div>
                    </div>
                  )}

                  {transferError && <div style={{ fontSize: 12, color: "#ff4444", textAlign: "center" }}>{transferError}</div>}

                  <button onClick={submitTransfer} disabled={transferSubmitting}
                    style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14,
                      cursor: transferSubmitting ? "not-allowed" : "pointer", opacity: transferSubmitting ? 0.6 : 1,
                      background: "#6fa8ff", color: "#000" }}>
                    {transferSubmitting ? "Saving..." : "↔ Record Transfer"}
                  </button>
                </div>
              ) : (
              <div style={{ display: "grid", gap: 13 }}>
                {/* Portfolio */}
                <div>
                  <div className="lbl" style={{ marginBottom: 6 }}>Portfolio</div>
                  <select value={txForm.member} onChange={e => setTxField("member", e.target.value)}>
                    <option value="">Select member</option>
                    {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                {/* Type toggle */}
                <div>
                  <div className="lbl" style={{ marginBottom: 6 }}>Type</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["buy", "sell"].map(t => (
                      <button key={t} onClick={() => setTxField("type", t)}
                        style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer",
                          background: txForm.type === t ? (t === "buy" ? "#00e676" : "#ff4444") : "#1a1a1a",
                          color: txForm.type === t ? "#000" : "#555" }}>
                        {t === "buy" ? "⬆ Buy" : "⬇ Sell"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coin + Exchange */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div className="lbl" style={{ marginBottom: 6 }}>Coin</div>
                    <select value={txForm.coin} onChange={e => setTxField("coin", e.target.value)}>
                      {allCoins.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="lbl" style={{ marginBottom: 6 }}>Exchange</div>
                    <select value={txForm.exchange} onChange={e => setTxField("exchange", e.target.value)}>
                      {["Coinbase","Kraken","Gemini","Binance","iTrust","Robinhood","Hardware Wallet","Transfer","Other"].map(ex => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Qty + Price */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div className="lbl" style={{ marginBottom: 6 }}>Quantity</div>
                    <input type="number" min="0" step="any" placeholder="0.00000000"
                      value={txForm.qty} onChange={e => setTxField("qty", e.target.value)} />
                  </div>
                  <div>
                    <div className="lbl" style={{ marginBottom: 6 }}>Price (USD)</div>
                    <input type="number" min="0" step="any" placeholder="0.00"
                      value={txForm.price} onChange={e => setTxField("price", e.target.value)} />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <div className="lbl" style={{ marginBottom: 6 }}>Date</div>
                  <input type="date" value={txForm.date} onChange={e => setTxField("date", e.target.value)} />
                </div>

                {/* Notes */}
                <div>
                  <div className="lbl" style={{ marginBottom: 6 }}>Notes / Tags</div>
                  <input placeholder="DCA, gift, staking reward..." value={txForm.notes} onChange={e => setTxField("notes", e.target.value)} />
                </div>

                {/* Live P&L preview */}
                {qty > 0 && price > 0 && (
                  <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <div><div style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>Total Cost</div><div style={{ fontSize: 13, fontWeight: 700, color: "#ccc" }}>${totalCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div></div>
                      <div><div style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>Current Val</div><div style={{ fontSize: 13, fontWeight: 700, color: "#ccc" }}>${currentVal.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div></div>
                      <div><div style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>Unrealized</div><div style={{ fontSize: 13, fontWeight: 700, color: unrealized >= 0 ? "#00e676" : "#ff4444" }}>{unrealized >= 0 ? "+" : ""}${unrealized.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div></div>
                    </div>
                  </div>
                )}

                {/* Error */}
                {txFormError && <div style={{ fontSize: 12, color: "#ff4444", textAlign: "center" }}>{txFormError}</div>}

                <button onClick={submitTx} disabled={txSubmitting}
                  style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14,
                    cursor: txSubmitting ? "not-allowed" : "pointer", opacity: txSubmitting ? 0.6 : 1,
                    background: txForm.type === "buy" ? "#00e676" : "#ff4444", color: "#000" }}>
                  {txSubmitting ? "Saving..." : txForm.type === "buy" ? "⬆ Add Buy" : "⬇ Add Sell"}
                </button>
              </div>
              )}
            </div>
          </>
        );
      })()}

      {/* TRANSACTION OPTIONS BOTTOM SHEET */}
      {txOptionsOpen && (
        <>
          <div className="overlay" style={{ zIndex: 100 }} onClick={() => setTxOptionsOpen(null)} />
          <div className="options-sheet">
            <div className="options-sheet-handle" />
            <div className="options-sheet-title">Transaction Options</div>

            {/* Edit */}
            {(() => {
              const tx = TRANSACTIONS.find(t => t.id === txOptionsOpen);
              const isFirestore = typeof txOptionsOpen === "string";
              return (
                <button className="options-sheet-row" onClick={() => isFirestore && tx ? openEdit(tx) : setTxOptionsOpen(null)}
                  style={{ opacity: isFirestore ? 1 : 0.4 }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span style={{ fontSize: 20, fontWeight: 600, color: "#fff" }}>
                    {isFirestore ? "Edit Transaction" : "Cannot Edit (Historical)"}
                  </span>
                </button>
              );
            })()}

            {/* Divider */}
            <div style={{ height: 1, background: "#3a3a3a", margin: "0 24px" }} />

            {/* Remove */}
	              <button className="options-sheet-row" onClick={async () => {
	                const txId = txOptionsOpen;
	                // Only Firestore transactions (string IDs) can be deleted
                if (typeof txId === "string") {
                  try {
                    await fsDel("transactions", txId);
                    setFirestoreTxs(prev => prev.filter(t => t.id !== txId));
                  } catch (err) {
                    console.error("Delete failed:", err);
                    alert("Delete failed: " + err.message);
                  }
	                } else {
                alert("Historical transactions cannot be removed here. They are part of the imported CSV data.");
              }
              setTxOptionsOpen(null);
            }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#ff4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <span style={{ fontSize: 20, fontWeight: 600, color: typeof txOptionsOpen === "string" ? "#ff4444" : "#555" }}>
                {typeof txOptionsOpen === "string" ? "Remove Transaction" : "Cannot Remove (Historical)"}
              </span>
            </button>
          </div>
        </>
      )}

      {/* IMPORT CSV MODAL */}
      {importOpen && (
        <>
          <div className="overlay" onClick={() => { setImportOpen(false); setImportPreview([]); setImportText(""); setImportError(""); }} />
          <div className="modal" style={{ maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>Import Transactions</span>
              <button style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 20 }} onClick={() => { setImportOpen(false); setImportPreview([]); setImportText(""); setImportError(""); }}>✕</button>
            </div>

            {!importPreview.length ? (
              <div style={{ display: "grid", gap: 14 }}>
                {/* Format guide */}
                <div style={{ background: "#0d0d14", border: "1px solid #2a2a4a", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#7b6ef6", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Required CSV Format</div>
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: "#888", lineHeight: 1.7, overflowX: "auto", whiteSpace: "nowrap" }}>
                    date,member,coin,type,qty,purchasePrice,...<br/>
                    2024-01-15,jorge,BTC,buy,0.05,42000,...
                  </div>
                  <div style={{ fontSize: 10, color: "#555", marginTop: 8 }}>
                    Required: <span style={{ color: "#aaa" }}>date · member · coin · type · qty</span>. Member must match an existing portfolio ID.
                  </div>
                </div>

                {/* Download template */}
                <button
                  onClick={() => {
                    const template = "date,member,coin,type,qty,purchasePrice,usdTotal,exchange,fee,notes\n" +
                      MEMBERS.slice(0,1).map(m => `2024-01-15,${m.id},BTC,buy,0.01,42000,420,Coinbase,0,Example buy`).join("\n");
                    const blob = new Blob([template], { type: "text/csv" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "import_template.csv";
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
                  }}
                  style={{ background: "none", border: "1px solid #333", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#aaa", cursor: "pointer", textAlign: "left" }}>
                  ↓ Download template CSV
                </button>

                {/* Paste area */}
                <div>
                  <div className="lbl" style={{ marginBottom: 6 }}>Paste CSV content or upload file</div>
                  <textarea
                    rows={8}
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                    placeholder={"date,member,coin,type,qty,purchasePrice,...\n2024-01-15,jorge,BTC,buy,0.05,42000,..."}
                    style={{ width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: 8, color: "#ccc", fontSize: 11, padding: "10px 12px", boxSizing: "border-box", fontFamily: "monospace", resize: "vertical", outline: "none", lineHeight: 1.5 }}
                  />
                </div>

                {/* File upload */}
                <div>
                  <label style={{ display: "inline-block", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#aaa", cursor: "pointer" }}>
                    ↑ Upload .csv file
                    <input type="file" accept=".csv,text/csv" style={{ display: "none" }}
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => setImportText(ev.target.result);
                        reader.readAsText(file);
                        e.target.value = "";
                      }} />
                  </label>
                </div>

                {importError && <div style={{ fontSize: 12, color: "#ff4444", background: "#ff44440d", borderRadius: 8, padding: "8px 12px" }}>{importError}</div>}

                <button onClick={() => parseImportCSV(importText)} disabled={!importText.trim()}
                  style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14,
                    cursor: importText.trim() ? "pointer" : "not-allowed", opacity: importText.trim() ? 1 : 0.5,
                    background: "#6fa8ff", color: "#000" }}>
                  Preview Import
                </button>
              </div>
            ) : (
              /* Preview + confirm */
              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ background: "#0d1a0d", border: "1px solid #1a3a1a", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#6fa" }}>
                  Found <strong>{importPreview.length}</strong> valid transactions ready to import.
                </div>

                <div style={{ maxHeight: 240, overflowY: "auto", background: "#0d0d0d", borderRadius: 10, border: "1px solid #1e1e1e" }}>
                  {importPreview.slice(0, 50).map((row, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #151515", fontSize: 11 }}>
                      <span style={{ color: "#aaa" }}>{row.date} · {row.member} · {row.coin}</span>
                      <span style={{ color: row.type === "buy" ? "#00e676" : "#ff4444", fontWeight: 700, textTransform: "uppercase" }}>{row.type} {row.qty}</span>
                    </div>
                  ))}
                  {importPreview.length > 50 && <div style={{ padding: "8px 12px", fontSize: 11, color: "#555" }}>... and {importPreview.length - 50} more</div>}
                </div>

                {importSaving && (
                  <div style={{ fontSize: 12, color: "#f7931a", textAlign: "center" }}>Saving {importDone} / {importPreview.length}...</div>
                )}
                {importError && <div style={{ fontSize: 12, color: "#ff4444" }}>{importError}</div>}

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setImportPreview([]); setImportError(""); }}
                    style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #333", background: "none", color: "#aaa", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    Back
                  </button>
                  <button onClick={saveImport} disabled={importSaving}
                    style={{ flex: 2, padding: "12px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14,
                      cursor: importSaving ? "not-allowed" : "pointer", opacity: importSaving ? 0.6 : 1,
                      background: "#00e676", color: "#000" }}>
                    {importSaving ? `Saving ${importDone}/${importPreview.length}...` : `Import ${importPreview.length} Transactions`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* EDIT TRANSACTION MODAL */}
      {editingTx && (() => {
        const allCoins = Object.keys(STATIC_PRICES).sort();
        const qty = parseFloat(editForm.qty) || 0;
        const price = parseFloat(editForm.price) || 0;
        const totalCost = qty * price;
        const currentVal = qty * (COIN_PRICES[editForm.coin] || 0);
        const unrealized = editForm.type === "buy" ? currentVal - totalCost : 0;
        return (
          <>
            <div className="overlay" onClick={() => setEditingTx(null)} />
            <div className="modal">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <span style={{ fontWeight: 700, fontSize: 18 }}>Edit Transaction</span>
                <button style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 20 }} onClick={() => setEditingTx(null)}>✕</button>
              </div>

              <div style={{ display: "grid", gap: 13 }}>
                {/* Portfolio */}
                <div>
                  <div className="lbl" style={{ marginBottom: 6 }}>Portfolio</div>
                  <select value={editForm.member} onChange={e => setEditField("member", e.target.value)}>
                    {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                {/* Type toggle */}
                <div>
                  <div className="lbl" style={{ marginBottom: 6 }}>Type</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["buy", "sell"].map(t => (
                      <button key={t} onClick={() => setEditField("type", t)}
                        style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer",
                          background: editForm.type === t ? (t === "buy" ? "#00e676" : "#ff4444") : "#1a1a1a",
                          color: editForm.type === t ? "#000" : "#555" }}>
                        {t === "buy" ? "⬆ Buy" : "⬇ Sell"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Coin + Exchange */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div className="lbl" style={{ marginBottom: 6 }}>Coin</div>
                    <select value={editForm.coin} onChange={e => setEditField("coin", e.target.value)}>
                      {allCoins.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="lbl" style={{ marginBottom: 6 }}>Exchange</div>
                    <select value={editForm.exchange} onChange={e => setEditField("exchange", e.target.value)}>
                      {["Coinbase","Kraken","Gemini","Binance","iTrust","Robinhood","Hardware Wallet","Transfer","Other"].map(ex => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Qty + Price */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div className="lbl" style={{ marginBottom: 6 }}>Quantity</div>
                    <input type="number" min="0" step="any" value={editForm.qty}
                      onChange={e => setEditField("qty", e.target.value)} />
                  </div>
                  <div>
                    <div className="lbl" style={{ marginBottom: 6 }}>Price (USD)</div>
                    <input type="number" min="0" step="any" value={editForm.price}
                      onChange={e => setEditField("price", e.target.value)} />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <div className="lbl" style={{ marginBottom: 6 }}>Date</div>
                  <input type="date" value={editForm.date} onChange={e => setEditField("date", e.target.value)} />
                </div>

                {/* Notes */}
                <div>
                  <div className="lbl" style={{ marginBottom: 6 }}>Notes / Tags</div>
                  <input placeholder="DCA, gift, staking reward..." value={editForm.notes}
                    onChange={e => setEditField("notes", e.target.value)} />
                </div>

                {/* Live P&L preview */}
                {qty > 0 && price > 0 && (
                  <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      <div><div style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>Total Cost</div><div style={{ fontSize: 13, fontWeight: 700, color: "#ccc" }}>${totalCost.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div></div>
                      <div><div style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>Current Val</div><div style={{ fontSize: 13, fontWeight: 700, color: "#ccc" }}>${currentVal.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div></div>
                      <div><div style={{ fontSize: 10, color: "#555", marginBottom: 3 }}>Unrealized</div><div style={{ fontSize: 13, fontWeight: 700, color: unrealized >= 0 ? "#00e676" : "#ff4444" }}>{unrealized >= 0 ? "+" : ""}${unrealized.toLocaleString("en-US", { maximumFractionDigits: 2 })}</div></div>
                    </div>
                  </div>
                )}

                {editFormError && <div style={{ fontSize: 12, color: "#ff4444", textAlign: "center" }}>{editFormError}</div>}

                <button onClick={submitEdit} disabled={editSubmitting}
                  style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", fontWeight: 700, fontSize: 14,
                    cursor: editSubmitting ? "not-allowed" : "pointer", opacity: editSubmitting ? 0.6 : 1,
                    background: editForm.type === "buy" ? "#00e676" : "#ff4444", color: "#000" }}>
                  {editSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </>
        );
      })()}

      {/* TOP BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px 10px", position: "sticky", top: 0, background: "#080808", zIndex: 50, borderBottom: "1px solid #141414" }}>
        <button className="hamburger-btn" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 5 }} onClick={() => setMenuOpen(true)}>
          <div style={{ width: 20, height: 2, background: "#fff" }} />
          <div style={{ width: 14, height: 2, background: "#fff" }} />
          <div style={{ width: 20, height: 2, background: "#fff" }} />
        </button>
        <span style={{ fontSize: 17, fontWeight: 600, color: "#fff" }}>
          {page === "home" ? "Bitcoin Portfolio"
            : page === "portfolios" ? "Portfolios"
            : page === "portfolio" && selectedCoin && coinPage === "transactions" ? `${selectedCoin} Transactions`
            : page === "portfolio" && selectedCoin ? selectedCoin
            : page === "portfolio" ? member?.name
            : page === "insights" ? "Insights"
            : page === "tax" ? "Tax Reporting"
            : page === "app-settings" ? "Settings"
            : page === "about" ? "About"
            : "Transactions"}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%",
            background: priceStatus === "live" ? "#00e676" : priceStatus === "loading" ? "#f7931a" : priceStatus === "error" ? "#ff4444" : "#555",
            boxShadow: priceStatus === "live" ? "0 0 8px #00e676" : "none" }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: priceStatus === "live" ? "#00e676" : priceStatus === "loading" ? "#f7931a" : priceStatus === "error" ? "#ff4444" : "#555" }}>
            {priceStatus === "live" ? "LIVE" : priceStatus === "loading" ? "SYNCING" : priceStatus === "error" ? "ERROR" : "STATIC"}
          </span>
        </div>
      </div>

      {/* TICKER */}
      {(() => {
        const btcChg = liveChanges.BTC ?? null;
        const ethChg = liveChanges.ETH ?? null;
        const fmt24h = (chg) => chg === null ? "—" : `${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%`;
        return (
          <div style={{ display: "flex", gap: 6, padding: "8px 18px", borderBottom: "1px solid #0c0c0c" }}>
            {[
              { sym: "₿", name: "BTC", price: fmtFull(BTC_PRICE), pct: fmt24h(btcChg), up: (btcChg ?? 0) >= 0, color: "#f7931a" },
              { sym: "Ξ", name: "ETH", price: fmtFull(ETH_PRICE), pct: fmt24h(ethChg), up: (ethChg ?? 0) >= 0, color: "#627eea" },
            ].map(t => (
              <div key={t.name} className="ticker-item" style={{ flex: 1, justifyContent: "center" }}>
                <span className="ticker-coin" style={{ color: t.color }}>{t.sym}</span>
                <span className="ticker-price">{t.price}</span>
                <span className={`ticker-pct ${t.up ? "up" : "down"}`}>{t.pct}</span>
              </div>
            ))}
          </div>
        );
      })()}

      <div style={{ height: "calc(100vh - 165px)", overflowY: "auto", paddingBottom: 80 }}>

        {/* HOME */}
        {page === "home" && (
          <div className="fade-in">
            <div style={{ padding: "20px 18px 0" }}>
              <div style={{ fontSize: 13, fontWeight: 400, color: "#888", marginBottom: 4 }}>Current Value</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, color: "#fff" }}>{fmtFull(totalUSD)}</span>
                <span style={{ fontSize: 15, fontWeight: 400, color: "#888" }}>USD</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: totalUnrealized >= 0 ? "#00e676" : "#ff4444" }}>{totalUnrealized >= 0 ? "+" : ""}{fmtFull(totalUnrealized)}</span>
                <span style={{ fontSize: 12, fontWeight: 600, background: totalUnrealized >= 0 ? "#00e676" : "#ff4444", color: "#000", padding: "2px 8px", borderRadius: 5 }}>
                  {totalUnrealized >= 0 ? "+" : ""}{totalCostBasis > 0 ? ((totalUnrealized / totalCostBasis) * 100).toFixed(2) : "0.00"}%
                </span>
              </div>
              {/* 24H Change — real weighted average across all holdings */}
              {(() => {
                const hasLive = Object.keys(liveChanges).length > 0;
                const dailyChangeUSD = hasLive
                  ? MEMBERS.reduce((sum, m) =>
                      sum + Object.entries(m.holdings).reduce((s, [coin, qty]) =>
                        s + qty * (COIN_PRICES[coin] || 0) * ((liveChanges[coin] || 0) / 100), 0
                      ), 0)
                  : null;
                const dailyChangePct = dailyChangeUSD !== null && totalUSD > 0
                  ? (dailyChangeUSD / totalUSD) * 100 : null;
                const isUp = (dailyChangeUSD ?? 0) >= 0;
                return dailyChangePct !== null ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 12, color: "#555" }}>Today</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: isUp ? "#00e676" : "#ff4444" }}>
                      {isUp ? "+" : ""}{fmtFull(dailyChangeUSD)}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: isUp ? "#00e676" : "#ff4444" }}>
                      ({isUp ? "+" : ""}{dailyChangePct.toFixed(2)}%)
                    </span>
                  </div>
                ) : null;
              })()}
            </div>

            {/* ── SMART SUMMARY ── */}
            {(() => {
              const btcTotalUSD = totalBTC * BTC_PRICE;
              const btcAllocPct = (btcTotalUSD / totalUSD * 100).toFixed(1);
              const altExposurePct = (100 - parseFloat(btcAllocPct)).toFixed(1);
              const largest = [...MEMBERS].sort((a,b) => b.usd - a.usd)[0];
              const bestPerformer = [...MEMBERS]
                .filter(m => m.costBasis > 0)
                .map(m => ({ ...m, pct: (m.unrealizedPL / m.costBasis * 100) }))
                .sort((a,b) => b.pct - a.pct)[0];
              const highestConc = [...MEMBERS].sort((a,b) => b.usd - a.usd)[0];
              const highestConcPct = (highestConc.usd / totalUSD * 100).toFixed(1);

              const stats = [
                {
                  label: "BTC Allocation",
                  value: `${btcAllocPct}%`,
                  sub: `of total family portfolio`,
                  accent: parseFloat(btcAllocPct) >= 80 ? "#f7931a" : "#00e676",
                  icon: "₿",
                },
                {
                  label: "Largest Portfolio",
                  value: largest.name,
                  sub: `${fmtFull(largest.usd)} total value`,
                  accent: "#00e676",
                  icon: "★",
                },
                {
                  label: "Best Performer",
                  value: bestPerformer ? bestPerformer.name : "—",
                  sub: bestPerformer ? `+${bestPerformer.pct.toFixed(1)}% unrealized gain` : "",
                  accent: "#00e676",
                  icon: "↑",
                },
                {
                  label: "Concentration Risk",
                  value: `${highestConcPct}%`,
                  sub: `⚠ ${highestConc.name} holds majority`,
                  accent: parseFloat(highestConcPct) > 70 ? "#ff4444" : parseFloat(highestConcPct) > 50 ? "#f7931a" : "#00e676",
                  icon: "⚠",
                  warning: parseFloat(highestConcPct) > 70 ? "High risk" : parseFloat(highestConcPct) > 50 ? "Moderate" : "Healthy",
                },
                {
                  label: "Alt Exposure",
                  value: `${altExposurePct}%`,
                  sub: `non-BTC holdings`,
                  accent: parseFloat(altExposurePct) > 20 ? "#f7931a" : "#888",
                  icon: "◎",
                },
                {
                  label: "Top Performer",
                  value: bestPerformer ? `+${bestPerformer.pct.toFixed(0)}%` : "—",
                  sub: bestPerformer ? `${bestPerformer.name} · all time` : "",
                  accent: "#00e676",
                  icon: "🏆",
                },
              ];

              return (
                <div style={{ padding: "16px 18px 0" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>Portfolio Intelligence</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {stats.map(s => (
                      <div key={s.label} style={{ background: "#111", border: `1px solid ${s.warning ? s.accent + "44" : "#1e1e1e"}`, borderRadius: 12, padding: "12px 14px", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 10, right: 12, fontSize: 16, opacity: 0.15 }}>{s.icon}</div>
                        <div style={{ fontSize: 11, fontWeight: 500, color: "#666", marginBottom: 5, letterSpacing: "0.02em" }}>{s.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: s.accent, letterSpacing: "-0.01em", marginBottom: 3, lineHeight: 1.1 }}>{s.value}</div>
                        {s.warning && <div style={{ display: "inline-block", fontSize: 10, fontWeight: 700, color: s.accent, background: s.accent + "22", borderRadius: 4, padding: "1px 6px", marginBottom: 3 }}>{s.warning}</div>}
                        <div style={{ fontSize: 11, fontWeight: 400, color: "#555", lineHeight: 1.3 }}>{s.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div style={{ padding: "18px 18px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#666" }}>Portfolio Growth</div>
                <div style={{ display: "flex", gap: 3 }}>
                  {["1M","3M","ALL"].map(r => (
                    <button key={r} className={`pill ${homeChartRange === r ? "active" : ""}`} style={{ padding: "3px 9px", fontSize: 11 }} onClick={() => setHomeChartRange(r)}>{r}</button>
                  ))}
                </div>
              </div>
              <div className="chart-bg">
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={familyChartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                    <defs>
                      <linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00e676" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#00e676" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" hide />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12, fontFamily: "'Inter',sans-serif", padding: "6px 10px" }}
                      labelStyle={{ color: "#888", fontSize: 11, marginBottom: 2 }}
                      formatter={(v) => [fmtFull(v), "Value"]}
                      labelFormatter={(_, p) => p?.[0]?.payload?.label || ""}
                    />
                    <Area type="monotone" dataKey="v" stroke="#00e676" strokeWidth={2.5} fill="url(#gGrad)" dot={false} activeDot={{ r: 4, fill: "#00e676", stroke: "#080808", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ padding: "18px 18px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: "#111", border: "1px solid #222", borderRadius: 3, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 5 }}>Total BTC</div>
                <div className="bignum" style={{ fontSize: 24, color: "#f7931a" }}>{totalBTC.toFixed(3)}</div>
                <div style={{ marginTop: 4, color: "#777", fontFamily: BC, fontSize: 13, fontWeight: 600 }}>@ {fmtFull(BTC_PRICE)}/BTC</div>
              </div>
              <div style={{ background: "#111", border: "1px solid #222", borderRadius: 3, padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 5 }}>Portfolios</div>
                <div className="bignum" style={{ fontSize: 24, color: "#fff" }}>{MEMBERS.length}</div>
                <div style={{ marginTop: 4, color: "#777", fontFamily: BC, fontSize: 13, fontWeight: 600 }}>Active members</div>
              </div>
            </div>

            {/* PORTFOLIO SHARE BY MEMBER */}
            <div style={{ padding: "18px 18px 0" }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 10 }}>BTC Share by Member</div>
              {(() => {
                const MEMBER_COLORS = ["#00e676","#f7931a","#627eea","#4da6ff","#e6007a","#9945ff","#f4b728","#8dc351"];
                const btcData = MEMBERS.map(m => ({ ...m, btcUsd: m.btc * BTC_PRICE }));
                const grandTotal = btcData.reduce((s, m) => s + m.btcUsd, 0);
                const pieData = [...btcData]
                  .sort((a, b) => b.btcUsd - a.btcUsd)
                  .map((m, i) => ({
                    name: m.name,
                    value: parseFloat((m.btcUsd / grandTotal * 100).toFixed(1)),
                    color: MEMBER_COLORS[i % MEMBER_COLORS.length],
                    btc: m.btc,
                    btcUsd: m.btcUsd,
                  }));
                return (
                  <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "16px 16px 12px" }}>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={54} outerRadius={86} paddingAngle={2} dataKey="value" strokeWidth={0}>
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, name, props) => [`${v}% · ${props.payload.btc.toFixed(6)} BTC · ${fmtFull(props.payload.btcUsd)}`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", marginTop: 4 }}>
                      {pieData.map(d => (
                        <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <div style={{ width: 9, height: 9, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 13, fontWeight: 400, color: "#aaa" }}>{d.name}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{d.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* FAMILY GOALS */}
            {(() => {
              const progress = Math.min(totalBTC / btcGoal, 1);
              const remaining = Math.max(btcGoal - totalBTC, 0);
              const pct = Math.min(progress * 100, 100).toFixed(1);

              // Stacking pace: total BTC bought / months since earliest tx
              const allDates = TRANSACTIONS.filter(t => t.usdTotal > 0 && t.type === "buy" && t.date).map(t => new Date(t.date));
              const earliestDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : null;
              const monthsActive = earliestDate ? Math.max((Date.now() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44), 1) : null;
              const btcPerMonth = monthsActive ? totalBTC / monthsActive : null;
              const monthsToGoal = btcPerMonth && remaining > 0 ? remaining / btcPerMonth : null;
              const etaDate = monthsToGoal ? new Date(Date.now() + monthsToGoal * 30.44 * 86400000) : null;
              const etaLabel = etaDate ? etaDate.toLocaleDateString("en-US", { month: "long", year: "numeric" }) : null;
              const isReached = remaining <= 0;

              return (
                <div style={{ padding: "18px 18px 0" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 10 }}>Family Goal</div>
                  <div style={{ background: "#111", border: `1px solid ${isReached ? "#1a3a1a" : "#1e1e1e"}`, borderRadius: 16, padding: "16px 16px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>Family BTC Target</div>
                        {editingGoal ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <input
                              autoFocus
                              type="number"
                              min="0.1"
                              step="0.5"
                              value={goalInput}
                              onChange={e => setGoalInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === "Enter") {
                                  const v = parseFloat(goalInput);
                                  if (!isNaN(v) && v > 0) setBtcGoal(v);
                                  setEditingGoal(false);
                                }
                                if (e.key === "Escape") setEditingGoal(false);
                              }}
                              style={{
                                width: 80, fontSize: 22, fontWeight: 700, color: "#f7931a",
                                background: "#1a1a1a", border: "1px solid #f7931a",
                                borderRadius: 8, padding: "2px 8px", outline: "none",
                              }}
                            />
                            <button
                              onClick={() => {
                                const v = parseFloat(goalInput);
                                if (!isNaN(v) && v > 0) setBtcGoal(v);
                                setEditingGoal(false);
                              }}
                              style={{ background: "#f7931a", border: "none", borderRadius: 6, padding: "4px 10px", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                            >✓</button>
                            <button
                              onClick={() => setEditingGoal(false)}
                              style={{ background: "#1e1e1e", border: "none", borderRadius: 6, padding: "4px 10px", color: "#666", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                            >✕</button>
                          </div>
                        ) : (
                          <div
                            onClick={() => { setGoalInput(btcGoal.toString()); setEditingGoal(true); }}
                            style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}
                          >
                            <span style={{ fontSize: 22, fontWeight: 700, color: "#f7931a", letterSpacing: "-0.01em" }}>{btcGoal % 1 === 0 ? btcGoal.toFixed(1) : btcGoal} BTC</span>
                            <span style={{ fontSize: 12, color: "#444", marginTop: 2 }}>✏️</span>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>Progress</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: isReached ? "#00e676" : "#fff" }}>{pct}%</div>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 10, background: "#1e1e1e", borderRadius: 5, overflow: "hidden", marginBottom: 10 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: isReached ? "linear-gradient(90deg, #00b84c, #00e676)" : "linear-gradient(90deg, #f7931a, #ffb347)", borderRadius: 5, transition: "width 0.5s ease" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#f7931a" }}>{totalBTC.toFixed(5)}</span>
                        <span style={{ fontSize: 12, color: "#555" }}>/ {btcGoal % 1 === 0 ? btcGoal.toFixed(1) : btcGoal} BTC</span>
                      </div>
                      <div style={{ fontSize: 12, color: isReached ? "#00e676" : "#555" }}>
                        {isReached ? `+${(totalBTC - btcGoal).toFixed(5)} BTC over goal` : `${remaining.toFixed(5)} BTC to go`}
                      </div>
                    </div>

                    {/* Stacking pace + ETA */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 12, borderTop: "1px solid #1a1a1a" }}>
                      <div style={{ background: "#0d0d0d", borderRadius: 10, padding: "10px 12px" }}>
                        <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>Stacking Rate</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#f7931a" }}>
                          {btcPerMonth ? `${btcPerMonth.toFixed(4)}` : "—"}
                        </div>
                        <div style={{ fontSize: 11, color: "#444", marginTop: 1 }}>BTC / month</div>
                      </div>
                      <div style={{ background: "#0d0d0d", borderRadius: 10, padding: "10px 12px" }}>
                        <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>Goal ETA</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: isReached ? "#00e676" : "#fff" }}>
                          {isReached ? "✓ Reached!" : etaLabel || "—"}
                        </div>
                        <div style={{ fontSize: 11, color: "#444", marginTop: 1 }}>
                          {!isReached && monthsToGoal ? `~${Math.ceil(monthsToGoal)} months away` : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* PORTFOLIOS PAGE */}
        {page === "portfolios" && (
          <div className="fade-in" style={{ padding: "20px 18px 0" }}>
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 400, color: "#888", marginBottom: 2 }}>Family Portfolios</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>{MEMBERS.length} Members</div>
              <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{fmtFull(totalUSD)} combined</div>
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 16, marginBottom: 16 }}>
              {[
                { label: "Total BTC", value: totalBTC.toFixed(4), sub: `@ ${fmtFull(BTC_PRICE)}`, color: "#f7931a" },
                { label: "Unrealized Gain", value: `${totalUnrealized >= 0 ? "+" : ""}${fmt(totalUnrealized)}`, sub: `${totalCostBasis > 0 ? ((totalUnrealized/totalCostBasis)*100).toFixed(1) : "0"}% all-time`, color: totalUnrealized >= 0 ? "#00e676" : "#ff4444" },
              ].map(s => (
                <div key={s.label} style={{ flex: 1, background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: s.color, letterSpacing: "-0.01em" }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* LEADERBOARD */}
            {(() => {
              const MEDALS = ["🥇","🥈","🥉"];
              const ranked = [...MEMBERS]
                .map(m => ({
                  ...m,
                  returnPct: m.costBasis > 0 ? ((m.usd - m.costBasis) / m.costBasis * 100) : null,
                  isGifted: m.costBasis > 0 && m.costBasis < 50 && m.usd > 200, // likely transfer/gift
                }))
                .filter(m => m.returnPct !== null)
                .sort((a, b) => b.returnPct - a.returnPct);
              return (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 10 }}>Leaderboard · Best Return</div>
                  <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden" }}>
                    {ranked.map((m, idx) => {
                      const isLast = idx === ranked.length - 1;
                      const barWidth = Math.max((m.returnPct / ranked[0].returnPct) * 100, 4);
                      return (
                        <div key={m.id}
                          onClick={() => { setSelectedMember(m.id); setPage("portfolio"); }}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: isLast ? "none" : "1px solid #1a1a1a", cursor: "pointer" }}>
                          <div style={{ fontSize: 16, width: 24, flexShrink: 0, textAlign: "center" }}>{MEDALS[idx] || <span style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>#{idx + 1}</span>}</div>
                          <div style={{ width: 26, height: 26, borderRadius: 7, background: "#0a1e0a", border: "1px solid #1a3a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#00e676", fontWeight: 700, flexShrink: 0 }}>{m.avatar}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{m.name}{m.isGifted ? " 🎁" : ""}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: m.returnPct >= 0 ? "#00e676" : "#ff4444" }}>{m.returnPct >= 0 ? "+" : ""}{m.returnPct.toFixed(1)}%</span>
                            </div>
                            <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${barWidth}%`, background: m.returnPct >= 0 ? "#00e676" : "#ff4444", borderRadius: 2 }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 10 }}>All Portfolios · By Holdings</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[...MEMBERS].sort((a, b) => b.btc - a.btc).map((m, idx) => {
                const pct = m.costBasis > 0 ? ((m.usd - m.costBasis) / m.costBasis * 100).toFixed(1) : null;
                const isUp = pct !== null && parseFloat(pct) >= 0;
                return (
                  <div key={m.id}
                    style={{ background: "#111", border: "1px solid #222", borderRadius: 14, padding: "14px 13px", cursor: "pointer", transition: "border-color 0.15s", position: "relative" }}
                    onClick={() => { setSelectedMember(m.id); setPage("portfolio"); }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#00e676"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#222"}>
                    {idx === 0 && <div style={{ position: "absolute", top: 9, right: 10, fontSize: 10, color: "#f7931a", fontWeight: 700 }}>▲ TOP</div>}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "#0a1e0a", border: "1px solid #1a3a1a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#00e676", fontWeight: 700 }}>{m.avatar}</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{m.name}</span>
                    </div>
                    <div style={{ fontSize: 19, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em", marginBottom: 3 }}>{fmt(m.usd)}</div>
                    {m.costBasis > 0 && <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>Cost: {fmt(m.costBasis)}</div>}
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f7931a", marginBottom: 5 }}>{m.btc.toFixed(8).replace(/\.?0+$/,'')} BTC</div>
                    {pct !== null
                      ? <div style={{ fontSize: 13, fontWeight: 600, color: isUp ? "#00e676" : "#ff4444" }}>{isUp ? "+" : ""}{pct}%</div>
                      : <div style={{ fontSize: 12, color: "#555" }}>—</div>
                    }
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PORTFOLIO — Level 1: Holdings list */}
        {page === "portfolio" && member && !selectedCoin && (
          <div className="fade-in">
            <div style={{ padding: "14px 18px 0" }}>
              <button className="btn-ghost" style={{ marginBottom: 16 }} onClick={() => { setPage("portfolios"); setSelectedMember(null); }}>← Back</button>

              {/* Hero */}
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 400, color: "#888", marginBottom: 4 }}>Current Value</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>{fmtFull(member.usd)}</span>
                  <span style={{ fontSize: 15, color: "#888" }}>USD</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: member.unrealizedPL >= 0 ? "#00e676" : "#ff4444" }}>{member.unrealizedPL >= 0 ? "+" : ""}{fmtFull(member.unrealizedPL)}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, background: member.unrealizedPL >= 0 ? "#00e676" : "#ff4444", color: "#000", padding: "2px 8px", borderRadius: 5 }}>
                    {member.costBasis > 0 ? `${member.unrealizedPL >= 0 ? "+" : ""}${((member.unrealizedPL / member.costBasis) * 100).toFixed(2)}%` : "—"}
                  </span>
                </div>
              </div>

              {/* Summary stats row */}
              <div style={{ display: "flex", gap: 8, marginTop: 16, marginBottom: 20 }}>
                <div style={{ flex: 1, background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 12, color: "#777", marginBottom: 5 }}>Amount Invested</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>{fmtFull(member.costBasis)}</div>
                </div>
                <div style={{ flex: 1, background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontSize: 12, color: "#777", marginBottom: 5 }}>Unrealized Gain</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: member.unrealizedPL >= 0 ? "#00e676" : "#ff4444" }}>{member.unrealizedPL >= 0 ? "+" : ""}{fmtFull(member.unrealizedPL)}</div>
                </div>
              </div>

              {/* ── PORTFOLIO GROWTH CHART + BENCHMARKS ── */}
              {(() => {
                const mainData =
                  snapshotsToChart(snapshots, memberChartRange, s => s.members?.[member.id] ?? 0) ||
                  generateChartData(member.usd, memberChartRange);
                const btcBench = generateBenchmarkData(member.usd, memberChartRange, 0.92);
                const spyBench = generateBenchmarkData(member.usd, memberChartRange, 0.35);
                const merged = mainData.map((d, i) => ({
                  ...d,
                  btc: memberBenchmark === "btc" ? btcBench[i]?.bv : undefined,
                  spy: memberBenchmark === "spy" ? spyBench[i]?.bv : undefined,
                }));
                return (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {["portfolio","btc","spy"].map(b => (
                          <button key={b} onClick={() => setMemberBenchmark(b)}
                            style={{ background: memberBenchmark === b ? (b === "btc" ? "#f7931a22" : b === "spy" ? "#88888822" : "#00e67622") : "transparent", border: `1px solid ${memberBenchmark === b ? (b === "btc" ? "#f7931a" : b === "spy" ? "#888" : "#00e676") : "#2a2a2a"}`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600, color: memberBenchmark === b ? (b === "btc" ? "#f7931a" : b === "spy" ? "#aaa" : "#00e676") : "#555", cursor: "pointer" }}>
                            {b.toUpperCase()}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: 3 }}>
                        {["1M","3M","ALL"].map(r => (
                          <button key={r} className={`pill ${memberChartRange === r ? "active" : ""}`} style={{ padding: "3px 8px", fontSize: 10 }} onClick={() => setMemberChartRange(r)}>{r}</button>
                        ))}
                      </div>
                    </div>
                    <div className="chart-bg">
                      <ResponsiveContainer width="100%" height={150}>
                        <AreaChart data={merged} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                          <defs>
                            <linearGradient id="mGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00e676" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#00e676" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="label" hide />
                          <YAxis hide />
                          <Tooltip
                            contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12, fontFamily: "'Inter',sans-serif", padding: "6px 10px" }}
                            labelStyle={{ color: "#888", fontSize: 11, marginBottom: 2 }}
                            formatter={(v, name) => [fmtFull(v), name === "v" ? "Portfolio" : name === "btc" ? "BTC" : "SPY"]}
                            labelFormatter={(_, p) => p?.[0]?.payload?.label || ""}
                          />
                          <Area type="monotone" dataKey="v" stroke="#00e676" strokeWidth={2} fill="url(#mGrad)" dot={false} activeDot={{ r: 4, fill: "#00e676", stroke: "#080808", strokeWidth: 2 }} />
                          {memberBenchmark === "btc" && <Area type="monotone" dataKey="btc" stroke="#f7931a" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 3" activeDot={{ r: 3, fill: "#f7931a" }} />}
                          {memberBenchmark === "spy" && <Area type="monotone" dataKey="spy" stroke="#888" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 3" activeDot={{ r: 3, fill: "#888" }} />}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })()}

              {/* ── ALLOCATION TARGETS + REBALANCE DRIFT ── */}
              {(() => {
                const BTC_TARGETS = { itrust: 1.0, anseli: 0.80, emily: 0.80, marcos: 0.80, melanie: 0.80, michael: 1.0, skylar: 0.80, steven: 0.80, jorge: 1.0 };
                const target = BTC_TARGETS[member.id] ?? 0.80;
                const btcVal = (member.holdings?.BTC || 0) * BTC_PRICE;
                const actual = member.usd > 0 ? btcVal / member.usd : 0;
                const drift = actual - target;
                const absDrift = Math.abs(drift);
                const driftColor = absDrift <= 0.05 ? "#00e676" : absDrift <= 0.15 ? "#f7931a" : "#ff4444";
                const driftLabel = absDrift <= 0.05 ? "On Target" : drift > 0 ? "Over-allocated" : "Under-allocated";

                // find largest non-BTC holding by USD
                const nonBtc = Object.entries(member.holdings || {})
                  .filter(([c]) => c !== "BTC")
                  .map(([c, q]) => [c, q * (COIN_PRICES[c] || 0)])
                  .sort(([,a],[,b]) => b - a);
                const topAlt = nonBtc[0];
                const rebalanceNote = absDrift > 0.05 && topAlt
                  ? drift > 0
                    ? `BTC is ${(drift*100).toFixed(0)}% above target — consider trimming into alts`
                    : `${topAlt[0]} is your largest alt (${fmtFull(topAlt[1])}) — consider rotating to BTC`
                  : null;

                return (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#666" }}>BTC Allocation</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: driftColor, background: `${driftColor}18`, padding: "2px 8px", borderRadius: 6 }}>{driftLabel}</span>
                      </div>
                    </div>

                    {/* Bar */}
                    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>Actual</div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{(actual * 100).toFixed(1)}%</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>Target</div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: "#888" }}>{(target * 100).toFixed(0)}%</div>
                        </div>
                      </div>

                      {/* Track */}
                      <div style={{ position: "relative", height: 8, background: "#1e1e1e", borderRadius: 4, overflow: "visible", marginBottom: 6 }}>
                        {/* Actual fill */}
                        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${Math.min(actual * 100, 100)}%`, background: driftColor, borderRadius: 4, transition: "width 0.4s ease" }} />
                        {/* Target marker */}
                        <div style={{ position: "absolute", top: -3, left: `${target * 100}%`, transform: "translateX(-50%)", width: 2, height: 14, background: "#fff", borderRadius: 1, opacity: 0.5 }} />
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, color: "#555" }}>0%</span>
                        <span style={{ fontSize: 11, color: "#555" }}>100%</span>
                      </div>

                      {/* Drift line */}
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#555" }}>Drift from target</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: driftColor }}>{drift >= 0 ? "+" : ""}{(drift * 100).toFixed(1)}%</span>
                      </div>

                      {/* Rebalance suggestion */}
                      {rebalanceNote && (
                        <div style={{ marginTop: 8, background: `${driftColor}12`, border: `1px solid ${driftColor}30`, borderRadius: 8, padding: "8px 10px", fontSize: 12, color: driftColor }}>
                          ⚡ {rebalanceNote}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* ── CONTRIBUTION VS MARKET PERFORMANCE ── */}
              {(() => {
                const contributed = member.costBasis;
                const marketGain = member.unrealizedPL;
                const total = member.usd;
                const hasData = contributed > 0 && total > 0;
                const contribPct = hasData ? (contributed / total) * 100 : 0;
                const gainPct = hasData ? Math.max((marketGain / total) * 100, 0) : 0;
                const multiplier = contributed > 0 ? (total / contributed).toFixed(2) : null;
                const isGain = marketGain >= 0;

                // avg hold time from first tx date
                const mTxs = TRANSACTIONS.filter(t => t.member === member.id && t.date);
                const firstDate = mTxs.length > 0
                  ? new Date(mTxs.reduce((earliest, t) => t.date < earliest ? t.date : earliest, mTxs[0].date))
                  : null;
                const holdDays = firstDate ? Math.floor((Date.now() - firstDate.getTime()) / 86400000) : null;
                const holdLabel = holdDays
                  ? holdDays >= 365 ? `${(holdDays / 365).toFixed(1)} yrs` : `${holdDays} days`
                  : "—";

                return (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 10 }}>Performance Breakdown</div>
                    <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "14px 16px" }}>

                      {/* Two stat cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                        <div style={{ background: "#0d0d0d", borderRadius: 10, padding: "10px 12px" }}>
                          <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>Invested</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#6fa8ff" }}>{contributed > 0 ? fmtFull(contributed) : "—"}</div>
                          <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>cash in</div>
                        </div>
                        <div style={{ background: "#0d0d0d", borderRadius: 10, padding: "10px 12px" }}>
                          <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>Appreciation</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: isGain ? "#00e676" : "#ff4444" }}>{isGain ? "+" : ""}{fmtFull(marketGain)}</div>
                          <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>price appreciation</div>
                        </div>
                      </div>

                      {/* Stacked bar */}
                      {hasData && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", background: "#1a1a1a" }}>
                            <div style={{ width: `${Math.min(contribPct, 100)}%`, background: "#3a6fd8", transition: "width 0.4s" }} />
                            {isGain && <div style={{ width: `${Math.min(gainPct, 100 - contribPct)}%`, background: "#00e676", transition: "width 0.4s" }} />}
                          </div>
                          <div style={{ display: "flex", gap: 14, marginTop: 7 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <div style={{ width: 8, height: 8, borderRadius: 2, background: "#3a6fd8" }} />
                              <span style={{ fontSize: 11, color: "#555" }}>Invested {contribPct.toFixed(0)}%</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                              <div style={{ width: 8, height: 8, borderRadius: 2, background: "#00e676" }} />
                              <span style={{ fontSize: 11, color: "#555" }}>Gains {gainPct.toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Footer stats */}
                      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #1a1a1a" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>Multiplier</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: multiplier && parseFloat(multiplier) >= 1 ? "#00e676" : "#ff4444" }}>
                            {multiplier ? `${multiplier}×` : "—"}
                          </div>
                        </div>
                        <div style={{ width: 1, background: "#1a1a1a" }} />
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>Avg Hold Time</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{holdLabel}</div>
                        </div>
                        <div style={{ width: 1, background: "#1a1a1a" }} />
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 11, color: "#555", marginBottom: 2 }}>Total Return</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: isGain ? "#00e676" : "#ff4444" }}>
                            {contributed > 0 ? `${isGain ? "+" : ""}${((marketGain / contributed) * 100).toFixed(0)}%` : "—"}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })()}

              {/* Holdings list — tappable to coin detail */}
              <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 10 }}>Holdings</div>
              <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
                {Object.entries(member.holdings || {})
                  .sort(([ca, qa], [cb, qb]) => (qb * (COIN_PRICES[cb]||0)) - (qa * (COIN_PRICES[ca]||0)))
                  .map(([coin, qty], idx, arr) => {
                    const price = COIN_PRICES[coin] || 0;
                    const usdVal = qty * price;
                    const costForCoin = TRANSACTIONS.filter(t => t.member === member.id && t.coin === coin && t.usdTotal > 0).reduce((s,t) => s + t.usdTotal, 0);
                    const plDollar = costForCoin > 0 ? usdVal - costForCoin : null;
                    const plPct = costForCoin > 0 ? ((usdVal - costForCoin) / costForCoin * 100).toFixed(1) : null;
                    const COIN_COLOR = {BTC:"#f7931a",ETH:"#627eea",ADA:"#4da6ff",LTC:"#b8b8b8",SOL:"#9945ff",DOT:"#e6007a",XRP:"#00aad4",ALGO:"#00b4d8",CRV:"#d84627",XLM:"#14b8d4",BCH:"#8dc351",BAT:"#ff5000",ZEC:"#f4b728",EOS:"#6e5da8",DGB:"#006ad2",ETC:"#328332",IQ:"#e91e8c",TRX:"#ef0027",XMR:"#ff6600",LINK:"#2a5ada",SUPER:"#7b3fe4",ICP:"#3b00b9",THETA:"#2ab8e6",FIL:"#0090ff",TFUEL:"#f7941d",BTG:"#eba809",USDT:"#26a17b",TMT:"#4a90d9",ENS:"#5284ff",ZIL:"#29ccc4",QTUM:"#2e9ad0",UTK:"#4a4af4",VET:"#15bdff",AMPL:"#cc3e00",NEO:"#58bf00",SGB:"#e4348b",SHIB:"#ffa409",ZRX:"#302c2c",MANA:"#ff2d55",GALA:"#1a1a2e",DENT:"#aaaaaa",OMG:"#1a53f0",REEF:"#5f34d6",XNO:"#4a90e2",XTZ:"#2c7df7",FET:"#1a1a3e",TRUMP:"#e4b400",SAND:"#04adef",ICX:"#1fc5c9",FLR:"#e4179c",LCC:"#45b26b",XRD:"#052cc0",STX:"#5546ff",GZIL:"#29ccc4",HERO:"#00c9ff",GAS:"#58bf00",HEX:"#ff00ff",KCS:"#0093dd",WAN:"#136aad",TKY:"#1abc9c",NCASH:"#00b4ff",TDROP:"#222222",SXP:"#ff3366",BAX:"#ff69b4",AST:"#0b70ff",ETHW:"#627eea",NEX:"#58bf00",FTT:"#02a4d3",MELANIA:"#c0c0c0",FLM:"#ff69b4",RDD:"#c6222a",BIX:"#2d5de6",KDA:"#ed098f",BLOK:"#8c52ff",USDC:"#2775ca",PLR:"#45b26b",CORZ:"#aaaaaa",GFOF:"#eba809"};
                    const COIN_ICON = {BTC:"₿",ETH:"Ξ",ADA:"⬡",LTC:"Ł",SOL:"◎",DOT:"●",XRP:"✦",ALGO:"A",CRV:"C",XLM:"✶",BCH:"Ƀ",BAT:"▲",ZEC:"Z",EOS:"E",DGB:"D",ETC:"Ξ",IQ:"IQ"};
                    const isLast = idx === arr.length - 1;
                    return (
                      <div key={coin}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 16px", borderBottom: isLast ? "none" : "1px solid #1a1a1a", cursor: "pointer" }}
                        onClick={() => { setSelectedCoin(coin); setCoinPage("detail"); }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 42, height: 42, borderRadius: "50%", background: `${COIN_COLOR[coin]||"#555"}20`, border: `1.5px solid ${COIN_COLOR[coin]||"#555"}55`, display: "flex", alignItems: "center", justifyContent: "center", color: COIN_COLOR[coin]||"#888", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{COIN_ICON[coin]||coin.slice(0,2)}</div>
                          <div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{coin}</div>
                            <div style={{ fontSize: 13, color: "#777" }}>{qty < 0.001 ? qty.toFixed(8) : qty < 1 ? qty.toFixed(5) : qty.toFixed(4)} | {price > 0 ? `$${price.toLocaleString()}` : "—"}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{usdVal > 0.01 ? fmtFull(usdVal) : "—"}</div>
                          {plDollar !== null && (
                            <div style={{ fontSize: 13, fontWeight: 500, color: plDollar >= 0 ? "#00e676" : "#ff4444" }}>
                              {plDollar >= 0 ? "+" : ""}{fmtFull(plDollar)} <span style={{ fontSize: 12 }}>{plDollar >= 0 ? "+" : ""}{plPct}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Recent Transactions */}
              {memberTxs.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#666" }}>Recent Transactions</div>
                    <span style={{ fontSize: 12, color: "#555" }}>{memberTxs.length} total</span>
                  </div>
                  <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden" }}>
                    {memberTxs.slice(0, 5).map((tx, idx) => renderTxRow(tx, idx, memberTxs.slice(0, 5)))}
                  </div>
                </div>
              )}
            </div>

            {/* Floating Add Transaction button — pre-fills this member */}
            <button
              onClick={() => {
                setTxForm(f => ({ ...f, member: member.id }));
                setAddTxOpen(true);
              }}
              style={{
                position: "fixed", bottom: 90, right: 20,
                width: 52, height: 52, borderRadius: "50%",
                background: "#00e676", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 20px rgba(0,230,118,0.4)",
                zIndex: 60, fontSize: 26, fontWeight: 300, color: "#000", lineHeight: 1,
              }}>
              +
            </button>
          </div>
        )}

        {/* COIN DETAIL — Level 2: chart + stats for one coin */}
        {page === "portfolio" && member && selectedCoin && coinPage === "detail" && (() => {
          const coin = selectedCoin;
          const qty = member.holdings?.[coin] || 0;
          const price = COIN_PRICES[coin] || 0;
          const usdVal = qty * price;
          const coinTxs = TRANSACTIONS.filter(t => t.member === member.id && t.coin === coin);
          const costForCoin = coinTxs.filter(t => t.usdTotal > 0).reduce((s,t) => s + t.usdTotal, 0);
          const totalGains = costForCoin > 0 ? usdVal - costForCoin : null;
          const avgBuyPrice = coinTxs.filter(t => t.type === "buy" && t.usdTotal > 0).length > 0
            ? coinTxs.filter(t => t.type === "buy" && t.usdTotal > 0).reduce((s,t) => s + t.purchasePrice, 0) / coinTxs.filter(t => t.type === "buy" && t.usdTotal > 0).length : 0;
          const avgSellPrice = coinTxs.filter(t => t.type === "sell" && t.usdTotal > 0).length > 0
            ? coinTxs.filter(t => t.type === "sell" && t.usdTotal > 0).reduce((s,t) => s + t.purchasePrice, 0) / coinTxs.filter(t => t.type === "sell" && t.usdTotal > 0).length : 0;
          const COIN_COLOR = {BTC:"#f7931a",ETH:"#627eea",ADA:"#4da6ff",LTC:"#b8b8b8",SOL:"#9945ff",DOT:"#e6007a",XRP:"#00aad4",ALGO:"#00b4d8",CRV:"#d84627",XLM:"#14b8d4",BCH:"#8dc351",BAT:"#ff5000",ZEC:"#f4b728",EOS:"#6e5da8",DGB:"#006ad2",ETC:"#328332",IQ:"#e91e8c",TRX:"#ef0027",XMR:"#ff6600",LINK:"#2a5ada",SUPER:"#7b3fe4",ICP:"#3b00b9",THETA:"#2ab8e6",FIL:"#0090ff",TFUEL:"#f7941d",BTG:"#eba809",USDT:"#26a17b",TMT:"#4a90d9",ENS:"#5284ff",ZIL:"#29ccc4",QTUM:"#2e9ad0",UTK:"#4a4af4",VET:"#15bdff",AMPL:"#cc3e00",NEO:"#58bf00",SGB:"#e4348b",SHIB:"#ffa409",ZRX:"#302c2c",MANA:"#ff2d55",GALA:"#1a1a2e",DENT:"#aaaaaa",OMG:"#1a53f0",REEF:"#5f34d6",XNO:"#4a90e2",XTZ:"#2c7df7",FET:"#1a1a3e",TRUMP:"#e4b400",SAND:"#04adef",ICX:"#1fc5c9",FLR:"#e4179c",LCC:"#45b26b",XRD:"#052cc0",STX:"#5546ff",GZIL:"#29ccc4",HERO:"#00c9ff",GAS:"#58bf00",HEX:"#ff00ff",KCS:"#0093dd",WAN:"#136aad",TKY:"#1abc9c",NCASH:"#00b4ff",TDROP:"#222222",SXP:"#ff3366",BAX:"#ff69b4",AST:"#0b70ff",ETHW:"#627eea",NEX:"#58bf00",FTT:"#02a4d3",MELANIA:"#c0c0c0",FLM:"#ff69b4",RDD:"#c6222a",BIX:"#2d5de6",KDA:"#ed098f",BLOK:"#8c52ff",USDC:"#2775ca",PLR:"#45b26b",CORZ:"#aaaaaa",GFOF:"#eba809"};
          const COIN_ICON = {BTC:"₿",ETH:"Ξ",ADA:"⬡",LTC:"Ł",SOL:"◎",DOT:"●",XRP:"✦",ALGO:"A",CRV:"C",XLM:"✶",BCH:"Ƀ",BAT:"▲",ZEC:"Z",EOS:"E",DGB:"D",ETC:"Ξ",IQ:"IQ"};
          const COIN_NAME = {BTC:"Bitcoin",ETH:"Ethereum",ADA:"Cardano",LTC:"Litecoin",SOL:"Solana",DOT:"Polkadot",XRP:"Ripple",ALGO:"Algorand",CRV:"Curve",XLM:"Stellar",BCH:"Bitcoin Cash",BAT:"Basic Attention",ZEC:"Zcash",EOS:"EOS",DGB:"DigiByte",ETC:"Ethereum Classic",IQ:"IQ"};
          const coinChart = generateChartData(usdVal);
          const color = COIN_COLOR[coin] || "#00e676";
          return (
            <div className="fade-in">
              <div style={{ padding: "14px 18px 0" }}>
                {/* Header */}
                <button className="btn-ghost" style={{ marginBottom: 16 }} onClick={() => setSelectedCoin(null)}>← Back</button>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${color}25`, border: `2px solid ${color}66`, display: "flex", alignItems: "center", justifyContent: "center", color, fontWeight: 700, fontSize: 16 }}>{COIN_ICON[coin]||coin.slice(0,2)}</div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{coin}</div>
                    <div style={{ fontSize: 13, color: "#777", textAlign: "center" }}>{COIN_NAME[coin]||coin}</div>
                  </div>
                </div>

                {/* Owned / Market Value / Total Gains */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, marginBottom: 20, marginTop: 16, borderTop: "1px solid #1a1a1a", borderBottom: "1px solid #1a1a1a", padding: "14px 0" }}>
                  {[
                    { lbl: "Owned", val: qty < 0.001 ? qty.toFixed(8) : qty < 1 ? qty.toFixed(6) : qty.toFixed(4) },
                    { lbl: "Market Value", val: fmtFull(usdVal) },
                    { lbl: "Total Gains", val: totalGains !== null ? `${totalGains >= 0 ? "+" : ""}${fmtFull(totalGains)}` : "—", color: totalGains !== null ? (totalGains >= 0 ? "#00e676" : "#ff4444") : "#888" },
                  ].map(s => (
                    <div key={s.lbl} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 12, color: "#777", marginBottom: 4 }}>{s.lbl}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: s.color || "#fff" }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", gap: 3, justifyContent: "flex-end", marginBottom: 8 }}>
                    {["1M","3M","ALL"].map(r => (
                      <button key={r} className={`pill ${coinChartRange === r ? "active" : ""}`} style={{ padding: "3px 9px", fontSize: 11 }} onClick={() => setCoinChartRange(r)}>{r}</button>
                    ))}
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={generateChartData(usdVal, coinChartRange)} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" hide />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 12, fontFamily: "'Inter',sans-serif", padding: "6px 10px" }}
                        labelStyle={{ color: "#888", fontSize: 11, marginBottom: 2 }}
                        formatter={(v) => [fmtFull(v), coin]}
                        labelFormatter={(_, p) => p?.[0]?.payload?.label || ""}
                      />
                      <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2.5} fill="url(#coinGrad)" dot={false} activeDot={{ r: 4, fill: color, stroke: "#080808", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Avg buy / sell / tx count */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
                  {[
                    { lbl: "Avg. Buy Price", val: avgBuyPrice > 0 ? `$${avgBuyPrice.toLocaleString(undefined, {maximumFractionDigits:2})}` : "—" },
                    { lbl: "Avg. Sell Price", val: avgSellPrice > 0 ? `$${avgSellPrice.toLocaleString(undefined, {maximumFractionDigits:2})}` : "—" },
                    { lbl: "# Transactions", val: coinTxs.length },
                  ].map(s => (
                    <div key={s.lbl} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, color: "#777", marginBottom: 4 }}>{s.lbl}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Transactions link */}
                <button
                  style={{ width: "100%", background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: 24 }}
                  onClick={() => setCoinPage("transactions")}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Transactions</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, color: "#00e676", fontWeight: 600 }}>{coinTxs.length} trades</span>
                    <span style={{ fontSize: 18, color: "#555" }}>›</span>
                  </span>
                </button>
              </div>
            </div>
          );
        })()}

        {/* COIN TRANSACTIONS — Level 3: expanded detail cards */}
        {page === "portfolio" && member && selectedCoin && coinPage === "transactions" && (() => {
          const coin = selectedCoin;
          const coinTxs = TRANSACTIONS.filter(t => t.member === member.id && t.coin === coin).sort((a,b) => new Date(b.date) - new Date(a.date));
          const COIN_COLOR = {BTC:"#f7931a",ETH:"#627eea",ADA:"#4da6ff",LTC:"#b8b8b8",SOL:"#9945ff",DOT:"#e6007a",XRP:"#00aad4",ALGO:"#00b4d8",CRV:"#d84627",XLM:"#14b8d4",BCH:"#8dc351",BAT:"#ff5000",ZEC:"#f4b728",EOS:"#6e5da8",DGB:"#006ad2",ETC:"#328332",IQ:"#e91e8c",TRX:"#ef0027",XMR:"#ff6600",LINK:"#2a5ada",SUPER:"#7b3fe4",ICP:"#3b00b9",THETA:"#2ab8e6",FIL:"#0090ff",TFUEL:"#f7941d",BTG:"#eba809",USDT:"#26a17b",TMT:"#4a90d9",ENS:"#5284ff",ZIL:"#29ccc4",QTUM:"#2e9ad0",UTK:"#4a4af4",VET:"#15bdff",AMPL:"#cc3e00",NEO:"#58bf00",SGB:"#e4348b",SHIB:"#ffa409",ZRX:"#302c2c",MANA:"#ff2d55",GALA:"#1a1a2e",DENT:"#aaaaaa",OMG:"#1a53f0",REEF:"#5f34d6",XNO:"#4a90e2",XTZ:"#2c7df7",FET:"#1a1a3e",TRUMP:"#e4b400",SAND:"#04adef",ICX:"#1fc5c9",FLR:"#e4179c",LCC:"#45b26b",XRD:"#052cc0",STX:"#5546ff",GZIL:"#29ccc4",HERO:"#00c9ff",GAS:"#58bf00",HEX:"#ff00ff",KCS:"#0093dd",WAN:"#136aad",TKY:"#1abc9c",NCASH:"#00b4ff",TDROP:"#222222",SXP:"#ff3366",BAX:"#ff69b4",AST:"#0b70ff",ETHW:"#627eea",NEX:"#58bf00",FTT:"#02a4d3",MELANIA:"#c0c0c0",FLM:"#ff69b4",RDD:"#c6222a",BIX:"#2d5de6",KDA:"#ed098f",BLOK:"#8c52ff",USDC:"#2775ca",PLR:"#45b26b",CORZ:"#aaaaaa",GFOF:"#eba809"};
          const COIN_ICON = {BTC:"₿",ETH:"Ξ",ADA:"⬡",LTC:"Ł",SOL:"◎",DOT:"●",XRP:"✦",ALGO:"A",CRV:"C",XLM:"✶",BCH:"Ƀ",BAT:"▲",ZEC:"Z",EOS:"E",DGB:"D",ETC:"Ξ",IQ:"IQ"};
          const color = COIN_COLOR[coin] || "#00e676";
          return (
            <div className="fade-in">
              <div style={{ padding: "14px 18px 0" }}>
                <button className="btn-ghost" style={{ marginBottom: 16 }} onClick={() => setCoinPage("detail")}>← Back</button>

                {/* Coin header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${color}25`, border: `2px solid ${color}66`, display: "flex", alignItems: "center", justifyContent: "center", color, fontWeight: 700, fontSize: 14 }}>{COIN_ICON[coin]||coin.slice(0,2)}</div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{coin}</div>
                    <div style={{ fontSize: 12, color: "#777" }}>{coinTxs.length} transactions</div>
                  </div>
	                  <button
	                    style={{ marginLeft: "auto", background: "#00e676", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "#000", cursor: "pointer" }}
	                    onClick={() => setAddTxOpen(true)}>+ Add</button>
                </div>

                {/* Expanded transaction detail cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  {coinTxs.length === 0 && (
                    <div style={{ textAlign: "center", color: "#555", padding: "32px 0", fontSize: 14 }}>No transactions yet</div>
                  )}
                  {coinTxs.map(tx => {
                    const currentPrice = COIN_PRICES[tx.coin] || 0;
                    const currentWorth = currentPrice * tx.qty;
                    const delta = tx.usdTotal > 0 ? ((currentWorth - tx.usdTotal) / tx.usdTotal * 100).toFixed(2) : null;
                    const isUp = delta !== null && parseFloat(delta) >= 0;
                    const isOpen = txOptionsOpen === tx.id;
                    return (
                      <div key={tx.id}>
                        {/* Row header: type badge + date + 3-dot */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ background: "transparent", border: `1.5px solid ${tx.type === "buy" ? "#00e676" : "#ff4444"}`, color: tx.type === "buy" ? "#00e676" : "#ff4444", borderRadius: 6, padding: "2px 12px", fontSize: 13, fontWeight: 700 }}>
                            {tx.type === "buy" ? "Buy" : "Sell"}
                          </span>
                          <span style={{ fontSize: 13, color: "#777" }}>{tx.date} via {tx.exchange}</span>
                          <button
                            style={{ marginLeft: "auto", background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 22, padding: "0 4px", lineHeight: 1, fontWeight: 400 }}
                            onClick={() => setTxOptionsOpen(tx.id)}>⋮</button>
                        </div>
                        {/* Detail card */}
                        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "14px 16px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 0" }}>
                            <div>
                              <div style={{ fontSize: 12, color: "#777", marginBottom: 3 }}>Buy Price ({coin}/USD)</div>
                              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>${tx.purchasePrice > 0 ? tx.purchasePrice.toLocaleString(undefined, {maximumFractionDigits:2}) : "—"}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 12, color: "#777", marginBottom: 3 }}>Amount Added</div>
                              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{tx.qty}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 12, color: "#777", marginBottom: 3 }}>Cost (Incl. Fee)</div>
                              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{tx.usdTotal > 0 ? fmtFull(tx.usdTotal) : "—"}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 12, color: "#777", marginBottom: 3 }}>Worth</div>
                              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{fmtFull(currentWorth)}</div>
                            </div>
                            {tx.fee > 0 && (
                              <div>
                                <div style={{ fontSize: 12, color: "#777", marginBottom: 3 }}>Fee</div>
                                <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>${tx.fee}</div>
                              </div>
                            )}
                            {delta !== null && (
                              <div>
                                <div style={{ fontSize: 12, color: "#777", marginBottom: 3 }}>Delta</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: isUp ? "#00e676" : "#ff4444" }}>{isUp ? "+" : ""}{delta}%</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}

        {/* INSIGHTS */}
        {page === "insights" && (
          <div className="fade-in" style={{ padding: "18px 18px 0" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 5 }}>Portfolio Balance</div>
              <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", marginBottom: 3 }}>{fmtFull(totalUSD)}</div>
              <div style={{ fontSize: 13, fontWeight: 400, color: "#666" }}>Total across all portfolios</div>
            </div>

            {/* ── NET DEPOSITS VS MARKET GAINS ── */}
            {(() => {
              const deposited = totalCostBasis;
              const gained = totalUnrealized;
              const total = totalUSD;
              const depPct = total > 0 ? (deposited / total) * 100 : 0;
              const gainPct = total > 0 ? Math.max((gained / total) * 100, 0) : 0;
              const multiplier = deposited > 0 ? (total / deposited) : 1;
              const isGain = gained >= 0;
              return (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 10 }}>Net Deposits vs Market Gains</div>
                  <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, padding: "16px" }}>

                    {/* Two big stat cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                      <div style={{ background: "#0d0d0d", borderRadius: 10, padding: "14px" }}>
                        <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>Net Deposits</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#6fa8ff", letterSpacing: "-0.01em" }}>{fmtFull(deposited)}</div>
                        <div style={{ fontSize: 11, color: "#444", marginTop: 3 }}>cash contributed</div>
                      </div>
                      <div style={{ background: "#0d0d0d", borderRadius: 10, padding: "14px" }}>
                        <div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>Market Gains</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: isGain ? "#00e676" : "#ff4444", letterSpacing: "-0.01em" }}>{isGain ? "+" : ""}{fmtFull(gained)}</div>
                        <div style={{ fontSize: 11, color: "#444", marginTop: 3 }}>price appreciation</div>
                      </div>
                    </div>

                    {/* Stacked bar */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", background: "#1a1a1a", marginBottom: 8 }}>
                        <div style={{ width: `${Math.min(depPct, 100)}%`, background: "#3a6fd8", transition: "width 0.5s" }} />
                        {isGain && <div style={{ width: `${Math.min(gainPct, 100 - depPct)}%`, background: "#00e676", transition: "width 0.5s" }} />}
                      </div>
                      <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 9, height: 9, borderRadius: 2, background: "#3a6fd8" }} />
                          <span style={{ fontSize: 12, color: "#666" }}>Deposits {depPct.toFixed(0)}%</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 9, height: 9, borderRadius: 2, background: "#00e676" }} />
                          <span style={{ fontSize: 12, color: "#666" }}>Gains {gainPct.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, paddingTop: 12, borderTop: "1px solid #1a1a1a" }}>
                      {[
                        { label: "Multiplier", value: `${multiplier.toFixed(2)}×`, color: multiplier >= 1 ? "#00e676" : "#ff4444" },
                        { label: "Total Return", value: deposited > 0 ? `${isGain ? "+" : ""}${((gained / deposited) * 100).toFixed(0)}%` : "—", color: isGain ? "#00e676" : "#ff4444" },
                        { label: "Avg per Member", value: fmt(total / MEMBERS.length), color: "#fff" },
                      ].map((s, i, arr) => (
                        <div key={s.label} style={{ textAlign: "center", borderRight: i < arr.length - 1 ? "1px solid #1a1a1a" : "none" }}>
                          <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>{s.label}</div>
                          <div style={{ fontSize: 17, fontWeight: 700, color: s.color }}>{s.value}</div>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              );
            })()}

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 10 }}>Balance History</div>
              <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, padding: "12px 8px 8px" }}>
                <ResponsiveContainer width="100%" height={130}>
                  <AreaChart data={snapshotsToChart(snapshots, "ALL", s => s.totalUSD) || generateChartData(totalUSD, "ALL")}>
                    <defs>
                      <linearGradient id="iGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f7931a" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#f7931a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis hide /><YAxis hide />
                    <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [fmt(v), ""]} labelFormatter={() => ""} />
                    <Area type="monotone" dataKey="v" stroke="#f7931a" strokeWidth={2.5} fill="url(#iGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {(() => {
              // Build quarterly return data from real snapshots
              const byQuarter = {};
              snapshots.forEach(s => {
                const d = new Date(s.date + "T12:00:00");
                const q = `Q${Math.ceil((d.getMonth() + 1) / 3)}'${String(d.getFullYear()).slice(2)}`;
                if (!byQuarter[q]) byQuarter[q] = { first: s.totalUSD, last: s.totalUSD, order: d.getTime() };
                byQuarter[q].last = s.totalUSD;
              });
              const quarterlyPerf = Object.entries(byQuarter)
                .sort(([,a],[,b]) => a.order - b.order)
                .slice(-4)
                .map(([q, { first, last }]) => ({
                  q, portfolio: first > 0 ? parseFloat(((last - first) / first * 100).toFixed(1)) : 0
                }));
              const chartData = quarterlyPerf.length >= 2 ? quarterlyPerf : perfData;
              const isReal = quarterlyPerf.length >= 2;
              return (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 10 }}>
                    Portfolio Performance{!isReal && <span style={{ fontSize: 11, color: "#444", marginLeft: 8 }}>(sample — builds from snapshots)</span>}
                  </div>
                  <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, padding: "14px 10px 10px" }}>
                    <ResponsiveContainer width="100%" height={120}>
                      <BarChart data={chartData} barGap={2} barCategoryGap={10}>
                        <XAxis dataKey="q" tick={{ fontSize: 12, fill: "#555" }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v >= 0 ? "+" : ""}${v}%`, "Return"]} />
                        <Bar dataKey="portfolio" radius={2}>
                          {chartData.map((entry, i) => (
                            <Cell key={i} fill={(entry.portfolio ?? 0) >= 0 ? "#00e676" : "#ff4444"} />
                          ))}
                        </Bar>
                        {!isReal && <Bar dataKey="btc" fill="#f7931a" radius={2} />}
                      </BarChart>
                    </ResponsiveContainer>
                    {!isReal && (
                      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8 }}>
                        {[["Portfolio", "#00e676"], ["BTC", "#f7931a"]].map(([l, c]) => (
                          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                            <span style={{ fontSize: 12, fontWeight: 500, color: "#777" }}>{l}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {(() => {
              const COIN_COLOR_G = {BTC:"#f7931a",ETH:"#627eea",ADA:"#4da6ff",LTC:"#b8b8b8",SOL:"#9945ff",DOT:"#e6007a",XRP:"#00aad4",ALGO:"#00b4d8",CRV:"#d84627",XLM:"#14b8d4",ZEC:"#f4b728",BAT:"#ff5000",EOS:"#6e5da8",XMR:"#ff6600",LINK:"#2a5ada"};
              // Realized proceeds per coin from sell transactions
              const realizedByCoin = {};
              TRANSACTIONS.filter(t => t.type === "sell" && t.usdTotal > 0).forEach(t => {
                realizedByCoin[t.coin] = (realizedByCoin[t.coin] || 0) + t.usdTotal;
              });
              // Unrealized current value per coin across all members
              const unrealizedByCoin = {};
              MEMBERS.forEach(m => {
                Object.entries(m.holdings || {}).forEach(([coin, qty]) => {
                  const val = qty * (COIN_PRICES[coin] || 0);
                  unrealizedByCoin[coin] = (unrealizedByCoin[coin] || 0) + val;
                });
              });
              const gainCoins = [
                ...new Set([...Object.keys(realizedByCoin), ...Object.keys(unrealizedByCoin)])
              ].map(coin => ({
                coin,
                realized: realizedByCoin[coin] || 0,
                unrealized: unrealizedByCoin[coin] || 0,
              })).filter(r => r.realized + r.unrealized > 50)
                .sort((a, b) => (b.realized + b.unrealized) - (a.realized + a.unrealized))
                .slice(0, 8);
              return (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 10 }}>Gains Reporting</div>
                  <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "10px 14px", borderBottom: "1px solid #1e1e1e" }}>
                      {["Coin", "Realized (proceeds)", "Unrealized"].map(h => <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>)}
                    </div>
                    {gainCoins.map((row, i, arr) => (
                      <div key={row.coin} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 14px", borderBottom: i < arr.length-1 ? "1px solid #1a1a1a" : "none", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: COIN_COLOR_G[row.coin] || "#888", flexShrink: 0 }} />
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{row.coin}</span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: row.realized > 0 ? "#6fa8ff" : "#444" }}>
                          {row.realized > 0 ? fmtFull(row.realized) : "—"}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: row.unrealized > 0 ? "#00e676" : "#444" }}>
                          {row.unrealized > 0 ? fmtFull(row.unrealized) : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* PIE 1 — Coin diversity */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 10 }}>Coin Diversity</div>
              {(() => {
                const totals = {};
                MEMBERS.forEach(m => {
                  Object.entries(m.holdings || {}).forEach(([coin, qty]) => {
                    const val = qty * (COIN_PRICES[coin] || 0);
                    totals[coin] = (totals[coin] || 0) + val;
                  });
                });
                const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);
                const COIN_COLOR = {BTC:"#f7931a",ETH:"#627eea",ADA:"#4da6ff",LTC:"#b8b8b8",SOL:"#9945ff",DOT:"#e6007a",XRP:"#00aad4",ALGO:"#00b4d8",CRV:"#d84627",XLM:"#14b8d4",BCH:"#8dc351",BAT:"#ff5000",ZEC:"#f4b728",EOS:"#6e5da8",DGB:"#006ad2",ETC:"#328332",IQ:"#e91e8c",TRX:"#ef0027",XMR:"#ff6600",LINK:"#2a5ada",SUPER:"#7b3fe4",ICP:"#3b00b9",THETA:"#2ab8e6",FIL:"#0090ff",TFUEL:"#f7941d",BTG:"#eba809",USDT:"#26a17b",TMT:"#4a90d9",ENS:"#5284ff",ZIL:"#29ccc4",QTUM:"#2e9ad0",UTK:"#4a4af4",VET:"#15bdff",AMPL:"#cc3e00",NEO:"#58bf00",SGB:"#e4348b",SHIB:"#ffa409",ZRX:"#302c2c",MANA:"#ff2d55",GALA:"#1a1a2e",DENT:"#aaaaaa",OMG:"#1a53f0",REEF:"#5f34d6",XNO:"#4a90e2",XTZ:"#2c7df7",FET:"#1a1a3e",TRUMP:"#e4b400",SAND:"#04adef",ICX:"#1fc5c9",FLR:"#e4179c",LCC:"#45b26b",XRD:"#052cc0",STX:"#5546ff",GZIL:"#29ccc4",HERO:"#00c9ff",GAS:"#58bf00",HEX:"#ff00ff",KCS:"#0093dd",WAN:"#136aad",TKY:"#1abc9c",NCASH:"#00b4ff",TDROP:"#222222",SXP:"#ff3366",BAX:"#ff69b4",AST:"#0b70ff",ETHW:"#627eea",NEX:"#58bf00",FTT:"#02a4d3",MELANIA:"#c0c0c0",FLM:"#ff69b4",RDD:"#c6222a",BIX:"#2d5de6",KDA:"#ed098f",BLOK:"#8c52ff",USDC:"#2775ca",PLR:"#45b26b",CORZ:"#aaaaaa",GFOF:"#eba809"};
                const sorted = Object.entries(totals).sort(([,a],[,b]) => b - a);
                const top = sorted.slice(0, 6);
                const otherVal = sorted.slice(6).reduce((s,[,v]) => s + v, 0);
                const pieData = [
                  ...top.map(([coin, val]) => ({ name: coin, value: parseFloat((val / grandTotal * 100).toFixed(1)), color: COIN_COLOR[coin] || "#888", usd: val })),
                  ...(otherVal > 0 ? [{ name: "Other", value: parseFloat((otherVal / grandTotal * 100).toFixed(1)), color: "#444", usd: otherVal }] : [])
                ];
                return (
                  <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 16, padding: "16px", overflow: "hidden" }}>
                    <ResponsiveContainer width="100%" height={210}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={90} paddingAngle={2} dataKey="value" strokeWidth={0}>
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, name, props) => [`${v}% · ${fmtFull(props.payload.usd)}`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px" }}>
                      {pieData.map(d => (
                        <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#bbb" }}>{d.name}</span>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{d.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {(() => {
              const totalFees = TRANSACTIONS.reduce((s, t) => s + (t.fee || 0), 0);
              let maxDrawdown = null, currentDrawdown = null;
              if (snapshots.length >= 2) {
                let peak = snapshots[0].totalUSD;
                let maxDraw = 0;
                for (const s of snapshots) {
                  if (s.totalUSD > peak) peak = s.totalUSD;
                  const draw = peak > 0 ? (s.totalUSD - peak) / peak * 100 : 0;
                  if (draw < maxDraw) maxDraw = draw;
                }
                maxDrawdown = maxDraw;
                const lastVal = snapshots[snapshots.length - 1].totalUSD;
                currentDrawdown = peak > 0 ? (lastVal - peak) / peak * 100 : 0;
              }
              const metrics = [
                { lbl: "Max Drawdown", val: maxDrawdown !== null ? `${maxDrawdown.toFixed(1)}%` : "—", sub: maxDrawdown !== null ? "Peak to trough" : "Builds from daily data", color: maxDrawdown !== null && maxDrawdown < 0 ? "#ff4444" : "#aaa" },
                { lbl: "Current Drawdown", val: currentDrawdown !== null ? `${currentDrawdown.toFixed(1)}%` : "—", sub: currentDrawdown !== null ? "From all-time high" : "Builds from daily data", color: currentDrawdown !== null && currentDrawdown < -0.5 ? "#ff4444" : "#00e676" },
                { lbl: "Total Fees", val: totalFees > 0 ? fmtFull(totalFees) : "$0", sub: "All exchanges", color: null },
                { lbl: "Total Trades", val: `${TRANSACTIONS.length}`, sub: "All portfolios", color: null },
              ];
              return (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 10 }}>Risk Metrics</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {metrics.map(s => (
                      <div key={s.lbl} style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, padding: "12px 14px" }}>
                        <div style={{ fontSize: 12, fontWeight: 400, color: "#777", marginBottom: 6 }}>{s.lbl}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: s.color || "#fff", letterSpacing: "-0.01em" }}>{s.val}</div>
                        <div style={{ fontSize: 12, color: "#555", marginTop: 3 }}>{s.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {(() => {
              const EXCH_COLOR = { Coinbase:"#0052ff", iTrust:"#f7931a", Kraken:"#5741d9", Gemini:"#00dcfa", Binance:"#f0b90b", Transfer:"#888888", DGA:"#22c55e", Uphold:"#56aeff", Other:"#555" };
              const exchVol = {};
              TRANSACTIONS.forEach(t => {
                if ((t.usdTotal || 0) > 0) exchVol[t.exchange] = (exchVol[t.exchange] || 0) + t.usdTotal;
              });
              const exchTotal = Object.values(exchVol).reduce((s, v) => s + v, 0);
              const exchPie = Object.entries(exchVol)
                .sort(([,a],[,b]) => b - a).slice(0, 6)
                .map(([name, vol]) => ({ name, value: parseFloat((vol / exchTotal * 100).toFixed(1)), color: EXCH_COLOR[name] || "#666", usd: vol }));
              return (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 10 }}>Exchanges Used</div>
                  <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, padding: "12px 10px 10px" }}>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={exchPie} innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value" strokeWidth={0}>
                          {exchPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, name, props) => [`${v}% · ${fmtFull(props.payload.usd)}`, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                      {exchPie.map(d => (
                        <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                          <span style={{ fontSize: 12, fontWeight: 500, color: "#777" }}>{d.name} {d.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAX REPORTING */}
        {page === "tax" && <TaxPage fmtFull={fmtFull} TRANSACTIONS={TRANSACTIONS} MEMBERS={MEMBERS} COIN_PRICES={COIN_PRICES} anthropicKey={anthropicKey} />}

        {/* TRANSACTIONS */}
        {page === "transactions" && (
          <div className="fade-in" style={{ padding: "18px 18px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <div className="lbl" style={{ marginBottom: 5 }}>Total Transactions</div>
                <div className="bignum" style={{ fontSize: 32 }}>{TRANSACTIONS.length}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "#aaa", cursor: "pointer" }}
                  onClick={() => exportCSV(filteredTxs, `transactions_${txFilter === "all" ? "all" : txFilter}_${today}.csv`)}>
                  ↓ CSV
                </button>
                <button
                  style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "#aaa", cursor: "pointer" }}
                  onClick={() => setImportOpen(true)}>
                  ↑ Import
                </button>
                <button
                  style={{ background: "#00e676", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 700, color: "#000", cursor: "pointer" }}
                  onClick={() => setAddTxOpen(true)}>
                  + Add
                </button>
              </div>
            </div>

            <div className="nobar" style={{ display: "flex", gap: 5, overflowX: "auto", marginBottom: 16, paddingBottom: 4 }}>
              <button className={`pill ${txFilter === "all" ? "active" : ""}`} onClick={() => setTxFilter("all")}>ALL</button>
              {MEMBERS.map(m => (
                <button key={m.id} className={`pill ${txFilter === m.id ? "active" : ""}`} onClick={() => setTxFilter(m.id)} style={{ whiteSpace: "nowrap" }}>{m.name.toUpperCase()}</button>
              ))}
            </div>

            <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
              {filteredTxs.map((tx, idx) => renderTxRow(tx, idx, filteredTxs))}
            </div>
          </div>
        )}

        {/* APP SETTINGS PAGE */}
        {page === "app-settings" && (
          <div className="fade-in" style={{ padding: "18px 18px 0" }}>
            <button className="btn-ghost" style={{ marginBottom: 16 }} onClick={() => setPage("home")}>← Home</button>
            <div style={{ marginBottom: 20 }}>
              <div className="lbl" style={{ marginBottom: 4 }}>Configuration</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>App Settings</div>
            </div>
            <div style={{ background: "#0d0d14", border: "1px solid #2a2a4a", borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#7b6ef6", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Anthropic API Key</div>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 10, lineHeight: 1.5 }}>Used for AI tax analysis in the Tax Reporting page. Saved to browser localStorage — never sent anywhere except directly to Anthropic's API.</div>
              <input
                type="password"
                value={anthropicKey}
                onChange={e => { setAnthropicKey(e.target.value); localStorage.setItem("anthropic_key", e.target.value); }}
                placeholder="sk-ant-api03-..."
                style={{ width: "100%", background: "#111", border: "1px solid #2a2a4a", borderRadius: 8, color: "#ccc", fontSize: 12, padding: "10px 12px", boxSizing: "border-box", outline: "none", fontFamily: "monospace" }}
              />
              {anthropicKey
                ? <div style={{ fontSize: 11, color: "#00e676", marginTop: 6 }}>✓ Key saved — {anthropicKey.slice(0, 14)}...</div>
                : <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>No key set. Get one at console.anthropic.com</div>}
              {anthropicKey && (
                <button onClick={() => { setAnthropicKey(""); localStorage.removeItem("anthropic_key"); }}
                  style={{ marginTop: 10, background: "none", border: "1px solid #333", borderRadius: 7, color: "#555", fontSize: 11, padding: "5px 12px", cursor: "pointer" }}>
                  Clear Key
                </button>
              )}
            </div>
            <div style={{ background: "#0d1414", border: "1px solid #1a3a2a", borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#00e676", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>CoinMarketCap API Key</div>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 10, lineHeight: 1.5 }}>Used for live price data. Synced across all devices via Firestore — never sent anywhere except directly to CoinMarketCap's API.</div>
              <input
                type="text"
                value={cmcKey}
                onChange={e => { const k = e.target.value; setCmcKey(k); localStorage.setItem("cmc_key", k); }}
                placeholder="Enter CoinMarketCap API key..."
                style={{ width: "100%", background: "#111", border: "1px solid #1a3a2a", borderRadius: 8, color: "#ccc", fontSize: 12, padding: "10px 12px", boxSizing: "border-box", outline: "none", fontFamily: "monospace" }}
              />
              {cmcKey
                ? <div style={{ fontSize: 11, color: priceStatus === "live" ? "#00e676" : priceStatus === "error" ? "#ff4444" : "#f7931a", marginTop: 6 }}>
                    {priceStatus === "live" ? `✓ Live prices active` : priceStatus === "loading" ? "⟳ Fetching prices..." : priceStatus === "error" ? "✗ API error — check key" : `Key entered — save to sync`}
                  </div>
                : <div style={{ fontSize: 11, color: "#555", marginTop: 6 }}>No key set. Get one at coinmarketcap.com/api</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                <button
                  disabled={!cmcKey || cmcSyncStatus === "saving"}
                  onClick={() => {
                    setCmcSyncStatus("saving");
                    fsSet("settings", "app", { cmcKey })
                      .then(() => { setCmcSyncStatus("saved"); setTimeout(() => setCmcSyncStatus(""), 3000); })
                      .catch(err => { console.warn("Sync failed:", err.message); setCmcSyncStatus("error:" + err.message); });
                  }}
                  style={{ background: cmcSyncStatus.startsWith("saved") ? "#00c853" : cmcSyncStatus.startsWith("error") ? "#ff4444" : "#00e676", border: "none", borderRadius: 7, color: "#000", fontSize: 11, fontWeight: 700, padding: "6px 14px", cursor: cmcKey ? "pointer" : "not-allowed", opacity: cmcKey ? 1 : 0.4 }}>
                  {cmcSyncStatus === "saving" ? "Saving..." : cmcSyncStatus.startsWith("saved") ? "Saved ✓" : cmcSyncStatus.startsWith("error") ? "Error ✗" : "Save & Sync"}
                </button>
                {cmcKey && (
                  <button onClick={() => { setCmcKey(""); localStorage.removeItem("cmc_key"); setCmcSyncStatus(""); fsSet("settings", "app", { cmcKey: "" }).catch(console.warn); }}
                    style={{ background: "none", border: "1px solid #333", borderRadius: 7, color: "#555", fontSize: 11, padding: "6px 14px", cursor: "pointer" }}>
                    Clear
                  </button>
                )}
                {cmcSyncStatus.startsWith("error") && <span style={{ fontSize: 11, color: "#ff4444" }}>{cmcSyncStatus.slice(6) || "Write failed"}</span>}
              </div>
            </div>
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #161616" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase" }}>Firebase Connection</div>
              </div>
	              {[["Project","portfolio-f86b9"],["Auth Domain","portfolio-f86b9.firebaseapp.com"],["Database","Firestore"],["Status",firestoreStatusText]].map(([k,v],i,a)=>(
	                <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 16px", borderBottom:i<a.length-1?"1px solid #0e0e0e":"none" }}>
	                  <span style={{ fontSize:12, color:"#666" }}>{k}</span>
	                  <span style={{ fontSize:12, fontWeight:600, color:k==="Status" ? (firestoreReady ? "#00e676" : "#f7931a") : "#aaa" }}>{v}</span>
	                </div>
	              ))}
	              {!FS_BASE && (
	                <div style={{ padding: "12px 16px", borderTop: "1px solid #0e0e0e", fontSize: 11, color: "#777", lineHeight: 1.5 }}>
	                  {firestoreDisabledMessage}
	                </div>
	              )}
	            </div>
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #161616" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase" }}>Display</div>
              </div>
              {[["Theme","Dark"],["Currency","USD"],["BTC Goal","5.0 BTC"],["Price Source", priceStatus === "live" ? "CoinMarketCap Live" : "Static Fallback"]].map(([k,v],i,a)=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"11px 16px", borderBottom:i<a.length-1?"1px solid #0e0e0e":"none" }}>
                  <span style={{ fontSize:12, color:"#666" }}>{k}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:"#aaa" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: "12px 14px", marginBottom: 80 }}>
              <div style={{ fontSize: 11, color: "#444", lineHeight: 1.5 }}>API keys are stored in browser localStorage only. Clear browser data to remove them. Never share your keys.</div>
            </div>
          </div>
        )}

        {/* ABOUT PAGE */}
        {page === "about" && (
          <div className="fade-in" style={{ padding: "18px 18px 0" }}>
            <div style={{ textAlign: "center", padding: "24px 0 28px" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, #0f1f0f, #1a3a1a)", border: "1px solid #1a3a1a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <span style={{ fontSize: 28 }}>₿</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", marginBottom: 4 }}>Medina Portfolio</div>
              <div style={{ fontSize: 12, color: "#555" }}>Family Bitcoin & Crypto Tracker</div>
              <div style={{ display: "inline-block", marginTop: 10, fontSize: 10, fontWeight: 700, color: "#00e676", background: "#00e67618", border: "1px solid #00e67633", borderRadius: 6, padding: "3px 10px", letterSpacing: "0.06em" }}>v1.0.0 · March 2026</div>
            </div>
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #161616" }}><div style={{ fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase" }}>Project</div></div>
              {[["Built by","Jorge Medina"],["Stack","React + Vite + Firebase"],["Charts","Recharts"],["AI","Claude Sonnet (Anthropic)"],["Deployed","Vercel"],["Repository","github.com/Thecityismine/portfolio"]].map(([k,v],i,a)=>(
                <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 16px", borderBottom:i<a.length-1?"1px solid #0e0e0e":"none" }}>
                  <span style={{ fontSize:12, color:"#666" }}>{k}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:"#aaa", maxWidth:"60%", textAlign:"right" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #161616" }}><div style={{ fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase" }}>Features</div></div>
              {["9-member family portfolio tracking","Bitcoin + 17 altcoins","FIFO tax engine (2024–2026+)","AI tax analysis via Claude API","1,059+ transaction history","Portfolio growth charts & benchmarks","Leaderboard & family BTC goal","Insights & concentration risk analysis"].map((f,i,a)=>(
                <div key={f} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", borderBottom:i<a.length-1?"1px solid #0e0e0e":"none" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:"#00e676", flexShrink:0 }}/>
                  <span style={{ fontSize:12, color:"#777" }}>{f}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #161616" }}><div style={{ fontSize: 10, fontWeight: 700, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase" }}>Infrastructure</div></div>
              {[["Firebase App ID","1:1087299953991:web:92da00d9a40ae1746a1862"],["Firebase Project","portfolio-f86b9"],["Measurement ID","G-156HX042RE"]].map(([k,v],i,a)=>(
                <div key={k} style={{ padding:"11px 16px", borderBottom:i<a.length-1?"1px solid #0e0e0e":"none" }}>
                  <div style={{ fontSize:10, color:"#444", marginBottom:3 }}>{k}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:"#666", fontFamily:"monospace", wordBreak:"break-all" }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 12, padding: "12px 14px", marginBottom: 80 }}>
              <div style={{ fontSize: 11, color: "#444", lineHeight: 1.5 }}>For personal portfolio tracking and tax planning only. Not financial or legal advice. Consult a qualified professional.</div>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <div className="bottom-nav-bar" style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#0a0a0a", borderTop: "1px solid #1a1a1a",
        display: "flex", justifyContent: "space-around", alignItems: "center",
        padding: "10px 0 24px", zIndex: 50
      }}>
        {[
          {
            id: "home",
            label: "Home",
            svg: (active) => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#00e676" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
                <path d="M9 21V12h6v9"/>
              </svg>
            )
          },
          {
            id: "portfolios",
            label: "Portfolios",
            svg: (active) => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#00e676" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="9" height="14" rx="1.5"/>
                <rect x="13" y="3" width="9" height="18" rx="1.5"/>
              </svg>
            )
          },
          {
            id: "transactions",
            label: "Trades",
            svg: (active) => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#00e676" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7h16M4 7l4-4M4 7l4 4"/>
                <path d="M20 17H4M20 17l-4 4M20 17l-4-4"/>
              </svg>
            )
          },
          {
            id: "insights",
            label: "Insights",
            svg: (active) => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#00e676" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            )
          },
          {
            id: "tax",
            label: "Tax",
            svg: (active) => (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#00e676" : "#555"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
            )
          },
        ].map(nav => {
          const active = page === nav.id || (nav.id === "portfolios" && page === "portfolio");
          return (
            <button key={nav.id}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 56 }}
              onClick={() => {
                setPage(nav.id);
                if (nav.id !== "portfolio" && nav.id !== "portfolios") {
                  setSelectedMember(null);
                  setSelectedCoin(null);
                }
              }}>
              {nav.svg(active)}
              <span style={{ fontSize: 10, fontWeight: 500, color: active ? "#00e676" : "#555" }}>{nav.label}</span>
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}
