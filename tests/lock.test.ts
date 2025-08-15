import { describe, it, expect } from 'vitest'
import { withLock } from '@/lib/lock'

describe('withLock', () => {
  it('enforces mutual exclusion', async () => {
    let concurrent = 0
    let max = 0
    await Promise.all(
      Array.from({ length: 10 }).map(() =>
        withLock('test:lock', 1000, async () => {
          concurrent++
          max = Math.max(max, concurrent)
          await new Promise((r) => setTimeout(r, 20))
          concurrent--
        }),
      ),
    )
    expect(max).toBe(1)
  })
})


