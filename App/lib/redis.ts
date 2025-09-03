import { createClient } from "redis";

const client = createClient({ url: process.env.REDIS_URL });

client.connect().catch(console.error);

export async function getCached<T>(key: string, fetcher: () => Promise<T>, ttl = 600): Promise<T> {
  const cached = await client.get(key);
  if (cached) return JSON.parse(cached);

  const result = await fetcher();
  await client.setEx(key, ttl, JSON.stringify(result));
  return result;
}