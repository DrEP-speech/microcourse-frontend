// src/services/videoApi.ts
export type SubmitVideoBody = {
  lessonId: string
  mode: 'slides' | 'talkingHead' | string
  script: string
  assets?: { brandColor?: string }
}

export type VideoJob = { id?: string; jobId?: string; _id?: string }
export type VideoStatus = {
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress?: number
  fileUrl?: string
  error?: string
}

const BASE = '/video-api' // proxied to http://localhost:10010

export async function submitVideoJob(body: SubmitVideoBody): Promise<string> {
  const res = await fetch(`${BASE}/api/video/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await res.text())
  const json: VideoJob = await res.json()
  const id = json.id ?? json.jobId ?? json._id
  if (!id) throw new Error('Server did not return a job id')
  return id
}

export async function getVideoStatus(id: string): Promise<VideoStatus> {
  const res = await fetch(`${BASE}/api/video/jobs/${id}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
