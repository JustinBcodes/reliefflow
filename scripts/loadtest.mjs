import autocannon from 'autocannon'

const url = 'http://localhost:3000'

const instance = autocannon({
  url,
  connections: 50,
  pipelining: 1,
  duration: 30,
  requests: [
    { method: 'GET', path: '/api/slots' },
  ],
})

instance.on('done', (res) => {
  console.log('p95:', res.latency.p95, 'errors:', res.errors)
})


