import Redis from 'ioredis'
import { nanoid } from 'nanoid'

const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')

export async function withLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const token = nanoid()
  const start = Date.now()
  const jitter = () => Math.floor(25 + Math.random() * 25)
  while (Date.now() - start < ttlMs) {
    const ok = await redis.set(key, token, 'PX', ttlMs, 'NX')
    if (ok) {
      try {
        return await fn()
      } finally {
        // Release if we still own it
        const releaseScript = `if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end`
        await redis.eval(releaseScript, 1, key, token)
      }
    }
    await new Promise((r) => setTimeout(r, jitter()))
  }
  throw new Error('Failed to acquire lock')
}


