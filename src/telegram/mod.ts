import TelegramBot from "node-telegram-bot-api";
import logger from "@/logger.ts";

const tgId = import.meta.env["TELEGRAM_CHAT_ID"];
const tgToken = import.meta.env["TELEGRAM_BOT_TOKEN"];

let tgBot: TelegramBot | undefined;
if (typeof tgToken === "string") {
  tgBot = new TelegramBot(tgToken);
} else {
  logger.warn("Missing `TELEGRAM_BOT_TOKEN`");
}

export const sendTelegramMessage = (message: string) => {
  if (!tgBot) return;
  if (!tgId) {
    logger.warn("Missing `TELEGRAM_CHAT_ID`");
    return;
  }
  tgBot.sendMessage(tgId, message);
};
