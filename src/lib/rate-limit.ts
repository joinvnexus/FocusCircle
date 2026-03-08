const windowMs = 60_000;
const maxRequests = 30;

type Entry = {
  count: number;
  startedAt: number;
};

const memoryStore = new Map<string, Entry>();

export function checkRateLimit(key: string) {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now - entry.startedAt > windowMs) {
    memoryStore.set(key, { count: 1, startedAt: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  memoryStore.set(key, entry);
  return { allowed: true, remaining: maxRequests - entry.count };
}
