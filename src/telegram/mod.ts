import { TelegramBot } from "telegram/mod.ts";
import * as logger from "deno/log/mod.ts";

const tgId = Deno.env.get("TELEGRAM_CHAT_ID");
const tgToken = Deno.env.get("TELEGRAM_BOT_TOKEN");

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
  tgBot.sendMessage({
    chat_id: tgId,
    text: message,
  });
};
