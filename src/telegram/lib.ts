export const BASE_API_URL = "https://api.telegram.org";

export type TelegramClient = {
  token: string;
};

export type InlineKeyboardButton = {
  text: string;
  url: string;
};

export function create(token: string): TelegramClient {
  return { token };
}

export async function sendMessage(
  client: TelegramClient,
  chatId: string,
  text: string,
  keyboard?: InlineKeyboardButton[][],
) {
  const url = new URL(`${BASE_API_URL}/bot${client.token}/sendMessage`);
  return await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "MarkdownV2",
      reply_markup: keyboard && {
        inline_keyboard: keyboard,
      },
    }),
    headers: {
      "content-type": "application/json",
    },
  }).then((res) => res.json());
}
