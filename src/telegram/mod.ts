import logger from "@/logger.ts";
import { create, sendMessage, type TelegramClient } from "./lib";

const chatId = import.meta.env["TELEGRAM_CHAT_ID"];
const token = import.meta.env["TELEGRAM_BOT_TOKEN"];

const client: TelegramClient | null = token ? create(token) : null;
if (!client) {
  logger.warn("Missing `TELEGRAM_BOT_TOKEN`");
}

export async function sendTelegramMessage(message: string) {
  if (!client) return;
  if (!chatId || chatId.length === 0) {
    logger.warn("Missing `TELEGRAM_CHAT_ID`");
    return;
  }
  await sendMessage(client, chatId, message);
}
