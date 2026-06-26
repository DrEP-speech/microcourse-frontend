// src/services/lessonApi.ts
export async function attachLessonAsset(lessonId: string, url: string) {
  const res = await fetch(`/api/lessons/${lessonId}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'video', url }),
  })
  if (!res.ok) throw new Error(await res.text())
}
