/**
 * Live Voice Chat API for Cloop AI Tutor
 */

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://api.cloopapp.com').trim().replace(/\/$/, '')
const API_BASE_URL = RAW_BASE.endsWith('/api') ? RAW_BASE : `${RAW_BASE}/api`

export interface VoiceSessionData {
  id: number
  user_id: number
  track_key: string
  chapter_key: string
  session_mode: string
  status: string
}

export async function createLiveVoiceSession(): Promise<VoiceSessionData> {
  const token = localStorage.getItem('cloop_token') || ''
  const res = await fetch(`${API_BASE_URL}/voice-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      trackKey: 'cloop_tutor',
      chapterKey: 'general_learning',
      mode: 'cloop_ai',
    }),
  })

  if (!res.ok) {
    // If voice-sessions returns 404 or auth issue, generate fallback temporary session id
    const errData = await res.json().catch(() => ({}))
    console.warn('[VoiceChat] Session creation fallback:', errData)
    return {
      id: Date.now(),
      user_id: 1,
      track_key: 'cloop_tutor',
      chapter_key: 'general_learning',
      session_mode: 'cloop_ai',
      status: 'ACTIVE',
    }
  }

  const data = await res.json()
  return data.session
}
