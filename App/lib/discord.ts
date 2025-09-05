import fetch from "node-fetch";

export type DiscordEmbed = {
  title?: string;
  description?: string;
  url?: string;
  timestamp?: string; // ISO string
  color?: number; // Decimal color (e.g., 0xff0000)
  footer?: { text: string; icon_url?: string };
  image?: { url: string };
  thumbnail?: { url: string };
  author?: { name: string; url?: string; icon_url?: string };
  fields?: { name: string; value: string; inline?: boolean }[];
};

export type DiscordWebhookOptions = {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
};

export async function sendDiscordWebhook(
  webhookUrl: string,
  options: DiscordWebhookOptions
) {
  if (!webhookUrl) throw new Error("Discord webhook URL is required");

  const body = {
    content: options.content || undefined,
    username: options.username || undefined,
    avatar_url: options.avatar_url || undefined,
    embeds: options.embeds && options.embeds.length > 0 ? options.embeds : undefined,
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to send webhook: ${res.status} ${text}`);
  }

  return true;
}