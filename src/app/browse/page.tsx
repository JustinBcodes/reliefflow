"use client"
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

type Slot = {
  id: string
  siteId: string
  resourceId: string
  startsAt: string
  endsAt: string
  capacity: number
  reservedCount: number
  remaining: number
}

export default function BrowsePage() {
  const [siteId, setSiteId] = useState('')
  const [resourceId, setResourceId] = useState('')
  const { data, refetch, isLoading } = useQuery<{ ok: boolean; data: Slot[] }>({
    queryKey: ['slots', siteId, resourceId],
    queryFn: async () => {
      const qs = new URLSearchParams()
      if (siteId) qs.set('siteId', siteId)
      if (resourceId) qs.set('resourceId', resourceId)
      const res = await fetch(`/api/slots?${qs.toString()}`)
      return res.json()
    },
  })
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Browse Slots</h2>
      <div className="flex gap-2 mb-4">
        <input placeholder="siteId" value={siteId} onChange={(e) => setSiteId(e.target.value)} className="border px-2 py-1" />
        <input placeholder="resourceId" value={resourceId} onChange={(e) => setResourceId(e.target.value)} className="border px-2 py-1" />
        <button className="border px-3" onClick={() => refetch()}>Search</button>
      </div>
      {isLoading ? <div>Loading...</div> : (
        <div className="grid gap-3">
          {data?.data?.map((s) => (
            <div key={s.id} className="border p-3 rounded">
              <div className="font-medium">{s.resourceId} @ {s.siteId}</div>
              <div className="text-sm">{new Date(s.startsAt).toLocaleString()} - {new Date(s.endsAt).toLocaleString()}</div>
              <div className="text-sm">Remaining: {s.remaining}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


