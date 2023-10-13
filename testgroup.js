const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fs = require("fs");

const rankScore = require("./score.json");

const reportList = require("./report.json");

let snapshotList = require("./snapshot.json");

let infoMembers = require("./members.json");

let currentLinks = [];
let nextLinks = [];
let message5link = "";
let markup5link;

// console.log(rankScore);

// replace the value below with the Telegram token you receive from @BotFather
const token = "6365967741:AAGSkAZjcF-EtMUHAZCxGuDSdlnn0j654CI";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  if (msg.text == "done all") await sleep(15000);
  console.log(msg);
});
