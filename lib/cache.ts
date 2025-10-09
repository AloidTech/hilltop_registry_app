// lib/cache.ts
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheItem<unknown>>();

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }
  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired items
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const serverCache = new InMemoryCache();

// Cache keys
export const CACHE_KEYS = {
  ALL_MEMBERS: "all_members",
  SERVICE_PLANS: "service_plans",
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  MEMBERS: 180, // 3 minutes
  SERVICE_PLANS: 120, // 2 minutes
} as const;
