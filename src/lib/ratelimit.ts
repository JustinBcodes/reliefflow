import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')

export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000)
  const bucket = `rl:${key}:${Math.floor(now / windowSec)}`
  const count = await redis.incr(bucket)
  if (count === 1) await redis.expire(bucket, windowSec)
  return count <= limit
}


