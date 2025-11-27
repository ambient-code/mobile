import AsyncStorage from '@react-native-async-storage/async-storage'
import { CACHE_TTL } from '@/utils/constants'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export class CacheService {
  private static PREFIX = 'cache_'

  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(this.PREFIX + key)
      if (!cached) return null

      const entry: CacheEntry<T> = JSON.parse(cached)
      const now = Date.now()

      // Check if cache is still valid
      if (now - entry.timestamp > entry.ttl) {
        await this.remove(key)
        return null
      }

      return entry.data
    } catch (error) {
      console.error(`Cache get error for ${key}:`, error)
      return null
    }
  }

  static async set<T>(key: string, data: T, ttl: number = CACHE_TTL.DEFAULT): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      }
      await AsyncStorage.setItem(this.PREFIX + key, JSON.stringify(entry))
    } catch (error) {
      console.error(`Cache set error for ${key}:`, error)
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.PREFIX + key)
    } catch (error) {
      console.error(`Cache remove error for ${key}:`, error)
    }
  }

  static async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const cacheKeys = keys.filter((key) => key.startsWith(this.PREFIX))
      await AsyncStorage.multiRemove(cacheKeys)
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }

  static async isStale(key: string): Promise<boolean> {
    const data = await this.get(key)
    return data === null
  }
}
