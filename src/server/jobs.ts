if (process.env.NODE_ENV === 'development') {
  setInterval(async () => {
    try {
      await fetch('http://localhost:3000/api/jobs/reap-holds', { method: 'POST' })
      console.log('[jobs] reaper tick')
    } catch (e) {
      console.warn('[jobs] reaper error', e)
    }
  }, 60_000)
}


